// Permanent Storage System
// Saves all data and images to both files AND code for maximum portability
// This ensures everything works when folder is moved to another device

// Save all data permanently (to files and code)
async function saveAllDataPermanently() {
    try {
        console.log('💾 Starting permanent save process...');
        
        // Get all current data
        const data = window.dataManager.getDataFromLocalStorage();
        
        // 1. Save to store-data.json
        await window.dataManager.saveDataToFile(data);
        console.log('✅ Saved to store-data.json');
        
        // 2. Save slider images to slider-data.js
        await saveSliderImagesToCode(data.sliderImages);
        console.log('✅ Saved slider images to code');
        
        // 3. Save product images to embedded-images.js
        await saveProductImagesToCode(data.products);
        console.log('✅ Saved product images to code');
        
        // 4. Save products data to products-data.js
        await saveProductsDataToCode(data.products);
        console.log('✅ Saved products data to code');
        
        console.log('✅ All data saved permanently!');
        return true;
    } catch (error) {
        console.error('Error saving data permanently:', error);
        return false;
    }
}

// Save slider images to slider-data.js as embedded base64
async function saveSliderImagesToCode(sliderImages) {
    if (!sliderImages || sliderImages.length === 0) return;
    
    // Convert all slider images to base64 if they're not already
    const base64Images = [];
    for (let i = 0; i < sliderImages.length; i++) {
        const img = sliderImages[i];
        if (!img || img.trim() === '') {
            base64Images.push('');
            continue;
        }
        
        // If already base64, use it
        if (img.startsWith('data:image')) {
            base64Images.push(img);
        } else {
            // Try to load image and convert to base64
            try {
                const base64 = await imageToBase64(img);
                base64Images.push(base64);
            } catch (error) {
                console.warn(`Could not convert slider image ${i + 1} to base64:`, error);
                base64Images.push(img); // Keep original path
            }
        }
    }
    
    // Generate slider-data.js content
    const jsContent = `// Slider Images Data - Auto-generated
// This file contains embedded slider images for portability
// Last updated: ${new Date().toISOString()}

window.getSliderImages = function() {
    // Return embedded base64 images
    return ${JSON.stringify(base64Images, null, 4)};
};

// Store initial slider images data
window.SLIDER_IMAGES_DATA = window.getSliderImages();
`;
    
    // Download the file
    downloadJSFile(jsContent, 'slider-data.js');
}

