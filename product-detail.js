/* Product Detail Page Script */

let currentProduct = null;
let relatedProducts = [];

async function loadProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  
  if (!productId) {
    window.location.href = 'index.html';
    return;
  }
  
  showLoading(document.getElementById('productContainer'));
  
  try {
    currentProduct = await getProductById(productId);
    
    if (!currentProduct) {
      document.getElementById('productContainer').innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px">
          <p style="color:var(--muted);font-size:16px">Product not found.</p>
          <a href="index.html" class="btn" style="margin-top:16px">Back to Shop</a>
        </div>
      `;
      return;
    }
    
    renderProduct();
    loadRelatedProducts();
  } catch (error) {
    console.error("Error loading product:", error);
    document.getElementById('productContainer').innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">
        <p>Error loading product. Please try again.</p>
      </div>
    `;
  }
}

function renderProduct() {
  const container = document.getElementById('productContainer');
  if (!container || !currentProduct) return;
  
  const brand = (allBrands || []).find(b => b.id === currentProduct.brandId);
  const subBrand = (allSubBrands || []).find(sb => sb.id === currentProduct.subBrandId);
  
  const availability = currentProduct.availability || 'available';
  const availabilityBadge = availability === 'out-of-stock' ? 
    '<div class="availability-badge out-of-stock-badge" style="position:absolute;top:16px;right:16px">Out of Stock</div>' : 
    availability === 'coming-soon' ? 
    '<div class="availability-badge coming-soon-badge" style="position:absolute;top:16px;right:16px">Coming Soon</div>' : '';
  
  const canAddToCart = availability === 'available' && currentProduct.stock > 0;
  
  container.innerHTML = `
    <div style="position:relative">
      <div class="product-image" style="background:var(--card);height:400px;display:flex;align-items:center;justify-content:center;border-radius:12px;border:1px solid var(--border);margin-bottom:16px;position:relative;${availability === 'out-of-stock' ? 'opacity:0.6' : ''}">
        ${availabilityBadge}
        ${currentProduct.image ? 
          `<img src="${currentProduct.image}" alt="${escapeHtml(currentProduct.name)}" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px"/>` :
          `<div style="color:var(--muted);font-size:16px">No Image Available</div>`
        }
      </div>
    </div>
    <div>
      <div style="margin-bottom:8px">
        <span class="text-muted" style="font-size:13px">${brand ? brand.name : 'Unbranded'}${subBrand ? ' - ' + subBrand.name : ''}</span>
      </div>
      <h1 style="font-size:28px;margin-bottom:12px;font-family:'Playfair Display',serif">${escapeHtml(currentProduct.name)}</h1>
      <div style="font-size:32px;font-weight:700;color:var(--accent);margin-bottom:16px">
        ${formatPrice(currentProduct.price)}
      </div>
      <div style="margin-bottom:24px">
        <p style="color:var(--text);line-height:1.6;font-size:15px">${escapeHtml(currentProduct.description || 'No description available.')}</p>
      </div>
      
      <div style="margin-bottom:24px;padding:16px;background:var(--card);border-radius:8px;border:1px solid var(--border)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-weight:600">Availability:</span>
          ${availability === 'available' && currentProduct.stock > 0 ? 
            `<span style="color:#10b981;font-weight:600">In Stock (${currentProduct.stock} available)</span>` :
            availability === 'coming-soon' ?
            `<span style="color:#f59e0b;font-weight:600">Coming Soon</span>` :
            `<span style="color:#ef4444;font-weight:600">Out of Stock</span>`
          }
        </div>
        ${canAddToCart ? `
          <div style="display:flex;gap:12px;align-items:center;margin-top:16px">
            <label style="font-weight:600;font-size:14px">Quantity:</label>
            <input type="number" id="quantityInput" value="1" min="1" max="${currentProduct.stock}" 
              class="input" style="width:80px;text-align:center"/>
          </div>
        ` : ''}
      </div>
      
      <div style="display:flex;gap:12px">
        <button class="btn" onclick="addToCartFromDetail()" style="flex:1;padding:14px;font-size:16px" 
          ${!canAddToCart ? 'disabled' : ''}>
          ${availability === 'coming-soon' ? 'Coming Soon' : canAddToCart ? 'Add to Cart' : 'Out of Stock'}
        </button>
        <a href="cart.html" class="btn secondary" style="padding:14px;font-size:16px">View Cart</a>
      </div>
      
      <div style="margin-top:32px;padding-top:24px;border-top:1px solid var(--border)">
        <h3 style="font-size:16px;margin-bottom:12px">Product Details</h3>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:12px;font-size:14px">
          <span class="text-muted">Brand:</span>
          <span>${brand ? brand.name : 'N/A'}</span>
          ${subBrand ? `
          <span class="text-muted">Sub-Brand:</span>
          <span>${subBrand.name}</span>
          ` : ''}
          <span class="text-muted">Availability:</span>
          <span style="text-transform:capitalize">${availability.replace('-', ' ')}</span>
          <span class="text-muted">Status:</span>
          <span style="text-transform:capitalize">${currentProduct.status || 'active'}</span>
          <span class="text-muted">SKU:</span>
          <span>${currentProduct.id.substring(0, 8).toUpperCase()}</span>
        </div>
      </div>
    </div>
  `;
}

async function loadRelatedProducts() {
  if (!currentProduct) return;
  
  try {
    const allProducts = await getAllProducts();
    relatedProducts = allProducts
      .filter(p => p.id !== currentProduct.id && p.brandId === currentProduct.brandId && p.status === 'active')
      .slice(0, 4);
    
    renderRelatedProducts();
  } catch (error) {
    console.error("Error loading related products:", error);
  }
}

function renderRelatedProducts() {
  const grid = document.getElementById('relatedGrid');
  if (!grid) return;
  
  if (relatedProducts.length === 0) {
    document.getElementById('relatedProducts').style.display = 'none';
    return;
  }
  
  grid.innerHTML = relatedProducts.map(product => `
    <div class="product-card">
      <div class="product-image" style="background:var(--card);height:200px;display:flex;align-items:center;justify-content:center;border-radius:8px;margin-bottom:12px">
        ${product.image ? 
          `<img src="${product.image}" alt="${escapeHtml(product.name)}" style="max-width:100%;max-height:100%;object-fit:cover;border-radius:8px"/>` :
          `<div style="color:var(--muted);font-size:14px">No Image</div>`
        }
      </div>
      <h3 style="font-size:16px;margin-bottom:4px">${escapeHtml(product.name)}</h3>
      <p class="text-muted" style="font-size:13px;margin-bottom:8px">${formatPrice(product.price)}</p>
      <a href="product.html?id=${product.id}" class="btn" style="width:100%;padding:8px;font-size:12px;text-align:center;display:block;text-decoration:none">View Product</a>
    </div>
  `).join('');
}

async function addToCartFromDetail() {
  if (!currentProduct) return;
  
  const availability = currentProduct.availability || 'available';
  if (availability === 'out-of-stock' || availability === 'coming-soon') {
    showNotification(`Product is ${availability.replace('-', ' ')}`, 'error');
    return;
  }
  
  if (currentProduct.stock <= 0) {
    showNotification('Product is out of stock', 'error');
    return;
  }
  
  const quantity = parseInt(document.getElementById('quantityInput')?.value || 1);
  
  if (quantity > currentProduct.stock) {
    showNotification(`Only ${currentProduct.stock} items available`, 'error');
    return;
  }
  
  addToCart(currentProduct, quantity);
  updateCartBadge();
  showNotification('Added to cart!');
}

// Load brands and sub-brands for display
let allBrands = [];
let allSubBrands = [];
(async function init() {
  allBrands = await getAllBrands();
  allSubBrands = await getAllSubBrands();
  loadProductDetail();
  
  // Setup real-time listener for brands
  setupBrandsListener((brands) => {
    allBrands = brands;
    if (currentProduct) {
      renderProduct(); // Re-render product to update brand names
    }
  });
  
  // Setup real-time listener for sub-brands
  setupSubBrandsListener((subBrands) => {
    allSubBrands = subBrands;
    if (currentProduct) {
      renderProduct(); // Re-render product to update sub-brand names
    }
  });
})();

