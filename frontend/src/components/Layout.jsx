import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import NotificationsDropdown from './NotificationsDropdown';

export default function Layout({ children }) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Task Tracker</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">Dashboard</Link>
          <Link to="/projects" className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">Projects</Link>
          {user?.role === 'admin' && (
            <Link to="/admin/users" className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">Manage Users</Link>
          )}
          <Link to="/profile" className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">My Profile</Link>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Logged in as: <br/><span className="font-semibold text-gray-800 dark:text-gray-200">{user?.username} ({ { 'admin': 'Administrator', 'project_manager': 'Project Manager', 'team_member': 'Team Member' }[user?.role] || user?.role })</span></p>
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium">Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 shadow-sm transition-colors duration-200">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Team Collaboration</h2>
          <div className="flex items-center space-x-4">
            <NotificationsDropdown />
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
          </div>
        </header>
        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
