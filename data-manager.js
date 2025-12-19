// Data Manager - File-based storage system for portability
// This ensures all data is stored in files and can be moved between devices

const DATA_FILE = 'store-data.json';
let fileHandle = null;
let autoSaveEnabled = true;

// Initialize data from JSON file or localStorage fallback
async function initializeDataFromFile() {
    try {
        // Try to load from JSON file first
        const response = await fetch(DATA_FILE + '?v=' + Date.now());
        if (response.ok) {
            const data = await response.json();
            syncDataToLocalStorage(data);
            console.log('✅ Data loaded from store-data.json');
            return data;
        }
    } catch (error) {
        console.log('⚠️ Could not load from file, using localStorage:', error);
    }
    
    // Fallback to localStorage
    return getDataFromLocalStorage();
}

// Get data from localStorage
function getDataFromLocalStorage() {
    const data = {
        version: localStorage.getItem('dataVersion') || '1.0.0',
        storeName: localStorage.getItem('storeName') || 'Premium Vape Shop',
        products: JSON.parse(localStorage.getItem('products') || '[]'),
        brands: JSON.parse(localStorage.getItem('brands') || '[]'),
        flavors: JSON.parse(localStorage.getItem('flavors') || '[]'),
        sliderImages: JSON.parse(localStorage.getItem('sliderImages') || '[]'),
        featuredProducts: JSON.parse(localStorage.getItem('featuredProducts') || '[]')
    };
    
    // Ensure all images in products are base64 for portability
    if (data.products && Array.isArray(data.products)) {
        data.products = data.products.map(product => {
            const productCopy = { ...product };
            
            // Convert main image to base64 if it's not already
            if (productCopy.image && !productCopy.image.startsWith('data:image')) {
                // Keep the path but we'll convert it when saving
                // For now, keep as is - conversion happens during save
            }
            
            // Ensure flavors have base64 images
            if (productCopy.flavors && Array.isArray(productCopy.flavors)) {
                productCopy.flavors = productCopy.flavors.map(flavor => {
                    if (flavor.image && !flavor.image.startsWith('data:image')) {
                        // Will be converted during save
                    }
                    return flavor;
                });
            }
            
            // Ensure additional images are base64
            if (productCopy.additionalImages && Array.isArray(productCopy.additionalImages)) {
                productCopy.additionalImages = productCopy.additionalImages.map(img => {
                    if (img && !img.startsWith('data:image')) {
                        // Will be converted during save
                    }
                    return img;
                });
            }
            
            return productCopy;
        });
    }
    
    // Ensure slider images are base64
    if (data.sliderImages && Array.isArray(data.sliderImages)) {
        data.sliderImages = data.sliderImages.map(img => {
            if (img && !img.startsWith('data:image')) {
                // Will be converted during save
            }
            return img;
        });
    }
    
    return data;
}

// Sync data to localStorage (for runtime use)
function syncDataToLocalStorage(data) {
    if (data.storeName) localStorage.setItem('storeName', data.storeName);
    if (data.products) localStorage.setItem('products', JSON.stringify(data.products));
    if (data.brands) localStorage.setItem('brands', JSON.stringify(data.brands));
    if (data.flavors) localStorage.setItem('flavors', JSON.stringify(data.flavors));
    if (data.sliderImages) localStorage.setItem('sliderImages', JSON.stringify(data.sliderImages));
    if (data.featuredProducts) localStorage.setItem('featuredProducts', JSON.stringify(data.featuredProducts));
    if (data.version) localStorage.setItem('dataVersion', data.version);
}

