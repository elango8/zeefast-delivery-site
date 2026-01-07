/**
 * Cart Routes
 */

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

// All cart routes require authentication
router.use(authenticate);

// Get user's cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/add', cartController.addItem);

// Update item quantity
router.put('/update', cartController.updateQuantity);

// Remove item from cart
router.delete('/item/:itemId', cartController.removeItem);

// Clear cart
router.delete('/', cartController.clearCart);

module.exports = router;
