// Admin Panel Functions

// Helper function to resolve image paths (handles embedded images for portability)
function getImageSource(imagePath) {
    if (!imagePath || imagePath.trim() === '') {
        return null;
    }
    
    // If it's already a data URL, use it
    if (imagePath.startsWith('data:image')) {
        return imagePath;
    }

    // Try to get from embedded images first (for portability)
    if (typeof getEmbeddedImage === 'function') {
        // Try with original path, then without images/ prefix
        let embedded = getEmbeddedImage(imagePath);
        if (!embedded && imagePath.startsWith('images/')) {
            embedded = getEmbeddedImage(imagePath.replace(/^images\//, ''));
        }
        if (embedded) return embedded;
    }
    
    // If it's already a full URL, use it
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // If it's a relative path starting with images/, encode spaces and special characters
    if (imagePath.startsWith('images/')) {
        const parts = imagePath.split('/');
        const encodedParts = parts.map((part, index) => {
            if (index === 0) return part;
            return encodeURIComponent(part);
        });
        return encodedParts.join('/');
    }
    
    // If it's just a filename, assume it's in images folder
    if (!imagePath.includes('/')) {
        return `images/${encodeURIComponent(imagePath)}`;
    }
    
    return imagePath;
}

// Initialize admin page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all data structures for portability
    initializeAllData();

    // Initialize products from code first (only if products don't exist)
    initializeProductsFromCode();

    loadStoreSettings();
    loadSliderImages();
    loadBrands();
    loadFlavors();
    loadProductsAdmin();
    loadFeaturedProducts();
    populateBrandAndFlavorSelects();
    updateDashboardStats();

    // Show dashboard by default
    showSection('dashboard');
});

// Initialize all data structures to ensure portability
function initializeAllData() {
    // Initialize store name
    if (!localStorage.getItem('storeName')) {
        localStorage.setItem('storeName', 'Premium Vape Shop');
    }

    // Initialize products array
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify([]));
    }

    // Initialize brands array with proper structure
    if (!localStorage.getItem('brands')) {
        localStorage.setItem('brands', JSON.stringify([]));
    }

    // Initialize brand-flavor relationships
    if (!localStorage.getItem('brandFlavors')) {
        localStorage.setItem('brandFlavors', JSON.stringify({}));
    }

    // Initialize brand-subbrand relationships
    if (!localStorage.getItem('brandSubBrands')) {
        localStorage.setItem('brandSubBrands', JSON.stringify({}));
    }

    // Initialize flavors array
    if (!localStorage.getItem('flavors')) {
        localStorage.setItem('flavors', JSON.stringify([]));
    }

    // Initialize slider images
    if (!localStorage.getItem('sliderImages')) {
        let sliderImages = [];
        // Try to get from embedded data if available
        if (typeof window.getSliderImages === 'function') {
            sliderImages = window.getSliderImages();
        }
        // If no embedded images, use defaults
        if (!sliderImages || sliderImages.length === 0) {
            sliderImages = [
                'images/slider/slide1.jpg',
                'images/slider/slide2.jpg',
                'images/slider/slide3.jpg',
                'images/slider/slide4.jpg',
                'images/slider/slide5.jpg'
            ];
        }
        localStorage.setItem('sliderImages', JSON.stringify(sliderImages));
    }

    // Initialize featured products
    if (!localStorage.getItem('featuredProducts')) {
        localStorage.setItem('featuredProducts', JSON.stringify(['', '', '', '']));
    }

    // Initialize cart
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }

    console.log('All data structures initialized for portability');
}

