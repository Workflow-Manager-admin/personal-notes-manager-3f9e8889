const express = require('express');
const healthController = require('../controllers/health');
const authController = require('../controllers/auth');
const notesController = require('../controllers/notes');
const { authenticateJWT } = require('../middleware');

const router = express.Router();

// Health endpoint
/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

// AUTH endpoints

/**
 * @swagger
 * /api/signup:
 *   post:
 *     summary: Signup a new user
 */
router.post('/api/signup', (req, res) =>
  authController.signup(req, res)
);
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login a user
 */
router.post('/api/login', (req, res) =>
  authController.login(req, res)
);

// NOTES endpoints (JWT protected)

router.use('/api/notes', authenticateJWT);

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Create a new note (auth required)
 *   get:
 *     summary: Get all notes for current user (auth required, optional ?q=search)
 */
router
  .route('/api/notes')
  .get((req, res) => notesController.getAll(req, res))
  .post((req, res) => notesController.create(req, res));

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Get a note by ID (auth required)
 *   put:
 *     summary: Update a note by ID (auth required)
 *   delete:
 *     summary: Delete a note by ID (auth required)
 */
router
  .route('/api/notes/:id')
  .get((req, res) => notesController.getById(req, res))
  .put((req, res) => notesController.update(req, res))
  .delete((req, res) => notesController.delete(req, res));

module.exports = router;
