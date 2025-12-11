// Data Storage using LocalStorage
const STORAGE_KEYS = {
    STORE_NAME: 'storeName',
    PRODUCTS: 'products',
    BRANDS: 'brands',
    FLAVORS: 'flavors',
    SLIDER_IMAGES: 'sliderImages',
    CART: 'cart'
};

// Initialize default data
function initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.STORE_NAME)) {
        localStorage.setItem(STORAGE_KEYS.STORE_NAME, 'Premium Store');
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BRANDS)) {
        localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FLAVORS)) {
        localStorage.setItem(STORAGE_KEYS.FLAVORS, JSON.stringify(['Vanilla', 'Chocolate', 'Strawberry']));
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
}

// Initialize on page load
initializeData();

// Initialize products from images (only if products don't exist)
function initializeProducts() {
    // Check if products already exist
    const existingProducts = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
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
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    
    // Initialize brands from products (only unique brands)
    const uniqueBrands = [...new Set(products.map(p => p.brand))];
    const existingBrands = JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANDS) || '[]');
    const brandsToAdd = uniqueBrands.filter(b => !existingBrands.includes(b));
    if (brandsToAdd.length > 0) {
        localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify([...existingBrands, ...brandsToAdd]));
    }

    console.log(`✅ Initialized ${products.length} products successfully!`);
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
        slide.innerHTML = `<img src="${image}" alt="Slide ${index + 1}" class="slide-image">`;
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
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
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

