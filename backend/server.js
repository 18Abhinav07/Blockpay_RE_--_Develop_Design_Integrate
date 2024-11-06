require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

// Import route files
const companyRoutes = require('./routes/companyRoutes');
const companyTransactionRoutes = require('./routes/companyTransactionRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const userRoutes = require('./routes/userRoutes');
const userTransactionRoutes = require('./routes/userTransactionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_DEV)
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

// User Transaction Routes
app.use('/api/companies', companyRoutes);
app.use('/api/companyTransactions', companyTransactionRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/userTransactions', userTransactionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
