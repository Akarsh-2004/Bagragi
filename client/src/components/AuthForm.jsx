import { useState } from 'react';
import axios from 'axios';
import { User, Mail, Lock, MapPin, Globe, Eye, EyeOff, Phone, FileText, Heart, DollarSign, Map } from 'lucide-react';

const AuthForm = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'guest',
    country: '',
    city: '',
    phone: '',
    bio: '',
    preferences: {
      travelStyle: '',
      budget: '',
      preferredCountries: []
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const travelStyles = ['adventure', 'relaxing', 'cultural', 'wildlife', 'luxury'];
  const budgetLevels = ['low', 'medium', 'high'];
  const popularCountries = ['India', 'France', 'Japan', 'Brazil', 'United States', 'Canada', 'Australia', 'Germany', 'Italy', 'Spain'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('preferences.')) {
      const prefField = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefField]: value
        }
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePreferenceChange = (field, value) => {
    if (field === 'preferredCountries') {
      setForm(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          preferredCountries: value
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [field]: value
        }
      }));
    }
  };

  const validateForm = () => {
    if (mode === 'register') {
      if (!form.name.trim()) return 'Name is required';
      if (!form.country.trim()) return 'Country is required';
      if (!form.email.trim()) return 'Email is required';
      if (!form.password.trim()) return 'Password is required';
      if (form.password.length < 6) return 'Password must be at least 6 characters';
    } else {
      if (!form.email.trim()) return 'Email is required';
      if (!form.password.trim()) return 'Password is required';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await axios.post(
          'http://localhost:5000/api/register',
          {
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
            country: form.country,
            city: form.city,
            phone: form.phone,
            bio: form.bio,
            preferences: form.preferences
          },
          { withCredentials: true }
        );
        alert(res.data.message || 'Registered successfully!');
        setMode('login');
        // Clear form except email
        setForm(prev => ({
          ...prev,
          name: '',
          password: '',
          country: '',
          city: '',
          phone: '',
          bio: '',
          preferences: {
            travelStyle: '',
            budget: '',
            preferredCountries: []
          }
        }));
      } else {
        const res = await axios.post(
          'http://localhost:5000/api/login',
          {
            email: form.email,
            password: form.password,
          },
          { withCredentials: true }
        );
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        onAuthSuccess(user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600">
            {mode === 'login' 
              ? 'Sign in to your account to continue' 
              : 'Join us to start your journey'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="relative">
                <User size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Globe size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="relative">
                  <MapPin size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="city"
                    placeholder="City (Optional)"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="relative">
                <Phone size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number (Optional)"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <FileText size={20} className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  name="bio"
                  placeholder="Tell us about yourself (Optional)"
                  value={form.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Advanced Preferences Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <button
                  type="button"
                  onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  <Heart size={16} />
                  <span>Travel Preferences (Optional)</span>
                  <span className="ml-auto">{showAdvancedFields ? '−' : '+'}</span>
                </button>
                
                {showAdvancedFields && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Travel Style
                      </label>
                      <select
                        name="preferences.travelStyle"
                        value={form.preferences.travelStyle}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select travel style</option>
                        {travelStyles.map(style => (
                          <option key={style} value={style}>
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget Level
                      </label>
                      <select
                        name="preferences.budget"
                        value={form.preferences.budget}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select budget level</option>
                        {budgetLevels.map(budget => (
                          <option key={budget} value={budget}>
                            {budget.charAt(0).toUpperCase() + budget.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Countries
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {popularCountries.map(country => (
                          <label key={country} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={form.preferences.preferredCountries.includes(country)}
                              onChange={(e) => {
                                const newCountries = e.target.checked
                                  ? [...form.preferences.preferredCountries, country]
                                  : form.preferences.preferredCountries.filter(c => c !== country);
                                handlePreferenceChange('preferredCountries', newCountries);
                              }}
                              className="mr-2 text-blue-600"
                            />
                            <span className="text-sm">{country}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="relative">
            <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="relative">
            <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {mode === 'register' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Account Type:</p>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="guest"
                    checked={form.role === 'guest'}
                    onChange={handleChange}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-sm">Guest</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="host"
                    checked={form.role === 'host'}
                    onChange={handleChange}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-sm">Host</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {form.role === 'guest' 
                  ? 'Browse and book hotels' 
                  : 'List your properties and manage bookings'
                }
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          {mode === 'login' ? (
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
