// Admin Panel Functions

// Initialize admin page
document.addEventListener('DOMContentLoaded', function() {
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
    const brands = JSON.parse(localStorage.getItem('brands') || '[]');
    const flavors = JSON.parse(localStorage.getItem('flavors') || '[]');
    const sliderImages = JSON.parse(localStorage.getItem('sliderImages') || '[]');
    
    const totalProductsEl = document.getElementById('totalProducts');
    const totalBrandsEl = document.getElementById('totalBrands');
    const totalFlavorsEl = document.getElementById('totalFlavors');
    const totalSlidersEl = document.getElementById('totalSliders');
    
    if (totalProductsEl) totalProductsEl.textContent = products.length;
    if (totalBrandsEl) totalBrandsEl.textContent = brands.length;
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

// Brands Management
function loadBrands() {
    const brands = JSON.parse(localStorage.getItem('brands') || '[]');
    const brandSubBrands = JSON.parse(localStorage.getItem('brandSubBrands') || '{}');
    const brandsList = document.getElementById('brandsList');
    if (!brandsList) return;
    
    brandsList.innerHTML = brands.map((brand, index) => {
        const subBrands = brandSubBrands[brand] || [];
        const subBrandsList = subBrands.length > 0 
            ? `<div class="sub-brands-list">
                 <strong>Sub-brands:</strong>
                 <ul>
                   ${subBrands.map(sb => `<li>${sb}</li>`).join('')}
                 </ul>
               </div>`
            : '<div class="sub-brands-list"><em>No sub-brands</em></div>';
        
        return `
            <div class="brand-item">
                <div class="brand-info">
                    <span class="brand-name"><strong>${brand}</strong></span>
                    ${subBrandsList}
                </div>
                <button class="delete-btn" onclick="deleteBrand(${index})">Delete</button>
            </div>
        `;
    }).join('');
}

function addBrand() {
    const input = document.getElementById('newBrand');
    const brandName = input.value.trim();
    
    if (!brandName) {
        alert('Please enter a brand name.');
    return;
  }
  
    let brands = JSON.parse(localStorage.getItem('brands') || '[]');
    if (brands.includes(brandName)) {
        alert('Brand already exists!');
    return;
  }
  
    brands.push(brandName);
    localStorage.setItem('brands', JSON.stringify(brands));
    input.value = '';
    loadBrands();
    populateBrandAndFlavorSelects();
    updateDashboardStats();
    alert('Brand added successfully!');
}

function deleteBrand(index) {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    
    let brands = JSON.parse(localStorage.getItem('brands') || '[]');
    
    // Get the brand name before deleting
    const deletedBrand = brands[index];
    
    // Remove the brand from the array
    brands.splice(index, 1);
    localStorage.setItem('brands', JSON.stringify(brands));
    
    // Also remove from brandSubBrands if it exists
    let brandSubBrands = JSON.parse(localStorage.getItem('brandSubBrands') || '{}');
    if (brandSubBrands[deletedBrand]) {
        delete brandSubBrands[deletedBrand];
        localStorage.setItem('brandSubBrands', JSON.stringify(brandSubBrands));
    }
    
    // IMPORTANT: Do NOT automatically recreate brands from products
    // Brands are only added manually - this prevents auto-recreation
    
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
                        <img src="${featuredProduct.image || ''}" alt="${featuredProduct.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
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
            <img src="${product.image || ''}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
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
    const brands = JSON.parse(localStorage.getItem('brands') || '[]');
    const flavors = JSON.parse(localStorage.getItem('flavors') || '[]');
    
    const brandSelect = document.getElementById('productBrand');
    
    if (brandSelect) {
        // Only show brands that are explicitly in the brands list - DO NOT auto-add from products
        brandSelect.innerHTML = '<option value="">Select Brand</option>' + 
            brands.map(brand => `<option value="${brand}">${brand}</option>`).join('');
        
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
    const flavorImage = flavorData ? flavorData.image : '';
    
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
                    <i class="fas fa-image"></i> Flavor Image *
                </label>
                <input type="file" class="form-input flavor-image-input" accept="image/*" 
                       onchange="previewFlavorImage(this, '${flavorId}')" required>
                <div class="flavor-image-preview" id="preview_${flavorId}" style="margin-top: 10px;">
                    ${flavorImage ? `<img src="${flavorImage}" style="max-width: 100px; max-height: 100px; border-radius: 8px; border: 2px solid #e5e7eb;">` : ''}
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
            preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100px; max-height: 100px; border-radius: 8px; border: 2px solid #e5e7eb;">`;
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
        const hasImage = product.image && product.image.trim() !== '';
        const imageDisplay = hasImage 
            ? `<img src="${product.image}" alt="${product.name}" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div style="display: none; width: 120px; height: 120px; background: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 12px; align-items: center; justify-content: center; color: #9ca3af; flex-direction: column;">
                 <i class="fas fa-image" style="font-size: 32px; margin-bottom: 8px;"></i>
                 <span style="font-size: 12px;">Image Error</span>
               </div>`
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
    const formContainer = document.getElementById('productFormContainer');
    clearFlavorFields();
    addFlavorField(); // Add one empty flavor field by default
    const formTitle = document.getElementById('formTitle');
    const form = document.getElementById('productForm');
    
    if (formContainer) formContainer.style.display = 'block';
    if (formTitle) formTitle.textContent = 'Add New Product';
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
    formContainer.scrollIntoView({ behavior: 'smooth' });
}

function hideProductForm() {
    const formContainer = document.getElementById('productFormContainer');
    if (formContainer) formContainer.style.display = 'none';
}

function previewProductImage(input) {
    const file = input.files[0];
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
    if (productId && !imageInput.files[0]) {
        const existingProduct = products.find(p => p.id === productId);
        if (existingProduct && (!existingProduct.image || existingProduct.image.trim() === '')) {
            if (!confirm('This product has no image. Continue without uploading an image?')) {
                return;
            }
        }
    }
          
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    
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
        } else if (productId) {
            const existingProduct = products.find(p => p.id === productId);
            if (existingProduct) {
                productImage = existingProduct.image;
                additionalImages = existingProduct.additionalImages || [];
            }
        }
        
        if (additionalImagesInput.files.length > 0) {
            const promises = Array.from(additionalImagesInput.files).map(file => processImage(file));
            additionalImages = await Promise.all(promises);
        }
        
        // Process flavors with images
        const flavors = [];
        for (const flavorField of flavorFields) {
            const selectEl = flavorField.querySelector('.flavor-name-select');
            const inputEl = flavorField.querySelector('.flavor-name-input');
            const imageInputEl = flavorField.querySelector('.flavor-image-input');
            const previewEl = flavorField.querySelector('.flavor-image-preview img');
            
            const flavorName = selectEl.value || inputEl.value.trim();
            let flavorImage = '';
            
            if (imageInputEl.files && imageInputEl.files[0]) {
                flavorImage = await processImage(imageInputEl.files[0]);
            } else if (previewEl) {
                flavorImage = previewEl.src;
            }
            
            if (flavorName && flavorImage) {
                flavors.push({
                    name: flavorName,
                    image: flavorImage
                });
            }
        }
        
        if (flavors.length === 0) {
            alert('Please add at least one flavor with image.');
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
                <div style="margin-top: 15px;">
                    <p style="color: var(--success-color); font-weight: 600; margin-bottom: 10px;">
                        <i class="fas fa-check-circle"></i> Current product image
                    </p>
                    <img src="${product.image}" alt="Product preview" style="max-width: 100%; max-height: 300px; border-radius: 12px; border: 2px solid var(--border-color); box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="margin-top: 10px; color: var(--text-light); font-size: 13px;">
                        <i class="fas fa-info-circle"></i> Upload a new image to replace this one
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
            `<img src="${img}" alt="Additional image">`
        ).join('');
    }
    
    populateBrandAndFlavorSelects();
    
    // Set form values after populating selects
    setTimeout(() => {
        document.getElementById('productBrand').value = product.brand;
        document.getElementById('productFlavor').value = product.flavor;
    }, 100);
    
    const formContainer = document.getElementById('productFormContainer');
    const formTitle = document.getElementById('formTitle');
    
    if (formContainer) formContainer.style.display = 'block';
    if (formTitle) formTitle.textContent = 'Edit Product';
    
    formContainer.scrollIntoView({ behavior: 'smooth' });
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
        sessionStorage.removeItem('isAdminLoggedIn');
        sessionStorage.removeItem('adminUsername');
        window.location.href = 'login.html';
    }
}

