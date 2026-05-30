import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';

export default function Dashboard() {
  const { user, token } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          axios.get('https://task-tracker-backend-ruddy.vercel.app/api/projects', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('https://task-tracker-backend-ruddy.vercel.app/api/tasks', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setProjects(projectsRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const tasksToDo = tasks.filter(t => t.status === 'to_do').length;
  const tasksDoing = tasks.filter(t => t.status === 'doing').length;
  
  // Sort tasks by ID descending to simulate "recent"
  const recentTasks = [...tasks].sort((a, b) => b.taskID - a.taskID).slice(0, 5);

  if (loading) return <div className="p-8 text-gray-600 dark:text-gray-400">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Welcome, {user?.username}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Projects</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{projects.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Tasks To Do</h3>
          <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{tasksToDo}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Tasks In Progress</h3>
          <p className="text-3xl font-bold text-blue-500 dark:text-blue-400">{tasksDoing}</p>
        </div>
      </div>

      <div className="mt-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 text-gray-900 dark:text-gray-100">Recent Tasks</h2>
        <div className="space-y-4">
          {recentTasks.length === 0 && <p className="text-gray-500 dark:text-gray-400 italic">No tasks found.</p>}
          {recentTasks.map(task => (
            <Link key={task.taskID} to={`/tasks/${task.taskID}`} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{task.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Project: {task.project?.name || 'Unknown'}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                task.status === 'to_do' ? 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200' :
                task.status === 'doing' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' :
                'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
              }`}>
                {task.status.replace('_', ' ').toUpperCase()}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
