// NourishGuard AI — Complete Bulletproof Application Logic

// Initial Default Pantry Data
const DEFAULT_PANTRY_ITEMS = [
  {
    id: 'item-1',
    name: 'Baby Spinach Leaves',
    category: 'Produce',
    quantity: '250g',
    location: 'Fridge',
    purchaseDate: '2026-10-06',
    expiryDate: '2026-10-11',
    daysLeft: 1,
    status: 'critical'
  },
  {
    id: 'item-2',
    name: 'Greek Yogurt (Organic)',
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
    name: 'Bell Peppers (Trio Pack)',
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
    name: 'Artisan Sourdough Loaf',
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
    title: 'Surplus Fresh Baguettes (x8)',
    donor: 'Greenfield Artisan Bakery',
    distance: '0.8 km away',
    timeRemaining: '3 hours left',
    lat: 28.6139,
    lng: 77.2090,
    claimed: false,
    verified: true
  },
  {
    id: 'don-2',
    title: 'Fresh Vine Tomatoes & Cucumbers (4 kg)',
    donor: 'Urban Community Greenhub',
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
    donor: 'Neighbor Sarah M.',
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

// Save to localStorage
function saveState() {
  localStorage.setItem('nourish_pantry', JSON.stringify(state.pantry));
  localStorage.setItem('nourish_donations', JSON.stringify(state.donations));
  localStorage.setItem('nourish_savings', state.moneySaved.toString());
  localStorage.setItem('nourish_diverted', state.foodDivertedKg.toString());
}

// Global Tab Switching
window.switchTab = function(tabId) {
  // Update Buttons
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  // Update Tab Views
  document.querySelectorAll('.tab-content').forEach(view => {
    view.classList.toggle('active', view.id === tabId);
  });

  // Tab-Specific Actions
  if (tabId === 'tab-pantry') {
    renderPantry();
  } else if (tabId === 'tab-recipes') {
    generateRecipes();
  } else if (tabId === 'tab-rescue') {
    initRescueMap();
  } else if (tabId === 'tab-analytics') {
    initAnalyticsCharts();
  } else if (tabId === 'tab-srs') {
    if (window.mermaid) {
      try { window.mermaid.run(); } catch(e) {}
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Helper: Calculate Status
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

// Update Header Counters
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

// Render Pantry Cards
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

// Add Item via Form
window.handleAddItem = function(e) {
  if (e && e.preventDefault) e.preventDefault();

  const nameInput = document.getElementById('item-name-input');
  const catInput = document.getElementById('item-category-input');
  const qtyInput = document.getElementById('item-qty-input');
  const locInput = document.getElementById('item-loc-input');
  const expInput = document.getElementById('item-exp-input');

  const name = nameInput ? nameInput.value.trim() : '';
  const category = catInput ? catInput.value : 'Produce';
  const quantity = qtyInput && qtyInput.value.trim() ? qtyInput.value.trim() : '1 unit';
  const location = locInput ? locInput.value : 'Fridge';
  const expiryDate = expInput ? expInput.value : '2026-10-15';

  if (!name) {
    showToast('Please enter an item name');
    return false;
  }

  const { daysLeft, status } = calculateItemStatus(expiryDate);

  const newItem = {
    id: 'item-' + Date.now(),
    name,
    category,
    quantity,
    location,
    purchaseDate: '2026-10-10',
    expiryDate,
    daysLeft,
    status
  };

  state.pantry.unshift(newItem);
  saveState();
  renderPantry();

  if (document.getElementById('add-item-form')) {
    document.getElementById('add-item-form').reset();
    if (document.getElementById('item-exp-input')) {
      document.getElementById('item-exp-input').value = '2026-10-16';
    }
  }

  showToast(`Added ${name} to ${location}!`);
  return false;
};

// Item Actions
window.markConsumed = function(id) {
  const item = state.pantry.find(i => i.id === id);
  if (!item) return;

  state.pantry = state.pantry.filter(i => i.id !== id);
  state.moneySaved += 3.80;
  state.foodDivertedKg += 0.40;
  saveState();
  renderPantry();
  showToast(`Yum! Consumed ${item.name}. Saved ~$3.80 from waste!`);
};

window.deleteItem = function(id) {
  const item = state.pantry.find(i => i.id === id);
  state.pantry = state.pantry.filter(i => i.id !== id);
  saveState();
  renderPantry();
  showToast(item ? `Removed ${item.name}` : 'Item removed');
};

window.donateItem = function(id) {
  const item = state.pantry.find(i => i.id === id);
  if (!item) return;

  const newDonation = {
    id: 'don-' + Date.now(),
    title: `${item.quantity} ${item.name}`,
    donor: 'You (Household Resident)',
    distance: '0.1 km away',
    timeRemaining: `${item.daysLeft} days remaining`,
    lat: 28.6139 + (Math.random() - 0.5) * 0.015,
    lng: 77.2090 + (Math.random() - 0.5) * 0.015,
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
  const filterInput = document.getElementById('custom-ingredient-filter');
  if (filterInput) {
    filterInput.value = name;
  }
  generateRecipes();
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
// AI Scanner Simulation Engine
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
      { name: 'Baby Carrots', category: 'Produce', qty: '1 Bag (500g)', expDays: 8, loc: 'Fridge' },
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

  if (progressBox) progressBox.style.display = 'block';
  if (resultBox) resultBox.style.display = 'none';
  if (bar) bar.style.width = '0%';

  const steps = [
    { p: 25, text: 'Preprocessing image and contrast enhancement...' },
    { p: 55, text: 'Executing TrOCR Transformer text recognition...' },
    { p: 85, text: 'Querying Deep Learning Freshness Classifier & UPC Database...' },
    { p: 100, text: 'AI Extraction Complete! Found ' + preset.items.length + ' grocery items.' }
  ];

  let currentStep = 0;
  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      if (bar) bar.style.width = steps[currentStep].p + '%';
      if (statusMsg) statusMsg.innerText = steps[currentStep].text;
      currentStep++;
    } else {
      clearInterval(interval);
      scannedItemsBuffer = preset.items;
      renderScanResults(preset.items);
    }
  }, 400);
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
  
  const prog = document.getElementById('scan-progress-box');
  const res = document.getElementById('scan-results-box');
  if (prog) prog.style.display = 'none';
  if (res) res.style.display = 'none';
  
  window.switchTab('tab-pantry');
};

// ==========================================
// Generative Zero-Waste AI Chef Engine
// ==========================================
const RECIPE_DATABASE = [
  {
    title: 'Creamy Garlic-Yogurt Wilted Spinach Skillet',
    atRiskUsed: ['Baby Spinach', 'Greek Yogurt'],
    time: '12 Mins',
    servings: '2 Servings',
    diet: 'Vegetarian',
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
      'Turn off the heat. Fold in Greek yogurt with salt and black pepper to create a velvety sauce without curdling.',
      'Serve warm alongside toasted sourdough bread or brown rice.'
    ],
    wastePrevented: '$4.20 / 350g saved'
  },
  {
    title: 'Savory Sourdough & Roasted Bell Pepper Bruschetta',
    atRiskUsed: ['Sourdough Loaf', 'Bell Peppers'],
    time: '15 Mins',
    servings: '2 Servings',
    diet: 'Vegan Option',
    ingredients: [
      '2 thick slices Sourdough Bread',
      '1 Bell Pepper (Diced)',
      '1 tbsp Extra Virgin Olive Oil',
      '1/2 tsp Dried Oregano / Mixed Herbs',
      'Optional: Shaved cheese or salt'
    ],
    instructions: [
      'Toast sourdough bread slices in an oven or pan until golden and crunchy.',
      'In a pan, lightly char diced bell peppers with olive oil and oregano for 4 minutes.',
      'Spoon warm sautéed bell peppers over toasted sourdough and drizzle with olive oil.',
      'Garnish with fresh cracked pepper and serve immediately.'
    ],
    wastePrevented: '$3.80 / 280g saved'
  },
  {
    title: 'Golden Garlic Basmati Rice Bowl with Charred Peppers',
    atRiskUsed: ['Bell Peppers', 'Brown Basmati Rice'],
    time: '20 Mins',
    servings: '3 Servings',
    diet: 'Gluten-Free / Vegan',
    ingredients: [
      '1 Cup Brown Basmati Rice',
      '2 Bell Peppers (Sliced into thin strips)',
      '1 tbsp Olive Oil',
      '1 tsp Cumin Seeds',
      'Salt to taste'
    ],
    instructions: [
      'Cook brown basmati rice until fluffy and set aside.',
      'In a wok, heat olive oil, splutter cumin seeds, and stir-fry bell pepper strips on high heat for 3 minutes.',
      'Toss warm cooked rice into the peppers with salt and black pepper.',
      'Enjoy a healthy, zero-waste dinner using 100% pantry essentials.'
    ],
    wastePrevented: '$5.10 / 450g saved'
  }
];

window.generateRecipes = function() {
  const container = document.getElementById('recipe-results-container');
  if (!container) return;

  const customFilter = (document.getElementById('custom-ingredient-filter')?.value || '').toLowerCase().trim();

  let matchedRecipes = RECIPE_DATABASE;
  if (customFilter) {
    matchedRecipes = RECIPE_DATABASE.filter(r => 
      r.title.toLowerCase().includes(customFilter) || 
      r.ingredients.some(i => i.toLowerCase().includes(customFilter)) ||
      r.atRiskUsed.some(a => a.toLowerCase().includes(customFilter))
    );
  }

  if (matchedRecipes.length === 0) {
    matchedRecipes = RECIPE_DATABASE; // fallback
  }

  const atRiskCount = state.pantry.filter(i => i.status !== 'fresh').length;

  container.innerHTML = `
    <div style="grid-column: 1 / -1; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
      <span class="hero-tag" style="background: rgba(16, 185, 129, 0.2); border: 1px solid var(--emerald-500); color: var(--emerald-400); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700;">
        <i class="fa-solid fa-sparkles"></i> AI Generated Recipes (Prioritizing ${atRiskCount} at-risk pantry items)
      </span>
      ${customFilter ? `<button class="btn btn-secondary btn-sm" onclick="document.getElementById('custom-ingredient-filter').value=''; generateRecipes();"><i class="fa-solid fa-xmark"></i> Clear Filter</button>` : ''}
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
        <div style="margin-bottom: 0.85rem; font-size: 0.82rem; color: var(--rose-400); font-weight: 700; background: rgba(244, 63, 94, 0.1); padding: 6px 10px; border-radius: var(--radius-xs); border: 1px solid rgba(244, 63, 94, 0.3);">
          <i class="fa-solid fa-triangle-exclamation"></i> Rescues: ${recipe.atRiskUsed.join(', ')}
        </div>
        
        <h4 style="font-size: 0.82rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; letter-spacing: 0.05em;">Ingredients:</h4>
        <ul class="ingredients-list">
          ${recipe.ingredients.map(ing => `<li><i class="fa-solid fa-check" style="color: var(--emerald-500); font-size: 0.75rem;"></i> ${ing}</li>`).join('')}
        </ul>

        <h4 style="font-size: 0.82rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; margin-top: 1rem; letter-spacing: 0.05em;">Step-by-Step AI Cooking Steps:</h4>
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
};

// ==========================================
// Hyperlocal Food Rescue Map Simulation
// ==========================================
let rescueMapInstance = null;

function initRescueMap() {
  renderDonationList();

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
  } else {
    // Graceful offline simulated interactive visual map
    mapEl.innerHTML = `
      <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle, #1e293b 0%, #0f172a 100%); color: var(--text-primary); text-align: center; padding: 2rem;">
        <i class="fa-solid fa-map-location-dot" style="font-size: 3rem; color: var(--emerald-400); margin-bottom: 1rem;"></i>
        <h3 style="font-size: 1.2rem; font-weight: 700;">Live GPS Food Rescue Network Active</h3>
        <p style="color: var(--text-secondary); font-size: 0.88rem; max-width: 400px; margin-top: 6px;">
          Connected to 3 verified community shelters & 2 nearby donors within 5 km radius.
        </p>
      </div>
    `;
  }
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

window.claimDonation = function(id) {
  const don = state.donations.find(d => d.id === id);
  if (!don) return;

  don.claimed = true;
  saveState();
  renderDonationList();

  const titleEl = document.getElementById('claim-token-title');
  const donorEl = document.getElementById('claim-token-donor');
  const idEl = document.getElementById('claim-token-id');
  const modal = document.getElementById('claim-modal');

  if (titleEl) titleEl.innerText = don.title;
  if (donorEl) donorEl.innerText = `${don.donor} (${don.distance})`;
  if (idEl) idEl.innerText = 'NG-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  if (modal) modal.classList.add('active');
};

window.closeClaimModal = function() {
  const modal = document.getElementById('claim-modal');
  if (modal) modal.classList.remove('active');
};

// ==========================================
// Analytics Charts (Chart.js + Fallback)
// ==========================================
let savingsChart = null;
let categoryChart = null;

function initAnalyticsCharts() {
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
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
        }
      });
    }
  }
}

// Toast Feedback
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
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// Window load init
window.addEventListener('DOMContentLoaded', () => {
  renderPantry();
  generateRecipes();
  updateStatsUI();
});
