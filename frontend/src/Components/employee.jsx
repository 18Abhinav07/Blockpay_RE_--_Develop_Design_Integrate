import React, { useState, useEffect } from "react";
import axios from "axios";

const apiUrl = "http://localhost:5000/api/employees"; // Update this URL if your backend is running elsewhere

function Employee() {
  const [employee, setEmployee] = useState({
    name: "",
    id: "",
    email: "",
    position: "",
    department: "",
    salary: 0,
    dateOfJoining: "",
  });
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);

  // State for old and new passwords
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Fetch all employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(apiUrl);
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Create a new employee
  const createEmployee = async () => {
    try {
      const response = await axios.post(apiUrl, employee);
      alert(
        "Employee created successfully: " +
          JSON.stringify(response.data.employee)
      );
      resetForm();
      fetchEmployees(); // Refresh the employee list
    } catch (error) {
      alert("Error creating employee: " + error.message);
    }
  };

  // Get employee by ID
  const getEmployeeById = async () => {
    try {
      const response = await axios.get(`${apiUrl}/${employeeId}`);
      const empData = response.data;
      setEmployee({
        name: empData.name,
        id: empData.id,
        email: empData.email,
        position: empData.position,
        department: empData.department,
        salary: empData.salary,
      });
      resetPasswordFields(); // Reset password fields when fetching employee data
    } catch (error) {
      alert("Error fetching employee: " + error.message);
    }
  };

  // Update employee by ID
  const updateEmployee = async () => {
    try {
      const response = await axios.put(`${apiUrl}/${employeeId}`, {
        oldPassword, // Send old password
        newPassword, // Send new password
        ...employee,
      });
      alert(
        "Employee updated successfully: " +
          JSON.stringify(response.data.employee)
      );
      fetchEmployees(); // Refresh the employee list
      resetForm(); // Reset the employee form after updating
      resetPasswordFields(); // Reset the password fields after updating
    } catch (error) {
      alert("Error updating employee: " + error.message);
    }
  };

  // Delete employee by ID
  const deleteEmployee = async () => {
    try {
      await axios.delete(`${apiUrl}/${employeeId}`);
      alert("Employee deleted successfully");
      fetchEmployees(); // Refresh the employee list
    } catch (error) {
      alert("Error deleting employee: " + error.message);
    }
  };

  // Reset the employee form
  const resetForm = () => {
    setEmployee({
      name: "",
      id: "",
      email: "",
      position: "",
      department: "",
      salary: 0,
    });
  };

  // Reset the password fields
  const resetPasswordFields = () => {
    setOldPassword("");
    setNewPassword("");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Employee Management</h1>

      <h2 className="text-xl font-semibold mt-6">Create Employee</h2>
      <div className="grid grid-cols-1 gap-4 mt-2">
        <input
          type="text"
          placeholder="Name"
          className="p-2 border rounded"
          value={employee.name}
          onChange={(e) => setEmployee({ ...employee, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="ID"
          className="p-2 border rounded"
          value={employee.id}
          onChange={(e) => setEmployee({ ...employee, id: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
          value={employee.email}
          onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Position"
          className="p-2 border rounded"
          value={employee.position}
          onChange={(e) =>
            setEmployee({ ...employee, position: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Department"
          className="p-2 border rounded"
          value={employee.department}
          onChange={(e) =>
            setEmployee({ ...employee, department: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Salary"
          className="p-2 border rounded"
          value={employee.salary}
          onChange={(e) =>
            setEmployee({ ...employee, salary: Number(e.target.value) })
          }
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 border rounded"
          value={employee.password}
          onChange={(e) =>
            setEmployee({ ...employee, password: e.target.value })
          }
        />
        <button
          onClick={createEmployee}
          className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Create Employee
        </button>
      </div>

      <h2 className="text-xl font-semibold mt-6">All Employees</h2>
      {loading ? (
        <p className="mt-2">Loading...</p>
      ) : (
        <ul className="mt-2">
          {employees.map((emp) => (
            <li key={emp._id} className="border-b py-2">
              {emp.name} - {emp.position} - {emp.department}
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-xl font-semibold mt-6">Get Employee by ID</h2>
      <input
        type="text"
        placeholder="Employee ID"
        className="p-2 border rounded mt-2"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
      />
      <button
        onClick={getEmployeeById}
        className="mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        Get Employee
      </button>

      <h2 className="text-xl font-semibold mt-6">Update Employee</h2>
      <div className="grid grid-cols-1 gap-4 mt-2">
        <input
          type="text"
          placeholder="Name"
          className="p-2 border rounded"
          value={employee.name}
          onChange={(e) => setEmployee({ ...employee, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="ID"
          className="p-2 border rounded"
          value={employee.id}
          readOnly // Keep the ID read-only
        />
        <input
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
          value={employee.email}
          onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Position"
          className="p-2 border rounded"
          value={employee.position}
          onChange={(e) =>
            setEmployee({ ...employee, position: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Department"
          className="p-2 border rounded"
          value={employee.department}
          onChange={(e) =>
            setEmployee({ ...employee, department: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Salary"
          className="p-2 border rounded"
          value={employee.salary}
          onChange={(e) =>
            setEmployee({ ...employee, salary: Number(e.target.value) })
          }
        />
        <input
          type="password"
          placeholder="Old Password"
          className="p-2 border rounded"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          className="p-2 border rounded"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button
          onClick={updateEmployee}
          className="mt-4 bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
        >
          Update Employee
        </button>
      </div>

      <h2 className="text-xl font-semibold mt-6">Delete Employee</h2>
      <button
        onClick={deleteEmployee}
        className="mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Delete Employee
      </button>
    </div>
  );
}

export default Employee;
