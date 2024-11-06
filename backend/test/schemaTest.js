const mongoose = require('mongoose');
const assert = require('assert');
const bcrypt = require('bcrypt');

// Import your schemas
const Company = require('../models/company');
const Employee = require('../models/employee');
const User = require('../models/user');
const CompanyTransaction = require('../models/companyTransactions');
const UserTransaction = require('../models/userTransactions');

// Connect to the local MongoDB instance manually before each test
async function connectDB() {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb');
}

// Close MongoDB connection after each test
async function closeDB() {
    await mongoose.connection.close();
}

// Test for the Company Schema
async function testCompanySchema() {
    await connectDB();

    const company = new Company({
        name: 'Test Company',
        id: 'COMP123',
        email: 'admin@company.com',
        admin: {
            username: 'adminUser',
            password: 'adminPassword',
        },
    });

    await company.save();
    const savedCompany = await Company.findOne({ id: 'COMP123' });

    assert(savedCompany, 'Company should exist');
    assert.strictEqual(savedCompany.admin.username, 'adminUser', 'Username should match');

    // Verify password hashing
    const isPasswordHashed = await bcrypt.compare('adminPassword', savedCompany.admin.password);
    assert(isPasswordHashed, 'Password should be hashed');

    await closeDB();
    console.log('Company Schema test passed.');
}

// Test for Employee Schema
async function testEmployeeSchema() {
    await connectDB();

    const employee = new Employee({
        name: 'John Doe',
        id: 'EMP001',
        email: 'john.doe@company.com',
        position: 'Software Engineer',
        department: 'Engineering',
        salary: 100000,
        password: 'employeePassword',
    });

    await employee.save();
    const savedEmployee = await Employee.findOne({ id: 'EMP001' });

    assert(savedEmployee, 'Employee should exist');
    assert.strictEqual(savedEmployee.name, 'John Doe', 'Name should match');

    // Verify password hashing
    const isPasswordHashed = await bcrypt.compare('employeePassword', savedEmployee.password);
    assert(isPasswordHashed, 'Password should be hashed');

    await closeDB();
    console.log('Employee Schema test passed.');
}

// Test for User Schema
async function testUserSchema() {
    await connectDB();

    const user = new User({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'userPassword',
    });

    await user.save();
    const savedUser = await User.findOne({ email: 'jane.doe@example.com' }).select('+password');

    assert(savedUser, 'User should exist');
    assert.strictEqual(savedUser.name, 'Jane Doe', 'Name should match');

    // Verify password hashing
    const isPasswordHashed = await bcrypt.compare('userPassword', savedUser.password);
    assert(isPasswordHashed, 'Password should be hashed');

    await closeDB();
    console.log('User Schema test passed.');
}

// Test for CompanyTransaction Schema
async function testCompanyTransactionSchema() {
    await connectDB();

    const companyTransaction = new CompanyTransaction({
        company: 'COMP123',
        employee: 'EMP001',
        fromWallet: '0xCompanyWalletAddress',
        toWallet: '0xEmployeeWalletAddress',
        amount: 5000,
        description: 'Salary Payment',
    });

    await companyTransaction.save();
    const savedTransaction = await CompanyTransaction.findOne({ company: 'COMP123' });

    assert(savedTransaction, 'Company transaction should exist');
    assert.strictEqual(savedTransaction.amount, 5000, 'Amount should match');

    await closeDB();
    console.log('CompanyTransaction Schema test passed.');
}

// Test for UserTransaction Schema
async function testUserTransactionSchema() {
    await connectDB();

    const userTransaction = new UserTransaction({
        fromWallet: '0xUserFromWallet',
        name: 'Jane Doe',
        amount: 300,
        toWallet: '0xUserToWallet',
        description: 'Payment for services',
    });

    await userTransaction.save();
    const savedTransaction = await UserTransaction.findOne({ name: 'Jane Doe' });

    assert(savedTransaction, 'User transaction should exist');
    assert.strictEqual(savedTransaction.amount, 300, 'Amount should match');

    await closeDB();
    console.log('UserTransaction Schema test passed.');
}

// Run all the tests sequentially
(async () => {
    await testCompanySchema();
    await testEmployeeSchema();
    await testUserSchema();
    await testCompanyTransactionSchema();
    await testUserTransactionSchema();
})();