// Sidebar Navigation
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update active nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate corresponding nav item
    const activeNav = Array.from(navItems).find(item => {
        const href = item.getAttribute('href') || item.getAttribute('onclick');
        return href && href.includes(sectionId);
    });
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    // Update page title
    updatePageTitle(sectionId);
    
    // Load section-specific data
    if (sectionId === 'brands') {
        loadBrands();
        // Update brands stat
        const brands = getBrands();
        const totalBrandsStat = document.getElementById('totalBrandsStat');
        if (totalBrandsStat) {
            totalBrandsStat.textContent = brands.length;
        }
    } else if (sectionId === 'flavors') {
        loadFlavors();
        // Update flavors stat
        const flavors = JSON.parse(localStorage.getItem('flavors') || '[]');
        const totalFlavorsStat = document.getElementById('totalFlavorsStat');
        if (totalFlavorsStat) {
            totalFlavorsStat.textContent = flavors.length;
        }
    } else if (sectionId === 'products') {
        loadProductsAdmin();
    } else if (sectionId === 'dashboard') {
        updateDashboardStats();
    } else if (sectionId === 'featured') {
        loadFeaturedProducts();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updatePageTitle(sectionId) {
    const titles = {
        'dashboard': 'Dashboard',
        'settings': 'Store Settings',
        'slider': 'Slider Images',
        'products': 'Products Management',
        'brands': 'Brands Management',
        'flavors': 'Flavors Management',
        'featured': 'Featured Products',
        'data': 'Data Management'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = titles[sectionId] || 'Admin Panel';
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e) {
    const sidebar = document.querySelector('.admin-sidebar');
    const toggle = document.querySelector('.sidebar-toggle');
    
    if (window.innerWidth <= 1024 && sidebar && toggle) {
        if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// Update Dashboard Statistics
function updateDashboardStats() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const brands = getBrands();
    const brandNames = getBrandNames(brands);
    const flavors = JSON.parse(localStorage.getItem('flavors') || '[]');
    const sliderImages = JSON.parse(localStorage.getItem('sliderImages') || '[]');
    
    const totalProductsEl = document.getElementById('totalProducts');
    const totalBrandsEl = document.getElementById('totalBrands');
    const totalFlavorsEl = document.getElementById('totalFlavors');
    const totalSlidersEl = document.getElementById('totalSliders');
    
    if (totalProductsEl) totalProductsEl.textContent = products.length;
    if (totalBrandsEl) totalBrandsEl.textContent = brandNames.length;
    if (totalFlavorsEl) totalFlavorsEl.textContent = flavors.length;
    if (totalSlidersEl) totalSlidersEl.textContent = sliderImages.filter(img => img).length;
}

// Store Settings
function loadStoreSettings() {
    const storeName = localStorage.getItem('storeName') || 'Premium Store';
    const storeNameInput = document.getElementById('storeName');
    if (storeNameInput) {
        storeNameInput.value = storeName;
    }
}

function saveStoreSettings() {
    const storeName = document.getElementById('storeName').value;
    if (storeName.trim()) {
        localStorage.setItem('storeName', storeName);
        alert('Store settings saved successfully!');
        updateDashboardStats();
    } else {
        alert('Please enter a store name.');
    }
}

// Slider Images Management
function loadSliderImages() {
    const sliderImages = JSON.parse(localStorage.getItem('sliderImages') || '[]');
    for (let i = 1; i <= 5; i++) {
        const preview = document.getElementById(`preview${i}`);
        if (preview && sliderImages[i - 1]) {
            preview.innerHTML = `<img src="${sliderImages[i - 1]}" alt="Slider ${i}">`;
        }
    }
}

// Hero & Side Images Management

function handleSliderImageUpload(index, input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageUrl = e.target.result;
        let sliderImages = JSON.parse(localStorage.getItem('sliderImages') || '[]');
        sliderImages[index - 1] = imageUrl;
        localStorage.setItem('sliderImages', JSON.stringify(sliderImages));
        
        // Update the data file in memory if it's loaded
        if (typeof window.SLIDER_IMAGES_DATA !== 'undefined') {
            window.SLIDER_IMAGES_DATA[index - 1] = imageUrl;
        }
        
        const preview = document.getElementById(`preview${index}`);
        if (preview) {
            preview.innerHTML = `<img src="${imageUrl}" alt="Slider ${index}">`;
        }
        
        updateDashboardStats();
        alert('Slider image uploaded successfully!\n\nNote: To make images persist on another PC, click "Update Slider Data File" button below.');
    };
    reader.readAsDataURL(file);
}

// Generate and download slider-data.js file
function generateSliderDataFile() {
    try {
        const sliderImages = JSON.parse(localStorage.getItem('sliderImages') || '[]');
        
        // Ensure we have 5 slots
        while (sliderImages.length < 5) {
            sliderImages.push('');
        }
        
        // Escape the base64 strings for JavaScript
        const escapedImages = sliderImages.map(img => {
            if (!img || img.trim() === '') {
                return "''";
            }
            // Escape single quotes and backslashes
            return "'" + img.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
        });
        
        const fileContent = `// Slider Images Data File
// This file stores slider images as base64 encoded data
// This ensures images persist when moving the website to another PC
// Auto-generated by the admin panel when images are uploaded

// Slider images stored as base64 data URLs
// Format: ['data:image/jpeg;base64,...', 'data:image/jpeg;base64,...', ...]
// Empty strings indicate no image for that slot
window.SLIDER_IMAGES_DATA = [
    ${escapedImages[0]}, // Slider 1
    ${escapedImages[1]}, // Slider 2
    ${escapedImages[2]}, // Slider 3
    ${escapedImages[3]}, // Slider 4
    ${escapedImages[4]}  // Slider 5
];

// Function to get slider images (checks data file first, then localStorage)
window.getSliderImages = function() {
    // First, try to get from data file (if images exist)
    const dataFileImages = window.SLIDER_IMAGES_DATA || [];
    const hasDataFileImages = dataFileImages.some(img => img && img.trim() !== '');
    
    if (hasDataFileImages) {
        // Merge: use data file images, but allow localStorage to override if it has newer data
        const localStorageImages = JSON.parse(localStorage.getItem('sliderImages') || '[]');
        const merged = dataFileImages.map((dataImg, index) => {
            // Use localStorage image if it exists and is not empty, otherwise use data file image
            return (localStorageImages[index] && localStorageImages[index].trim() !== '') 
                ? localStorageImages[index] 
                : (dataImg || '');
        });
        return merged;
    }
    
    // Fall back to localStorage
    const localStorageImages = JSON.parse(localStorage.getItem('sliderImages') || '[]');
    if (localStorageImages.length > 0 && localStorageImages.some(img => img && img.trim() !== '')) {
        return localStorageImages;
    }
    
    // Return empty array if no images found
    return [];
};
`;
        
        // Create download link
        const blob = new Blob([fileContent], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'slider-data.js';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        alert('slider-data.js file generated successfully!\n\n' +
              'Instructions:\n' +
              '1. The file has been downloaded to your Downloads folder\n' +
              '2. Replace the existing slider-data.js file in your website folder with this new file\n' +
              '3. Now your slider images will persist when you move the website to another PC!');
    } catch (error) {
        console.error('Error generating slider data file:', error);
        alert('Error generating slider data file. Please try again.');
    }
}
window.generateSliderDataFile = generateSliderDataFile;

// Helper function to normalize brands (convert old format to new format)
function normalizeBrands(brands) {
    if (!Array.isArray(brands) || brands.length === 0) return [];
    
    // Check if already in new format (array of objects)
    if (typeof brands[0] === 'object' && brands[0] !== null && brands[0].name) {
        return brands;
    }
    
    // Convert old format (array of strings) to new format (array of objects)
    return brands.map((brand, index) => ({
        name: brand,
        displayOrder: index + 1
    }));
}

// Helper function to get brand names array (for backward compatibility)
function getBrandNames(brands) {
    const normalized = normalizeBrands(brands);
    return normalized.map(b => b.name);
}

// Helper function to get brands with proper structure
function getBrands() {
    const brands = JSON.parse(localStorage.getItem('brands') || '[]');
    return normalizeBrands(brands);
}

// Unified Brands & Flavors Management
function loadBrands() {
    let brands = getBrands(); // Get normalized brands
    const brandFlavors = JSON.parse(localStorage.getItem('brandFlavors') || '{}'); // New: flavors assigned to brands
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const allFlavors = getAllFlavorsFromProducts(); // Get all unique flavors from products
    
    const brandsList = document.getElementById('brandsList');
    const emptyState = document.getElementById('brandsEmptyState');
    
    // Update statistics
    updateBrandFlavorStats(brands, brandFlavors, products);
    
    if (!brandsList) return;
    
    if (brands.length === 0) {
        brandsList.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    // Helper function to escape HTML
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    
    brandsList.innerHTML = brands.map((brandObj, index) => {
        const brand = brandObj.name || brandObj; // Support both formats during transition
        const displayOrder = brandObj.displayOrder !== undefined ? brandObj.displayOrder : (index + 1);
        const assignedFlavors = brandFlavors[brand] || [];
        
        // Escape HTML and JS for safe use in HTML and onclick handlers
        const safeBrand = escapeHtml(brand);
        const safeBrandJs = brand.replace(/'/g, "\\'").replace(/\\/g, '\\\\');
        const brandProducts = products.filter(p => (p.brand || '').toUpperCase() === brand.toUpperCase());
        const productCount = brandProducts.length;
        
        // Get flavors used in products for this brand
        const usedFlavors = new Set();
        brandProducts.forEach(p => {
            if (p.flavors && Array.isArray(p.flavors)) {
                p.flavors.forEach(f => {
                    if (f && f.name) usedFlavors.add(f.name);
                });
            } else if (p.flavor) {
                usedFlavors.add(p.flavor);
            }
        });
        
        // Combine assigned flavors and used flavors
        const allBrandFlavors = [...new Set([...assignedFlavors, ...usedFlavors])];
        
        return `
            <div class="brand-flavor-card" style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 2px solid #e5e7eb; transition: all 0.3s ease;">
                <!-- Brand Header -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 700; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                                ${brand.charAt(0).toUpperCase()}
                            </div>
                            <div style="flex: 1;">
                                <h3 style="margin: 0; font-size: 22px; font-weight: 700; color: #1f2937; display: flex; align-items: center; gap: 10px;">
                                    <span id="brandNameDisplay_${index}">${safeBrand}</span>
                                    <button onclick="editBrandName(${index}, '${safeBrandJs}')" style="background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 12px; color: #6b7280;" title="Edit brand name">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </h3>
                                <div style="display: flex; gap: 15px; margin-top: 8px; flex-wrap: wrap;">
                                    <span style="display: inline-flex; align-items: center; gap: 5px; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 13px;">
                                        <i class="fas fa-box"></i> ${productCount} Products
                                    </span>
                                    <span style="display: inline-flex; align-items: center; gap: 5px; background: #f0fdf4; color: #065f46; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 13px;">
                                        <i class="fas fa-palette"></i> ${allBrandFlavors.length} Flavors
                                    </span>
                                    <span style="display: inline-flex; align-items: center; gap: 8px; background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 13px;">
                                        <i class="fas fa-sort-numeric-down"></i> Display Order: 
                                        <input type="number" id="displayOrder_${index}" value="${displayOrder}" min="1" 
                                               onchange="updateBrandDisplayOrder(${index}, '${safeBrandJs}', this.value)" 
                                               style="width: 60px; padding: 2px 6px; border: 1px solid #fbbf24; border-radius: 4px; text-align: center; font-weight: 700; color: #92400e; background: white;"
                                               title="Change display order (lower number = appears first on index page)">
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button onclick="deleteBrand(${index})" style="background: #fef2f2; border: 1px solid #ef4444; color: #ef4444; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;" title="Delete Brand">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                
                <!-- Flavors Section -->
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-palette"></i> Assigned Flavors
                        </h4>
                        <button onclick="showAssignFlavorModal('${safeBrandJs}')" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">
                            <i class="fas fa-plus"></i> Assign Flavor
                        </button>
                    </div>
                    <div id="flavors_${index}" style="display: flex; flex-wrap: wrap; gap: 8px; min-height: 50px; padding: 15px; background: #f9fafb; border-radius: 12px; border: 2px dashed #e5e7eb;">
                        ${allBrandFlavors.length > 0 
                            ? allBrandFlavors.map((flavor, fIndex) => {
                                const isAssigned = assignedFlavors.includes(flavor);
                                const isUsed = usedFlavors.has(flavor);
                                const safeFlavor = escapeHtml(flavor);
                                const safeFlavorJs = flavor.replace(/'/g, "\\'").replace(/\\/g, '\\\\');
                                return `
                                    <span class="flavor-tag" style="display: inline-flex; align-items: center; gap: 6px; background: ${isUsed ? '#dbeafe' : '#f0fdf4'}; color: ${isUsed ? '#1e40af' : '#065f46'}; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; border: 1px solid ${isUsed ? '#93c5fd' : '#86efac'};">
                                        ${safeFlavor}
                                        ${isUsed ? '<i class="fas fa-check-circle" style="font-size: 11px;" title="Used in products"></i>' : ''}
                                        ${isAssigned ? `<button onclick="removeFlavorFromBrand('${safeBrandJs}', '${safeFlavorJs}')" style="background: none; border: none; color: ${isUsed ? '#1e40af' : '#065f46'}; cursor: pointer; padding: 0; margin-left: 4px; font-size: 12px; opacity: 0.7;" title="Remove flavor">
                                            <i class="fas fa-times"></i>
                                        </button>` : ''}
                                    </span>
                                `;
                            }).join('')
                            : '<span style="color: #9ca3af; font-style: italic; width: 100%; text-align: center; padding: 10px;">No flavors assigned yet</span>'
                        }
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add card hover styles
    if (!document.getElementById('brand-flavor-card-styles')) {
        const style = document.createElement('style');
        style.id = 'brand-flavor-card-styles';
        style.textContent = `
            .brand-flavor-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                border-color: #667eea;
            }
            .flavor-tag:hover {
                transform: scale(1.05);
            }
            @media (max-width: 768px) {
                #brandsList {
                    grid-template-columns: 1fr !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function getAllFlavorsFromProducts() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const flavors = new Set();
    
    products.forEach(product => {
        if (product.flavors && Array.isArray(product.flavors)) {
            product.flavors.forEach(f => {
                if (f && f.name) flavors.add(f.name);
            });
        } else if (product.flavor) {
            flavors.add(product.flavor);
        }
    });
    
    return Array.from(flavors).sort();
}

function updateBrandFlavorStats(brands, brandFlavors, products) {
    const brandNames = getBrandNames(brands);
    const totalBrands = brandNames.length;
    const totalFlavors = getAllFlavorsFromProducts().length;
    const totalProducts = products.length;
    
    const totalBrandsStat = document.getElementById('totalBrandsStat');
    const totalFlavorsStat = document.getElementById('totalFlavorsStat');
    const totalProductsStat = document.getElementById('totalProductsStat');
    
    if (totalBrandsStat) totalBrandsStat.textContent = totalBrands;
    if (totalFlavorsStat) totalFlavorsStat.textContent = totalFlavors;
    if (totalProductsStat) totalProductsStat.textContent = totalProducts;
}

function showAssignFlavorModal(brandName) {
    const allFlavors = getAllFlavorsFromProducts();
    const brandFlavors = JSON.parse(localStorage.getItem('brandFlavors') || '{}');
    const assignedFlavors = brandFlavors[brandName] || [];
    const availableFlavors = allFlavors.filter(f => !assignedFlavors.includes(f));
    
    if (availableFlavors.length === 0 && allFlavors.length === 0) {
        // No flavors exist, offer to create one
        const newFlavor = prompt(`No flavors found. Create a new flavor for ${brandName}:`, '');
        if (newFlavor && newFlavor.trim()) {
            assignFlavorToBrand(brandName, newFlavor.trim());
        }
        return;
    }
    
    if (availableFlavors.length === 0) {
        alert('All available flavors are already assigned to this brand.');
        return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); 
        z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 16px; padding: 30px; max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: #1f2937;">
                    <i class="fas fa-palette"></i> Assign Flavors to ${brandName}
                </h3>
                <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="background: #f3f4f6; border: none; border-radius: 8px; padding: 8px; cursor: pointer; color: #6b7280;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #374151;">
                    Select flavors to assign:
                </label>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; max-height: 300px; overflow-y: auto; padding: 15px; background: #f9fafb; border-radius: 12px; border: 2px solid #e5e7eb;">
                    ${availableFlavors.map(flavor => `
                        <label style="display: flex; align-items: center; gap: 8px; background: white; padding: 10px 15px; border-radius: 8px; border: 2px solid #e5e7eb; cursor: pointer; transition: all 0.2s; flex: 1; min-width: 150px;">
                            <input type="checkbox" value="${flavor}" class="flavor-checkbox" style="cursor: pointer;">
                            <span style="font-weight: 500; color: #374151;">${flavor}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #374151;">
                    Or create new flavor:
                </label>
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="newFlavorInput" class="form-input" placeholder="Enter new flavor name" style="flex: 1;">
                    <button onclick="createAndAssignFlavor('${brandName}')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-plus"></i> Create & Assign
                    </button>
                </div>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="background: #f3f4f6; border: 1px solid #e5e7eb; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; color: #374151;">
                    Cancel
                </button>
                <button onclick="assignSelectedFlavors('${brandName}')" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-check"></i> Assign Selected
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.onclick = function(e) {
        if (e.target === modal) modal.remove();
    };
}

function assignSelectedFlavors(brandName) {
    const checkboxes = document.querySelectorAll('.flavor-checkbox:checked');
    const flavors = Array.from(checkboxes).map(cb => cb.value);
    
    if (flavors.length === 0) {
        alert('Please select at least one flavor.');
        return;
    }
    
    flavors.forEach(flavor => {
        assignFlavorToBrand(brandName, flavor);
    });
    
    document.querySelector('[style*="position: fixed"]').remove();
    loadBrands();
    updateDashboardStats();
}

function assignFlavorToBrand(brandName, flavorName) {
    let brandFlavors = JSON.parse(localStorage.getItem('brandFlavors') || '{}');
    
    if (!brandFlavors[brandName]) {
        brandFlavors[brandName] = [];
    }
    
    if (!brandFlavors[brandName].includes(flavorName)) {
        brandFlavors[brandName].push(flavorName);
        localStorage.setItem('brandFlavors', JSON.stringify(brandFlavors));
    }
}

function removeFlavorFromBrand(brandName, flavorName) {
    if (!confirm(`Remove "${flavorName}" from ${brandName}?`)) return;
    
    let brandFlavors = JSON.parse(localStorage.getItem('brandFlavors') || '{}');
    
    if (brandFlavors[brandName]) {
        brandFlavors[brandName] = brandFlavors[brandName].filter(f => f !== flavorName);
        if (brandFlavors[brandName].length === 0) {
            delete brandFlavors[brandName];
        }
        localStorage.setItem('brandFlavors', JSON.stringify(brandFlavors));
    }
    
    loadBrands();
    updateDashboardStats();
}

function createAndAssignFlavor(brandName) {
    const input = document.getElementById('newFlavorInput');
    if (!input || !input.value.trim()) {
        alert('Please enter a flavor name.');
        return;
    }
    
    const flavorName = input.value.trim();
    assignFlavorToBrand(brandName, flavorName);
    input.value = '';
    
    loadBrands();
    updateDashboardStats();
}

function editBrandName(index, oldName) {
    const newName = prompt('Enter new brand name:', oldName);
    if (!newName || newName.trim() === '' || newName === oldName) {
        return;
    }
    
    updateBrandName(index, oldName, newName.trim());
}

// Inline editing functions
function editBrandInline(index, currentName) {
    const displayEl = document.getElementById(`brandNameDisplay_${index}`);
    if (!displayEl) return;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.style.cssText = 'padding: 6px 10px; border: 2px solid #667eea; border-radius: 6px; font-size: 16px; font-weight: 600; width: 200px;';
    input.onblur = function() {
        const newName = this.value.trim();
        if (newName && newName !== currentName) {
            updateBrandName(index, currentName, newName);
        } else {
            displayEl.textContent = currentName;
        }
    };
    input.onkeypress = function(e) {
        if (e.key === 'Enter') {
            this.blur();
        } else if (e.key === 'Escape') {
            displayEl.textContent = currentName;
            this.replaceWith(displayEl);
        }
    };
    
    displayEl.replaceWith(input);
    input.focus();
    input.select();
}

// Update brand display order
function updateBrandDisplayOrder(index, brandName, newOrder) {
    let brands = getBrands();
    const orderNum = parseInt(newOrder) || 1;
    
    if (orderNum < 1) {
        alert('Display order must be at least 1');
        loadBrands();
        return;
    }
    
    // Find the brand and update its order
    const brandIndex = brands.findIndex(b => (b.name || b) === brandName);
    if (brandIndex !== -1) {
        brands[brandIndex].displayOrder = orderNum;
        // Save normalized brands
        localStorage.setItem('brands', JSON.stringify(brands));
        loadBrands();
        updateDashboardStats();
    }
}
window.updateBrandDisplayOrder = updateBrandDisplayOrder;

function updateBrandName(index, oldName, newName) {
    let brands = getBrands();
    const brandNames = getBrandNames(brands);
    
    if (brandNames.includes(newName)) {
        alert('Brand name already exists!');
        loadBrands();
        return;
    }
    
    // Update brand name while preserving display order
    if (brands[index]) {
        brands[index].name = newName;
    } else {
        brands[index] = { name: newName, displayOrder: brands.length + 1 };
    }
    localStorage.setItem('brands', JSON.stringify(brands));
    
    // Update brandFlavors
    let brandFlavors = JSON.parse(localStorage.getItem('brandFlavors') || '{}');
    if (brandFlavors[oldName]) {
        brandFlavors[newName] = brandFlavors[oldName];
        delete brandFlavors[oldName];
        localStorage.setItem('brandFlavors', JSON.stringify(brandFlavors));
    }
    
    // Update products
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    products = products.map(p => {
        if ((p.brand || '').toUpperCase() === oldName.toUpperCase()) {
            p.brand = newName;
        }
        return p;
    });
    localStorage.setItem('products', JSON.stringify(products));
    
    loadBrands();
    populateBrandAndFlavorSelects();
    updateDashboardStats();
}


function addBrand() {
    const input = document.getElementById('newBrand');
    const brandName = input.value.trim();
    
    if (!brandName) {
        alert('Please enter a brand name.');
        return;
    }
    
    let brands = getBrands();
    const brandNames = getBrandNames(brands);
    
    if (brandNames.includes(brandName)) {
        alert('Brand already exists!');
        return;
    }
    
    // Get the highest display order and add 1
    const maxOrder = brands.length > 0 
        ? Math.max(...brands.map(b => b.displayOrder || 0))
        : 0;
    
    brands.push({ name: brandName, displayOrder: maxOrder + 1 });
    localStorage.setItem('brands', JSON.stringify(brands));
    input.value = '';
    loadBrands();
    populateBrandAndFlavorSelects();
    updateDashboardStats();
    alert('Brand added successfully!');
}

// Make functions globally available
window.editBrandName = editBrandName;
window.showAssignFlavorModal = showAssignFlavorModal;
window.removeFlavorFromBrand = removeFlavorFromBrand;
window.assignSelectedFlavors = assignSelectedFlavors;
window.createAndAssignFlavor = createAndAssignFlavor;

function deleteBrand(index) {
    if (!confirm('Are you sure you want to delete this brand? This will also remove all assigned flavors.')) return;
    
    let brands = getBrands();
    
    // Get the brand name before deleting
    const deletedBrandObj = brands[index];
    const deletedBrand = deletedBrandObj.name || deletedBrandObj;
    
    // Remove the brand from the array
    brands.splice(index, 1);
    localStorage.setItem('brands', JSON.stringify(brands));
    
    // Remove from brandFlavors
    let brandFlavors = JSON.parse(localStorage.getItem('brandFlavors') || '{}');
    if (brandFlavors[deletedBrand]) {
        delete brandFlavors[deletedBrand];
        localStorage.setItem('brandFlavors', JSON.stringify(brandFlavors));
    }
    
    loadBrands();
    populateBrandAndFlavorSelects();
    updateDashboardStats();
}

// Flavors Management
function loadFlavors() {
    const flavorsList = document.getElementById('flavorsList');
    if (!flavorsList) return;
    
    // Get all flavors from products (extract from product.flavors arrays)
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const allFlavorsFromProducts = new Set();
    
    products.forEach(product => {
        if (product.flavors && Array.isArray(product.flavors)) {
            product.flavors.forEach(flavor => {
                if (flavor && flavor.name) {
                    allFlavorsFromProducts.add(flavor.name);
                }
            });
        } else if (product.flavor) {
            // Backward compatibility: check single flavor property
            allFlavorsFromProducts.add(product.flavor);
        }
    });
    
    // Get existing flavors list (for backward compatibility)
    const existingFlavors = JSON.parse(localStorage.getItem('flavors') || '[]');
    existingFlavors.forEach(flavor => {
        if (typeof flavor === 'string') {
            allFlavorsFromProducts.add(flavor);
        }
    });
    
    // Convert Set to sorted array
    const allFlavors = Array.from(allFlavorsFromProducts).sort();
    
    // Update flavors list in localStorage to sync with products
    localStorage.setItem('flavors', JSON.stringify(allFlavors));
    
    // Update flavors count
    const flavorsCountEl = document.getElementById('flavorsCount');
    if (flavorsCountEl) {
        flavorsCountEl.textContent = allFlavors.length;
    }
    
    if (allFlavors.length === 0) {
        flavorsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #6b7280;"><i class="fas fa-palette" style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;"></i><p style="font-size: 18px; margin-bottom: 10px;">No flavors found</p><p style="font-size: 14px; opacity: 0.7;">Flavors will appear here when you add products with flavors</p></div>';
        return;
    }
    
    flavorsList.innerHTML = allFlavors.map((flavor, index) => {
        // Count how many products use this flavor
        const productCount = products.filter(product => {
            if (product.flavors && Array.isArray(product.flavors)) {
                return product.flavors.some(f => f && f.name === flavor);
            }
            return product.flavor === flavor;
        }).length;
        
        // Escape single quotes and special characters for onclick
        const escapedFlavor = flavor.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        return `
        <div class="flavor-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin-bottom: 10px; background: #ffffff; border: 2px solid #e5e7eb; border-radius: 12px; transition: all 0.3s ease;">
            <div style="flex: 1;">
                <span style="font-weight: 600; font-size: 16px; color: #374151;">${flavor}</span>
                <span style="margin-left: 12px; font-size: 13px; color: #6b7280;">
                    <i class="fas fa-box"></i> Used in ${productCount} ${productCount === 1 ? 'product' : 'products'}
                </span>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="edit-btn" onclick="editFlavor('${escapedFlavor}', ${index})" title="Edit Flavor">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" onclick="deleteFlavor('${escapedFlavor}')" title="Delete Flavor">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
        `;
    }).join('');
}

function addFlavor() {
    const input = document.getElementById('newFlavor');
    const flavorName = input.value.trim();
    
    if (!flavorName) {
        alert('Please enter a flavor name.');
        return;
    }
    
    // Check if flavor already exists in flavors list
    let flavors = JSON.parse(localStorage.getItem('flavors') || '[]');
    if (flavors.includes(flavorName)) {
        alert('Flavor already exists!');
        input.value = '';
        return;
    }
    
    // Also check if flavor exists in products
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const existsInProducts = products.some(product => {
        if (product.flavors && Array.isArray(product.flavors)) {
            return product.flavors.some(f => f && f.name === flavorName);
        }
        return product.flavor === flavorName;
    });
    
    if (existsInProducts) {
        alert('This flavor already exists in your products! Syncing flavors list...');
        loadFlavors(); // This will sync the flavors list
        input.value = '';
        return;
    }
    
    // Add to flavors list
    flavors.push(flavorName);
    localStorage.setItem('flavors', JSON.stringify(flavors));
    input.value = '';
    loadFlavors();
    populateBrandAndFlavorSelects();
    updateDashboardStats();
    alert('Flavor added successfully! You can now use this flavor when adding/editing products.');
}

function editFlavor(flavorName, index) {
    const newName = prompt(`Edit flavor name:`, flavorName);
    if (!newName || newName.trim() === '' || newName === flavorName) {
        return;
    }
    
    const trimmedNewName = newName.trim();
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    let updated = false;
    
    // Update flavor name in all products
    products.forEach(product => {
        if (product.flavors && Array.isArray(product.flavors)) {
            product.flavors.forEach(flavor => {
                if (flavor && flavor.name === flavorName) {
                    flavor.name = trimmedNewName;
                    updated = true;
                }
            });
        } else if (product.flavor === flavorName) {
            product.flavor = trimmedNewName;
            updated = true;
        }
    });
    
    if (updated) {
        localStorage.setItem('products', JSON.stringify(products));
        loadFlavors();
        loadProductsAdmin();
        populateBrandAndFlavorSelects();
        updateDashboardStats();
        alert(`Flavor "${flavorName}" has been renamed to "${trimmedNewName}" in all products.`);
    }
}

function deleteFlavor(flavorName) {
    // Count products using this flavor
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const productsUsingFlavor = products.filter(product => {
        if (product.flavors && Array.isArray(product.flavors)) {
            return product.flavors.some(f => f && f.name === flavorName);
        }
        return product.flavor === flavorName;
    });
    
    if (productsUsingFlavor.length > 0) {
        const confirmMessage = `Warning: This flavor is used in ${productsUsingFlavor.length} product(s).\n\nDeleting this flavor will remove it from all products.\n\nAre you sure you want to delete "${flavorName}"?`;
        if (!confirm(confirmMessage)) {
            return;
        }
        
        // Remove flavor from all products
        products.forEach(product => {
            if (product.flavors && Array.isArray(product.flavors)) {
                product.flavors = product.flavors.filter(f => !(f && f.name === flavorName));
                // Update default flavor if it was deleted
                if (product.flavor === flavorName && product.flavors.length > 0) {
                    product.flavor = product.flavors[0].name;
                }
            } else if (product.flavor === flavorName) {
                product.flavor = '';
            }
        });
        
        localStorage.setItem('products', JSON.stringify(products));
        loadProductsAdmin();
    }
    
    // Remove from flavors list
    let flavors = JSON.parse(localStorage.getItem('flavors') || '[]');
    flavors = flavors.filter(f => f !== flavorName);
    localStorage.setItem('flavors', JSON.stringify(flavors));
    
    loadFlavors();
    populateBrandAndFlavorSelects();
    updateDashboardStats();
    
    if (productsUsingFlavor.length > 0) {
        alert(`Flavor "${flavorName}" has been deleted from ${productsUsingFlavor.length} product(s).`);
    } else {
        alert(`Flavor "${flavorName}" has been deleted.`);
    }
}

// Sync flavors from products - extract all unique flavors from products
function syncFlavorsFromProducts() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const allFlavorsFromProducts = new Set();
    
    products.forEach(product => {
        if (product.flavors && Array.isArray(product.flavors)) {
            product.flavors.forEach(flavor => {
                if (flavor && flavor.name) {
                    allFlavorsFromProducts.add(flavor.name);
                }
            });
        } else if (product.flavor) {
            allFlavorsFromProducts.add(product.flavor);
        }
    });
    
    // Also include existing flavors from flavors list
    const existingFlavors = JSON.parse(localStorage.getItem('flavors') || '[]');
    existingFlavors.forEach(flavor => {
        if (typeof flavor === 'string') {
            allFlavorsFromProducts.add(flavor);
        }
    });
    
    const allFlavors = Array.from(allFlavorsFromProducts).sort();
    localStorage.setItem('flavors', JSON.stringify(allFlavors));
    
    return allFlavors;
}

// Featured Products Management
function loadFeaturedProducts() {
    const featuredProducts = JSON.parse(localStorage.getItem('featuredProducts') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const grid = document.getElementById('featuredProductsGrid');
    
    if (!grid) return;
    
    // Create 4 slots for featured products
    grid.innerHTML = '';
    
    for (let i = 0; i < 4; i++) {
        const featuredProductId = featuredProducts[i] || '';
        // Improved ID matching - handle string/number conversion
        const featuredProduct = products.find(p => {
            const pId = String(p.id || '');
            const fId = String(featuredProductId || '');
            return pId === fId || pId.trim() === fId.trim();
        });
        
        const slot = document.createElement('div');
        slot.className = 'featured-product-slot';
        slot.innerHTML = `
            <div class="featured-slot-header">
                <h3>Featured Product ${i + 1}</h3>
            </div>
            <div class="featured-slot-content">
                ${featuredProduct ? `
                    <div class="featured-product-preview">
                        <img src="${getImageSource(featuredProduct.image) || ''}" alt="${featuredProduct.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="featured-placeholder" style="display: none;">
                            <i class="fas fa-image"></i>
                            <span>No Image</span>
                        </div>
                        <div class="featured-product-info">
                            <h4>${featuredProduct.name}</h4>
                            <p>--</p>
                        </div>
                        <button class="remove-featured-btn" onclick="removeFeaturedProduct(${i})">
                            <i class="fas fa-times"></i> Remove
                        </button>
                    </div>
                ` : `
                    <div class="featured-slot-empty">
                        <i class="fas fa-plus-circle"></i>
                        <p>Select a product</p>
                    </div>
                `}
                <select class="featured-product-select" id="featuredSelect${i}" onchange="previewFeaturedProduct(${i}, this.value)">
                    <option value="">-- Select Product --</option>
                    ${products.map(p => `
                        <option value="${p.id}" ${p.id === featuredProductId ? 'selected' : ''}>${p.name} - --</option>
                    `).join('')}
                </select>
            </div>
        `;
        grid.appendChild(slot);
    }
}

function previewFeaturedProduct(slotIndex, productId) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    // Improved ID matching
    const product = products.find(p => {
        const pId = String(p.id || '');
        const fId = String(productId || '');
        return pId === fId || pId.trim() === fId.trim();
    });
    const slot = document.querySelectorAll('.featured-product-slot')[slotIndex];
    
    if (!slot || !product) return;
    
    const content = slot.querySelector('.featured-slot-content');
    content.innerHTML = `
        <div class="featured-product-preview">
            <img src="${getImageSource(product.image) || ''}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="featured-placeholder" style="display: none;">
                <i class="fas fa-image"></i>
                <span>No Image</span>
            </div>
            <div class="featured-product-info">
                <h4>${product.name}</h4>
                <p>--</p>
            </div>
            <button class="remove-featured-btn" onclick="removeFeaturedProduct(${slotIndex})">
                <i class="fas fa-times"></i> Remove
            </button>
        </div>
        <select class="featured-product-select" id="featuredSelect${slotIndex}" onchange="previewFeaturedProduct(${slotIndex}, this.value)">
            <option value="">-- Select Product --</option>
            ${products.map(p => `
                <option value="${p.id}" ${p.id === productId ? 'selected' : ''}>${p.name} - $${parseFloat(p.price).toFixed(2)}</option>
            `).join('')}
        </select>
    `;
}

function removeFeaturedProduct(slotIndex) {
    const featuredProducts = JSON.parse(localStorage.getItem('featuredProducts') || '[]');
    featuredProducts[slotIndex] = '';
    localStorage.setItem('featuredProducts', JSON.stringify(featuredProducts));
    loadFeaturedProducts();
}

function saveFeaturedProducts() {
    const featuredProducts = [];
    
    for (let i = 0; i < 4; i++) {
        const select = document.getElementById(`featuredSelect${i}`);
        if (select && select.value && select.value.trim() !== '') {
            featuredProducts.push(select.value.trim());
        } else {
            featuredProducts.push('');
        }
    }
    
    // Save exactly 4 products (allow duplicates if user wants same product in multiple slots)
    const savedProducts = featuredProducts.slice(0, 4);
    
    localStorage.setItem('featuredProducts', JSON.stringify(savedProducts));
    
    // Verify what was saved
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const savedCount = savedProducts.filter(id => id && id !== '').length;
    const validCount = savedProducts.filter(id => {
        if (!id || id === '') return false;
        // Improved matching
        return products.some(p => {
            const pId = String(p.id || '');
            const fId = String(id || '');
            return pId === fId || pId.trim() === fId.trim();
        });
    }).length;
    
    let message = '';
    if (savedCount > 0 && validCount === savedCount) {
        // Get product names for confirmation
        const savedProductNames = savedProducts
            .filter(id => id && id !== '')
            .map(id => {
                const product = products.find(p => {
                    const pId = String(p.id || '');
                    const fId = String(id || '');
                    return pId === fId || pId.trim() === fId.trim();
                });
                return product ? product.name : 'Unknown';
            })
            .join(', ');
        
        message = `✅ Featured products saved successfully!\n\n${savedCount} product(s) will appear on the homepage:\n${savedProductNames}\n\n⚠️ IMPORTANT: Refresh your index.html page to see the changes!`;
    } else if (savedCount > 0) {
        message = `⚠️ Warning: ${savedCount - validCount} product(s) could not be found.\n\nPlease check your selections and try again.`;
    } else {
        message = 'ℹ️ No featured products selected.\n\nThe first 4 products will be shown as fallback on the homepage.';
    }
    
    alert(message);
    loadFeaturedProducts();
    
    // Log for debugging
    console.log('Featured Products Saved:', savedProducts);
    console.log('Valid Products Found:', validCount, 'out of', savedCount);
    
    // Log product details including images
    savedProducts.forEach((id, index) => {
        if (id && id !== '') {
            const product = products.find(p => {
                const pId = String(p.id || '');
                const fId = String(id || '');
                return pId === fId || pId.trim() === fId.trim();
            });
            if (product) {
                console.log(`Featured ${index + 1}:`, {
                    name: product.name,
                    id: product.id,
                    hasImage: !!(product.image && product.image.trim() !== ''),
                    imageType: product.image ? (product.image.startsWith('data:image') ? 'base64' : 'file/url') : 'none'
                });
            }
        }
    });
}

// Products Management
function populateBrandAndFlavorSelects() {
    const brands = getBrands();
    const brandNames = getBrandNames(brands);
    const flavors = JSON.parse(localStorage.getItem('flavors') || '[]');
    
    const brandSelect = document.getElementById('productBrand');
    
    if (brandSelect) {
        // Only show brands that are explicitly in the brands list - DO NOT auto-add from products
        brandSelect.innerHTML = '<option value="">Select Brand</option>' + 
            brandNames.map(brand => `<option value="${brand}">${brand}</option>`).join('');
        
        // Allow manual entry - user can type a brand name even if not in list
        // This prevents auto-adding brands from products
    }
}

// Flavor management functions
let flavorFieldCounter = 0;

function addFlavorField(flavorData = null) {
    const container = document.getElementById('flavorsContainer');
    if (!container) return;
    
    const flavorId = 'flavor_' + flavorFieldCounter++;
    const flavorIndex = container.children.length;
    
    const flavorDiv = document.createElement('div');
    flavorDiv.className = 'flavor-field-item';
    flavorDiv.id = flavorId;
    flavorDiv.style.cssText = 'margin-bottom: 20px; padding: 15px; border: 2px solid #e5e7eb; border-radius: 12px; background: #f9fafb;';
    
    const flavorName = flavorData ? flavorData.name : '';
    const flavorImage = (flavorData && flavorData.image) ? flavorData.image : '';
    
    flavorDiv.innerHTML = `
        <div style="display: flex; gap: 15px; align-items: flex-start; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                    <i class="fas fa-palette"></i> Flavor Name *
                </label>
                <select class="form-input flavor-name-select" style="width: 100%;" required>
                    <option value="">Select Flavor</option>
                    ${(JSON.parse(localStorage.getItem('flavors') || '[]')).map(f => 
                        `<option value="${f}" ${f === flavorName ? 'selected' : ''}>${f}</option>`
                    ).join('')}
                </select>
                <input type="text" class="form-input flavor-name-input" placeholder="Or enter custom flavor name" 
                       value="${flavorName && !(JSON.parse(localStorage.getItem('flavors') || '[]')).includes(flavorName) ? flavorName : ''}" 
                       style="width: 100%; margin-top: 8px;">
            </div>
            <div style="flex: 1; min-width: 200px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                    <i class="fas fa-image"></i> Flavor Image <small style="color: #6b7280; font-weight: normal;">(Optional)</small>
                </label>
                <input type="file" class="form-input flavor-image-input" accept="image/*" 
                       onchange="previewFlavorImage(this, '${flavorId}')">
                <div class="flavor-image-preview" id="preview_${flavorId}" style="margin-top: 10px; position: relative; display: inline-block;">
                    ${flavorImage ? `
                        <img src="${flavorImage}" style="max-width: 100px; max-height: 100px; border-radius: 8px; border: 2px solid #e5e7eb;">
                        <button type="button" onclick="removeFlavorImage('${flavorId}')" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);" title="Remove Flavor Image">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
            <div style="display: flex; align-items: flex-end;">
                <button type="button" class="cancel-btn" onclick="removeFlavorField('${flavorId}')" 
                        style="padding: 10px 15px; min-width: auto;">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(flavorDiv);
    
    // Handle flavor name select change
    const selectEl = flavorDiv.querySelector('.flavor-name-select');
    const inputEl = flavorDiv.querySelector('.flavor-name-input');
    
    selectEl.addEventListener('change', function() {
        if (this.value) {
            inputEl.value = '';
        }
    });
    
    inputEl.addEventListener('input', function() {
        if (this.value) {
            selectEl.value = '';
        }
    });
}

function removeFlavorImage(flavorId) {
    const preview = document.getElementById('preview_' + flavorId);
    if (preview) {
        preview.innerHTML = '';
        // Also clear the file input for this flavor
        const flavorDiv = document.getElementById(flavorId);
        if (flavorDiv) {
            const fileInput = flavorDiv.querySelector('.flavor-image-input');
            if (fileInput) fileInput.value = '';
        }
    }
}

function removeFlavorField(flavorId) {
    const flavorDiv = document.getElementById(flavorId);
    if (flavorDiv) {
        flavorDiv.remove();
    }
}

function previewFlavorImage(input, containerId) {
    const preview = document.getElementById('preview_' + containerId);
    if (!preview) return;
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <div style="position: relative; display: inline-block;">
                    <img src="${e.target.result}" style="max-width: 100px; max-height: 100px; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <button type="button" onclick="removeFlavorImage('${containerId}')" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);" title="Remove Flavor Image">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function clearFlavorFields() {
    const container = document.getElementById('flavorsContainer');
    if (container) {
        container.innerHTML = '';
        flavorFieldCounter = 0;
    }
}

// Make functions globally available
window.addFlavorField = addFlavorField;
window.removeFlavorField = removeFlavorField;
window.removeFlavorImage = removeFlavorImage;
window.previewFlavorImage = previewFlavorImage;

function loadProductsAdmin() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const productsList = document.getElementById('productsAdminList');
    if (!productsList) return;
    
    if (products.length === 0) {
        productsList.innerHTML = '<p>No products yet. Add your first product!</p>';
    return;
  }
  
    productsList.innerHTML = products.map(product => {
        let productImg = product.image;
        if (!productImg || productImg.trim() === '') {
            if (product.flavors && Array.isArray(product.flavors) && product.flavors.length > 0 && product.flavors[0].image) {
                productImg = product.flavors[0].image;
            }
        }
        const hasImage = productImg && productImg.trim() !== '';
        const imageDisplay = hasImage 
            ? `<img src="${getImageSource(productImg)}" alt="${product.name}" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';">`
            : `<div style="width: 120px; height: 120px; background: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #9ca3af; flex-direction: column;">
                 <i class="fas fa-image" style="font-size: 32px; margin-bottom: 8px;"></i>
                 <span style="font-size: 12px; text-align: center;">No Image</span>
               </div>`;
        
        return `
        <div class="product-admin-item">
            <div class="product-admin-info">
                ${imageDisplay}
                <div style="flex: 1;">
                    <h3>${product.name}</h3>
                    <p>Brand: ${product.brand} | Flavor: ${product.flavor}</p>
                    <p style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin-top: 8px;">--</p>
                    ${!hasImage ? '<p style="color: #f59e0b; font-weight: 600; margin-top: 10px; padding: 8px; background: #fef3c7; border-radius: 6px; display: inline-block;"><i class="fas fa-exclamation-triangle"></i> Image needed - Click Edit to upload</p>' : '<p style="color: var(--success-color); font-weight: 600; margin-top: 10px; padding: 8px; background: #d1fae5; border-radius: 6px; display: inline-block;"><i class="fas fa-check-circle"></i> Image uploaded</p>'}
      </div>
      </div>
            <div class="product-admin-actions">
                <button class="edit-btn" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
      </div>
      </div>
    `;
    }).join('');
}

function showAddProductForm() {
    const modalOverlay = document.getElementById('productModal');
    clearFlavorFields();
    addFlavorField(); // Add one empty flavor field by default
    const formTitle = document.getElementById('formTitle');
    const form = document.getElementById('productForm');
    
    if (modalOverlay) modalOverlay.style.display = 'flex';
    if (formTitle) formTitle.innerHTML = '<i class="fas fa-box"></i> Add New Product';
    if (form) form.reset();
    
    document.getElementById('productId').value = '';
    document.getElementById('productImagePreview').innerHTML = '';
    document.getElementById('additionalImagesPreview').innerHTML = '';
    
    // Show upload hint again
    const uploadHint = document.querySelector('.upload-hint');
    if (uploadHint) {
        uploadHint.style.display = 'block';
    }
    
    populateBrandAndFlavorSelects();
    clearFlavorFields();
    addFlavorField(); // Add one empty flavor field by default
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

function hideProductForm() {
    const modalOverlay = document.getElementById('productModal');
    if (modalOverlay) modalOverlay.style.display = 'none';
    
    // Restore body scroll
    document.body.style.overflow = '';
}

function previewProductImage(input) {
    const file = input.files[0];
    // Reset remove flag if a new file is selected
    const removeFlag = document.getElementById('removeMainImage');
    if (removeFlag) removeFlag.value = 'false';
    
    if (!file) {
        const preview = document.getElementById('productImagePreview');
        if (preview) preview.innerHTML = '';
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        input.value = '';
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB. Please compress the image and try again.');
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('productImagePreview');
        if (preview) {
            preview.innerHTML = `
                <div style="margin-top: 15px;">
                    <p style="color: var(--success-color); font-weight: 600; margin-bottom: 10px;">
                        <i class="fas fa-check-circle"></i> Image loaded successfully
                    </p>
                    <img src="${e.target.result}" alt="Product preview" style="max-width: 100%; max-height: 300px; border-radius: 12px; border: 2px solid var(--border-color); box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="margin-top: 10px; color: var(--text-light); font-size: 13px;">
                        <i class="fas fa-eye"></i> This is how the image will appear on your website
                    </p>
                </div>
            `;
        }
        
        // Hide upload hint when image is selected
        const uploadHint = document.querySelector('.upload-hint');
        if (uploadHint) {
            uploadHint.style.display = 'none';
        }
    };
    reader.onerror = function() {
        alert('Error reading image file. Please try again.');
    };
    reader.readAsDataURL(file);
}

function removeProductImage() {
    if (confirm('Are you sure you want to remove the current product image?')) {
        document.getElementById('removeMainImage').value = 'true';
        document.getElementById('productImagePreview').innerHTML = '';
        // Also reset the file input if any
        document.getElementById('productImage').value = '';
        // Show upload hint again
        const uploadHint = document.querySelector('.upload-hint');
        if (uploadHint) {
            uploadHint.style.display = 'block';
        }
    }
}

function previewAdditionalImages(input) {
    const files = input.files;
    const preview = document.getElementById('additionalImagesPreview');
    if (!preview) return;
    
    preview.innerHTML = '';
    
    for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.appendChild(img);
        };
        reader.readAsDataURL(files[i]);
    }
}

// Handle product form submission
document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveProduct();
});

function saveProduct() {
    const productId = document.getElementById('productId').value;
    const shouldRemoveImage = document.getElementById('removeMainImage').value === 'true';
    const name = document.getElementById('productName').value.trim();
    const priceInput = document.getElementById('productPrice');
    const price = priceInput ? (priceInput.value || '0') : '0';
    const brand = document.getElementById('productBrand').value;
    const description = document.getElementById('productDescription').value.trim();
    const specs = document.getElementById('productSpecs').value.trim();
    const stock = document.getElementById('productStock').value || 0;
    const status = document.getElementById('productStatus').value;
    const imageInput = document.getElementById('productImage');
    const additionalImagesInput = document.getElementById('additionalImages');
    
    // Get flavors with images
    const flavorsContainer = document.getElementById('flavorsContainer');
    const flavorFields = flavorsContainer ? flavorsContainer.querySelectorAll('.flavor-field-item') : [];
    
    if (flavorFields.length === 0) {
        alert('Please add at least one flavor with image.');
        return;
    }
    
    // Validation (price is hidden, defaults to 0)
    if (!name || !brand) {
        alert('Please fill in all required fields.');
        return;
    }

    // Image is required for new products, optional for editing (can keep existing)
    if (!imageInput.files[0] && !productId) {
        alert('⚠️ Please upload a product image!\n\nImages must be uploaded manually. Upload an image that matches your product name (e.g., for "TYSON 2.0 7500PUFF", upload a TYSON vape product image).');
        return;
    }
    
    // Warn if editing without image
    let currentProducts = JSON.parse(localStorage.getItem('products') || '[]');
    if (productId && !imageInput.files[0]) {
        const existingProduct = currentProducts.find(p => p.id === productId);
        if (existingProduct && (!existingProduct.image || existingProduct.image.trim() === '')) {
            if (!confirm('This product has no image. Continue without uploading an image?')) {
                return;
            }
        }
    }
          
    let products = currentProducts;
    
    // Handle image upload
    const processImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    };
    
    (async () => {
        let productImage = '';
        let additionalImages = [];
        
        if (imageInput.files[0]) {
            productImage = await processImage(imageInput.files[0]);
        } else if (productId && !shouldRemoveImage) {
            const existingProduct = products.find(p => p.id === productId);
            if (existingProduct) {
                productImage = existingProduct.image;
                additionalImages = existingProduct.additionalImages || [];
            }
        } else if (shouldRemoveImage) {
            productImage = '';
            // When removing main image, also consider if we want to remove additional images
            // For now let's just clear the main image as requested
        }
        
        if (additionalImagesInput.files.length > 0) {
            const promises = Array.from(additionalImagesInput.files).map(file => processImage(file));
            additionalImages = await Promise.all(promises);
        }
        
        // Process flavors (images are optional)
        const flavors = [];
        for (const flavorField of flavorFields) {
            const selectEl = flavorField.querySelector('.flavor-name-select');
            const inputEl = flavorField.querySelector('.flavor-name-input');
            const imageInputEl = flavorField.querySelector('.flavor-image-input');
            const previewEl = flavorField.querySelector('.flavor-image-preview img');
            
            const flavorName = selectEl.value || inputEl.value.trim();
            if (!flavorName) continue; // Skip if no flavor name
            
            let flavorImage = '';
            
            if (imageInputEl.files && imageInputEl.files[0]) {
                flavorImage = await processImage(imageInputEl.files[0]);
            } else if (previewEl) {
                flavorImage = previewEl.src;
            }
            
            // Add flavor even without image
            flavors.push({
                name: flavorName,
                image: flavorImage || '' // Empty string if no image
            });
        }
        
        if (flavors.length === 0) {
            alert('Please add at least one flavor.');
            return;
        }
        
        // Keep backward compatibility: use first flavor as default flavor
        const defaultFlavor = flavors[0].name;
        
        const productData = {
            id: productId || Date.now().toString(),
            name,
            price: parseFloat(price),
            brand,
            flavor: defaultFlavor, // Keep for backward compatibility
            flavors: flavors, // New: array of flavors with images
            description,
            specs: specs ? specs.split('\n').filter(s => s.trim()) : [],
            stock: parseInt(stock),
            status,
            image: productImage,
            additionalImages
        };
        
        if (productId) {
            // Update existing product
            const index = products.findIndex(p => p.id === productId);
            if (index !== -1) {
                products[index] = productData;
            }
  } else {
            // Add new product
            products.push(productData);
        }
        
        // IMPORTANT: Do NOT automatically add brand to brands list
        // Brands must be added manually through the Brands Management section
        // This prevents brands from being auto-created when products are saved
        // Even if product.brand exists, do NOT add it to brands list automatically
        
        localStorage.setItem('products', JSON.stringify(products));
        loadProductsAdmin();
        loadFeaturedProducts(); // Reload featured products in case product was updated
        hideProductForm();
        updateDashboardStats();
        
        const imageMsg = productImage ? 'Product and image saved successfully! The image will appear on your website.' : 'Product saved successfully!';
        alert(imageMsg);
    })();
}

function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        alert('Product not found!');
    return;
  }

    // Populate form
    document.getElementById('productId').value = product.id;
    document.getElementById('removeMainImage').value = 'false';
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productBrand').value = product.brand;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productSpecs').value = (product.specs || []).join('\n');
    document.getElementById('productStock').value = product.stock || 0;
    document.getElementById('productStatus').value = product.status || 'available';
    
    // Clear and populate flavors
    clearFlavorFields();
    if (product.flavors && Array.isArray(product.flavors) && product.flavors.length > 0) {
        // Use flavors array if available
        product.flavors.forEach(flavor => {
            addFlavorField(flavor);
        });
    } else if (product.flavor) {
        // Fallback to single flavor (backward compatibility)
        addFlavorField({
            name: product.flavor,
            image: product.image || ''
        });
    } else {
        // Add one empty flavor field
        addFlavorField();
    }
    
    // Show previews
    const mainPreview = document.getElementById('productImagePreview');
    if (mainPreview) {
        if (product.image && product.image.trim() !== '') {
            mainPreview.innerHTML = `
                <div style="margin-top: 15px; position: relative; display: inline-block;">
                    <p style="color: var(--success-color); font-weight: 600; margin-bottom: 10px;">
                        <i class="fas fa-check-circle"></i> Current product image
                    </p>
                    <div style="position: relative;">
                        <img src="${getImageSource(product.image)}" alt="Product preview" style="max-width: 100%; max-height: 300px; border-radius: 12px; border: 2px solid var(--border-color); box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <button type="button" onclick="removeProductImage()" style="position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);" title="Remove Image">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <p style="margin-top: 10px; color: var(--text-light); font-size: 13px;">
                        <i class="fas fa-info-circle"></i> Upload a new image to replace this one or click trash to remove
                    </p>
                </div>
            `;
            // Hide upload hint when editing with existing image
            const uploadHint = document.querySelector('.upload-hint');
            if (uploadHint) {
                uploadHint.style.display = 'none';
            }
        } else {
            mainPreview.innerHTML = '';
            // Show upload hint if no image
            const uploadHint = document.querySelector('.upload-hint');
            if (uploadHint) {
                uploadHint.style.display = 'block';
            }
        }
    }
    
    const additionalPreview = document.getElementById('additionalImagesPreview');
    if (additionalPreview && product.additionalImages) {
        additionalPreview.innerHTML = product.additionalImages.map(img => 
            `<img src="${getImageSource(img)}" alt="Additional image">`
        ).join('');
    }
    
    populateBrandAndFlavorSelects();
    
    // Set form values after populating selects
    setTimeout(() => {
        const brandEl = document.getElementById('productBrand');
        if (brandEl) brandEl.value = product.brand;
    }, 100);
    
    const modalOverlay = document.getElementById('productModal');
    const formTitle = document.getElementById('formTitle');
    
    if (modalOverlay) modalOverlay.style.display = 'flex';
    if (formTitle) formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Product';
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    products = products.filter(p => p.id !== productId);
    localStorage.setItem('products', JSON.stringify(products));
    loadProductsAdmin();
    loadFeaturedProducts(); // Reload featured products in case deleted product was featured
    updateDashboardStats();
    alert('Product deleted successfully!');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('isAdminLoggedIn');
        } catch (e) {}
        window.location.href = 'login.html';
    }
}

