const authService = require('../services/auth');

/**
 * Controller for user authentication (signup, login).
 */
class AuthController {
  // PUBLIC_INTERFACE
  async signup(req, res) {
    /**
     * Registers a new user.
     * body: {username, password}
     * returns: 201 with user info (excluding password), or 400/409 error
     */
    const { username, password } = req.body;
    try {
      const result = await authService.signup(username, password);
      res.status(201).json(result);
    } catch (err) {
      if (err.code === 'USERNAME_TAKEN') {
        res.status(409).json({ message: 'Username already exists' });
      } else {
        res.status(400).json({ message: err.message || 'Signup failed' });
      }
    }
  }

  // PUBLIC_INTERFACE
  async login(req, res) {
    /**
     * Authenticates user and returns JWT.
     * body: {username, password}
     * returns: 200 with {token}, or 401 error
     */
    const { username, password } = req.body;
    try {
      const result = await authService.login(username, password);
      res.status(200).json(result); // { token }
    } catch (err) {
      res.status(401).json({ message: err.message || 'Authentication failed' });
    }
  }
}

module.exports = new AuthController();
