// NourishGuard AI — Complete Application Logic

// Initial Default State
const DEFAULT_PANTRY_ITEMS = [
  {
    id: 'item-1',
    name: 'Baby Spinach',
    category: 'Produce',
    quantity: '250g',
    location: 'Fridge',
    purchaseDate: '2026-10-06',
    expiryDate: '2026-10-11',
    daysLeft: 1,
    status: 'critical' // critical, warning, fresh
  },
  {
    id: 'item-2',
    name: 'Greek Yogurt',
    category: 'Dairy',
    quantity: '500g',
    location: 'Fridge',
    purchaseDate: '2026-10-04',
    expiryDate: '2026-10-12',
    daysLeft: 2,
    status: 'critical'
  },
  {
    id: 'item-3',
    name: 'Bell Peppers (Trio)',
    category: 'Produce',
    quantity: '3 pcs',
    location: 'Fridge',
    purchaseDate: '2026-10-07',
    expiryDate: '2026-10-14',
    daysLeft: 4,
    status: 'warning'
  },
  {
    id: 'item-4',
    name: 'Sourdough Bread',
    category: 'Bakery',
    quantity: '1 Loaf',
    location: 'Pantry',
    purchaseDate: '2026-10-08',
    expiryDate: '2026-10-13',
    daysLeft: 3,
    status: 'warning'
  },
  {
    id: 'item-5',
    name: 'Brown Basmati Rice',
    category: 'Pantry',
    quantity: '1 kg',
    location: 'Pantry',
    purchaseDate: '2026-09-15',
    expiryDate: '2027-03-15',
    daysLeft: 155,
    status: 'fresh'
  },
  {
    id: 'item-6',
    name: 'Extra Virgin Olive Oil',
    category: 'Pantry',
    quantity: '750ml',
    location: 'Pantry',
    purchaseDate: '2026-09-01',
    expiryDate: '2027-08-01',
    daysLeft: 294,
    status: 'fresh'
  }
];

const DEFAULT_COMMUNITY_DONATIONS = [
  {
    id: 'don-1',
    title: 'Surplus Artisan Baguettes (x8)',
    donor: 'Greenfield Organic Bakery',
    distance: '0.8 km away',
    timeRemaining: '3 hours left',
    lat: 28.6139,
    lng: 77.2090,
    claimed: false,
    verified: true
  },
  {
    id: 'don-2',
    title: 'Fresh Tomatoes & Cucumbers (4 kg)',
    donor: 'Urban Community Garden',
    distance: '1.4 km away',
    timeRemaining: '5 hours left',
    lat: 28.6219,
    lng: 77.2190,
    claimed: false,
    verified: true
  },
  {
    id: 'don-3',
    title: 'Sealed Whole Milk Cartons (x3)',
    donor: 'Resident Sarah M.',
    distance: '0.3 km away',
    timeRemaining: '1 day left',
    lat: 28.6080,
    lng: 77.2020,
    claimed: false,
    verified: false
  }
];

// App State
let state = {
  pantry: JSON.parse(localStorage.getItem('nourish_pantry')) || DEFAULT_PANTRY_ITEMS,
  donations: JSON.parse(localStorage.getItem('nourish_donations')) || DEFAULT_COMMUNITY_DONATIONS,
  moneySaved: parseFloat(localStorage.getItem('nourish_savings')) || 148.50,
  foodDivertedKg: parseFloat(localStorage.getItem('nourish_diverted')) || 32.4,
  activeFilter: 'all',
  searchQuery: ''
};

// Save to LocalStorage
function saveState() {
  localStorage.setItem('nourish_pantry', JSON.stringify(state.pantry));
  localStorage.setItem('nourish_donations', JSON.stringify(state.donations));
  localStorage.setItem('nourish_savings', state.moneySaved.toString());
  localStorage.setItem('nourish_diverted', state.foodDivertedKg.toString());
}

// Global Tab Switching
window.switchTab = function(tabId) {
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(view => {
    view.classList.toggle('active', view.id === tabId);
  });

  if (tabId === 'tab-analytics') {
    initAnalyticsCharts();
  } else if (tabId === 'tab-rescue') {
    initRescueMap();
  }
};

// Calculate item status
function calculateItemStatus(expiryDateStr) {
  const today = new Date('2026-10-10');
  const exp = new Date(expiryDateStr);
  const diffTime = exp - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status = 'fresh';
  if (diffDays <= 2) {
    status = 'critical';
  } else if (diffDays <= 5) {
    status = 'warning';
  }
  return { daysLeft: diffDays, status };
}

