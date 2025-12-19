const DATA_VERSION = '1.0.5';
// Data Storage using LocalStorage
const STORAGE_KEYS = {
    STORE_NAME: 'storeName',
    PRODUCTS: 'products',
    BRANDS: 'brands',
    FLAVORS: 'flavors',
    SLIDER_IMAGES: 'sliderImages',
    CART: 'cart',
    USERS: 'users',
    CURRENT_USER: 'currentUser'
};

// Auth Functions
function registerUser(username, email, password) {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    // Check if user exists
    if (users.some(u => u.username === username)) {
        return { success: false, message: 'Username already exists' };
    }
    if (users.some(u => u.email === email)) {
        return { success: false, message: 'Email already registered' };
    }
    
    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password, // In a real app, hash this!
        role: 'customer',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return { success: true };
}

function loginUser(username, password) {
    // Admin check
    if (username === 'admin' && password === 'admin123') {
        const adminUser = { username: 'admin', role: 'admin' };
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(adminUser));
        return { success: true, user: adminUser };
    }
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Don't store password in session
        const { password, ...safeUser } = user;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
        return { success: true, user: safeUser };
    }
    
    return { success: false, message: 'Invalid credentials' };
}

function logoutUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    try {
        sessionStorage.removeItem('isAdminLoggedIn');
    } catch (e) {}
    window.location.href = 'index.html';
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null');
}

// Make globally available
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;

/**
 * Initialize default data (store name, brands, flavors, slider images)
 * 
 * IMPORTANT: This ensures all data loads from embedded files when folder is copied to another device.
 * Same data, same images, same output everywhere!
 */
function initializeData() {
    const initialData = window.INITIAL_STORE_DATA || {};
    
    // Initialize store name from embedded data
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
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BRANDS)) {
        localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FLAVORS)) {
        localStorage.setItem(STORAGE_KEYS.FLAVORS, JSON.stringify([]));
    }
    
    // Initialize slider images - check data file first, then localStorage, then defaults
    if (!localStorage.getItem(STORAGE_KEYS.SLIDER_IMAGES)) {
        // Try to get from data file if available
        let sliderImages = [];
        if (typeof window.getSliderImages === 'function') {
            sliderImages = window.getSliderImages();
        }
        
        // If no images from data file, use defaults
        if (!sliderImages || sliderImages.length === 0 || !sliderImages.some(img => img && img.trim() !== '')) {
            sliderImages = [
                'https://via.placeholder.com/1200x400/4A90E2/FFFFFF?text=Slide+1',
                'https://via.placeholder.com/1200x400/E94B3C/FFFFFF?text=Slide+2',
                'https://via.placeholder.com/1200x400/50C878/FFFFFF?text=Slide+3',
                'https://via.placeholder.com/1200x400/FF6B6B/FFFFFF?text=Slide+4',
                'https://via.placeholder.com/1200x400/9B59B6/FFFFFF?text=Slide+5'
            ];
        }
        
        localStorage.setItem(STORAGE_KEYS.SLIDER_IMAGES, JSON.stringify(sliderImages));
    } else {
        // If localStorage exists, sync with data file if data file has images
        if (typeof window.getSliderImages === 'function') {
            const dataFileImages = window.getSliderImages();
            if (dataFileImages && dataFileImages.length > 0 && dataFileImages.some(img => img && img.trim() !== '')) {
                // Update localStorage with data file images (preserving any that exist in localStorage)
                const currentImages = JSON.parse(localStorage.getItem(STORAGE_KEYS.SLIDER_IMAGES) || '[]');
                const merged = dataFileImages.map((dataImg, index) => {
                    return (currentImages[index] && currentImages[index].trim() !== '') 
                        ? currentImages[index] 
                        : (dataImg || '');
                });
                localStorage.setItem(STORAGE_KEYS.SLIDER_IMAGES, JSON.stringify(merged));
            }
        }
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    }
    if (!localStorage.getItem('featuredProducts')) {
        localStorage.setItem('featuredProducts', JSON.stringify(['', '', '', '']));
    }
    if (!localStorage.getItem('brandFlavors')) {
        localStorage.setItem('brandFlavors', JSON.stringify({}));
    }
    if (!localStorage.getItem('brandSubBrands')) {
        localStorage.setItem('brandSubBrands', JSON.stringify({}));
    }
}

// Initialize on page load
initializeData();

/**
 * Initialize products from embedded data
 * 
 * IMPORTANT: This function ensures that when you copy this folder to another device,
 * ALL products and images load from the embedded files (products-data.js and embedded-images.js).
 * 
 * Works on any device - same data everywhere!
 */
