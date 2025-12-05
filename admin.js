/* Admin Panel Script */

let allProducts = [];
let allOrders = [];
let allBrands = [];
let allSubBrands = [];
let filteredProducts = [];
let filteredOrders = [];

// Tab switching
function switchAdminTab(tab, event) {
  // Hide all tabs
  document.querySelectorAll('.admin-tab-content').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  
  // Show selected tab
  const tabElement = document.getElementById(tab + 'Tab');
  if (tabElement) {
    tabElement.style.display = 'block';
  }
  
  // Add active class to clicked button
  if (event && event.target) {
  event.target.classList.add('active');
  } else {
    // Fallback: find button by tab name
    const buttons = document.querySelectorAll('.admin-tab');
    buttons.forEach(btn => {
      if (btn.textContent.trim().toLowerCase().includes(tab.toLowerCase()) || 
          btn.onclick && btn.onclick.toString().includes(tab)) {
        btn.classList.add('active');
      }
    });
  }
  
  // Load tab data
  if (tab === 'dashboard') {
    // Dashboard feature coming soon - don't load data
    // loadDashboard();
  } else if (tab === 'products') {
    loadAdminProducts();
  } else if (tab === 'orders') {
    // Orders feature coming soon - don't load data
    // loadAdminOrders();
  } else if (tab === 'brands') {
    loadAdminBrands();
  } else if (tab === 'subBrands') {
    loadAdminSubBrands();
  } else if (tab === 'reviews') {
    loadAdminReviews();
  } else if (tab === 'pos') {
    // POS connectivity coming soon - static page
  }
}

// Dashboard
async function loadDashboard() {
  try {
    const products = await getAllProducts();
    const orders = await getAllOrders();
    
    // Stats
    document.getElementById('statProducts').textContent = products.length;
    document.getElementById('statOrders').textContent = orders.length;
    document.getElementById('statPending').textContent = orders.filter(o => o.status === 'pending').length;
    
    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    document.getElementById('statRevenue').textContent = formatPrice(totalRevenue);
    
    // Recent orders
    const recentOrders = orders.slice(0, 5);
    const recentOrdersHtml = recentOrders.length > 0 ? recentOrders.map(order => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid var(--border)">
        <div>
          <div style="font-weight:600;font-size:14px">${order.orderNumber || order.id.substring(0, 8)}</div>
          <div class="text-muted" style="font-size:12px">${order.shipping?.name || 'N/A'}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:600;color:var(--accent)">${formatPrice(order.total || 0)}</div>
          <span class="status-badge status-${order.status}">${order.status}</span>
        </div>
      </div>
    `).join('') : '<p class="text-muted" style="padding:20px;text-align:center">No recent orders</p>';
    document.getElementById('recentOrders').innerHTML = recentOrdersHtml;
    
    // Low stock products
    const lowStock = products.filter(p => p.stock < 10 && p.stock > 0).slice(0, 5);
    const lowStockHtml = lowStock.length > 0 ? lowStock.map(product => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid var(--border)">
        <div>
          <div style="font-weight:600;font-size:14px">${escapeHtml(product.name)}</div>
          <div class="text-muted" style="font-size:12px">Stock: ${product.stock}</div>
        </div>
        <a href="product.html?id=${product.id}" class="btn secondary" style="padding:4px 8px;font-size:11px">View</a>
      </div>
    `).join('') : '<p class="text-muted" style="padding:20px;text-align:center">All products well stocked</p>';
    document.getElementById('lowStockProducts').innerHTML = lowStockHtml;
  } catch (error) {
    console.error("Error loading dashboard:", error);
  }
}

// Products Management
async function loadAdminProducts() {
  try {
    allProducts = await getAllProducts();
    allBrands = await getAllBrands();
    allSubBrands = await getAllSubBrands();
    filteredProducts = [...allProducts];
    
    renderAdminProducts();
    populateBrandFilter();
    
    // Setup real-time listener for products
    setupProductsListener((products) => {
      allProducts = products;
      filterAdminProducts();
    });
    
    // Setup real-time listener for brands
    setupBrandsListener((brands) => {
      allBrands = brands;
      populateBrandFilter();
      renderAdminProducts(); // Re-render to show updated brand names
      updateBrandOptionsInModals();
    });
    
    // Setup real-time listener for sub-brands
    setupSubBrandsListener((subBrands) => {
      allSubBrands = subBrands;
      renderAdminProducts(); // Re-render to show updated sub-brand names
      // Update sub-brand options in open modals
      const brandSelect = document.getElementById('productBrand');
      if (brandSelect && brandSelect.value) {
        updateSubBrandOptions(brandSelect.value);
      }
    });
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

function populateBrandFilter() {
  const filter = document.getElementById('brandFilterAdmin');
  if (!filter) return;
  
  filter.innerHTML = '<option value="">All Brands</option>';
  allBrands.forEach(brand => {
    const option = document.createElement('option');
    option.value = brand.id;
    option.textContent = brand.name;
    filter.appendChild(option);
  });
}

function filterAdminProducts() {
  let filtered = [...allProducts];
  
  // Search
  const search = document.getElementById('productSearch')?.value.toLowerCase().trim();
  if (search) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search) ||
      (p.description || '').toLowerCase().includes(search)
    );
  }
  
  // Brand
  const brandId = document.getElementById('brandFilterAdmin')?.value;
  if (brandId) {
    filtered = filtered.filter(p => p.brandId === brandId);
  }
  
  // Availability
  const availability = document.getElementById('availabilityFilter')?.value;
  if (availability) {
    filtered = filtered.filter(p => (p.availability || 'available') === availability);
  }
  
  // Status
  const status = document.getElementById('statusFilter')?.value;
  if (status) {
    filtered = filtered.filter(p => (p.status || 'active') === status);
  }
  
  filteredProducts = filtered;
  renderAdminProducts();
}