// Data Export/Import Functions
function exportData() {
    try {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const sliderImages = JSON.parse(localStorage.getItem('sliderImages') || '[]');
        const featuredProducts = JSON.parse(localStorage.getItem('featuredProducts') || '[]');
        
        // Convert base64 images to file references
        const productsWithFileRefs = products.map((product, index) => {
            const productCopy = { ...product };
            if (product.image && product.image.startsWith('data:image')) {
                // Image is base64 - will be exported as file
                productCopy.imageFile = `images/product-${product.id || index}.jpg`;
                productCopy._imageData = product.image; // Keep for file export
            } else if (product.image && !product.image.startsWith('images/')) {
                // External URL - keep as is
                productCopy.image = product.image;
            }
            // Remove base64 from main data
            if (productCopy._imageData) {
                delete productCopy.image;
            }
            return productCopy;
        });
        
        const sliderImagesWithRefs = sliderImages.map((img, index) => {
            if (img && img.startsWith('data:image')) {
                return {
                    file: `images/slider-${index + 1}.jpg`,
                    _imageData: img
                };
            }
            return img;
        });
        
        const data = {
            storeName: localStorage.getItem('storeName') || 'Premium Store',
            products: productsWithFileRefs,
            brands: JSON.parse(localStorage.getItem('brands') || '[]'),
            flavors: JSON.parse(localStorage.getItem('flavors') || '[]'),
            sliderImages: sliderImagesWithRefs,
            featuredProducts: featuredProducts,
            exportDate: new Date().toISOString(),
            version: '2.0',
            hasImages: true
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `store-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Also export images as separate files
        exportImagesAsFiles(products, sliderImages);
        
        alert('Data exported successfully!\n\n1. Save the JSON file\n2. Copy the downloaded images to an "images" folder\n3. Copy both to your new computer in the same folder structure');
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting data. Please try again.');
    }
}

// Export images as separate downloadable files
function exportImagesAsFiles(products, sliderImages) {
    let delay = 0;
    
    // Export product images with delay between downloads
    products.forEach((product, index) => {
        if (product.image && product.image.startsWith('data:image')) {
            setTimeout(() => {
                try {
                    const base64Data = product.image.split(',')[1];
                    const mimeMatch = product.image.match(/data:image\/(\w+);base64/);
                    const mimeType = mimeMatch ? mimeMatch[1] : 'jpg';
                    const byteCharacters = atob(base64Data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: `image/${mimeType}` });
                    
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `product-${product.id || index}.${mimeType}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(() => URL.revokeObjectURL(url), 100);
                } catch (error) {
                    console.error('Error exporting product image:', error);
                }
            }, delay);
            delay += 200; // 200ms delay between each download
        }
    });
    
    // Export slider images
    sliderImages.forEach((img, index) => {
        if (img && img.startsWith('data:image')) {
            setTimeout(() => {
                try {
                    const base64Data = img.split(',')[1];
                    const mimeMatch = img.match(/data:image\/(\w+);base64/);
                    const mimeType = mimeMatch ? mimeMatch[1] : 'jpg';
                    const byteCharacters = atob(base64Data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: `image/${mimeType}` });
                    
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `slider-${index + 1}.${mimeType}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(() => URL.revokeObjectURL(url), 100);
                } catch (error) {
                    console.error('Error exporting slider image:', error);
                }
            }, delay);
            delay += 200;
        }
    });
}

function importData(input) {
    const file = input.files[0];
    if (!file) return;
    
    if (!confirm('Importing data will replace all current data. Make sure images are in the "images" folder. Continue?')) {
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!data.version) {
                alert('Invalid data file. Please make sure you are importing a valid export file.');
                input.value = '';
                return;
            }
            
            // Process products - use file references if available, fallback to base64
            if (data.products && Array.isArray(data.products)) {
                const processedProducts = data.products.map(product => {
                    const processed = { ...product };
                    // If imageFile exists, use it (images should be in images folder)
                    if (processed.imageFile) {
                        processed.image = processed.imageFile;
                        delete processed.imageFile;
                    }
                    // If _imageData exists (old format), use it
                    if (processed._imageData) {
                        processed.image = processed._imageData;
                        delete processed._imageData;
                    }
                    // If image is already a path or URL, keep it
                    return processed;
                });
                localStorage.setItem('products', JSON.stringify(processedProducts));
            }
            
            // Process slider images
            if (data.sliderImages && Array.isArray(data.sliderImages)) {
                const processedSliders = data.sliderImages.map((img, index) => {
                    if (typeof img === 'object' && img.file) {
                        // New format with file reference
                        return img.file;
                    } else if (typeof img === 'object' && img._imageData) {
                        // Old format with base64
                        return img._imageData;
                    }
                    return img; // Already a URL or path
                });
                localStorage.setItem('sliderImages', JSON.stringify(processedSliders));
            }
            
            // Import other data
            if (data.storeName) {
                localStorage.setItem('storeName', data.storeName);
            }
            
            if (data.brands && Array.isArray(data.brands)) {
                localStorage.setItem('brands', JSON.stringify(data.brands));
            }
            
            if (data.flavors && Array.isArray(data.flavors)) {
                localStorage.setItem('flavors', JSON.stringify(data.flavors));
            }
            
            if (data.featuredProducts && Array.isArray(data.featuredProducts)) {
                localStorage.setItem('featuredProducts', JSON.stringify(data.featuredProducts));
            }
            
            // Reload all admin sections
            loadStoreSettings();
            loadSliderImages();
            loadBrands();
            loadFlavors();
            loadProductsAdmin();
            loadFeaturedProducts();
            populateBrandAndFlavorSelects();
            updateDashboardStats();
            
            alert('Data imported successfully!\n\nNote: If images are not showing, make sure the "images" folder with all image files is in the same directory as your HTML files.');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing data. Please make sure the file is a valid export file.');
        }
        
        input.value = '';
    };
    
    reader.onerror = function() {
        alert('Error reading file. Please try again.');
        input.value = '';
    };
    
    reader.readAsText(file);
}

function createBackup() {
    try {
        const data = {
            storeName: localStorage.getItem('storeName') || 'Premium Store',
            products: JSON.parse(localStorage.getItem('products') || '[]'),
            brands: JSON.parse(localStorage.getItem('brands') || '[]'),
            flavors: JSON.parse(localStorage.getItem('flavors') || '[]'),
            sliderImages: JSON.parse(localStorage.getItem('sliderImages') || '[]'),
            featuredProducts: JSON.parse(localStorage.getItem('featuredProducts') || '[]'),
            cart: JSON.parse(localStorage.getItem('cart') || '[]'),
            exportDate: new Date().toISOString(),
            version: '2.0',
            type: 'backup'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `store-backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('Backup created successfully!');
    } catch (error) {
        console.error('Backup error:', error);
        alert('Error creating backup. Please try again.');
    }
}

// Clear all products, brands, sub-brands, and flavors
function clearAllData() {
    if (!confirm('⚠️ WARNING: This will delete ALL products, brands, sub-brands, and flavors!\n\nThis action cannot be undone. Are you absolutely sure?')) {
        return;
    }
    
    // Double confirmation
    if (!confirm('This is your last chance. Click OK to permanently delete:\n- All products/items\n- All brands\n- All sub-brands\n- All flavors')) {
        return;
    }
    
    try {
        // Clear products
        localStorage.setItem('products', JSON.stringify([]));
        
        // Clear brands
        localStorage.setItem('brands', JSON.stringify([]));
        
        // Clear brand-sub-brand mappings
        localStorage.setItem('brandSubBrands', JSON.stringify({}));
        
        // Clear flavors
        localStorage.setItem('flavors', JSON.stringify([]));
        
        // Also clear featured products since they depend on products
        localStorage.setItem('featuredProducts', JSON.stringify([]));
        
        // Set a flag to prevent auto-initialization of default brands
        localStorage.setItem('dataManuallyCleared', 'true');
        
        // Reload all displays
        loadProductsAdmin();
        loadBrands();
        loadFlavors();
        loadFeaturedProducts();
        populateBrandAndFlavorSelects();
        updateDashboardStats();
        
        alert('✅ All data cleared successfully! You can now manually add brands, sub-brands, flavors, and products again.');
    } catch (error) {
        console.error('Clear data error:', error);
        alert('Error clearing data. Please try again.');
    }
}

// Export Products to JSON/CSV/Excel
function exportProducts() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    if (products.length === 0) {
        alert('No products to export!');
        return;
    }
    
    // Ask user for export format
    const formatChoice = prompt(
        'Choose export format:\n' +
        '1 - JSON\n' +
        '2 - CSV\n' +
        '3 - Excel (.xlsx)\n\n' +
        'Enter 1, 2, or 3:'
    );
    
    if (!formatChoice) return;
    
    const format = formatChoice.trim();
    const dateStr = new Date().toISOString().split('T')[0];
    
    if (format === '1') {
        // Export as JSON
        const dataStr = JSON.stringify(products, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `products_export_${dateStr}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert(`Successfully exported ${products.length} products to JSON file!`);
    } else if (format === '2') {
        // Export as CSV
        const headers = ['ID', 'Name', 'Brand', 'Flavor', 'Price', 'Stock', 'Status', 'Image'];
        const csvRows = [headers.join(',')];
        
        products.forEach(product => {
            const row = [
                product.id || '',
                `"${(product.name || '').replace(/"/g, '""')}"`,
                `"${(product.brand || '').replace(/"/g, '""')}"`,
                `"${(product.flavor || '').replace(/"/g, '""')}"`,
                product.price || '0',
                product.stock || '0',
                product.status || 'available',
                `"${(product.image || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        });
        
        const csvContent = csvRows.join('\n');
        const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `products_export_${dateStr}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert(`Successfully exported ${products.length} products to CSV file!`);
    } else if (format === '3') {
        // Export as Excel
        if (typeof XLSX === 'undefined') {
            alert('Excel library not loaded. Please refresh the page and try again.');
            return;
        }
        
        try {
            // Prepare data for Excel
            const worksheetData = [
                ['ID', 'Name', 'Brand', 'Flavor', 'Price', 'Stock', 'Status', 'Image']
            ];
            
            products.forEach(product => {
                worksheetData.push([
                    product.id || '',
                    product.name || '',
                    product.brand || '',
                    product.flavor || '',
                    product.price || 0,
                    product.stock || 0,
                    product.status || 'available',
                    product.image || ''
                ]);
            });
            
            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(worksheetData);
            
            // Set column widths
            ws['!cols'] = [
                { wch: 15 }, // ID
                { wch: 30 }, // Name
                { wch: 15 }, // Brand
                { wch: 20 }, // Flavor
                { wch: 10 }, // Price
                { wch: 10 }, // Stock
                { wch: 12 }, // Status
                { wch: 40 }  // Image
            ];
            
            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Products');
            
            // Generate Excel file
            XLSX.writeFile(wb, `products_export_${dateStr}.xlsx`);
            alert(`Successfully exported ${products.length} products to Excel file!`);
        } catch (error) {
            console.error('Excel export error:', error);
            alert('Error exporting to Excel: ' + error.message);
        }
    } else {
        alert('Invalid format choice. Please enter 1, 2, or 3.');
    }
}

// Import Products from JSON/CSV
function importProducts() {
    const fileInput = document.getElementById('importFileInput');
    if (fileInput) {
        fileInput.click();
    }
}

// Handle file import
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    const fileName = file.name.toLowerCase();
    
    // Handle Excel files separately (binary)
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        if (typeof XLSX === 'undefined') {
            alert('Excel library not loaded. Please refresh the page and try again.');
            event.target.value = '';
            return;
        }
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Get first worksheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convert to JSON array
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                    header: 1,
                    defval: ''
                });
                
                if (jsonData.length < 2) {
                    alert('Invalid Excel file! File must contain header and at least one product.');
                    event.target.value = '';
                    return;
                }
                
                // Get headers (first row)
                const headers = jsonData[0].map(h => String(h).trim());
                const importedProducts = [];
                
                // Process rows (skip header row)
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row || row.length === 0) continue;
                    
                    const product = {};
                    headers.forEach((header, index) => {
                        const value = row[index];
                        const cleanValue = value !== undefined && value !== null ? String(value).trim() : '';
                        
                        if (cleanValue === '') return;
                        
                        switch(header.toLowerCase()) {
                            case 'id':
                                product.id = cleanValue;
                                break;
                            case 'name':
                                product.name = cleanValue;
                                break;
                            case 'brand':
                                product.brand = cleanValue;
                                break;
                            case 'flavor':
                                product.flavor = cleanValue;
                                break;
                            case 'price':
                                product.price = parseFloat(cleanValue) || 0;
                                break;
                            case 'stock':
                                product.stock = parseInt(cleanValue) || 0;
                                break;
                            case 'status':
                                product.status = cleanValue || 'available';
                                break;
                            case 'image':
                                product.image = cleanValue;
                                break;
                        }
                    });
                    
                    if (product.name) {
                        if (!product.id) {
                            product.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                        }
                        importedProducts.push(product);
                    }
                }
                
                if (importedProducts.length === 0) {
                    alert('No valid products found in Excel file!');
                    event.target.value = '';
                    return;
                }
                
                const action = confirm(
                    `Found ${importedProducts.length} products.\n\n` +
                    'Click OK to MERGE with existing products (duplicates will be skipped).\n' +
                    'Click Cancel to REPLACE all existing products.'
                );
                
                if (action) {
                    mergeProducts(importedProducts);
                } else {
                    if (confirm('Are you sure you want to REPLACE all existing products? This cannot be undone!')) {
                        replaceProducts(importedProducts);
                    }
                }
                
                event.target.value = '';
            } catch (error) {
                console.error('Excel import error:', error);
                alert('Error importing Excel file: ' + error.message);
                event.target.value = '';
            }
        };
        
        reader.readAsArrayBuffer(file);
        return;
    }
    
    // Handle JSON and CSV files (text)
    reader.onload = function(e) {
        try {
            if (fileName.endsWith('.json')) {
                // Import JSON
                const importedProducts = JSON.parse(e.target.result);
                
                if (!Array.isArray(importedProducts)) {
                    alert('Invalid JSON format! Expected an array of products.');
                    return;
                }
                
                if (importedProducts.length === 0) {
                    alert('The file contains no products!');
                    return;
                }
                
                const action = confirm(
                    `Found ${importedProducts.length} products.\n\n` +
                    'Click OK to MERGE with existing products (duplicates will be skipped).\n' +
                    'Click Cancel to REPLACE all existing products.'
                );
                
                if (action) {
                    // Merge mode
                    mergeProducts(importedProducts);
                } else {
                    // Replace mode
                    if (confirm('Are you sure you want to REPLACE all existing products? This cannot be undone!')) {
                        replaceProducts(importedProducts);
                    }
                }
            } else if (fileName.endsWith('.csv')) {
                // Import CSV
                const csvContent = e.target.result;
                const lines = csvContent.split('\n').filter(line => line.trim());
                
                if (lines.length < 2) {
                    alert('Invalid CSV format! File must contain header and at least one product.');
                    return;
                }
                
                const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
                const importedProducts = [];
                
                for (let i = 1; i < lines.length; i++) {
                    const values = parseCSVLine(lines[i]);
                    if (values.length === 0) continue;
                    
                    const product = {};
                    headers.forEach((header, index) => {
                        const value = values[index] || '';
                        const cleanValue = value.replace(/^"|"$/g, '').replace(/""/g, '"');
                        
                        switch(header.toLowerCase()) {
                            case 'id':
                                product.id = cleanValue;
                                break;
                            case 'name':
                                product.name = cleanValue;
                                break;
                            case 'brand':
                                product.brand = cleanValue;
                                break;
                            case 'flavor':
                                product.flavor = cleanValue;
                                break;
                            case 'price':
                                product.price = parseFloat(cleanValue) || 0;
                                break;
                            case 'stock':
                                product.stock = parseInt(cleanValue) || 0;
                                break;
                            case 'status':
                                product.status = cleanValue || 'available';
                                break;
                            case 'image':
                                product.image = cleanValue;
                                break;
                        }
                    });
                    
                    if (product.name) {
                        if (!product.id) {
                            product.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                        }
                        importedProducts.push(product);
                    }
                }
                
                if (importedProducts.length === 0) {
                    alert('No valid products found in CSV file!');
                    return;
                }
                
                const action = confirm(
                    `Found ${importedProducts.length} products.\n\n` +
                    'Click OK to MERGE with existing products (duplicates will be skipped).\n' +
                    'Click Cancel to REPLACE all existing products.'
                );
                
                if (action) {
                    mergeProducts(importedProducts);
                } else {
                    if (confirm('Are you sure you want to REPLACE all existing products? This cannot be undone!')) {
                        replaceProducts(importedProducts);
                    }
                }
            } else {
                alert('Unsupported file format! Please use .json, .csv, or .xlsx/.xls files.');
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing file: ' + error.message);
        }
        
        // Reset file input
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

// Parse CSV line handling quoted values
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current);
    return values;
}