// Update Header & Dashboard Stats
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

// Render Pantry Inventory Cards
function renderPantry() {
  const container = document.getElementById('pantry-cards-container');
  if (!container) return;

  const filtered = state.pantry.filter(item => {
    const matchesFilter = state.activeFilter === 'all' || item.status === state.activeFilter || item.location.toLowerCase() === state.activeFilter.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || item.category.toLowerCase().includes(state.searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
        <i class="fa-solid fa-basket-shopping" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--emerald-500);"></i>
        <h3>No items found</h3>
        <p>Try clearing filters or add new groceries using the form or AI Scanner!</p>
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
      countdownText = '<span style="color: var(--rose-400);">Expires today!</span>';
    } else if (item.daysLeft <= 2) {
      statusBadge = '<span class="item-status-pill status-critical">Expires in ' + item.daysLeft + 'd</span>';
      countdownText = '<span style="color: var(--rose-400);">' + item.daysLeft + ' days remaining</span>';
    } else if (item.daysLeft <= 5) {
      statusBadge = '<span class="item-status-pill status-warning">Use Soon</span>';
      countdownText = '<span style="color: var(--amber-400);">' + item.daysLeft + ' days remaining</span>';
    } else {
      statusBadge = '<span class="item-status-pill status-fresh">Fresh</span>';
      countdownText = '<span style="color: var(--emerald-400);">' + item.daysLeft + ' days remaining</span>';
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
            <div class="expiry-countdown"><strong>Shelf-Life:</strong> ${countdownText}</div>
            <div style="font-size: 0.75rem; color: var(--text-dim);">Expiry Date: ${item.expiryDate}</div>
          </div>
        </div>

        <div class="item-actions">
          <button class="btn btn-primary btn-sm" onclick="triggerCookWithItem('${item.name}')" title="Cook with this item in AI Chef">
            <i class="fa-solid fa-utensils"></i> Cook
          </button>
          <button class="btn btn-secondary btn-sm" onclick="markConsumed('${item.id}')" title="Mark as consumed">
            <i class="fa-solid fa-check"></i> Eat
          </button>
          <button class="btn btn-secondary btn-sm" onclick="donateItem('${item.id}')" title="Share with community">
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

// Add New Item via Form
window.handleAddItem = function(e) {
  e.preventDefault();
  const name = document.getElementById('item-name-input').value.trim();
  const category = document.getElementById('item-category-input').value;
  const quantity = document.getElementById('item-qty-input').value.trim();
  const location = document.getElementById('item-loc-input').value;
  const expiryDate = document.getElementById('item-exp-input').value;

  if (!name || !expiryDate) return;

  const { daysLeft, status } = calculateItemStatus(expiryDate);

  const newItem = {
    id: 'item-' + Date.now(),
    name,
    category,
    quantity: quantity || '1 unit',
    location,
    purchaseDate: '2026-10-10',
    expiryDate,
    daysLeft,
    status
  };

  state.pantry.unshift(newItem);
  saveState();
  renderPantry();

  // Reset Form
  document.getElementById('add-item-form').reset();
  showToast(`Added ${name} to ${location}!`);
};

// Item Actions
window.markConsumed = function(id) {
  const item = state.pantry.find(i => i.id === id);
  if (!item) return;

  state.pantry = state.pantry.filter(i => i.id !== id);
  state.moneySaved += 3.50; // Add savings
  state.foodDivertedKg += 0.35;
  saveState();
  renderPantry();
  showToast(`Great job! Marked ${item.name} as consumed. Saved ~$3.50!`);
};

window.deleteItem = function(id) {
  state.pantry = state.pantry.filter(i => i.id !== id);
  saveState();
  renderPantry();
  showToast('Item removed from pantry.');
};

window.donateItem = function(id) {
  const item = state.pantry.find(i => i.id === id);
  if (!item) return;

  const newDonation = {
    id: 'don-' + Date.now(),
    title: `${item.quantity} ${item.name}`,
    donor: 'You (Household Donor)',
    distance: '0.1 km away',
    timeRemaining: `${item.daysLeft} days remaining`,
    lat: 28.6139 + (Math.random() - 0.5) * 0.01,
    lng: 77.2090 + (Math.random() - 0.5) * 0.01,
    claimed: false,
    verified: true
  };

  state.donations.unshift(newDonation);
  state.pantry = state.pantry.filter(i => i.id !== id);
  saveState();
  renderPantry();
  showToast(`Listed ${item.name} on the Hyperlocal Rescue Map!`);
  window.switchTab('tab-rescue');
};

window.triggerCookWithItem = function(name) {
  window.switchTab('tab-recipes');
  document.getElementById('custom-ingredient-filter').value = name;
  generateRecipes();
};

// Pantry Filters
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
// AI Multi-Modal Scanner Simulation
// ==========================================
const PRESET_SCANS = {
  receipt: {
    title: 'Supermarket Paper Receipt',
    items: [
      { name: 'Organic Whole Milk', category: 'Dairy', qty: '1 Gallon', expDays: 7, loc: 'Fridge' },
      { name: 'Fresh Strawberries', category: 'Produce', qty: '1 Box (400g)', expDays: 3, loc: 'Fridge' },
      { name: 'Whole Wheat Sandwich Bread', category: 'Bakery', qty: '1 Loaf', expDays: 5, loc: 'Pantry' },
      { name: 'Broccoli Crowns', category: 'Produce', qty: '500g', expDays: 4, loc: 'Fridge' },
      { name: 'Cheddar Cheese Block', category: 'Dairy', qty: '200g', expDays: 14, loc: 'Fridge' }
    ]
  },
  fridge: {
    title: 'Refrigerator Shelf Camera Capture',
    items: [
      { name: 'Tofu Extra Firm', category: 'Produce', qty: '350g', expDays: 2, loc: 'Fridge' },
      { name: 'Baby Carrots', category: 'Produce', qty: '1 Bag', expDays: 8, loc: 'Fridge' },
      { name: 'Almond Milk (Unsweetened)', category: 'Dairy', qty: '1 Liter', expDays: 6, loc: 'Fridge' },
      { name: 'Fresh Basil Herb', category: 'Produce', qty: '1 Bunch', expDays: 2, loc: 'Fridge' }
    ]
  }
};

let scannedItemsBuffer = [];

window.startScannerSimulation = function(presetKey) {
  const preset = PRESET_SCANS[presetKey] || PRESET_SCANS.receipt;
  const progressBox = document.getElementById('scan-progress-box');
  const resultBox = document.getElementById('scan-results-box');
  const bar = document.getElementById('scan-progress-bar');
  const statusMsg = document.getElementById('scan-status-msg');

  progressBox.style.display = 'block';
  resultBox.style.display = 'none';
  bar.style.width = '0%';

  const steps = [
    { p: 25, text: 'Preprocessing image and contrast enhancement...' },
    { p: 55, text: 'Executing TrOCR text recognition and bounding box extraction...' },
    { p: 85, text: 'Querying Deep Learning Freshness Classifier & UPC Database...' },
    { p: 100, text: 'AI Extraction Complete! Found ' + preset.items.length + ' grocery items.' }
  ];

  let currentStep = 0;
  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      bar.style.width = steps[currentStep].p + '%';
      statusMsg.innerText = steps[currentStep].text;
      currentStep++;
    } else {
      clearInterval(interval);
      scannedItemsBuffer = preset.items;
      renderScanResults(preset.items);
    }
  }, 450);
};

