/**
 * Recommendation Controller
 * Handles AI-powered recommendations
 */

const aiEngine = require('../utils/aiEngine');

/**
 * Get Personalized Recommendations
 * GET /api/recommendations
 */
exports.getPersonalized = (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const userId = req.userId;

        const recommendations = aiEngine.getPersonalizedRecommendations(userId, parseInt(limit));

        res.json({
            success: true,
            data: recommendations,
            aiPowered: true,
            basedOn: ['order_history', 'preferences', 'time_of_day', 'popularity']
        });
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ error: 'Server error fetching recommendations' });
    }
};

/**
 * Get Frequently Ordered Items
 * GET /api/recommendations/frequent
 */
exports.getFrequent = (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const userId = req.userId;

        const frequentItems = aiEngine.getFrequentlyOrdered(userId, parseInt(limit));

        res.json({
            success: true,
            data: frequentItems
        });
    } catch (error) {
        console.error('Get frequent items error:', error);
        res.status(500).json({ error: 'Server error fetching frequent items' });
    }
};

/**
 * Smart Search (items + restaurants)
 * GET /api/recommendations/search
 */
exports.search = (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }

        const userId = req.userId || null;
        const results = aiEngine.smartSearch(q, userId, parseInt(limit));

        // Separate results by type
        const items = results.filter(r => r.type === 'item');
        const restaurants = results.filter(r => r.type === 'restaurant');

        res.json({
            success: true,
            data: {
                items,
                restaurants,
                total: results.length
            },
            aiPowered: true
        });
    } catch (error) {
        console.error('Smart search error:', error);
        res.status(500).json({ error: 'Server error during search' });
    }
};

/**
 * Get Similar Items
 * GET /api/recommendations/similar/:itemId
 */
exports.getSimilar = (req, res) => {
    try {
        const { itemId } = req.params;
        const { limit = 5 } = req.query;

        const similarItems = aiEngine.getSimilarItems(itemId, parseInt(limit));

        res.json({
            success: true,
            data: similarItems
        });
    } catch (error) {
        console.error('Get similar items error:', error);
        res.status(500).json({ error: 'Server error fetching similar items' });
    }
};

/**
 * Get Trending Items (across all users)
 * GET /api/recommendations/trending
 */
exports.getTrending = (req, res) => {
    try {
        const { limit = 8 } = req.query;

        // For guest users, return popular items with some randomization
        const fs = require('fs');
        const path = require('path');

        const menuData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../data/menu.json'), 'utf8')
        );
        const restaurantsData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../data/restaurants.json'), 'utf8')
        );

        // Get bestsellers and highly rated items
        const trending = menuData.menuItems
            .filter(item => item.isBestseller || item.rating >= 4.4)
            .map(item => {
                const restaurant = restaurantsData.restaurants.find(r => r.id === item.restaurantId);
                return {
                    ...item,
                    restaurant: restaurant ? {
                        id: restaurant.id,
                        name: restaurant.name,
                        deliveryTime: restaurant.deliveryTime
                    } : null,
                    trendScore: (item.orderCount / 100) + (item.rating * 10) + (item.isBestseller ? 20 : 0)
                };
            })
            .sort((a, b) => b.trendScore - a.trendScore)
            .slice(0, parseInt(limit));

        res.json({
            success: true,
            data: trending
        });
    } catch (error) {
        console.error('Get trending error:', error);
        res.status(500).json({ error: 'Server error fetching trending items' });
    }
};

/**
 * Get For You (personalized for logged in, trending for guests)
 * GET /api/recommendations/for-you
 */
exports.getForYou = (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const userId = req.userId;

        if (userId) {
            // Personalized recommendations
            const recommendations = aiEngine.getPersonalizedRecommendations(userId, parseInt(limit));
            return res.json({
                success: true,
                data: recommendations,
                type: 'personalized'
            });
        }

        // For guests, return popular items
        const fs = require('fs');
        const path = require('path');

        const menuData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../data/menu.json'), 'utf8')
        );
        const restaurantsData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../data/restaurants.json'), 'utf8')
        );

        const popular = menuData.menuItems
            .filter(item => item.isBestseller)
            .map(item => {
                const restaurant = restaurantsData.restaurants.find(r => r.id === item.restaurantId);
                return {
                    ...item,
                    restaurant: restaurant ? {
                        name: restaurant.name,
                        id: restaurant.id
                    } : null
                };
            })
            .slice(0, parseInt(limit));

        res.json({
            success: true,
            data: popular,
            type: 'popular'
        });
    } catch (error) {
        console.error('Get for you error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
