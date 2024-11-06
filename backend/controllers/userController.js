const User = require('../models/user');

/**
 * @title Register User
 * @param {Object} req - The request object containing user details
 * @param {Object} res - The response object
 * @returns {Object} - Created user details or error message
 */
exports.registerUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(400).json({
            message: error.message || 'Error registering user',
        });
    }
};

/**
 * @title Login User
 * @param {Object} req - The request object containing email and password
 * @param {Object} res - The response object
 * @returns {Object} - User details and JWT token or error message
 */
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                message: 'Invalid email or password',
            });
        }

        // Generate a token (implement token generation logic as needed)
        const token = 'sample-jwt-token'; // Replace with actual token generation logic

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || 'Error logging in',
        });
    }
};

/**
 * @title Get All Users
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Array} - List of all users or error message
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password field
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: error.message || 'Error fetching users',
        });
    }
};
