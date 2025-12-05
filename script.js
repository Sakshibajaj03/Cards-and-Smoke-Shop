/* script.js
   Unified app script for index, brand, admin pages.
   - Data saved in Firebase Firestore (server-based)
   - Real-time synchronization across all devices
   - Index: brand row buttons + dropdown (dropdown stays 3000ms after mouseleave)
   - Brand page: list products for selected brand
   - Admin: add/edit/delete brands, sub-brands, products
*/

// Global brands data (loaded from Firebase)
let brandsData = null;
let isLoading = false;

// Loading indicator helper
function showLoading(element) {
  if (element) {
    element.innerHTML = '<div style="text-align:center;padding:20px">Loading...</div>';
  }
}

// Load data from Firebase (async)
async function loadBrandsData() {
  if (isLoading) return;
  isLoading = true;
  try {
    brandsData = await loadFromStorage();
    return brandsData;
  } catch (error) {
    console.error("Failed to load brands data:", error);
    // Try to get cached data as fallback
    brandsData = getCachedData() || {};
    return brandsData;
  } finally {
    isLoading = false;
  }
}

// Save data to Firebase (async)
async function saveBrandsData(data) {
  try {
    await saveToStorage(data);
    brandsData = data;
  } catch (error) {
    console.error("Failed to save brands data:", error);
    alert("Failed to save. Please check your connection and try again.");
    throw error;
  }
}

/* =========== INDEX: brand row + dropdown ============ */
async function loadBrandsOnHomePage(){
  const row = document.getElementById("brandRow");
  const dropdown = document.getElementById("brandDropdown");
  const dropdownList = document.getElementById("brandDropdownList");
  if(!row || !dropdown || !dropdownList) return;

  showLoading(row);
  
  // Load data from Firebase
  await loadBrandsData();
  
  if (!brandsData || Object.keys(brandsData).length === 0) {
    row.innerHTML = '<div style="text-align:center;padding:20px">No brands available</div>';
    return;
  }

  row.innerHTML = "";
  dropdownList.innerHTML = "";
  dropdown.style.display = "none";
  dropdown.setAttribute("aria-hidden","true");

  // create button for each brand
  Object.keys(brandsData).forEach(brandKey=>{
    const b = brandsData[brandKey];
    const btn = document.createElement("button");
    btn.className = "brand-button";
    btn.type = "button";
    btn.dataset.brand = brandKey;
    btn.textContent = b.name;
    btn.addEventListener("mouseenter", (e)=> showDropdownFor(brandKey, btn));
    btn.addEventListener("mouseleave", scheduleHide);
    row.appendChild(btn);
  });

  // Set up real-time listener for automatic updates
  setupRealtimeListener((updatedData) => {
    brandsData = updatedData;
    loadBrandsOnHomePage();
  });
}

  let hideTimer = null;
  function showDropdownFor(brandKey, anchor){
    if(hideTimer){ clearTimeout(hideTimer); hideTimer = null; }
    const list = brandsData[brandKey].subBrands || [];
    dropdownList.innerHTML = "";
    if(list.length === 0){
      const li = document.createElement("li"); li.textContent = "No sub-brands"; li.className="";
      dropdownList.appendChild(li);
    } else {
      list.forEach(sb=>{
        const li = document.createElement("li");
        li.textContent = sb.name || sb.key || "Unnamed";
        li.addEventListener("click", ()=> {
          // navigate to brand page (parent brand)
          location.href = `brand.html?brand=${brandKey}`;
        });
        dropdownList.appendChild(li);
      });
    }

    // position dropdown under anchor (simple)
    const rect = anchor.getBoundingClientRect();
    const containerRect = document.body.getBoundingClientRect();
    const left = Math.max(12, rect.left + (rect.width/2) - 120);
    dropdown.style.left = left + "px";
    dropdown.style.top = (rect.bottom + 8 + window.scrollY) + "px";

    dropdown.style.display = "block";
    dropdown.setAttribute("aria-hidden","false");
  }

  function scheduleHide(){
    if(hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(()=> {
      dropdown.style.display = "none";
      dropdown.setAttribute("aria-hidden","true");
      hideTimer = null;
    }, 3000);
  }

  dropdown.addEventListener("mouseenter", ()=>{ if(hideTimer){ clearTimeout(hideTimer); hideTimer = null; }});
  dropdown.addEventListener("mouseleave", scheduleHide);
}