function initializeProducts() {
    // Respect manual clear flag: do not auto-initialize after clearing
    if (localStorage.getItem('dataManuallyCleared') === 'true') {
        return;
    }
    
    const existingProducts = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const currentVersion = localStorage.getItem('app_data_version');
    
    // If products exist and version matches, we are done
    if (existingProducts.length > 0 && currentVersion === DATA_VERSION) {
        return;
    }
    
    // If data-initializer.js already initialized, skip (but still update images if needed)
    if (localStorage.getItem('dataInitialized') === 'true' && existingProducts.length > 0) {
        console.log('📦 Data already initialized by data-initializer.js, ensuring images are embedded...');
        // Still update images to ensure they're embedded
        const productsWithEmbeddedImages = existingProducts.map(product => {
            if (product.image && !product.image.startsWith('data:image') && typeof getEmbeddedImage === 'function') {
                const embedded = getEmbeddedImage(product.image) || 
                               getEmbeddedImage(product.image.replace(/^images\//, ''));
                if (embedded) {
                    product.image = embedded;
                }
            }
            return product;
        });
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(productsWithEmbeddedImages));
        return;
    }

    console.log('🔄 Loading products from embedded data files (products-data.js)...');
    console.log('📦 This ensures same data on every device/PC when folder is copied');

    // Helper function to get embedded image from embedded-images.js
    // This ensures images work on any device without needing the images/ folder
    function getProductImage(imagePath) {
        if (!imagePath) return '';
        
        // ALWAYS try to get from embedded images first (embedded-images.js)
        // This ensures images work on any device
        if (typeof getEmbeddedImage === 'function') {
            // Try with original path
            let embedded = getEmbeddedImage(imagePath);
            // Try without images/ prefix if needed
            if (!embedded && imagePath.startsWith('images/')) {
                embedded = getEmbeddedImage(imagePath.replace(/^images\//, ''));
            }
            // If found, use embedded image (base64) - works on any device!
            if (embedded) {
                return embedded;
            }
        }
        
        // Fallback to regular image path (only if embedded image not found)
        return imagePath.startsWith('images/') ? imagePath : 'images/' + imagePath;
    }

    // Get products from embedded file (products-data.js)
    // This array is included in the code, so it works on any device
    const products = window.INITIAL_PRODUCTS || [];

    // Check if this is a fresh installation (no existing products)
    let finalProducts;
    if (existingProducts.length > 0) {
        // Existing installation - merge with embedded data to preserve user changes
        console.log('📝 Merging with existing products (preserving user changes)...');
        const existingMap = new Map(existingProducts.map(p => [String(p.id), p]));
        finalProducts = products.map(p => {
            const existing = existingMap.get(String(p.id));
            if (existing) {
                // Preserve user changes, but use embedded image if available
                let mergedImage = existing.image;
                if (mergedImage === undefined || mergedImage === null) {
                    mergedImage = getProductImage(p.image);
                } else {
                    // Try to use embedded image even if existing has one
                    const embedded = getProductImage(p.image);
                    if (embedded && embedded.startsWith('data:image')) {
                        mergedImage = embedded; // Use embedded base64 image
                    }
                }

                return {
                    ...p, // Start with embedded data
                    ...existing, // Overwrite with user data
                    image: mergedImage, // Use embedded image if available
                    // Preserve user-modified fields
                    price: existing.price !== undefined ? existing.price : p.price,
                    stock: existing.stock !== undefined ? existing.stock : p.stock,
                    description: existing.description || p.description,
                    status: existing.status || p.status,
                    // Merge flavors
                    flavors: p.flavors ? p.flavors.map(f => {
                        if (!existing.flavors) return f;
                        const existingFlavor = existing.flavors.find(ef => ef.name === f.name);
                        return existingFlavor ? { ...f, ...existingFlavor } : f;
                    }) : (existing.flavors || [])
                };
            }
            // New product from embedded data - ensure image uses embedded version
            return {
                ...p,
                image: getProductImage(p.image),
                // Also update additional images if they exist
                images: p.images ? p.images.map(img => getProductImage(img)) : p.images
            };
        });
        
        // Add any products the user created manually that aren't in the embedded list
        const hardcodedIds = new Set(products.map(p => String(p.id)));
        existingProducts.forEach(p => {
            if (!hardcodedIds.has(String(p.id))) {
                finalProducts.push(p);
            }
        });
    } else {
        // FRESH INSTALLATION - Load ALL products from embedded files
        // This ensures same data on every device when folder is copied
        console.log('✨ Fresh installation detected - loading ALL products from embedded files...');
        finalProducts = products.map(p => ({
            ...p,
            // Ensure all images use embedded versions (from embedded-images.js)
            image: getProductImage(p.image),
            // Also update additional images if they exist
            images: p.images ? p.images.map(img => getProductImage(img)) : p.images
        }));
    }

    // Save products to localStorage
    // All images are now embedded (base64), so they work on any device!
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(finalProducts));
    localStorage.setItem('app_data_version', DATA_VERSION);
    
    // Initialize brands from products (only unique brands)
    const uniqueBrands = [...new Set(finalProducts.map(p => p.brand))];
    let existingBrands = JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANDS) || '[]');
    
    // Normalize existing brands structure
    if (existingBrands.length > 0 && typeof existingBrands[0] === 'object' && existingBrands[0].name) {
        // New format - extract names
        const existingBrandNames = existingBrands.map(b => b.name);
        const brandsToAdd = uniqueBrands.filter(b => !existingBrandNames.includes(b));
        if (brandsToAdd.length > 0) {
            const maxOrder = existingBrands.length > 0 
                ? Math.max(...existingBrands.map(b => b.displayOrder || 0))
                : 0;
            const newBrands = brandsToAdd.map((brand, index) => ({
                name: brand,
                displayOrder: maxOrder + index + 1
            }));
            localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify([...existingBrands, ...newBrands]));
        }
    } else {
        // Old format - convert to new format
        const existingBrandNames = existingBrands;
        const brandsToAdd = uniqueBrands.filter(b => !existingBrandNames.includes(b));
        if (brandsToAdd.length > 0) {
            const normalizedExisting = existingBrands.map((brand, index) => ({
                name: brand,
                displayOrder: index + 1
            }));
            const newBrands = brandsToAdd.map((brand, index) => ({
                name: brand,
                displayOrder: existingBrands.length + index + 1
            }));
            localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify([...normalizedExisting, ...newBrands]));
        } else if (existingBrands.length > 0 && typeof existingBrands[0] === 'string') {
            // Convert existing old format to new format even if no new brands to add
            const normalizedExisting = existingBrands.map((brand, index) => ({
                name: brand,
                displayOrder: index + 1
            }));
            localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(normalizedExisting));
        }
    }

    console.log(`✅ Initialized ${finalProducts.length} products successfully!`);
    console.log('✅ All product images are embedded (base64) - works on any device!');
}

// Initialize products on page load (only if products don't exist)
initializeProducts();

// Global image error handler - shows placeholder for broken images (no auto-generated images)
document.addEventListener('DOMContentLoaded', function() {
    // Handle images that fail to load - replace with placeholder
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG' && e.target.parentElement) {
            const wrapper = e.target.parentElement;
            if (wrapper.classList.contains('product-image-wrapper')) {
                e.target.style.display = 'none';
                if (!wrapper.querySelector('.product-image-placeholder')) {
                    wrapper.innerHTML = `
                        <div class="product-image-placeholder">
                            <i class="fas fa-image"></i>
                            <span>Image Not Found</span>
                            <small>Upload in Admin</small>
                        </div>
                    `;
                }
            }
        }
    }, true);
    
    // Pre-load images with error handling
    const images = document.querySelectorAll('img.product-image');
    images.forEach(img => {
        if (img.src && !img.complete) {
            img.onerror = function() {
                const wrapper = this.parentElement;
                if (wrapper && wrapper.classList.contains('product-image-wrapper')) {
                    this.style.display = 'none';
                    if (!wrapper.querySelector('.product-image-placeholder')) {
                        wrapper.innerHTML = `
                            <div class="product-image-placeholder">
                                <i class="fas fa-image"></i>
                                <span>Image Not Found</span>
                                <small>Upload in Admin</small>
                            </div>
                        `;
                    }
                }
            };
        }
    });
});

