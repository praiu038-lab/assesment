// NourishGuard AI — Full-Stack Frontend Client with REST API Integration & Offline Fallback

const API_BASE = ''; // Same origin or relative path

// In-Memory & Local Fallback State
let state = {
  pantry: [],
  donations: [],
  moneySaved: 148.50,
  foodDivertedKg: 32.40,
  activeFilter: 'all',
  searchQuery: '',
  isOnlineBackend: false
};

// Check Backend API Connection
async function checkBackendConnection() {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      state.isOnlineBackend = true;
      const statusEl = document.getElementById('backend-status-badge');
      if (statusEl) {
        statusEl.innerHTML = '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; margin-right:6px; box-shadow:0 0 6px #10b981;"></span> DB Connected';
      }
      return true;
    }
  } catch (err) {
    state.isOnlineBackend = false;
    const statusEl = document.getElementById('backend-status-badge');
    if (statusEl) {
      statusEl.innerHTML = '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#f59e0b; margin-right:6px;"></span> Local Mode';
    }
  }
  return false;
}

// Global Tab Switching with Smooth Transition
window.switchTab = function(tabId) {
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  document.querySelectorAll('.tab-content').forEach(view => {
    view.classList.toggle('active', view.id === tabId);
  });

  // Close mobile navigation drawer if open
  const navTabs = document.querySelector('.nav-tabs');
  if (navTabs && navTabs.classList.contains('mobile-open')) {
    navTabs.classList.remove('mobile-open');
  }

  if (tabId === 'tab-pantry') {
    fetchPantry();
  } else if (tabId === 'tab-recipes') {
    fetchRecipes();
  } else if (tabId === 'tab-rescue') {
    fetchDonations();
  } else if (tabId === 'tab-analytics') {
    fetchAnalytics();
  } else if (tabId === 'tab-srs') {
    if (window.mermaid) {
      try { window.mermaid.run(); } catch(e) {}
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Toggle Mobile Nav Menu
window.toggleMobileMenu = function() {
  const navTabs = document.querySelector('.nav-tabs');
  if (navTabs) {
    navTabs.classList.toggle('mobile-open');
  }
};

// ==========================================
// 1. PANTRY API CALLS
// ==========================================
async function fetchPantry() {
  try {
    const res = await fetch('/api/pantry');
    if (res.ok) {
      const json = await res.json();
      state.pantry = json.data;
      renderPantry();
      return;
    }
  } catch (err) {
    console.warn('Backend offline, using localStorage fallback');
  }

  // Fallback to localStorage
  state.pantry = JSON.parse(localStorage.getItem('nourish_pantry')) || getInitialLocalPantry();
  renderPantry();
}

function getInitialLocalPantry() {
  return [
    { id: 'item-1', name: 'Baby Spinach Leaves', category: 'Produce', quantity: '250g', location: 'Fridge', expiryDate: '2026-10-11', daysLeft: 1, status: 'critical' },
    { id: 'item-2', name: 'Greek Yogurt (Organic)', category: 'Dairy', quantity: '500g', location: 'Fridge', expiryDate: '2026-10-12', daysLeft: 2, status: 'critical' },
    { id: 'item-3', name: 'Bell Peppers (Trio Pack)', category: 'Produce', quantity: '3 pcs', location: 'Fridge', expiryDate: '2026-10-14', daysLeft: 4, status: 'warning' },
    { id: 'item-4', name: 'Artisan Sourdough Loaf', category: 'Bakery', quantity: '1 Loaf', location: 'Pantry', expiryDate: '2026-10-13', daysLeft: 3, status: 'warning' },
    { id: 'item-5', name: 'Brown Basmati Rice', category: 'Pantry', quantity: '1 kg', location: 'Pantry', expiryDate: '2027-03-15', daysLeft: 155, status: 'fresh' },
    { id: 'item-6', name: 'Extra Virgin Olive Oil', category: 'Pantry', quantity: '750ml', location: 'Pantry', expiryDate: '2027-08-01', daysLeft: 294, status: 'fresh' }
  ];
}

function renderPantry() {
  const container = document.getElementById('pantry-cards-container');
  if (!container) return;

  const filtered = state.pantry.filter(item => {
    const matchesFilter = state.activeFilter === 'all' || 
                          item.status === state.activeFilter || 
                          item.location.toLowerCase() === state.activeFilter.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(state.searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted); background: rgba(0,0,0,0.2); border-radius: var(--radius-md);">
        <i class="fa-solid fa-basket-shopping" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--emerald-500);"></i>
        <h3 style="color: #fff; margin-bottom: 6px;">No Items Found</h3>
        <p>Try clearing filters or add fresh items using the form or AI Scanner!</p>
      </div>
    `;
    updateStatsUI();
    return;
  }

  container.innerHTML = filtered.map(item => {
    let statusBadge = '';
    let statusClass = item.status;
    let countdownText = '';

    if (item.daysLeft <= 0) {
      statusBadge = '<span class="item-status-pill status-critical">Expired / Urgent</span>';
      countdownText = '<span style="color: var(--rose-400); font-weight: 700;">Expires today!</span>';
    } else if (item.daysLeft <= 2) {
      statusBadge = '<span class="item-status-pill status-critical">Expires in ' + item.daysLeft + 'd</span>';
      countdownText = '<span style="color: var(--rose-400); font-weight: 700;">' + item.daysLeft + ' day(s) remaining</span>';
    } else if (item.daysLeft <= 5) {
      statusBadge = '<span class="item-status-pill status-warning">Use Soon</span>';
      countdownText = '<span style="color: var(--amber-400); font-weight: 700;">' + item.daysLeft + ' days remaining</span>';
    } else {
      statusBadge = '<span class="item-status-pill status-fresh">Fresh</span>';
      countdownText = '<span style="color: var(--emerald-400); font-weight: 700;">' + item.daysLeft + ' days remaining</span>';
    }

    return `
      <div class="item-card ${statusClass}">
        <div>
          <div class="item-header">
            <div>
              <div class="item-name">${item.name}</div>
              <div class="item-category">${item.category} &bull; ${item.location}</div>
            </div>
            ${statusBadge}
          </div>
          <div class="item-meta">
            <div><strong>Qty:</strong> ${item.quantity}</div>
            <div class="expiry-countdown"><strong>Status:</strong> ${countdownText}</div>
            <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 2px;">Expiry: ${item.expiryDate}</div>
          </div>
        </div>

        <div class="item-actions">
          <button class="btn btn-primary btn-sm" onclick="triggerCookWithItem('${item.name}')" title="Generate AI Recipe using this">
            <i class="fa-solid fa-utensils"></i> Cook
          </button>
          <button class="btn btn-secondary btn-sm" onclick="markConsumed('${item.id}')" title="Mark as consumed">
            <i class="fa-solid fa-check"></i> Eat
          </button>
          <button class="btn btn-secondary btn-sm" onclick="donateItem('${item.id}')" title="Donate to nearby community">
            <i class="fa-solid fa-hand-holding-heart"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteItem('${item.id}')" title="Remove item">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  updateStatsUI();
}

function updateStatsUI() {
  const criticalCount = state.pantry.filter(i => i.status === 'critical').length;
  const warningCount = state.pantry.filter(i => i.status === 'warning').length;
  const freshCount = state.pantry.filter(i => i.status === 'fresh').length;

  const critEl = document.getElementById('stat-critical-count');
  const warnEl = document.getElementById('stat-warning-count');
  const freshEl = document.getElementById('stat-fresh-count');
  const savingsEl = document.getElementById('stat-savings-val');

  if (critEl) critEl.innerText = criticalCount;
  if (warnEl) warnEl.innerText = warningCount;
  if (freshEl) freshEl.innerText = freshCount;
  if (savingsEl) savingsEl.innerText = `$${state.moneySaved.toFixed(2)}`;
}

// Add Item via Form
window.handleAddItem = async function(e) {
  if (e && e.preventDefault) e.preventDefault();

  const name = document.getElementById('item-name-input').value.trim();
  const category = document.getElementById('item-category-input').value;
  const quantity = document.getElementById('item-qty-input').value.trim() || '1 unit';
  const location = document.getElementById('item-loc-input').value;
  const expiryDate = document.getElementById('item-exp-input').value;

  if (!name || !expiryDate) return false;

  const payload = { name, category, quantity, location, expiryDate };

  try {
    const res = await fetch('/api/pantry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      showToast(`Added ${name} to database!`);
      document.getElementById('add-item-form').reset();
      fetchPantry();
      return false;
    }
  } catch (err) {
    console.warn('Saving to local state');
  }

  // Fallback Local
  state.pantry.unshift({ id: 'item-' + Date.now(), ...payload, daysLeft: 5, status: 'warning' });
  localStorage.setItem('nourish_pantry', JSON.stringify(state.pantry));
  renderPantry();
  document.getElementById('add-item-form').reset();
  showToast(`Added ${name} locally!`);
  return false;
};

// Eat Item / Mark Consumed
window.markConsumed = async function(id) {
  const item = state.pantry.find(i => i.id === id);
  if (!item) return;

  try {
    const res = await fetch(`/api/pantry/${id}/consume`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      state.moneySaved = data.currentTotalSavings;
      showToast(data.message);
      fetchPantry();
      return;
    }
  } catch (err) {}

  state.pantry = state.pantry.filter(i => i.id !== id);
  state.moneySaved += 3.80;
  localStorage.setItem('nourish_pantry', JSON.stringify(state.pantry));
  renderPantry();
  showToast(`Yum! Consumed ${item.name}. Saved ~$3.80!`);
};

// Delete Item
window.deleteItem = async function(id) {
  try {
    const res = await fetch(`/api/pantry/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Item deleted from database');
      fetchPantry();
      return;
    }
  } catch (err) {}

  state.pantry = state.pantry.filter(i => i.id !== id);
  localStorage.setItem('nourish_pantry', JSON.stringify(state.pantry));
  renderPantry();
  showToast('Item removed');
};

// Donate Item
window.donateItem = async function(id) {
  const item = state.pantry.find(i => i.id === id);
  if (!item) return;

  const payload = {
    title: `${item.quantity} ${item.name}`,
    donor: 'You (Household Donor)',
    distance: '0.1 km away',
    timeRemaining: `${item.daysLeft || 2} days remaining`
  };

  try {
    await fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    await fetch(`/api/pantry/${id}`, { method: 'DELETE' });
    showToast(`Donated ${item.name} to community rescue!`);
    window.switchTab('tab-rescue');
    return;
  } catch (err) {}

  state.pantry = state.pantry.filter(i => i.id !== id);
  renderPantry();
  showToast(`Listed ${item.name} on Community Rescue Map!`);
  window.switchTab('tab-rescue');
};

window.triggerCookWithItem = function(name) {
  window.switchTab('tab-recipes');
  const filterInput = document.getElementById('custom-ingredient-filter');
  if (filterInput) filterInput.value = name;
  fetchRecipes();
};

window.setFilter = function(filterVal) {
  state.activeFilter = filterVal;
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filterVal);
  });
  renderPantry();
};

window.handleSearch = function(e) {
  state.searchQuery = e.target.value;
  renderPantry();
};

// ==========================================
// 2. AI SCANNER API
// ==========================================
let scannedItemsBuffer = [];

window.startScannerSimulation = async function(scanType) {
  const progressBox = document.getElementById('scan-progress-box');
  const resultBox = document.getElementById('scan-results-box');
  const bar = document.getElementById('scan-progress-bar');
  const statusMsg = document.getElementById('scan-status-msg');

  if (progressBox) progressBox.style.display = 'block';
  if (resultBox) resultBox.style.display = 'none';
  if (bar) bar.style.width = '0%';

  const steps = [
    { p: 25, text: 'Preprocessing image and contrast enhancement...' },
    { p: 55, text: 'Calling TrOCR Transformer vision recognition API...' },
    { p: 85, text: 'Running Deep Learning Freshness Classifier & UPC Database lookup...' },
    { p: 100, text: 'Extraction Complete!' }
  ];

  let currentStep = 0;
  const interval = setInterval(async () => {
    if (currentStep < steps.length) {
      if (bar) bar.style.width = steps[currentStep].p + '%';
      if (statusMsg) statusMsg.innerText = steps[currentStep].text;
      currentStep++;
    } else {
      clearInterval(interval);

      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scanType })
        });
        if (res.ok) {
          const json = await res.json();
          scannedItemsBuffer = json.items;
          renderScanResults(json.items);
          return;
        }
      } catch (err) {}

      // Fallback
      scannedItemsBuffer = [
        { name: 'Organic Whole Milk', category: 'Dairy', qty: '1 Gallon', expDays: 7, loc: 'Fridge' },
        { name: 'Fresh Strawberries', category: 'Produce', qty: '1 Box (400g)', expDays: 3, loc: 'Fridge' },
        { name: 'Whole Wheat Sandwich Bread', category: 'Bakery', qty: '1 Loaf', expDays: 5, loc: 'Pantry' }
      ];
      renderScanResults(scannedItemsBuffer);
    }
  }, 350);
};

function renderScanResults(items) {
  const resultBox = document.getElementById('scan-results-box');
  const listEl = document.getElementById('scan-extracted-list');

  if (listEl) {
    listEl.innerHTML = items.map(item => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); margin-bottom: 8px;">
        <div>
          <strong style="font-size: 0.95rem;">${item.name}</strong> <span style="color: var(--text-muted); font-size: 0.85rem;">(${item.qty})</span>
          <div style="font-size: 0.78rem; color: var(--emerald-400); margin-top: 2px;">
            <i class="fa-solid fa-tag"></i> ${item.category} &bull; <i class="fa-solid fa-clock"></i> Est. Expiry: ${item.expDays} days &bull; <i class="fa-solid fa-box"></i> ${item.loc}
          </div>
        </div>
        <span style="font-size: 0.8rem; color: var(--emerald-400); font-weight: 700; background: rgba(16, 185, 129, 0.15); padding: 4px 10px; border-radius: 20px; border: 1px solid var(--emerald-500);">
          <i class="fa-solid fa-check-circle"></i> 99.4% Match
        </span>
      </div>
    `).join('');
  }

  if (resultBox) resultBox.style.display = 'block';
}

window.commitScannedItems = async function() {
  if (!scannedItemsBuffer.length) return;

  for (const item of scannedItemsBuffer) {
    const today = new Date('2026-10-10');
    const expDate = new Date(today);
    expDate.setDate(today.getDate() + item.expDays);
    const expStr = expDate.toISOString().split('T')[0];

    try {
      await fetch('/api/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          category: item.category,
          quantity: item.qty,
          location: item.loc,
          expiryDate: expStr
        })
      });
    } catch (e) {}
  }

  showToast(`Successfully imported ${scannedItemsBuffer.length} items to database!`);
  scannedItemsBuffer = [];
  document.getElementById('scan-progress-box').style.display = 'none';
  document.getElementById('scan-results-box').style.display = 'none';
  window.switchTab('tab-pantry');
};

// ==========================================
// 3. RECIPES API
// ==========================================
async function fetchRecipes() {
  const container = document.getElementById('recipe-results-container');
  if (!container) return;

  let recipes = [];
  try {
    const res = await fetch('/api/recipes');
    if (res.ok) {
      const json = await res.json();
      recipes = json.recipes;
    }
  } catch (err) {}

  if (!recipes.length) {
    recipes = [
      {
        title: 'Creamy Garlic-Yogurt Wilted Spinach Skillet',
        atRiskUsed: ['Baby Spinach', 'Greek Yogurt'],
        time: '12 Mins',
        servings: '2 Servings',
        diet: 'Vegetarian',
        ingredients: ['200g Baby Spinach', '3 tbsp Greek Yogurt', '2 cloves Minced Garlic', '1 tbsp Olive Oil', 'Salt & Pepper'],
        instructions: ['Heat olive oil in a skillet, sauté garlic for 1 min.', 'Add fresh baby spinach and toss until wilted.', 'Remove from heat and fold in Greek yogurt.'],
        wastePrevented: '$4.20 / 350g saved'
      },
      {
        title: 'Savory Sourdough & Roasted Bell Pepper Bruschetta',
        atRiskUsed: ['Artisan Sourdough Loaf', 'Bell Peppers'],
        time: '15 Mins',
        servings: '2 Servings',
        diet: 'Vegan Option',
        ingredients: ['2 slices Sourdough Bread', '1 Bell Pepper (Diced)', '1 tbsp Olive Oil', 'Oregano & Herbs'],
        instructions: ['Toast sourdough bread until crispy.', 'Char bell peppers in olive oil with oregano.', 'Top toasted bread with roasted peppers.'],
        wastePrevented: '$3.80 / 280g saved'
      }
    ];
  }

  const customFilter = (document.getElementById('custom-ingredient-filter')?.value || '').toLowerCase().trim();
  if (customFilter) {
    recipes = recipes.filter(r => r.title.toLowerCase().includes(customFilter) || r.ingredients.some(i => i.toLowerCase().includes(customFilter)));
  }

  container.innerHTML = recipes.map(recipe => `
    <div class="recipe-card">
      <div class="recipe-header">
        <div class="recipe-title">${recipe.title}</div>
        <div class="recipe-meta-row">
          <span><i class="fa-regular fa-clock"></i> ${recipe.time}</span>
          <span><i class="fa-solid fa-utensils"></i> ${recipe.servings}</span>
          <span><i class="fa-solid fa-leaf"></i> ${recipe.diet}</span>
        </div>
      </div>
      <div class="recipe-body">
        <div style="margin-bottom: 0.85rem; font-size: 0.82rem; color: var(--rose-400); font-weight: 700; background: rgba(244, 63, 94, 0.1); padding: 6px 10px; border-radius: var(--radius-xs); border: 1px solid rgba(244, 63, 94, 0.3);">
          <i class="fa-solid fa-triangle-exclamation"></i> Rescues: ${recipe.atRiskUsed ? recipe.atRiskUsed.join(', ') : 'Near Expiry Items'}
        </div>
        
        <h4 style="font-size: 0.82rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; letter-spacing: 0.05em;">Ingredients:</h4>
        <ul class="ingredients-list">
          ${recipe.ingredients.map(ing => `<li><i class="fa-solid fa-check" style="color: var(--emerald-500); font-size: 0.75rem;"></i> ${ing}</li>`).join('')}
        </ul>

        <h4 style="font-size: 0.82rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; margin-top: 1rem; letter-spacing: 0.05em;">AI Cooking Instructions:</h4>
        <ol class="instructions-list">
          ${recipe.instructions.map(step => `<li>${step}</li>`).join('')}
        </ol>

        <div style="margin-top: 1.25rem; padding-top: 0.85rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.8rem; color: var(--emerald-400); font-weight: 700;"><i class="fa-solid fa-seedling"></i> ${recipe.wastePrevented}</span>
          <button class="btn btn-primary btn-sm" onclick="showToast('Delicious! Marked recipe cooked. Inventory auto-updated.')">
            <i class="fa-solid fa-check"></i> Cooked This
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ==========================================
// 4. DONATIONS & RESCUE API
// ==========================================
async function fetchDonations() {
  try {
    const res = await fetch('/api/donations');
    if (res.ok) {
      const json = await res.json();
      state.donations = json.data;
    }
  } catch (err) {}

  renderDonationList();
  initRescueMap();
}

function renderDonationList() {
  const container = document.getElementById('community-donation-feed');
  if (!container) return;

  container.innerHTML = state.donations.map(don => `
    <div class="donation-item">
      <div>
        <div style="font-weight: 700; font-size: 0.95rem;">${don.title}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
          ${don.donor} &bull; <i class="fa-solid fa-location-dot" style="color: var(--cyan-400);"></i> ${don.distance}
        </div>
        <div style="font-size: 0.78rem; color: var(--emerald-400); font-weight: 600; margin-top: 4px;">
          <i class="fa-regular fa-clock"></i> ${don.timeRemaining}
        </div>
      </div>
      <div>
        ${don.claimed ? 
          '<span class="badge" style="background: rgba(100,116,139,0.2); border-color: #64748b; color: #94a3b8;">Reserved</span>' : 
          `<button class="btn btn-primary btn-sm" onclick="claimDonation('${don.id}')"><i class="fa-solid fa-hand-holding-heart"></i> Claim</button>`
        }
      </div>
    </div>
  `).join('');
}

let rescueMapInstance = null;
function initRescueMap() {
  const mapEl = document.getElementById('leaflet-map-view');
  if (!mapEl) return;

  if (typeof L !== 'undefined') {
    if (!rescueMapInstance) {
      rescueMapInstance = L.map('leaflet-map-view').setView([28.6139, 77.2090], 14);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(rescueMapInstance);

      state.donations.forEach(don => {
        const marker = L.marker([don.lat, don.lng]).addTo(rescueMapInstance);
        marker.bindPopup(`
          <div style="color: #000; font-family: sans-serif; padding: 4px;">
            <strong>${don.title}</strong><br>
            <small>${don.donor} &bull; ${don.distance}</small><br>
            <span style="color: #059669; font-weight: bold;">${don.timeRemaining}</span><br><br>
            <button onclick="claimDonation('${don.id}')" style="background: #10b981; color: #000; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%;">Reserve Pickup</button>
          </div>
        `);
      });
    } else {
      setTimeout(() => rescueMapInstance.invalidateSize(), 200);
    }
  }
}

window.claimDonation = async function(id) {
  try {
    const res = await fetch(`/api/donations/${id}/claim`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      document.getElementById('claim-token-id').innerText = data.pickupToken;
      document.getElementById('claim-modal').classList.add('active');
      fetchDonations();
      return;
    }
  } catch (err) {}

  document.getElementById('claim-token-id').innerText = 'NG-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  document.getElementById('claim-modal').classList.add('active');
};

window.closeClaimModal = function() {
  document.getElementById('claim-modal').classList.remove('active');
};

// ==========================================
// 5. ANALYTICS API
// ==========================================
let savingsChart = null;
let categoryChart = null;

async function fetchAnalytics() {
  let metrics = { totalMoneySaved: 148.50, monthlyTrend: [65, 84, 110, 125, 138, 148.50] };

  try {
    const res = await fetch('/api/analytics');
    if (res.ok) {
      const data = await res.json();
      metrics = data.metrics;
      state.moneySaved = metrics.totalMoneySaved;
      updateStatsUI();
    }
  } catch (err) {}

  const ctxSavings = document.getElementById('monthlySavingsChart')?.getContext('2d');
  const ctxCategory = document.getElementById('categoryBreakdownChart')?.getContext('2d');

  if (typeof Chart !== 'undefined') {
    if (ctxSavings && !savingsChart) {
      savingsChart = new Chart(ctxSavings, {
        type: 'line',
        data: {
          labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct (Current)'],
          datasets: [{
            label: 'Grocery Dollars Saved ($)',
            data: [65, 84, 110, 125, 138, state.moneySaved],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: '#10b981'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#94a3b8' } } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
          }
        }
      });
    }

    if (ctxCategory && !categoryChart) {
      categoryChart = new Chart(ctxCategory, {
        type: 'doughnut',
        data: {
          labels: ['Produce / Fresh Greens', 'Dairy & Eggs', 'Bakery', 'Pantry Essentials', 'Proteins'],
          datasets: [{
            data: [42, 28, 15, 10, 5],
            backgroundColor: ['#10b981', '#06b6d4', '#f59e0b', '#a855f7', '#f43f5e']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
        }
      });
    }
  }
}

// Toast Feedback Notification
function showToast(msg) {
  const existing = document.querySelectorAll('.toast-msg');
  existing.forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.background = 'linear-gradient(135deg, #10b981, #059669)';
  toast.style.color = '#000';
  toast.style.fontWeight = '700';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '10px';
  toast.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.4)';
  toast.style.zIndex = '9999';
  toast.style.fontSize = '0.9rem';
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${msg}`;

  document.body.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3500);
}

// Initial Bootstrap
window.addEventListener('DOMContentLoaded', async () => {
  await checkBackendConnection();
  fetchPantry();
  fetchRecipes();
});