// Legacy export/import/backup functionality removed as requested

// Simple modal helpers for product/brand/flavor forms
function openProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'flex';
    showAddProductForm();
}
function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'none';
    hideProductForm();
}
function openBrandModal() {
    const modal = document.getElementById('brandModal');
    if (modal) modal.style.display = 'flex';
}
function closeBrandModal() {
    const modal = document.getElementById('brandModal');
    if (modal) modal.style.display = 'none';
}
function openFlavorModal() {
    const modal = document.getElementById('flavorModal');
    if (modal) modal.style.display = 'flex';
}
function closeFlavorModal() {
    const modal = document.getElementById('flavorModal');
    if (modal) modal.style.display = 'none';
}
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.openBrandModal = openBrandModal;
window.closeBrandModal = closeBrandModal;
window.openFlavorModal = openFlavorModal;
window.closeFlavorModal = closeFlavorModal;
window.removeProductImage = removeProductImage;

// Database Import/Export Management
// Excel Import/Export Functions - New Implementation

// Comprehensive data clearance
function clearAllData() {
    // Create a custom confirmation dialog
    const confirmed = confirm(
        '⚠️ CRITICAL WARNING: This will PERMANENTLY DELETE ALL:\n\n' +
        '• All Products & Inventory\n' +
        '• All Brands & Sub-brands\n' +
        '• All Flavors & Brand-Flavor mappings\n' +
        '• Featured Products & Slider Images\n' +
        '• Cart Data & Store Settings\n' +
        '• User Accounts (except default admin)\n\n' +
        'This action CANNOT be undone!\n\n' +
        'Are you absolutely sure you want to continue?'
    );
    
    if (!confirmed) {
        return;
    }
    
    // Second confirmation
    const doubleConfirmed = confirm(
        '⚠️ FINAL WARNING!\n\n' +
        'You are about to delete EVERYTHING from the local database.\n\n' +
        'Click OK to proceed or Cancel to abort.'
    );
    
    if (!doubleConfirmed) {
        return;
    }

    try {
        // Clear all known localStorage items
        const keysToClear = [
            'products', 
            'brands', 
            'flavors', 
            'brandFlavors', 
            'brandSubBrands', 
            'featuredProducts', 
            'cart', 
            'sliderImages',
            'storeName',
            'users',
            'currentUser',
            'productViewMode',
            'version',
            'isLoggedIn',
            'lastViewedBrand',
            'lastUpdateMessageTime'
        ];
        
        keysToClear.forEach(key => localStorage.removeItem(key));
        
        // Reset essential structures to empty
        localStorage.setItem('products', '[]');
        localStorage.setItem('brands', '[]');
        localStorage.setItem('flavors', '[]');
        localStorage.setItem('brandFlavors', '{}');
        localStorage.setItem('brandSubBrands', '{}');
        localStorage.setItem('featuredProducts', '[]');
        localStorage.setItem('cart', '[]');
        
        // Set manual clear flag to prevent auto-initialization from app.js
        localStorage.setItem('dataManuallyCleared', 'true');
        
        alert('✅ All data cleared successfully!\n\nThe database has been completely wiped clean.');
        
        // Redirect to index or reload
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Clear All Data Error:', error);
        alert('❌ Error clearing data. Please try again.');
    }
}