// Update store name in header
function updateStoreName() {
    const storeName = localStorage.getItem(STORAGE_KEYS.STORE_NAME);
    const storeNameHeader = document.getElementById('storeNameHeader');
    const storeNameElements = document.querySelectorAll('.store-name');
    
    if (storeNameHeader) {
        storeNameHeader.textContent = storeName;
    }
    
    storeNameElements.forEach(el => {
        if (el && el.id !== 'storeNameHeader') el.textContent = storeName;
    });
}

// Image Slider Functions
let currentSlide = 0;
let slideInterval;

function initSlider() {
    // Get slider images - check data file first, then localStorage
    let sliderImages = [];
    if (typeof window.getSliderImages === 'function') {
        sliderImages = window.getSliderImages();
    } else {
        sliderImages = JSON.parse(localStorage.getItem(STORAGE_KEYS.SLIDER_IMAGES) || '[]');
    }
    
    const sliderWrapper = document.getElementById('sliderWrapper');
    const sliderDots = document.getElementById('sliderDots');
    
    if (!sliderWrapper || !sliderDots) return;
    
    // Filter out empty images
    sliderImages = sliderImages.filter(img => img && img.trim() !== '');
    
    if (!sliderImages || sliderImages.length === 0) {
        sliderWrapper.innerHTML = '<div class="slide active"><img src="https://via.placeholder.com/1200x450/667eea/ffffff?text=Add+Slider+Images+in+Admin+Panel" alt="No slider images" class="slide-image"></div>';
        sliderDots.innerHTML = '';
        return;
    }
    
    sliderWrapper.innerHTML = '';
    sliderDots.innerHTML = '';
    
    sliderImages.forEach((image, index) => {
        const slide = document.createElement('div');
        slide.className = 'slide' + (index === 0 ? ' active' : '');
        
        // Create image element with proper loading and error handling
        const img = document.createElement('img');
        img.src = image;
        img.alt = `Slide ${index + 1}`;
        img.className = 'slide-image';
        img.loading = 'lazy';
        
        // Handle image load
        img.onload = function() {
            this.style.opacity = '1';
        };
        
        // Handle image error
        img.onerror = function() {
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'slide-image-placeholder';
            placeholder.innerHTML = `
                <i class="fas fa-image"></i>
                <p>Image ${index + 1} not found</p>
            `;
            slide.appendChild(placeholder);
        };
        
        slide.appendChild(img);
        sliderWrapper.appendChild(slide);
        
        const dot = document.createElement('div');
        dot.className = 'indicator' + (index === 0 ? ' active' : '');
        dot.onclick = () => goToSlide(index);
        sliderDots.appendChild(dot);
    });
    
    // Add touch support for mobile
    addTouchSupport(sliderWrapper);
    
    currentSlide = 0;
    startSlider();
}
window.initSlider = initSlider;

// Touch support for slider on mobile devices
let touchStartX = 0;
let touchEndX = 0;

function addTouchSupport(element) {
    if (!element) return;
    
    element.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    element.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next slide
            changeSlide(1);
        } else {
            // Swipe right - previous slide
            changeSlide(-1);
        }
    }
}

function startSlider() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        changeSlide(1);
    }, 5000);
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.indicator, .dot');
    
    if (slides.length === 0) return;
    
    slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
    
    currentSlide += direction;
    
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }
    
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    
    startSlider();
}
window.changeSlide = changeSlide;

function goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.indicator, .dot');
    
    slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    
    startSlider();
}
window.goToSlide = goToSlide;

// Load and display products
function loadProducts() {
    refreshCatalogProducts();
}

// Helper function to get image source (checks images folder first)
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
        // Encode spaces and special characters for URL compatibility
        // Split by '/' to preserve directory structure, then encode each part
        const parts = imagePath.split('/');
        const encodedParts = parts.map((part, index) => {
            // Don't encode the first part (images)
            if (index === 0) return part;
            // Encode spaces and other special characters but keep forward slashes
            return encodeURIComponent(part);
        });
        return encodedParts.join('/');
    }
    
    // If it's just a filename, assume it's in images folder
    if (!imagePath.includes('/')) {
        return `images/${encodeURIComponent(imagePath)}`;
    }
    
    // Otherwise encode the path
    const parts = imagePath.split('/');
    const encodedParts = parts.map(part => encodeURIComponent(part));
    return encodedParts.join('/');
}

// Create product card HTML - Enhanced Full Display Version
function createProductCard(product) {
    if (!product) return '';
    
    // Fallback logic for image: check product.image first, then first flavor's image
    let productImg = product.image;
    if (!productImg || productImg.trim() === '') {
        if (product.flavors && Array.isArray(product.flavors) && product.flavors.length > 0 && product.flavors[0].image) {
            productImg = product.flavors[0].image;
        }
    }
    
    // Get image source - checks images folder first, then base64, then external URLs
    const imageSrc = getImageSource(productImg);
    const hasImage = imageSrc !== null && imageSrc.trim() !== '';
    
    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    
    const productName = escapeHtml(product.name || 'Unnamed Product');
    const productBrand = escapeHtml(product.brand || '');
    const productFlavor = escapeHtml(product.flavor || '');
    const productPrice = parseFloat(product.price || 0).toFixed(2);
    const productId = String(product.id || '');
    const productStock = product.stock || 0;
    const productStatus = product.status || 'available';
    const isInStock = productStock > 0 && productStatus === 'available';
    
    // Enhanced image display with proper sizing
    const imageDisplay = hasImage 
        ? `<div class="product-card-media">
                <img src="${imageSrc}" 
                    alt="${productName}" 
                    class="product-card-image" 
                    loading="lazy"
                    onload="this.classList.add('loaded'); this.parentElement.querySelector('.image-loader-full')?.remove();"
                    onerror="this.onerror=null; this.style.display='none'; const placeholder = this.parentElement.querySelector('.product-image-placeholder-full'); if (placeholder) { placeholder.style.display='flex'; } else { this.parentElement.innerHTML='<div class=\\'product-image-placeholder-full\\'><i class=\\'fas fa-image\\'></i><span>Image Not Found</span></div>'; }">
                <div class="image-loader-full">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <div class="product-image-placeholder-full" style="display: none;">
                    <i class="fas fa-image"></i>
                    <span>Image Not Found</span>
                </div>
           </div>`
        : `<div class="product-card-media">
                <div class="product-image-placeholder-full">
                    <i class="fas fa-image"></i>
                    <span>No Image</span>
                    <small>Upload in Admin</small>
                </div>
           </div>`;
    
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    const isLoggedIn = !!currentUser;
    return `
        <article class="product-card-showcase hover-lift" data-product-id="${productId}" onclick="if(!event.target.closest('.card-btn')) viewProduct('${productId}')" style="cursor: pointer;">
            ${imageDisplay}
            <div class="product-card-stock ${isInStock ? 'in-stock' : 'out-of-stock'}">
                <i class="fas fa-${isInStock ? 'check' : 'times'}-circle"></i> ${isInStock ? 'In stock' : 'Out of stock'}
            </div>
            <div class="product-card-body">
                <div class="product-card-top">
                    <span class="brand-pill">${productBrand || 'No Brand'}</span>
                    <button class="card-btn ghost" onclick="event.stopPropagation(); viewProduct('${productId}')">
                        <span>View</span> <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
                <h3 class="product-card-title">${productName}</h3>
                <p class="product-card-flavor">${productFlavor || 'Multi flavor pack'}</p>
                <div class="product-card-footer">
                    ${isLoggedIn ? `
                        <div class="product-card-price">$${productPrice}</div>
                    ` : `
                        <div class="product-card-login"><i class="fas fa-lock"></i> Login to view prices</div>
                    `}
                    <div class="product-card-actions">
                        <button class="card-btn primary" onclick="event.stopPropagation(); quickOrder('${productId}')">
                            <i class="fas fa-cart-plus"></i> Quick order
                        </button>
                    </div>
                </div>
            </div>
        </article>
    `;
}