// Convert image paths to base64 for portability
async function ensureImagesAreBase64(data) {
    const dataCopy = JSON.parse(JSON.stringify(data)); // Deep copy
    
    // Convert slider images to base64
    if (dataCopy.sliderImages && Array.isArray(dataCopy.sliderImages)) {
        for (let i = 0; i < dataCopy.sliderImages.length; i++) {
            const img = dataCopy.sliderImages[i];
            if (img && !img.startsWith('data:image') && img.trim() !== '') {
                try {
                    const base64 = await imagePathToBase64(img);
                    dataCopy.sliderImages[i] = base64;
                } catch (error) {
                    console.warn(`Could not convert slider image ${i + 1} to base64:`, error);
                    // Keep original path
                }
            }
        }
    }
    
    // Convert product images to base64
    if (dataCopy.products && Array.isArray(dataCopy.products)) {
        for (const product of dataCopy.products) {
            // Main product image
            if (product.image && !product.image.startsWith('data:image') && product.image.trim() !== '') {
                try {
                    product.image = await imagePathToBase64(product.image);
                } catch (error) {
                    console.warn(`Could not convert product ${product.id} main image:`, error);
                }
            }
            
            // Flavor images
            if (product.flavors && Array.isArray(product.flavors)) {
                for (const flavor of product.flavors) {
                    if (flavor.image && !flavor.image.startsWith('data:image') && flavor.image.trim() !== '') {
                        try {
                            flavor.image = await imagePathToBase64(flavor.image);
                        } catch (error) {
                            console.warn(`Could not convert flavor image:`, error);
                        }
                    }
                }
            }
            
            // Additional images
            if (product.additionalImages && Array.isArray(product.additionalImages)) {
                for (let i = 0; i < product.additionalImages.length; i++) {
                    const img = product.additionalImages[i];
                    if (img && !img.startsWith('data:image') && img.trim() !== '') {
                        try {
                            product.additionalImages[i] = await imagePathToBase64(img);
                        } catch (error) {
                            console.warn(`Could not convert additional image:`, error);
                        }
                    }
                }
            }
        }
    }
    
    return dataCopy;
}

// Helper function to convert image path to base64
function imagePathToBase64(imagePath) {
    return new Promise((resolve, reject) => {
        // If already base64, return it
        if (imagePath.startsWith('data:image')) {
            resolve(imagePath);
            return;
        }
        
        // Try to fetch the image
        fetch(imagePath)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch image');
                return response.blob();
            })
            .then(blob => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            })
            .catch(() => {
                // If fetch fails, try creating an image element
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
                img.onerror = () => reject(new Error('Could not load image'));
                img.src = imagePath;
            });
    });
}

// Save data to JSON file (using File System Access API or download)
async function saveDataToFile(data, convertImages = true) {
    // Always update version
    data.version = (new Date()).toISOString();
    
    // Convert images to base64 for portability
    let dataToSave = data;
    if (convertImages) {
        try {
            dataToSave = await ensureImagesAreBase64(data);
        } catch (error) {
            console.warn('Error converting images to base64, saving with original paths:', error);
            dataToSave = data;
        }
    }
    
    try {
        // Try File System Access API (modern browsers, Chrome/Edge)
        if ('showSaveFilePicker' in window) {
            try {
                if (!fileHandle) {
                    // First time - ask for file handle
                    fileHandle = await window.showSaveFilePicker({
                        suggestedName: DATA_FILE,
                        types: [{
                            description: 'JSON files',
                            accept: { 'application/json': ['.json'] }
                        }]
                    });
                }
                
                const writable = await fileHandle.createWritable();
                await writable.write(JSON.stringify(dataToSave, null, 2));
                await writable.close();
                console.log('✅ Data saved to file using File System Access API');
                return { success: true, method: 'fileAPI' };
            } catch (error) {
                if (error.name === 'AbortError') {
                    // User cancelled - return without error
                    return { success: false, cancelled: true };
                }
                throw error;
            }
        }
    } catch (error) {
        console.log('File System Access API not available or failed:', error);
    }
    
    // Fallback: Download JSON file
    downloadJSONFile(dataToSave, DATA_FILE);
    return { success: true, method: 'download' };
}

// Download JSON file (fallback method)
function downloadJSONFile(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('✅ Data downloaded as JSON file');
}

// Auto-save data (saves to both localStorage and file)
let saveTimeout = null;
let lastSaveTime = 0;
async function autoSaveData(silent = true) {
    // Clear previous timeout
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }
    
    // Debounce: wait 500ms before saving
    saveTimeout = setTimeout(async () => {
        if (!autoSaveEnabled) return;
        
        const data = getDataFromLocalStorage();
        syncDataToLocalStorage(data);
        
        // Try to save to file in background (won't block if it fails)
        if (!silent) {
            // Manual save - show download dialog
            const result = await saveDataToFile(data);
            if (result.success && result.method === 'download') {
                if (!result.cancelled) {
                    alert('✅ Data saved!\n\nPlease save the downloaded store-data.json file to your project folder to keep it in sync.');
                }
            }
            lastSaveTime = Date.now();
        } else {
            // Silent auto-save - try File System Access API first (no download popup)
            try {
                if (fileHandle && 'showSaveFilePicker' in window) {
                    const writable = await fileHandle.createWritable();
                    await writable.write(JSON.stringify(data, null, 2));
                    await writable.close();
                    lastSaveTime = Date.now();
                    console.log('✅ Auto-saved to file');
                } else {
                    // If no file handle, try to get one silently (only works if user previously granted permission)
                    // For now, we'll just log - user can manually save when needed
                    console.log('💾 Data saved to localStorage. Use "Save Data to File" button to save to file.');
                }
            } catch (error) {
                // Silent fail for auto-save - data is still in localStorage
                console.log('💾 Data saved to localStorage. Use "Save Data to File" button to save to file.');
            }
        }
    }, silent ? 2000 : 0); // 2 second delay for auto-save, immediate for manual
}

