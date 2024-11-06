const UserTransaction = require('../models/userTransaction');

/**
 * @title Create User Transaction
 * @param {Object} req - The request object containing transaction details
 * @param {Object} res - The response object
 * @returns {Object} - Created transaction details or error message
 */
exports.createTransaction = async (req, res) => {
    try {
        const transaction = new UserTransaction(req.body);
        await transaction.save();
        res.status(201).json({
            message: 'Transaction created successfully',
            transaction: {
                id: transaction._id,
                fromWallet: transaction.fromWallet,
                toWallet: transaction.toWallet,
                amount: transaction.amount,
                transactionDate: transaction.transactionDate,
                description: transaction.description,
            },
        });
    } catch (error) {
        res.status(400).json({
            message: error.message || 'Error creating transaction',
        });
    }
};

/**
 * @title Get All User Transactions
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Array} - List of all transactions or error message
 */
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await UserTransaction.find();
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({
            message: error.message || 'Error fetching transactions',
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
        const transaction = await UserTransaction.findById(req.params.id);
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

// -> should not update and delete transaction.

// /**
//  * @title Update Transaction by ID
//  * @param {Object} req - The request object containing transaction ID and updated data
//  * @param {Object} res - The response object
//  * @returns {Object} - Updated transaction details or error message
//  */
// exports.updateTransaction = async (req, res) => {
//     try {
//         const transaction = await UserTransaction.findByIdAndUpdate(req.params.id, req.body, {
//             new: true,
//             runValidators: true,
//         });

//         if (!transaction) {
//             return res.status(404).json({
//                 message: 'Transaction not found',
//             });
//         }

//         res.status(200).json({
//             message: 'Transaction updated successfully',
//             transaction,
//         });
//     } catch (error) {
//         res.status(400).json({
//             message: error.message || 'Error updating transaction',
//         });
//     }
// };

// /**
//  * @title Delete Transaction by ID
//  * @param {Object} req - The request object containing transaction ID
//  * @param {Object} res - The response object
//  * @returns {Object} - Confirmation message or error message
//  */
// exports.deleteTransaction = async (req, res) => {
//     try {
//         const transaction = await UserTransaction.findByIdAndDelete(req.params.id);
//         if (!transaction) {
//             return res.status(404).json({
//                 message: 'Transaction not found',
//             });
//         }

//         res.status(200).json({
//             message: 'Transaction deleted successfully',
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: error.message || 'Error deleting transaction',
//         });
//     }
// };
