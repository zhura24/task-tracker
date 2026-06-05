import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const API = import.meta.env.VITE_API_URL || 'https://task-tracker-backend-ruddy.vercel.app';

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { token } = useAuthStore();
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      // Optional: Polling could be added here
      const interval = setInterval(fetchNotifications, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, [token]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRespond = async (invitationId, status, notificationId) => {
    try {
      await axios.post(`${API}/api/invitations/${invitationId}/respond`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await markAsRead(notificationId);
      // Refresh notifications and maybe projects
      fetchNotifications();
      window.location.reload(); // Simple way to refresh data on screen
    } catch (err) {
      console.error('Failed to respond to invitation', err);
      alert(err.response?.data?.error || 'Error responding to invitation');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Mark all read</button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">No notifications</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`p-4 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-750 transition ${!n.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                      {n.message}
                    </p>
                    {!n.isRead && <span className="h-2 w-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5 ml-2"></span>}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-500 block mb-2">{new Date(n.createdAt).toLocaleString()}</span>
                  
                  {n.type === 'INVITATION' && !n.isRead && (
                    <div className="flex space-x-2 mt-2">
                      <button 
                        onClick={() => handleRespond(n.relatedId, 'ACCEPTED', n.id)}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleRespond(n.relatedId, 'REJECTED', n.id)}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {n.type !== 'INVITATION' && !n.isRead && (
                    <button 
                      onClick={() => markAsRead(n.id)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