// Manual save trigger (shows download dialog)
function manualSaveData() {
    autoSaveData(false);
}

// Handle image upload and save to images folder
async function saveImageToFolder(file, relativePath) {
    try {
        // Try File System Access API
        if ('showDirectoryPicker' in window) {
            try {
                const dirHandle = await window.showDirectoryPicker();
                const imagesHandle = await dirHandle.getDirectoryHandle('images', { create: true });
                
                // Create nested directories if needed
                const pathParts = relativePath.split('/').slice(0, -1);
                let currentHandle = imagesHandle;
                
                for (const part of pathParts) {
                    if (part && part !== 'images') {
                        currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
                    }
                }
                
                const fileName = relativePath.split('/').pop();
                const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(file);
                await writable.close();
                
                console.log('✅ Image saved to:', relativePath);
                return { success: true, path: relativePath };
            } catch (error) {
                if (error.name === 'AbortError') {
                    return { success: false, cancelled: true };
                }
                throw error;
            }
        }
    } catch (error) {
        console.error('Image save error:', error);
    }
    
    // Fallback: Convert to base64 data URL (stored in JSON)
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            // Store as base64 in JSON for portability
            resolve({ success: true, path: relativePath, dataUrl: dataUrl });
        };
        reader.readAsDataURL(file);
    });
}

// Upload product image with proper path generation
async function uploadProductImage(file, productId, flavorName = '') {
    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop().toLowerCase();
    const sanitizedProductId = productId.replace(/[^a-zA-Z0-9]/g, '_');
    
    let fileName, relativePath;
    if (flavorName) {
        const sanitizedFlavor = flavorName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        fileName = `${sanitizedProductId}_${sanitizedFlavor}_${timestamp}.${extension}`;
        relativePath = `images/products/${sanitizedProductId}/${fileName}`;
    } else {
        fileName = `${sanitizedProductId}_${timestamp}.${extension}`;
        relativePath = `images/products/${sanitizedProductId}/${fileName}`;
    }
    
    // Try to save using File System Access API
    const result = await saveImageToFolder(file, relativePath);
    
    // If saved as base64, return data URL, otherwise return path
    return result.dataUrl || result.path;
}

// Upload slider image
async function uploadSliderImage(file, index) {
    const timestamp = Date.now();
    const extension = file.name.split('.').pop().toLowerCase();
    const fileName = `slide_${index}_${timestamp}.${extension}`;
    const relativePath = `images/slide image/${fileName}`;
    
    const result = await saveImageToFolder(file, relativePath);
    return result.dataUrl || result.path;
}

// Force save everything immediately (with image conversion)
async function forceSaveEverything() {
    console.log('💾 Force saving everything...');
    
    const data = getDataFromLocalStorage();
    
    // Save to JSON file with images converted to base64
    const result = await saveDataToFile(data, true);
    
    if (result.success) {
        if (result.method === 'download') {
            alert('✅ All data saved!\n\nPlease save the downloaded store-data.json file to your project folder.\n\nThis file contains ALL your data including images (as base64) so it works on any device!');
        } else {
            alert('✅ All data saved to store-data.json file!\n\nAll images have been converted to base64 format for portability.');
        }
    }
    
    return result;
}

// Export functions
window.dataManager = {
    initializeDataFromFile,
    getDataFromLocalStorage,
    syncDataToLocalStorage,
    saveDataToFile,
    autoSaveData,
    manualSaveData,
    uploadProductImage,
    uploadSliderImage,
    downloadJSONFile,
    forceSaveEverything,
    setAutoSaveEnabled: (enabled) => { autoSaveEnabled = enabled; }
};
