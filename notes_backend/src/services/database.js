const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.NOTES_DB_PATH || path.join(__dirname, '../../notes.sqlite3');
let db;

/**
 * Initialize and connect to database.
 * - Will create the database file if it does not exist.
 * - Runs schema for users and notes tables.
 */
function initializeDatabase() {
  if (db) return db;
  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Failed to connect to SQLite database:', err.message);
    } else {
      console.log('Connected to SQLite database at', DB_PATH);
    }
  });

  // Create users table (for authentication)
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL, -- hashed password
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
  });
  return db;
}

// PUBLIC_INTERFACE
function getDb() {
  /**
   * Returns the singleton DB connection (initializing DB if needed).
   * Used for running queries/transforms directly.
   */
  if (!db) {
    initializeDatabase();
  }
  return db;
}

// PUBLIC_INTERFACE
function closeDb() {
  /**
   * Gracefully closes the SQLite database connection.
   */
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Closed the database connection.');
      }
      db = null;
    });
  }
}

// PUBLIC_INTERFACE
function runQuery(sql, params = []) {
  /**
   * Runs INSERT/UPDATE/DELETE queries.
   * Returns a Promise with result { lastID, changes }.
   */
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// PUBLIC_INTERFACE
function fetchOne(sql, params = []) {
  /**
   * Fetches a single row matching SQL and params.
   * Returns Promise <row | undefined>.
   */
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// PUBLIC_INTERFACE
function fetchAll(sql, params = []) {
  /**
   * Fetches all rows for the given SQL and params.
   * Returns Promise<Array<object>>.
   */
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = {
  initializeDatabase,
  getDb,
  closeDb,
  runQuery,
  fetchOne,
  fetchAll,
};
