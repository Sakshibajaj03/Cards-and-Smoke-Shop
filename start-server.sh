#!/bin/bash

echo "========================================"
echo "  Cards & Smoke Shop - Local Server"
echo "========================================"
echo ""
echo "Starting web server on port 8000..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "ERROR: Python is not installed"
        echo "Please install Python from https://www.python.org/"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

# Get IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    IP=$(hostname -I | awk '{print $1}')
else
    IP="localhost"
fi

echo "Your website will be available at:"
echo ""
echo "  http://$IP:8000"
echo ""
echo "Open this URL on your mobile device"
echo "(Make sure mobile is on same Wi-Fi network)"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

# Start the server
$PYTHON_CMD -m http.server 8000






