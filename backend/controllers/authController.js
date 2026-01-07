/**
 * Auth Controller
 * Handles user authentication and profile management
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../data/users.json');

const loadUsers = () => JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const saveUsers = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

/**
 * Generate simple auth token
 */
const generateToken = (userId) => Buffer.from(userId).toString('base64');

/**
 * User Login
 * POST /api/auth/login
 */
exports.login = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const data = loadUsers();
        const user = data.users.find(u =>
            u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user.id);

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

/**
 * User Signup
 * POST /api/auth/signup
 */
exports.signup = (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const data = loadUsers();

        // Check if email already exists
        if (data.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const newUser = {
            id: `user${uuidv4().substring(0, 8)}`,
            name,
            email: email.toLowerCase(),
            password,
            phone: phone || '',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
            addresses: [],
            preferences: {
                cuisines: [],
                dietaryRestrictions: [],
                spiceLevel: 'medium'
            },
            createdAt: new Date().toISOString()
        };

        data.users.push(newUser);
        saveUsers(data);

        const token = generateToken(newUser.id);
        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during signup' });
    }
};

/**
 * Get User Profile
 * GET /api/auth/profile
 */
exports.getProfile = (req, res) => {
    try {
        const { password: _, ...userWithoutPassword } = req.user;
        res.json({
            success: true,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
};

/**
 * Update User Profile
 * PUT /api/auth/profile
 */
exports.updateProfile = (req, res) => {
    try {
        const { name, phone, preferences } = req.body;
        const data = loadUsers();
        const userIndex = data.users.findIndex(u => u.id === req.userId);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update allowed fields
        if (name) data.users[userIndex].name = name;
        if (phone) data.users[userIndex].phone = phone;
        if (preferences) {
            data.users[userIndex].preferences = {
                ...data.users[userIndex].preferences,
                ...preferences
            };
        }

        saveUsers(data);

        const { password: _, ...userWithoutPassword } = data.users[userIndex];
        res.json({
            success: true,
            message: 'Profile updated',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error updating profile' });
    }
};

/**
 * Add Address
 * POST /api/auth/addresses
 */
exports.addAddress = (req, res) => {
    try {
        const { type, address, city, pincode, isDefault } = req.body;

        if (!type || !address || !city || !pincode) {
            return res.status(400).json({ error: 'All address fields are required' });
        }

        const data = loadUsers();
        const userIndex = data.users.findIndex(u => u.id === req.userId);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newAddress = {
            id: `addr${uuidv4().substring(0, 8)}`,
            type,
            address,
            city,
            pincode,
            isDefault: isDefault || data.users[userIndex].addresses.length === 0
        };

        // If this is default, unset other defaults
        if (newAddress.isDefault) {
            data.users[userIndex].addresses.forEach(addr => addr.isDefault = false);
        }

        data.users[userIndex].addresses.push(newAddress);
        saveUsers(data);

        res.status(201).json({
            success: true,
            message: 'Address added',
            address: newAddress
        });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ error: 'Server error adding address' });
    }
};

/**
 * Delete Address
 * DELETE /api/auth/addresses/:addressId
 */
exports.deleteAddress = (req, res) => {
    try {
        const { addressId } = req.params;
        const data = loadUsers();
        const userIndex = data.users.findIndex(u => u.id === req.userId);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        const addressIndex = data.users[userIndex].addresses.findIndex(a => a.id === addressId);

        if (addressIndex === -1) {
            return res.status(404).json({ error: 'Address not found' });
        }

        data.users[userIndex].addresses.splice(addressIndex, 1);
        saveUsers(data);

        res.json({
            success: true,
            message: 'Address deleted'
        });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ error: 'Server error deleting address' });
    }
};
