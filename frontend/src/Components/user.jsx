import React, { useState, useEffect } from "react";
import axios from "axios";

const apiUrl = "http://localhost:5000/api/users"; // Update this URL if your backend is running elsewhere

const User = () => {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [isLogin, setIsLogin] = useState(false);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? `${apiUrl}/login` : `${apiUrl}/register`; // Use apiUrl

    try {
      const response = await axios.post(url, user);
      setMessage(response.data.message);
      if (!isLogin) setUser({ name: "", email: "", password: "" }); // Reset form on successful registration
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred"); // Handle error more safely
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(apiUrl); // Use apiUrl
      setUsers(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred"); // Handle error more safely
    }
  };

//   useEffect(() => {
//     if (users.length === 0) fetchUsers(); // Fetch users if the list is empty
//   }, [users]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">
        {isLogin ? "Login" : "Register"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name:
            </label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email:
          </label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password:
          </label>
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
        >
          {isLogin ? "Login" : "Register"}
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="w-full bg-gray-200 p-2 rounded-md hover:bg-gray-300 transition"
        >
          Switch to {isLogin ? "Register" : "Login"}
        </button>
      </form>
      {message && <p className="mt-4 text-red-600">{message}</p>}
      <h2 className="mt-6 text-xl font-semibold">All Users</h2>
      <button
        onClick={fetchUsers}
        className="mt-2 bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition"
      >
        Refresh Users
      </button>
      <ul className="mt-4">
        {users.map((u) => (
          <li key={u.id} className="border-b border-gray-200 py-2">
            {u.name} ({u.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default User;
