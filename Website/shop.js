/* Shop Page Script */

let allProducts = [];
let allBrands = [];
let allSubBrands = [];
let filteredProducts = [];

async function loadShopPage() {
  showLoading(document.getElementById('productsGrid'));
  
  try {
    // Load brands and sub-brands
    allBrands = await getAllBrands();
    allSubBrands = await getAllSubBrands();
    renderBrands();
    
    // Load products - filter by active status and availability
    allProducts = await getAllProducts();
    // Only show active products on index page
    filteredProducts = allProducts.filter(p => p.status === 'active');
    renderProducts();
    
    // Setup real-time listener for products
    setupProductsListener((products) => {
      allProducts = products;
      applyFilters();
    });
    
    // Setup real-time listener for brands
    setupBrandsListener((brands) => {
      allBrands = brands;
      renderBrands(); // Re-render brands when they change (includes brand filter dropdown)
      renderProducts(); // Re-render products to update brand names
      applyFilters(); // Re-apply filters
    });
    
    // Setup real-time listener for sub-brands
    setupSubBrandsListener((subBrands) => {
      allSubBrands = subBrands;
      renderBrands(); // Re-render brands to update sub-brand dropdowns
      renderProducts(); // Re-render products to update sub-brand names
      applyFilters(); // Re-apply filters
    });
  } catch (error) {
    console.error("Error loading shop:", error);
    document.getElementById('productsGrid').innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--muted)">
        <p>Error loading products. Please refresh the page.</p>
      </div>
    `;
  }
}

function renderBrands() {
  const container = document.getElementById('brandsList');
  const filter = document.getElementById('brandFilter');
  
  if (!container || !filter) return;
  
  // Function to close all dropdowns
  function closeAllDropdowns() {
    const allDropdowns = container.querySelectorAll('.brand-dropdown-menu');
    allDropdowns.forEach(dd => {
      dd.style.display = 'none';
      dd.style.opacity = '0';
      dd.style.visibility = 'hidden';
    });
  }
  
  // Render brand chips with dropdown
  container.innerHTML = '';
  allBrands.forEach((brand, index) => {
    const brandWrapper = document.createElement('div');
    brandWrapper.className = 'brand-wrapper';
    brandWrapper.style.position = 'relative';
    brandWrapper.style.display = 'inline-block';
    brandWrapper.setAttribute('data-brand-index', index);
    
    const chip = document.createElement('button');
    chip.className = 'brand-chip';
    chip.textContent = brand.name;
    chip.type = 'button';
    chip.onclick = () => filterByBrand(brand.id);
    
    // Get sub-brands for this brand
    const subBrandsForBrand = allSubBrands.filter(sb => sb.brandId === brand.id);
    
    // Create dropdown if sub-brands exist
    if (subBrandsForBrand.length > 0) {
      chip.classList.add('has-dropdown');
      const dropdown = document.createElement('div');
      dropdown.className = 'brand-dropdown-menu';
      dropdown.setAttribute('data-dropdown-index', index);
      dropdown.style.display = 'none';
      dropdown.style.opacity = '0';
      dropdown.style.visibility = 'hidden';
      dropdown.innerHTML = subBrandsForBrand.map(subBrand => `
        <div class="brand-dropdown-item" onclick="filterBySubBrand('${subBrand.id}'); event.stopPropagation();">
          ${escapeHtml(subBrand.name)}
        </div>
      `).join('');
      
      brandWrapper.appendChild(chip);
      brandWrapper.appendChild(dropdown);
      
      // Show dropdown on hover - close others first
      let hoverTimeout;
      const showDropdown = (e) => {
        if (e) e.stopPropagation();
        clearTimeout(hoverTimeout);
        // Close all other dropdowns first
        closeAllDropdowns();
        // Then show this one
        requestAnimationFrame(() => {
          dropdown.style.display = 'block';
          dropdown.style.opacity = '1';
          dropdown.style.visibility = 'visible';
          dropdown.style.zIndex = '1000';
          dropdown.style.animation = 'dropdownFadeIn 0.3s ease-out forwards';
        });
      };
      
      const hideDropdown = (e) => {
        if (e) e.stopPropagation();
        hoverTimeout = setTimeout(() => {
          dropdown.style.display = 'none';
          dropdown.style.opacity = '0';
          dropdown.style.visibility = 'hidden';
        }, 200);
      };
      
      brandWrapper.addEventListener('mouseenter', showDropdown);
      brandWrapper.addEventListener('mouseleave', hideDropdown);
      
      // Keep dropdown open when hovering over it
      dropdown.addEventListener('mouseenter', (e) => {
        e.stopPropagation();
        clearTimeout(hoverTimeout);
        dropdown.style.display = 'block';
        dropdown.style.opacity = '1';
        dropdown.style.visibility = 'visible';
        dropdown.style.zIndex = '1000';
      });
      
      dropdown.addEventListener('mouseleave', hideDropdown);
    } else {
      brandWrapper.appendChild(chip);
    }
    
    container.appendChild(brandWrapper);
  });
  
  // Populate filter dropdown
  filter.innerHTML = '<option value="">All Brands</option>';
  allBrands.forEach(brand => {
    const option = document.createElement('option');
    option.value = brand.id;
    option.textContent = brand.name;
    filter.appendChild(option);
  });
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const noProducts = document.getElementById('noProducts');
  
  if (!grid) return;
  
  if (filteredProducts.length === 0) {
    grid.innerHTML = '';
    if (noProducts) noProducts.style.display = 'block';
    return;
  }
  
  if (noProducts) noProducts.style.display = 'none';
  
  grid.innerHTML = filteredProducts.map(product => {
    const brand = allBrands.find(b => b.id === product.brandId);
    const subBrand = allSubBrands.find(sb => sb.id === product.subBrandId);
    const availability = product.availability || 'available';
    const availabilityClass = availability === 'out-of-stock' ? 'out-of-stock' : availability === 'coming-soon' ? 'coming-soon' : '';
    const availabilityBadge = availability === 'out-of-stock' ? 
      '<div class="availability-badge out-of-stock-badge">Out of Stock</div>' : 
      availability === 'coming-soon' ? 
      '<div class="availability-badge coming-soon-badge">Coming Soon</div>' : '';
    
    return `
    <div class="product-card ${availabilityClass}">
      ${availabilityBadge}
      <div class="product-image" style="background:var(--card);height:160px;display:flex;align-items:center;justify-content:center;border-radius:6px;margin-bottom:8px;position:relative;${availability === 'out-of-stock' ? 'opacity:0.6' : ''}">
        ${product.image ? 
          `<img src="${product.image}" alt="${escapeHtml(product.name)}" style="max-width:100%;max-height:100%;object-fit:cover;border-radius:6px"/>` :
          `<div style="color:var(--muted);font-size:12px">No Image</div>`
        }
      </div>
      ${brand || subBrand ? `<div class="text-muted" style="font-size:10px;margin-bottom:3px">${brand ? brand.name : ''}${brand && subBrand ? ' - ' : ''}${subBrand ? subBrand.name : ''}</div>` : ''}
      <h3 style="font-size:14px;margin-bottom:3px;line-height:1.3;font-weight:600">${escapeHtml(product.name)}</h3>
      <p class="text-muted" style="font-size:12px;margin-bottom:6px;min-height:32px;line-height:1.4">${escapeHtml(product.description || '')}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto">
        <div>
          <div style="font-weight:700;font-size:15px;color:var(--accent)">${formatPrice(product.price)}</div>
          ${availability === 'available' && product.stock > 0 ? 
            `<div class="text-muted" style="font-size:10px">In Stock (${product.stock})</div>` :
            availability === 'coming-soon' ?
            `<div style="color:#f59e0b;font-size:10px">Coming Soon</div>` :
            `<div style="color:#ef4444;font-size:10px">Out of Stock</div>`
          }
        </div>
        <div style="display:flex;gap:6px">
          <a href="product.html?id=${product.id}" class="btn secondary" style="padding:6px 10px;font-size:11px">View</a>
          <button class="btn" onclick="addToCartFromShop('${product.id}')" style="padding:6px 10px;font-size:11px" ${product.stock <= 0 || availability === 'out-of-stock' || availability === 'coming-soon' ? 'disabled' : ''}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

function filterByBrand(brandId) {
  document.getElementById('brandFilter').value = brandId || '';
  applyFilters();
}

function filterBySubBrand(subBrandId) {
  // Filter products by sub-brand
  let filtered = [...allProducts];
  filtered = filtered.filter(p => p.subBrandId === subBrandId);
  filteredProducts = filtered;
  renderProducts();
  
  // Update brand filter to show parent brand
  const subBrand = allSubBrands.find(sb => sb.id === subBrandId);
  if (subBrand) {
    const brandFilter = document.getElementById('brandFilter');
    if (brandFilter) {
      brandFilter.value = subBrand.brandId;
      brandFilter.setAttribute('data-sub-brand', subBrandId);
    }
  }
  
  // Scroll to products section
  document.getElementById('productsGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleBrandFilter() {
  // Clear sub-brand filter when brand changes
  const brandFilter = document.getElementById('brandFilter');
  if (brandFilter) {
    brandFilter.removeAttribute('data-sub-brand');
  }
  applyFilters();
}

function handleSearch() {
  applyFilters();
}

function handleSort() {
  applyFilters();
}

function applyFilters() {
  let filtered = [...allProducts];
  
  // Only show active products
  filtered = filtered.filter(p => p.status === 'active');
  
  // Brand filter
  const brandId = document.getElementById('brandFilter')?.value;
  if (brandId) {
    filtered = filtered.filter(p => p.brandId === brandId);
  }
  
  // Sub-brand filter (if any active)
  const activeSubBrand = document.getElementById('brandFilter')?.getAttribute('data-sub-brand');
  if (activeSubBrand) {
    filtered = filtered.filter(p => p.subBrandId === activeSubBrand);
  }
  
  // Availability filter
  const availability = document.getElementById('availabilityFilter')?.value;
  if (availability) {
    filtered = filtered.filter(p => (p.availability || 'available') === availability);
  }
  
  // Search filter
  const searchQuery = document.getElementById('searchInput')?.value.toLowerCase().trim();
  if (searchQuery) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchQuery) ||
      (p.description || '').toLowerCase().includes(searchQuery)
    );
  }
  
  // Sort
  const sortBy = document.getElementById('sortFilter')?.value || 'newest';
  switch(sortBy) {
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
    default:
      // Already sorted by createdAt in database
      break;
  }
  
  filteredProducts = filtered;
  renderProducts();
}

async function addToCartFromShop(productId) {
  try {
    const product = await getProductById(productId);
    if (!product) {
      showNotification('Product not found', 'error');
      return;
    }
    
    if (product.stock <= 0) {
      showNotification('Product is out of stock', 'error');
      return;
    }
    
    addToCart(product, 1);
    updateCartBadge();
    showNotification('Added to cart!');
  } catch (error) {
    console.error("Error adding to cart:", error);
    showNotification('Failed to add to cart', 'error');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadShopPage();
});

