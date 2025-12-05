/* Authentication Service - Local Storage Based */

const AUTH_STORAGE_KEY = 'localDB_auth';
let currentUser = null;

// Load user from localStorage on init
function loadCurrentUser() {
  try {
    const userData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (userData) {
      currentUser = JSON.parse(userData);
      updateAuthUI();
    }
  } catch (error) {
    console.error("Error loading user:", error);
    currentUser = null;
  }
}

// Save user to localStorage
function saveCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Error saving user:", error);
  }
}

// Listen to auth state changes
function onAuthStateChanged(callback) {
  loadCurrentUser();
  if (callback) callback(currentUser);
  
  // Watch for storage changes (for multi-tab support)
  window.addEventListener('storage', (e) => {
    if (e.key === AUTH_STORAGE_KEY) {
      loadCurrentUser();
      if (callback) callback(currentUser);
    }
  });
}

// Initialize on load
onAuthStateChanged((user) => {
  currentUser = user;
  updateAuthUI();
});

function updateAuthUI() {
  const authButtons = document.querySelectorAll('.auth-button');
  const userMenu = document.getElementById('userMenu');
  
  if (currentUser) {
    authButtons.forEach(btn => {
      if (btn.dataset.action === 'login') {
        btn.style.display = 'none';
      }
      if (btn.dataset.action === 'logout') {
        btn.style.display = 'inline-block';
      }
    });
    if (userMenu) {
      userMenu.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:13px;color:var(--muted)">${currentUser.email}</span>
          <button class="btn secondary" onclick="logout()" style="padding:6px 12px;font-size:12px">Logout</button>
        </div>
      `;
    }
  } else {
    authButtons.forEach(btn => {
      if (btn.dataset.action === 'login') {
        btn.style.display = 'inline-block';
      }
      if (btn.dataset.action === 'logout') {
        btn.style.display = 'none';
      }
    });
    if (userMenu) {
      userMenu.innerHTML = `
        <button class="btn" onclick="showLoginModal()" style="padding:6px 12px;font-size:12px">Login</button>
      `;
    }
  }
}

// Get users collection
function getUsers() {
  try {
    const users = localStorage.getItem('localDB_users');
    return users ? JSON.parse(users) : [];
  } catch (error) {
    return [];
  }
}

// Save users collection
function saveUsers(users) {
  try {
    localStorage.setItem('localDB_users', JSON.stringify(users));
    return true;
  } catch (error) {
    console.error("Error saving users:", error);
    return false;
  }
}

async function login(email, password) {
  try {
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Simple password check (in production, use proper hashing)
    if (user.password !== password) {
      return { success: false, error: 'Invalid password' };
    }
    
    // Create user session
    const sessionUser = {
      uid: user.id,
      email: user.email,
      displayName: user.name
    };
    
    currentUser = sessionUser;
    saveCurrentUser(sessionUser);
    updateAuthUI();
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function register(email, password, name) {
  try {
    const users = getUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'User already exists' };
    }
    
    // Create new user
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const newUser = {
      id: userId,
      email,
      password, // In production, hash this!
      name,
      role: 'customer',
      createdAt: new Date()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Auto login after registration
    const sessionUser = {
      uid: userId,
      email,
      displayName: name
    };
    
    currentUser = sessionUser;
    saveCurrentUser(sessionUser);
    updateAuthUI();
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function logout() {
  try {
    currentUser = null;
    saveCurrentUser(null);
    updateAuthUI();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function getCurrentUser() {
  return currentUser;
}

function isAdmin() {
  // Simple admin check - you can enhance this with role-based access
  return currentUser && currentUser.email === 'admin@cardsandsmoke.com';
}

// Global functions
window.showLoginModal = function() {
  openModal(`
    <h3>Login / Register</h3>
    <div id="authTabs" style="display:flex;gap:8px;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:8px">
      <button class="btn secondary" onclick="switchAuthTab('login')" id="loginTab" style="flex:1">Login</button>
      <button class="btn secondary" onclick="switchAuthTab('register')" id="registerTab" style="flex:1">Register</button>
    </div>
    <div id="authForm">
      <div id="loginForm">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="loginEmail" class="input" placeholder="your@email.com"/>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="loginPassword" class="input" placeholder="••••••••"/>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
          <button class="btn secondary" onclick="closeModal()">Cancel</button>
          <button class="btn" onclick="handleLogin()">Login</button>
        </div>
      </div>
      <div id="registerForm" style="display:none">
        <div class="form-group">
          <label>Name</label>
          <input type="text" id="registerName" class="input" placeholder="Your Name"/>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="registerEmail" class="input" placeholder="your@email.com"/>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="registerPassword" class="input" placeholder="••••••••"/>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
          <button class="btn secondary" onclick="closeModal()">Cancel</button>
          <button class="btn" onclick="handleRegister()">Register</button>
        </div>
      </div>
    </div>
  `);
  switchAuthTab('login');
};

window.switchAuthTab = function(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  
  if (tab === 'login') {
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
    if (loginTab) loginTab.classList.add('active');
    if (registerTab) registerTab.classList.remove('active');
  } else {
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
    if (loginTab) loginTab.classList.remove('active');
    if (registerTab) registerTab.classList.add('active');
  }
};

window.handleLogin = async function() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    alert('Please fill all fields');
    return;
  }
  
  const result = await login(email, password);
  if (result.success) {
    closeModal();
    showNotification('Login successful!');
  } else {
    alert('Login failed: ' + result.error);
  }
};

window.handleRegister = async function() {
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  if (!name || !email || !password) {
    alert('Please fill all fields');
    return;
  }
  
  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }
  
  const result = await register(email, password, name);
  if (result.success) {
    closeModal();
    showNotification('Registration successful!');
  } else {
    alert('Registration failed: ' + result.error);
  }
};

window.logout = async function() {
  if (confirm('Are you sure you want to logout?')) {
    await logout();
    showNotification('Logged out successfully');
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadCurrentUser();
  updateAuthUI();
});
