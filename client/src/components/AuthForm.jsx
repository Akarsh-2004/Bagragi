import { useState } from 'react';
import axios from 'axios';

const AuthForm = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'guest'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'register') {
        const res = await axios.post('/api/auth/register', form);
        alert(res.data.message || 'Registered successfully!');
        setMode('login');
      } else {
        const res = await axios.post('/api/auth/login', {
          email: form.email,
          password: form.password,
        });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        onAuthSuccess(user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4">{mode === 'login' ? 'Login' : 'Create Account'}</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="w-full p-2 border rounded"
            value={form.name}
            onChange={handleChange}
            required
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={form.password}
          onChange={handleChange}
          required
        />

        {mode === 'register' && (
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="guest"
                checked={form.role === 'guest'}
                onChange={handleChange}
                className="mr-2"
              />
              Guest
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="host"
                checked={form.role === 'host'}
                onChange={handleChange}
                className="mr-2"
              />
              Host
            </label>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>

      <div className="text-center mt-4">
        {mode === 'login' ? (
          <p>
            Don't have an account?{' '}
            <button onClick={() => setMode('register')} className="text-blue-600 hover:underline">
              Register
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button onClick={() => setMode('login')} className="text-blue-600 hover:underline">
              Login
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
