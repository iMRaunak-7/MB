#!/bin/bash

# Check MongoDB connection and provide helpful diagnostics
# This script helps troubleshoot MongoDB connection issues

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "==== MongoDB Connection Diagnostics ===="

# Check if MongoDB URI is set in the environment
if [ -f ".env" ]; then
    echo "✅ .env file found"
    if grep -q "MONGO.*URI" .env; then
        echo "✅ MongoDB URI is defined in .env"
        MONGO_URI=$(grep "MONGO.*URI" .env | cut -d= -f2)
        
        # Basic validation of URI format
        if [[ $MONGO_URI == mongodb://* || $MONGO_URI == mongodb+srv://* ]]; then
            echo "✅ MongoDB URI format looks valid"
        else
            echo -e "${RED}❌ MongoDB URI format doesn't look right${NC}"
            echo "URI should start with mongodb:// or mongodb+srv://"
        fi
    else
        echo -e "${RED}❌ MongoDB URI is not defined in .env${NC}"
        echo "Please add MONGODB_URI=your_connection_string to .env file"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Please create a .env file with MONGODB_URI=your_connection_string"
fi

# Check if MongoDB is running locally
echo -e "\n${YELLOW}Checking for local MongoDB server...${NC}"
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB is installed"
    
    # Check if MongoDB is running
    if pgrep mongod > /dev/null; then
        echo "✅ MongoDB server is running"
        
        # Check port availability
        if nc -z localhost 27017 2>/dev/null; then
            echo "✅ MongoDB port 27017 is open"
        else
            echo -e "${RED}❌ MongoDB port 27017 is not accessible${NC}"
            echo "MongoDB may be running but not listening on default port"
        fi
    else
        echo -e "${RED}❌ MongoDB server is not running${NC}"
        echo "You can start it with: sudo service mongod start"
    fi
else
    echo -e "${YELLOW}⚠️ MongoDB is not installed locally or not in PATH${NC}"
fi

# Try connecting with MongoDB CLI tool (if available)
echo -e "\n${YELLOW}Attempting test connection...${NC}"
if command -v mongosh &> /dev/null; then
    echo "Using mongosh to test connection..."
    if mongosh --eval "db.serverStatus()" --quiet | grep -q "ok"; then
        echo -e "${GREEN}✅ Successfully connected to MongoDB${NC}"
    else
        echo -e "${RED}❌ Failed to connect to MongoDB${NC}"
    fi
elif command -v mongo &> /dev/null; then
    echo "Using mongo to test connection..."
    if mongo --eval "db.serverStatus()" --quiet | grep -q "ok"; then
        echo -e "${GREEN}✅ Successfully connected to MongoDB${NC}"
    else
        echo -e "${RED}❌ Failed to connect to MongoDB${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ MongoDB client tools not found${NC}"
fi

# Check network connectivity (for remote MongoDB)
if [[ $MONGO_URI == mongodb+srv://* ]]; then
    echo -e "\n${YELLOW}Checking network connectivity for cloud MongoDB...${NC}"
    HOST=$(echo $MONGO_URI | sed -E 's|mongodb(\+srv)?://[^:]+:[^@]+@([^:/]+).*|\2|')
    
    if [[ $HOST == *.mongodb.net* ]]; then
        echo "Testing connection to MongoDB Atlas ($HOST)..."
        if ping -c 1 $HOST &> /dev/null; then
            echo "✅ Can reach MongoDB host"
        else
            echo -e "${RED}❌ Cannot reach MongoDB host${NC}"
            echo "This could be due to network issues or firewall settings"
        fi
    fi
fi

echo -e "\n${YELLOW}MongoDB connection troubleshooting complete${NC}"
echo "If you're still having issues, check:"
echo "1. Your connection string is correct (including username/password)"
echo "2. Network connectivity and firewall settings"
echo "3. MongoDB server is running and accessible"
echo "4. Database user has correct permissions"