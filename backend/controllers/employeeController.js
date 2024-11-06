// controllers/employeeController.js
const Employee = require("../models/employee");

/**
 * @title Create a new Employee
 */
exports.createEmployee = async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json({
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Error creating employee",
    });
  }
};

/**
 * @title Login Employee
 * @param {Object} req - The request object containing email and password
 * @param {Object} res - The response object
 * @returns {Object} - Employee details and JWT token or error message
 */
exports.loginEmployee = async (req, res) => {
    try {
        const { id, password } = req.body;

        const employee = await Employee.findOne({ id }).select("+password");
        if (!employee || !(await employee.comparePassword(password))) {
          return res.status(401).json({
            message: "Invalid email or password",
          });
        }

        // Generate a token (implement token generation logic as needed)
        const token = 'sample-jwt-token'; // Replace with actual token generation logic

        res.status(200).json({
          message: "Login successful",
          token,
          employee: {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            wallet : employee.walletAddress
          },
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || 'Error logging in',
        });
    }
};


/**
 * @title Get all Employees
 */
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error fetching employees",
    });
  }
};

/**
 * @title Get Employee by ID
 */
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findOne({ id: req.params.id }); // Change to findOne with string ID
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error fetching employee",
    });
  }
};

//--> NEED TO IMPLEMENT- Details update, password change email update and same for user too.

// /**
//  * @title Update Employee by ID
//  */
// exports.updateEmployee = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { oldPassword, newPassword, ...otherUpdates } = req.body;

//     // Find the employee by ID
//     const employee = await Employee.findOne({ id });
//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     // If updating password, check old password
//     if (newPassword) {
//       // Check if the old password matches the stored password
//       const isMatch = await employee.comparePassword(oldPassword);
//       if (!isMatch) {
//         return res.status(401).json({ message: "Old password is incorrect" });
//       }

//       // Hash and set the new password
//       const salt = await bcrypt.genSalt(10);
//       employee.password = await bcrypt.hash(newPassword, salt);
//     }

//     // Update other fields (if any)
//     employee.assign(employee, otherUpdates);

//     // Save the updated employee
//     await employee.save();

//     res.status(200).json({
//       message: "Employee updated successfully",
//       employee,
//     });
//   } catch (error) {
//     res.status(400).json({
//       message: error.message || "Error updating employee",
//     });
//   }
// };

/**
 * @title Delete Employee by ID
 */
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete({ id: req.params.id }); // Change to findOneAndDelete with string ID
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error deleting employee",
    });
  }
};
