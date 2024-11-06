import React, { useState, useEffect } from "react";
import axios from "axios";

const apiUrl = "http://localhost:5000/api/companyTransactions"; // Update this URL if your backend is running elsewhere

function CompanyTransaction() {
  const [transaction, setTransaction] = useState({
    company: "",
    employee: "",
    fromWallet: "",
    toWallet: "",
    amount: 0,
    description: "",
  });
  const [transactions, setTransactions] = useState([]);
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(apiUrl);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Create a new transaction
  const createTransaction = async () => {
    try {
      const response = await axios.post(apiUrl, transaction);
      alert(
        "Transaction created successfully: " +
          JSON.stringify(response.data.transaction)
      );
      setTransaction({
        company: "",
        employee: "",
        fromWallet: "",
        toWallet: "",
        amount: 0,
        description: "",
      });
      fetchTransactions(); // Refresh the transaction list
    } catch (error) {
      alert("Error creating transaction: " + error.message);
    }
  };

  // Get transaction by ID
  const getTransactionById = async () => {
    try {
      const response = await axios.get(`${apiUrl}/${transactionId}`);
      alert("Transaction details: " + JSON.stringify(response.data));
    } catch (error) {
      alert("Error fetching transaction: " + error.message);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-500 mb-8">
        Company Transactions
      </h1>

      {/* Create Transaction */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-green-500 mb-4">
          Create Transaction
        </h2>
        <input
          type="text"
          className="border p-2 rounded-md w-full mb-4"
          placeholder="Company ID"
          value={transaction.company}
          onChange={(e) =>
            setTransaction({ ...transaction, company: e.target.value })
          }
        />
        <input
          type="text"
          className="border p-2 rounded-md w-full mb-4"
          placeholder="Employee ID"
          value={transaction.employee}
          onChange={(e) =>
            setTransaction({ ...transaction, employee: e.target.value })
          }
        />
        <input
          type="text"
          className="border p-2 rounded-md w-full mb-4"
          placeholder="From Wallet"
          value={transaction.fromWallet}
          onChange={(e) =>
            setTransaction({ ...transaction, fromWallet: e.target.value })
          }
        />
        <input
          type="text"
          className="border p-2 rounded-md w-full mb-4"
          placeholder="To Wallet"
          value={transaction.toWallet}
          onChange={(e) =>
            setTransaction({ ...transaction, toWallet: e.target.value })
          }
        />
        <input
          type="number"
          className="border p-2 rounded-md w-full mb-4"
          placeholder="Amount"
          value={transaction.amount}
          onChange={(e) =>
            setTransaction({ ...transaction, amount: Number(e.target.value) })
          }
        />
        <input
          type="text"
          className="border p-2 rounded-md w-full mb-4"
          placeholder="Description"
          value={transaction.description}
          onChange={(e) =>
            setTransaction({ ...transaction, description: e.target.value })
          }
        />
        <button
          className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 w-full"
          onClick={createTransaction}
        >
          Create Transaction
        </button>
      </div>

      {/* All Transactions */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-500 mb-4">
          All Transactions
        </h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <ul className="list-disc list-inside">
            {transactions.map((tran) => (
              <li key={tran._id} className="text-gray-700">
                {tran.description} - Amount: {tran.amount}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Get Transaction by ID */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-500 mb-4">
          Get Transaction by ID
        </h2>
        <input
          type="text"
          className="border p-2 rounded-md w-full mb-4"
          placeholder="Transaction ID"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 w-full"
          onClick={getTransactionById}
        >
          Get Transaction
        </button>
      </div>
    </div>
  );
}

export default CompanyTransaction;
