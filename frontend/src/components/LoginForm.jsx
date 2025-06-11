// src/components/LoginForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, handleApiError } from '../api/api';
import { 
  Mail, 
  Lock, 
  Loader2, 
  AlertCircle,
  
} from 'lucide-react';

const LoginForm = ({onLoginSuccess}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      console.log(response);
      if(response.success) {
        onLoginSuccess();
        navigate('/projects');
      }
    } catch (err) {
      const errorDetails = handleApiError(err);
      setError(errorDetails.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#222831' }}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold" style={{ color: '#EEEEEE' }}>
            Welcome back
          </h2>
          <p className="mt-2 text-sm" style={{ color: '#EEEEEE' }}>
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="font-medium"
              style={{ color: '#00ADB5' }}
            >
              Sign up
            </button>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Email Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5" style={{ color: '#00ADB5' }} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200"
                style={{ background: '#393E46', color: '#EEEEEE', borderColor: '#222831' }}
                placeholder="Email address"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5" style={{ color: '#00ADB5' }} />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full pl-10 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200"
                style={{ background: '#393E46', color: '#EEEEEE', borderColor: '#222831' }}
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <span style={{ color: '#00ADB5' }}>
                  {showPassword ? "Hide" : "Show"}
                </span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md p-4" style={{ background: '#393E46' }}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5" style={{ color: '#00ADB5' }} />
                </div>
                <div className="ml-3">
                  <p className="text-sm" style={{ color: '#EEEEEE' }}>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Remember me and Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4"
                style={{ accentColor: '#00ADB5' }}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm" style={{ color: '#EEEEEE' }}>
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="font-medium"
                style={{ color: '#00ADB5' }}
              >
                Forgot your password?
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 rounded-lg font-medium transition-colors duration-200"
              style={{ background: '#00ADB5', color: '#222831' }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: '#393E46' }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2" style={{ background: '#222831', color: '#EEEEEE' }}>
                  Or continue with
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