function renderScanResults(items) {
  const resultBox = document.getElementById('scan-results-box');
  const listEl = document.getElementById('scan-extracted-list');

  listEl.innerHTML = items.map((item, idx) => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--bg-surface-elevated); border-radius: var(--radius-sm); margin-bottom: 8px;">
      <div>
        <strong>${item.name}</strong> (${item.qty})
        <div style="font-size: 0.78rem; color: var(--emerald-400);">Category: ${item.category} &bull; Estimated Expiry: ${item.expDays} days &bull; ${item.loc}</div>
      </div>
      <span style="font-size: 0.8rem; color: var(--emerald-400); font-weight: 700;"><i class="fa-solid fa-check-circle"></i> 99.4% Match</span>
    </div>
  `).join('');

  resultBox.style.display = 'block';
}

window.commitScannedItems = function() {
  if (!scannedItemsBuffer.length) return;

  scannedItemsBuffer.forEach(item => {
    const today = new Date('2026-10-10');
    const expDate = new Date(today);
    expDate.setDate(today.getDate() + item.expDays);
    const expStr = expDate.toISOString().split('T')[0];

    const { daysLeft, status } = calculateItemStatus(expStr);

    state.pantry.unshift({
      id: 'item-' + Math.random().toString(36).substr(2, 9),
      name: item.name,
      category: item.category,
      quantity: item.qty,
      location: item.loc,
      purchaseDate: '2026-10-10',
      expiryDate: expStr,
      daysLeft,
      status
    });
  });

  saveState();
  renderPantry();
  showToast(`Successfully imported ${scannedItemsBuffer.length} items to pantry!`);
  scannedItemsBuffer = [];
  document.getElementById('scan-progress-box').style.display = 'none';
  document.getElementById('scan-results-box').style.display = 'none';
  window.switchTab('tab-pantry');
};

// ==========================================
// Generative Zero-Waste AI Chef Engine
// ==========================================
const RECIPE_DATABASE = [
  {
    title: 'Creamy Garlic-Yogurt Wilted Spinach Skillet',
    atRiskUsed: ['Baby Spinach (1d left)', 'Greek Yogurt (2d left)'],
    time: '12 Mins',
    servings: '2 Servings',
    diet: 'Vegetarian',
    difficulty: 'Easy',
    ingredients: [
      '200g Baby Spinach (Near Expiry)',
      '3 tbsp Greek Yogurt',
      '2 cloves Minced Garlic',
      '1 tbsp Olive Oil',
      'Pinch of Salt & Crushed Black Pepper'
    ],
    instructions: [
      'Heat olive oil in a non-stick skillet over medium flame. Sauté minced garlic for 1 minute until fragrant.',
      'Add fresh baby spinach in batches, tossing gently for 2–3 minutes until just wilted.',
      'Turn off the heat. Fold in the Greek yogurt with salt and black pepper to create a velvety, savory sauce without curdling.',
      'Serve warm alongside toasted sourdough bread or brown rice.'
    ],
    wastePrevented: '$4.20 / 350g saved'
  },
  {
    title: 'Savory Sourdough & Roasted Bell Pepper Bruschetta',
    atRiskUsed: ['Sourdough Bread (3d left)', 'Bell Peppers (4d left)'],
    time: '15 Mins',
    servings: '2 Servings',
    diet: 'Vegan Option',
    difficulty: 'Easy',
    ingredients: [
      '2 thick slices Sourdough Bread',
      '1 Bell Pepper (Diced)',
      '1 tbsp Extra Virgin Olive Oil',
      '1/2 tsp Dried Oregano / Mixed Herbs',
      'Optional: Shaved cheese or nutritional yeast'
    ],
    instructions: [
      'Toast sourdough bread slices in an oven or toaster until golden and crispy.',
      'In a pan, lightly char the diced bell peppers with olive oil and oregano for 4 minutes.',
      'Spoon warm sautéed bell peppers over toasted sourdough and drizzle with remaining olive oil.',
      'Garnish with fresh cracked pepper and serve immediately.'
    ],
    wastePrevented: '$3.80 / 280g saved'
  },
  {
    title: 'Golden Garlic Basmati Rice Bowl with Charred Peppers',
    atRiskUsed: ['Bell Peppers (4d left)', 'Brown Basmati Rice'],
    time: '20 Mins',
    servings: '3 Servings',
    diet: 'Gluten-Free / Vegan',
    difficulty: 'Medium',
    ingredients: [
      '1 Cup Brown Basmati Rice',
      '2 Bell Peppers (Sliced)',
      '1 tbsp Olive Oil',
      '1 tsp Cumin Seeds',
      'Salt to taste'
    ],
    instructions: [
      'Boil or pressure-cook brown basmati rice until fluffy.',
      'In a wok, heat olive oil, splutter cumin seeds, and stir-fry bell pepper strips on high heat.',
      'Toss warm cooked rice into the peppers with salt and black pepper.',
      'Enjoy a healthy, fiber-rich dinner using 100% pantry essentials.'
    ],
    wastePrevented: '$5.10 / 450g saved'
  }
];

window.generateRecipes = function() {
  const container = document.getElementById('recipe-results-container');
  if (!container) return;

  const customFilter = (document.getElementById('custom-ingredient-filter')?.value || '').toLowerCase();

  let matchedRecipes = RECIPE_DATABASE;
  if (customFilter) {
    matchedRecipes = RECIPE_DATABASE.filter(r => 
      r.title.toLowerCase().includes(customFilter) || 
      r.ingredients.some(i => i.toLowerCase().includes(customFilter)) ||
      r.atRiskUsed.some(a => a.toLowerCase().includes(customFilter))
    );
  }

  container.innerHTML = `
    <div style="grid-column: 1 / -1; margin-bottom: 0.5rem;">
      <span class="hero-tag" style="background: rgba(16, 185, 129, 0.2); border: 1px solid var(--emerald-500); color: var(--emerald-400); padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700;">
        <i class="fa-solid fa-sparkles"></i> AI Generated from ${state.pantry.filter(i => i.status !== 'fresh').length} at-risk ingredients
      </span>
    </div>
  ` + matchedRecipes.map(recipe => `
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
        <div style="margin-bottom: 0.75rem; font-size: 0.82rem; color: var(--rose-400); font-weight: 700;">
          <i class="fa-solid fa-triangle-exclamation"></i> Rescues: ${recipe.atRiskUsed.join(', ')}
        </div>
        
        <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">Ingredients:</h4>
        <ul class="ingredients-list">
          ${recipe.ingredients.map(ing => `<li><i class="fa-solid fa-check" style="color: var(--emerald-500); font-size: 0.75rem;"></i> ${ing}</li>`).join('')}
        </ul>

        <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">Step-by-Step AI Instructions:</h4>
        <ol class="instructions-list">
          ${recipe.instructions.map(step => `<li>${step}</li>`).join('')}
        </ol>

        <div style="margin-top: 1.25rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.8rem; color: var(--emerald-400); font-weight: 700;"><i class="fa-solid fa-seedling"></i> ${recipe.wastePrevented}</span>
          <button class="btn btn-primary btn-sm" onclick="showToast('Recipe marked cooked! Inventory auto-updated.')">
            <i class="fa-solid fa-check"></i> Cooked This
          </button>
        </div>
      </div>
    </div>
  `).join('');
};

// ==========================================
// Hyperlocal Food Rescue Map Simulation
// ==========================================
let rescueMapInstance = null;

function initRescueMap() {
  const mapEl = document.getElementById('leaflet-map-view');
  if (!mapEl) return;

  renderDonationList();

  // If already initialized, invalidate size
  if (rescueMapInstance) {
    setTimeout(() => rescueMapInstance.invalidateSize(), 200);
    return;
  }

  // Check if Leaflet is available
  if (typeof L !== 'undefined') {
    rescueMapInstance = L.map('leaflet-map-view').setView([28.6139, 77.2090], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(rescueMapInstance);

    // Add Markers
    state.donations.forEach(don => {
      const marker = L.marker([don.lat, don.lng]).addTo(rescueMapInstance);
      marker.bindPopup(`
        <div style="color: #000; font-family: sans-serif;">
          <strong>${don.title}</strong><br>
          <small>${don.donor} &bull; ${don.distance}</small><br>
          <span style="color: #059669; font-weight: bold;">${don.timeRemaining}</span><br><br>
          <button onclick="claimDonation('${don.id}')" style="background: #10b981; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">Reserve Pickup</button>
        </div>
      `);
    });
  }
}

function renderDonationList() {
  const container = document.getElementById('community-donation-feed');
  if (!container) return;

  container.innerHTML = state.donations.map(don => `
    <div class="donation-item">
      <div>
        <div style="font-weight: 700; font-size: 0.95rem;">${don.title}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted);">${don.donor} &bull; <i class="fa-solid fa-location-dot" style="color: var(--cyan-400);"></i> ${don.distance}</div>
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

