/**
 * HTML Version Updater
 * Automatically updates version query parameters in all HTML files
 * Run this after updating version.json
 * Usage: node update-html-versions.js
 */

const fs = require('fs');
const path = require('path');

// Read version from version.json
const versionFile = path.join(__dirname, 'version.json');
let versionData;
try {
    const content = fs.readFileSync(versionFile, 'utf8');
    versionData = JSON.parse(content);
} catch (error) {
    console.error('Error reading version.json:', error);
    process.exit(1);
}

const version = versionData.version;
console.log(`Updating HTML files with version: ${version}`);

// List of HTML files to update
const htmlFiles = [
    'index.html',
    'brand.html',
    'cart.html',
    'product-detail.html',
    'login.html',
    'admin.html'
];

// Pattern to match version query parameters
const versionPattern = /(\?v=)[\d.]+/g;
const newVersion = `?v=${version}`;

let updatedCount = 0;

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${file}`);
        return;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Replace all version query parameters
        content = content.replace(versionPattern, newVersion);
        
        // Also handle cache-buster.js if it exists
        if (content.includes('cache-buster.js')) {
            content = content.replace(/cache-buster\.js\?v=[\d.]+/g, `cache-buster.js${newVersion}`);
        }
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${file}`);
            updatedCount++;
        } else {
            console.log(`ℹ️  No changes needed: ${file}`);
        }
    } catch (error) {
        console.error(`❌ Error updating ${file}:`, error.message);
    }
});

console.log(`\n✨ Updated ${updatedCount} file(s) with version ${version}`);
console.log('\n💡 Next steps:');
console.log('   1. Commit and push changes to GitHub');
console.log('   2. Mobile browsers will automatically detect the new version');
console.log('   3. Users will see an update notification and the page will reload');




