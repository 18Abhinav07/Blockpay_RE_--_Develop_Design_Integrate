const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

console.log(bcrypt);

// Define the employee schema
/**
 * @title Employee Schema
 * @author Abhinav Pangaria
 * @notice Schema definition for an employee in a company
 * @dev This schema defines the structure of an employee object in the database
 * @dev Future Enhancement --> Add a static wallet field to store employee wallet addresses for automated off-ramps.
 */
const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Employee name is required"],
    trim: true,
  },
  id: {
    type: String,
    required: [true, "Employee id is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Employee email is required"],
    unique: true,
    trim: true,
  },
  position: {
    type: String,
    required: [true, "Employee position is required"],
    trim: true,
  },
  department: {
    type: String,
    required: [true, "Employee department is required"],
    trim: true,
  },
  salary: {
    type: Number,
    required: [true, "Employee salary is required"],
  },
  password: {
    type: String,
    required: [true, "Employee password is required"],
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  walletAddress: {
    type: String,
    unique: true,
  },

  //Need to add some mechanism to have fields that will help in the salary calucaltion tax etc like a real payroll.
});

/**
 * @notice Hash the password before saving the employee document
 * @dev Uses bcrypt for password hashing
 */
employeeSchema.pre("save", async function (next) {
  const employee = this;

  // Proceed if password is modified or new
  if (!employee.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(employee.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});


/**
 * @title Employee Model
 * @notice Mongoose model for employees
 * @dev This model is used to interact with the employees collection in the database
 */
const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
