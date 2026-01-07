/**
 * AI Engine - ZeeFast Recommendation System
 * Pure JavaScript implementation without ML libraries
 */

const fs = require('fs');
const path = require('path');

// Load data files
const loadData = (filename) => {
    const filePath = path.join(__dirname, '../data', filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

/**
 * Calculate Levenshtein distance for fuzzy search
 */
const levenshteinDistance = (str1, str2) => {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1].toLowerCase() === str2[j - 1].toLowerCase()) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }
    return dp[m][n];
};

/**
 * Get personalized recommendations based on user's order history and preferences
 * 
 * Algorithm:
 * 1. Analyze user's past orders to find frequently ordered cuisines
 * 2. Weight by recency (recent orders have more weight)
 * 3. Consider time of day for meal suggestions
 * 4. Factor in user's explicit preferences
 * 5. Add popularity scores from overall data
 */
const getPersonalizedRecommendations = (userId, limit = 10) => {
    const { users } = loadData('users.json');
    const { orders } = loadData('orders.json');
    const { menuItems } = loadData('menu.json');
    const { restaurants } = loadData('restaurants.json');

    const user = users.find(u => u.id === userId);
    const userOrders = orders.filter(o => o.userId === userId && o.status === 'delivered');

    // Calculate cuisine preferences from order history
    const cuisineScores = {};
    const itemScores = {};
    const now = new Date();

    userOrders.forEach((order, index) => {
        const orderDate = new Date(order.orderedAt);
        const daysSinceOrder = (now - orderDate) / (1000 * 60 * 60 * 24);

        // Exponential decay - recent orders have more weight
        const recencyWeight = Math.exp(-daysSinceOrder / 30);

        // Find restaurant cuisine
        const restaurant = restaurants.find(r => r.id === order.restaurantId);
        if (restaurant) {
            restaurant.cuisine.forEach(cuisine => {
                cuisineScores[cuisine] = (cuisineScores[cuisine] || 0) + recencyWeight;
            });
        }

        // Track ordered items
        order.items.forEach(item => {
            itemScores[item.itemId] = (itemScores[item.itemId] || 0) + (recencyWeight * item.quantity);
        });
    });

    // Add user's explicit preferences
    if (user && user.preferences && user.preferences.cuisines) {
        user.preferences.cuisines.forEach(cuisine => {
            cuisineScores[cuisine] = (cuisineScores[cuisine] || 0) + 2; // Boost explicit preferences
        });
    }

    // Time-of-day factor
    const hour = new Date().getHours();
    let mealType = 'any';
    if (hour >= 6 && hour < 11) mealType = 'Breakfast';
    else if (hour >= 11 && hour < 15) mealType = 'Lunch';
    else if (hour >= 15 && hour < 18) mealType = 'Snacks';
    else if (hour >= 18 && hour < 22) mealType = 'Dinner';
    else mealType = 'Late Night';

    // Score all menu items
    const scoredItems = menuItems.map(item => {
        const restaurant = restaurants.find(r => r.id === item.restaurantId);
        let score = 0;

        // Cuisine match (40% weight)
        if (restaurant) {
            restaurant.cuisine.forEach(cuisine => {
                score += (cuisineScores[cuisine] || 0) * 0.4;
            });
        }

        // Previously ordered items get boost (30% weight)
        score += (itemScores[item.id] || 0) * 0.3;

        // Time of day relevance (20% weight)
        if (item.category.toLowerCase().includes(mealType.toLowerCase())) {
            score += 0.2;
        }
        if (mealType === 'Breakfast' && ['Breakfast', 'Beverages'].includes(item.category)) {
            score += 0.2;
        }
        if (mealType === 'Snacks' && ['Snacks', 'Starters'].includes(item.category)) {
            score += 0.2;
        }

        // Popularity score (10% weight)
        score += (item.orderCount / 1000) * 0.1;

        // Bestseller bonus
        if (item.isBestseller) score += 0.15;

        // Rating bonus
        score += (item.rating - 4) * 0.1;

        return {
            ...item,
            restaurant: restaurant ? { name: restaurant.name, rating: restaurant.rating } : null,
            score
        };
    });

    // Handle vegetarian preference
    let filteredItems = scoredItems;
    if (user && user.preferences && user.preferences.dietaryRestrictions) {
        if (user.preferences.dietaryRestrictions.includes('vegetarian')) {
            filteredItems = scoredItems.filter(item => item.isVeg);
        }
    }

    // Sort by score and return top items
    return filteredItems
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
};

/**
 * Smart search with autocomplete and fuzzy matching
 */
