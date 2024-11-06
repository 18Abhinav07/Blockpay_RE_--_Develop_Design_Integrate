import React, { useState } from "react";
import axios from "axios";

const apiUrl = "http://localhost:5000/api/companies";

function Company() {
  const [company, setCompany] = useState({
    name: "",
    email: "",
    id: "",
    admin: { username: "", password: "" },
  });
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [updateCompanyName, setUpdateCompanyName] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  const createCompany = async () => {
    try {
      const response = await axios.post(apiUrl, company);
      alert("Company created: " + response.data.company.name);
    } catch (error) {
      alert("Error creating company: " + error.message);
    }
  };

  const getAllCompanies = async () => {
    try {
      const response = await axios.get(apiUrl);
      setCompanies(response.data);
    } catch (error) {
      alert("Error fetching companies: " + error.message);
    }
  };

  const getCompanyById = async () => {
    try {
      const response = await axios.get(`${apiUrl}/${companyId}`);
      alert("Company details: " + JSON.stringify(response.data));
    } catch (error) {
      alert("Error fetching company: " + error.message);
    }
  };

  const updateCompany = async () => {
    try {
      const response = await axios.put(`${apiUrl}/${companyId}`, {
        name: updateCompanyName,
      });
      alert("Company updated: " + response.data.company.name);
    } catch (error) {
      alert("Error updating company: " + error.message);
    }
  };

  const deleteCompany = async () => {
    try {
      await axios.delete(`${apiUrl}/${companyId}`);
      alert("Company deleted successfully");
    } catch (error) {
      alert("Error deleting company: " + error.message);
    }
  };

  const addEmployeeToCompany = async () => {
    try {
      await axios.post(`${apiUrl}/${companyId}/employees`, { employeeId });
      alert("Employee added successfully");
    } catch (error) {
      alert("Error adding employee: " + error.message);
    }
  };

  const removeEmployeeFromCompany = async () => {
    try {
      await axios.delete(`${apiUrl}/${companyId}/employees`, {
        data: { employeeId },
      });
      alert("Employee removed successfully");
    } catch (error) {
      alert("Error removing employee: " + error.message);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center text-blue-500 mb-6">
        Company Management
      </h1>

      {/* Create Company Section */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-500 mb-4">Create Company</h2>
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            className="border p-2 rounded-md"
            placeholder="Company Name"
            value={company.name}
            onChange={(e) => setCompany({ ...company, name: e.target.value })}
          />
          <input
            type="text"
            className="border p-2 rounded-md"
            placeholder="Company Email"
            value={company.email}
            onChange={(e) => setCompany({ ...company, email: e.target.value })}
          />
          <input
            type="text"
            className="border p-2 rounded-md"
            placeholder="Company ID"
            value={company.id}
            onChange={(e) => setCompany({ ...company, id: e.target.value })}
          />
          <input
            type="text"
            className="border p-2 rounded-md"
            placeholder="Admin Username"
            value={company.admin.username}
            onChange={(e) =>
              setCompany({
                ...company,
                admin: { ...company.admin, username: e.target.value },
              })
            }
          />
          <input
            type="password"
            className="border p-2 rounded-md"
            placeholder="Admin Password"
            value={company.admin.password}
            onChange={(e) =>
              setCompany({
                ...company,
                admin: { ...company.admin, password: e.target.value },
              })
            }
          />
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            onClick={createCompany}
          >
            Create Company
          </button>
        </div>
      </div>

      {/* Get All Companies */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-500 mb-4">Get All Companies</h2>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          onClick={getAllCompanies}
        >
          Get Companies
        </button>
        <ul className="mt-4">
          {companies.map((comp) => (
            <li key={comp.id} className="p-2 border-b">
              {comp.id}{comp.name}{comp.email}{comp.admin.username}{comp.admin.password}
            </li>
          ))}
        </ul>
      </div>

      {/* Get Company by ID */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-500 mb-4">Get Company by ID</h2>
        <input
          type="text"
          className="border p-2 rounded-md w-full mb-4"
          placeholder="Company ID"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          onClick={getCompanyById}
        >
          Get Company
        </button>
      </div>

      {/* Update Company */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-500 mb-4">Update Company</h2>
        <input
          type="text"
          className="border p-2 rounded-md w-full mb-4"
          placeholder="Company ID"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        />
        <input
          type="text"
          className="border p-2 rounded-md w-full mb-4"
          placeholder="New Company Name"
          value={updateCompanyName}
          onChange={(e) => setUpdateCompanyName(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          onClick={updateCompany}
        >
          Update Company
        </button>
      </div>

      {/* Delete Company */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-500 mb-4">Delete Company</h2>
        <input
          type="text"
          className="border p-2 rounded-md w-full mb-4"
          placeholder="Company ID"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        />
        <button
          className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
          onClick={deleteCompany}
        >
          Delete Company
        </button>
      </div>

      {/* Add Employee to Company */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-500 mb-4">Add Employee to Company</h2>
        <input
          type="text"
          className="border p-2 rounded-md w-full mb-4"
          placeholder="Company ID"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        />
        <input
          type="text"
          className="border p-2 rounded-md w-full mb-4"
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />
        <button
          className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
          onClick={addEmployeeToCompany}
        >
          Add Employee
        </button>
      </div>

      {/* Remove Employee from Company */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-500 mb-4">Remove Employee from Company</h2>
        <input
          type="text"
          className="border p-2 rounded-md w-full mb-4"
          placeholder="Company ID"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        />
        <input
          type="text"
          className="border p-2 rounded-md w-full mb-4"
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />
        <button
          className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
          onClick={removeEmployeeFromCompany}
        >
          Remove Employee
        </button>
      </div>
    </div>
  );
}

export default Company;