function renderAdminProducts() {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;
  
  if (filteredProducts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--muted)">No products found</td></tr>';
    return;
  }
  
  tbody.innerHTML = filteredProducts.map(product => {
    // Convert to strings for comparison to handle type mismatches
    const productBrandId = product.brandId ? String(product.brandId) : null;
    const productSubBrandId = product.subBrandId ? String(product.subBrandId) : null;
    const brand = allBrands.find(b => String(b.id) === productBrandId);
    const subBrand = allSubBrands.find(sb => String(sb.id) === productSubBrandId);
    
    // Debug logging for products without brands
    if (!brand && product.brandId) {
      console.warn('Product has brandId but brand not found:', { 
        productId: product.id, 
        productBrandId: product.brandId,
        allBrandIds: allBrands.map(b => b.id)
      });
    }
    
    return `
      <tr>
        <td>
          <div style="width:60px;height:60px;background:var(--card);border-radius:6px;display:flex;align-items:center;justify-content:center">
            ${product.image ? 
              `<img src="${product.image}" style="max-width:100%;max-height:100%;object-fit:cover;border-radius:6px"/>` :
              `<span style="color:var(--muted);font-size:10px">No Image</span>`
            }
          </div>
        </td>
        <td>
          <div style="font-weight:600">${escapeHtml(product.name)}</div>
          <div class="text-muted" style="font-size:12px">${escapeHtml((product.description || '').substring(0, 50))}...</div>
        </td>
        <td>${brand ? brand.name : 'Unbranded'}</td>
        <td>${subBrand ? subBrand.name : 'N/A'}</td>
        <td style="font-weight:600;color:#10b981">${product.cost ? formatPrice(product.cost) : 'N/A'}</td>
        <td style="font-weight:600;color:var(--accent)">${formatPrice(product.price)}</td>
        <td>
          <span style="color:${product.stock > 10 ? '#10b981' : product.stock > 0 ? '#f59e0b' : '#ef4444'}">
            ${product.stock || 0}
          </span>
        </td>
        <td>
          <span class="status-badge status-${product.availability || 'available'}">
            ${(product.availability || 'available').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </td>
        <td><span class="status-badge status-${product.status || 'active'}">${product.status || 'active'}</span></td>
        <td>
          <div style="display:flex;gap:8px">
            <button class="icon-btn" onclick="editProduct('${product.id}')" style="padding:6px 12px;font-size:12px">Edit</button>
            <button class="icon-btn" onclick="deleteProductConfirm('${product.id}')" style="padding:6px 12px;font-size:12px;color:#ef4444">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Orders Management
async function loadAdminOrders() {
  try {
    allOrders = await getAllOrders();
    filteredOrders = [...allOrders];
    
    renderAdminOrders();
    
    // Setup real-time listener
    setupOrdersListener((orders) => {
      allOrders = orders;
      filterOrders();
    });
  } catch (error) {
    console.error("Error loading orders:", error);
  }
}

function filterOrders() {
  let filtered = [...allOrders];
  
  const status = document.getElementById('orderStatusFilter')?.value;
  if (status) {
    filtered = filtered.filter(o => o.status === status);
  }
  
  filteredOrders = filtered;
  renderAdminOrders();
}

function renderAdminOrders() {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;
  
  if (filteredOrders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--muted)">No orders found</td></tr>';
    return;
  }
  
  tbody.innerHTML = filteredOrders.map(order => `
    <tr>
      <td style="font-weight:600;font-family:monospace">${order.orderNumber || order.id.substring(0, 8)}</td>
      <td>
        <div style="font-weight:600">${escapeHtml(order.shipping?.name || 'N/A')}</div>
        <div class="text-muted" style="font-size:12px">${escapeHtml(order.shipping?.email || '')}</div>
      </td>
      <td>${order.items?.length || 0} items</td>
      <td style="font-weight:600;color:var(--accent)">${formatPrice(order.total || 0)}</td>
      <td>
        <select onchange="updateOrderStatusAdmin('${order.id}', this.value)" style="padding:4px 8px;border-radius:6px;border:1px solid var(--border)">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
          <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td class="text-muted" style="font-size:12px">${formatDate(order.createdAt)}</td>
      <td>
        <button class="icon-btn" onclick="viewOrderDetails('${order.id}')" style="padding:6px 12px;font-size:12px">View</button>
      </td>
    </tr>
  `).join('');
}

async function updateOrderStatusAdmin(orderId, status) {
  try {
    await updateOrderStatus(orderId, status);
    showNotification('Order status updated');
  } catch (error) {
    console.error("Error updating order:", error);
    showNotification('Failed to update order status', 'error');
  }
}

function viewOrderDetails(orderId) {
  const order = allOrders.find(o => o.id === orderId);
  if (!order) return;
  
  openModal(`
    <h3>Order Details</h3>
    <div style="margin-bottom:16px">
      <div style="display:grid;grid-template-columns:auto 1fr;gap:8px;margin-bottom:12px">
        <span class="text-muted">Order #:</span>
        <span style="font-weight:600">${order.orderNumber || order.id}</span>
        <span class="text-muted">Status:</span>
        <span><span class="status-badge status-${order.status}">${order.status}</span></span>
        <span class="text-muted">Date:</span>
        <span>${formatDate(order.createdAt)}</span>
        <span class="text-muted">Total:</span>
        <span style="font-weight:600;color:var(--accent)">${formatPrice(order.total || 0)}</span>
      </div>
    </div>
    <div style="margin-bottom:16px">
      <h4 style="font-size:14px;margin-bottom:8px">Shipping Address</h4>
      <div style="padding:12px;background:var(--card);border-radius:6px;font-size:13px">
        ${order.shipping ? `
          <div>${escapeHtml(order.shipping.name)}</div>
          <div>${escapeHtml(order.shipping.address)}</div>
          <div>${escapeHtml(order.shipping.city)}, ${escapeHtml(order.shipping.state)} - ${escapeHtml(order.shipping.pin)}</div>
          <div>Phone: ${escapeHtml(order.shipping.phone)}</div>
          <div>Email: ${escapeHtml(order.shipping.email)}</div>
        ` : 'N/A'}
      </div>
    </div>
    <div>
      <h4 style="font-size:14px;margin-bottom:8px">Items</h4>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${(order.items || []).map(item => `
          <div style="display:flex;justify-content:space-between;padding:8px;background:var(--card);border-radius:6px">
            <div>
              <div style="font-weight:600;font-size:13px">${escapeHtml(item.name)}</div>
              <div class="text-muted" style="font-size:12px">Qty: ${item.quantity} × ${formatPrice(item.price)}</div>
            </div>
            <div style="font-weight:600">${formatPrice(item.price * item.quantity)}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end">
      <button class="btn secondary" onclick="closeModal()">Close</button>
    </div>
  `);
}

// Brands Management
async function loadAdminBrands() {
  try {
    allBrands = await getAllBrands();
    renderAdminBrands();
    
    // Setup real-time listener
    setupBrandsListener((brands) => {
      allBrands = brands;
      renderAdminBrands();
      // Refresh product forms if open
      const modal = document.getElementById('modal');
      if (modal && modal.innerHTML.includes('productBrand')) {
        // Update brand options in open modals
        updateBrandOptionsInModals();
      }
    });
  } catch (error) {
    console.error("Error loading brands:", error);
  }
}

function renderAdminBrands() {
  const container = document.getElementById('brandsList');
  if (!container) return;
  
  if (allBrands.length === 0) {
    container.innerHTML = '<p class="text-muted" style="text-align:center;padding:40px">No brands found</p>';
    return;
  }
  
  container.innerHTML = allBrands.map(brand => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:16px;border:1px solid var(--border);border-radius:8px;margin-bottom:12px">
      <div>
        <div style="font-weight:600;font-size:16px">${escapeHtml(brand.name)}</div>
        <div class="text-muted" style="font-size:13px;margin-top:4px">${escapeHtml(brand.description || '')}</div>
        <div class="text-muted" style="font-size:11px;margin-top:4px">Slug: ${brand.slug || 'N/A'}</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="icon-btn" onclick="editBrand('${brand.id}')" style="padding:6px 12px;font-size:12px">Edit</button>
        <button class="icon-btn" onclick="deleteBrandConfirm('${brand.id}')" style="padding:6px 12px;font-size:12px;color:#ef4444">Delete</button>
      </div>
    </div>
  `).join('');
}

// Product CRUD
async function openAddProductModal() {
  // Ensure we have the latest brands before opening modal
  allBrands = await getAllBrands();
  
  openModal(`
    <div class="edit-product-header">
      <div class="edit-icon-wrapper">
        <span class="edit-icon">➕</span>
      </div>
    <h3>Add Product</h3>
    </div>
    <form onsubmit="submitAddProduct(event)" class="edit-product-form-new">
      <div class="form-row-edit">
        <div class="form-field">
        <label>Product Name *</label>
          <input type="text" id="productName" class="input-edit" required/>
      </div>
      </div>
      
      <div class="form-row-edit">
        <div class="form-field">
        <label>Brand *</label>
          <select id="productBrand" class="input-edit" required onchange="updateSubBrandOptions(this.value)">
          <option value="">Select Brand</option>
          ${allBrands.map(brand => `<option value="${brand.id}">${brand.name}</option>`).join('')}
        </select>
      </div>
        <div class="form-field">
        <label>Sub-Brand</label>
          <select id="productSubBrand" class="input-edit">
          <option value="">Select Sub-Brand (Optional)</option>
        </select>
      </div>
      </div>
      
      <div class="form-row-edit">
        <div class="form-field full-width">
        <label>Description</label>
          <textarea id="productDescription" class="input-edit" rows="2"></textarea>
      </div>
        </div>
      
      <div class="form-row-edit">
        <div class="form-field">
          <label>Cost ($) - Admin Only</label>
          <input type="number" id="productCost" class="input-edit" min="0" step="0.01" placeholder="0.00"/>
        </div>
        <div class="form-field">
          <label>Price ($) *</label>
          <input type="number" id="productPrice" class="input-edit" required min="0" step="0.01"/>
      </div>
      </div>
      
      <div class="form-row-edit">
        <div class="form-field">
          <label>Stock *</label>
          <input type="number" id="productStock" class="input-edit" required min="0"/>
        </div>
        <div class="form-field">
          <label>Availability *</label>
          <select id="productAvailability" class="input-edit" required>
            <option value="available">Available</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="coming-soon">Coming Soon</option>
          </select>
        </div>
      </div>
      
      <div class="form-row-edit">
        <div class="form-field full-width">
          <label>Image URL</label>
          <input type="url" id="productImage" class="input-edit" placeholder="https://example.com/image.jpg"/>
        </div>
      </div>
      
      <div class="form-row-edit">
        <div class="form-field">
          <label>Status</label>
          <select id="productStatus" class="input-edit">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      <div class="form-actions-new">
        <button type="button" class="btn-edit-cancel" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-edit-save">Add Product</button>
      </div>
    </form>
  `);
}

async function submitAddProduct(event) {
  event.preventDefault();
  
  const brandIdValue = document.getElementById('productBrand').value.trim();
  const subBrandIdValue = document.getElementById('productSubBrand').value.trim();
  
  if (!brandIdValue) {
    showNotification('Please select a brand', 'error');
    return;
  }
  
  const productData = {
    name: document.getElementById('productName').value.trim(),
    brandId: brandIdValue,
    subBrandId: subBrandIdValue ? subBrandIdValue : null,
    description: document.getElementById('productDescription').value.trim(),
    cost: document.getElementById('productCost').value ? parseFloat(document.getElementById('productCost').value) : null,
    price: parseFloat(document.getElementById('productPrice').value),
    stock: parseInt(document.getElementById('productStock').value),
    image: document.getElementById('productImage').value.trim(),
    availability: document.getElementById('productAvailability').value,
    status: document.getElementById('productStatus').value
  };
  
  // Ensure brandId and subBrandId are properly set
  if (!productData.brandId) {
    showNotification('Brand is required', 'error');
    return;
  }
  
  try {
    const productId = await addProduct(productData);
    console.log('Product saved with:', { brandId: productData.brandId, subBrandId: productData.subBrandId });
    showNotification('Product added successfully');
    closeModal();
    loadAdminProducts();
  } catch (error) {
    console.error('Error adding product:', error);
    showNotification('Failed to add product', 'error');
  }
}

async function editProduct(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) {
    showNotification('Product not found', 'error');
    return;
  }
  
  // Debug: Log the product data
  console.log('Editing product:', { 
    id: product.id, 
    name: product.name, 
    brandId: product.brandId, 
    subBrandId: product.subBrandId,
    productData: product 
  });
  
  // Load sub-brands for the product's brand
  const subBrands = product.brandId ? await getSubBrandsByBrand(product.brandId) : [];
  
  // Ensure brandId and subBrandId are strings for comparison
  const productBrandId = product.brandId ? String(product.brandId) : '';
  const productSubBrandId = product.subBrandId ? String(product.subBrandId) : '';
  
  openModal(`
    <div class="edit-product-header">
      <div class="edit-icon-wrapper">
        <span class="edit-icon">✏️</span>
      </div>
    <h3>Edit Product</h3>
    </div>
    <form onsubmit="submitEditProduct(event, '${productId}')" class="edit-product-form-new">
      <div class="form-row-edit">
        <div class="form-field">
        <label>Product Name *</label>
          <input type="text" id="productName" class="input-edit" value="${escapeHtml(product.name)}" required/>
      </div>
      </div>
      
      <div class="form-row-edit">
        <div class="form-field">
        <label>Brand *</label>
          <select id="productBrand" class="input-edit" required onchange="updateSubBrandOptionsEdit(this.value, '${productId}')">
          <option value="">Select Brand</option>
            ${allBrands.map(brand => {
              const brandIdStr = String(brand.id);
              const isSelected = brandIdStr === productBrandId;
              return `<option value="${brand.id}" ${isSelected ? 'selected' : ''}>${brand.name}</option>`;
            }).join('')}
        </select>
      </div>
        <div class="form-field">
        <label>Sub-Brand</label>
          <select id="productSubBrand" class="input-edit">
          <option value="">Select Sub-Brand (Optional)</option>
        </select>
      </div>
      </div>
      
      <div class="form-row-edit">
        <div class="form-field full-width">
        <label>Description</label>
          <textarea id="productDescription" class="input-edit" rows="2">${escapeHtml(product.description || '')}</textarea>
      </div>
        </div>
      
      <div class="form-row-edit">
        <div class="form-field">
          <label>Cost ($) - Admin Only</label>
          <input type="number" id="productCost" class="input-edit" value="${product.cost || ''}" min="0" step="0.01" placeholder="0.00"/>
        </div>
        <div class="form-field">
          <label>Price ($) *</label>
          <input type="number" id="productPrice" class="input-edit" value="${product.price}" required min="0" step="0.01"/>
      </div>
      </div>
      
      <div class="form-row-edit">
        <div class="form-field">
          <label>Stock *</label>
          <input type="number" id="productStock" class="input-edit" value="${product.stock || 0}" required min="0"/>
        </div>
        <div class="form-field">
          <label>Availability *</label>
          <select id="productAvailability" class="input-edit" required>
            <option value="available" ${(product.availability || 'available') === 'available' ? 'selected' : ''}>Available</option>
            <option value="out-of-stock" ${product.availability === 'out-of-stock' ? 'selected' : ''}>Out of Stock</option>
            <option value="coming-soon" ${product.availability === 'coming-soon' ? 'selected' : ''}>Coming Soon</option>
          </select>
        </div>
      </div>
      
      <div class="form-row-edit">
        <div class="form-field full-width">
          <label>Image URL</label>
          <input type="url" id="productImage" class="input-edit" value="${product.image || ''}" placeholder="https://example.com/image.jpg"/>
        </div>
      </div>
      
      <div class="form-row-edit">
        <div class="form-field">
          <label>Status</label>
          <select id="productStatus" class="input-edit">
            <option value="active" ${product.status === 'active' ? 'selected' : ''}>Active</option>
            <option value="inactive" ${product.status === 'inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </div>
      
      <div class="form-actions-new">
        <button type="button" class="btn-edit-cancel" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-edit-save">Save Changes</button>
      </div>
    </form>
  `);
  
  // Populate sub-brand options after modal is opened
  if (product.brandId) {
    await updateSubBrandOptionsEdit(product.brandId, productId);
  } else {
    console.warn('Product has no brandId:', product);
  }
  
  // Verify the form values are set correctly
  setTimeout(() => {
    const brandSelect = document.getElementById('productBrand');
    const subBrandSelect = document.getElementById('productSubBrand');
    if (brandSelect) {
      console.log('Brand select value:', brandSelect.value, 'Expected:', product.brandId);
    }
    if (subBrandSelect) {
      console.log('Sub-brand select value:', subBrandSelect.value, 'Expected:', product.subBrandId);
    }
  }, 100);
}

async function submitEditProduct(event, productId) {
  event.preventDefault();
  
  const brandIdValue = document.getElementById('productBrand').value.trim();
  const subBrandIdValue = document.getElementById('productSubBrand').value.trim();
  
  if (!brandIdValue) {
    showNotification('Please select a brand', 'error');
    return;
  }
  
  const productData = {
    name: document.getElementById('productName').value.trim(),
    brandId: brandIdValue,
    subBrandId: subBrandIdValue ? subBrandIdValue : null,
    description: document.getElementById('productDescription').value.trim(),
    cost: document.getElementById('productCost').value ? parseFloat(document.getElementById('productCost').value) : null,
    price: parseFloat(document.getElementById('productPrice').value),
    stock: parseInt(document.getElementById('productStock').value),
    image: document.getElementById('productImage').value.trim(),
    availability: document.getElementById('productAvailability').value,
    status: document.getElementById('productStatus').value
  };
  
  // Ensure brandId and subBrandId are properly set
  if (!productData.brandId) {
    showNotification('Brand is required', 'error');
    return;
  }
  
  try {
    await updateProduct(productId, productData);
    console.log('Product updated with:', { brandId: productData.brandId, subBrandId: productData.subBrandId });
    
    // Verify the update was saved correctly
    const updatedProduct = await getProductById(productId);
    if (updatedProduct) {
      console.log('Verified saved product:', { brandId: updatedProduct.brandId, subBrandId: updatedProduct.subBrandId });
    }
    
    showNotification('Product updated successfully');
    closeModal();
    loadAdminProducts();
  } catch (error) {
    console.error('Error updating product:', error);
    showNotification('Failed to update product', 'error');
  }
}

// Delete Confirmation Modal Functions
let pendingDeleteAction = null;

function openDeleteConfirmationModal(type, id, name) {
  const typeLabels = {
    'product': { title: 'Delete Product', icon: '🗑️', message: 'Are you sure you want to delete this product?', warning: 'This action cannot be undone. The product will be permanently removed from your store.' },
    'brand': { title: 'Delete Brand', icon: '🏷️', message: 'Are you sure you want to delete this brand?', warning: 'Products in this brand will become unbranded. This action cannot be undone.' },
    'subBrand': { title: 'Delete Sub-Brand', icon: '📦', message: 'Are you sure you want to delete this sub-brand?', warning: 'Products in this sub-brand will have their sub-brand removed. This action cannot be undone.' },
    'review': { title: 'Delete Review', icon: '⭐', message: 'Are you sure you want to delete this review?', warning: 'This action cannot be undone. The review will be permanently removed.' }
  };
  
  const config = typeLabels[type] || typeLabels['product'];
  const displayName = name ? `"${escapeHtml(name)}"` : 'this item';
  
  // Store the delete action
  pendingDeleteAction = { type, id };
  
  openModal(`
    <div class="delete-confirmation-modal">
      <div class="delete-confirmation-header">
        <div class="delete-confirmation-icon">${config.icon}</div>
        <h3 class="delete-confirmation-title">${config.title}</h3>
        <p class="delete-confirmation-message">${config.message}</p>
        ${name ? `<p style="font-weight:600;color:var(--text);margin-top:8px">${displayName}</p>` : ''}
      </div>
      <div class="delete-confirmation-warning">
        ⚠️ ${config.warning}
      </div>
      <div class="delete-confirmation-actions">
        <button class="delete-confirmation-btn delete-confirmation-btn-cancel" onclick="closeDeleteConfirmationModal()">
          Cancel
        </button>
        <button class="delete-confirmation-btn delete-confirmation-btn-delete" onclick="confirmDelete()">
          Delete
        </button>
      </div>
    </div>
  `);
}

function closeDeleteConfirmationModal() {
  pendingDeleteAction = null;
  closeModal();
}

async function confirmDelete() {
  if (!pendingDeleteAction) return;
  
  const { type, id } = pendingDeleteAction;
  pendingDeleteAction = null;
  closeModal();
  
  try {
    if (type === 'product') {
      await deleteProduct(id);
    showNotification('Product deleted successfully');
    loadAdminProducts();
    } else if (type === 'brand') {
      await deleteBrand(id);
      showNotification('Brand deleted successfully');
      await loadAdminBrands();
    } else if (type === 'subBrand') {
      await deleteSubBrand(id);
      showNotification('Sub-brand deleted successfully');
      await loadAdminSubBrands();
    } else if (type === 'review') {
      await deleteReview(id);
      showNotification('Review deleted successfully');
      await loadAdminReviews();
    }
  } catch (error) {
    showNotification(`Failed to delete ${type}`, 'error');
    console.error(`Error deleting ${type}:`, error);
  }
}

async function deleteProductConfirm(productId) {
  const product = allProducts.find(p => p.id === productId);
  const productName = product ? product.name : '';
  openDeleteConfirmationModal('product', productId, productName);
}

async function deleteAllProductsConfirm() {
  const productCount = allProducts.length;
  
  if (productCount === 0) {
    showNotification('No products to delete', 'error');
    return;
  }
  
  const confirmMessage = `⚠️ WARNING: This will permanently delete ALL ${productCount} products!\n\nThis action cannot be undone.\n\nType "DELETE ALL" to confirm:`;
  
  const userInput = prompt(confirmMessage);
  
  if (userInput !== 'DELETE ALL') {
    showNotification('Deletion cancelled', 'error');
    return;
  }
  
  try {
    showNotification('Deleting all products...', 'success');
    
    // Delete all products one by one
    let deleted = 0;
    let failed = 0;
    
    for (const product of allProducts) {
      try {
        await deleteProduct(product.id);
        deleted++;
      } catch (error) {
        console.error(`Error deleting product ${product.id}:`, error);
        failed++;
      }
    }
    
    if (deleted > 0) {
      showNotification(`Successfully deleted ${deleted} products${failed > 0 ? `. ${failed} failed.` : '.'}`);
      loadAdminProducts();
    } else {
      showNotification('Failed to delete products', 'error');
    }
  } catch (error) {
    console.error("Error deleting all products:", error);
    showNotification('Failed to delete all products', 'error');
  }
}

// Brand CRUD
function openAddBrandModal() {
  openModal(`
    <h3>Add Brand</h3>
    <form onsubmit="submitAddBrand(event)">
      <div class="form-group">
        <label>Brand Name *</label>
        <input type="text" id="brandName" class="input" required/>
      </div>
      <div class="form-group">
        <label>Slug *</label>
        <input type="text" id="brandSlug" class="input" required placeholder="brand-name"/>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="brandDescription" class="input" rows="3"></textarea>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
        <button type="button" class="btn secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn">Add Brand</button>
      </div>
    </form>
  `);
}

async function submitAddBrand(event) {
  event.preventDefault();
  
  const brandData = {
    name: document.getElementById('brandName').value.trim(),
    slug: document.getElementById('brandSlug').value.trim(),
    description: document.getElementById('brandDescription').value.trim()
  };
  
  // Validate required fields
  if (!brandData.name || !brandData.slug) {
    showNotification('Brand name and slug are required', 'error');
    return;
  }
  
  try {
    const brandId = await addBrand(brandData);
    console.log('Brand added with ID:', brandId);
    
    // Refresh the brands list immediately
    allBrands = await getAllBrands();
    console.log('All brands after adding:', allBrands);
    
    // Update brand options in any open product modals
    updateBrandOptionsInModals();
    
    showNotification('Brand added successfully');
    closeModal();
    
    // Reload admin brands list to show the new brand
    await loadAdminBrands();
    
    // Also refresh products to ensure brand names are updated
    await loadAdminProducts();
  } catch (error) {
    console.error('Error adding brand:', error);
    showNotification('Failed to add brand: ' + (error.message || 'Unknown error'), 'error');
  }
}

async function editBrand(brandId) {
  const brand = allBrands.find(b => b.id === brandId);
  if (!brand) return;
  
  openModal(`
    <h3>Edit Brand</h3>
    <form onsubmit="submitEditBrand(event, '${brandId}')">
      <div class="form-group">
        <label>Brand Name *</label>
        <input type="text" id="brandName" class="input" value="${escapeHtml(brand.name)}" required/>
      </div>
      <div class="form-group">
        <label>Slug *</label>
        <input type="text" id="brandSlug" class="input" value="${escapeHtml(brand.slug || '')}" required/>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="brandDescription" class="input" rows="3">${escapeHtml(brand.description || '')}</textarea>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
        <button type="button" class="btn secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn">Save Changes</button>
      </div>
    </form>
  `);
}

async function submitEditBrand(event, brandId) {
  event.preventDefault();
  
  const brandData = {
    name: document.getElementById('brandName').value.trim(),
    slug: document.getElementById('brandSlug').value.trim(),
    description: document.getElementById('brandDescription').value.trim()
  };
  
  try {
    // Get all brands, update the one we need
    const brands = await getAllBrands();
    const brandIndex = brands.findIndex(b => b.id === brandId);
    if (brandIndex !== -1) {
      brands[brandIndex] = { 
        ...brands[brandIndex], 
        ...brandData,
        // Preserve createdAt timestamp
        createdAt: brands[brandIndex].createdAt
      };
      // Use saveCollection to ensure proper persistence and event triggering
      const COLLECTIONS = { BRANDS: 'localDB_brands' };
      saveCollection(COLLECTIONS.BRANDS, brands);
      brandsCache = brands;
    }
    showNotification('Brand updated successfully');
    closeModal();
    // The real-time listener will automatically update the list
    await loadAdminBrands();
  } catch (error) {
    showNotification('Failed to update brand', 'error');
  }
}

async function deleteBrandConfirm(brandId) {
  const brand = allBrands.find(b => b.id === brandId);
  const brandName = brand ? brand.name : '';
  openDeleteConfirmationModal('brand', brandId, brandName);
}

// Update sub-brand options based on selected brand
async function updateSubBrandOptions(brandId) {
  const subBrandSelect = document.getElementById('productSubBrand');
  if (!subBrandSelect) return;
  
  subBrandSelect.innerHTML = '<option value="">Select Sub-Brand (Optional)</option>';
  
  if (!brandId) return;
  
  try {
    // Use cached sub-brands first for faster updates
    const subBrands = allSubBrands.filter(sb => sb.brandId === brandId);
    
    // If no sub-brands in cache, fetch from database
    if (subBrands.length === 0) {
      const fetchedSubBrands = await getSubBrandsByBrand(brandId);
      fetchedSubBrands.forEach(sb => {
        const option = document.createElement('option');
        option.value = sb.id;
        option.textContent = sb.name;
        subBrandSelect.appendChild(option);
      });
    } else {
      subBrands.forEach(sb => {
        const option = document.createElement('option');
        option.value = sb.id;
        option.textContent = sb.name;
        subBrandSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error loading sub-brands:", error);
  }
}

// Update sub-brand options when editing product
async function updateSubBrandOptionsEdit(brandId, productId) {
  const subBrandSelect = document.getElementById('productSubBrand');
  if (!subBrandSelect) return;
  
  subBrandSelect.innerHTML = '<option value="">Select Sub-Brand (Optional)</option>';
  
  if (!brandId) return;
  
  try {
    // Use cached sub-brands first, then fetch if needed
    let subBrands = allSubBrands.filter(sb => String(sb.brandId) === String(brandId));
    if (subBrands.length === 0) {
      subBrands = await getSubBrandsByBrand(brandId);
    }
    
    const product = allProducts.find(p => p.id === productId);
    // Convert to strings for comparison
    const productSubBrandId = product && product.subBrandId ? String(product.subBrandId) : null;
    
    subBrands.forEach(sb => {
      const option = document.createElement('option');
      option.value = sb.id;
      option.textContent = sb.name;
      // Compare as strings to handle type mismatches
      if (productSubBrandId && String(sb.id) === productSubBrandId) {
        option.selected = true;
      }
      subBrandSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading sub-brands:", error);
  }
}

// Update brand options in open modals
function updateBrandOptionsInModals() {
  const brandSelects = document.querySelectorAll('#productBrand');
  brandSelects.forEach(select => {
    if (!select) return;
    const currentValue = select.value;
    select.innerHTML = '<option value="">Select Brand</option>';
    allBrands.forEach(brand => {
      const option = document.createElement('option');
      option.value = brand.id;
      option.textContent = brand.name;
      if (brand.id === currentValue) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  });
}

// Sub-Brands Management
async function loadAdminSubBrands() {
  try {
    allSubBrands = await getAllSubBrands();
    allBrands = await getAllBrands();
    renderAdminSubBrands();
    
    // Setup real-time listener
    setupSubBrandsListener((subBrands) => {
      allSubBrands = subBrands;
      renderAdminSubBrands();
      // Refresh product forms if open
      const modal = document.getElementById('modal');
      if (modal && modal.innerHTML.includes('productSubBrand')) {
        // Update sub-brand options in open modals
        const brandSelect = document.getElementById('productBrand');
        if (brandSelect && brandSelect.value) {
          updateSubBrandOptions(brandSelect.value);
        }
      }
    });
  } catch (error) {
    console.error("Error loading sub-brands:", error);
  }
}

function renderAdminSubBrands() {
  const container = document.getElementById('subBrandsList');
  if (!container) return;
  
  if (allSubBrands.length === 0) {
    container.innerHTML = '<p class="text-muted" style="text-align:center;padding:40px">No sub-brands found</p>';
    return;
  }
  
  container.innerHTML = allSubBrands.map(subBrand => {
    const brand = allBrands.find(b => b.id === subBrand.brandId);
    return `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:16px;border:1px solid var(--border);border-radius:8px;margin-bottom:12px">
      <div>
        <div style="font-weight:600;font-size:16px">${escapeHtml(subBrand.name)}</div>
        <div class="text-muted" style="font-size:13px;margin-top:4px">Brand: ${brand ? brand.name : 'N/A'}</div>
        <div class="text-muted" style="font-size:13px;margin-top:4px">${escapeHtml(subBrand.description || '')}</div>
        <div class="text-muted" style="font-size:11px;margin-top:4px">Slug: ${subBrand.slug || 'N/A'}</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="icon-btn" onclick="editSubBrand('${subBrand.id}')" style="padding:6px 12px;font-size:12px">Edit</button>
        <button class="icon-btn" onclick="deleteSubBrandConfirm('${subBrand.id}')" style="padding:6px 12px;font-size:12px;color:#ef4444">Delete</button>
      </div>
    </div>
  `;
  }).join('');
}

// Sub-Brand CRUD
async function openAddSubBrandModal() {
  // Ensure we have the latest brands
  allBrands = await getAllBrands();
  
  openModal(`
    <h3>Add Sub-Brand</h3>
    <form onsubmit="submitAddSubBrand(event)">
      <div class="form-group">
        <label>Brand *</label>
        <select id="subBrandBrandId" class="input" required>
          <option value="">Select Brand</option>
          ${allBrands.map(brand => `<option value="${brand.id}">${brand.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Sub-Brand Name *</label>
        <input type="text" id="subBrandName" class="input" required/>
      </div>
      <div class="form-group">
        <label>Slug *</label>
        <input type="text" id="subBrandSlug" class="input" required placeholder="sub-brand-name"/>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="subBrandDescription" class="input" rows="3"></textarea>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
        <button type="button" class="btn secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn">Add Sub-Brand</button>
      </div>
    </form>
  `);
}

async function submitAddSubBrand(event) {
  event.preventDefault();
  
  const subBrandData = {
    brandId: document.getElementById('subBrandBrandId').value,
    name: document.getElementById('subBrandName').value.trim(),
    slug: document.getElementById('subBrandSlug').value.trim(),
    description: document.getElementById('subBrandDescription').value.trim()
  };
  
  try {
    await addSubBrand(subBrandData);
    showNotification('Sub-brand added successfully');
    closeModal();
    // The real-time listener will automatically update the list
    // But we can also manually reload to ensure it's immediate
    await loadAdminSubBrands();
  } catch (error) {
    showNotification('Failed to add sub-brand', 'error');
  }
}

async function editSubBrand(subBrandId) {
  const subBrand = allSubBrands.find(sb => sb.id === subBrandId);
  if (!subBrand) return;
  
  openModal(`
    <h3>Edit Sub-Brand</h3>
    <form onsubmit="submitEditSubBrand(event, '${subBrandId}')">
      <div class="form-group">
        <label>Brand *</label>
        <select id="subBrandBrandId" class="input" required>
          <option value="">Select Brand</option>
          ${allBrands.map(brand => `<option value="${brand.id}" ${brand.id === subBrand.brandId ? 'selected' : ''}>${brand.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Sub-Brand Name *</label>
        <input type="text" id="subBrandName" class="input" value="${escapeHtml(subBrand.name)}" required/>
      </div>
      <div class="form-group">
        <label>Slug *</label>
        <input type="text" id="subBrandSlug" class="input" value="${escapeHtml(subBrand.slug || '')}" required/>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="subBrandDescription" class="input" rows="3">${escapeHtml(subBrand.description || '')}</textarea>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
        <button type="button" class="btn secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn">Save Changes</button>
      </div>
    </form>
  `);
}

async function submitEditSubBrand(event, subBrandId) {
  event.preventDefault();
  
  const subBrandData = {
    brandId: document.getElementById('subBrandBrandId').value,
    name: document.getElementById('subBrandName').value.trim(),
    slug: document.getElementById('subBrandSlug').value.trim(),
    description: document.getElementById('subBrandDescription').value.trim()
  };
  
  try {
    // Get all sub-brands, update the one we need
    const subBrands = await getAllSubBrands();
    const subBrandIndex = subBrands.findIndex(sb => sb.id === subBrandId);
    if (subBrandIndex !== -1) {
      subBrands[subBrandIndex] = { 
        ...subBrands[subBrandIndex], 
        ...subBrandData,
        // Preserve createdAt timestamp
        createdAt: subBrands[subBrandIndex].createdAt
      };
      // Use saveCollection to ensure proper persistence and event triggering
      const COLLECTIONS = { SUB_BRANDS: 'localDB_subBrands' };
      saveCollection(COLLECTIONS.SUB_BRANDS, subBrands);
        subBrandsCache = subBrands;
    }
    showNotification('Sub-brand updated successfully');
    closeModal();
    // The real-time listener will automatically update the list
    await loadAdminSubBrands();
  } catch (error) {
    showNotification('Failed to update sub-brand', 'error');
  }
}

async function deleteSubBrandConfirm(subBrandId) {
  const subBrand = allSubBrands.find(sb => sb.id === subBrandId);
  const subBrandName = subBrand ? subBrand.name : '';
  openDeleteConfirmationModal('subBrand', subBrandId, subBrandName);
}

// Feature Coming Soon Message - Static Design
function showFeatureComingSoon(featureName) {
  openModal(`
    <div class="feature-coming-soon-modal">
      <div class="feature-coming-soon-header">
        <div class="feature-coming-soon-icon">⏳</div>
        <h3 class="feature-coming-soon-title">Feature Coming Soon</h3>
      </div>
      <div class="feature-coming-soon-body">
        <p class="feature-coming-soon-message">The <span class="feature-name-highlight">${escapeHtml(featureName)}</span> feature is currently under development and will be available soon!</p>
        <div class="feature-coming-soon-info-box">
          <span class="feature-info-icon">✨</span>
          <span class="feature-info-text">We're working hard to bring you this feature. Stay tuned for updates!</span>
        </div>
      </div>
      <div class="feature-coming-soon-footer">
        <button class="feature-close-btn" onclick="closeModal()">Close</button>
      </div>
    </div>
  `);
}

// Excel Import/Export Functions - COMMENTED OUT (Feature Coming Soon)
async function exportProductsToExcel() {
  // Feature coming soon - show message instead
  showFeatureComingSoon('Export to Excel');
  return;
}

/* COMMENTED OUT - Feature Coming Soon
async function exportProductsToExcel_OLD() {
  try {
    // Get all products
    const products = await getAllProducts();
    const brands = await getAllBrands();
    const subBrands = await getAllSubBrands();
    
    if (products.length === 0) {
      showNotification('No products to export', 'error');
      return;
    }
    
    // Prepare data for Excel
    const excelData = products.map(product => {
      const brand = brands.find(b => b.id === product.brandId);
      const subBrand = product.subBrandId ? subBrands.find(sb => sb.id === product.subBrandId) : null;
      
      return {
        'Product Name': product.name || '',
        'Brand Name': brand ? brand.name : '',
        'Sub-Brand Name': subBrand ? subBrand.name : '',
        'Description': product.description || '',
        'Cost ($)': product.cost || '',
        'Price ($)': product.price || 0,
        'Stock': product.stock || 0,
        'Availability': product.availability || 'available',
        'Image URL': product.image || '',
        'Status': product.status || 'active'
      };
    });
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Product Name
      { wch: 20 }, // Brand Name
      { wch: 20 }, // Sub-Brand Name
      { wch: 40 }, // Description
      { wch: 12 }, // Cost
      { wch: 12 }, // Price
      { wch: 10 }, // Stock
      { wch: 15 }, // Availability
      { wch: 40 }, // Image URL
      { wch: 12 }  // Status
    ];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Products_Export_${timestamp}.xlsx`;
    
    // Download file
    XLSX.writeFile(wb, filename);
    
    showNotification(`Exported ${products.length} products to Excel successfully!`);
  } catch (error) {
    console.error('Error exporting products:', error);
    showNotification('Failed to export products to Excel', 'error');
  }
}
*/ // End of commented export function

function importProductsFromExcel() {
  // Feature coming soon - show message instead
  showFeatureComingSoon('Import from Excel');
  return;
}

/* COMMENTED OUT - Feature Coming Soon
async function importProductsFromExcel_OLD() {
  // Create file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls';
  input.style.display = 'none';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      showNotification('Reading Excel file...', 'success');
      
      // Read file
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            showNotification('Excel file is empty', 'error');
            return;
          }
          
          // Validate and import products
          await importProductsFromData(jsonData);
          
        } catch (error) {
          console.error('Error reading Excel file:', error);
          showNotification('Failed to read Excel file. Please check the format.', 'error');
        }
      };
      
      reader.readAsArrayBuffer(file);
      
    } catch (error) {
      console.error('Error importing products:', error);
      showNotification('Failed to import products from Excel', 'error');
    } finally {
      // Remove input element
      document.body.removeChild(input);
    }
  };
  
  // Trigger file picker
  document.body.appendChild(input);
  input.click();
}
*/ // End of commented import function

/* COMMENTED OUT - Feature Coming Soon
async function importProductsFromData(jsonData) {
  try {
    let brands = await getAllBrands();
    let subBrands = await getAllSubBrands();
    
    let successCount = 0;
    let errorCount = 0;
    let brandsCreated = 0;
    let subBrandsCreated = 0;
    const errors = [];
    
    // Helper function to generate slug from name
    function generateSlug(name) {
      return name.toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNum = i + 2; // +2 because Excel rows start at 1 and we have header
      
      try {
        // Validate required fields
        if (!row['Product Name'] || !row['Brand Name'] || !row['Price ($)']) {
          errors.push(`Row ${rowNum}: Missing required fields (Product Name, Brand Name, or Price)`);
          errorCount++;
          continue;
        }
        
        const brandName = row['Brand Name'].toString().trim();
        const brandNameLower = brandName.toLowerCase();
        
        // Find or create brand by name
        let brand = brands.find(b => 
          b.name.toLowerCase().trim() === brandNameLower
        );
        
        if (!brand) {
          // Brand doesn't exist, create it
          try {
            const brandSlug = generateSlug(brandName);
            const brandData = {
              name: brandName,
              slug: brandSlug,
              description: `Brand imported from Excel`
            };
            const brandId = await addBrand(brandData);
            brands = await getAllBrands(); // Refresh brands list
            brand = brands.find(b => b.id === brandId);
            brandsCreated++;
            console.log(`Created new brand: ${brandName}`);
          } catch (error) {
            errors.push(`Row ${rowNum}: Failed to create brand "${brandName}": ${error.message}`);
            errorCount++;
            continue;
          }
        }
        
        // Find or create sub-brand by name (if provided)
        let subBrandId = null;
        if (row['Sub-Brand Name']) {
          const subBrandName = row['Sub-Brand Name'].toString().trim();
          const subBrandNameLower = subBrandName.toLowerCase();
          
          let subBrand = subBrands.find(sb => 
            sb.name.toLowerCase().trim() === subBrandNameLower &&
            sb.brandId === brand.id
          );
          
          if (!subBrand) {
            // Sub-brand doesn't exist, create it
            try {
              const subBrandSlug = generateSlug(subBrandName);
              const subBrandData = {
                brandId: brand.id,
                name: subBrandName,
                slug: subBrandSlug,
                description: `Sub-brand imported from Excel`
              };
              const subBrandIdNew = await addSubBrand(subBrandData);
              subBrands = await getAllSubBrands(); // Refresh sub-brands list
              subBrandId = subBrandIdNew;
              subBrandsCreated++;
              console.log(`Created new sub-brand: ${subBrandName} for brand: ${brandName}`);
            } catch (error) {
              console.warn(`Row ${rowNum}: Failed to create sub-brand "${subBrandName}": ${error.message}`);
              // Continue without sub-brand
            }
          } else {
            subBrandId = subBrand.id;
          }
        }
        
        // Prepare product data
        const productData = {
          name: row['Product Name'].toString().trim(),
          brandId: brand.id ? brand.id.toString().trim() : null,
          subBrandId: subBrandId ? subBrandId.toString().trim() : null,
          description: row['Description'] ? row['Description'].toString().trim() : '',
          cost: row['Cost ($)'] ? parseFloat(row['Cost ($)']) : null,
          price: parseFloat(row['Price ($)']),
          stock: row['Stock'] ? parseInt(row['Stock']) : 0,
          availability: row['Availability'] ? row['Availability'].toString().toLowerCase().trim() : 'available',
          image: row['Image URL'] ? row['Image URL'].toString().trim() : '',
          status: row['Status'] ? row['Status'].toString().toLowerCase().trim() : 'active'
        };
        
        // Validate brandId is set
        if (!productData.brandId) {
          errors.push(`Row ${rowNum}: Brand ID is missing`);
          errorCount++;
          continue;
        }
        
        // Validate availability
        if (!['available', 'out-of-stock', 'coming-soon'].includes(productData.availability)) {
          productData.availability = 'available';
        }
        
        // Validate status
        if (!['active', 'inactive'].includes(productData.status)) {
          productData.status = 'active';
        }
        
        // Validate price
        if (isNaN(productData.price) || productData.price < 0) {
          errors.push(`Row ${rowNum}: Invalid price value`);
          errorCount++;
          continue;
        }
        
        // Validate stock
        if (isNaN(productData.stock) || productData.stock < 0) {
          productData.stock = 0;
        }
        
        // Add product
        await addProduct(productData);
        successCount++;
        
      } catch (error) {
        console.error(`Error importing row ${rowNum}:`, error);
        errors.push(`Row ${rowNum}: ${error.message || 'Unknown error'}`);
        errorCount++;
      }
    }
    
    // Show results
    let resultMessage = `Successfully imported ${successCount} product(s)`;
    if (brandsCreated > 0) {
      resultMessage += `. Created ${brandsCreated} new brand(s)`;
    }
    if (subBrandsCreated > 0) {
      resultMessage += `. Created ${subBrandsCreated} new sub-brand(s)`;
    }
    if (errorCount > 0) {
      resultMessage += `. ${errorCount} error(s) occurred.`;
    }
    
    if (successCount > 0 || brandsCreated > 0 || subBrandsCreated > 0) {
      showNotification(resultMessage);
      // Refresh brands and sub-brands lists if any were created
      if (brandsCreated > 0) {
        await loadAdminBrands();
        // Trigger update event to refresh shop page
        allBrands = await getAllBrands();
      }
      if (subBrandsCreated > 0) {
        await loadAdminSubBrands();
        // Trigger update event to refresh shop page
        allSubBrands = await getAllSubBrands();
      }
      loadAdminProducts();
    } else if (errorCount > 0) {
      showNotification(`Import failed: ${errorCount} error(s) occurred.`, 'error');
    }
    
    if (errors.length > 0) {
      console.error('Import errors:', errors);
      // Show errors in modal
      const errorMessage = errors.slice(0, 10).join('<br>') + (errors.length > 10 ? `<br>... and ${errors.length - 10} more errors` : '');
      openModal(`
        <h3>Import Errors</h3>
        <div style="max-height:400px;overflow-y:auto;padding:16px;background:var(--card);border-radius:8px;margin:16px 0">
          <p style="color:#ef4444;font-size:13px;line-height:1.6">${errorMessage}</p>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
          <button class="btn secondary" onclick="closeModal()">Close</button>
        </div>
      `);
    }
    
  } catch (error) {
    console.error('Error importing products:', error);
    showNotification('Failed to import products', 'error');
  }
}
*/ // End of commented importProductsFromData function

// Reviews Management
let allReviews = [];
let filteredReviews = [];

async function loadAdminReviews() {
  try {
    allReviews = await getAllReviews();
    filteredReviews = allReviews;
    renderAdminReviews();
  } catch (error) {
    console.error("Error loading reviews:", error);
  }
}

function renderAdminReviews() {
  const container = document.getElementById('reviewsList');
  if (!container) return;
  
  if (filteredReviews.length === 0) {
    container.innerHTML = '<p class="text-muted" style="text-align:center;padding:40px">No reviews found</p>';
    return;
  }
  
  container.innerHTML = filteredReviews.map(review => {
    const date = review.createdAt ? formatDate(review.createdAt) : 'N/A';
    const statusClass = review.status === 'approved' ? 'status-approved' : 
                        review.status === 'rejected' ? 'status-rejected' : 'status-pending';
    const ratingStars = review.rating ? '⭐'.repeat(review.rating) : 'No rating';
    
    return `
      <div style="border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:12px;background:var(--card)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;flex-wrap:wrap;gap:12px">
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;flex-wrap:wrap">
              <div style="font-weight:600;font-size:16px">${escapeHtml(review.name || 'Anonymous')}</div>
              <span class="status-badge ${statusClass}">${review.status}</span>
            </div>
            ${review.email ? `<div class="text-muted" style="font-size:13px;margin-bottom:4px">${escapeHtml(review.email)}</div>` : ''}
            ${review.rating ? `<div style="font-size:14px;margin-bottom:4px">${ratingStars}</div>` : ''}
            <div class="text-muted" style="font-size:12px">${date}</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${review.status === 'pending' ? `
              <button class="btn secondary" onclick="updateReviewStatus('${review.id}', 'approved')" style="font-size:12px;padding:6px 12px;background:#10b981;color:#fff;border-color:#10b981">Approve</button>
              <button class="btn secondary" onclick="updateReviewStatus('${review.id}', 'rejected')" style="font-size:12px;padding:6px 12px;background:#ef4444;color:#fff;border-color:#ef4444">Reject</button>
            ` : ''}
            <button class="icon-btn" onclick="deleteReviewAdmin('${review.id}')" style="padding:6px 12px;font-size:12px;color:#ef4444">Delete</button>
          </div>
        </div>
        ${review.comment ? `<div style="padding:12px;background:#f9fafb;border-radius:6px;margin-top:12px;font-size:14px;line-height:1.6;color:var(--text)">${escapeHtml(review.comment)}</div>` : ''}
      </div>
    `;
  }).join('');
}

function filterAdminReviews() {
  const statusFilter = document.getElementById('reviewStatusFilter')?.value || '';
  
  if (statusFilter) {
    filteredReviews = allReviews.filter(r => r.status === statusFilter);
  } else {
    filteredReviews = allReviews;
  }
  
  renderAdminReviews();
}

async function updateReviewStatus(reviewId, status) {
  try {
    const reviews = await getAllReviews();
    const reviewIndex = reviews.findIndex(r => r.id === reviewId);
    
    if (reviewIndex !== -1) {
      reviews[reviewIndex].status = status;
      reviews[reviewIndex].updatedAt = new Date();
      
      const COLLECTIONS = { REVIEWS: 'localDB_reviews' };
      saveCollection(COLLECTIONS.REVIEWS, reviews);
      
      showNotification(`Review ${status} successfully`);
      await loadAdminReviews();
    }
  } catch (error) {
    console.error('Error updating review status:', error);
    showNotification('Failed to update review status', 'error');
  }
}

async function deleteReviewAdmin(reviewId) {
  const review = allReviews.find(r => r.id === reviewId);
  const reviewName = review ? (review.name || 'Anonymous') : '';
  openDeleteConfirmationModal('review', reviewId, reviewName);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Dashboard feature coming soon - don't load on page load
  // loadDashboard();
});

