/* Firebase Database Service
   Replaces localStorage with Firestore for server-based storage
   Provides real-time synchronization and better performance
*/

// Enable offline persistence for better UX
db.enablePersistence().catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support persistence.');
  }
});

// Collection reference
const BRANDS_COLLECTION = 'brands';

// Default data structure
const DEFAULT = {
  nike: {
    name: "NIKE",
    tagline: "Just Do It",
    description: "Discover the latest Nike collection.",
    products: [
      { id: 1, name: "Air Max Velocity", description: "Premium running shoes", price: 0 },
      { id: 2, name: "Sport Pro Hoodie", description: "Lightweight performance hoodie", price: 0 }
    ],
    subBrands: [{ key: "air", name: "Air" }]
  },
  adidas: {
    name: "ADIDAS",
    tagline: "Impossible Is Nothing",
    description: "Explore Adidas collections.",
    products: [{ id: 1, name: "Ultraboost Elite", description: "Next-gen running shoes", price: 0 }],
    subBrands: [{ key: "ultra", name: "Ultraboost" }]
  },
  puma: {
    name: "PUMA",
    tagline: "Forever Faster",
    description: "Bold Puma designs.",
    products: [{ id: 1, name: "Speed Cat RS", description: "Motorsport-inspired sneakers", price: 0 }],
    subBrands: []
  }
};

// Cache for offline access
let brandsDataCache = null;
let unsubscribeListener = null;

/**
 * Load brands data from Firestore
 * @returns {Promise<Object>} Brands data object
 */
async function loadFromStorage() {
  try {
    // Check cache first for instant loading
    if (brandsDataCache) {
      return brandsDataCache;
    }

    const doc = await db.collection(BRANDS_COLLECTION).doc('data').get();
    
    if (doc.exists) {
      const data = doc.data();
      // Ensure subBrands and products exist
      Object.keys(data).forEach(k => {
        if (!Array.isArray(data[k].products)) data[k].products = [];
        if (!Array.isArray(data[k].subBrands)) data[k].subBrands = [];
      });
      brandsDataCache = data;
      return data;
    } else {
      // Initialize with default data if collection doesn't exist
      await initializeDefaultData();
      return JSON.parse(JSON.stringify(DEFAULT));
    }
  } catch (error) {
    console.error("Firestore load error:", error);
    // Fallback to default data
    return JSON.parse(JSON.stringify(DEFAULT));
  }
}

/**
 * Save brands data to Firestore
 * @param {Object} data - Brands data to save
 */
async function saveToStorage(data) {
  try {
    await db.collection(BRANDS_COLLECTION).doc('data').set(data, { merge: false });
    brandsDataCache = data;
  } catch (error) {
    console.error("Firestore save error:", error);
    throw error;
  }
}

/**
 * Initialize Firestore with default data
 */
async function initializeDefaultData() {
  try {
    const doc = await db.collection(BRANDS_COLLECTION).doc('data').get();
    if (!doc.exists) {
      await db.collection(BRANDS_COLLECTION).doc('data').set(DEFAULT);
      brandsDataCache = DEFAULT;
    }
  } catch (error) {
    console.error("Initialize default data error:", error);
  }
}

/**
 * Set up real-time listener for data changes
 * Automatically updates the UI when data changes in Firestore
 * @param {Function} callback - Function to call when data changes
 */
function setupRealtimeListener(callback) {
  // Remove existing listener if any
  if (unsubscribeListener) {
    unsubscribeListener();
  }

  unsubscribeListener = db.collection(BRANDS_COLLECTION).doc('data')
    .onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        // Ensure subBrands and products exist
        Object.keys(data).forEach(k => {
          if (!Array.isArray(data[k].products)) data[k].products = [];
          if (!Array.isArray(data[k].subBrands)) data[k].subBrands = [];
        });
        brandsDataCache = data;
        if (callback) callback(data);
      }
    }, (error) => {
      console.error("Realtime listener error:", error);
    });
}

/**
 * Remove real-time listener
 */
function removeRealtimeListener() {
  if (unsubscribeListener) {
    unsubscribeListener();
    unsubscribeListener = null;
  }
}

/**
 * Get current cached data (for synchronous access)
 * @returns {Object|null} Cached brands data
 */
function getCachedData() {
  return brandsDataCache;
}

// Initialize on load
(async function init() {
  try {
    await loadFromStorage();
  } catch (error) {
    console.error("Initial load error:", error);
  }
})();


