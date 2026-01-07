/**
 * Restaurant Controller
 * Handles restaurant listing and details
 */

const fs = require('fs');
const path = require('path');
const aiEngine = require('../utils/aiEngine');

const dataPath = path.join(__dirname, '../data/restaurants.json');
const loadRestaurants = () => JSON.parse(fs.readFileSync(dataPath, 'utf8'));

/**
 * Get All Restaurants
 * GET /api/restaurants
 * Query params: rating, priceRange, cuisine, maxDeliveryTime, pureVeg, sort
 */
exports.getAll = (req, res) => {
    try {
        const {
            rating,
            priceRange,
            cuisine,
            maxDeliveryTime,
            pureVeg,
            sort,
            page = 1,
            limit = 12
        } = req.query;

        const userId = req.userId || null;

        // Use AI engine for smart sorting
        const filters = {
            minRating: rating ? parseFloat(rating) : null,
            priceRange: priceRange || null,
            cuisine: cuisine || null,
            maxDeliveryTime: maxDeliveryTime ? parseInt(maxDeliveryTime) : null,
            pureVeg: pureVeg === 'true'
        };

        let restaurants;

        if (sort === 'ai' || !sort) {
            // AI-powered relevance sorting
            restaurants = aiEngine.sortRestaurantsAI(userId, filters);
        } else {
            // Manual sorting
            const data = loadRestaurants();
            restaurants = data.restaurants;

            // Apply filters
            if (filters.minRating) {
                restaurants = restaurants.filter(r => r.rating >= filters.minRating);
            }
            if (filters.maxDeliveryTime) {
                restaurants = restaurants.filter(r =>
                    parseInt(r.deliveryTime.split('-')[0]) <= filters.maxDeliveryTime
                );
            }
            if (filters.pureVeg) {
                restaurants = restaurants.filter(r => r.isPureVeg);
            }
            if (filters.cuisine) {
                restaurants = restaurants.filter(r =>
                    r.cuisine.some(c => c.toLowerCase().includes(filters.cuisine.toLowerCase()))
                );
            }
            if (filters.priceRange) {
                restaurants = restaurants.filter(r => r.priceRange === filters.priceRange);
            }

            // Sort
            switch (sort) {
                case 'rating':
                    restaurants.sort((a, b) => b.rating - a.rating);
                    break;
                case 'deliveryTime':
                    restaurants.sort((a, b) =>
                        parseInt(a.deliveryTime) - parseInt(b.deliveryTime)
                    );
                    break;
                case 'popularity':
                    restaurants.sort((a, b) => b.ratingCount - a.ratingCount);
                    break;
            }
        }

        // Pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const paginatedRestaurants = restaurants.slice(startIndex, startIndex + parseInt(limit));

        res.json({
            success: true,
            data: paginatedRestaurants,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: restaurants.length,
                totalPages: Math.ceil(restaurants.length / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get restaurants error:', error);
        res.status(500).json({ error: 'Server error fetching restaurants' });
    }
};

/**
 * Get Single Restaurant
 * GET /api/restaurants/:id
 */
exports.getById = (req, res) => {
    try {
        const { id } = req.params;
        const data = loadRestaurants();
        const restaurant = data.restaurants.find(r => r.id === id);

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        res.json({
            success: true,
            data: restaurant
        });
    } catch (error) {
        console.error('Get restaurant error:', error);
        res.status(500).json({ error: 'Server error fetching restaurant' });
    }
};

/**
 * Search Restaurants
 * GET /api/restaurants/search?q=query
 */
exports.search = (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }

        const userId = req.userId || null;
        const results = aiEngine.smartSearch(q, userId, 20);

        // Filter only restaurant results
        const restaurants = results.filter(r => r.type === 'restaurant');

        res.json({
            success: true,
            data: restaurants,
            total: restaurants.length
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Server error during search' });
    }
};

/**
 * Get All Cuisines (for filters)
 * GET /api/restaurants/cuisines
 */
exports.getCuisines = (req, res) => {
    try {
        const data = loadRestaurants();
        const cuisinesSet = new Set();

        data.restaurants.forEach(r => {
            r.cuisine.forEach(c => cuisinesSet.add(c));
        });

        const cuisines = Array.from(cuisinesSet).sort();

        res.json({
            success: true,
            data: cuisines
        });
    } catch (error) {
        console.error('Get cuisines error:', error);
        res.status(500).json({ error: 'Server error fetching cuisines' });
    }
};
