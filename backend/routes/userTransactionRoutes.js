const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/userTransactionController');

// Route to create a new user transaction
router.post('/', transactionController.createTransaction);

// Route to get all user transactions
router.get('/', transactionController.getAllTransactions);

// Route to get a specific transaction by ID
router.get('/:id', transactionController.getTransactionById);

// // Route to update a specific transaction by ID
// router.put('/:id', transactionController.updateTransaction);

// // Route to delete a specific transaction by ID
// router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
