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

// Admin PIN Modal Functions
const ADMIN_PIN = '1122';

function openAdminPinModal(event) {
  if (event) {
    event.preventDefault();
  }
  
  // Create PIN modal HTML
  const pinModalHTML = `
    <div class="pin-modal" id="adminPinModal">
      <div class="pin-modal-content">
        <div class="pin-modal-header">
          <h2 class="pin-modal-title">🔐 Admin Access</h2>
          <p class="pin-modal-subtitle">Enter 4-digit PIN to continue</p>
        </div>
        <div class="pin-input-container" id="pinInputContainer">
          <input type="text" class="pin-input" maxlength="1" inputmode="numeric" pattern="[0-9]" autocomplete="off" data-index="0" />
          <input type="text" class="pin-input" maxlength="1" inputmode="numeric" pattern="[0-9]" autocomplete="off" data-index="1" />
          <input type="text" class="pin-input" maxlength="1" inputmode="numeric" pattern="[0-9]" autocomplete="off" data-index="2" />
          <input type="text" class="pin-input" maxlength="1" inputmode="numeric" pattern="[0-9]" autocomplete="off" data-index="3" />
        </div>
        <div class="pin-error-message" id="pinErrorMessage"></div>
        <div class="pin-modal-actions">
          <button class="pin-btn pin-btn-primary" onclick="verifyAdminPin()">Verify</button>
          <button class="pin-btn pin-btn-secondary" onclick="closeAdminPinModal()">Cancel</button>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', pinModalHTML);
  
  // Show modal with animation
  setTimeout(() => {
    const modal = document.getElementById('adminPinModal');
    if (modal) {
      modal.classList.add('show');
      // Focus first input
      const firstInput = modal.querySelector('.pin-input[data-index="0"]');
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, 10);
  
  // Setup PIN input handlers
  setupPinInputs();
}

function setupPinInputs() {
  const inputs = document.querySelectorAll('.pin-input');
  
  inputs.forEach((input, index) => {
    // Handle input
    input.addEventListener('input', (e) => {
      const value = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = value;
      
      if (value) {
        e.target.classList.add('filled');
        // Move to next input
        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      } else {
        e.target.classList.remove('filled');
      }
      
      // Clear error on input
      const errorMsg = document.getElementById('pinErrorMessage');
      if (errorMsg) {
        errorMsg.textContent = '';
        errorMsg.classList.remove('show');
      }
    });
    
    // Handle backspace
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        inputs[index - 1].focus();
        inputs[index - 1].value = '';
        inputs[index - 1].classList.remove('filled');
      }
    });
    
    // Handle paste
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
      pastedData.split('').forEach((char, i) => {
        if (inputs[index + i]) {
          inputs[index + i].value = char;
          inputs[index + i].classList.add('filled');
        }
      });
      // Focus last filled input or verify button
      const lastFilledIndex = Math.min(index + pastedData.length - 1, inputs.length - 1);
      if (inputs[lastFilledIndex]) {
        inputs[lastFilledIndex].focus();
      }
    });
  });
  
  // Handle Enter and Escape keys (only if modal exists)
  if (!window.pinModalKeyHandler) {
    window.pinModalKeyHandler = (e) => {
      const modal = document.getElementById('adminPinModal');
      if (!modal) return;
      
      if (e.key === 'Enter') {
        verifyAdminPin();
      } else if (e.key === 'Escape') {
        closeAdminPinModal();
      }
    };
    document.addEventListener('keydown', window.pinModalKeyHandler);
  }
}

function verifyAdminPin() {
  const inputs = document.querySelectorAll('.pin-input');
  const enteredPin = Array.from(inputs).map(input => input.value).join('');
  const errorMsg = document.getElementById('pinErrorMessage');
  
  if (enteredPin.length !== 4) {
    if (errorMsg) {
      errorMsg.textContent = 'Please enter all 4 digits';
      errorMsg.classList.add('show');
    }
    // Shake animation
    inputs.forEach(input => {
      input.classList.add('error');
      setTimeout(() => input.classList.remove('error'), 500);
    });
    return;
  }
  
  if (enteredPin === ADMIN_PIN) {
    // Success - redirect to admin page
    inputs.forEach(input => {
      input.classList.remove('error');
      input.style.borderColor = 'var(--success)';
      input.style.background = 'rgba(16, 185, 129, 0.1)';
    });
    
    // Show success message briefly
    if (errorMsg) {
      errorMsg.textContent = '✓ Access granted!';
      errorMsg.style.color = 'var(--success)';
      errorMsg.classList.add('show');
    }
    
    // Redirect after short delay
    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 500);
  } else {
    // Wrong PIN
    inputs.forEach(input => {
      input.classList.add('error');
      input.value = '';
      input.classList.remove('filled');
    });
    
    if (errorMsg) {
      errorMsg.textContent = '✗ Incorrect PIN. Please try again.';
      errorMsg.style.color = 'var(--error)';
      errorMsg.classList.add('show');
    }
    
    // Focus first input
    inputs[0].focus();
    
    // Remove error class after animation
    setTimeout(() => {
      inputs.forEach(input => input.classList.remove('error'));
    }, 500);
  }
}

function closeAdminPinModal() {
  const modal = document.getElementById('adminPinModal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// Close modal on backdrop click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('adminPinModal');
  if (modal && e.target === modal) {
    closeAdminPinModal();
  }
});

