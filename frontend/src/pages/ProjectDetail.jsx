import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuthStore();
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assigneeID: '', deadline: '' });
  const [memberEmail, setMemberEmail] = useState('');

  const fetchProject = async () => {
    try {
      const res = await axios.get(`https://task-tracker-backend-ruddy.vercel.app/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://task-tracker-backend-ruddy.vercel.app/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      // User might not have permission to list all users, but we try.
    }
  };

  useEffect(() => {
    if (token) {
      fetchProject();
      if (user?.role === 'admin' || user?.role === 'project_manager') {
        fetchUsers();
      }
    }
  }, [token, id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`https://task-tracker-backend-ruddy.vercel.app/api/projects/${id}/tasks`, newTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', assigneeID: '', deadline: '' });
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail) return;
    try {
      await axios.post(`https://task-tracker-backend-ruddy.vercel.app/api/projects/${id}/members`, { email: memberEmail }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowMemberModal(false);
      setMemberEmail('');
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await axios.delete(`https://task-tracker-backend-ruddy.vercel.app/api/projects/${id}/members/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove member');
    }
  };

  const statusColors = {
    'to_do': 'bg-gray-200 text-gray-800',
    'doing': 'bg-blue-100 text-blue-800',
    'done': 'bg-green-100 text-green-800'
  };

  if (loading) return <div className="p-4 text-gray-600">Loading project details...</div>;
  if (!project) return <div className="p-4 text-red-600">Project not found</div>;

  const isManager = user?.role === 'admin' || user?.role === 'project_manager';

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{project.name}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
        <div className="flex gap-4 text-sm">
          <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full font-medium">Manager: {project.manager?.username}</span>
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">Members: {project.members?.length || 0}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Tasks</h2>
            {isManager && (
              <button onClick={() => setShowTaskModal(true)} className="bg-indigo-600 text-white px-3 py-1.5 text-sm rounded-lg font-medium hover:bg-indigo-700">
                + New Task
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {project.tasks?.length === 0 && <div className="text-gray-500 dark:text-gray-400 italic bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">No tasks in this project.</div>}
            {project.tasks?.map(task => (
              <Link key={task.taskID} to={`/tasks/${task.taskID}`} className="block bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{task.title}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{task.description}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[task.status] || 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="mt-4 flex items-center text-xs text-gray-400 dark:text-gray-500">
                  <span className="mr-4">Assignee: {task.assignee ? task.assignee.username : 'Unassigned'}</span>
                  <span>Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'None'}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Members Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Team Members</h2>
            {isManager && (
              <button onClick={() => setShowMemberModal(true)} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 text-sm rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                + Add Member
              </button>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {project.members?.map(m => (
                <li key={m.user.userID} className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
                    {m.user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{m.user.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{m.user.email}</p>
                  </div>
                  {isManager && (
                    <button onClick={() => handleRemoveMember(m.user.userID)} className="ml-auto text-xs text-red-500 hover:text-red-700 dark:text-red-400 font-medium">Remove</button>
                  )}
                </li>
              ))}
              {project.members?.length === 0 && <li className="p-4 text-sm text-gray-500 dark:text-gray-400 italic">No members added yet.</li>}
            </ul>
          </div>
        </div>
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input type="text" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows="3" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                <input type="date" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignee</label>
                <select value={newTask.assigneeID} onChange={e => setNewTask({...newTask, assigneeID: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Unassigned --</option>
                  {project.members?.map(m => (
                    <option key={m.user.userID} value={m.user.userID}>{m.user.username}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold mb-4">Add Team Member</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User Email</label>
                <input type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowMemberModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Add to Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
