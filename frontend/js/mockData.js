/**
 * ZeeFast - Mock Data Service
 * Provides sample data when backend is not available
 */

const MockData = {
    // Sample Restaurants
    restaurants: [
        {
            id: '1',
            name: 'Biryani Palace',
            "image": "https://www.victoriabuzz.com/wp-content/uploads/2022/12/Biryani-Palace-scaled-e1672167170593-1920x1347.jpg",
            "coverImage": "https://www.victoriabuzz.com/wp-content/uploads/2022/12/Biryani-Palace-scaled-e1672167170593-1920x1347.jpg",
            cuisine: ['Biryani', 'Mughlai', 'North Indian'],
            rating: 4.5,
            ratingCount: 1250,
            deliveryTime: '30-35 min',
            deliveryFee: 30,
            isPureVeg: false,
            offers: ['50% OFF up to ₹100', 'Free delivery on orders above ₹199']
        },
        {
            id: '2',
            name: 'Pizza Paradise',
            image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/3c/c0/31/paradise-pizza.jpg?w=1200&h=-1&s=1',
            coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/3c/c0/31/paradise-pizza.jpg?w=1200&h=-1&s=1',
            cuisine: ['Pizza', 'Italian', 'Fast Food'],
            rating: 4.3,
            ratingCount: 890,
            deliveryTime: '25-30 min',
            deliveryFee: 25,
            isPureVeg: false,
            offers: ['Buy 1 Get 1 Free']
        },
        {
            id: '3',
            name: 'Burger Kingdom',
            image: 'https://media-cdn.tripadvisor.com/media/photo-s/0c/9a/a6/70/photo0jpg.jpg',
            coverImage: 'https://media-cdn.tripadvisor.com/media/photo-s/0c/9a/a6/70/photo0jpg.jpg',
            cuisine: ['Burgers', 'American', 'Fast Food'],
            rating: 4.2,
            ratingCount: 720,
            deliveryTime: '20-25 min',
            deliveryFee: 20,
            isPureVeg: false,
            offers: ['Flat ₹50 OFF on first order']
        },
        {
            id: '4',
            name: 'Dragon Wok',
            image: 'https://s3-media0.fl.yelpcdn.com/bphoto/Vd7W5cSZBnzqk-MJs59GDw/l.jpg',
            coverImage: 'https://s3-media0.fl.yelpcdn.com/bphoto/Vd7W5cSZBnzqk-MJs59GDw/l.jpg',
            cuisine: ['Chinese', 'Asian', 'Thai'],
            rating: 4.4,
            ratingCount: 650,
            deliveryTime: '35-40 min',
            deliveryFee: 35,
            isPureVeg: false,
            offers: ['20% OFF on orders above ₹300']
        },
        {
            id: '5',
            name: 'Sweet Delights',
            image: 'https://th.bing.com/th/id/R.6539c37cc2e4ebbf06b52298657b3e13?rik=V%2f4zG0997qNxSA&riu=http%3a%2f%2fsweettoothcandyshoppe.com%2fuploads%2f1%2f3%2f0%2f0%2f130005242%2fmsh-8073_orig.jpg&ehk=6ainjgkpy%2bjfyduiv4MHMgrs%2bPtJIrWOZ5e3TsuCYvI%3d&risl=&pid=ImgRaw&r=0',
            coverImage: 'https://th.bing.com/th/id/R.6539c37cc2e4ebbf06b52298657b3e13?rik=V%2f4zG0997qNxSA&riu=http%3a%2f%2fsweettoothcandyshoppe.com%2fuploads%2f1%2f3%2f0%2f0%2f130005242%2fmsh-8073_orig.jpg&ehk=6ainjgkpy%2bjfyduiv4MHMgrs%2bPtJIrWOZ5e3TsuCYvI%3d&risl=&pid=ImgRaw&r=0',
            cuisine: ['Desserts', 'Ice Cream', 'Bakery'],
            rating: 4.6,
            ratingCount: 520,
            deliveryTime: '15-20 min',
            deliveryFee: 15,
            isPureVeg: true,
            offers: ['Free dessert on orders above ₹250']
        },
        {
            id: '6',
            name: 'Dosa House',
            image: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/NYC_DosaDelight_Exteriors_AlexStaniloff-1_oazhwt',
            coverImage: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/NYC_DosaDelight_Exteriors_AlexStaniloff-1_oazhwt',
            cuisine: ['South Indian', 'Dosa', 'Idli'],
            rating: 4.7,
            ratingCount: 1100,
            deliveryTime: '25-30 min',
            deliveryFee: 20,
            isPureVeg: true,
            offers: ['Flat 30% OFF']
        },
        {
            id: '7',
            name: 'Tandoor Express',
            image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
            coverImage: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600',
            cuisine: ['North Indian', 'Tandoori', 'Kebabs'],
            rating: 4.1,
            ratingCount: 430,
            deliveryTime: '40-45 min',
            deliveryFee: 40,
            isPureVeg: false,
            offers: ['15% OFF on all orders']
        },
        {
            id: '8',
            name: 'Pasta Point',
            image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
            coverImage: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600',
            cuisine: ['Italian', 'Pasta', 'Continental'],
            rating: 4.0,
            ratingCount: 310,
            deliveryTime: '30-35 min',
            deliveryFee: 30,
            isPureVeg: false,
            offers: ['Combo meal at ₹199']
        }
    ],

    // Sample Menu Items
    menuItems: {
        '1': [
            { id: 'm1', name: 'Chicken Biryani', description: 'Aromatic basmati rice cooked with tender chicken pieces', price: 299, originalPrice: 349, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200', isVeg: false, isBestseller: true, category: 'Biryani' },
            { id: 'm2', name: 'Mutton Biryani', description: 'Premium mutton pieces with fragrant long grain rice', price: 399, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200', isVeg: false, isBestseller: true, category: 'Biryani' },
            { id: 'm3', name: 'Veg Biryani', description: 'Mixed vegetables cooked in aromatic spices', price: 199, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200', isVeg: true, isBestseller: false, category: 'Biryani' },
            { id: 'm4', name: 'Butter Chicken', description: 'Creamy tomato based curry with tender chicken', price: 279, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200', isVeg: false, isBestseller: true, category: 'Main Course' },
            { id: 'm5', name: 'Dal Makhani', description: 'Slow cooked black lentils in creamy gravy', price: 179, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200', isVeg: true, isBestseller: false, category: 'Main Course' }
        ],
        '2': [
            { id: 'p1', name: 'Margherita Pizza', description: 'Classic cheese pizza with fresh basil', price: 249, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200', isVeg: true, isBestseller: true, category: 'Pizza' },
            { id: 'p2', name: 'Pepperoni Pizza', description: 'Loaded with spicy pepperoni slices', price: 349, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=200', isVeg: false, isBestseller: true, category: 'Pizza' },
            { id: 'p3', name: 'BBQ Chicken Pizza', description: 'Smoky BBQ sauce with grilled chicken', price: 379, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200', isVeg: false, isBestseller: false, category: 'Pizza' },
            { id: 'p4', name: 'Garlic Bread', description: 'Crispy bread with garlic butter', price: 99, image: 'https://images.unsplash.com/photo-1619531040576-f9416abb7b69?w=200', isVeg: true, isBestseller: false, category: 'Sides' }
        ],
        '3': [
            { id: 'b1', name: 'Classic Burger', description: 'Juicy beef patty with fresh veggies', price: 149, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200', isVeg: false, isBestseller: true, category: 'Burgers' },
            { id: 'b2', name: 'Cheese Burger', description: 'Double cheese with crispy patty', price: 179, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=200', isVeg: false, isBestseller: true, category: 'Burgers' },
            { id: 'b3', name: 'Veg Burger', description: 'Crispy vegetable patty with special sauce', price: 129, image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=200', isVeg: true, isBestseller: false, category: 'Burgers' },
            { id: 'b4', name: 'French Fries', description: 'Crispy golden fries with seasoning', price: 79, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=200', isVeg: true, isBestseller: false, category: 'Sides' }
        ],
        '4': [
            { id: 'c1', name: 'Kung Pao Chicken', description: 'Spicy stir-fried chicken with peanuts', price: 249, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200', isVeg: false, isBestseller: true, category: 'Main Course' },
            { id: 'c2', name: 'Veg Manchurian', description: 'Crispy vegetable balls in tangy sauce', price: 179, image: 'https://images.unsplash.com/photo-1645696301019-35adcc18fc77?w=200', isVeg: true, isBestseller: true, category: 'Starters' },
            { id: 'c3', name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables', price: 149, image: 'https://images.unsplash.com/photo-1569718212165-3a8278D5F624?w=200', isVeg: true, isBestseller: false, category: 'Noodles' },
            { id: 'c4', name: 'Spring Rolls', description: 'Crispy rolls with vegetable filling', price: 99, image: 'https://images.unsplash.com/photo-1548507200-e5c341dc5c9a?w=200', isVeg: true, isBestseller: false, category: 'Starters' }
        ],
        '5': [
            { id: 'd1', name: 'Chocolate Brownie', description: 'Rich and fudgy chocolate brownie', price: 129, image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=200', isVeg: true, isBestseller: true, category: 'Desserts' },
            { id: 'd2', name: 'Vanilla Ice Cream', description: 'Creamy vanilla ice cream scoop', price: 79, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200', isVeg: true, isBestseller: true, category: 'Ice Cream' },
            { id: 'd3', name: 'Gulab Jamun', description: 'Soft milk dumplings in sugar syrup', price: 99, image: 'https://images.unsplash.com/photo-1666190096728-71c36db9de72?w=200', isVeg: true, isBestseller: false, category: 'Desserts' },
            { id: 'd4', name: 'Cheesecake', description: 'Classic New York style cheesecake', price: 179, image: 'https://images.unsplash.com/photo-1578775887804-699de7086ff9?w=200', isVeg: true, isBestseller: false, category: 'Desserts' }
        ],
        '6': [
            { id: 's1', name: 'Masala Dosa', description: 'Crispy dosa with spiced potato filling', price: 99, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200', isVeg: true, isBestseller: true, category: 'Dosa' },
            { id: 's2', name: 'Idli Sambar', description: 'Soft idlis with sambar and chutney', price: 69, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200', isVeg: true, isBestseller: true, category: 'Breakfast' },
            { id: 's3', name: 'Mysore Dosa', description: 'Spicy dosa with red chutney', price: 119, image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=200', isVeg: true, isBestseller: false, category: 'Dosa' },
            { id: 's4', name: 'Medu Vada', description: 'Crispy lentil donuts with sambar', price: 59, image: 'https://images.unsplash.com/photo-1626132647523-66f5bd936e3e?w=200', isVeg: true, isBestseller: false, category: 'Breakfast' }
        ],
        '7': [
            { id: 't1', name: 'Chicken Tikka', description: 'Marinated chicken grilled in tandoor', price: 299, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=200', isVeg: false, isBestseller: true, category: 'Tandoori' },
            { id: 't2', name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 249, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=200', isVeg: true, isBestseller: true, category: 'Tandoori' },
            { id: 't3', name: 'Seekh Kebab', description: 'Minced meat grilled on skewers', price: 329, image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=200', isVeg: false, isBestseller: false, category: 'Kebabs' },
            { id: 't4', name: 'Tandoori Roti', description: 'Fresh bread baked in tandoor', price: 29, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200', isVeg: true, isBestseller: false, category: 'Breads' }
        ],
        '8': [
            { id: 'i1', name: 'Spaghetti Carbonara', description: 'Creamy pasta with bacon and egg', price: 299, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200', isVeg: false, isBestseller: true, category: 'Pasta' },
            { id: 'i2', name: 'Penne Arrabbiata', description: 'Spicy tomato sauce pasta', price: 249, image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=200', isVeg: true, isBestseller: true, category: 'Pasta' },
            { id: 'i3', name: 'Alfredo Pasta', description: 'Creamy white sauce fettuccine', price: 279, image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=200', isVeg: true, isBestseller: false, category: 'Pasta' },
            { id: 'i4', name: 'Garlic Bread', description: 'Toasted bread with garlic butter', price: 99, image: 'https://images.unsplash.com/photo-1619531040576-f9416abb7b69?w=200', isVeg: true, isBestseller: false, category: 'Sides' }
        ]
    },

    // Get all restaurants
    getRestaurants(params = {}) {
        let result = [...this.restaurants];

        if (params.cuisine) {
            result = result.filter(r => r.cuisine.some(c => c.toLowerCase().includes(params.cuisine.toLowerCase())));
        }
        if (params.rating) {
            result = result.filter(r => r.rating >= parseFloat(params.rating));
        }
        if (params.pureVeg) {
            result = result.filter(r => r.isPureVeg);
        }
        if (params.maxDeliveryTime) {
            result = result.filter(r => parseInt(r.deliveryTime) <= parseInt(params.maxDeliveryTime));
        }
        if (params.sort === 'rating') {
            result.sort((a, b) => b.rating - a.rating);
        }
        if (params.limit) {
            result = result.slice(0, parseInt(params.limit));
        }

        return result;
    },

    // Get restaurant by ID
    getRestaurantById(id) {
        return this.restaurants.find(r => r.id === id);
    },

    // Get menu for restaurant
    getMenu(restaurantId) {
        const restaurant = this.getRestaurantById(restaurantId);
        const items = this.menuItems[restaurantId] || this.menuItems['1'];

        // Group by category
        const grouped = items.reduce((acc, item) => {
            const cat = acc.find(c => c.category === item.category);
            if (cat) {
                cat.items.push(item);
            } else {
                acc.push({ category: item.category, items: [item] });
            }
            return acc;
        }, []);

        return { restaurant, groupedMenu: grouped };
    },

    // Search restaurants
    searchRestaurants(query) {
        const q = query.toLowerCase();
        return this.restaurants.filter(r =>
            r.name.toLowerCase().includes(q) ||
            r.cuisine.some(c => c.toLowerCase().includes(q))
        );
    },

    // Get trending items
    getTrending() {
        const allItems = Object.values(this.menuItems).flat();
        return allItems.filter(item => item.isBestseller).slice(0, 8).map(item => ({
            ...item,
            restaurant: this.restaurants.find(r => this.menuItems[r.id]?.includes(item))
        }));
    }
};

// Override API methods to use mock data when backend fails
const originalRequest = ApiClient.prototype.request;
ApiClient.prototype.request = async function (endpoint, options = {}) {
    try {
        return await originalRequest.call(this, endpoint, options);
    } catch (error) {
        console.log('Backend unavailable, using mock data for:', endpoint);

        // Parse endpoint and return mock data
        if (endpoint.includes('/restaurants') && !endpoint.includes('search')) {
            const params = {};
            const queryString = endpoint.split('?')[1];
            if (queryString) {
                queryString.split('&').forEach(p => {
                    const [key, value] = p.split('=');
                    params[key] = value;
                });
            }

            // Check if getting specific restaurant
            const idMatch = endpoint.match(/\/restaurants\/(\d+)/);
            if (idMatch) {
                return { data: MockData.getRestaurantById(idMatch[1]) };
            }

            return { data: MockData.getRestaurants(params) };
        }

        if (endpoint.includes('/restaurants/search')) {
            const query = endpoint.split('q=')[1] || '';
            return { data: MockData.searchRestaurants(decodeURIComponent(query)) };
        }

        if (endpoint.includes('/menu/')) {
            const idMatch = endpoint.match(/\/menu\/(\d+)/);
            if (idMatch) {
                return MockData.getMenu(idMatch[1]);
            }

            const itemMatch = endpoint.match(/\/menu\/item\/(\w+)/);
            if (itemMatch) {
                const allItems = Object.values(MockData.menuItems).flat();
                return { data: allItems.find(i => i.id === itemMatch[1]) };
            }
        }

        if (endpoint.includes('/recommendations/trending')) {
            return { data: MockData.getTrending() };
        }

        if (endpoint.includes('/recommendations')) {
            return { data: MockData.getTrending() };
        }

        if (endpoint.includes('/cart')) {
            // Return cart from localStorage
            const cart = JSON.parse(localStorage.getItem('zeefast_cart') || '{"items":[]}');
            return cart;
        }

        if (endpoint.includes('/orders')) {
            // Return orders from localStorage  
            const orders = JSON.parse(localStorage.getItem('zeefast_orders') || '{"data":[]}');
            return orders;
        }

        throw error;
    }
};

window.MockData = MockData;
