// controllers/companyTransactionController.js
const CompanyTransaction = require('../models/companyTransaction');

/**
 * @title Create a Company Transaction
 * @param {Object} req - The request object containing transaction details
 * @param {Object} res - The response object
 * @returns {Object} - Created transaction details or error message
 */
exports.createTransaction = async (req, res) => {
    try {
        const transaction = new CompanyTransaction(req.body);
        await transaction.save();
        res.status(201).json({
            message: 'Transaction created successfully',
            transaction,
        });
    } catch (error) {
        res.status(400).json({
            message: error.message || 'Error creating transaction',
        });
    }
};

/**
 * @title Get All Company Transaction
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Array} - List of all Transaction
 */
exports.getAllTransactions = async (req, res) => {
    try {
        const Transaction = await CompanyTransaction.find();
        res.status(200).json(Transaction);
    } catch (error) {
        res.status(500).json({
            message: error.message || 'Error fetching Transaction',
        });
    }
};

/**
 * @title Get Transaction by ID
 * @param {Object} req - The request object containing transaction ID
 * @param {Object} res - The response object
 * @returns {Object} - Transaction details or error message
 */
exports.getTransactionById = async (req, res) => {
    try {
        const transaction = await CompanyTransaction.findOne({ _id: req.params.id });

        if (!transaction) {
            return res.status(404).json({
                message: 'Transaction not found',
            });
        }

        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({
            message: error.message || 'Error fetching transaction',
        });
    }
};