// Helper function to get image source (checks images folder first)
function getImageSource(imagePath) {
    if (!imagePath || imagePath.trim() === '') {
        return null;
    }
    
    // If it's already a full URL or data URL, use it
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:image')) {
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
    
    // Get image source - checks images folder first, then base64, then external URLs
    const imageSrc = getImageSource(product.image);
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
        ? `<div class="product-image-container-full">
             <img src="${imageSrc}" 
                  alt="${productName}" 
                  class="product-image-full" 
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
        : `<div class="product-image-placeholder-full">
             <i class="fas fa-image"></i>
             <span>No Image</span>
             <small>Upload in Admin</small>
           </div>`;
    
    return `
        <div class="product-card-full" data-product-id="${productId}">
            <div class="product-image-wrapper-full">
                ${imageDisplay}
                ${isInStock ? '<div class="stock-badge"><i class="fas fa-check-circle"></i> In Stock</div>' : '<div class="stock-badge out-of-stock"><i class="fas fa-times-circle"></i> Out of Stock</div>'}
            </div>
            <div class="product-info-full">
                <div class="product-header-full">
                    <h3 class="product-name-full">${productName}</h3>
                    <div class="product-price-full">
                        <span class="price-currency">$</span>
                        <span class="price-amount">${productPrice}</span>
                    </div>
                </div>
                <div class="product-meta-full">
                    <div class="meta-item">
                        <i class="fas fa-tag"></i>
                        <span>${productBrand || 'No Brand'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-palette"></i>
                        <span>${productFlavor || 'No Flavor'}</span>
                    </div>
                    ${productStock > 0 ? `<div class="meta-item">
                        <i class="fas fa-box"></i>
                        <span>${productStock} in stock</span>
                    </div>` : ''}
                </div>
                <div class="product-actions-full">
                    <button class="btn-view-full" onclick="viewProduct('${productId}')" title="View Details">
                        <i class="fas fa-eye"></i>
                        <span>View</span>
                    </button>
                    <button class="btn-add-cart-full coming-soon-btn" onclick="addToCart('${productId}')" title="Coming Soon - Add to Cart">
                        <i class="fas fa-cart-plus"></i>
                        <span>Coming Soon</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Initialize home page
function initializeHomePage() {
    updateStoreName();
}

// Filter functions
function initFilters() {
    const brands = JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANDS));
    const flavors = JSON.parse(localStorage.getItem(STORAGE_KEYS.FLAVORS));
    
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
        
        // Escape HTML to prevent XSS
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };
        
        const productName = escapeHtml(product.name || 'Unnamed Product');
        const productBrand = escapeHtml(product.brand || '');
        const productFlavor = escapeHtml(product.flavor || '');
        const productDescription = escapeHtml(product.description || 'No description available.');
        const productPrice = parseFloat(product.price || 0).toFixed(2);
        const productStock = parseInt(product.stock || 0);
        const productStatus = escapeHtml(product.status || 'Available');
        
        // Get flavors array (new) or fallback to single flavor (backward compatibility)
        const flavors = product.flavors && Array.isArray(product.flavors) && product.flavors.length > 0 
            ? product.flavors 
            : (product.flavor ? [{ name: product.flavor, image: product.image || '' }] : []);
        
        // Determine initial main image - use selected flavor image or product image
        let initialMainImage = product.image || '';
        if (flavors.length > 0 && flavors[0].image) {
            initialMainImage = flavors[0].image;
        }
        
        const images = [initialMainImage, ...(product.additionalImages || [])].filter(img => img && img.trim() !== '');
        const mainImage = images[0] ? getImageSource(images[0]) : '';
        const thumbnails = images.slice(0, 5);
        
        const imageDisplay = mainImage 
            ? `<img src="${mainImage}" alt="${productName}" class="main-image" id="mainImage" onerror="this.onerror=null; this.src=''; this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="product-image-placeholder-full" style="display: none;">
                   <i class="fas fa-image"></i>
                   <span>Image Not Found</span>
               </div>`
            : `<div class="product-image-placeholder-full">
                   <i class="fas fa-image"></i>
                   <span>No Image Available</span>
               </div>`;
        
        // Build flavor selection UI
        let flavorSelectionHTML = '';
        if (flavors.length > 1) {
            flavorSelectionHTML = `
                <div class="flavor-selection-section">
                    <h3><i class="fas fa-palette"></i> Select Flavor</h3>
                    <div class="flavors-grid" id="flavorsGrid">
                        ${flavors.map((flavor, index) => {
                            const flavorName = escapeHtml(flavor.name || '');
                            const flavorImage = flavor.image ? getImageSource(flavor.image) : '';
                            const isSelected = index === 0 ? 'selected' : '';
                            return `
                                <div class="flavor-option ${isSelected}" 
                                     data-flavor-name="${flavorName}" 
                                     data-flavor-image="${flavorImage}"
                                     onclick="selectFlavor('${flavorName}', '${flavorImage}', this)">
                                    ${flavorImage ? `
                                        <img src="${flavorImage}" alt="${flavorName}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                        <div class="flavor-image-placeholder" style="display: none;">
                                            <i class="fas fa-image"></i>
                                        </div>
                                    ` : `
                                        <div class="flavor-image-placeholder">
                                            <i class="fas fa-image"></i>
                                        </div>
                                    `}
                                    <span class="flavor-name">${flavorName}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        } else if (flavors.length === 1) {
            // Single flavor - just show it
            flavorSelectionHTML = `
                <div class="flavor-selection-section">
                    <h3><i class="fas fa-palette"></i> Flavor</h3>
                    <div class="single-flavor-display">
                        <span class="flavor-badge">${escapeHtml(flavors[0].name)}</span>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = `
            <div class="product-detail-images">
                ${imageDisplay}
                <div class="thumbnail-images">
                    ${thumbnails.map((img, index) => {
                        const imgSrc = getImageSource(img);
                        return imgSrc ? `
                            <img src="${imgSrc}" alt="Thumbnail ${index + 1}" 
                                 onclick="changeMainImage('${imgSrc}')" 
                                 class="${index === 0 ? 'active' : ''}"
                                 onerror="this.style.display='none';">
                        ` : '';
                    }).join('')}
                </div>
            </div>
            <div class="product-detail-info">
                <h1>${productName}</h1>
                <div class="product-detail-price">
                    <span>$${productPrice}</span>
                </div>
                <div class="product-detail-meta">
                    <p><strong>Brand:</strong> ${productBrand || 'N/A'}</p>
                    ${flavors.length > 0 ? `<p><strong>Available Flavors:</strong> ${flavors.map(f => escapeHtml(f.name)).join(', ')}</p>` : ''}
                    <p><strong>Status:</strong> ${productStatus}</p>
                    <p><strong>Stock:</strong> ${productStock} available</p>
                </div>
                ${flavorSelectionHTML}
                <div class="product-detail-description">
                    <h3>Description</h3>
                    <p>${productDescription}</p>
                </div>
                ${product.specs && Array.isArray(product.specs) && product.specs.length > 0 ? `
                    <div class="product-specs">
                        <h3>Specifications</h3>
                        <ul>
                            ${product.specs.map(spec => `<li>${escapeHtml(spec)}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                <div class="detail-actions">
                    <div class="quantity-selector">
                        <button onclick="decreaseQuantity()" aria-label="Decrease quantity">-</button>
                        <input type="number" id="productQuantity" value="1" min="1" max="${productStock || 99}">
                        <button onclick="increaseQuantity()" aria-label="Increase quantity">+</button>
                    </div>
                    <button class="btn-add-cart" onclick="addToCartFromDetail('${productId}')" ${productStock <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
        
        // Store selected flavor in a hidden input for cart
        const selectedFlavorInput = document.createElement('input');
        selectedFlavorInput.type = 'hidden';
        selectedFlavorInput.id = 'selectedFlavor';
        selectedFlavorInput.value = flavors.length > 0 ? flavors[0].name : '';
        container.querySelector('.product-detail-info').appendChild(selectedFlavorInput);
    } catch (error) {
        console.error('Error loading product detail:', error);
        const container = document.getElementById('productDetailContainer');
        if (container) {
            container.innerHTML = '<div style="text-align: center; padding: 40px;"><p>Error loading product details. Please try again.</p><a href="index.html">Return to Home</a></div>';
        }
    }
}

function changeMainImage(imageSrc) {
    try {
        const mainImage = document.getElementById('mainImage');
        const thumbnails = document.querySelectorAll('.thumbnail-images img');
        
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
        
        thumbnails.forEach(thumb => {
            thumb.classList.remove('active');
            const onclickAttr = thumb.getAttribute('onclick') || '';
            if (thumb.src === imageSrc || onclickAttr.includes(imageSrc)) {
                thumb.classList.add('active');
            }
        });
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
    // Coming Soon feature
    showComingSoonNotification('Shopping Cart feature is coming soon! Stay tuned for updates.');
    return;
    
    // This function is called from product cards
    // addToCartWithQuantity(productId, 1);
}

function addToCartFromDetail(productId) {
    // Coming Soon feature
    showComingSoonNotification('Shopping Cart feature is coming soon! Stay tuned for updates.');
    return;
    
    // This function is called from product detail page
    // const qtyInput = document.getElementById('productQuantity');
    // const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
    // const selectedFlavorInput = document.getElementById('selectedFlavor');
    // const selectedFlavor = selectedFlavorInput ? selectedFlavorInput.value : '';
    // addToCartWithQuantity(productId, quantity, selectedFlavor);
}

// Make functions globally available
window.addToCart = addToCart;
window.addToCartFromDetail = addToCartFromDetail;
window.showComingSoonNotification = showComingSoonNotification;

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
                        <p class="cart-item-price">$${itemPrice}</p>
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
        
        const subtotalEl = document.getElementById('subtotal');
        const taxEl = document.getElementById('tax');
        const shippingEl = document.getElementById('shipping');
        const totalEl = document.getElementById('total');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (subtotalEl) subtotalEl.textContent = `$${subtotalValue.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
        if (shippingEl) shippingEl.textContent = `$${shipping.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
        if (checkoutBtn) checkoutBtn.disabled = subtotalValue === 0;
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
    
    leftViewer.innerHTML = featured.map(product => `
        <div class="viewer-item" onclick="viewProduct('${product.id}')">
            <img src="${product.image}" alt="${product.name}">
        </div>
    `).join('');
    
    rightViewer.innerHTML = newArrivals.map(product => `
        <div class="viewer-item" onclick="viewProduct('${product.id}')">
            <img src="${product.image}" alt="${product.name}">
        </div>
    `).join('');
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

