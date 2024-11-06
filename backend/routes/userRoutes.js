const express = require('express');
const { registerUser, loginUser, getAllUsers } = require('../controllers/userController');

const router = express.Router();

// Route to register a new user
router.post('/register', registerUser);

// Route to login a user
router.post('/login', loginUser);

// Route to get all users (for admin or internal use)
router.get('/', getAllUsers);

module.exports = router;
