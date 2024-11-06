const Company = require('../models/company');
const mongoose = require('mongoose');

/**
 * @desc Create a new company
 * @route POST /api/companies
 * @access Public
 */
exports.createCompany = async (req, res) => {
    try {
        const { name, email, id, admin } = req.body;

        const newCompany = new Company({
            name,
            email,
            id,
            admin
        });

        await newCompany.save();
        res.status(201).json({ message: 'Company created successfully', company: newCompany });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * @desc Get all companies
 * @route GET /api/companies
 * @access Public
 */
exports.getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc Get a company by ID
 * @route GET /api/companies/:id
 * @access Public
 */
exports.getCompanyById = async (req, res) => {
    try {
        const company = await Company.findOne({ id: req.params.id });

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.status(200).json(company);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc Update a company
 * @route PUT /api/companies/:id
 * @access Public
 */
exports.updateCompany = async (req, res) => {
    try {
        const company = await Company.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.status(200).json({ message: 'Company updated successfully', company });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * @desc Delete a company
 * @route DELETE /api/companies/:id
 * @access Public
 */
exports.deleteCompany = async (req, res) => {
    try {
        const company = await Company.findOneAndDelete({ id: req.params.id });

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc Add an employee to a company
 * @route POST /api/companies/:id/employees
 * @access Public
 */
exports.addEmployeeToCompany = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const company = await Company.findOne({ id: req.params.id });

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        await company.addEmployee(employeeId);
        res.status(200).json({ message: 'Employee added successfully', company });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc Remove an employee from a company
 * @route DELETE /api/companies/:id/employees
 * @access Public
 */
exports.removeEmployeeFromCompany = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const company = await Company.findOne({ id: req.params.id });

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        await company.removeEmployee(employeeId);
        res.status(200).json({ message: 'Employee removed successfully', company });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
