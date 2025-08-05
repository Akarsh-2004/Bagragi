import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthForm = ({ isLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    country: "",
    city: "",
    phone: "",
    bio: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isLogin
      ? "https://bagragi-node-latest.onrender.com/api/auth/login"
      : "https://bagragi-node-latest.onrender.com/api/auth/register";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed");

      if (isLogin) {
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        alert("Registration successful!");
        navigate("/login");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? "Login" : "Register"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Name"
                onChange={handleChange}
                className="w-full p-2 rounded bg-white/10 placeholder-white focus:outline-none"
                required
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                onChange={handleChange}
                className="w-full p-2 rounded bg-white/10 placeholder-white focus:outline-none"
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                onChange={handleChange}
                className="w-full p-2 rounded bg-white/10 placeholder-white focus:outline-none"
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                onChange={handleChange}
                className="w-full p-2 rounded bg-white/10 placeholder-white focus:outline-none"
              />
              <input
                type="text"
                name="bio"
                placeholder="Bio"
                onChange={handleChange}
                className="w-full p-2 rounded bg-white/10 placeholder-white focus:outline-none"
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-2 rounded bg-white/10 placeholder-white focus:outline-none"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-2 rounded bg-white/10 placeholder-white focus:outline-none"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
