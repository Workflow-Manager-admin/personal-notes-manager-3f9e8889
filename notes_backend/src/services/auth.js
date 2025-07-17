const db = require('./database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'insecure-secret-change-this';
const JWT_EXPIRES_IN = '7d'; // 1 week

// PUBLIC_INTERFACE
async function signup(username, password) {
  /**
   * Registers a new user in the database.
   * Returns a user object (without password).
   * Throws { code: 'USERNAME_TAKEN' } if exists.
   */
  if (!username || !password) throw new Error('Username and password are required');
  const hash = await bcrypt.hash(password, 10);
  try {
    const result = await db.runQuery(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hash]
    );
    // Return user object without password
    const user = await db.fetchOne('SELECT id, username, created_at FROM users WHERE username = ?', [username]);
    return user;
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      const error = new Error('Username already exists');
      error.code = 'USERNAME_TAKEN';
      throw error;
    }
    throw err;
  }
}

// PUBLIC_INTERFACE
async function login(username, password) {
  /**
   * Verifies credentials and returns a JWT if successful.
   */
  if (!username || !password) throw new Error('Username and password are required');
  const user = await db.fetchOne('SELECT id, username, password FROM users WHERE username = ?', [username]);
  if (!user) throw new Error('Invalid username or password');
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid username or password');

  // Issue JWT
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { token, user: { id: user.id, username: user.username } };
}

module.exports = {
  signup,
  login,
};
