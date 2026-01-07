/**
 * Menu Controller
 * Handles menu items for restaurants
 */

const fs = require('fs');
const path = require('path');
const aiEngine = require('../utils/aiEngine');

const menuPath = path.join(__dirname, '../data/menu.json');
const restaurantsPath = path.join(__dirname, '../data/restaurants.json');

const loadMenu = () => JSON.parse(fs.readFileSync(menuPath, 'utf8'));
const loadRestaurants = () => JSON.parse(fs.readFileSync(restaurantsPath, 'utf8'));

/**
 * Get Menu Items by Restaurant
 * GET /api/menu/:restaurantId
 */
exports.getByRestaurant = (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { category, sortBy } = req.query;

        // Verify restaurant exists
        const restaurantsData = loadRestaurants();
        const restaurant = restaurantsData.restaurants.find(r => r.id === restaurantId);

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const menuData = loadMenu();
        let items = menuData.menuItems.filter(item => item.restaurantId === restaurantId);

        // Filter by category
        if (category && category !== 'all') {
            items = items.filter(item =>
                item.category.toLowerCase() === category.toLowerCase()
            );
        }

        // Sort
        switch (sortBy) {
            case 'price-low':
                items.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                items.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                items.sort((a, b) => b.rating - a.rating);
                break;
            case 'popularity':
            default:
                // Sort by bestseller first, then by order count
                items.sort((a, b) => {
                    if (a.isBestseller && !b.isBestseller) return -1;
                    if (!a.isBestseller && b.isBestseller) return 1;
                    return b.orderCount - a.orderCount;
                });
        }

        // Get unique categories for this restaurant
        const categories = [...new Set(items.map(item => item.category))];

        // Group items by category
        const groupedMenu = categories.map(cat => ({
            category: cat,
            items: items.filter(item => item.category === cat)
        }));

        res.json({
            success: true,
            restaurant: {
                id: restaurant.id,
                name: restaurant.name,
                cuisine: restaurant.cuisine,
                rating: restaurant.rating,
                ratingCount: restaurant.ratingCount,
                deliveryTime: restaurant.deliveryTime,
                deliveryFee: restaurant.deliveryFee,
                minOrder: restaurant.minOrder,
                isPureVeg: restaurant.isPureVeg,
                coverImage: restaurant.coverImage,
                offers: restaurant.offers,
                address: restaurant.address
            },
            categories,
            groupedMenu,
            totalItems: items.length
        });
    } catch (error) {
        console.error('Get menu error:', error);
        res.status(500).json({ error: 'Server error fetching menu' });
    }
};

/**
 * Get Single Menu Item
 * GET /api/menu/item/:itemId
 */
exports.getItem = (req, res) => {
    try {
        const { itemId } = req.params;
        const menuData = loadMenu();
        const item = menuData.menuItems.find(i => i.id === itemId);

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const restaurantsData = loadRestaurants();
        const restaurant = restaurantsData.restaurants.find(r => r.id === item.restaurantId);

        res.json({
            success: true,
            data: {
                ...item,
                restaurant: restaurant ? {
                    id: restaurant.id,
                    name: restaurant.name,
                    deliveryTime: restaurant.deliveryTime
                } : null
            }
        });
    } catch (error) {
        console.error('Get item error:', error);
        res.status(500).json({ error: 'Server error fetching item' });
    }
};

/**
 * Get Popular Items (AI-ranked)
 * GET /api/menu/popular
 */
exports.getPopularItems = (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const menuData = loadMenu();
        const restaurantsData = loadRestaurants();

        // Rank items by a combination of order count, rating, and bestseller status
        const rankedItems = menuData.menuItems
            .map(item => {
                const restaurant = restaurantsData.restaurants.find(r => r.id === item.restaurantId);
                let score = 0;

                // Order count score (normalized)
                score += (item.orderCount / 1000) * 30;

                // Rating score
                score += (item.rating - 4) * 10;

                // Bestseller bonus
                if (item.isBestseller) score += 15;

                // Restaurant rating bonus
                if (restaurant) score += (restaurant.rating - 4) * 5;

                return {
                    ...item,
                    restaurant: restaurant ? {
                        id: restaurant.id,
                        name: restaurant.name,
                        deliveryTime: restaurant.deliveryTime
                    } : null,
                    popularityScore: score
                };
            })
            .sort((a, b) => b.popularityScore - a.popularityScore)
            .slice(0, parseInt(limit));

        res.json({
            success: true,
            data: rankedItems
        });
    } catch (error) {
        console.error('Get popular items error:', error);
        res.status(500).json({ error: 'Server error fetching popular items' });
    }
};

/**
 * Get Similar Items
 * GET /api/menu/similar/:itemId
 */
exports.getSimilarItems = (req, res) => {
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
 * Search Menu Items
 * GET /api/menu/search?q=query
 */
exports.searchItems = (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }

        const userId = req.userId || null;
        const results = aiEngine.smartSearch(q, userId, parseInt(limit) * 2);

        // Filter only item results
        const items = results.filter(r => r.type === 'item').slice(0, parseInt(limit));

        res.json({
            success: true,
            data: items,
            total: items.length
        });
    } catch (error) {
        console.error('Search items error:', error);
        res.status(500).json({ error: 'Server error during search' });
    }
};
