const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'app.js');
const adminJsPath = path.join(__dirname, 'admin.js');

function cleanupFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // For app.js, we need to remove everything between OLD_PRODUCTS_BLOCK_REMOVE and where the old merge logic ended
    if (filePath.endsWith('app.js')) {
        const startMarker = 'const OLD_PRODUCTS_BLOCK_REMOVE = [];';
        const endMarker = 'console.log(`✅ Initialized ${finalProducts.length} products successfully!`);';
        
        const startIndex = content.indexOf(startMarker);
        const endIndex = content.indexOf(endMarker);
        
        if (startIndex !== -1 && endIndex !== -1) {
            const before = content.substring(0, startIndex);
            const after = content.substring(endIndex + endMarker.length);
            
            // Re-insert the proper closing of the brand normalization logic which was after line 1918
            // Let's actually just replace the whole function correctly.
            
            content = before + '\n    console.log(`✅ Initialized ${finalProducts.length} products successfully!`);\n' + after;
        }
    }
    
    // For admin.js, replace initializeProductsFromCode body
    if (filePath.endsWith('admin.js')) {
        const startMarker = 'function initializeProductsFromCode() {';
        const endMarker = 'console.log(`✅ Initialized ${products.length} products successfully!`);\n}';
        
        const startIndex = content.indexOf(startMarker);
        const endIndex = content.indexOf(endMarker);
        
        if (startIndex !== -1 && endIndex !== -1) {
            const before = content.substring(0, startIndex);
            const after = content.substring(endIndex + endMarker.length);
            
            const newFunction = `function initializeProductsFromCode() {
    const manuallyCleared = localStorage.getItem('dataManuallyCleared') === 'true';
    if (manuallyCleared) return;
    
    const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
    if (existingProducts.length > 0) return;

    const products = window.INITIAL_PRODUCTS || [];
    localStorage.setItem('products', JSON.stringify(products));
    console.log(\`✅ Initialized \${products.length} products from products-data.js successfully!\`);
}`;
            content = before + newFunction + after;
        }
    }

    fs.writeFileSync(filePath, content);
}

cleanupFile(appJsPath);
cleanupFile(adminJsPath);
console.log('✅ Cleaned up app.js and admin.js');