// Helpers for catalog filtering and rendering
function getFeaturedProductIds() {
    return (JSON.parse(localStorage.getItem('featuredProducts') || '[]') || []).filter(id => id && String(id).trim() !== '');
}

function getAllCatalogProducts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
}

function getCatalogFilters() {
    const searchInput = document.getElementById('catalogSearch');
    const featuredToggle = document.getElementById('featuredToggle');
    return {
        search: (searchInput?.value || '').trim().toLowerCase(),
        featuredOnly: featuredToggle ? featuredToggle.checked : false,
        brand: window.currentBrandFilter
    };
}

function refreshCatalogProducts() {
    const products = getAllCatalogProducts();
    const featuredIds = getFeaturedProductIds();
    const { search, featuredOnly, brand } = getCatalogFilters();

    let filtered = products.slice();

    if (brand) {
        filtered = filtered.filter(p => (p.brand || '').toLowerCase().trim() === brand.toLowerCase().trim());
    }

    if (featuredOnly) {
        filtered = filtered.filter(p => featuredIds.includes(String(p.id)));
    }

    if (search) {
        filtered = filtered.filter(p => {
            const haystack = `${p.name || ''} ${p.brand || ''} ${p.flavor || ''}`.toLowerCase();
            return haystack.includes(search);
        });
    }

    displayFilteredProducts(filtered);

    const productsTitle = document.getElementById('productsTitle');
    const productsSubtitle = document.getElementById('productsSubtitle');
    const clearFilterBtn = document.getElementById('clearBrandFilter');
    const allBrandsChip = document.getElementById('allBrandsChip');

    if (productsTitle) {
        const safeBrand = brand ? String(brand).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
        const prefix = brand ? `<i class="fas fa-tag"></i> ${safeBrand} Products` : 'All Products';
        productsTitle.innerHTML = prefix;
    }

    if (productsSubtitle) {
        let subtitle = `Showing ${filtered.length} item${filtered.length === 1 ? '' : 's'}`;
        if (featuredOnly) subtitle += ' • Featured only';
        if (search) subtitle += ` • Matching "${search}"`;
        productsSubtitle.textContent = subtitle;
    }

    if (clearFilterBtn) {
        clearFilterBtn.style.display = brand ? 'flex' : (search || featuredOnly ? 'flex' : 'none');
    }

    if (allBrandsChip) {
        if (brand) {
            allBrandsChip.classList.remove('active');
        } else {
            allBrandsChip.classList.add('active');
        }
    }

    updateBrandCardsActiveState();
}
window.refreshCatalogProducts = refreshCatalogProducts;

function handleCatalogSearch(event) {
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    refreshCatalogProducts();
}
window.handleCatalogSearch = handleCatalogSearch;

function handleFeaturedToggle() {
    refreshCatalogProducts();
}
window.handleFeaturedToggle = handleFeaturedToggle;

// Initialize home page
function initializeHomePage() {
    updateStoreName();
}

// Helper function to normalize brands (for app.js)
function normalizeBrandsForApp(brands) {
    if (!Array.isArray(brands) || brands.length === 0) return [];
    if (typeof brands[0] === 'object' && brands[0] !== null && brands[0].name) {
        return brands.map(b => b.name);
    }
    return brands; // Already array of strings
}

// Filter functions
function initFilters() {
    let brands = JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANDS) || '[]');
    brands = normalizeBrandsForApp(brands); // Normalize to array of names
    const flavors = JSON.parse(localStorage.getItem(STORAGE_KEYS.FLAVORS) || '[]');
    
    const brandFilter = document.getElementById('brandFilter');
    const flavorFilter = document.getElementById('flavorFilter');
    
    if (brandFilter) {
        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandFilter.appendChild(option);
        });
    }
    
    if (flavorFilter) {
        flavors.forEach(flavor => {
            const option = document.createElement('option');
            option.value = flavor;
            option.textContent = flavor;
            flavorFilter.appendChild(option);
        });
    }
    
    // Add event listeners
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    if (brandFilter) brandFilter.addEventListener('change', applyFilters);
    if (flavorFilter) flavorFilter.addEventListener('change', applyFilters);
    
    const priceFilter = document.getElementById('priceFilter');
    if (priceFilter) priceFilter.addEventListener('change', applyFilters);
    
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) sortFilter.addEventListener('change', applyFilters);
}