// Merge imported products with existing ones
function mergeProducts(importedProducts) {
    let existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
    let added = 0;
    let skipped = 0;
    
    importedProducts.forEach(imported => {
        // Check for duplicates by ID or name+brand combination
        const isDuplicate = existingProducts.some(existing => 
            existing.id === imported.id || 
            (existing.name === imported.name && existing.brand === imported.brand)
        );
        
        if (!isDuplicate) {
            if (!imported.id) {
                imported.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            }
            existingProducts.push(imported);
            added++;
        } else {
            skipped++;
        }
    });
    
    // IMPORTANT: Do NOT automatically add brands from imported products
    // Brands must be added manually through the Brands Management section
    // This prevents brands from being auto-created when products are imported
    
    localStorage.setItem('products', JSON.stringify(existingProducts));
    loadProductsAdmin();
    updateDashboardStats();
    alert(`Import completed!\n\nAdded: ${added} products\nSkipped: ${skipped} duplicates\n\nNote: Brands are NOT automatically added. Add brands manually in the Brands Management section if needed.`);
}

// Replace all existing products
function replaceProducts(importedProducts) {
    // Generate IDs for products that don't have them
    importedProducts.forEach(product => {
        if (!product.id) {
            product.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        }
    });
    
    // IMPORTANT: Do NOT automatically extract and add brands from imported products
    // Brands must be added manually through the Brands Management section
    // This prevents brands from being auto-created when products are replaced
    
    localStorage.setItem('products', JSON.stringify(importedProducts));
    loadProductsAdmin();
    updateDashboardStats();
    alert(`Successfully replaced all products with ${importedProducts.length} imported products!\n\nNote: Brands are NOT automatically added. Add brands manually in the Brands Management section if needed.`);
}

