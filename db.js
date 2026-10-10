// Database Management Module (Persistent JSON/File-Based DB with ACID Atomic Operations)
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'nourishguard_data.json');

const INITIAL_DB = {
  pantry_items: [
    {
      id: 'item-1',
      name: 'Baby Spinach Leaves',
      category: 'Produce',
      quantity: '250g',
      location: 'Fridge',
      purchaseDate: '2026-10-06',
      expiryDate: '2026-10-11',
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
      status: 'fresh'
    }
  ],
  community_donations: [
    {
      id: 'don-1',
      title: 'Surplus Fresh Baguettes (x8)',
      donor: 'Greenfield Artisan Bakery',
      distance: '0.8 km away',
      timeRemaining: '3 hours left',
      lat: 28.6139,
      lng: 77.2090,
      claimed: false,
      claimedBy: null,
      pickupToken: null,
      createdAt: '2026-10-10T18:00:00Z'
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
      claimedBy: null,
      pickupToken: null,
      createdAt: '2026-10-10T19:00:00Z'
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
      claimedBy: null,
      pickupToken: null,
      createdAt: '2026-10-10T20:00:00Z'
    }
  ],
  analytics: {
    totalMoneySaved: 148.50,
    totalFoodDivertedKg: 32.40,
    totalMealsShared: 8,
    categoryBreakdown: {
      'Produce / Fresh Greens': 42,
      'Dairy & Eggs': 28,
      'Bakery': 15,
      'Pantry Essentials': 10,
      'Proteins': 5
    },
    monthlyTrend: [
      { month: 'May', saved: 65 },
      { month: 'Jun', saved: 84 },
      { month: 'Jul', saved: 110 },
      { month: 'Aug', saved: 125 },
      { month: 'Sep', saved: 138 },
      { month: 'Oct', saved: 148.50 }
    ]
  }
};

// Initialize DB file if not exists
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
    console.log('[Database] Initialized new persistent database:', DB_FILE);
  } else {
    console.log('[Database] Loaded existing database from:', DB_FILE);
  }
}

// Read DB
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      initDB();
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Database] Read error:', err);
    return INITIAL_DB;
  }
}

// Write DB
function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[Database] Write error:', err);
    return false;
  }
}

initDB();

module.exports = {
  readDB,
  writeDB,
  initDB
};
