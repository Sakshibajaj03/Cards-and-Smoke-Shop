const fs = require('fs');
const path = require('path');

const adminJsPath = path.join(__dirname, 'admin.js');

function cleanupAdminJs() {
    let lines = fs.readFileSync(adminJsPath, 'utf8').split('\n');
    let result = [];
    let skip = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.includes('function initializeProductsFromCode() {')) {
            result.push(`function initializeProductsFromCode() {
    const manuallyCleared = localStorage.getItem('dataManuallyCleared') === 'true';
    if (manuallyCleared) return;
    
    const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
    if (existingProducts.length > 0) return;

    const products = window.INITIAL_PRODUCTS || [];
    localStorage.setItem('products', JSON.stringify(products));
    console.log(\`✅ Initialized \${products.length} products from products-data.js successfully!\`);
}`);
            skip = true;
            continue;
        }
        
        // The products array ends around line 4225 (based on the original length)
        // We'll skip until we find the next function which is usually something like loadProductsAdmin or similar
        // Let's look for 'function handleExcelImport' which is usually further down
        if (skip && line.includes('function handleExcelImport')) {
            skip = false;
        }
        
        if (!skip) {
            result.push(line);
        }
    }
    
    fs.writeFileSync(adminJsPath, result.join('\n'));
}

cleanupAdminJs();
console.log('✅ Targeted cleanup of admin.js done');




