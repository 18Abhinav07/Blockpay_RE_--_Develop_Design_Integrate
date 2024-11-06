import React, { useState, useEffect } from "react";
import axios from "axios";

const apiUrl = "http://localhost:5000/api/userTransactions"; // Update this URL if your backend is running elsewhere

const UserTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    fromWallet: "",
    toWallet: "",
    amount: "",
    transactionDate: "",
    description: "",
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(apiUrl); // Use apiUrl
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [refresh]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedTransaction
        ? `${apiUrl}/${selectedTransaction._id}` // Use apiUrl
        : apiUrl; // Use apiUrl
      const method = selectedTransaction ? "put" : "post";
      await axios({ method, url, data: formData });
      setRefresh(!refresh); // Trigger refresh
      setFormData({
        fromWallet: "",
        toWallet: "",
        amount: "",
        transactionDate: "",
        description: "",
      });
      setSelectedTransaction(null); // Clear selection after saving
    } catch (error) {
      console.error(
        "Error saving transaction:",
        error.response?.data?.message || "An error occurred"
      ); // Improved error handling
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/${id}`); // Use apiUrl
      setRefresh(!refresh); // Trigger refresh
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      fromWallet: transaction.fromWallet,
      toWallet: transaction.toWallet,
      amount: transaction.amount,
      transactionDate: transaction.transactionDate,
      description: transaction.description,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">User Transactions</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="fromWallet"
          value={formData.fromWallet}
          onChange={handleChange}
          placeholder="From Wallet"
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          name="toWallet"
          value={formData.toWallet}
          onChange={handleChange}
          placeholder="To Wallet"
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount"
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <input
          type="date"
          name="transactionDate"
          value={formData.transactionDate}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
        >
          {selectedTransaction ? "Update" : "Create"} Transaction
        </button>
      </form>

      <h2 className="mt-6 text-xl font-semibold">Transaction List</h2>
      <ul className="mt-4 space-y-4">
        {transactions.map((transaction) => (
          <li
            key={transaction._id}
            className="p-4 border border-gray-300 rounded-md"
          >
            <div>
              <p>
                <strong>From Wallet:</strong> {transaction.fromWallet}
              </p>
              <p>
                <strong>To Wallet:</strong> {transaction.toWallet}
              </p>
              <p>
                <strong>Amount:</strong> {transaction.amount}
              </p>
              <p>
                <strong>Date:</strong> {transaction.transactionDate}
              </p>
              <p>
                <strong>Description:</strong> {transaction.description}
              </p>
              <div className="mt-2">
                <button
                  onClick={() => handleEdit(transaction)}
                  className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600 transition mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(transaction._id)}
                  className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserTransaction;
