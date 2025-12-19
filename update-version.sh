#!/bin/bash

echo "========================================"
echo "  Website Version Updater"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Step 1: Updating version number..."
node update-version.js
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to update version"
    exit 1
fi

echo ""
echo "Step 2: Updating HTML files with new version..."
node update-html-versions.js
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to update HTML files"
    exit 1
fi

echo ""
echo "========================================"
echo "  SUCCESS!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Review the changes"
echo "2. Commit and push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Version update'"
echo "   git push"
echo ""
echo "Mobile users will automatically get the update!"
echo ""




