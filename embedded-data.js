// EMBEDDED STORE DATA - All data is hardcoded here for portability
// This file contains ALL store data including products, brands, flavors, and images
// Generated automatically - DO NOT EDIT MANUALLY unless you know what you're doing

// Store Configuration
window.EMBEDDED_STORE_DATA = {
  "version": "2025-12-19T07:19:40.161Z",
  "storeName": "Premium Vape Shop",
  "products": [],
  "brands": [],
  "flavors": [],
  "sliderImages": [],
  "featuredProducts": []
};

// Initialize function - automatically loads all data
window.initializeEmbeddedData = function() {
    const data = window.EMBEDDED_STORE_DATA;
    
    if (!data) {
        console.error('Embedded data not found!');
        return;
    }
    
    // Set store name
    if (data.storeName) {
        localStorage.setItem('storeName', data.storeName);
    }
    
    // Set products (merge with existing to preserve user changes)
    if (data.products && Array.isArray(data.products)) {
        const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
        const existingMap = new Map(existingProducts.map(p => [String(p.id), p]));
        
        // Merge: use embedded data as base, but preserve user modifications
        const mergedProducts = data.products.map(product => {
            const existing = existingMap.get(String(product.id));
            if (existing) {
                // Preserve user changes but use embedded data as base
                return {
                    ...product,
                    ...existing,
                    // Keep embedded image if user hasn't set one
                    image: existing.image || product.image,
                    // Preserve user price/stock if set
                    price: existing.price !== undefined && existing.price !== 0 ? existing.price : product.price,
                    stock: existing.stock !== undefined ? existing.stock : product.stock,
                    // Merge flavors
                    flavors: product.flavors ? product.flavors.map(f => {
                        const existingFlavor = existing.flavors?.find(ef => ef.name === f.name);
                        return existingFlavor ? { ...f, ...existingFlavor } : f;
                    }) : (existing.flavors || [])
                };
            }
            return product;
        });
        
        // Add any user-created products not in embedded data
        const embeddedIds = new Set(data.products.map(p => String(p.id)));
        existingProducts.forEach(p => {
            if (!embeddedIds.has(String(p.id))) {
                mergedProducts.push(p);
            }
        });
        
        localStorage.setItem('products', JSON.stringify(mergedProducts));
    }
    
    // Set brands
    if (data.brands && Array.isArray(data.brands)) {
        const existingBrands = JSON.parse(localStorage.getItem('brands') || '[]');
        const existingBrandNames = existingBrands.map(b => typeof b === 'object' ? b.name : b);
        const newBrands = data.brands.filter(b => {
            const brandName = typeof b === 'object' ? b.name : b;
            return !existingBrandNames.includes(brandName);
        });
        if (newBrands.length > 0) {
            const allBrands = [...existingBrands, ...newBrands];
            localStorage.setItem('brands', JSON.stringify(allBrands));
        } else if (existingBrands.length === 0) {
            localStorage.setItem('brands', JSON.stringify(data.brands));
        }
    }
    
    // Set flavors
    if (data.flavors && Array.isArray(data.flavors)) {
        const existingFlavors = JSON.parse(localStorage.getItem('flavors') || '[]');
        const newFlavors = data.flavors.filter(f => !existingFlavors.includes(f));
        if (newFlavors.length > 0) {
            localStorage.setItem('flavors', JSON.stringify([...existingFlavors, ...newFlavors]));
        } else if (existingFlavors.length === 0) {
            localStorage.setItem('flavors', JSON.stringify(data.flavors));
        }
    }
    
    // Set slider images
    if (data.sliderImages && Array.isArray(data.sliderImages) && data.sliderImages.length > 0) {
        const existingImages = JSON.parse(localStorage.getItem('sliderImages') || '[]');
        if (existingImages.length === 0 || !existingImages.some(img => img && img.trim() !== '')) {
            localStorage.setItem('sliderImages', JSON.stringify(data.sliderImages));
        }
    }
    
    // Set featured products
    if (data.featuredProducts && Array.isArray(data.featuredProducts)) {
        const existingFeatured = JSON.parse(localStorage.getItem('featuredProducts') || '[]');
        if (existingFeatured.length === 0 || !existingFeatured.some(id => id && String(id).trim() !== '')) {
            localStorage.setItem('featuredProducts', JSON.stringify(data.featuredProducts));
        }
    }
    
    console.log('✅ Embedded data initialized successfully!');
    console.log('   Products:', data.products?.length || 0);
    console.log('   Brands:', data.brands?.length || 0);
    console.log('   Flavors:', data.flavors?.length || 0);
    console.log('   Slider Images:', data.sliderImages?.length || 0);
};

// Auto-initialize on load
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initializeEmbeddedData);
    } else {
        window.initializeEmbeddedData();
    }
}
