/**
 * @title Company Database
 * @dev This module defines the company schema and embedded admin schema for managing companies and their employees.
 * Admin passwords are hashed using bcrypt before saving to ensure security.
 * The admin schema is embedded within the company schema, allowing centralized management.
 *
 * @notice This module can be used to create companies and manage their associated administrators and employees.
 *
 * @version 1.1.0
 * @date 2024-10-27
 * @author Abhinav Pangaria
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define constants
const SALT_WORK_FACTOR = 10; // Number of rounds for bcrypt salt generation

/**
 * @notice Admin Schema for company administrators
 * @dev Password is hashed before saving the admin to the database.
 * @param {String} username - The username of the admin (required).
 * @param {String} password - The admin's password, which is hashed before storage (required).
 */
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Admin username is required"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Admin password is required"],
    select: false,
  },
});

/**
 * @dev Pre-save hook for admin schema that hashes the password before storing in the database.
 * @notice Ensures that the password is not stored in plain text.
 * @param {Function} next - Passes control to the next middleware or save function.
 */
adminSchema.pre("save", function (next) {
  const admin = this;

  // Only hash the password if it has been modified (or is new)
  if (!admin.isModified("password")) return next();

  // Generate a salt and hash the password
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(admin.password, salt, (err, hash) => {
      if (err) return next(err);
      admin.password = hash; // Replace plain text password with hashed one
      next();
    });
  });
});

/**
 * @notice Company Schema to represent companies and their associated administrators and employees.
 * @param {String} name - The company's name (required).
 * @param {String} email - The company's contact email (required, validated).
 * @param {Array} employees - An array of references to Employee model IDs (optional).
 * @param {Object} admin - Embedded admin schema object containing username and hashed password.
 */
const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    id: {
      type: String,
      required: [true, "Company ID is required"],
      trim: true,
      unique: true, // Ensure company ID is unique
    },
    email: {
      type: String,
      required: [true, "Company email is required"],
      unique: true,
    },
    admin: adminSchema,
    employees: [
      {
        type: mongoose.Schema.Types.String,
        ref: "Employee",
        default: [],
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

/**
 * @notice Method to add a new employee to the company
 * @param {mongoose.Types.ObjectId} employeeId - The employee's ObjectId to add to the company.
 * @return {Promise<void>}
 * @dev This method ensures the employee gets properly linked to the company.
 */
companySchema.methods.addEmployee = async function (employeeId) {
  if (!this.employees.includes(employeeId)) {
    this.employees.push(employeeId);
    await this.save();
  }
};

/**
 * @notice Method to remove an employee from the company
 * @param {mongoose.Types.ObjectId} employeeId - The employee's ObjectId to remove from the company.
 * @return {Promise<void>}
 * @dev This method ensures the employee is properly unlinked from the company.
 */
companySchema.methods.removeEmployee = async function (employeeId) {
  this.employees = this.employees.filter(
    (id) => id.toString() !== employeeId.toString()
  );
  await this.save();
};

/**
 * @notice Hashes the admin's password before saving, embeds admin data in the company, and references employee data.
 * @dev This model is designed to handle the entire structure of a company, including admin security and employee references.
 * @return {Object} - The Company model with admin and employee data embedded.
 */
module.exports = mongoose.model("Company", companySchema);