/* =========== BRAND PAGE ============ */
async function loadBrandProducts(){
  const params = new URLSearchParams(window.location.search);
  const brandKey = params.get("brand");
  if(!brandKey) { window.location.href = "index.html"; return; }

  const grid = document.getElementById("productsGrid");
  if(grid) showLoading(grid);

  // Load data from Firebase
  await loadBrandsData();
  
  if(!brandsData || !brandsData[brandKey]) { 
    window.location.href = "index.html"; 
    return; 
  }

  const b = brandsData[brandKey];
  const title = document.getElementById("brandTitle");
  const desc = document.getElementById("brandDescription");
  if(title) title.textContent = b.name;
  if(desc) desc.textContent = b.description || "";
  if(!grid) return;
  grid.innerHTML = "";

  if (!b.products || b.products.length === 0) {
    grid.innerHTML = '<div style="text-align:center;padding:20px">No products available</div>';
    return;
  }

  b.products.forEach(prod=>{
    const card = document.createElement("div"); card.className = "card";
    const h = document.createElement("h3"); h.textContent = prod.name;
    const p = document.createElement("p"); p.textContent = prod.description || "";
    const foot = document.createElement("div"); foot.style.display="flex";foot.style.justifyContent="space-between";foot.style.alignItems="center";
    const price = document.createElement("div"); price.textContent = prod.price ? `$${prod.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "FREE"; price.style.fontWeight="700";
    const btn = document.createElement("button"); btn.className="btn"; btn.textContent="Add to cart";
    btn.addEventListener("click", ()=> { btn.textContent = "Added"; setTimeout(()=> btn.textContent="Add to cart",1200) });
    foot.appendChild(price); foot.appendChild(btn);
    card.appendChild(h); card.appendChild(p); card.appendChild(foot);
    grid.appendChild(card);
  });

  // Set up real-time listener for automatic updates
  setupRealtimeListener((updatedData) => {
    brandsData = updatedData;
    loadBrandProducts();
  });
}

/* =========== ADMIN: CRUD ============ */
function populateBrandSelects(){
  if (!brandsData) return;
  // For admin forms: productBrand, brandFilter, parentBrand
  const selectIds = ["productBrand","brandFilter","parentBrand"];
  selectIds.forEach(id => {
    const el = document.getElementById(id);
    if(!el) return;
    const current = el.tagName === "SELECT" ? el.querySelector("option") : null;
    el.innerHTML = "";
    if(id === "brandFilter"){
      const opt = document.createElement("option"); opt.value = "all"; opt.textContent = "All Brands"; el.appendChild(opt);
    } else {
      const placeholder = document.createElement("option"); placeholder.value=""; placeholder.textContent = "Select Brand"; el.appendChild(placeholder);
    }
    Object.keys(brandsData).forEach(key=>{
      const option = document.createElement("option"); option.value = key; option.textContent = brandsData[key].name; el.appendChild(option);
    });
  });
}

function loadAdminProducts(){
  if (!brandsData) return;
  const tbody = document.getElementById("productsTableBody");
  if(!tbody) return;
  tbody.innerHTML = "";

  Object.keys(brandsData).forEach(brandKey=>{
    const b = brandsData[brandKey];
    if (!b.products || !Array.isArray(b.products)) return;
    b.products.forEach(prod=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${prod.name}<div class="text-muted" style="font-size:12px">${(prod.description||"")}</div></td>
                      <td>${b.name}</td>
                      <td>${prod.price ? "$"+prod.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "FREE"}</td>
                      <td><span class="text-muted">Active</span></td>
                      <td>
                        <button class="icon-btn" onclick="editProduct('${brandKey}',${prod.id})">Edit</button>
                        <button class="icon-btn" onclick="deleteProduct('${brandKey}',${prod.id})">Delete</button>
                      </td>`;
      tbody.appendChild(tr);
    });
  });
}

