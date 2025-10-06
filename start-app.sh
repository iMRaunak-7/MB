#!/bin/bash

# Kill any processes running on our ports
echo "Killing processes on ports 5000, 5001, and 3000..."
npx kill-port 5000 5001 3000

# Set environment variables for different ports
export PORT=5002  # Backend port
export REACT_APP_PORT=3001  # Frontend port

# Start the app
echo "Starting application..."
npm run dev