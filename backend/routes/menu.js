/**
 * Menu Routes
 */

const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { optionalAuth } = require('../middleware/auth');

// Search menu items
router.get('/search', optionalAuth, menuController.searchItems);

// Get popular items
router.get('/popular', menuController.getPopularItems);

// Get similar items for an item
router.get('/similar/:itemId', menuController.getSimilarItems);

// Get single menu item
router.get('/item/:itemId', menuController.getItem);

// Get menu for restaurant
router.get('/:restaurantId', menuController.getByRestaurant);

module.exports = router;
