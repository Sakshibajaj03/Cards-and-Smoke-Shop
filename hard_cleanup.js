const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'app.js');
const adminJsPath = path.join(__dirname, 'admin.js');

function cleanupAppJs() {
    let lines = fs.readFileSync(appJsPath, 'utf8').split('\n');
    let result = [];
    let skip = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // When we hit the deleted markers, we start skipping until we find the next real function
        if (line.includes('const OLD_PRODUCTS_BLOCK_REMOVE = [];') || line.includes('function OLD_initializeProducts_DELETED()')) {
            skip = true;
            continue;
        }
        
        // The next real function after initialization is createProductCard (check around line 2177)
        if (skip && line.includes('function createProductCard(product)')) {
            skip = false;
        }
        
        if (!skip) {
            result.push(line);
        }
    }
    
    fs.writeFileSync(appJsPath, result.join('\n'));
}

cleanupAppJs();
console.log('✅ Hard cleanup of app.js done');




