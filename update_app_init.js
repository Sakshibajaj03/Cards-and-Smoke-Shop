const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

// Update initializeData to use window.INITIAL_STORE_DATA if available
const initDataSearch = `if (!localStorage.getItem(STORAGE_KEYS.STORE_NAME)) {
        localStorage.setItem(STORAGE_KEYS.STORE_NAME, 'Premium Store');
    }`;
const initDataReplace = `const initialData = window.INITIAL_STORE_DATA || {};
    
    if (!localStorage.getItem(STORAGE_KEYS.STORE_NAME)) {
        localStorage.setItem(STORAGE_KEYS.STORE_NAME, initialData.storeName || 'Premium Store');
    }
    if (initialData.brands && !localStorage.getItem(STORAGE_KEYS.BRANDS)) {
        localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(initialData.brands));
    }
    if (initialData.flavors && !localStorage.getItem(STORAGE_KEYS.FLAVORS)) {
        localStorage.setItem(STORAGE_KEYS.FLAVORS, JSON.stringify(initialData.flavors));
    }
    if (initialData.sliderImages && !localStorage.getItem(STORAGE_KEYS.SLIDER_IMAGES)) {
        localStorage.setItem(STORAGE_KEYS.SLIDER_IMAGES, JSON.stringify(initialData.sliderImages));
    }`;

content = content.replace(initDataSearch, initDataReplace);

fs.writeFileSync(appJsPath, content);
console.log('✅ Updated app.js initialization logic');




