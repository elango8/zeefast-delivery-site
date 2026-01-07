/**
 * Restaurant Routes
 */

const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { optionalAuth } = require('../middleware/auth');

// Get cuisines list (for filters)
router.get('/cuisines', restaurantController.getCuisines);

// Search restaurants
router.get('/search', optionalAuth, restaurantController.search);

// Get all restaurants (with optional filters)
router.get('/', optionalAuth, restaurantController.getAll);

// Get single restaurant
router.get('/:id', restaurantController.getById);

module.exports = router;
