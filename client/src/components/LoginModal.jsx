// src/components/LoginModal.jsx
import React, { useState } from 'react';

const LoginModal = ({ onClose }) => {
  const [role, setRole] = useState('guest');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Here, connect to backend login route (based on role)
    console.log('Logging in as:', role, email, password);
    onClose(); // Close modal after login
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-[400px]">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <div className="flex justify-center gap-6 mb-4">
          <label>
            <input
              type="radio"
              value="guest"
              checked={role === 'guest'}
              onChange={() => setRole('guest')}
              className="mr-1"
            />
            Guest
          </label>
          <label>
            <input
              type="radio"
              value="host"
              checked={role === 'host'}
              onChange={() => setRole('host')}
              className="mr-1"
            />
            Host
          </label>
        </div>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>

        <button
          onClick={onClose}
          className="mt-3 w-full text-center text-sm text-gray-600 hover:text-red-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
