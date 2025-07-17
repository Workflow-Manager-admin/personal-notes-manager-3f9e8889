const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'insecure-secret-change-this';

// PUBLIC_INTERFACE
function authenticateJWT(req, res, next) {
  /**
   * Middleware to authenticate JWT in 'Authorization: Bearer ...' header.
   * Sets req.user if valid.
   */
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or malformed Authorization header' });
  }
  const token = authHeader.slice(7);

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded; // { id: ..., username: ... }
    next();
  });
}

module.exports = {
  authenticateJWT,
};