function clearDatabase() {
    clearAllData();
}

// Trigger Excel import file input
function triggerExcelImport() {
    const input = document.getElementById('excelImportInput');
    if (input) input.click();
}

// Handle Excel file import
function handleExcelImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let workbook;
            const data = e.target.result;
            
            // Check if it's CSV or Excel
            if (file.name.endsWith('.csv')) {
                // Parse CSV using SheetJS (handles quoted fields properly)
                workbook = XLSX.read(data, { type: 'string' });
                // If CSV only has one sheet, rename it to 'Products' for consistency
                if (workbook.SheetNames.length === 1 && workbook.SheetNames[0] !== 'Products') {
                    const oldName = workbook.SheetNames[0];
                    workbook.SheetNames[0] = 'Products';
                    workbook.Sheets['Products'] = workbook.Sheets[oldName];
                    delete workbook.Sheets[oldName];
                }
            } else {
                // Parse Excel file using SheetJS
                workbook = XLSX.read(data, { type: 'binary' });
            }

            // Process Products sheet
            let productsData = [];
            const productsSheetName = workbook.SheetNames.find(name => 
                name.toLowerCase() === 'products' || name.toLowerCase() === 'product'
            ) || workbook.SheetNames[0]; // Use first sheet if no Products sheet found
            
            if (productsSheetName && workbook.Sheets[productsSheetName]) {
                const worksheet = workbook.Sheets[productsSheetName];
                const sheetData = XLSX.utils.sheet_to_json(worksheet);
                
                productsData = sheetData.map((row, index) => {
                    const slugify = (s) => String(s || '').toLowerCase().trim().replace(/\s+/g, '-');
                    const getValue = (obj, keys) => {
                        for (const key of keys) {
                            const val = obj[key] || obj[key.toLowerCase()] || obj[key.toUpperCase()];
                            if (val !== undefined && val !== null && val !== '') return String(val).trim();
                        }
                        return '';
                    };
                    
                    // Generate ID if not provided
                    const id = getValue(row, ['id', 'ID', 'Id', 'product_id', 'Product ID']) || 
                              `product-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`;
                    
                    // Get product name (required)
                    const name = getValue(row, ['product name', 'Product Name', 'name', 'Name', 'product_name', 'Product']);
                    if (!name) return null; // Skip rows without product name
                    
                    // Get brand (required)
                    const brand = getValue(row, ['brand', 'Brand', 'manufacturer', 'Manufacturer']);
                    
                    // Get price
                    const price = parseFloat(getValue(row, ['price', 'Price', 'cost', 'Cost']) || '0') || 0;
                    
                    // Get stock
                    const stock = parseInt(getValue(row, ['stock', 'Stock', 'quantity', 'Quantity', 'qty']) || '0') || 0;
                    
                    // Get status (simplified parsing)
                    const statusRaw = getValue(row, ['status', 'Status', 'availability', 'Availability']).toLowerCase();
                    let status = 'available';
                    if (statusRaw.includes('out') || statusRaw.includes('unavailable') || statusRaw === 'out-of-stock') {
                        status = 'out-of-stock';
                    } else if (statusRaw.includes('coming') || statusRaw.includes('soon') || statusRaw === 'coming-soon') {
                        status = 'coming-soon';
                    }
                    
                    // Get description
                    const description = getValue(row, ['description', 'Description', 'desc', 'Desc', 'details', 'Details']);
                    
                    // Get image URL
                    const image = getValue(row, ['image url', 'Image URL', 'image', 'Image', 'img', 'Img', 'image_url']);
                    
                    // Parse flavors - NEW SIMPLIFIED FORMAT: comma-separated
                    let flavors = [];
                    const flavorsStr = getValue(row, ['flavors', 'Flavors', 'flavour', 'Flavour', 'flavours', 'Flavours']);
                    if (flavorsStr) {
                        // Split by comma and clean up
                        const flavorList = flavorsStr.split(',').map(f => f.trim()).filter(f => f);
                        flavors = flavorList.map(f => ({ name: f, image: '' }));
                    }
                    
                    // If no flavors found, try single flavor field
                    if (flavors.length === 0) {
                        const singleFlavor = getValue(row, ['flavor', 'Flavor']);
                        if (singleFlavor) {
                            flavors = [{ name: singleFlavor, image: '' }];
                        }
                    }
                    
                    // Default flavor if none provided
                    if (flavors.length === 0) {
                        flavors = [{ name: 'Default', image: '' }];
                    }
                    
                    // Parse specifications - NEW FORMAT: pipe-separated or comma-separated
                    let specs = [];
                    const specsStr = getValue(row, ['specifications', 'Specifications', 'specs', 'Specs', 'spec', 'Spec']);
                    if (specsStr) {
                        // Try pipe separator first (recommended), then comma
                        if (specsStr.includes('|')) {
                            specs = specsStr.split('|').map(s => s.trim()).filter(s => s);
                        } else {
                            specs = specsStr.split(',').map(s => s.trim()).filter(s => s);
                        }
                    }
                    
                    // Parse additional images - comma-separated
                    let additionalImages = [];
                    const addImagesStr = getValue(row, ['additional images', 'Additional Images', 'additional_images', 'images', 'Images', 'photos', 'Photos']);
                    if (addImagesStr) {
                        additionalImages = addImagesStr.split(',').map(img => img.trim()).filter(img => img);
                    }
                    
                    return {
                        id,
                        name,
                        brand: brand || 'Unbranded',
                        price,
                        stock,
                        status,
                        description,
                        image,
                        flavors,
                        flavor: flavors[0].name, // First flavor as default
                        additionalImages,
                        specs
                    };
                }).filter(p => p && p.name); // Filter out null/empty products
            }

            // Process Brands sheet
            let brandsData = [];
            const brandsSheetName = workbook.SheetNames.find(name => 
                name.toLowerCase() === 'brands' || name.toLowerCase() === 'brand'
            );
            
            if (brandsSheetName && workbook.Sheets[brandsSheetName]) {
                const worksheet = workbook.Sheets[brandsSheetName];
                const sheetData = XLSX.utils.sheet_to_json(worksheet);
                
                brandsData = sheetData.map(row => {
                    const getValue = (obj, keys) => {
                        for (const key of keys) {
                            const val = obj[key] || obj[key.toLowerCase()] || obj[key.toUpperCase()];
                            if (val !== undefined && val !== null && val !== '') return String(val).trim();
                        }
                        return '';
                    };
                    return getValue(row, ['name', 'Name', 'brand', 'Brand', 'brand_name', 'Brand Name']);
                }).filter(b => b);
            }

            // Process Flavors sheet
            let flavorsData = [];
            const flavorsSheetName = workbook.SheetNames.find(name => 
                name.toLowerCase() === 'flavors' || name.toLowerCase() === 'flavor' || name.toLowerCase() === 'flavours'
            );
            
            if (flavorsSheetName && workbook.Sheets[flavorsSheetName]) {
                const worksheet = workbook.Sheets[flavorsSheetName];
                const sheetData = XLSX.utils.sheet_to_json(worksheet);
                
                flavorsData = sheetData.map(row => {
                    const getValue = (obj, keys) => {
                        for (const key of keys) {
                            const val = obj[key] || obj[key.toLowerCase()] || obj[key.toUpperCase()];
                            if (val !== undefined && val !== null && val !== '') return String(val).trim();
                        }
                        return '';
                    };
                    return getValue(row, ['name', 'Name', 'flavor', 'Flavor', 'flavour', 'Flavour', 'flavor_name', 'Flavor Name']);
                }).filter(f => f);
            }

            // Merge with existing data
            const slugify = (s) => String(s || '').toLowerCase().trim().replace(/\s+/g, '-');
            
            // Merge brands
            const existingBrands = getBrands();
            const brandMap = new Map();
            existingBrands.forEach(b => {
                const name = b.name || b;
                brandMap.set(slugify(name), { name: name, displayOrder: b.displayOrder || existingBrands.length });
            });
            brandsData.forEach((brandName, idx) => {
                if (!brandName) return;
                const key = slugify(brandName);
                if (!brandMap.has(key)) {
                    brandMap.set(key, { name: brandName, displayOrder: existingBrands.length + idx + 1 });
                }
            });
            // Also extract brands from products
            productsData.forEach(p => {
                if (p.brand) {
                    const key = slugify(p.brand);
                    if (!brandMap.has(key)) {
                        brandMap.set(key, { name: p.brand, displayOrder: brandMap.size + 1 });
                    }
                }
            });
            const mergedBrands = Array.from(brandMap.values());
            localStorage.setItem('brands', JSON.stringify(mergedBrands));

            // Merge flavors
            const existingFlavors = JSON.parse(localStorage.getItem('flavors') || '[]');
            const flavorSet = new Set();
            existingFlavors.forEach(f => {
                const name = typeof f === 'string' ? f : (f && f.name) ? f.name : '';
                if (name) flavorSet.add(slugify(name));
            });
            flavorsData.forEach(f => {
                if (f) flavorSet.add(slugify(f));
            });
            // Also extract flavors from products
            productsData.forEach(p => {
                if (p.flavors && Array.isArray(p.flavors)) {
                    p.flavors.forEach(f => {
                        const name = typeof f === 'string' ? f : (f && f.name) ? f.name : '';
                        if (name) flavorSet.add(slugify(name));
                    });
                }
            });
            const mergedFlavors = Array.from(flavorSet).map(f => ({ name: f.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }));
            localStorage.setItem('flavors', JSON.stringify(mergedFlavors));

            // Merge products (skip duplicates: if product already exists, ignore imported row)
            const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
            const productMap = new Map();
            const keyOf = (p) => {
                const pid = String(p.id || '').trim();
                if (pid) return pid;
                return `${slugify(p.name)}|${slugify(p.brand)}`;
            };
            existingProducts.forEach(p => {
                productMap.set(keyOf(p), p);
            });
            
            let skippedDuplicates = 0;
            productsData.forEach(p => {
                const key = keyOf(p);
                if (productMap.has(key)) {
                    // Existing product found; skip this imported item
                    skippedDuplicates++;
                    return;
                }
                productMap.set(key, p);
            });
            
            const mergedProducts = Array.from(productMap.values());
            localStorage.setItem('products', JSON.stringify(mergedProducts));
            localStorage.removeItem('dataManuallyCleared');
            
            alert(`✅ Import successful!\n\nProducts processed: ${productsData.length}\nProducts added: ${productsData.length - skippedDuplicates}\nProducts skipped (already existed): ${skippedDuplicates}\nTotal products after import: ${mergedProducts.length}\nBrands: ${mergedBrands.length}\nFlavors: ${mergedFlavors.length}`);
            location.reload();
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing Excel file. Please ensure the file format is correct.\n\nRequired sheets: Products (required), Brands (optional), Flavors (optional)');
        }
    };
    
    // Read file based on type
    if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsBinaryString(file);
    }
    event.target.value = '';
}