function applyFilters() {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const searchInput = document.getElementById('searchInput');
    const brandFilter = document.getElementById('brandFilter');
    const flavorFilter = document.getElementById('flavorFilter');
    const priceFilter = document.getElementById('priceFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    let filtered = [...products];
    
    // Search filter
    if (searchInput && searchInput.value) {
        const searchTerm = searchInput.value.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.brand.toLowerCase().includes(searchTerm) ||
            p.flavor.toLowerCase().includes(searchTerm)
        );
    }
    
    // Brand filter
    if (brandFilter && brandFilter.value) {
        filtered = filtered.filter(p => p.brand === brandFilter.value);
    }
    
    // Flavor filter
    if (flavorFilter && flavorFilter.value) {
        filtered = filtered.filter(p => p.flavor === flavorFilter.value);
    }
    
    // Price filter
    if (priceFilter && priceFilter.value) {
        const [min, max] = priceFilter.value.split('-').map(v => v === '+' ? Infinity : parseFloat(v));
        filtered = filtered.filter(p => {
            const price = parseFloat(p.price);
            if (max === Infinity) return price >= min;
            return price >= min && price <= max;
        });
    }
    
    // Sort
    if (sortFilter && sortFilter.value) {
        switch(sortFilter.value) {
            case 'price-low':
                filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                break;
            case 'price-high':
                filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
            default:
                filtered.sort((a, b) => new Date(b.id) - new Date(a.id));
                break;
        }
    }
    
    displayFilteredProducts(filtered);
}

function displayFilteredProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProducts');
    
    if (!productsGrid) return;
    
    if (products.length === 0) {
        productsGrid.style.display = 'none';
        if (noProducts) noProducts.style.display = 'block';
    return;
  }
  
    productsGrid.style.display = 'grid';
    if (noProducts) noProducts.style.display = 'none';
    
    productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
}

