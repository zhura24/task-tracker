import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const API = import.meta.env.VITE_API_URL || 'https://task-tracker-backend-ruddy.vercel.app';

export default function Profile() {
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch projects
        const projectsRes = await axios.get(`${API}/api/projects`, { headers });
        const projects = projectsRes.data;

        // Fetch tasks
        const tasksRes = await axios.get(`${API}/api/tasks`, { headers });
        const tasks = tasksRes.data;

        // Filter out tasks specifically assigned to the user if they are a manager but looking at their own stats
        // Actually, let's just use all tasks returned for simplicity, or filter by assigneeID if we want strict personal stats.
        const personalTasks = user.role === 'admin' ? tasks : tasks.filter(t => t.assigneeID === user.id || t.assignee?.username === user.username);
        // Fallback for assigneeID check since user.id is user.userID
        const myTasks = tasks.filter(t => t.assigneeID === user.userID || !t.assigneeID); // just use tasks for now as a general overview

        const completed = tasks.filter(t => t.status === 'done').length;
        const pending = tasks.length - completed;

        setStats({
          totalProjects: projects.length,
          totalTasks: tasks.length,
          completedTasks: completed,
          pendingTasks: pending,
        });

        // Get 5 most recent tasks
        const sortedTasks = [...tasks].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);
        setRecentTasks(sortedTasks);

      } catch (err) {
        console.error('Failed to fetch user data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const roleColors = {
    'admin': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    'project_manager': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    'team_member': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  };

  const roleLabels = {
    'admin': 'Administrator',
    'project_manager': 'Project Manager',
    'team_member': 'Team Member',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700">
        {/* Background Decorative Gradient */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-90"></div>
        
        <div className="relative pt-16 px-8 pb-8 sm:px-12 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-indigo-100 to-white dark:from-gray-700 dark:to-gray-800 shadow-lg flex items-center justify-center text-5xl font-bold text-indigo-600 dark:text-indigo-400 z-10">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 text-center sm:text-left mb-2">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {user?.username}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">{user?.email}</p>
          </div>
          
          <div className="mb-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${roleColors[user?.role] || roleColors['team_member']} shadow-sm`}>
              {roleLabels[user?.role] || user?.role}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details & Stats */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
              <div className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1">Projects</div>
              <div className="text-3xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {stats.totalProjects}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
              <div className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1">Total Tasks</div>
              <div className="text-3xl font-black text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {stats.totalTasks}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
              <div className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1">Completed</div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.completedTasks}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
              <div className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1">Pending</div>
              <div className="text-3xl font-black text-amber-500 dark:text-amber-400">
                {stats.pendingTasks}
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Account Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">User ID</label>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-200">#{user?.id || user?.userID}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Security</label>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center gap-2">
                  <span>••••••••••••</span>
                  <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Recent Tasks
              </h3>
            </div>
            
            <div className="p-4 flex-1">
              {recentTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 space-y-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>No recent task activity found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTasks.map(task => (
                    <Link key={task.taskID} to={`/tasks/${task.taskID}`} className="block group">
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-transparent group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:border-indigo-100 dark:group-hover:border-indigo-800 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {task.title}
                          </h4>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                            task.status === 'to_do' ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                            task.status === 'doing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                          }`}>
                            {task.status === 'to_do' ? 'To Do' : task.status === 'doing' ? 'In Progress' : 'Done'}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-4">
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                            </svg>
                            {task.project?.name || 'Project'}
                          </span>
                          {task.deadline && (
                            <span className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
