const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'app.js');
const adminJsPath = path.join(__dirname, 'admin.js');

// Helper to get from a local file if needed, but since we are currently running on the server, we can read localStorage if we were in a browser. 
// Here we'll just extract from app.js and use defaults for the rest.

function extractProducts() {
    const content = fs.readFileSync(appJsPath, 'utf8');
    const startMarker = 'window.INITIAL_PRODUCTS = [';
    // Wait, I already removed the hardcoded products from app.js. 
    // Let me check products-data.js content first.
    return null; 
}

const productsDataJs = path.join(__dirname, 'products-data.js');
const currentData = fs.readFileSync(productsDataJs, 'utf8');

// If products-data.js already has window.INITIAL_PRODUCTS, we keep it and add INITIAL_STORE_DATA
const storeData = {
    storeName: "Premium Vape Shop",
    brands: [],
    flavors: [],
    sliderImages: []
};

const newContent = currentData + `\nwindow.INITIAL_STORE_DATA = ${JSON.stringify(storeData, null, 4)};\n`;
fs.writeFileSync(productsDataJs, newContent);
console.log('✅ Updated products-data.js with store settings');