// Export to Excel with Products, Brands, and Flavors - Simplified Format
function exportToExcel() {
    try {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const brands = getBrands();
        const flavors = JSON.parse(localStorage.getItem('flavors') || '[]');

        // Prepare Products data with simplified format
        // Flavors are comma-separated, easy to edit in Excel
        const productsData = products.map(p => ({
            'Product Name': p.name || '',
            'Brand': p.brand || '',
            'Flavors': Array.isArray(p.flavors) ? p.flavors.map(f => typeof f === 'string' ? f : f.name).join(', ') : (p.flavor || ''),
            'Price': p.price || 0,
            'Stock': p.stock || 0,
            'Status': p.status || 'available',
            'Description': p.description || '',
            'Image URL': p.image || '',
            'Specifications': Array.isArray(p.specs) ? p.specs.join(' | ') : '',
            'Additional Images': Array.isArray(p.additionalImages) ? p.additionalImages.join(', ') : ''
        }));

        // Create workbook with single Products sheet (brands and flavors auto-extracted)
        const workbook = XLSX.utils.book_new();
        
        // Add Products sheet (main sheet - brands and flavors extracted automatically)
        const productsSheet = XLSX.utils.json_to_sheet(productsData);
        
        // Set column widths for better readability
        const colWidths = [
            { wch: 35 }, // Product Name
            { wch: 15 }, // Brand
            { wch: 40 }, // Flavors
            { wch: 10 }, // Price
            { wch: 10 }, // Stock
            { wch: 12 }, // Status
            { wch: 50 }, // Description
            { wch: 40 }, // Image URL
            { wch: 40 }, // Specifications
            { wch: 40 }  // Additional Images
        ];
        productsSheet['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products');
        
        // Optional: Add separate sheets for reference (can be ignored during import)
        if (brands.length > 0) {
            const brandsData = brands.map(b => ({
                'Brand Name': b.name || b || ''
            }));
            const brandsSheet = XLSX.utils.json_to_sheet(brandsData);
            XLSX.utils.book_append_sheet(workbook, brandsSheet, 'Brands (Reference)');
        }
        
        if (flavors.length > 0) {
            const flavorsData = flavors.map(f => ({
                'Flavor Name': typeof f === 'string' ? f : (f && f.name) ? f.name : ''
            }));
            const flavorsSheet = XLSX.utils.json_to_sheet(flavorsData);
            XLSX.utils.book_append_sheet(workbook, flavorsSheet, 'Flavors (Reference)');
        }

        // Generate filename with timestamp
        const ts = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `store-data-${ts}.xlsx`;

        // Write and download
        XLSX.writeFile(workbook, filename);
        
        alert(`✅ Excel file exported successfully!\n\nFilename: ${filename}\n\n📋 Format:\n• Products sheet: All product data\n• Brands & Flavors: Auto-extracted from products\n• Easy to edit: Just modify the Products sheet\n\nProducts: ${productsData.length}`);
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting to Excel. Please try again.');
    }
}

