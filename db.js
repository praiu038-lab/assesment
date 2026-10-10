// NourishGuard AI — SQLite Relational Database Engine
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('[SQLite] Connection error:', err.message);
  } else {
    console.log('[SQLite] Connected to relational database file:', DB_PATH);
  }
});

// Initialize Tables and Seed Data
function initDatabase() {
  db.serialize(() => {
    // 1. Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        role TEXT DEFAULT 'household_user',
        household_size INTEGER DEFAULT 3,
        dietary_preferences TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Pantry Items Table
    db.run(`
      CREATE TABLE IF NOT EXISTS pantry_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        quantity TEXT,
        location TEXT,
        purchase_date TEXT,
        expiry_date TEXT NOT NULL,
        is_consumed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Community Donations Table
    db.run(`
      CREATE TABLE IF NOT EXISTS community_donations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        donor TEXT,
        distance TEXT,
        time_remaining TEXT,
        lat REAL,
        lng REAL,
        claimed INTEGER DEFAULT 0,
        claimed_by TEXT,
        pickup_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Analytics & Impact Logs Table
    db.run(`
      CREATE TABLE IF NOT EXISTS analytics_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action_type TEXT,
        item_name TEXT,
        money_saved REAL DEFAULT 0,
        food_diverted_kg REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check & Seed Initial Pantry Items
    db.get('SELECT COUNT(*) as count FROM pantry_items', (err, row) => {
      if (!err && row && row.count === 0) {
        console.log('[SQLite] Seeding initial pantry demo items...');
        const stmt = db.prepare(`
          INSERT INTO pantry_items (id, name, category, quantity, location, purchase_date, expiry_date)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const initialItems = [
          ['item-1', 'Baby Spinach Leaves', 'Produce', '250g', 'Fridge', '2026-10-06', '2026-10-11'],
          ['item-2', 'Greek Yogurt (Organic)', 'Dairy', '500g', 'Fridge', '2026-10-04', '2026-10-12'],
          ['item-3', 'Bell Peppers (Trio Pack)', 'Produce', '3 pcs', 'Fridge', '2026-10-07', '2026-10-14'],
          ['item-4', 'Artisan Sourdough Loaf', 'Bakery', '1 Loaf', 'Pantry', '2026-10-08', '2026-10-13'],
          ['item-5', 'Brown Basmati Rice', 'Pantry', '1 kg', 'Pantry', '2026-09-15', '2027-03-15'],
          ['item-6', 'Extra Virgin Olive Oil', 'Pantry', '750ml', 'Pantry', '2026-09-01', '2027-08-01']
        ];

        initialItems.forEach(item => stmt.run(item));
        stmt.finalize();
      }
    });

    // Check & Seed Initial Community Donations
    db.get('SELECT COUNT(*) as count FROM community_donations', (err, row) => {
      if (!err && row && row.count === 0) {
        console.log('[SQLite] Seeding initial community donations...');
        const stmt = db.prepare(`
          INSERT INTO community_donations (id, title, donor, distance, time_remaining, lat, lng, claimed)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const initialDonations = [
          ['don-1', 'Surplus Fresh Baguettes (x8)', 'Greenfield Artisan Bakery', '0.8 km away', '3 hours left', 28.6139, 77.2090, 0],
          ['don-2', 'Fresh Vine Tomatoes & Cucumbers (4 kg)', 'Urban Community Greenhub', '1.4 km away', '5 hours left', 28.6219, 77.2190, 0],
          ['don-3', 'Sealed Whole Milk Cartons (x3)', 'Neighbor Sarah M.', '0.3 km away', '1 day left', 28.6080, 77.2020, 0]
        ];

        initialDonations.forEach(don => stmt.run(don));
        stmt.finalize();
      }
    });

    // Check & Seed Initial Analytics Log
    db.get('SELECT COUNT(*) as count FROM analytics_logs', (err, row) => {
      if (!err && row && row.count === 0) {
        db.run(`
          INSERT INTO analytics_logs (action_type, item_name, money_saved, food_diverted_kg)
          VALUES ('initial_baseline', 'Pantry Initialization', 148.50, 32.40)
        `);
      }
    });
  });
}

initDatabase();

// Promisified Helper Functions
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

module.exports = {
  db,
  query,
  get,
  run
};
