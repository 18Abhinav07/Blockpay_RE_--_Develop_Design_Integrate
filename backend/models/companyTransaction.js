const mongoose = require('mongoose');
const Employee = require('./employee');
const Company = require('./company');

const { Schema } = mongoose;

/**
 * @title CompanyTransaction Schema
 * @author Abhinav Pangaria
 * @notice Schema to track Transaction between a company and its employees
 * @dev This schema handles company-to-employee Transaction, including amount, date, description, and wallet addresses
 */
const companyTransactionSchema = new Schema({
    company: {
        type: String, // Custom ID field for company
        required: [true, 'Company reference is required'],
        validate: {
            validator: async function (companyId) {
                const companyExists = await Company.findOne({ id: companyId });
                return !!companyExists;
            },
            message: 'Company not found'
        }
    },
    employee: {
        type: String, // Custom ID field for employee
        required: [true, 'Employee reference is required'],
        validate: {
            validator: async function (employeeId) {
                const employeeExists = await Employee.findOne({ id: employeeId });
                return !!employeeExists;
            },
            message: 'Employee not found'
        }
    },
    fromWallet: {
        type: String,
        required: [true, 'From wallet address is required'],
    },
    toWallet: {
        type: String,
        required: [true, 'To wallet address is required'],
    },
    amount: {
        type: Number,
        required: [true, 'Transaction amount is required'],
        min: [0, 'Transaction amount must be positive'],
        validate: {
            validator: (amount) => amount > 0,
            message: 'Transaction amount must be greater than zero'
        }
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
 * @notice Pre-save validation for the CompanyTransaction schema
 * @dev This middleware runs before saving a new transaction, ensuring both company and employee exist
 */
companyTransactionSchema.pre('save', async function (next) {
    const transaction = this;

    try {
        const [companyExists, employeeExists] = await Promise.all([
            Company.findOne({ id: transaction.company }),
            Employee.findOne({ id: transaction.employee })
        ]);

        if (!companyExists) {
            return next(new Error('Company does not exist'));
        }
        if (!employeeExists) {
            return next(new Error('Employee does not exist'));
        }

        next();
    } catch (error) {
        return next(new Error('An error occurred while validating company or employee'));
    }
});

/**
 * @title CompanyTransaction Model
 * @notice Mongoose model for company Transaction with employees
 * @dev This model is used to interact with the company Transaction collection in the database
 */
const CompanyTransaction = mongoose.model('CompanyTransaction', companyTransactionSchema);

module.exports = CompanyTransaction;
