const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'app.js');
const adminJsPath = path.join(__dirname, 'admin.js');

function extractProducts(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const startMarker = 'const products = [';
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) return null;
    
    let bracketCount = 1;
    let currentIndex = startIndex + startMarker.length;
    
    while (bracketCount > 0 && currentIndex < content.length) {
        if (content[currentIndex] === '[') bracketCount++;
        else if (content[currentIndex] === ']') bracketCount--;
        currentIndex++;
    }
    
    const productsArrayString = content.substring(startIndex + 'const products = '.length, currentIndex);
    return productsArrayString;
}

const productsData = extractProducts(appJsPath);
if (productsData) {
    const fileContent = `// Static Product Data\n// Generated for portability\nwindow.INITIAL_PRODUCTS = ${productsData};\n`;
    fs.writeFileSync(path.join(__dirname, 'products-data.js'), fileContent);
    console.log('✅ Created products-data.js');
} else {
    console.log('❌ Could not find products array in app.js');
}