function clearFilters() {
    const searchInput = document.getElementById('searchInput');
    const brandFilter = document.getElementById('brandFilter');
    const flavorFilter = document.getElementById('flavorFilter');
    const priceFilter = document.getElementById('priceFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (searchInput) searchInput.value = '';
    if (brandFilter) brandFilter.value = '';
    if (flavorFilter) flavorFilter.value = '';
    if (priceFilter) priceFilter.value = '';
    if (sortFilter) sortFilter.value = 'newest';
    
    applyFilters();
}

// View product detail
function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

// Load product detail
function loadProductDetail(productId) {
    try {
        const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
        const product = products.find(p => String(p.id) === String(productId));
        const container = document.getElementById('productDetailContainer');
        
        if (!container) {
            console.error('Product detail container not found');
            return;
        }
        
        if (!product) {
            container.innerHTML = '<div style="text-align: center; padding: 40px;"><p>Product not found.</p><a href="index.html">Return to Home</a></div>';
            return;
        }
        
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };
        const productName = escapeHtml(product.name || '');
        const productPrice = parseFloat(product.price || 0).toFixed(2);
        const flavors = product.flavors && Array.isArray(product.flavors) && product.flavors.length > 0 
            ? product.flavors 
            : (product.flavor ? [{ name: product.flavor }] : []);
        let initialMainImage = product.image || '';
        if (flavors.length > 0 && flavors[0].image) {
            initialMainImage = flavors[0].image;
        }
        const images = [initialMainImage, ...(product.additionalImages || []), ...(product.images || [])].filter(img => img && img.trim() !== '');
        const mainImage = images[0] ? getImageSource(images[0]) : '';
        const thumbnails = images.slice(0, 6).map((img, index) => {
            const imgSrc = getImageSource(img);
            return imgSrc ? `
                <button class="detail-thumb thumbnail-item ${index === 0 ? 'active' : ''}" type="button" onclick="changeMainImage('${imgSrc}', this)">
                    <img src="${imgSrc}" alt="Thumbnail ${index + 1}" onerror="this.style.display='none';">
                </button>
            ` : '';
        }).join('');
        const imageDisplay = mainImage 
            ? `<img src="${mainImage}" alt="${productName}" id="mainImage" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';"> 
               <div class="product-image-placeholder-full" style="display: none;">
                   <i class="fas fa-image"></i>
                   <span>Image Not Found</span>
               </div>`
            : `<div class="product-image-placeholder-full">
                   <i class="fas fa-image"></i>
                   <span>No Image Available</span>
               </div>`;
        const currentUser = getCurrentUser();
        const isLoggedIn = !!currentUser;
        const productBrand = escapeHtml(product.brand || '');
        const productDescription = escapeHtml(product.description || '');
        const productSpecs = product.specs || [];
        const stockStatus = product.stock > 0 && product.status === 'available';
        
        container.innerHTML = `
            <div class="detail-layout">
                <aside class="detail-gallery">
                    <div class="detail-main-image">
                        ${imageDisplay}
                    </div>
                    ${thumbnails ? `<div class="detail-thumbs">${thumbnails}</div>` : ''}
                </aside>

                <section class="detail-info">
                    <div class="detail-badge-row">
                        ${productBrand ? `<span class="badge-soft">${productBrand}</span>` : ''}
                        <span class="badge-success">${stockStatus ? 'In Stock' : 'Out of Stock'}</span>
                    </div>

                    <h1 class="detail-title">${productName}</h1>

                    ${isLoggedIn ? `
                        <div class="detail-price-row">
                            <div class="detail-price-main">$${productPrice}</div>
                            <div class="detail-price-note">Per 5-pack (wholesale style demo)</div>
                        </div>
                    ` : `
                        <div class="login-prompt detail-login">
                            <i class="fas fa-lock"></i>
                            <span>Login to view prices</span>
                        </div>
                    `}

                    ${productDescription ? `
                        <div>
                            <div class="detail-section-title">Description</div>
                            <p class="detail-description">${productDescription}</p>
                        </div>
                    ` : ''}

                    ${productSpecs.length > 0 ? `
                        <div>
                            <div class="detail-section-title">Key Specs</div>
                            <ul class="detail-specs">
                                ${productSpecs.map(spec => `<li>${escapeHtml(spec)}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${flavors.length > 0 ? `
                        <div>
                            <div class="detail-section-title">Flavors / Variants</div>
                            <div class="variant-grid">
                                ${flavors.map(f => {
                                    const fname = escapeHtml(f.name || '');
                                    const slug = (f.name || '').toLowerCase().replace(/[^a-z0-9]+/g,'-');
                                    return `
                                        <article class="variant-card">
                                            <div class="variant-name">${fname}</div>
                                            <div class="variant-qty-row">
                                                <div class="qty-control">
                                                    <button type="button" onclick="handleFlavorQty('${productId}','${slug}',-1)">-</button>
                                                    <input type="number" id="qty-${productId}-${slug}" value="0" min="0" class="qty-input" readonly>
                                                    <button type="button" onclick="handleFlavorQty('${productId}','${slug}',1)">+</button>
                                                </div>
                                                <span class="badge-soft badge-small">Case qty</span>
                                            </div>
                                        </article>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="detail-actions">
                        <button class="btn-primary" type="button" onclick="addAllFlavorsToCart('${productId}')">
                            <i class="fas fa-shopping-cart"></i>
                            <span>Add to Cart</span>
                        </button>
                        <button class="btn-secondary" type="button" onclick="window.location.href='cart.html'">
                            <span>View Cart</span>
                        </button>
                    </div>

                    <p class="link-muted detail-note">Wholesale-style demo only — no live payments are processed.</p>
                </section>
            </div>
        `;
        window.currentDetailFlavors = (flavors || []).map(f => f.name);
    } catch (error) {
        console.error('Error loading product detail:', error);
        const container = document.getElementById('productDetailContainer');
        if (container) {
            container.innerHTML = '<div style="text-align: center; padding: 40px;"><p>Error loading product details. Please try again.</p><a href="index.html">Return to Home</a></div>';
        }
    }
}

function changeMainImage(imageSrc, element) {
    try {
        const mainImg = document.getElementById('mainImage');
        if (mainImg && imageSrc) {
            mainImg.src = imageSrc;
        }
        // Update active thumbnail
        if (element) {
            document.querySelectorAll('.thumbnail-item').forEach(item => {
                item.classList.remove('active');
            });
            element.classList.add('active');
        }
    } catch (error) {
        console.error('Error changing main image:', error);
    }
}

function addAllFlavorsToCart(productId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Please login to add items to cart.');
        return;
    }

    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const product = products.find(p => String(p.id) === String(productId));
    if (!product) return;

    const flavors = product.flavors && Array.isArray(product.flavors) && product.flavors.length > 0
        ? product.flavors
        : (product.flavor ? [{ name: product.flavor }] : []);

    let addedCount = 0;
    flavors.forEach(f => {
        const fname = f.name || '';
        const slug = fname.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const qtyInput = document.getElementById(`qty-${productId}-${slug}`);
        if (qtyInput) {
            const qty = parseInt(qtyInput.value) || 0;
            if (qty > 0) {
                // Use the internal cart helper directly with flavor name
                addToCartWithQuantity(productId, qty, fname);
                addedCount++;
            }
        }
    });

    if (addedCount > 0) {
        alert(`✅ Added ${addedCount} flavor(s) to cart!`);
        updateCartCount();
    } else {
        alert('Please select quantities for flavors first.');
    }
}

// Legacy function for backward compatibility  
function changeMainImage_old(imageSrc) {
    try {
        const mainImage = document.getElementById('mainImage');
        
        if (mainImage && imageSrc) {
            mainImage.src = imageSrc;
            mainImage.onerror = function() {
                this.onerror = null;
                this.style.display = 'none';
                const placeholder = this.nextElementSibling;
                if (placeholder && placeholder.classList.contains('product-image-placeholder-full')) {
                    placeholder.style.display = 'flex';
                }
            };
        }
        
        // Update active thumbnail
        if (element) {
            document.querySelectorAll('.thumbnail-item').forEach(item => {
                item.classList.remove('active');
            });
            element.classList.add('active');
        } else {
            // Fallback: find thumbnail by data-image attribute or old class structure
            document.querySelectorAll('.thumbnail-item').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-image') === imageSrc) {
                    item.classList.add('active');
                }
            });
            // Also handle old structure
            const thumbnails = document.querySelectorAll('.thumbnail-images img');
            thumbnails.forEach(thumb => {
                thumb.classList.remove('active');
                const wrapper = thumb.parentElement;
                const onclickAttr = wrapper ? (wrapper.getAttribute('onclick') || '') : '';
                if (thumb.src === imageSrc || onclickAttr.includes(imageSrc)) {
                    thumb.classList.add('active');
                }
            });
        }
    } catch (error) {
        console.error('Error changing main image:', error);
    }
}

function increaseQuantity() {
    const qtyInput = document.getElementById('productQuantity');
    if (qtyInput) {
        qtyInput.value = parseInt(qtyInput.value) + 1;
    }
}

function decreaseQuantity() {
    const qtyInput = document.getElementById('productQuantity');
    if (qtyInput && parseInt(qtyInput.value) > 1) {
        qtyInput.value = parseInt(qtyInput.value) - 1;
    }
}

// Show coming soon notification
function showComingSoonNotification(message = 'Shopping Cart feature is coming soon! Stay tuned for updates.') {
    // Remove any existing notification
    const existingNotification = document.querySelector('.coming-soon-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'coming-soon-notification';
    notification.innerHTML = `
        <div class="coming-soon-notification-content">
            <i class="fas fa-clock"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.getElementById('coming-soon-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'coming-soon-notification-styles';
        style.textContent = `
            .coming-soon-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
                z-index: 10000;
                animation: slideInRight 0.3s ease-out;
                max-width: 400px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            }
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .coming-soon-notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 15px;
                font-weight: 600;
            }
            .coming-soon-notification-content i {
                font-size: 20px;
                animation: pulse 2s ease-in-out infinite;
            }
            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.6;
                }
            }
            @media (max-width: 768px) {
                .coming-soon-notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                    padding: 14px 20px;
                }
                .coming-soon-notification-content {
                    font-size: 14px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease-out reverse';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

// Cart functions
function addToCart(productId) {
    try {
        // Default quantity 1, no specific flavor (cart UI can adjust later)
        addToCartWithQuantity(productId, 1, '');
    } catch (error) {
        console.error('Error in addToCart:', error);
        alert('Error adding product to cart. Please try again.');
    }
}

function addToCartFromDetail(productId) {
    try {
        const qtyInput = document.getElementById('productQuantity');
        const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
        const selectedFlavorInput = document.getElementById('selectedFlavor');
        const selectedFlavor = selectedFlavorInput ? selectedFlavorInput.value : '';
        addToCartWithQuantity(productId, quantity, selectedFlavor);
    } catch (error) {
        console.error('Error in addToCartFromDetail:', error);
        alert('Error adding product to cart. Please try again.');
    }
}

// Make functions globally available
window.addToCart = addToCart;
window.addToCartFromDetail = addToCartFromDetail;
window.showComingSoonNotification = showComingSoonNotification;

// Quick Order: navigate to product detail for fast checkout flow
function quickOrder(productId) {
    viewProduct(productId);
}
window.quickOrder = quickOrder;

// Flavor selection function
function selectFlavor(flavorName, flavorImage, element) {
    // Update selected flavor in hidden input
    const selectedFlavorInput = document.getElementById('selectedFlavor');
    if (selectedFlavorInput) {
        selectedFlavorInput.value = flavorName;
    }
    
    // Update visual selection
    const flavorOptions = document.querySelectorAll('.flavor-option');
    flavorOptions.forEach(opt => opt.classList.remove('selected'));
    if (element) {
        element.classList.add('selected');
    }
    
    // Update main image if flavor has an image
    if (flavorImage && flavorImage.trim() !== '') {
        const mainImage = document.getElementById('mainImage');
        if (mainImage) {
            const imgSrc = getImageSource(flavorImage);
            mainImage.src = imgSrc;
            mainImage.onerror = function() {
                this.onerror = null;
                this.style.display = 'none';
                const placeholder = this.nextElementSibling;
                if (placeholder && placeholder.classList.contains('product-image-placeholder-full')) {
                    placeholder.style.display = 'flex';
                }
            };
            mainImage.style.display = 'block';
            const placeholder = mainImage.nextElementSibling;
            if (placeholder && placeholder.classList.contains('product-image-placeholder-full')) {
                placeholder.style.display = 'none';
            }
        }
    }
}

// Make function globally available
window.selectFlavor = selectFlavor;

function addToCartWithQuantity(productId, quantity, selectedFlavor = '') {
    try {
        const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
        const product = products.find(p => String(p.id) === String(productId));
        
        if (!product) {
            alert('Product not found!');
            return;
        }
        
        const qty = parseInt(quantity) || 1;
        if (qty < 1) {
            alert('Quantity must be at least 1');
            return;
        }
        
        const productStock = parseInt(product.stock || 0);
        if (productStock <= 0 && product.status !== 'available') {
            alert('This product is out of stock!');
            return;
        }
        
        // Determine flavor and flavor image
        let flavorName = selectedFlavor || product.flavor || '';
        let flavorImage = '';
        
        // If product has flavors array, find the selected flavor's image
        if (product.flavors && Array.isArray(product.flavors) && product.flavors.length > 0) {
            const selectedFlavorObj = product.flavors.find(f => f.name === selectedFlavor);
            if (selectedFlavorObj) {
                flavorName = selectedFlavorObj.name;
                flavorImage = selectedFlavorObj.image || '';
            } else if (product.flavors.length > 0) {
                // Use first flavor if none selected
                flavorName = product.flavors[0].name;
                flavorImage = product.flavors[0].image || '';
            }
        }
        
        // Use flavor image as product image if available, otherwise use product image
        const productImage = flavorImage || product.image || '';
        
        let cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');
        
        // Check if same product with same flavor already exists
        const existingItem = cart.find(item => 
            String(item.id) === String(productId) && 
            String(item.selectedFlavor || '') === String(flavorName)
        );
        
        if (existingItem) {
            const newQty = existingItem.quantity + qty;
            if (productStock > 0 && newQty > productStock) {
                alert(`Only ${productStock} items available in stock!`);
                return;
            }
            existingItem.quantity = newQty;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                image: productImage,
                price: product.price,
                brand: product.brand,
                flavor: flavorName, // Keep for backward compatibility
                selectedFlavor: flavorName, // New: store selected flavor
                flavorImage: flavorImage, // New: store flavor image
                quantity: qty
            });
        }
        
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
        updateCartCount();
        
        // Show success message (can be replaced with a toast notification)
        const successMsg = document.createElement('div');
        successMsg.textContent = 'Product added to cart!';
        successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
        document.body.appendChild(successMsg);
        setTimeout(() => {
            successMsg.style.opacity = '0';
            successMsg.style.transition = 'opacity 0.3s';
            setTimeout(() => successMsg.remove(), 300);
        }, 2000);
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error adding product to cart. Please try again.');
    }
}

