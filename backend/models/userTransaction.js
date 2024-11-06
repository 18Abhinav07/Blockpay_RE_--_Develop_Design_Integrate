const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * @title UserTransaction Schema
 * @author Abhinav Pangaria
 * @notice Schema to track user Transaction
 * @dev This schema handles Transaction initiated by users, including wallet addresses, amount, and user information
 */
const userTransactionSchema = new Schema({
    fromWallet: {
        type: String,
        required: [true, 'From wallet address is required'],
    },
    name: {
        type: String,
        required: [true, 'User name is required'],
        trim: true,
    },
    amount: {
        type: Number,
        required: [true, 'Transaction amount is required'],
    },
    toWallet: {
        type: String,
        required: [true, 'To wallet address is required'],
    },
    transactionDate: {
        type: Date,
        default: Date.now,
        required: [true, 'Transaction date is required']
    },
    description: {
        type: String,
        trim: true
    }
});

/**
 * @title UserTransaction Model
 * @notice Mongoose model for user Transaction
 * @dev This model is used to interact with the user Transaction collection in the database
 */
const UserTransaction = mongoose.model('UserTransaction', userTransactionSchema);

module.exports = UserTransaction;
