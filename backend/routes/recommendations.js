/**
 * Recommendation Routes
 */

const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Public/Guest routes
router.get('/trending', recommendationController.getTrending);
router.get('/for-you', optionalAuth, recommendationController.getForYou);
router.get('/search', optionalAuth, recommendationController.search);
router.get('/similar/:itemId', recommendationController.getSimilar);

// Authenticated routes
router.get('/', authenticate, recommendationController.getPersonalized);
router.get('/frequent', authenticate, recommendationController.getFrequent);

module.exports = router;