const smartSearch = (query, userId = null, limit = 10) => {
    const { menuItems } = loadData('menu.json');
    const { restaurants } = loadData('restaurants.json');
    const { orders } = loadData('orders.json');

    const queryLower = query.toLowerCase();
    const results = [];

    // Search menu items
    menuItems.forEach(item => {
        let score = 0;
        const nameLower = item.name.toLowerCase();
        const categoryLower = item.category.toLowerCase();

        // Exact match gets highest score
        if (nameLower === queryLower) {
            score = 100;
        }
        // Starts with query
        else if (nameLower.startsWith(queryLower)) {
            score = 80;
        }
        // Contains query
        else if (nameLower.includes(queryLower)) {
            score = 60;
        }
        // Category match
        else if (categoryLower.includes(queryLower)) {
            score = 40;
        }
        // Fuzzy match
        else {
            const distance = levenshteinDistance(queryLower, nameLower.substring(0, queryLower.length));
            if (distance <= 2) {
                score = 30 - (distance * 10);
            }
        }

        if (score > 0) {
            // Boost based on popularity
            score += item.orderCount / 100;

            // Boost if user ordered this before
            if (userId) {
                const userOrders = orders.filter(o => o.userId === userId);
                const orderedBefore = userOrders.some(o =>
                    o.items.some(i => i.itemId === item.id)
                );
                if (orderedBefore) score += 20;
            }

            const restaurant = restaurants.find(r => r.id === item.restaurantId);
            results.push({
                type: 'item',
                ...item,
                restaurant: restaurant ? { name: restaurant.name, id: restaurant.id } : null,
                score
            });
        }
    });

    // Search restaurants
    restaurants.forEach(restaurant => {
        let score = 0;
        const nameLower = restaurant.name.toLowerCase();
        const cuisines = restaurant.cuisine.map(c => c.toLowerCase());

        if (nameLower === queryLower) {
            score = 100;
        } else if (nameLower.startsWith(queryLower)) {
            score = 80;
        } else if (nameLower.includes(queryLower)) {
            score = 60;
        } else if (cuisines.some(c => c.includes(queryLower))) {
            score = 50;
        } else {
            const distance = levenshteinDistance(queryLower, nameLower.substring(0, queryLower.length));
            if (distance <= 2) {
                score = 30 - (distance * 10);
            }
        }

        if (score > 0) {
            score += restaurant.rating * 5;
            results.push({
                type: 'restaurant',
                ...restaurant,
                score
            });
        }
    });

    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
};

/**
 * Get frequently ordered items for a user
 */
const getFrequentlyOrdered = (userId, limit = 5) => {
    const { orders } = loadData('orders.json');
    const { menuItems } = loadData('menu.json');
    const { restaurants } = loadData('restaurants.json');

    const userOrders = orders.filter(o => o.userId === userId && o.status === 'delivered');
    const itemCounts = {};

    userOrders.forEach(order => {
        order.items.forEach(item => {
            itemCounts[item.itemId] = (itemCounts[item.itemId] || 0) + item.quantity;
        });
    });

    const sortedItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

    return sortedItems.map(([itemId, count]) => {
        const item = menuItems.find(i => i.id === itemId);
        if (item) {
            const restaurant = restaurants.find(r => r.id === item.restaurantId);
            return {
                ...item,
                orderCount: count,
                restaurant: restaurant ? { name: restaurant.name, id: restaurant.id } : null
            };
        }
        return null;
    }).filter(Boolean);
};

/**
 * Get similar items based on a given item
 */
const getSimilarItems = (itemId, limit = 5) => {
    const { menuItems } = loadData('menu.json');
    const { restaurants } = loadData('restaurants.json');

    const sourceItem = menuItems.find(i => i.id === itemId);
    if (!sourceItem) return [];

    const sourceRestaurant = restaurants.find(r => r.id === sourceItem.restaurantId);

    const scoredItems = menuItems
        .filter(item => item.id !== itemId)
        .map(item => {
            let score = 0;
            const restaurant = restaurants.find(r => r.id === item.restaurantId);

            // Same category
            if (item.category === sourceItem.category) {
                score += 30;
            }

            // Same restaurant cuisine
            if (restaurant && sourceRestaurant) {
                const commonCuisines = restaurant.cuisine.filter(c =>
                    sourceRestaurant.cuisine.includes(c)
                );
                score += commonCuisines.length * 10;
            }

            // Similar price range (within 30%)
            const priceDiff = Math.abs(item.price - sourceItem.price) / sourceItem.price;
            if (priceDiff <= 0.3) {
                score += 20 * (1 - priceDiff);
            }

            // Same veg/non-veg
            if (item.isVeg === sourceItem.isVeg) {
                score += 10;
            }

            // Popularity bonus
            score += (item.rating - 4) * 5;

            return {
                ...item,
                restaurant: restaurant ? { name: restaurant.name, id: restaurant.id } : null,
                score
            };
        });

    return scoredItems
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
};

