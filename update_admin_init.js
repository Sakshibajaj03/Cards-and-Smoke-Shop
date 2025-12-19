const fs = require('fs');
const path = require('path');

const adminJsPath = path.join(__dirname, 'admin.js');
let content = fs.readFileSync(adminJsPath, 'utf8');

const initAllDataSearch = `function initializeAllData() {
    // Initialize store name
    if (!localStorage.getItem('storeName')) {
        localStorage.setItem('storeName', 'Premium Vape Shop');
    }`;

const initAllDataReplace = `function initializeAllData() {
    const initialData = window.INITIAL_STORE_DATA || {};

    // Initialize store name
    if (!localStorage.getItem('storeName')) {
        localStorage.setItem('storeName', initialData.storeName || 'Premium Vape Shop');
    }
    
    // Initialize brands
    if (initialData.brands && !localStorage.getItem('brands')) {
        localStorage.setItem('brands', JSON.stringify(initialData.brands));
    }
    
    // Initialize flavors
    if (initialData.flavors && !localStorage.getItem('flavors')) {
        localStorage.setItem('flavors', JSON.stringify(initialData.flavors));
    }
    
    // Initialize slider images
    if (initialData.sliderImages && !localStorage.getItem('sliderImages')) {
        localStorage.setItem('sliderImages', JSON.stringify(initialData.sliderImages));
    }`;

content = content.replace(initAllDataSearch, initAllDataReplace);

fs.writeFileSync(adminJsPath, content);
console.log('✅ Updated admin.js initialization logic');




