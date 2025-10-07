import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, UserCheck, Clock, BarChart3 } from 'lucide-react';
import api from '../services/api';
import Loading from '../components/common/Loading';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's attendance
      const attendanceResponse = await api.get(`/attendance/my-attendance?startDate=${today}&endDate=${today}`);
      if (attendanceResponse.data.data.length > 0) {
        setTodayAttendance(attendanceResponse.data.data[0]);
      }

      // Fetch stats (for admin)
      if (user?.role === 'admin') {
        const usersResponse = await api.get('/users');
        const totalUsers = usersResponse.data.data.length;
        const activeUsers = usersResponse.data.data.filter(u => u.isActive).length;
        
        setStats({
          totalUsers,
          activeUsers
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCheckInStatus = () => {
    if (!todayAttendance) return 'Not Checked In';
    if (todayAttendance.checkIn && !todayAttendance.checkOut) return 'Checked In';
    if (todayAttendance.checkOut) return 'Checked Out';
    return 'Not Checked In';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Checked In': return 'text-green-600 bg-green-100';
      case 'Checked Out': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const dashboardStats = [
    {
      title: "Today's Status",
      value: getCheckInStatus(),
      icon: UserCheck,
      color: 'bg-blue-500',
      action: () => navigate('/attendance'),
      status: true
    },
    {
      title: "My Attendance",
      value: "History",
      icon: Calendar,
      color: 'bg-green-500',
      action: () => navigate('/attendance')
    },
    {
      title: "Working Hours",
      value: todayAttendance?.workingHours 
        ? `${todayAttendance.workingHours.toFixed(2)}h` 
        : '-',
      icon: Clock,
      color: 'bg-purple-500'
    }
  ];

  // Add admin stats if user is admin
  if (user?.role === 'admin') {
    dashboardStats.push(
      {
        title: "Total Users",
        value: stats.totalUsers || '-',
        icon: Users,
        color: 'bg-orange-500',
        action: () => navigate('/admin')
      },
      {
        title: "Active Users",
        value: stats.activeUsers || '-',
        icon: BarChart3,
        color: 'bg-teal-500',
        action: () => navigate('/admin')
      }
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content - Header sudah ditangani oleh Layout component */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back to your dashboard. Here's your overview for today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {dashboardStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                onClick={stat.action}
                className={`bg-white rounded-lg shadow p-6 ${stat.action ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    {stat.status ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusColor(stat.value)}`}>
                        {stat.value}
                      </span>
                    ) : (
                      <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                    )}
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions & Today's Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/attendance')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-left flex items-center justify-between"
              >
                <span>Go to Attendance</span>
                <UserCheck className="h-5 w-5" />
              </button>
              
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-left flex items-center justify-between"
                >
                  <span>Manage Users</span>
                  <Users className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Today's Attendance Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h2>
            {todayAttendance ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Check In:</span>
                  <span className="font-medium">
                    {todayAttendance.checkIn?.time 
                      ? new Date(todayAttendance.checkIn.time).toLocaleTimeString('id-ID')
                      : '-'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Check Out:</span>
                  <span className="font-medium">
                    {todayAttendance.checkOut?.time 
                      ? new Date(todayAttendance.checkOut.time).toLocaleTimeString('id-ID')
                      : '-'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Working Hours:</span>
                  <span className="font-medium">
                    {todayAttendance.workingHours 
                      ? `${todayAttendance.workingHours.toFixed(2)} hours`
                      : '-'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getCheckInStatus())}`}>
                    {getCheckInStatus()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-500">No attendance record for today</p>
                <p className="text-sm text-gray-400 mt-1">Check in to start tracking your time</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity (Placeholder for future features) */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
          <div className="text-center text-gray-500 py-8">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-600">Recent activity will appear here</p>
            <p className="text-sm text-gray-400">Track your daily activities and progress</p>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {dashboardStats.filter(stat => stat.title === "Today's Status" && stat.value !== "Not Checked In").length}
            </div>
            <div className="text-sm text-gray-600">Days Attended This Month</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {todayAttendance?.workingHours ? todayAttendance.workingHours.toFixed(1) : '0'}
            </div>
            <div className="text-sm text-gray-600">Hours Worked Today</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {user?.role === 'admin' ? stats.activeUsers || '0' : '1'}
            </div>
            <div className="text-sm text-gray-600">
              {user?.role === 'admin' ? 'Active Users' : 'Your Profile'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;