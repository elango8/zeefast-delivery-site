/**
 * Auth Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/login', authController.login);
router.post('/signup', authController.signup);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/addresses', authenticate, authController.addAddress);
router.delete('/addresses/:addressId', authenticate, authController.deleteAddress);

module.exports = router;
