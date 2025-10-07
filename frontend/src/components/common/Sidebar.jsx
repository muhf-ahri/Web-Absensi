import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      current: location.pathname === '/'
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: Calendar,
      current: location.pathname === '/attendance'
    },
    ...(user?.role === 'admin' ? [{
      name: 'Admin',
      href: '/admin',
      icon: Users,
      current: location.pathname === '/admin'
    }] : []),
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      current: location.pathname === '/profile'
    }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30
        w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">Absensi</h1>
              <p className="text-xs text-gray-500">Modern System</p>
            </div>
          </div>
          
          {/* Toggle Button - Desktop */}
          <button
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Toggle Button - Mobile */}
          <button
            onClick={onToggle}
            className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${item.current
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <IconComponent className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Logout
          </button>
        </div>
      </div>

      {/* Collapsed Sidebar */}
      {!isOpen && (
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-16 bg-white shadow-xl">
            {/* Sidebar Header - Collapsed */}
            <div className="flex items-center justify-center h-16 border-b border-gray-200">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </div>

            {/* Navigation - Collapsed */}
            <nav className="mt-6 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center justify-center p-3 text-sm font-medium rounded-lg transition-colors duration-200
                      ${item.current
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    title={item.name}
                  >
                    <IconComponent className={`
                      h-5 w-5 flex-shrink-0
                      ${item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `} />
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button - Collapsed */}
            <div className="p-2 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="group flex items-center justify-center p-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;