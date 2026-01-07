/**
 * Cart Controller
 * Handles shopping cart operations
 */

const fs = require('fs');
const path = require('path');

const cartsPath = path.join(__dirname, '../data/carts.json');
const menuPath = path.join(__dirname, '../data/menu.json');
const restaurantsPath = path.join(__dirname, '../data/restaurants.json');

const loadCarts = () => JSON.parse(fs.readFileSync(cartsPath, 'utf8'));
const saveCarts = (data) => fs.writeFileSync(cartsPath, JSON.stringify(data, null, 2));
const loadMenu = () => JSON.parse(fs.readFileSync(menuPath, 'utf8'));
const loadRestaurants = () => JSON.parse(fs.readFileSync(restaurantsPath, 'utf8'));

/**
 * Get User's Cart
 * GET /api/cart
 */
exports.getCart = (req, res) => {
    try {
        const cartsData = loadCarts();
        const cart = cartsData.carts.find(c => c.userId === req.userId);

        if (!cart || cart.items.length === 0) {
            return res.json({
                success: true,
                data: {
                    items: [],
                    restaurantId: null,
                    restaurant: null,
                    subtotal: 0,
                    deliveryFee: 0,
                    taxes: 0,
                    total: 0
                }
            });
        }

        // Get restaurant details
        const restaurantsData = loadRestaurants();
        const restaurant = restaurantsData.restaurants.find(r => r.id === cart.restaurantId);

        // Calculate totals
        const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = restaurant ? restaurant.deliveryFee : 0;
        const taxes = Math.round(subtotal * 0.05); // 5% tax
        const total = subtotal + deliveryFee + taxes;

        res.json({
            success: true,
            data: {
                ...cart,
                restaurant: restaurant ? {
                    id: restaurant.id,
                    name: restaurant.name,
                    image: restaurant.image,
                    deliveryTime: restaurant.deliveryTime,
                    minOrder: restaurant.minOrder
                } : null,
                subtotal,
                deliveryFee,
                taxes,
                total,
                meetsMinOrder: restaurant ? subtotal >= restaurant.minOrder : true
            }
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Server error fetching cart' });
    }
};

/**
 * Add Item to Cart
 * POST /api/cart/add
 */
exports.addItem = (req, res) => {
    try {
        const { itemId, quantity = 1 } = req.body;

        if (!itemId) {
            return res.status(400).json({ error: 'Item ID is required' });
        }

        // Get item details
        const menuData = loadMenu();
        const item = menuData.menuItems.find(i => i.id === itemId);

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const cartsData = loadCarts();
        let cart = cartsData.carts.find(c => c.userId === req.userId);

        // If cart exists and is from a different restaurant, clear it
        if (cart && cart.restaurantId && cart.restaurantId !== item.restaurantId) {
            return res.status(400).json({
                error: 'Cart contains items from another restaurant',
                currentRestaurantId: cart.restaurantId,
                newRestaurantId: item.restaurantId,
                action: 'clear_required'
            });
        }

        if (!cart) {
            cart = {
                userId: req.userId,
                restaurantId: item.restaurantId,
                items: []
            };
            cartsData.carts.push(cart);
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(i => i.itemId === itemId);

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                itemId: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                isVeg: item.isVeg,
                quantity
            });
        }

        cart.restaurantId = item.restaurantId;

        // Update cart in data
        const cartIndex = cartsData.carts.findIndex(c => c.userId === req.userId);
        if (cartIndex > -1) {
            cartsData.carts[cartIndex] = cart;
        }

        saveCarts(cartsData);

        // Return updated cart
        const restaurantsData = loadRestaurants();
        const restaurant = restaurantsData.restaurants.find(r => r.id === cart.restaurantId);
        const subtotal = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

        res.json({
            success: true,
            message: 'Item added to cart',
            data: {
                itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
                subtotal,
                restaurantName: restaurant ? restaurant.name : null
            }
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Server error adding to cart' });
    }
};

/**
 * Update Item Quantity
 * PUT /api/cart/update
 */
exports.updateQuantity = (req, res) => {
    try {
        const { itemId, quantity } = req.body;

        if (!itemId || quantity === undefined) {
            return res.status(400).json({ error: 'Item ID and quantity are required' });
        }

        const cartsData = loadCarts();
        const cartIndex = cartsData.carts.findIndex(c => c.userId === req.userId);

        if (cartIndex === -1) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const cart = cartsData.carts[cartIndex];
        const itemIndex = cart.items.findIndex(i => i.itemId === itemId);

        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not in cart' });
        }

        if (quantity <= 0) {
            // Remove item
            cart.items.splice(itemIndex, 1);

            // If cart is empty, remove restaurant association
            if (cart.items.length === 0) {
                cart.restaurantId = null;
            }
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        saveCarts(cartsData);

        const subtotal = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

        res.json({
            success: true,
            message: 'Cart updated',
            data: {
                itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
                subtotal
            }
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ error: 'Server error updating cart' });
    }
};

/**
 * Remove Item from Cart
 * DELETE /api/cart/item/:itemId
 */
exports.removeItem = (req, res) => {
    try {
        const { itemId } = req.params;

        const cartsData = loadCarts();
        const cartIndex = cartsData.carts.findIndex(c => c.userId === req.userId);

        if (cartIndex === -1) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const cart = cartsData.carts[cartIndex];
        const itemIndex = cart.items.findIndex(i => i.itemId === itemId);

        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not in cart' });
        }

        cart.items.splice(itemIndex, 1);

        if (cart.items.length === 0) {
            cart.restaurantId = null;
        }

        saveCarts(cartsData);

        res.json({
            success: true,
            message: 'Item removed from cart'
        });
    } catch (error) {
        console.error('Remove item error:', error);
        res.status(500).json({ error: 'Server error removing item' });
    }
};

/**
 * Clear Cart
 * DELETE /api/cart
 */
exports.clearCart = (req, res) => {
    try {
        const cartsData = loadCarts();
        const cartIndex = cartsData.carts.findIndex(c => c.userId === req.userId);

        if (cartIndex > -1) {
            cartsData.carts[cartIndex] = {
                userId: req.userId,
                restaurantId: null,
                items: []
            };
            saveCarts(cartsData);
        }

        res.json({
            success: true,
            message: 'Cart cleared'
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ error: 'Server error clearing cart' });
    }
};
