import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, RefreshCw } from 'lucide-react';
import Loading from '../common/Loading';

const Login = () => {
  const [formData, setFormData] = useState({
    email: 'admin@company.com', // Default untuk testing
    password: 'admin123'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, backendStatus, retryBackendConnection } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if backend is offline
    if (backendStatus === 'offline') {
      setError('Backend server is offline. Please start the backend server first.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        console.log('✅ Login successful, redirecting...');
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryConnection = async () => {
    setIsLoading(true);
    await retryBackendConnection();
    setIsLoading(false);
  };

  const loadDemoCredentials = (type) => {
    if (type === 'admin') {
      setFormData({ email: 'admin@company.com', password: 'admin123' });
    } else {
      setFormData({ email: 'user@company.com', password: 'admin123' });
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to Absensi
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Modern Attendance System
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-6 shadow-xl sm:rounded-xl sm:px-10 border border-gray-200">
          {/* Backend Status Indicator */}
          <div className={`mb-6 p-3 rounded-lg border text-center ${
            backendStatus === 'online' ? 'bg-green-50 border-green-200 text-green-700' :
            backendStatus === 'offline' ? 'bg-red-50 border-red-200 text-red-700' :
            'bg-yellow-50 border-yellow-200 text-yellow-700'
          }`}>
            <div className="flex items-center justify-center space-x-2">
              {backendStatus === 'online' && (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">✅ Backend Connected</span>
                </>
              )}
              {backendStatus === 'offline' && (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">❌ Backend Offline</span>
                  <button
                    onClick={handleRetryConnection}
                    disabled={isLoading}
                    className="ml-2 flex items-center text-red-600 hover:text-red-800 text-xs font-medium"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </button>
                </>
              )}
              {backendStatus === 'checking' && (
                <>
                  <Loading size="small" />
                  <span className="text-sm font-medium">🔄 Checking Backend...</span>
                </>
              )}
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
                {error.includes('backend') && (
                  <div className="mt-2 text-sm space-y-1">
                    <p className="font-medium">Troubleshooting steps:</p>
                    <ol className="list-decimal list-inside ml-2 space-y-1">
                      <li>Open terminal in backend folder</li>
                      <li>Run: <code className="bg-gray-100 px-1 rounded">node server.js</code></li>
                      <li>Wait for server startup message</li>
                      <li>Click "Retry" button above</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="admin@company.com"
                  disabled={isLoading || backendStatus === 'offline'}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 transition-colors"
                  placeholder="Enter your password"
                  disabled={isLoading || backendStatus === 'offline'}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || backendStatus === 'offline'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Load Buttons */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => loadDemoCredentials('admin')}
                disabled={isLoading}
                className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                Load Admin
              </button>
              <button
                type="button"
                onClick={() => loadDemoCredentials('user')}
                disabled={isLoading}
                className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded text-sm hover:bg-green-200 transition-colors disabled:opacity-50"
              >
                Load User
              </button>
            </div>

            {/* Demo Credentials Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800 mb-2">Demo Credentials:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Admin:</span>
                  <span className="text-blue-600">admin@company.com / admin123</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">User:</span>
                  <span className="text-blue-600">user@company.com / admin123</span>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || backendStatus === 'offline'}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loading size="small" />
                    <span className="ml-2">
                      {backendStatus === 'checking' ? 'Checking backend...' : 'Signing in...'}
                    </span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    {backendStatus === 'offline' ? 'Backend Offline' : 'Sign in to your account'}
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">
                Backend Server Status
              </p>
              <p className="text-xs text-gray-400">
                http://localhost:5000
              </p>
              {backendStatus === 'offline' && (
                <p className="text-xs text-red-500 mt-1">
                  Make sure backend is running: <code className="bg-gray-100 px-1 rounded">node server.js</code>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;