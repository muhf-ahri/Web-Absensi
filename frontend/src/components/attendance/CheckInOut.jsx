import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import Loading from '../common/Loading';

const CheckInOut = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    const useMock = localStorage.getItem('useMock') === 'true';
    setMockMode(useMock);
    getCurrentLocation();
    getTodayAttendance();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          
          // Get address from coordinates
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setAddress(data.display_name || 'Address not found');
          } catch (error) {
            setAddress('Unable to get address');
          }
        },
        (error) => {
          // Jika geolocation gagal, gunakan location mock
          setLocation({ latitude: -6.2088, longitude: 106.8456 });
          setAddress('Jakarta, Indonesia (Mock Location)');
          setMessage('Using mock location for demo');
        }
      );
    } else {
      // Fallback untuk browser tanpa geolocation
      setLocation({ latitude: -6.2088, longitude: 106.8456 });
      setAddress('Jakarta, Indonesia (Mock Location)');
    }
  };

  const getTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (mockMode) {
        // Mock data untuk demo mode
        const mockAttendance = {
          _id: 'mock-' + Date.now(),
          user: '1',
          date: new Date().toISOString(),
          checkIn: null,
          checkOut: null,
          workingHours: null,
          status: 'present'
        };
        setTodayAttendance(mockAttendance);
        return;
      }

      const response = await api.get(`/attendance/my-attendance?startDate=${today}&endDate=${today}`);
      if (response.data.data.length > 0) {
        setTodayAttendance(response.data.data[0]);
      } else {
        // Buat attendance record kosong untuk hari ini
        setTodayAttendance({
          _id: 'temp-' + Date.now(),
          user: '1',
          date: new Date().toISOString(),
          checkIn: null,
          checkOut: null,
          workingHours: null,
          status: 'present'
        });
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      // Fallback ke mock data
      const mockAttendance = {
        _id: 'mock-' + Date.now(),
        user: '1',
        date: new Date().toISOString(),
        checkIn: null,
        checkOut: null,
        workingHours: null,
        status: 'present'
      };
      setTodayAttendance(mockAttendance);
    }
  };

  const handleCheckIn = async () => {
    if (!location) {
      setMessage('Please wait for location to be loaded');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      if (mockMode) {
        // Mock check-in
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockCheckIn = {
          time: new Date().toISOString(),
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: address
          }
        };

        const updatedAttendance = {
          ...todayAttendance,
          checkIn: mockCheckIn,
          checkOut: null,
          workingHours: null
        };

        setTodayAttendance(updatedAttendance);
        setMessage('✅ Check-in successful! (Demo Mode)');
        
        // Simpan ke localStorage untuk persistensi
        localStorage.setItem('todayAttendance', JSON.stringify(updatedAttendance));
      } else {
        const response = await api.post('/attendance/checkin', {
          latitude: location.latitude,
          longitude: location.longitude,
          address: address
        });

        if (response.data.success) {
          setTodayAttendance(response.data.data);
          setMessage('Check-in successful!');
        }
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!location) {
      setMessage('Please wait for location to be loaded');
      return;
    }

    if (!todayAttendance?.checkIn) {
      setMessage('You need to check in first before checking out');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      if (mockMode) {
        // Mock check-out
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const checkInTime = new Date(todayAttendance.checkIn.time);
        const checkOutTime = new Date();
        const workingHours = (checkOutTime - checkInTime) / (1000 * 60 * 60); // dalam jam

        const mockCheckOut = {
          time: checkOutTime.toISOString(),
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: address
          }
        };

        const updatedAttendance = {
          ...todayAttendance,
          checkOut: mockCheckOut,
          workingHours: workingHours
        };

        setTodayAttendance(updatedAttendance);
        setMessage('✅ Check-out successful! (Demo Mode)');
        
        // Simpan ke localStorage untuk persistensi
        localStorage.setItem('todayAttendance', JSON.stringify(updatedAttendance));
      } else {
        const response = await api.post('/attendance/checkout', {
          latitude: location.latitude,
          longitude: location.longitude,
          address: address
        });

        if (response.data.success) {
          setTodayAttendance(response.data.data);
          setMessage('Check-out successful!');
        }
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Load dari localStorage saat component mount
  useEffect(() => {
    const savedAttendance = localStorage.getItem('todayAttendance');
    if (savedAttendance) {
      const attendanceData = JSON.parse(savedAttendance);
      // Cek apakah data masih untuk hari yang sama
      const today = new Date().toDateString();
      const savedDate = new Date(attendanceData.date).toDateString();
      
      if (today === savedDate) {
        setTodayAttendance(attendanceData);
      } else {
        // Jika beda hari, reset
        localStorage.removeItem('todayAttendance');
      }
    }
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Daily Attendance</h2>
        {mockMode && (
          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
            Demo Mode
          </span>
        )}
      </div>
      
      {/* Location Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-sm text-blue-800">
            {location ? `Location: ${address}` : 'Getting location...'}
          </span>
        </div>
        <div className="text-xs text-blue-600 mt-1">
          Today: {formatDate(new Date())}
        </div>
      </div>

      {/* Today's Status */}
      {todayAttendance && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Today's Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm">
                Check In: {todayAttendance.checkIn?.time ? formatTime(todayAttendance.checkIn.time) : '-'}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm">
                Check Out: {todayAttendance.checkOut?.time ? formatTime(todayAttendance.checkOut.time) : '-'}
              </span>
            </div>
            {todayAttendance.workingHours && (
              <div className="flex items-center md:col-span-2">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm">
                  Working Hours: {todayAttendance.workingHours.toFixed(2)} hours
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleCheckIn}
          disabled={loading || (todayAttendance && todayAttendance.checkIn)}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {loading ? (
            <Loading size="small" />
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Check In
            </>
          )}
        </button>

        <button
          onClick={handleCheckOut}
          disabled={loading || !todayAttendance?.checkIn || todayAttendance?.checkOut}
          className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {loading ? (
            <Loading size="small" />
          ) : (
            <>
              <XCircle className="h-5 w-5 mr-2" />
              Check Out
            </>
          )}
        </button>
      </div>

      {/* Reset Button untuk Demo */}
      {mockMode && todayAttendance?.checkOut && (
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              localStorage.removeItem('todayAttendance');
              setTodayAttendance({
                _id: 'mock-' + Date.now(),
                user: '1',
                date: new Date().toISOString(),
                checkIn: null,
                checkOut: null,
                workingHours: null,
                status: 'present'
              });
              setMessage('Attendance reset for demo');
            }}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Reset for Demo
          </button>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg ${
          message.includes('successful') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            {message.includes('successful') ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            {message}
          </div>
        </div>
      )}

      {/* Demo Instructions */}
      {mockMode && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Demo Mode:</strong> Data disimpan sementara di browser. Check-in dan check-out akan bekerja tanpa backend.
          </p>
        </div>
      )}
    </div>
  );
};

export default CheckInOut;