const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// @route POST /api/companies
// @desc Create a new company
router.post('/', companyController.createCompany);

// @route GET /api/companies
// @desc Get all companies
router.get('/', companyController.getAllCompanies);

// @route GET /api/companies/:id
// @desc Get a company by ID
router.get('/:id', companyController.getCompanyById);

// @route PUT /api/companies/:id
// @desc Update a company
router.put('/:id', companyController.updateCompany);

// @route DELETE /api/companies/:id
// @desc Delete a company
router.delete('/:id', companyController.deleteCompany);

// @route POST /api/companies/:id/employees
// @desc Add an employee to a company
router.post('/:id/employees', companyController.addEmployeeToCompany);

// @route DELETE /api/companies/:id/employees
// @desc Remove an employee from a company
router.delete('/:id/employees', companyController.removeEmployeeFromCompany);

module.exports = router;
