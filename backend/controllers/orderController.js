/**
 * Order Controller
 * Handles order creation and history
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const aiEngine = require('../utils/aiEngine');

const ordersPath = path.join(__dirname, '../data/orders.json');
const cartsPath = path.join(__dirname, '../data/carts.json');
const menuPath = path.join(__dirname, '../data/menu.json');
const restaurantsPath = path.join(__dirname, '../data/restaurants.json');

const loadOrders = () => JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
const saveOrders = (data) => fs.writeFileSync(ordersPath, JSON.stringify(data, null, 2));
const loadCarts = () => JSON.parse(fs.readFileSync(cartsPath, 'utf8'));
const saveCarts = (data) => fs.writeFileSync(cartsPath, JSON.stringify(data, null, 2));
const loadRestaurants = () => JSON.parse(fs.readFileSync(restaurantsPath, 'utf8'));
const loadMenu = () => JSON.parse(fs.readFileSync(menuPath, 'utf8'));

/**
 * Create Order from Cart
 * POST /api/orders
 */
exports.create = (req, res) => {
    try {
        const { paymentMethod, addressId } = req.body;

        if (!paymentMethod) {
            return res.status(400).json({ error: 'Payment method is required' });
        }

        // Get user's cart
        const cartsData = loadCarts();
        const cart = cartsData.carts.find(c => c.userId === req.userId);

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Get restaurant and delivery address
        const restaurantsData = loadRestaurants();
        const restaurant = restaurantsData.restaurants.find(r => r.id === cart.restaurantId);

        let deliveryAddress = null;
        if (addressId) {
            deliveryAddress = req.user.addresses.find(a => a.id === addressId);
        } else {
            deliveryAddress = req.user.addresses.find(a => a.isDefault) || req.user.addresses[0];
        }

        if (!deliveryAddress && req.user.addresses.length > 0) {
            deliveryAddress = req.user.addresses[0];
        }

        // Calculate totals
        const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = restaurant ? restaurant.deliveryFee : 30;
        const taxes = Math.round(subtotal * 0.05);
        const total = subtotal + deliveryFee + taxes;

        // Check minimum order
        if (restaurant && subtotal < restaurant.minOrder) {
            return res.status(400).json({
                error: `Minimum order amount is ₹${restaurant.minOrder}`,
                currentAmount: subtotal
            });
        }

        // Simulate payment (in real app, integrate payment gateway)
        const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo

        if (!paymentSuccess && paymentMethod !== 'COD') {
            return res.status(400).json({
                error: 'Payment failed. Please try again.',
                paymentStatus: 'failed'
            });
        }

        // Create order
        const ordersData = loadOrders();
        const newOrder = {
            id: `order${uuidv4().substring(0, 8)}`,
            userId: req.userId,
            restaurantId: cart.restaurantId,
            restaurantName: restaurant ? restaurant.name : 'Unknown',
            items: cart.items.map(item => ({
                itemId: item.itemId,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            subtotal,
            deliveryFee,
            taxes,
            total,
            status: 'confirmed',
            deliveryAddress: deliveryAddress || {
                type: 'Default',
                address: 'Address not specified',
                city: 'Unknown'
            },
            paymentMethod,
            orderedAt: new Date().toISOString(),
            estimatedDelivery: restaurant
                ? new Date(Date.now() + parseInt(restaurant.deliveryTime) * 60 * 1000).toISOString()
                : new Date(Date.now() + 30 * 60 * 1000).toISOString()
        };

        ordersData.orders.push(newOrder);
        saveOrders(ordersData);

        // Clear cart
        const cartIndex = cartsData.carts.findIndex(c => c.userId === req.userId);
        if (cartIndex > -1) {
            cartsData.carts[cartIndex] = {
                userId: req.userId,
                restaurantId: null,
                items: []
            };
            saveCarts(cartsData);
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: newOrder
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Server error creating order' });
    }
};

/**
 * Get All Orders for User
 * GET /api/orders
 */
exports.getAll = (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const ordersData = loadOrders();

        let userOrders = ordersData.orders
            .filter(o => o.userId === req.userId)
            .sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));

        if (status) {
            userOrders = userOrders.filter(o => o.status === status);
        }

        // Pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const paginatedOrders = userOrders.slice(startIndex, startIndex + parseInt(limit));

        res.json({
            success: true,
            data: paginatedOrders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: userOrders.length,
                totalPages: Math.ceil(userOrders.length / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Server error fetching orders' });
    }
};

/**
 * Get Single Order
 * GET /api/orders/:orderId
 */
exports.getById = (req, res) => {
    try {
        const { orderId } = req.params;
        const ordersData = loadOrders();

        const order = ordersData.orders.find(o =>
            o.id === orderId && o.userId === req.userId
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Get restaurant details
        const restaurantsData = loadRestaurants();
        const restaurant = restaurantsData.restaurants.find(r => r.id === order.restaurantId);

        res.json({
            success: true,
            data: {
                ...order,
                restaurant: restaurant ? {
                    id: restaurant.id,
                    name: restaurant.name,
                    image: restaurant.image,
                    phone: restaurant.phone
                } : null
            }
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Server error fetching order' });
    }
};

/**
 * Reorder - Add items from past order to cart
 * POST /api/orders/:orderId/reorder
 */
exports.reorder = (req, res) => {
    try {
        const { orderId } = req.params;
        const ordersData = loadOrders();

        const order = ordersData.orders.find(o =>
            o.id === orderId && o.userId === req.userId
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if items are still available
        const menuData = loadMenu();
        const availableItems = [];
        const unavailableItems = [];

        order.items.forEach(orderItem => {
            const currentItem = menuData.menuItems.find(i => i.id === orderItem.itemId);
            if (currentItem) {
                availableItems.push({
                    itemId: currentItem.id,
                    name: currentItem.name,
                    price: currentItem.price,
                    image: currentItem.image,
                    isVeg: currentItem.isVeg,
                    quantity: orderItem.quantity,
                    priceChanged: currentItem.price !== orderItem.price,
                    oldPrice: orderItem.price
                });
            } else {
                unavailableItems.push(orderItem);
            }
        });

        if (availableItems.length === 0) {
            return res.status(400).json({
                error: 'None of the items from this order are available',
                unavailableItems
            });
        }

        // Clear existing cart and add reorder items
        const cartsData = loadCarts();
        const cartIndex = cartsData.carts.findIndex(c => c.userId === req.userId);

        const newCart = {
            userId: req.userId,
            restaurantId: order.restaurantId,
            items: availableItems.map(item => ({
                itemId: item.itemId,
                name: item.name,
                price: item.price,
                image: item.image,
                isVeg: item.isVeg,
                quantity: item.quantity
            }))
        };

        if (cartIndex > -1) {
            cartsData.carts[cartIndex] = newCart;
        } else {
            cartsData.carts.push(newCart);
        }

        saveCarts(cartsData);

        res.json({
            success: true,
            message: 'Items added to cart',
            data: {
                addedItems: availableItems.length,
                unavailableItems: unavailableItems.length,
                priceChanges: availableItems.filter(i => i.priceChanged).map(i => ({
                    name: i.name,
                    oldPrice: i.oldPrice,
                    newPrice: i.price
                }))
            }
        });
    } catch (error) {
        console.error('Reorder error:', error);
        res.status(500).json({ error: 'Server error processing reorder' });
    }
};

/**
 * Get Reorder Suggestions
 * GET /api/orders/reorder-suggestions
 */
exports.getReorderSuggestions = (req, res) => {
    try {
        const suggestions = aiEngine.getReorderSuggestions(req.userId);

        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        console.error('Reorder suggestions error:', error);
        res.status(500).json({ error: 'Server error fetching suggestions' });
    }
};

/**
 * Cancel Order (within 5 minutes)
 * POST /api/orders/:orderId/cancel
 */
exports.cancel = (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;

        const ordersData = loadOrders();
        const orderIndex = ordersData.orders.findIndex(o =>
            o.id === orderId && o.userId === req.userId
        );

        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = ordersData.orders[orderIndex];

        // Check if order can be cancelled (within 5 minutes)
        const orderTime = new Date(order.orderedAt);
        const now = new Date();
        const minutesElapsed = (now - orderTime) / (1000 * 60);

        if (minutesElapsed > 5) {
            return res.status(400).json({
                error: 'Order can only be cancelled within 5 minutes of placing'
            });
        }

        if (order.status !== 'confirmed') {
            return res.status(400).json({
                error: 'Only confirmed orders can be cancelled'
            });
        }

        order.status = 'cancelled';
        order.cancelledAt = now.toISOString();
        order.cancelReason = reason || 'User cancelled';

        saveOrders(ordersData);

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ error: 'Server error cancelling order' });
    }
};
