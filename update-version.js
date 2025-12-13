/**
 * Version Updater Script
 * Run this script to update the version number
 * Usage: node update-version.js [patch|minor|major]
 * Default: patch (increments last number)
 */

const fs = require('fs');
const path = require('path');

const versionFile = path.join(__dirname, 'version.json');
const updateType = process.argv[2] || 'patch';

// Read current version
let versionData;
try {
    const content = fs.readFileSync(versionFile, 'utf8');
    versionData = JSON.parse(content);
} catch (error) {
    console.error('Error reading version.json:', error);
    process.exit(1);
}

// Parse current version
const versionParts = versionData.version.split('.').map(Number);
let [major, minor, patch] = versionParts;

// Update version based on type
switch (updateType.toLowerCase()) {
    case 'major':
        major++;
        minor = 0;
        patch = 0;
        break;
    case 'minor':
        minor++;
        patch = 0;
        break;
    case 'patch':
    default:
        patch++;
        break;
}

// Update version data
versionData.version = `${major}.${minor}.${patch}`;
versionData.buildDate = new Date().toISOString();

// Write updated version
try {
    fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2) + '\n');
    console.log(`✅ Version updated to ${versionData.version}`);
    console.log(`📅 Build date: ${versionData.buildDate}`);
    console.log('\n💡 Tip: Commit and push this change to GitHub to trigger cache refresh on mobile devices.');
} catch (error) {
    console.error('Error writing version.json:', error);
    process.exit(1);
}