/**
 * Get reorder suggestions (last 5 orders)
 */
const getReorderSuggestions = (userId) => {
    const { orders } = loadData('orders.json');
    const { menuItems } = loadData('menu.json');
    const { restaurants } = loadData('restaurants.json');

    const userOrders = orders
        .filter(o => o.userId === userId && o.status === 'delivered')
        .sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt))
        .slice(0, 5);

    return userOrders.map(order => {
        const restaurant = restaurants.find(r => r.id === order.restaurantId);

        // Check if all items are still available and get current prices
        const updatedItems = order.items.map(orderItem => {
            const currentItem = menuItems.find(i => i.id === orderItem.itemId);
            return {
                ...orderItem,
                currentPrice: currentItem ? currentItem.price : null,
                available: !!currentItem,
                priceChanged: currentItem && currentItem.price !== orderItem.price
            };
        });

        const allAvailable = updatedItems.every(i => i.available);
        const newTotal = updatedItems.reduce((sum, item) =>
            sum + (item.currentPrice || item.price) * item.quantity, 0
        );

        return {
            orderId: order.id,
            restaurant: restaurant ? {
                id: restaurant.id,
                name: restaurant.name,
                image: restaurant.image
            } : null,
            items: updatedItems,
            originalTotal: order.total,
            currentTotal: newTotal + order.deliveryFee + Math.round(newTotal * 0.05),
            orderedAt: order.orderedAt,
            allItemsAvailable: allAvailable,
            priceChange: newTotal !== order.subtotal
        };
    });
};

/**
 * AI-assisted restaurant sorting
 */
const sortRestaurantsAI = (userId = null, filters = {}) => {
    const { restaurants } = loadData('restaurants.json');
    const { orders } = loadData('orders.json');
    const { users } = loadData('users.json');

    let scoredRestaurants = restaurants.map(restaurant => {
        let score = 0;

        // Base rating score (normalized to 0-25)
        score += (restaurant.rating - 3) * 12.5;

        // Delivery time score (faster = better, max 20)
        const avgDeliveryTime = parseInt(restaurant.deliveryTime.split('-')[0]);
        score += Math.max(0, 20 - (avgDeliveryTime / 3));

        // Price preference matching (if specified)
        if (filters.priceRange) {
            if (restaurant.priceRange === filters.priceRange) {
                score += 15;
            }
        }

        // User history boost
        if (userId) {
            const userOrders = orders.filter(o => o.userId === userId);
            const orderedFromBefore = userOrders.some(o => o.restaurantId === restaurant.id);
            if (orderedFromBefore) score += 10;

            // Cuisine preference match
            const user = users.find(u => u.id === userId);
            if (user && user.preferences && user.preferences.cuisines) {
                const matchingCuisines = restaurant.cuisine.filter(c =>
                    user.preferences.cuisines.includes(c)
                );
                score += matchingCuisines.length * 5;
            }
        }

        // Trending/popular boost
        if (restaurant.tags.includes('Trending') || restaurant.tags.includes('Bestseller')) {
            score += 8;
        }

        // Open status
        if (!restaurant.isOpen) {
            score -= 50;
        }

        // Has offers
        if (restaurant.offers && restaurant.offers.length > 0) {
            score += 5;
        }

        return { ...restaurant, aiScore: score };
    });

    // Apply filters
    if (filters.minRating) {
        scoredRestaurants = scoredRestaurants.filter(r => r.rating >= filters.minRating);
    }
    if (filters.maxDeliveryTime) {
        scoredRestaurants = scoredRestaurants.filter(r =>
            parseInt(r.deliveryTime.split('-')[0]) <= filters.maxDeliveryTime
        );
    }
    if (filters.pureVeg) {
        scoredRestaurants = scoredRestaurants.filter(r => r.isPureVeg);
    }
    if (filters.cuisine) {
        scoredRestaurants = scoredRestaurants.filter(r =>
            r.cuisine.some(c => c.toLowerCase().includes(filters.cuisine.toLowerCase()))
        );
    }

    return scoredRestaurants.sort((a, b) => b.aiScore - a.aiScore);
};

module.exports = {
    getPersonalizedRecommendations,
    smartSearch,
    getFrequentlyOrdered,
    getSimilarItems,
    getReorderSuggestions,
    sortRestaurantsAI,
    levenshteinDistance
};
