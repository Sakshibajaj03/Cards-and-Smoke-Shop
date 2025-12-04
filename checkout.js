/* Checkout Page Script */

let cartProducts = [];

async function loadCheckout() {
  const cart = getCart();
  
  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }
  
  // Load product details
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
  
  renderOrderSummary();
  
  // Pre-fill user email if logged in
  const user = getCurrentUser();
  if (user && user.email) {
    document.getElementById('shippingEmail').value = user.email;
  }
}

function renderOrderSummary() {
  const container = document.getElementById('checkoutSummary');
  if (!container) return;
  
  const subtotal = cartProducts.reduce((sum, p) => sum + (p.price * p.cartQuantity), 0);
  const shipping = subtotal > 50 ? 0 : 5;
  const tax = subtotal * 0.06625; // 6.625% New Jersey Sales Tax
  const total = subtotal + shipping + tax;
  
  container.innerHTML = `
    <div style="margin-bottom:16px">
      <div style="display:flex;flex-direction:column;gap:8px;max-height:300px;overflow-y:auto;padding:8px;background:var(--card);border-radius:8px">
        ${cartProducts.map(product => `
          <div style="display:flex;gap:12px;padding:8px">
            <div style="width:60px;height:60px;background:white;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
              ${product.image ? 
                `<img src="${product.image}" alt="${escapeHtml(product.name)}" style="max-width:100%;max-height:100%;object-fit:cover;border-radius:6px"/>` :
                `<div style="color:var(--muted);font-size:10px;text-align:center">No Image</div>`
              }
            </div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600;margin-bottom:2px">${escapeHtml(product.name)}</div>
              <div class="text-muted" style="font-size:11px">Qty: ${product.cartQuantity} × ${formatPrice(product.price)}</div>
            </div>
            <div style="font-weight:600;font-size:14px">${formatPrice(product.price * product.cartQuantity)}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;padding-top:16px;border-top:1px solid var(--border)">
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
    </div>
  `;
}

async function handleCheckout(event) {
  event.preventDefault();
  
  const cart = getCart();
  if (cart.length === 0) {
    showNotification('Your cart is empty', 'error');
    return;
  }
  
  // Validate stock
  for (const item of cart) {
    const product = await getProductById(item.id);
    if (!product) {
      showNotification(`Product ${item.name} no longer exists`, 'error');
      return;
    }
    if (product.stock < item.quantity) {
      showNotification(`Only ${product.stock} items available for ${product.name}`, 'error');
      return;
    }
  }
  
  // Get form data
  const orderData = {
    shipping: {
      name: document.getElementById('shippingName').value,
      email: document.getElementById('shippingEmail').value,
      phone: document.getElementById('shippingPhone').value,
      address: document.getElementById('shippingAddress').value,
      city: document.getElementById('shippingCity').value,
      state: document.getElementById('shippingState').value,
      pin: document.getElementById('shippingPin').value
    },
    paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
    items: cart.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    subtotal: cartProducts.reduce((sum, p) => sum + (p.price * p.cartQuantity), 0),
    shipping: cartProducts.reduce((sum, p) => sum + (p.price * p.cartQuantity), 0) > 50 ? 0 : 5,
    tax: cartProducts.reduce((sum, p) => sum + (p.price * p.cartQuantity), 0) * 0.06625, // 6.625% New Jersey Sales Tax
    userId: getCurrentUser()?.uid || null,
    orderNumber: 'ORD-' + Date.now()
  };
  
  orderData.total = orderData.subtotal + orderData.shipping + orderData.tax;
  
  try {
    // Create order
    const orderId = await createOrder(orderData);
    
    // Update product stock
    for (const item of cart) {
      const product = await getProductById(item.id);
      if (product) {
        await updateProduct(item.id, {
          stock: product.stock - item.quantity
        });
      }
    }
    
    // Clear cart
    clearCart();
    updateCartBadge();
    
    // Redirect to success page
    window.location.href = `order-success.html?orderId=${orderId}&orderNumber=${orderData.orderNumber}`;
  } catch (error) {
    console.error("Error creating order:", error);
    showNotification('Failed to place order. Please try again.', 'error');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadCheckout();
});

