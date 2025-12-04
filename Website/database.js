/* Database Service - Local Storage Based Database */

// Collections storage keys
const COLLECTIONS = {
  PRODUCTS: 'localDB_products',
  ORDERS: 'localDB_orders',
  BRANDS: 'localDB_brands',
  SUB_BRANDS: 'localDB_subBrands',
  USERS: 'localDB_users',
  CART: 'cart'
};

// Cache
let productsCache = null;
let brandsCache = null;
let subBrandsCache = null;

// Event system for real-time updates
const dbEvents = new EventTarget();
window.dbEvents = dbEvents; // Make accessible globally

// Generate unique ID
function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get timestamp
function getTimestamp() {
  return new Date();
}

// Local Storage Helpers
function getCollection(collectionKey) {
  try {
    const data = localStorage.getItem(collectionKey);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${collectionKey}:`, error);
    return [];
  }
}

function saveCollection(collectionKey, data) {
  try {
    // Ensure data is valid before saving
    if (!data || !Array.isArray(data)) {
      console.error(`Invalid data for ${collectionKey}:`, data);
      throw new Error(`Invalid data format for ${collectionKey}`);
    }
    
    // Save to localStorage
    const jsonData = JSON.stringify(data);
    localStorage.setItem(collectionKey, jsonData);
    
    // Update cache if applicable
    if (collectionKey === COLLECTIONS.PRODUCTS) {
      productsCache = data;
    } else if (collectionKey === COLLECTIONS.BRANDS) {
      brandsCache = data;
    } else if (collectionKey === COLLECTIONS.SUB_BRANDS) {
      subBrandsCache = data;
    }
    
    // Trigger custom event for real-time updates
    dbEvents.dispatchEvent(new CustomEvent('collection-change', { 
      detail: { collection: collectionKey, data } 
    }));
    
    console.log(`✅ Saved ${data.length} items to ${collectionKey}`);
    return true;
  } catch (error) {
    console.error(`❌ Error saving ${collectionKey}:`, error);
    // Check if it's a quota exceeded error
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.error('⚠️ localStorage quota exceeded. Please clear some data.');
      throw new Error('Storage quota exceeded. Please clear some data.');
    }
    throw error;
  }
}

// Find item by ID
function findById(collection, id) {
  return collection.find(item => item.id === id);
}

// Update item by ID
function updateById(collection, id, updates) {
  const index = collection.findIndex(item => item.id === id);
  if (index !== -1) {
    // Deep merge to ensure all fields are updated, including brandId and subBrandId
    const existingItem = collection[index];
    collection[index] = { 
      ...existingItem, 
      ...updates,
      // Explicitly preserve brandId and subBrandId if they're provided
      brandId: updates.brandId !== undefined ? updates.brandId : existingItem.brandId,
      subBrandId: updates.subBrandId !== undefined ? updates.subBrandId : existingItem.subBrandId
    };
    console.log('Updated item:', { id, brandId: collection[index].brandId, subBrandId: collection[index].subBrandId });
    return true;
  }
  return false;
}

// Delete item by ID
function deleteById(collection, id) {
  const index = collection.findIndex(item => item.id === id);
  if (index !== -1) {
    collection.splice(index, 1);
    return true;
  }
  return false;
}

/* ========== PRODUCTS ========== */
async function getAllProducts() {
  try {
    const products = getCollection(COLLECTIONS.PRODUCTS);
    // Sort by createdAt descending
    products.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });
    productsCache = products;
    return products;
  } catch (error) {
    console.error("Error loading products:", error);
    return productsCache || [];
  }
}

async function getProductById(id) {
  try {
    const products = getCollection(COLLECTIONS.PRODUCTS);
    const product = findById(products, id);
    return product || null;
  } catch (error) {
    console.error("Error loading product:", error);
    return null;
  }
}

async function getProductsByBrand(brandId) {
  try {
    const products = getCollection(COLLECTIONS.PRODUCTS);
    return products
      .filter(p => p.brandId === brandId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
  } catch (error) {
    console.error("Error loading products by brand:", error);
    return [];
  }
}

async function searchProducts(query) {
  try {
    const products = getCollection(COLLECTIONS.PRODUCTS);
    const lowerQuery = query.toLowerCase();
    return products.filter(product => {
      const name = (product.name || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      return name.includes(lowerQuery) || description.includes(lowerQuery);
    });
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}

async function addProduct(productData) {
  try {
    const products = getCollection(COLLECTIONS.PRODUCTS);
    
    // Ensure brandId and subBrandId are properly set (convert empty strings to null)
    const brandId = productData.brandId && String(productData.brandId).trim() ? String(productData.brandId).trim() : null;
    const subBrandId = productData.subBrandId && String(productData.subBrandId).trim() ? String(productData.subBrandId).trim() : null;
    
    const product = {
      id: generateId(),
      ...productData,
      // Explicitly set brandId and subBrandId
      brandId: brandId,
      subBrandId: subBrandId,
      createdAt: getTimestamp(),
      updatedAt: getTimestamp(),
      stock: productData.stock || 0,
      status: productData.status || 'active'
    };
    
    products.push(product);
    saveCollection(COLLECTIONS.PRODUCTS, products);
    console.log('Product added to database:', { 
      id: product.id, 
      brandId: product.brandId, 
      subBrandId: product.subBrandId,
      fullProduct: product
    });
    return product.id;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
}

async function updateProduct(id, productData) {
  try {
    const products = getCollection(COLLECTIONS.PRODUCTS);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      throw new Error('Product not found');
    }
    
    // Ensure brandId and subBrandId are properly set (convert empty strings to null)
    const brandId = productData.brandId && String(productData.brandId).trim() ? String(productData.brandId).trim() : null;
    const subBrandId = productData.subBrandId && String(productData.subBrandId).trim() ? String(productData.subBrandId).trim() : null;
    
    const updateData = {
      ...productData,
      brandId: brandId,
      subBrandId: subBrandId,
      updatedAt: getTimestamp()
    };
    
    // Explicitly update the product
    products[productIndex] = { 
      ...products[productIndex], 
      ...updateData,
      // Force update brandId and subBrandId
      brandId: brandId,
      subBrandId: subBrandId
    };
    
    saveCollection(COLLECTIONS.PRODUCTS, products);
    console.log('Product updated in database:', { 
      id, 
      brandId: products[productIndex].brandId, 
      subBrandId: products[productIndex].subBrandId,
      fullProduct: products[productIndex]
    });
    return true;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

async function deleteProduct(id) {
  try {
    const products = getCollection(COLLECTIONS.PRODUCTS);
    if (deleteById(products, id)) {
      saveCollection(COLLECTIONS.PRODUCTS, products);
      return true;
    }
    throw new Error('Product not found');
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

/* ========== BRANDS ========== */
async function getAllBrands() {
  try {
    const brands = getCollection(COLLECTIONS.BRANDS);
    // Sort by name
    brands.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    brandsCache = brands;
    return brands;
  } catch (error) {
    console.error("Error loading brands:", error);
    return brandsCache || [];
  }
}

async function addBrand(brandData) {
  try {
    const brands = getCollection(COLLECTIONS.BRANDS);
    
    // Validate that brand name and slug are provided
    if (!brandData.name || !brandData.slug) {
      throw new Error('Brand name and slug are required');
    }
    
    // Check if brand with same name already exists
    const existingBrand = brands.find(b => 
      b.name.toLowerCase().trim() === brandData.name.toLowerCase().trim()
    );
    if (existingBrand) {
      console.warn('Brand with same name already exists:', existingBrand);
      // Return existing brand ID instead of creating duplicate
      return existingBrand.id;
    }
    
    const brand = {
      id: generateId(),
      name: brandData.name.trim(),
      slug: brandData.slug.trim(),
      description: brandData.description ? brandData.description.trim() : '',
      createdAt: getTimestamp()
    };
    
    brands.push(brand);
    saveCollection(COLLECTIONS.BRANDS, brands);
    
    // Update cache
    brandsCache = brands;
    
    console.log('Brand saved to database:', { 
      id: brand.id, 
      name: brand.name, 
      slug: brand.slug,
      totalBrands: brands.length 
    });
    
    return brand.id;
  } catch (error) {
    console.error("Error adding brand:", error);
    throw error;
  }
}

async function deleteBrand(id) {
  try {
    const brands = getCollection(COLLECTIONS.BRANDS);
    if (deleteById(brands, id)) {
      saveCollection(COLLECTIONS.BRANDS, brands);
      return true;
    }
    throw new Error('Brand not found');
  } catch (error) {
    console.error("Error deleting brand:", error);
    throw error;
  }
}

/* ========== SUB-BRANDS ========== */
async function getAllSubBrands() {
  try {
    const subBrands = getCollection(COLLECTIONS.SUB_BRANDS);
    // Sort by name
    subBrands.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    subBrandsCache = subBrands;
    return subBrands;
  } catch (error) {
    console.error("Error loading sub-brands:", error);
    return subBrandsCache || [];
  }
}

async function getSubBrandsByBrand(brandId) {
  try {
    const subBrands = getCollection(COLLECTIONS.SUB_BRANDS);
    return subBrands
      .filter(sb => sb.brandId === brandId)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } catch (error) {
    console.error("Error loading sub-brands by brand:", error);
    return [];
  }
}

async function addSubBrand(subBrandData) {
  try {
    const subBrands = getCollection(COLLECTIONS.SUB_BRANDS);
    const subBrand = {
      id: generateId(),
      ...subBrandData,
      createdAt: getTimestamp()
    };
    subBrands.push(subBrand);
    saveCollection(COLLECTIONS.SUB_BRANDS, subBrands);
    return subBrand.id;
  } catch (error) {
    console.error("Error adding sub-brand:", error);
    throw error;
  }
}

async function deleteSubBrand(id) {
  try {
    const subBrands = getCollection(COLLECTIONS.SUB_BRANDS);
    if (deleteById(subBrands, id)) {
      saveCollection(COLLECTIONS.SUB_BRANDS, subBrands);
      return true;
    }
    throw new Error('Sub-brand not found');
  } catch (error) {
    console.error("Error deleting sub-brand:", error);
    throw error;
  }
}

/* ========== ORDERS ========== */
async function createOrder(orderData) {
  try {
    const orders = getCollection(COLLECTIONS.ORDERS);
    const order = {
      id: generateId(),
      ...orderData,
      status: 'pending',
      orderNumber: 'ORD' + Date.now(),
      createdAt: getTimestamp(),
      updatedAt: getTimestamp()
    };
    orders.push(order);
    saveCollection(COLLECTIONS.ORDERS, orders);
    return order.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

async function getAllOrders() {
  try {
    const orders = getCollection(COLLECTIONS.ORDERS);
    // Sort by createdAt descending
    orders.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });
    return orders;
  } catch (error) {
    console.error("Error loading orders:", error);
    return [];
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    const orders = getCollection(COLLECTIONS.ORDERS);
    if (updateById(orders, orderId, {
      status,
      updatedAt: getTimestamp()
    })) {
      saveCollection(COLLECTIONS.ORDERS, orders);
      return true;
    }
    throw new Error('Order not found');
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
}

/* ========== CART ========== */
function getCart() {
  try {
    const cart = localStorage.getItem(COLLECTIONS.CART);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(COLLECTIONS.CART, JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart:", error);
  }
}

function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '',
      quantity: quantity
    });
  }
  
  saveCart(cart);
  return cart;
}

function removeFromCart(productId) {
  const cart = getCart();
  const filtered = cart.filter(item => item.id !== productId);
  saveCart(filtered);
  return filtered;
}

function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  if (item) {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    item.quantity = quantity;
  }
  saveCart(cart);
  return cart;
}

function clearCart() {
  saveCart([]);
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}

/* ========== REAL-TIME LISTENERS (using custom events) ========== */
function setupProductsListener(callback) {
  const handler = (e) => {
    if (e.detail.collection === COLLECTIONS.PRODUCTS) {
      getAllProducts().then(products => {
        if (callback) callback(products);
      });
    }
  };
  dbEvents.addEventListener('collection-change', handler);
  // Return unsubscribe function
  return () => dbEvents.removeEventListener('collection-change', handler);
}

function setupOrdersListener(callback) {
  const handler = (e) => {
    if (e.detail.collection === COLLECTIONS.ORDERS) {
      getAllOrders().then(orders => {
        if (callback) callback(orders);
      });
    }
  };
  dbEvents.addEventListener('collection-change', handler);
  return () => dbEvents.removeEventListener('collection-change', handler);
}

function setupBrandsListener(callback) {
  const handler = (e) => {
    if (e.detail.collection === COLLECTIONS.BRANDS) {
      getAllBrands().then(brands => {
        if (callback) callback(brands);
      });
    }
  };
  dbEvents.addEventListener('collection-change', handler);
  return () => dbEvents.removeEventListener('collection-change', handler);
}

function setupSubBrandsListener(callback) {
  const handler = (e) => {
    if (e.detail.collection === COLLECTIONS.SUB_BRANDS) {
      getAllSubBrands().then(subBrands => {
        if (callback) callback(subBrands);
      });
    }
  };
  dbEvents.addEventListener('collection-change', handler);
  return () => dbEvents.removeEventListener('collection-change', handler);
}

/* ========== INITIALIZE DEFAULT DATA ========== */
async function initializeDefaultData() {
  try {
    // Only initialize if data doesn't exist (first time setup)
    const existingBrands = getCollection(COLLECTIONS.BRANDS);
    const existingSubBrands = getCollection(COLLECTIONS.SUB_BRANDS);
    
    // If brands already exist, don't reinitialize
    if (existingBrands.length > 0) {
      console.log('Brands and sub-brands already exist. Skipping initialization.');
      return;
    }
    
    console.log('Initializing default brands and sub-brands...');
    
    // Add new brands
    const defaultBrands = [
        { name: 'VGOD', slug: 'vgod', description: 'Premium VGOD vape products' },
        { name: 'GEEK', slug: 'geek', description: 'Geek vape devices and accessories' },
        { name: 'VIHO', slug: 'viho', description: 'VIHO premium vape products' },
        { name: 'Raz', slug: 'raz', description: 'Raz vape devices' },
        { name: 'PRIV', slug: 'priv', description: 'PRIV vape products' },
        { name: 'AirBox', slug: 'airbox', description: 'AirBox vape devices' },
        { name: 'AirDia', slug: 'airdia', description: 'AirDia vape products' },
        { name: 'Foger', slug: 'foger', description: 'Foger vape devices and kits' }
      ];
      
      const newBrands = defaultBrands.map(brand => ({
        id: generateId(),
        ...brand,
        createdAt: getTimestamp()
      }));
      
      saveCollection(COLLECTIONS.BRANDS, newBrands);
      
      // Add sub-brands after brands are created
      const allBrandsList = getCollection(COLLECTIONS.BRANDS);
      const vgodBrand = allBrandsList.find(b => b.slug === 'vgod');
      const geekBrand = allBrandsList.find(b => b.slug === 'geek');
      const vihoBrand = allBrandsList.find(b => b.slug === 'viho');
      const razBrand = allBrandsList.find(b => b.slug === 'raz');
      const privBrand = allBrandsList.find(b => b.slug === 'priv');
      const airboxBrand = allBrandsList.find(b => b.slug === 'airbox');
      const airdiaBrand = allBrandsList.find(b => b.slug === 'airdia');
      const fogerBrand = allBrandsList.find(b => b.slug === 'foger');
      
      const defaultSubBrands = [];
      
      // VGOD sub-brands
      if (vgodBrand) {
        defaultSubBrands.push(
          { brandId: vgodBrand.id, name: 'VGOD Salts', slug: 'vgod-salts', description: 'VGOD Salts products' },
          { brandId: vgodBrand.id, name: 'Salt Bae', slug: 'salt-bae', description: 'Salt Bae products' },
          { brandId: vgodBrand.id, name: 'Reds', slug: 'reds', description: 'Reds products' }
        );
      }
      
      // GEEK sub-brands
      if (geekBrand) {
        defaultSubBrands.push(
          { brandId: geekBrand.id, name: 'Geek Bar', slug: 'geek-bar', description: 'Geek Bar products' },
          { brandId: geekBrand.id, name: 'Geek Plus X 25K', slug: 'geek-plus-x-25k', description: 'Geek Plus X 25K products' }
        );
      }
      
      // VIHO sub-brands
      if (vihoBrand) {
        defaultSubBrands.push(
          { brandId: vihoBrand.id, name: 'TYSON Legends 30K', slug: 'tyson-legends-30k', description: 'TYSON Legends 30K products' },
          { brandId: vihoBrand.id, name: 'VIHO TRX 50K', slug: 'viho-trx-50k', description: 'VIHO TRX 50K products' },
          { brandId: vihoBrand.id, name: 'VIHO 10K 0904', slug: 'viho-10k-0904', description: 'VIHO 10K 0904 products' },
          { brandId: vihoBrand.id, name: 'VIHO 20K 0915', slug: 'viho-20k-0915', description: 'VIHO 20K 0915 products' }
        );
      }
      
      // Raz sub-brands
      if (razBrand) {
        defaultSubBrands.push(
          { brandId: razBrand.id, name: 'RAZ TN9000', slug: 'raz-tn9000', description: 'RAZ TN9000 products' },
          { brandId: razBrand.id, name: 'Air Dimond Spark', slug: 'air-dimond-spark', description: 'Air Dimond Spark products' },
          { brandId: razBrand.id, name: 'Raz LTX 25K', slug: 'raz-ltx-25k', description: 'Raz LTX 25K products' },
          { brandId: razBrand.id, name: 'AirMini', slug: 'airmini', description: 'AirMini products' },
          { brandId: razBrand.id, name: 'Raz Ryl Classic 35K', slug: 'raz-ryl-classic-35k', description: 'Raz Ryl Classic 35K products' },
          { brandId: razBrand.id, name: 'Myle', slug: 'myle-raz', description: 'Myle products' }
        );
      }
      
      // PRIV sub-brands
      if (privBrand) {
        defaultSubBrands.push(
          { brandId: privBrand.id, name: 'PRIV 15K Puffs. #0901', slug: 'priv-15k-puffs-0901', description: 'PRIV 15K Puffs. #0901 products' },
          { brandId: privBrand.id, name: 'Raz TN 9000 #906', slug: 'raz-tn-9000-906', description: 'Raz TN 9000 #906 products' },
          { brandId: privBrand.id, name: 'Geek #0920', slug: 'geek-0920', description: 'Geek #0920 products' },
          { brandId: privBrand.id, name: 'Tyson 0907', slug: 'tyson-0907', description: 'Tyson 0907 products' }
        );
      }
      
      // AirBox sub-brands
      if (airboxBrand) {
        defaultSubBrands.push(
          { brandId: airboxBrand.id, name: 'AirBox Nex 0910', slug: 'airbox-nex-0910', description: 'AirBox Nex 0910 products' },
          { brandId: airboxBrand.id, name: 'AirBar Aura 0912', slug: 'airbar-aura-0912', description: 'AirBar Aura 0912 products' },
          { brandId: airboxBrand.id, name: 'AirBar AB5000 0912', slug: 'airbar-ab5000-0912', description: 'AirBar AB5000 0912 products' },
          { brandId: airboxBrand.id, name: 'AirBar AB 10K 0914', slug: 'airbar-ab-10k-0914', description: 'AirBar AB 10K 0914 products' }
        );
      }
      
      // AirDia sub-brands
      if (airdiaBrand) {
        defaultSubBrands.push(
          { brandId: airdiaBrand.id, name: 'Foger Kit 30K', slug: 'foger-kit-30k', description: 'Foger Kit 30K products' },
          { brandId: airdiaBrand.id, name: 'AirBar Max', slug: 'airbar-max', description: 'AirBar Max products' },
          { brandId: airdiaBrand.id, name: 'Airmini 0913', slug: 'airmini-0913', description: 'Airmini 0913 products' },
          { brandId: airdiaBrand.id, name: 'Myle', slug: 'myle-airdia', description: 'Myle products' }
        );
      }
      
      // Foger sub-brands
      if (fogerBrand) {
        defaultSubBrands.push(
          { brandId: fogerBrand.id, name: 'Foger Pro kit 30K', slug: 'foger-pro-kit-30k', description: 'Foger Pro kit 30K products' },
          { brandId: fogerBrand.id, name: 'Foger Pro Pods', slug: 'foger-pro-pods', description: 'Foger Pro Pods products' },
          { brandId: fogerBrand.id, name: 'YOVO PODS', slug: 'yovo-pods', description: 'YOVO PODS products' }
        );
      }
      
      if (defaultSubBrands.length > 0) {
        const newSubBrands = defaultSubBrands.map(subBrand => ({
          id: generateId(),
          ...subBrand,
          createdAt: getTimestamp()
        }));
        
        saveCollection(COLLECTIONS.SUB_BRANDS, newSubBrands);
      }

  } catch (error) {
    console.error("Error initializing default data:", error);
  }
}

// Initialize on load (only if data doesn't exist)
(async function init() {
  try {
    // Check if this is first time setup
    const existingBrands = getCollection(COLLECTIONS.BRANDS);
    if (existingBrands.length === 0) {
      await initializeDefaultData();
      console.log('Default data initialized successfully');
    } else {
      console.log('Existing data found. Skipping initialization.');
    }
  } catch (error) {
    console.error("Initialization error:", error);
  }
})();
