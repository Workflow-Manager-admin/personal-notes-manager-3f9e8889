const { authenticateJWT } = require('./auth');

// This file exports available middleware.
module.exports = {
  authenticateJWT,
};