// Initialize products from code (only if products don't exist)
// This ensures products are available when folder is moved to another PC
function initializeProductsFromCode() {
    // Check if products already exist
    const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
    if (existingProducts.length > 0) {
        return; // Products already exist, don't initialize
    }

    const products = [
        // YOVO Products
        {
            id: 'yovo_jb50000_pod_5pk',
            name: 'YOVO JB50000 Pod 5pk',
            brand: 'YOVO',
            price: 42.50,
            stock: 100,
            status: 'available',
            flavor: 'Blue Razz Ice',
            flavors: [
                { name: 'Blue Razz Ice', image: 'images/yovo/yovo_jb50000_pod_5pk.jpg' },
                { name: 'Fresh Mint', image: 'images/yovo/yovo_jb50000_pod_5pk.jpg' },
                { name: 'Infinite Swirl', image: 'images/yovo/yovo_jb50000_pod_5pk.jpg' },
                { name: 'Miami Mint', image: 'images/yovo/yovo_jb50000_pod_5pk.jpg' },
                { name: 'Orange Ice', image: 'images/yovo/yovo_jb50000_pod_5pk.jpg' },
                { name: 'Peach Raspberry', image: 'images/yovo/yovo_jb50000_pod_5pk.jpg' },
                { name: 'Sour Apple', image: 'images/yovo/yovo_jb50000_pod_5pk.jpg' },
                { name: 'Sour Strawberry', image: 'images/yovo/yovo_jb50000_pod_5pk.jpg' },
                { name: 'Triple Berry', image: 'images/yovo/yovo_jb50000_pod_5pk.jpg' },
                { name: 'Watermelon Ice', image: 'images/yovo/yovo_jb50000_pod_5pk.jpg' }
            ],
            image: 'images/yovo/yovo_jb50000_pod_5pk.jpg',
            description: 'YOVO JB50000 Pod 5pk - Premium vaping experience with long-lasting pods. Master Case: 20 x 5pk.',
            specs: ['50000 Puffs', '5 Pods per pack', 'Rechargeable']
        },
        {
            id: 'yovo_jb50000_kit_5pk',
            name: 'YOVO JB50000 Kit 5pk',
            brand: 'YOVO',
            price: 50.00,
            stock: 100,
            status: 'available',
            flavor: 'Miami Mint',
            flavors: [{
                name: 'Miami Mint',
                image: 'images/yovo/yovo_jb50000_kit_5pk.jpg'
            }],
            image: 'images/yovo/yovo_jb50000_kit_5pk.jpg',
            description: 'YOVO JB50000 Kit 5pk - Complete starter kit with 5 pods. Master Case: 18 x 5pk.',
            specs: ['50000 Puffs', '5 Kits per pack', 'Complete Starter Kit']
        },

        // Geek Bar Products
        {
            id: 'geek_bar_pulse_x_25000',
            name: 'Geek Bar Pulse X 25000 Puffs 5pk',
            brand: 'Geek Bar',
            price: 62.50,
            stock: 100,
            status: 'available',
            flavor: 'Orange Mint',
            flavors: [
                { name: 'Orange Mint', image: 'images/geek bar/Geek Bar Pulse X 25000 Puffs 5pk/Geek Bar Pulse X 25000 Puffs 5pk.jpg' },
                { name: 'Blue Razz Ice', image: 'images/geek bar/Geek Bar Pulse X 25000 Puffs 5pk/Geek Bar Pulse X 25000 Puffs 5pk.jpg' }
            ],
            image: 'images/geek bar/Geek Bar Pulse X 25000 Puffs 5pk/Geek Bar Pulse X 25000 Puffs 5pk.jpg',
            description: 'Geek Bar Pulse X 25000 Puffs - World\'s first 3D curved screen with advanced technology. Experience ultimate vaping pleasure with 18mL e-liquid, 5% (50mg) nicotine strength, and 820mAh battery capacity.',
            specs: ['25000 Puffs', '5 Devices per pack', '3D Curved Screen', 'Rechargeable', '18mL E-liquid', '5% (50mg) Nicotine', '820mAh Battery']
        },
        {
            id: 'geek_bar_meloso_max_9000',
            name: 'Geek Bar Meloso Max 9000 Puffs 5pk',
            brand: 'Geek Bar',
            price: 32.50,
            stock: 100,
            status: 'available',
            flavor: 'Ginger Ale',
            flavors: [
                { name: 'Ginger Ale', image: 'images/geek bar/GEEK BAR/geek_bar_meloso_max_9000_puffs.jpg' },
                { name: 'Tropical Rainbow', image: 'images/geek bar/GEEK BAR/geek_bar_meloso_max_9000_puffs.jpg' }
            ],
            image: 'images/geek bar/GEEK BAR/geek_bar_meloso_max_9000_puffs.jpg',
            description: 'Geek Bar Meloso Max 9000 is loaded with 14mL of nic salt e-liquid and powered by a 600mAh battery, ensuring robust performance. The dual mesh coils deliver rich clouds and authentic flavors, while the adjustable airflow lets you customize your vaping style.',
            specs: ['9000 Puffs per disposable', '14mL e-liquid capacity', '5% nicotine strength (50mg/mL)', '600mAh battery capacity', 'Dual mesh coils', 'Adjustable airflow', '5 Devices per pack']
        },
        {
            id: 'ria_nv_30000',
            name: 'RIA NV 30000 Puffs 5pk',
            brand: 'RIA',
            price: 62.50,
            stock: 100,
            status: 'available',
            flavor: 'Watermelon Ice',
            flavors: [{
                name: 'Watermelon Ice',
                image: 'images/ria/ria_nv_30000_puffs_5pk.jpg'
            }],
            image: 'images/ria/ria_nv_30000_puffs_5pk.jpg',
            description: 'RIA NV 30000 Puffs - High capacity disposable vape with exceptional flavor.',
            specs: ['30000 Puffs', '5 Devices per pack', 'Pre-filled']
        },
        {
            id: 'digi_flavor_brk_battery',
            name: 'Digi Flavor BRK Battery 5pk',
            brand: 'Digi Flavor',
            price: 33.75,
            stock: 100,
            status: 'available',
            flavor: 'Standard',
            flavors: [{
                name: 'Standard',
                image: 'images/digi flavor/digi_flavor_brk_battery_5pk.jpg'
            }],
            image: 'images/digi flavor/digi_flavor_brk_battery_5pk.jpg',
            description: 'Digi Flavor BRK Battery 5pk - Rechargeable battery pack for DripFlavor devices.',
            specs: ['Rechargeable Battery', '5 Batteries per pack', 'Compatible with DripFlavor']
        },

        // VIHO Products
        {
            id: 'viho_trx_50000',
            name: 'VIHO TRX 50000 Puffs 5pk',
            brand: 'VIHO',
            price: 52.50,
            stock: 100,
            status: 'available',
            flavor: 'Blue Razz Ice',
            flavors: [
                { name: 'Banana Taffy Ice', image: 'images/viho/VIHO TRX 50K/viho_trx_50k_banana_taffy_ice.jpg' },
                { name: 'Blue Razz Ice', image: 'images/viho/VIHO TRX 50K/viho_trx_50k_blue_razz_ice.jpg' },
                { name: 'Clear', image: 'images/viho/VIHO TRX 50K/viho_trx_50k_blue_razz_ice.jpg' },
                { name: 'Cherry Strazz', image: 'images/viho/VIHO TRX 50K/viho_trx_50k_blue_razz_ice.jpg' },
                { name: 'Cola Slurpee', image: 'images/viho/VIHO TRX 50K/viho_trx_50k_blue_razz_ice.jpg' },
                { name: 'Christmas Edition - Blue Razz Ice', image: 'images/viho/VIHO TRX 50K/viho_trx_50k_blue_razz_ice.jpg' },
                { name: 'Icy Mint', image: 'images/viho/VIHO TRX 50K/viho_trx_50k_blue_razz_ice.jpg' },
                { name: 'Lemon Refresher', image: 'images/viho/VIHO TRX 50K/viho_trx_50k_blue_razz_ice.jpg' },
                { name: 'Mango Tango', image: 'images/viho/VIHO TRX 50K/viho_trx_50k_blue_razz_ice.jpg' },
                { name: 'Pina Coco', image: 'images/viho/VIHO TRX 50K/viho_trx_50k_blue_razz_ice.jpg' },
                { name: 'Sour Blue Dust', image: 'images/viho/VIHO TRX 50K/viho_trx_50k_blue_razz_ice.jpg' },
                { name: 'Strawmelon Ice', image: 'images/viho/VIHO TRX 50K/viho_trx_50k_blue_razz_ice.jpg' },
                { name: 'Tobacco', image: 'images/viho/VIHO TRX 50K/viho_trx_50k_blue_razz_ice.jpg' },
                { name: 'White Gummy Ice', image: 'images/viho/VIHO TRX 50K/viho_trx_50k_blue_razz_ice.jpg' }
            ],
            image: 'images/viho/VIHO TRX 50K/viho_trx_50k_blue_razz_ice.jpg',
            description: 'VIHO TRX 50000 Puffs - Ultra-long lasting disposable vape with premium quality. Master Case: 20 x 5pk.',
            specs: ['50000 Puffs', '5 Devices per pack', 'Pre-filled', '100% E-Liquid', '100% Battery']
        },
        {
            id: 'viho_supercharge_pro_20000',
            name: 'VIHO Supercharge PRO 20,000 Puffs 5pk',
            brand: 'VIHO',
            price: 45.00,
            stock: 100,
            status: 'available',
            flavor: 'Tobacco Mint',
            flavors: [{
                name: 'Tobacco Mint',
                image: 'images/viho/Viho 20K 0915/viho_supercharge_pro_spearmint.jpg'
            }],
            image: 'images/viho/Viho 20K 0915/viho_supercharge_pro_spearmint.jpg',
            description: 'VIHO Supercharge PRO 20000 Puffs - High-performance disposable vape with refreshing mint flavor.',
            specs: ['20000 Puffs', '5 Devices per pack', 'Pre-filled', '100% E-Liquid', '100% Battery']
        },

        // JUUL Products
        {
            id: 'juul_pods',
            name: 'JUUL Pods',
            brand: 'JUUL',
            price: 38.95,
            stock: 100,
            status: 'available',
            flavor: 'Menthol',
            flavors: [{
                name: 'Menthol',
                image: 'images/juul/juul_pods_menthol.jpg'
            }],
            image: 'images/juul/juul_pods_menthol.jpg',
            description: 'JUUL Pods - Classic JUUL pods with 5.0% nicotine, 4 pods per pack.',
            specs: ['5.0% Nicotine', '4 Pods per pack', 'Menthol flavor', 'Compatible with JUUL device']
        },

        // RAZ Products
        {
            id: 'raz_rx_50000',
            name: 'RAZ RX 50000 Puffs 5pk',
            brand: 'RAZ',
            price: 57.50,
            stock: 100,
            status: 'available',
            flavor: 'Code Blue',
            flavors: [
                { name: 'Code Blue', image: 'images/raz/raz_rx_50000_puffs_5pk.jpg' },
                { name: 'Code White', image: 'images/raz/raz_rx_50000_puffs_5pk.jpg' }
            ],
            image: 'images/raz/raz_rx_50000_puffs_5pk.jpg',
            description: 'RAZ RX 50000 Puffs - Advanced disposable vape with screen display showing battery and puff count. Master Case: 30 x 5pk.',
            specs: ['50000 Puffs', '5 Devices per pack', 'Digital Display', 'Pre-filled']
        },
        {
            id: 'ryl_classic_35000',
            name: 'RYL Classic 35000 Puffs 5pk',
            brand: 'RYL',
            price: 43.75,
            stock: 100,
            status: 'available',
            flavor: 'Watermelon Ice',
            flavors: [{
                name: 'Watermelon Ice',
                image: 'images/ryl/ryl_classic_35000_puffs_5pk.jpg'
            }],
            image: 'images/ryl/ryl_classic_35000_puffs_5pk.jpg',
            description: 'RYL Classic 35000 Puffs - Classic design with premium performance and flavor.',
            specs: ['35000 Puffs', '5 Devices per pack', 'Pre-filled', 'Classic Design']
        },
        {
            id: 'raz_ltx_25000',
            name: 'RAZ LTX 25000 Puffs 5pk',
            brand: 'RAZ',
            price: 57.50,
            stock: 100,
            status: 'available',
            flavor: 'Bangin Sour Berries',
            flavors: [
                { name: 'Bangin Sour Berries', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_bangin_sour_berries.jpg' },
                { name: 'Black Cherry Peach', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_black_cherry_peach.jpg' },
                { name: 'Blue Raz Ice', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'Blue Raz Gush', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'Blueberry Watermelon', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blueberry_watermelon.jpg' },
                { name: 'Cherry Strapple', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_cherry_strapple.jpg' },
                { name: 'Georgia Peach', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'Hawaiian Punch', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'Iced Blue Dragon', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'Miami Mint', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'New York Mint', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'Night Crawler', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'Orange Pineapple Punch', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'Raspberry Limeade', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'Sour Apple Ice', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'Sour Raspberry Punch', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'Strawberry Burst', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'Strawberry Kiwi Pear', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'Strawberry Peach Gush', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'Triple Berry Gush', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'Triple Berry Punch', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'Tropical Gush', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'White Grape Gush', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'Wintergreen', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' }
            ],
            image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg',
            description: 'RAZ LTX 25000 Puffs - Premium disposable vape with exceptional flavor variety. Master Case: 30 x 5pk.',
            specs: ['25000 Puffs', '5 Devices per pack', 'Pre-filled']
        },
        {
            id: 'raz_ltx_25000_zero',
            name: 'RAZ LTX 25000 Puffs 0% Nicotine 5pk',
            brand: 'RAZ',
            price: 57.50,
            stock: 100,
            status: 'available',
            flavor: 'Bangin Sour Berries',
            flavors: [
                { name: 'Bangin Sour Berries', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_bangin_sour_berries.jpg' },
                { name: 'Blueberry Watermelon', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blueberry_watermelon.jpg' },
                { name: 'New York Mint', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' },
                { name: 'Razzle Dazzle', image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg' }
            ],
            image: 'images/raz/RAZ LTX 25K/raz_ltx_25000_blue_raz_ice.jpg',
            description: 'RAZ LTX 25000 Puffs 0% Nicotine - Zero nicotine option with full flavor experience. Price Increase July 25, 2025. Master Case: 30 x 5pk.',
            specs: ['25000 Puffs', '0% Nicotine', '5 Devices per pack', 'Pre-filled', 'Zero Nicotine']
        },
        {
            id: 'raz_tn9000_zero',
            name: 'RAZ TN9000 0% Nicotine 5pk',
            brand: 'RAZ',
            price: 48.75,
            stock: 100,
            status: 'available',
            flavor: 'Watermelon Ice',
            flavors: [{
                name: 'Watermelon Ice',
                image: 'images/raz/RAZ TN9000/raz_tn9000_watermelon_ice_zero.jpg'
            }],
            image: 'images/raz/RAZ TN9000/raz_tn9000_watermelon_ice_zero.jpg',
            description: 'RAZ TN9000 0% Nicotine - Zero nicotine disposable vape with refreshing watermelon ice flavor.',
            specs: ['9000 Puffs', '0% Nicotine', '5 Devices per pack', 'Pre-filled', 'Zero Nicotine']
        },

        // Air Bar Products
        {
            id: 'air_bar_nex_6500',
            name: 'Air Bar Nex 6500 Puffs',
            brand: 'Air Bar',
            price: 75.00,
            stock: 100,
            status: 'available',
            flavor: 'Clear',
            flavors: [
                { name: 'Clear', image: 'images/air bar/air_bar_nex_6500_puffs.jpg' },
                { name: 'Cool Mint', image: 'images/air bar/air_bar_nex_6500_puffs.jpg' },
                { name: 'Strawberry Mango', image: 'images/air bar/air_bar_nex_6500_puffs.jpg' }
            ],
            image: 'images/air bar/air_bar_nex_6500_puffs.jpg',
            description: 'Air Bar Nex 6500 Puffs - Compact and powerful disposable vape. NOTE: DAILY LIMIT PRODUCT. ONLY 1 ORDER PER DAY. Price Increase Sept 22, 2025.',
            specs: ['6500 Puffs', 'Pre-filled', 'Disposable', 'Daily Limit: 1 Order Per Day']
        },
        {
            id: 'air_bar_aura_25000',
            name: 'Air Bar Aura 25,000 Puffs 5pk',
            brand: 'Air Bar',
            price: 45.00,
            stock: 100,
            status: 'available',
            flavor: 'Blue Mint',
            flavors: [
                { name: 'Blue Mint', image: 'images/air bar/Air Bar Aura 25,000 Puffs 5pk/Air Bar Aura 25,000 Puffs 5pk (Main image).jpg' },
                { name: 'Blue Razz Ice', image: 'images/air bar/Air Bar Aura 25,000 Puffs 5pk/air_bar_aura_blue_razz_ice.jpg' },
                { name: 'Blueberry Ice', image: 'images/air bar/Air Bar Aura 25,000 Puffs 5pk/Air Bar Aura 25,000 Puffs 5pk (Main image).jpg' },
                { name: 'Clear', image: 'images/air bar/Air Bar Aura 25,000 Puffs 5pk/Air Bar Aura 25,000 Puffs 5pk (Main image).jpg' },
                { name: 'Coffee', image: 'images/air bar/Air Bar Aura 25,000 Puffs 5pk/Air Bar Aura 25,000 Puffs 5pk (Main image).jpg' },
                { name: 'Cool Mint', image: 'images/air bar/Air Bar Aura 25,000 Puffs 5pk/air_bar_aura_blue_mint.jpg' },
                { name: 'Juicy Watermelon Ice', image: 'images/air bar/Air Bar Aura 25,000 Puffs 5pk/Air Bar Aura 25,000 Puffs 5pk (Main image).jpg' },
                { name: 'Miami Mint', image: 'images/air bar/Air Bar Aura 25,000 Puffs 5pk/Air Bar Aura 25,000 Puffs 5pk (Main image).jpg' },
                { name: 'Sakura Grape', image: 'images/air bar/Air Bar Aura 25,000 Puffs 5pk/Air Bar Aura 25,000 Puffs 5pk (Main image).jpg' },
                { name: 'Sour Apple Ice', image: 'images/air bar/Air Bar Aura 25,000 Puffs 5pk/Air Bar Aura 25,000 Puffs 5pk (Main image).jpg' }
            ],
            image: 'images/air bar/Air Bar Aura 25,000 Puffs 5pk/Air Bar Aura 25,000 Puffs 5pk (Main image).jpg',
            description: 'Air Bar Aura 25000 Puffs - High-capacity disposable vape with vibrant design and premium flavors. Master Case: 30 x 5pk.',
            specs: ['25000 Puffs', '5 Devices per pack', 'Pre-filled', 'Vibrant Design']
        },
        {
            id: 'air_bar_diamond_spark_15000',
            name: 'Air Bar Diamond Spark 15000 Puffs 5pk',
            brand: 'Air Bar',
            price: 40.00,
            stock: 100,
            status: 'available',
            flavor: 'Love Story',
            flavors: [
                { name: 'Blue Razz Ice', image: 'images/air bar/air-bar-diamond-spark-8-250x300.jpg' },
                { name: 'Blueberry Ice', image: 'images/air bar/air-bar-diamond-spark-8-250x300.jpg' },
                { name: 'Cherry Cola', image: 'images/air bar/air-bar-diamond-spark-8-250x300.jpg' },
                { name: 'Clear', image: 'images/air bar/air-bar-diamond-spark-8-250x300.jpg' },
                { name: 'Coffee', image: 'images/air bar/air-bar-diamond-spark-8-250x300.jpg' },
                { name: 'Cool Mint', image: 'images/air bar/air-bar-diamond-spark-8-250x300.jpg' },
                { name: 'Fcuking FAB', image: 'images/air bar/air-bar-diamond-spark-8-250x300.jpg' },
                { name: 'Frozen Strawberry', image: 'images/air bar/air-bar-diamond-spark-8-250x300.jpg' },
                { name: 'Frozen Watermelon', image: 'images/air bar/air-bar-diamond-spark-8-250x300.jpg' },
                { name: 'Grape Ice', image: 'images/air bar/air-bar-diamond-spark-8-250x300.jpg' },
                { name: 'Juicy Peach Ice', image: 'images/air bar/air-bar-diamond-spark-8-250x300.jpg' },
                { name: 'Love Story', image: 'images/air bar/air-bar-diamond-spark-8-250x300.jpg' },
                { name: 'Sour Apple Ice', image: 'images/air bar/air-bar-diamond-spark-8-250x300.jpg' },
                { name: 'Strawberry Watermelon', image: 'images/air bar/air-bar-diamond-spark-8-250x300.jpg' },
                { name: 'Virginia Tobacco', image: 'images/air bar/air-bar-diamond-spark-8-250x300.jpg' }
            ],
            image: 'images/air bar/air-bar-diamond-spark-8-250x300.jpg',
            description: 'Air Bar Diamond Spark 15000 Puffs - Sparkling design with exceptional flavor and performance.',
            specs: ['15000 Puffs', '5 Devices per pack', 'Pre-filled', 'Diamond Design']
        },
        {
            id: 'air_bar_diamond_plus_1000',
            name: 'Air Bar Diamond+ 1000 Puffs 10pk',
            brand: 'Air Bar',
            price: 55.00,
            stock: 100,
            status: 'available',
            flavor: 'Cool Mint',
            flavors: [
                { name: 'Blueberry Ice', image: 'images/air bar/Airbar AURA   0912/air_bar_diamond_plus_blueberry_ice.jpg' },
                { name: 'Clear', image: 'images/air bar/Air Bar Diamond+ 1000 Puffs 10pk.jpg' },
                { name: 'Cool Mint', image: 'images/air bar/Airbar AURA   0912/air_bar_diamond_plus_cool_mint.jpg' },
                { name: 'Miami Mint', image: 'images/air bar/Airbar AURA   0912/air_bar_diamond_plus_miami_mint.jpg' },
                { name: 'Watermelon Ice', image: 'images/air bar/Airbar AURA   0912/air_bar_diamond_plus_watermelon_ice.jpg' }
            ],
            image: 'images/air bar/Air Bar Diamond+ 1000 Puffs 10pk.jpg',
            description: 'Air Bar Diamond+ 1000 Puffs - Compact disposable vape with 10 devices per pack.',
            specs: ['1000 Puffs per device', '10 Devices per pack', 'Pre-filled', 'Compact Design']
        },
        {
            id: 'air_bar_mini_2000',
            name: 'Air Bar Mini 2000 Puffs',
            brand: 'Air Bar',
            price: 50.00,
            stock: 100,
            status: 'available',
            flavor: 'Blueberry Mint',
            flavors: [
                { name: 'Blueberry Mint', image: 'images/air bar/Air Bar Mini 2000 Puffs.jpg' },
                { name: 'Frozen Peach', image: 'images/air bar/Air Bar Mini 2000 Puffs.jpg' },
                { name: 'Virginia Tobacco', image: 'images/air bar/Air Bar Mini 2000 Puffs.jpg' },
                { name: 'Watermelon Candy', image: 'images/air bar/Air Bar Mini 2000 Puffs.jpg' }
            ],
            image: 'images/air bar/Air Bar Mini 2000 Puffs.jpg',
            description: 'Air Bar Mini 2000 Puffs - Mini disposable vape with sweet candy flavors. Price Increase Sept 22, 2025.',
            specs: ['2000 Puffs', 'Pre-filled', 'Mini Size']
        },
        {
            id: 'air_bar_ab5000_10pk',
            name: 'Air Bar AB5000 10pk',
            brand: 'Air Bar',
            price: 50.00,
            stock: 100,
            status: 'available',
            flavor: 'Black Cheese Cake',
            flavors: [
                { name: 'Black Cheese Cake', image: 'images/air bar/Air Bar AB5000 10pk/air_bar_ab5000_black_cheese_cake.jpg' },
                { name: 'Berries Blast', image: 'images/air bar/Air Bar AB5000 10pk/air_bar_ab5000_berries_blast.jpg' },
                { name: 'Black Ice', image: 'images/air bar/Air Bar AB5000 10pk/air_bar_ab5000_black_ice.jpg' }
            ],
            image: 'images/air bar/Air Bar AB5000 10pk/Air Bar AB5000 10pk.jpg',
            description: 'Air Bar AB5000 10pk - Value pack with 10 devices, perfect for sharing. Key Features: 10mL Pre-Filled E Liquid, 5% (50mg) Nicotine Strength, 1500mAh NON-Rechargeable Battery, Approximately 5000 Puffs, New PHC (Pre-Heating Coil) Technology.',
            specs: ['5000 Puffs per device', '10 Devices per pack', '10mL Pre-Filled E Liquid', '5% (50mg) Nicotine', '1500mAh Battery', 'PHC Technology', 'Pre-filled', 'Value Pack']
        }
    ];

    // Save products to localStorage
    localStorage.setItem('products', JSON.stringify(products));
    
    // Initialize brands from products (only unique brands, don't overwrite existing)
    const uniqueBrands = [...new Set(products.map(p => p.brand))];
    const existingBrands = JSON.parse(localStorage.getItem('brands') || '[]');
    const brandsToAdd = uniqueBrands.filter(b => !existingBrands.includes(b));
    if (brandsToAdd.length > 0) {
        localStorage.setItem('brands', JSON.stringify([...existingBrands, ...brandsToAdd]));
    }

    console.log(`✅ Admin: Initialized ${products.length} products successfully!`);
}

// Note: initializeProductsFromCode() is called in DOMContentLoaded event

// Make functions available globally
window.exportProducts = exportProducts;
window.importProducts = importProducts;
window.handleFileImport = handleFileImport;
window.editFlavor = editFlavor;
window.deleteFlavor = deleteFlavor;
window.addFlavor = addFlavor;
window.syncFlavorsFromProducts = syncFlavorsFromProducts;

