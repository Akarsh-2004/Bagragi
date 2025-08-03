// src/components/LoginModal.jsx
import React, { useState } from 'react';
import AuthForm from './AuthForm';

const LoginModal = ({ onClose, onLogin }) => {
  const [showAuthForm, setShowAuthForm] = useState(false);

  const handleAuthSuccess = (user) => {
    if (onLogin) {
      onLogin(user);
    }
    onClose();
  };

  const handleSimpleLogin = () => {
    // Create a mock user object for now
    const mockUser = {
      name: 'Demo User',
      role: 'guest',
      email: 'demo@example.com'
    };
    
    if (onLogin) {
      onLogin(mockUser);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-[400px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-center">Welcome to Bagragi</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {!showAuthForm ? (
          <div className="space-y-4">
            <p className="text-gray-600 text-center mb-6">
              Choose how you'd like to access your account
            </p>
            
            <button
              onClick={() => setShowAuthForm(true)}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Login / Register
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
            
            <button
              onClick={handleSimpleLogin}
              className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              Continue as Guest
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              Guest mode allows you to explore the platform without creating an account
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6 relative z-10">
            <AuthForm onAuthSuccess={handleAuthSuccess} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