window.claimDonation = function(id) {
  const don = state.donations.find(d => d.id === id);
  if (!don) return;

  don.claimed = true;
  saveState();
  renderDonationList();

  // Show Token Modal
  document.getElementById('claim-token-title').innerText = don.title;
  document.getElementById('claim-token-donor').innerText = `${don.donor} (${don.distance})`;
  document.getElementById('claim-token-id').innerText = 'NG-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  document.getElementById('claim-modal').classList.add('active');
};

window.closeClaimModal = function() {
  document.getElementById('claim-modal').classList.remove('active');
};

// ==========================================
// Analytics Charts (Chart.js)
// ==========================================
let savingsChart = null;
let categoryChart = null;

function initAnalyticsCharts() {
  if (typeof Chart === 'undefined') return;

  // Monthly Savings Chart
  const ctxSavings = document.getElementById('monthlySavingsChart')?.getContext('2d');
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
        plugins: {
          legend: { labels: { color: '#94a3b8' } }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }

  // Category Breakdown Doughnut Chart
  const ctxCategory = document.getElementById('categoryBreakdownChart')?.getContext('2d');
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
        plugins: {
          legend: { position: 'bottom', labels: { color: '#94a3b8' } }
        }
      }
    });
  }
}

// Toast Notifications
function showToast(msg) {
  const toast = document.createElement('div');
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
  toast.style.animation = 'fadeIn 0.3s ease';
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${msg}`;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
  renderPantry();
  generateRecipes();
});
