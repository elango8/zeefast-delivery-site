/**
 * Order Routes
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

// All order routes require authentication
router.use(authenticate);

// Get reorder suggestions
router.get('/reorder-suggestions', orderController.getReorderSuggestions);

// Get all orders for user
router.get('/', orderController.getAll);

// Create new order
router.post('/', orderController.create);

// Get single order
router.get('/:orderId', orderController.getById);

// Reorder from past order
router.post('/:orderId/reorder', orderController.reorder);

// Cancel order
router.post('/:orderId/cancel', orderController.cancel);

module.exports = router;