// Save product images to embedded-images.js
async function saveProductImagesToCode(products) {
    if (!products || products.length === 0) return;
    
    const embeddedImages = {};
    let imageCount = 0;
    
    // Process all product images
    for (const product of products) {
        // Main product image
        if (product.image && product.image.trim() !== '') {
            const imageKey = `product_${product.id}_main`;
            if (product.image.startsWith('data:image')) {
                embeddedImages[imageKey] = product.image;
                imageCount++;
            } else {
                try {
                    const base64 = await imageToBase64(product.image);
                    embeddedImages[imageKey] = base64;
                    imageCount++;
                } catch (error) {
                    console.warn(`Could not convert product ${product.id} main image:`, error);
                }
            }
        }
        
        // Flavor images
        if (product.flavors && Array.isArray(product.flavors)) {
            product.flavors.forEach((flavor, index) => {
                if (flavor.image && flavor.image.trim() !== '') {
                    const imageKey = `product_${product.id}_flavor_${index}`;
                    if (flavor.image.startsWith('data:image')) {
                        embeddedImages[imageKey] = flavor.image;
                        imageCount++;
                    } else {
                        try {
                            const base64 = await imageToBase64(flavor.image);
                            embeddedImages[imageKey] = base64;
                            imageCount++;
                        } catch (error) {
                            console.warn(`Could not convert flavor image for product ${product.id}:`, error);
                        }
                    }
                }
            });
        }
        
        // Additional images
        if (product.additionalImages && Array.isArray(product.additionalImages)) {
            product.additionalImages.forEach((img, index) => {
                if (img && img.trim() !== '') {
                    const imageKey = `product_${product.id}_additional_${index}`;
                    if (img.startsWith('data:image')) {
                        embeddedImages[imageKey] = img;
                        imageCount++;
                    } else {
                        try {
                            const base64 = await imageToBase64(img);
                            embeddedImages[imageKey] = base64;
                            imageCount++;
                        } catch (error) {
                            console.warn(`Could not convert additional image for product ${product.id}:`, error);
                        }
                    }
                }
            });
        }
    }
    
    // Generate embedded-images.js content
    const jsContent = `// Embedded Images Data - Auto-generated
// This file contains embedded product images as base64 for portability
// Last updated: ${new Date().toISOString()}
// Total images embedded: ${imageCount}

// Embedded images storage object
window.EMBEDDED_IMAGES = ${JSON.stringify(embeddedImages, null, 2)};

// Function to get embedded image by path
window.getEmbeddedImage = function(imagePath) {
    if (!imagePath) return '';
    
    // Remove 'images/' prefix if present for lookup
    const lookupPath = imagePath.startsWith('images/') 
        ? imagePath.replace(/^images\\//, '') 
        : imagePath;
    
    // Try to find the image
    if (window.EMBEDDED_IMAGES[lookupPath]) {
        return window.EMBEDDED_IMAGES[lookupPath];
    }
    
    // Try with original path
    if (window.EMBEDDED_IMAGES[imagePath]) {
        return window.EMBEDDED_IMAGES[imagePath];
    }
    
    // Try product-specific keys
    const productId = imagePath.match(/product_(\\w+)/);
    if (productId) {
        const key = Object.keys(window.EMBEDDED_IMAGES).find(k => k.includes(productId[1]));
        if (key) return window.EMBEDDED_IMAGES[key];
    }
    
    return '';
};
`;
    
    // Download the file
    downloadJSFile(jsContent, 'embedded-images.js');
}

// Save products data to products-data.js
async function saveProductsDataToCode(products) {
    // Generate products-data.js content
    const jsContent = `// Initial Products Data - Auto-generated
// This file contains product data for portability
// Last updated: ${new Date().toISOString()}
// Total products: ${products.length}

// Initial products array
window.INITIAL_PRODUCTS = ${JSON.stringify(products, null, 2)};

// Initial store data configuration
window.INITIAL_STORE_DATA = {
    storeName: localStorage.getItem('storeName') || 'Premium Vape Shop',
    brands: JSON.parse(localStorage.getItem('brands') || '[]'),
    flavors: JSON.parse(localStorage.getItem('flavors') || '[]'),
    sliderImages: JSON.parse(localStorage.getItem('sliderImages') || '[]')
};
`;
    
    // Download the file
    downloadJSFile(jsContent, 'products-data.js');
}

// Convert image URL/path to base64
function imageToBase64(imagePath) {
    return new Promise((resolve, reject) => {
        // If already base64, return it
        if (imagePath.startsWith('data:image')) {
            resolve(imagePath);
            return;
        }
        
        // Create image element
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const base64 = canvas.toDataURL('image/jpeg', 0.9);
                resolve(base64);
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = function() {
            // If image fails to load, try fetching it
            fetch(imagePath)
                .then(response => response.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                })
                .catch(reject);
        };
        
        img.src = imagePath;
    });
}

// Download JS file
function downloadJSFile(content, filename) {
    const blob = new Blob([content], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`✅ Downloaded ${filename}`);
}

// Auto-save wrapper that also saves to code
let permanentSaveTimeout = null;
async function autoSavePermanently() {
    if (permanentSaveTimeout) {
        clearTimeout(permanentSaveTimeout);
    }
    
    // Wait 3 seconds after last change before permanent save
    permanentSaveTimeout = setTimeout(async () => {
        await saveAllDataPermanently();
    }, 3000);
}

// Export functions
window.permanentStorage = {
    saveAllDataPermanently,
    saveSliderImagesToCode,
    saveProductImagesToCode,
    saveProductsDataToCode,
    autoSavePermanently
};

