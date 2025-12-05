/* Main Application Script - Common Functions */

// Update cart badge
function updateCartBadge() {
  const count = getCartItemCount();
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  });
}

// Format price
function formatPrice(price) {
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Format date
function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'N/A';
  }
}

// Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show notification
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Modal functions
function openModal(html) {
  const backdrop = document.getElementById('modalBackdrop');
  const modal = document.getElementById('modal');
  if (!backdrop || !modal) return;
  
  modal.innerHTML = html;
  backdrop.style.display = 'flex';
  backdrop.classList.add('active');
  
  backdrop.onclick = function(e) {
    if (e.target === backdrop) closeModal();
  };
}

function closeModal() {
  const backdrop = document.getElementById('modalBackdrop');
  const modal = document.getElementById('modal');
  if (!backdrop || !modal) return;
  
  backdrop.style.display = 'none';
  backdrop.classList.remove('active');
  modal.innerHTML = '';
}

// Loading spinner
function showLoading(element) {
  if (element) {
    element.innerHTML = `
      <div style="text-align:center;padding:40px">
        <div style="display:inline-block;width:40px;height:40px;border:4px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite"></div>
        <p style="margin-top:16px;color:var(--muted)">Loading...</p>
      </div>
    `;
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  
  // Add CSS animations
  if (!document.getElementById('appStyles')) {
    const style = document.createElement('style');
    style.id = 'appStyles';
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
      }
      .cart-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ef4444;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Initialize update message box (only on shop page, not admin)
  if (window.location.pathname.includes('index.html') || (window.location.pathname === '/' || window.location.pathname.endsWith('/'))) {
    startUpdateMessageInterval();
    // Show copyright popup when website opens
    showCopyrightPopup();
  }
});

// Copyright Popup Functions
function showCopyrightPopup() {
  const popup = document.getElementById('copyrightPopup');
  if (popup) {
    // Show after a short delay
    setTimeout(() => {
      popup.classList.add('show');
    }, 300);
    
    // Auto close after 7 seconds
    setTimeout(() => {
      closeCopyrightPopup();
    }, 7300); // 300ms delay + 7000ms display time
  }
}

function closeCopyrightPopup() {
  const popup = document.getElementById('copyrightPopup');
  if (popup && popup.classList.contains('show')) {
    popup.classList.remove('show');
    popup.classList.add('hide');
    setTimeout(() => {
      popup.style.display = 'none';
      popup.classList.remove('hide');
    }, 400);
  }
}

// Update Message Box Functions
let updateMessageInterval = null;
let updateMessageTimeout = null;

function showUpdateMessage() {
  // Only show on shop page (index.html), not on admin panel
  const isAdminPage = window.location.pathname.includes('admin.html') || 
                      window.location.href.includes('admin.html');
  
  if (isAdminPage) {
    return;
  }
  
  const messageBox = document.getElementById('updateMessageBox');
  if (!messageBox) return;
  
  // Don't show if modal is open
  const modalBackdrop = document.getElementById('modalBackdrop');
  if (modalBackdrop && modalBackdrop.style.display === 'flex') {
    return;
  }
  
  // Show the message box
  messageBox.classList.remove('hidden');
  messageBox.classList.add('show');
  
  // Auto-hide after 10 seconds
  clearTimeout(updateMessageTimeout);
  updateMessageTimeout = setTimeout(() => {
    closeUpdateMessage();
  }, 10000);
}

function closeUpdateMessage() {
  const messageBox = document.getElementById('updateMessageBox');
  if (!messageBox) return;
  
    messageBox.classList.remove('show');
  messageBox.classList.add('hidden');
}

function startUpdateMessageInterval() {
  // Clear any existing interval
  stopUpdateMessageInterval();
  
  // Show message after 10 seconds
  setTimeout(() => {
    showUpdateMessage();
  }, 10000);
  
  // Then show every 10 seconds
  updateMessageInterval = setInterval(() => {
    const messageBox = document.getElementById('updateMessageBox');
    // Only show if not already visible
    if (messageBox && !messageBox.classList.contains('show')) {
      showUpdateMessage();
    }
  }, 10000);
}

function stopUpdateMessageInterval() {
  if (updateMessageInterval) {
    clearInterval(updateMessageInterval);
    updateMessageInterval = null;
  }
  if (updateMessageTimeout) {
    clearTimeout(updateMessageTimeout);
    updateMessageTimeout = null;
  }
}

