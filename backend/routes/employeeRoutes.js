// routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// Create a new employee
router.post('/', employeeController.createEmployee);

// Login employee
router.post('/login', employeeController.loginEmployee);

// Get all employees
router.get('/', employeeController.getAllEmployees);

// Get employee by ID
router.get('/:id', employeeController.getEmployeeById);

// Update employee by ID
// router.put('/:id', employeeController.updateEmployee);

// Delete employee by ID
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