function loadAdminBrands(){
  if (!brandsData) return;
  const list = document.getElementById("adminBrandsList");
  if(!list) return;
  list.innerHTML = "";
  Object.keys(brandsData).forEach(key=>{
    const b = brandsData[key];
    const wrap = document.createElement("div"); wrap.style.display="flex";wrap.style.justifyContent="space-between";wrap.style.alignItems="center";
    const info = document.createElement("div"); info.innerHTML = `<div style="font-weight:700">${b.name}</div><div class="text-muted" style="font-size:13px">${b.tagline||""}</div>`;
    const actions = document.createElement("div");
    const edit = document.createElement("button"); edit.className="icon-btn"; edit.textContent="Edit"; edit.onclick = ()=> openEditBrandModal(key);
    const del = document.createElement("button"); del.className="icon-btn"; del.textContent="Delete"; del.onclick = ()=> deleteBrand(key);
    actions.appendChild(edit); actions.appendChild(del);
    wrap.appendChild(info); wrap.appendChild(actions);
    list.appendChild(wrap);
  });
  populateBrandSelects();
  loadSubBrands();
}

function loadSubBrands(){
  if (!brandsData) return;
  const box = document.getElementById("subBrandsList");
  if(!box) return;
  box.innerHTML="";
  Object.keys(brandsData).forEach(brandKey=>{
    const b = brandsData[brandKey];
    if (!b.subBrands || !Array.isArray(b.subBrands)) return;
    (b.subBrands||[]).forEach((sb, idx)=>{
      const wrap = document.createElement("div"); wrap.style.display="flex";wrap.style.justifyContent="space-between";wrap.style.alignItems="center";wrap.style.padding="8px 0";
      const left = document.createElement("div"); left.textContent = `${sb.name} — ${b.name}`;
      const right = document.createElement("div");
      const edit = document.createElement("button"); edit.className="icon-btn"; edit.textContent="Edit"; edit.onclick = ()=> openEditSubBrandModal(brandKey, idx);
      const del = document.createElement("button"); del.className="icon-btn"; del.textContent="Delete"; del.onclick = ()=> deleteSubBrand(brandKey, idx);
      right.appendChild(edit); right.appendChild(del);
      wrap.appendChild(left); wrap.appendChild(right);
      box.appendChild(wrap);
    });
  });
}

/* ----- Product CRUD ----- */
function openAddProductModal(){
  openModal(`
    <h3>Add Product</h3>
    <div class="form-group"><label>Name</label><input id="m_productName" class="input"/></div>
    <div class="form-group"><label>Brand</label><select id="m_productBrand" class="input"></select></div>
    <div class="form-group"><label>Description</label><textarea id="m_productDescription" class="input"></textarea></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn" onclick="submitAddProduct()">Add</button></div>
  `);
  // populate brand select
  const sel = document.getElementById("m_productBrand");
  sel.innerHTML = '<option value="">Select Brand</option>';
  Object.keys(brandsData).forEach(k=> sel.appendChild(Object.assign(document.createElement("option"),{value:k,textContent:brandsData[k].name})));
}
async function submitAddProduct(){
  const name = document.getElementById("m_productName").value.trim();
  const brand = document.getElementById("m_productBrand").value;
  if(!name || !brand) { alert("Name and brand required"); return; }
  if (!brandsData || !brandsData[brand]) {
    await loadBrandsData();
  }
  const desc = document.getElementById("m_productDescription").value.trim();
  const newProd = { id: Date.now(), name, description: desc, price: 0 };
  if (!brandsData[brand].products) brandsData[brand].products = [];
  brandsData[brand].products.push(newProd);
  await saveBrandsData(brandsData);
  closeModal(); loadAdminProducts(); loadAdminBrands();
}

