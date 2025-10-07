import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Wifi, WifiOff } from 'lucide-react';
import Loading from '../common/Loading';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, enableMockMode, mockMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const demoCredentials = [
    { email: 'admin@company.com', password: 'password123', role: 'admin', name: 'Demo Admin' },
    { email: 'user@company.com', password: 'password123', role: 'user', name: 'Demo User' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleDemoLogin = (demoUser) => {
    setFormData({
      email: demoUser.email,
      password: demoUser.password
    });
    // Auto submit setelah 100ms
    setTimeout(() => {
      document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 100);
  };

  const enableDemoMode = async () => {
    setIsLoading(true);
    setError('');
    try {
      enableMockMode();
      // Auto login dengan demo account pertama
      const result = await login('admin@company.com', 'password123');
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError('Failed to login with demo mode');
      }
    } catch (error) {
      setError('Demo mode error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else if (result.offerMock) {
        setError(
          <div className="text-center">
            <WifiOff className="mx-auto h-8 w-8 text-orange-500 mb-3" />
            <p className="text-orange-800 font-medium text-lg">Backend Server Unavailable</p>
            <p className="text-orange-600 mt-2">The backend server is not running. You can use demo mode to explore the application.</p>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={enableDemoMode}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Enter Demo Mode
              </button>
              <p className="text-xs text-orange-500">
                You can also try: admin@company.com / password123
              </p>
            </div>
          </div>
        );
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Auto fallback to demo mode on any error
      setError(
        <div className="text-center">
          <WifiOff className="mx-auto h-8 w-8 text-blue-500 mb-3" />
          <p className="text-blue-800 font-medium">Auto-enabling Demo Mode</p>
          <p className="text-blue-600 text-sm mt-1">You can explore the app with sample data</p>
          <button
            type="button"
            onClick={enableDemoMode}
            className="mt-3 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Continue with Demo
          </button>
        </div>
      );
    } finally {
      setIsLoading(false);
    }
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

        <div className="mt-4 flex justify-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            mockMode 
              ? 'bg-orange-100 text-orange-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {mockMode ? (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Demo Mode
              </>
            ) : (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Live Mode
              </>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white py-8 px-6 shadow-xl sm:rounded-xl sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className={`p-4 rounded-lg border ${
                typeof error === 'string' 
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-orange-50 border-orange-200'
              }`}>
                {error}
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
                  placeholder="you@company.com"
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800 mb-2">Quick Demo Access:</p>
              <div className="space-y-2">
                {demoCredentials.map((demo, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDemoLogin(demo)}
                    className="w-full text-left text-sm text-blue-700 hover:text-blue-800 hover:bg-blue-100 px-3 py-2 rounded transition-colors border border-blue-200"
                    disabled={isLoading}
                  >
                    <div className="font-medium">{demo.email}</div>
                    <div className="text-xs text-blue-600">Password: password123 • Role: {demo.role}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loading size="small" />
                    <span className="ml-2">Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign in to your account
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={enableDemoMode}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  <WifiOff className="h-4 w-4 mr-2 text-gray-500" />
                  Try Demo Mode (No Backend Required)
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Explore the app with sample data without backend connection
                </p>
              </div>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                {mockMode 
                  ? "🔧 Running in demo mode with sample data" 
                  : "🚀 Connect to backend server for full functionality"
                }
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Backend: {mockMode ? 'Not Required' : 'Required on port 5000'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;