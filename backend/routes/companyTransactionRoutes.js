// routes/companyTransactionRoutes.js
const express = require('express');
const router = express.Router();
const companyTransactionController = require('../controllers/companyTransactionController');

// Create a new transaction
router.post('/', companyTransactionController.createTransaction);

// Get all Transaction
router.get('/', companyTransactionController.getAllTransactions);

// Get transaction by ID
router.get('/:id', companyTransactionController.getTransactionById);

module.exports = router;