// Download Excel template - Simplified Format
function downloadExcelTemplate() {
    try {
        // Sample data for template - Simple format
        const productsData = [
            {
                'Product Name': 'Geek Bar Pulse X 25000 Puffs 5pk',
                'Brand': 'Geek Bar',
                'Flavors': 'Blue Razz Ice, Mint, Orange, Watermelon Ice',
                'Price': 62.50,
                'Stock': 100,
                'Status': 'available',
                'Description': 'Premium disposable vape with 25000 puffs. Features rechargeable battery and 18mL e-liquid capacity.',
                'Image URL': 'https://example.com/image.jpg',
                'Specifications': '25000 Puffs | Rechargeable | 18mL E-liquid | 5% Nicotine',
                'Additional Images': 'https://example.com/img1.jpg, https://example.com/img2.jpg'
            },
            {
                'Product Name': 'RAZ LTX 25000 Puffs 5pk',
                'Brand': 'RAZ',
                'Flavors': 'Blue Razz Ice, Strawberry Ice, Watermelon Ice',
                'Price': 57.50,
                'Stock': 50,
                'Status': 'available',
                'Description': 'High-capacity disposable vape with exceptional flavor variety.',
                'Image URL': 'https://example.com/raz-image.jpg',
                'Specifications': '25000 Puffs | Pre-filled | 5 Devices per pack',
                'Additional Images': ''
            }
        ];

        // Create workbook
        const workbook = XLSX.utils.book_new();
        
        // Add Products sheet with proper formatting
        const productsSheet = XLSX.utils.json_to_sheet(productsData);
        
        // Set column widths
        const colWidths = [
            { wch: 35 }, // Product Name
            { wch: 15 }, // Brand
            { wch: 40 }, // Flavors
            { wch: 10 }, // Price
            { wch: 10 }, // Stock
            { wch: 12 }, // Status
            { wch: 50 }, // Description
            { wch: 40 }, // Image URL
            { wch: 40 }, // Specifications
            { wch: 40 }  // Additional Images
        ];
        productsSheet['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products');

        // Write and download
        XLSX.writeFile(workbook, 'store-data-template.xlsx');
        
        alert('✅ Excel template downloaded!\n\nFilename: store-data-template.xlsx\n\n📋 Instructions:\n1. Fill in the Products sheet\n2. Separate multiple flavors with commas\n3. Brands and flavors are auto-extracted\n4. Status: available, out-of-stock, or coming-soon\n5. Import the file when ready!');
    } catch (error) {
        console.error('Template error:', error);
        alert('Error generating template. Please try again.');
    }
}
// Initialize products from code (only if products don't exist)
// This ensures products are available when folder is moved to another PC
function initializeProductsFromCode() {
    // Respect manual clear flag: do not auto-initialize after clearing
    const manuallyCleared = localStorage.getItem('dataManuallyCleared') === 'true';
    if (manuallyCleared) {
        console.log('Manual clear flag set, skipping product initialization');
        return;
    }
    // Check if products already exist
    const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
    if (existingProducts.length > 0) {
        console.log('Products already exist, skipping initialization');
        return; // Products already exist, don't initialize
    }

    console.log('Initializing products with embedded images...');

    // Helper function to get embedded image
    function getProductImage(imagePath) {
        if (!imagePath) return '';
        
        // Try to get from embedded images first
        if (typeof getEmbeddedImage === 'function') {
            // Try with original path, then without images/ prefix
            let embedded = getEmbeddedImage(imagePath);
            if (!embedded && imagePath.startsWith('images/')) {
                embedded = getEmbeddedImage(imagePath.replace(/^images\//, ''));
            }
            if (embedded) return embedded;
        }
        
        // Fallback to regular image path
        return imagePath.startsWith('images/') ? imagePath : 'images/' + imagePath;
    }

    const products = window.INITIAL_PRODUCTS || [];

    // Save products to localStorage
    localStorage.setItem('products', JSON.stringify(products));
    
    // Initialize brands from products (only unique brands, don't overwrite existing)
    const uniqueBrands = [...new Set(products.map(p => p.brand))];
    const existingBrands = getBrands(); // Get normalized brands
    const existingBrandNames = getBrandNames(existingBrands);
    const brandsToAdd = uniqueBrands.filter(b => !existingBrandNames.includes(b));
    if (brandsToAdd.length > 0) {
        const maxOrder = existingBrands.length > 0 
            ? Math.max(...existingBrands.map(b => b.displayOrder || 0))
            : 0;
        const newBrands = brandsToAdd.map((brand, index) => ({
            name: brand,
            displayOrder: maxOrder + index + 1
        }));
        localStorage.setItem('brands', JSON.stringify([...existingBrands, ...newBrands]));
    }

    // Initialize flavors from products (only unique flavors, don't overwrite existing)
    const allFlavorsFromProducts = products.flatMap(p =>
        p.flavors ? p.flavors.map(f => typeof f === 'string' ? f : f.name) : []
    );
    const uniqueFlavors = [...new Set(allFlavorsFromProducts.filter(f => f))];
    const existingFlavors = JSON.parse(localStorage.getItem('flavors') || '[]');
    const existingFlavorNames = existingFlavors.map(f => typeof f === 'string' ? f : f.name);
    const flavorsToAdd = uniqueFlavors.filter(f => !existingFlavorNames.includes(f));

    if (flavorsToAdd.length > 0) {
        const newFlavors = flavorsToAdd.map(flavor => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: flavor
        }));
        localStorage.setItem('flavors', JSON.stringify([...existingFlavors, ...newFlavors]));
    }

    // Initialize brand-flavor relationships
    const brandFlavors = JSON.parse(localStorage.getItem('brandFlavors') || '{}');
    let brandFlavorsUpdated = false;

    products.forEach(product => {
        if (product.brand && product.flavors) {
            if (!brandFlavors[product.brand]) {
                brandFlavors[product.brand] = [];
            }

            const flavorNames = product.flavors.map(f => typeof f === 'string' ? f : f.name);
            flavorNames.forEach(flavor => {
                if (!brandFlavors[product.brand].includes(flavor)) {
                    brandFlavors[product.brand].push(flavor);
                    brandFlavorsUpdated = true;
                }
            });
        }
    });

    if (brandFlavorsUpdated) {
        localStorage.setItem('brandFlavors', JSON.stringify(brandFlavors));
    }

    console.log(`✅ Admin: Initialized ${products.length} products successfully!`);
}

// Note: initializeProductsFromCode() is called in DOMContentLoaded event





// Make functions available globally
window.triggerExcelImport = triggerExcelImport;
window.handleExcelImport = handleExcelImport;
window.exportToExcel = exportToExcel;
window.downloadExcelTemplate = downloadExcelTemplate;
window.clearDatabase = clearDatabase;
window.clearAllData = clearAllData;
window.editFlavor = editFlavor;
window.deleteFlavor = deleteFlavor;
window.addFlavor = addFlavor;
window.syncFlavorsFromProducts = syncFlavorsFromProducts;
