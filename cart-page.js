/* Cart Page Script */

let cartProducts = [];

async function loadCart() {
  const cart = getCart();
  
  if (cart.length === 0) {
    document.getElementById('cartItems').innerHTML = `
      <div style="text-align:center;padding:60px">
        <p style="color:var(--muted);font-size:16px;margin-bottom:20px">Your cart is empty</p>
        <a href="index.html" class="btn">Continue Shopping</a>
      </div>
    `;
    document.getElementById('orderSummary').innerHTML = `
      <div style="text-align:center;padding:20px;color:var(--muted)">
        <p>Add items to cart to see summary</p>
      </div>
    `;
    return;
  }
  
  // Load product details for cart items
  cartProducts = [];
  for (const item of cart) {
    try {
      const product = await getProductById(item.id);
      if (product) {
        cartProducts.push({ ...product, cartQuantity: item.quantity });
      }
    } catch (error) {
      console.error("Error loading product:", error);
    }
  }
  
  renderCart();
  renderOrderSummary();
}

function renderCart() {
  const container = document.getElementById('cartItems');
  if (!container) return;
  
  if (cartProducts.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px">
        <p style="color:var(--muted);font-size:16px;margin-bottom:20px">Your cart is empty</p>
        <a href="index.html" class="btn">Continue Shopping</a>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <h2 style="font-size:18px;margin-bottom:16px">Cart Items (${cartProducts.length})</h2>
    <div style="display:flex;flex-direction:column;gap:16px">
      ${cartProducts.map(product => `
        <div style="display:flex;gap:16px;padding:16px;border:1px solid var(--border);border-radius:8px">
          <div style="width:100px;height:100px;background:var(--card);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            ${product.image ? 
              `<img src="${product.image}" alt="${escapeHtml(product.name)}" style="max-width:100%;max-height:100%;object-fit:cover;border-radius:8px"/>` :
              `<div style="color:var(--muted);font-size:12px;text-align:center">No Image</div>`
            }
          </div>
          <div style="flex:1">
            <h3 style="font-size:16px;margin-bottom:4px">
              <a href="product.html?id=${product.id}" style="color:var(--text);text-decoration:none">${escapeHtml(product.name)}</a>
            </h3>
            <p class="text-muted" style="font-size:13px;margin-bottom:8px">${escapeHtml(product.description || '')}</p>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="font-weight:700;font-size:18px;color:var(--accent);margin-bottom:4px">
                  ${formatPrice(product.price)}
                </div>
                <div class="text-muted" style="font-size:12px">
                  Stock: ${product.stock > 0 ? product.stock : 'Out of Stock'}
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:12px">
                <div style="display:flex;align-items:center;gap:8px;border:1px solid var(--border);border-radius:8px;padding:4px">
                  <button onclick="updateQuantity('${product.id}', ${product.cartQuantity - 1})" 
                    style="background:none;border:none;padding:4px 8px;cursor:pointer;font-size:18px" ${product.cartQuantity <= 1 ? 'disabled' : ''}>-</button>
                  <span style="min-width:40px;text-align:center;font-weight:600">${product.cartQuantity}</span>
                  <button onclick="updateQuantity('${product.id}', ${product.cartQuantity + 1})" 
                    style="background:none;border:none;padding:4px 8px;cursor:pointer;font-size:18px" ${product.cartQuantity >= product.stock ? 'disabled' : ''}>+</button>
                </div>
                <button onclick="removeItem('${product.id}')" class="icon-btn" style="padding:8px">
                  <span style="font-size:18px">🗑️</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderOrderSummary() {
  const container = document.getElementById('orderSummary');
  if (!container) return;
  
  const subtotal = cartProducts.reduce((sum, p) => sum + (p.price * p.cartQuantity), 0);
  const shipping = subtotal > 50 ? 0 : 5;
  const tax = subtotal * 0.06625; // 6.625% New Jersey Sales Tax
  const total = subtotal + shipping + tax;
  
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;justify-content:space-between">
        <span class="text-muted">Subtotal</span>
        <span style="font-weight:600">${formatPrice(subtotal)}</span>
      </div>
      <div style="display:flex;justify-content:space-between">
        <span class="text-muted">Shipping</span>
        <span style="font-weight:600">${shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
      </div>
      <div style="display:flex;justify-content:space-between">
        <span class="text-muted">Tax (NJ Sales Tax 6.625%)</span>
        <span style="font-weight:600">${formatPrice(tax)}</span>
      </div>
      <div style="margin-top:8px;padding-top:12px;border-top:2px solid var(--border);display:flex;justify-content:space-between">
        <span style="font-size:18px;font-weight:700">Total</span>
        <span style="font-size:18px;font-weight:700;color:var(--accent)">${formatPrice(total)}</span>
      </div>
      ${subtotal < 50 ? `
        <div style="margin-top:8px;padding:8px;background:var(--card);border-radius:6px;font-size:12px;color:var(--muted)">
          Add $${(50 - subtotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} more for free shipping!
        </div>
      ` : ''}
    </div>
  `;
}

function updateQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    removeItem(productId);
    return;
  }
  
  const product = cartProducts.find(p => p.id === productId);
  if (product && newQuantity > product.stock) {
    showNotification(`Only ${product.stock} items available`, 'error');
    return;
  }
  
  updateCartQuantity(productId, newQuantity);
  loadCart();
  updateCartBadge();
}

function removeItem(productId) {
  if (confirm('Remove this item from cart?')) {
    removeFromCart(productId);
    loadCart();
    updateCartBadge();
    showNotification('Item removed from cart');
  }
}

function handleCheckoutClick() {
  // Show "Feature Coming Soon" modal
  const modalHTML = `
    <div class="coming-soon-box" style="text-align:center;padding:32px">
      <div class="coming-soon-icon" style="font-size:64px;margin-bottom:20px">✨</div>
      <h3 class="coming-soon-title" style="font-size:24px;font-weight:700;margin-bottom:12px;color:var(--text)">Feature Coming Soon</h3>
      <p class="coming-soon-text" style="color:var(--muted);font-size:15px;line-height:1.6;margin-bottom:24px;max-width:400px;margin:0 auto 24px">
        We're working on something amazing for the checkout feature. This feature will be available soon!
      </p>
      <button class="btn" onclick="closeModal();clearCartAndReload()" style="padding:12px 24px;font-size:14px;font-weight:600;background:var(--accent)">
        OK
      </button>
    </div>
  `;
  
  openModal(modalHTML);
}

function clearCartAndReload() {
  // Clear the cart
  clearCart();
  updateCartBadge();
  
  // Reload the cart page
  loadCart();
  
  // Show notification
  showNotification('Cart cleared. Feature coming soon!', 'info');
}

// Make function globally accessible
window.handleCheckoutClick = handleCheckoutClick;
window.clearCartAndReload = clearCartAndReload;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
});