/* edit */
function editProduct(brandKey, productId){
  const prod = (brandsData[brandKey].products||[]).find(p=>p.id===productId);
  if(!prod) return alert("Product not found");
  openModal(`
    <h3>Edit Product</h3>
    <div class="form-group"><label>Name</label><input id="m_productName" class="input" value="${escapeHtml(prod.name)}"/></div>
    <div class="form-group"><label>Description</label><textarea id="m_productDescription" class="input">${escapeHtml(prod.description)}</textarea></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn" onclick="submitEditProduct('${brandKey}',${productId})">Save</button></div>
  `);
}
async function submitEditProduct(brandKey, productId){
  if (!brandsData) await loadBrandsData();
  const name = document.getElementById("m_productName").value.trim();
  const desc = document.getElementById("m_productDescription").value.trim();
  const prod = brandsData[brandKey].products.find(p=>p.id===productId);
  if(!prod) return;
  prod.name = name; prod.description = desc;
  await saveBrandsData(brandsData);
  closeModal(); loadAdminProducts(); loadAdminBrands();
}
async function deleteProduct(brandKey, productId){
  if(!confirm("Delete product?")) return;
  if (!brandsData) await loadBrandsData();
  brandsData[brandKey].products = brandsData[brandKey].products.filter(p=>p.id!==productId);
  await saveBrandsData(brandsData);
  loadAdminProducts(); loadAdminBrands();
}

/* ----- Brand CRUD ----- */
function openAddBrandModal(){
  openModal(`
    <h3>Add Brand</h3>
    <div class="form-group"><label>Brand Key (no spaces, lowercase)</label><input id="m_brandKey" class="input"/></div>
    <div class="form-group"><label>Name</label><input id="m_brandName" class="input"/></div>
    <div class="form-group"><label>Tagline</label><input id="m_brandTagline" class="input"/></div>
    <div class="form-group"><label>Description</label><textarea id="m_brandDesc" class="input"></textarea></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn" onclick="submitAddBrand()">Add</button></div>
  `);
}
async function submitAddBrand(){
  if (!brandsData) await loadBrandsData();
  const key = document.getElementById("m_brandKey").value.trim();
  if(!key) return alert("Brand key required");
  if(brandsData[key]) return alert("Key exists");
  const name = document.getElementById("m_brandName").value.trim();
  const tagline = document.getElementById("m_brandTagline").value.trim();
  const desc = document.getElementById("m_brandDesc").value.trim();
  brandsData[key] = { name: name||key.toUpperCase(), tagline, description: desc, products: [], subBrands: [] };
  await saveBrandsData(brandsData);
  closeModal(); loadAdminBrands(); loadAdminProducts();
}
function openEditBrandModal(key){
  const b = brandsData[key];
  if(!b) return;
  openModal(`
    <h3>Edit Brand</h3>
    <div class="form-group"><label>Brand Key</label><input id="m_brandKey" class="input" value="${escapeHtml(key)}" disabled/></div>
    <div class="form-group"><label>Name</label><input id="m_brandName" class="input" value="${escapeHtml(b.name)}"/></div>
    <div class="form-group"><label>Tagline</label><input id="m_brandTagline" class="input" value="${escapeHtml(b.tagline||'')}"/></div>
    <div class="form-group"><label>Description</label><textarea id="m_brandDesc" class="input">${escapeHtml(b.description||'')}</textarea></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn" onclick="submitEditBrand('${key}')">Save</button></div>
  `);
}
async function submitEditBrand(key){
  if (!brandsData) await loadBrandsData();
  const b = brandsData[key]; if(!b) return;
  b.name = document.getElementById("m_brandName").value.trim();
  b.tagline = document.getElementById("m_brandTagline").value.trim();
  b.description = document.getElementById("m_brandDesc").value.trim();
  await saveBrandsData(brandsData);
  closeModal(); loadAdminBrands(); loadAdminProducts();
}
async function deleteBrand(key){
  if(!confirm("Delete brand and all its products/sub-brands?")) return;
  if (!brandsData) await loadBrandsData();
  delete brandsData[key];
  await saveBrandsData(brandsData);
  loadAdminBrands(); loadAdminProducts();
}