// Handle quantity changes for individual flavors on the product detail page
function handleFlavorQty(productId, slug, change) {
    try {
        const input = document.getElementById(`qty-${productId}-${slug}`);
        if (!input) return;

        let current = parseInt(input.value, 10);
        if (isNaN(current)) current = 0;

        let next = current + change;
        if (next < 0) next = 0;

        input.value = next;
    } catch (error) {
        console.error('Error updating flavor quantity:', error);
    }
}

// Make flavor quantity handler available for inline onclick
window.handleFlavorQty = handleFlavorQty;

function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');
        const count = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(el => {
            if (el) el.textContent = count;
        });
    } catch (error) {
        console.error('Error updating cart count:', error);
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(el => {
            if (el) el.textContent = '0';
        });
    }
}

// Load cart page
function loadCart() {
    try {
        const cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');
        const cartItems = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        const isLoggedIn = !!currentUser;
        
        if (!cartItems) return;
        
        if (cart.length === 0) {
            cartItems.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
            updateOrderSummary(0);
            return;
        }
        
        cartItems.style.display = 'block';
        if (emptyCart) emptyCart.style.display = 'none';
        
        // Escape HTML to prevent XSS
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };
        
        cartItems.innerHTML = cart.map(item => {
            const itemId = String(item.id);
            const itemName = escapeHtml(item.name || 'Unnamed Product');
            const itemBrand = escapeHtml(item.brand || '');
            const itemFlavor = escapeHtml(item.flavor || '');
            const itemPrice = parseFloat(item.price || 0).toFixed(2);
            const itemQuantity = parseInt(item.quantity || 1);
            const itemImage = getImageSource(item.image) || '';
            
            const selectedFlavor = item.selectedFlavor || item.flavor || '';
            const lineTotal = (parseFloat(item.price || 0) * itemQuantity).toFixed(2);
            return `
                <div class="cart-item">
                    ${itemImage ? `<img src="${itemImage}" alt="${itemName}" class="cart-item-image" onerror="this.onerror=null; this.src=''; this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="product-image-placeholder-full" style="display: none; width: 100%; max-width: 200px; margin: 0 auto 15px;">
                        <i class="fas fa-image"></i>
                        <span>Image Not Found</span>
                    </div>` : `<div class="product-image-placeholder-full" style="width: 100%; max-width: 200px; margin: 0 auto 15px;">
                        <i class="fas fa-image"></i>
                        <span>No Image</span>
                    </div>`}
                    <div class="cart-item-info">
                        <h3 class="cart-item-name">${itemName}</h3>
                        <p class="cart-item-meta">Brand: ${itemBrand || 'N/A'}${selectedFlavor ? ` | Flavor: ${escapeHtml(selectedFlavor)}` : ''}</p>
                        ${isLoggedIn ? `<p class="cart-item-price">$${lineTotal}</p>` : `
                            <div style="display:flex; align-items:center; gap:8px; justify-self:end;">
                                <span style="width:12px; height:12px; border-left:3px solid #ef4444;"></span>
                                <span style="color:#ef4444; font-weight:700; font-size:12px; text-transform:uppercase;">Login to view prices</span>
                            </div>
                        `}
                        <div class="cart-item-actions">
                            <div class="quantity-selector">
                                <button onclick="updateCartQuantity('${itemId}', -1)" aria-label="Decrease quantity">-</button>
                                <input type="number" value="${itemQuantity}" min="1" id="qty-${itemId}" onchange="updateCartQuantityFromInput('${itemId}')">
                                <button onclick="updateCartQuantity('${itemId}', 1)" aria-label="Increase quantity">+</button>
                            </div>
                            <button class="remove-item-btn" onclick="removeFromCart('${itemId}')">Remove</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 0)), 0);
        updateOrderSummary(subtotal);
    } catch (error) {
        console.error('Error loading cart:', error);
        const cartItems = document.getElementById('cartItems');
        if (cartItems) {
            cartItems.innerHTML = '<div style="text-align: center; padding: 40px;"><p>Error loading cart. Please refresh the page.</p></div>';
        }
    }
}

// Update cart quantity from input field
function updateCartQuantityFromInput(productId) {
    try {
        const input = document.getElementById(`qty-${productId}`);
        if (!input) return;
        
        const newQuantity = parseInt(input.value) || 1;
        if (newQuantity < 1) {
            input.value = 1;
            return;
        }
        
        let cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');
        const item = cart.find(i => String(i.id) === String(productId));
        
        if (item) {
            // Check stock availability
            const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
            const product = products.find(p => String(p.id) === String(productId));
            if (product) {
                const productStock = parseInt(product.stock || 0);
                if (productStock > 0 && newQuantity > productStock) {
                    alert(`Only ${productStock} items available in stock!`);
                    input.value = item.quantity;
                    return;
                }
            }
            item.quantity = newQuantity;
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
            loadCart();
            updateCartCount();
        }
    } catch (error) {
        console.error('Error updating cart quantity from input:', error);
    }
}

window.updateCartQuantityFromInput = updateCartQuantityFromInput;

function updateCartQuantity(productId, change) {
    try {
        let cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');
        const item = cart.find(i => String(i.id) === String(productId));
        
        if (item) {
            const newQuantity = parseInt(item.quantity) + parseInt(change);
            if (newQuantity < 1) {
                cart = cart.filter(i => String(i.id) !== String(productId));
            } else {
                // Check stock availability
                const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
                const product = products.find(p => String(p.id) === String(productId));
                if (product) {
                    const productStock = parseInt(product.stock || 0);
                    if (productStock > 0 && newQuantity > productStock) {
                        alert(`Only ${productStock} items available in stock!`);
                        return;
                    }
                }
                item.quantity = newQuantity;
            }
        }
        
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
        loadCart();
        updateCartCount();
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        alert('Error updating cart quantity. Please try again.');
    }
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART));
    cart = cart.filter(i => i.id !== productId);
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

function updateOrderSummary(subtotal) {
    try {
        const subtotalValue = parseFloat(subtotal) || 0;
        const tax = subtotalValue * 0.1;
        const shipping = subtotalValue > 0 ? 10 : 0;
        const total = subtotalValue + tax + shipping;
        const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        const isLoggedIn = !!currentUser;
        
        const subtotalEl = document.getElementById('subtotal');
        const taxEl = document.getElementById('tax');
        const shippingEl = document.getElementById('shipping');
        const totalEl = document.getElementById('total');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (isLoggedIn) {
            if (subtotalEl) subtotalEl.textContent = `$${subtotalValue.toFixed(2)}`;
            if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
            if (shippingEl) shippingEl.textContent = `$${shipping.toFixed(2)}`;
            if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
        } else {
            if (subtotalEl) subtotalEl.textContent = '--';
            if (taxEl) taxEl.textContent = '--';
            if (shippingEl) shippingEl.textContent = '--';
            if (totalEl) totalEl.textContent = '--';
        }
        if (checkoutBtn) checkoutBtn.disabled = subtotalValue === 0 || !isLoggedIn;
    } catch (error) {
        console.error('Error updating order summary:', error);
    }
}

function proceedToCheckout() {
    const paymentSection = document.getElementById('paymentSection');
    if (paymentSection) {
        paymentSection.style.display = 'block';
        paymentSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function cancelCheckout() {
    const paymentSection = document.getElementById('paymentSection');
    if (paymentSection) {
        paymentSection.style.display = 'none';
    }
}

// Side viewers
function loadSideViewers() {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const leftViewer = document.getElementById('leftViewerImages');
    const rightViewer = document.getElementById('rightViewerImages');
    
    if (!leftViewer || !rightViewer) return;
    
    const featured = products.slice(0, 3);
    const newArrivals = products.slice(-3);
    
    leftViewer.innerHTML = featured.map(product => {
        let productImg = product.image;
        if (!productImg || productImg.trim() === '') {
            if (product.flavors && product.flavors.length > 0 && product.flavors[0].image) {
                productImg = product.flavors[0].image;
            }
        }
        const imageSrc = getImageSource(productImg);
        return `
            <div class="viewer-item" onclick="viewProduct('${product.id}')">
                <img src="${imageSrc || ''}" alt="${product.name}" onerror="this.style.display='none';">
            </div>
        `;
    }).join('');
    
    rightViewer.innerHTML = newArrivals.map(product => {
        let productImg = product.image;
        if (!productImg || productImg.trim() === '') {
            if (product.flavors && product.flavors.length > 0 && product.flavors[0].image) {
                productImg = product.flavors[0].image;
            }
        }
        const imageSrc = getImageSource(productImg);
        return `
            <div class="viewer-item" onclick="viewProduct('${product.id}')">
                <img src="${imageSrc || ''}" alt="${product.name}" onerror="this.style.display='none';">
            </div>
        `;
    }).join('');
}

// Initialize page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
  } else {
    initPage();
}

function initPage() {
    updateStoreName();
    
    if (document.getElementById('sliderWrapper')) {
        initSlider();
    }
    
    if (document.getElementById('productsGrid')) {
        initFilters();
        loadProducts();
        loadSideViewers();
    }
    
    updateCartCount();
}

// Payment form submission
document.addEventListener('DOMContentLoaded', function() {
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Order placed successfully! (This is a demo - no actual payment processed)');
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
            window.location.href = 'index.html';
        });
    }
});
