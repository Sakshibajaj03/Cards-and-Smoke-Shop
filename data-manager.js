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
    return {
        version: localStorage.getItem('dataVersion') || '1.0.0',
        storeName: localStorage.getItem('storeName') || 'Premium Vape Shop',
        products: JSON.parse(localStorage.getItem('products') || '[]'),
        brands: JSON.parse(localStorage.getItem('brands') || '[]'),
        flavors: JSON.parse(localStorage.getItem('flavors') || '[]'),
        sliderImages: JSON.parse(localStorage.getItem('sliderImages') || '[]'),
        featuredProducts: JSON.parse(localStorage.getItem('featuredProducts') || '[]')
    };
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

// Save data to JSON file (using File System Access API or download)
async function saveDataToFile(data) {
    // Always update version
    data.version = (new Date()).toISOString();
    
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
                await writable.write(JSON.stringify(data, null, 2));
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
    downloadJSONFile(data, DATA_FILE);
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
        } else {
            // Silent auto-save - only try File System Access API (no download popup)
            try {
                if (fileHandle && 'showSaveFilePicker' in window) {
                    const writable = await fileHandle.createWritable();
                    await writable.write(JSON.stringify(data, null, 2));
                    await writable.close();
                }
            } catch (error) {
                // Silent fail for auto-save
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
    setAutoSaveEnabled: (enabled) => { autoSaveEnabled = enabled; }
};
