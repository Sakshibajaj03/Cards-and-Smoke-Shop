// Initial Products Data
// This file loads products from embedded data (embedded-data.js)
// All data is now hardcoded in embedded-data.js for portability

// Get products from embedded data
window.INITIAL_PRODUCTS = function() {
    if (window.EMBEDDED_STORE_DATA && window.EMBEDDED_STORE_DATA.products) {
        return window.EMBEDDED_STORE_DATA.products;
    }
    return [];
}();

// Initial store data configuration from embedded data
window.INITIAL_STORE_DATA = function() {
    if (window.EMBEDDED_STORE_DATA) {
        return {
            storeName: window.EMBEDDED_STORE_DATA.storeName || 'Premium Vape Shop',
            brands: window.EMBEDDED_STORE_DATA.brands || [],
            flavors: window.EMBEDDED_STORE_DATA.flavors || [],
            sliderImages: window.EMBEDDED_STORE_DATA.sliderImages || []
        };
    }
    return {
        storeName: 'Premium Vape Shop',
        brands: [],
        flavors: [],
        sliderImages: []
    };
}();

// Note: All data is now embedded in embedded-data.js
// This ensures the site works automatically when moved to another PC
// The embedded data is automatically loaded and initialized on page load

