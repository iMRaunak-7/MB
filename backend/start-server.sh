#!/bin/bash

# Check if MongoDB is running
echo "Checking MongoDB status..."

if command -v systemctl &> /dev/null; then
  # For systems using systemd (Ubuntu, Debian, etc.)
  if systemctl is-active --quiet mongodb; then
    echo "✅ MongoDB is running (systemd service: mongodb)"
  elif systemctl is-active --quiet mongod; then
    echo "✅ MongoDB is running (systemd service: mongod)"
  else
    echo "⚠️ MongoDB is not running. Attempting to start..."
    if systemctl list-unit-files mongodb.service &> /dev/null; then
      sudo systemctl start mongodb
      echo "✅ MongoDB started"
    elif systemctl list-unit-files mongod.service &> /dev/null; then
      sudo systemctl start mongod
      echo "✅ MongoDB started"
    else
      echo "❌ Could not find MongoDB service. Is MongoDB installed?"
    fi
  fi
elif command -v brew &> /dev/null; then
  # For macOS with Homebrew
  if brew services list | grep -q "mongodb.*started"; then
    echo "✅ MongoDB is running (Homebrew service)"
  else
    echo "⚠️ MongoDB is not running. Attempting to start..."
    brew services start mongodb-community
    echo "✅ MongoDB started with Homebrew"
  fi
elif command -v docker &> /dev/null; then
  # Check for Docker container
  if docker ps | grep -q "mongo"; then
    echo "✅ MongoDB is running in Docker"
  else
    echo "⚠️ MongoDB not found in Docker. Attempting to start a MongoDB container..."
    docker run -d -p 27017:27017 --name mongodb-local mongo:latest
    echo "✅ MongoDB Docker container started"
  fi
else
  echo "❌ Could not determine how to check MongoDB status. Please start MongoDB manually."
fi

# Start the Node.js server
echo "Starting Node.js server..."
npm start