/* ----- Sub-brand CRUD ----- */
function openAddSubBrandModal(){
  openModal(`
    <h3>Add Sub-Brand</h3>
    <div class="form-group"><label>Parent Brand</label><select id="m_parentBrand" class="input"></select></div>
    <div class="form-group"><label>Key (lowercase)</label><input id="m_subKey" class="input"/></div>
    <div class="form-group"><label>Name</label><input id="m_subName" class="input"/></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn" onclick="submitAddSubBrand()">Add</button></div>
  `);
  const sel = document.getElementById("m_parentBrand");
  sel.innerHTML = '<option value="">Select Brand</option>';
  Object.keys(brandsData).forEach(k=> sel.appendChild(Object.assign(document.createElement("option"),{value:k,textContent:brandsData[k].name})));
}
async function submitAddSubBrand(){
  if (!brandsData) await loadBrandsData();
  const parent = document.getElementById("m_parentBrand").value;
  const key = document.getElementById("m_subKey").value.trim();
  const name = document.getElementById("m_subName").value.trim();
  if(!parent||!key||!name) return alert("All fields required");
  if (!brandsData[parent].subBrands) brandsData[parent].subBrands = [];
  const arr = brandsData[parent].subBrands || [];
  if(arr.some(s=>s.key===key)) return alert("Sub-brand key exists");
  arr.push({ key, name });
  brandsData[parent].subBrands = arr;
  await saveBrandsData(brandsData);
  closeModal(); loadSubBrands(); loadAdminBrands();
}
function openEditSubBrandModal(brandKey, index){
  const sb = brandsData[brandKey].subBrands[index];
  if(!sb) return;
  openModal(`
    <h3>Edit Sub-Brand</h3>
    <div class="form-group"><label>Parent Brand</label><input class="input" value="${escapeHtml(brandsData[brandKey].name)}" disabled/></div>
    <div class="form-group"><label>Key</label><input id="m_subKey" class="input" value="${escapeHtml(sb.key)}" disabled/></div>
    <div class="form-group"><label>Name</label><input id="m_subName" class="input" value="${escapeHtml(sb.name)}"/></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn" onclick="submitEditSubBrand('${brandKey}',${index})">Save</button></div>
  `);
}
async function submitEditSubBrand(brandKey, index){
  if (!brandsData) await loadBrandsData();
  const name = document.getElementById("m_subName").value.trim();
  if(!name) return alert("Name required");
  brandsData[brandKey].subBrands[index].name = name;
  await saveBrandsData(brandsData);
  closeModal(); loadSubBrands(); loadAdminBrands();
}
async function deleteSubBrand(brandKey, index){
  if(!confirm("Delete sub-brand?")) return;
  if (!brandsData) await loadBrandsData();
  brandsData[brandKey].subBrands.splice(index,1);
  await saveBrandsData(brandsData);
  loadSubBrands(); loadAdminBrands();
}

/* ----- Utilities ----- */
async function resetToDefaultData(){
  if(!confirm("Reset all data to defaults?")) return;
  // Get default data from firebase-db.js
  const defaultData = await loadFromStorage();
  // Reset to actual default structure
  const resetData = {
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
  brandsData = resetData;
  await saveBrandsData(resetData);
  loadAdminBrands(); loadAdminProducts(); loadSubBrands();
}
function escapeHtml(s){ return (s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;") }

/* Modal helpers */
function openModal(html){
  const backdrop = document.getElementById("modalBackdrop");
  const modal = document.getElementById("modal");
  if(!backdrop || !modal) return;
  modal.innerHTML = html;
  backdrop.classList.add("active");
  backdrop.style.display = "flex";
  // allow close on backdrop click
  backdrop.onclick = function(e){ if(e.target===backdrop) closeModal(); }
}
function closeModal(){
  const backdrop = document.getElementById("modalBackdrop");
  const modal = document.getElementById("modal");
  if(!backdrop||!modal) return;
  backdrop.classList.remove("active"); backdrop.style.display="none"; modal.innerHTML="";
}

/* ----- Init on pages ----- */
(async function init(){
  // Load data first
  await loadBrandsData();
  
  // ensure brandFilter select has options if exists
  const bf = document.getElementById("brandFilter");
  if(bf) populateBrandSelects();

  // Set up real-time listener for admin page
  if (document.getElementById("adminBrandsList")) {
    setupRealtimeListener((updatedData) => {
      brandsData = updatedData;
      loadAdminBrands();
      loadAdminProducts();
      loadSubBrands();
    });
  }

  // Cleanup listener on page unload
  window.addEventListener("beforeunload", () => {
    removeRealtimeListener();
  });
})();
