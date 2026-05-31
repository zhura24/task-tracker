import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const API = 'https://task-tracker-backend-ruddy.vercel.app';

const ROLE_LABELS = {
  'Member': 'Member',
  'Lead': 'Team Lead',
  'Developer': 'Developer',
  'Designer': 'Designer',
  'QA': 'QA Engineer',
  'DevOps': 'DevOps',
};

const ROLE_COLORS = {
  'Manager': 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
  'Lead':    'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  'Developer':'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  'Designer': 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300',
  'QA':       'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
  'DevOps':   'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  'Member':   'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
};

const statusColors = {
  'to_do': 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
  'doing': 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
  'done':  'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
};

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showTaskModal, setShowTaskModal]     = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newTask, setNewTask]           = useState({ title: '', description: '', assigneeID: '', deadline: '' });
  const [memberEmail, setMemberEmail]   = useState('');
  const [editingRole, setEditingRole]   = useState({}); // { [userID]: selectedRole }
  const [savingRole, setSavingRole]     = useState(null);
  const { user, token } = useAuthStore();

  const headers = { Authorization: `Bearer ${token}` };

  const fetchProject = async () => {
    try {
      const res = await axios.get(`${API}/api/projects/${id}`, { headers });
      setProject(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchProject(); }, [token, id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/projects/${id}/tasks`, newTask, { headers });
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
      await axios.post(`${API}/api/projects/${id}/members`, { email: memberEmail }, { headers });
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
      await axios.delete(`${API}/api/projects/${id}/members/${userId}`, { headers });
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove member');
    }
  };

  const handleSaveRole = async (userId) => {
    const newRole = editingRole[userId];
    if (!newRole) return;
    setSavingRole(userId);
    try {
      await axios.put(`${API}/api/projects/${id}/members/${userId}/role`, { projectRole: newRole }, { headers });
      setEditingRole(prev => { const n = {...prev}; delete n[userId]; return n; });
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update role');
    } finally {
      setSavingRole(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
        <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Loading project...
      </div>
    </div>
  );
  if (!project) return <div className="p-4 text-red-600">Project not found</div>;

  const isManager = user?.role === 'admin' || user?.role === 'project_manager';

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{project.name}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full font-medium">
            Manager: {project.manager?.username}
          </span>
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">
            Members: {(project.members?.length || 0) + 1}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Tasks</h2>
            {isManager && (
              <button onClick={() => setShowTaskModal(true)} className="bg-indigo-600 text-white px-3 py-1.5 text-sm rounded-lg font-medium hover:bg-indigo-700 transition">
                + New Task
              </button>
            )}
          </div>
          <div className="space-y-3">
            {project.tasks?.length === 0 && (
              <div className="text-gray-500 dark:text-gray-400 italic bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                No tasks yet. {isManager && 'Create the first one!'}
              </div>
            )}
            {project.tasks?.map(task => (
              <Link key={task.taskID} to={`/tasks/${task.taskID}`}
                className="block bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{task.title}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 line-clamp-1">{task.description}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ml-3 flex-shrink-0 ${statusColors[task.status] || ''}`}>
                    {task.status === 'to_do' ? 'To Do' : task.status === 'doing' ? 'In Progress' : 'Done'}
                  </span>
                </div>
                <div className="mt-3 flex items-center text-xs text-gray-400 dark:text-gray-500 gap-4">
                  <span>👤 {task.assignee ? task.assignee.username : 'Unassigned'}</span>
                  <span>📅 {task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) : 'No deadline'}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Members Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Team Members</h2>
            {isManager && (
              <button onClick={() => setShowMemberModal(true)}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 text-sm rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                + Add Member
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Project Manager Row */}
            <div className="p-4 flex items-start gap-3 bg-indigo-50/60 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-900/30">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow">
                {project.manager?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{project.manager?.username}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium flex-shrink-0">
                    Project Manager
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{project.manager?.email}</p>
              </div>
            </div>

            {/* Other Members */}
            <ul className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {project.members?.map(m => {
                const roleColor = ROLE_COLORS[m.projectRole] || ROLE_COLORS['Member'];
                const isEditing = editingRole.hasOwnProperty(m.user.userID);
                return (
                  <li key={m.user.userID} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/60 dark:to-purple-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {m.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{m.user.username}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${roleColor}`}>
                            {m.projectRole || 'Member'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{m.user.email}</p>

                        {/* Role Editor (manager only) */}
                        {isManager && (
                          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                            <select
                              value={isEditing ? editingRole[m.user.userID] : (m.projectRole || 'Member')}
                              onChange={e => setEditingRole(prev => ({ ...prev, [m.user.userID]: e.target.value }))}
                              className="text-xs px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                              <option value="Member">Member</option>
                              <option value="Lead">Team Lead</option>
                              <option value="Developer">Developer</option>
                              <option value="Designer">Designer</option>
                              <option value="QA">QA Engineer</option>
                              <option value="DevOps">DevOps</option>
                            </select>
                            {isEditing && (
                              <button
                                onClick={() => handleSaveRole(m.user.userID)}
                                disabled={savingRole === m.user.userID}
                                className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition disabled:opacity-60"
                              >
                                {savingRole === m.user.userID ? 'Saving…' : 'Save'}
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveMember(m.user.userID)}
                              className="ml-auto text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
              {project.members?.length === 0 && (
                <li className="p-6 text-sm text-gray-500 dark:text-gray-400 italic text-center">No members added yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows="3" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                <input type="date" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignee</label>
                <select value={newTask.assigneeID} onChange={e => setNewTask({...newTask, assigneeID: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                  <option value="">-- Unassigned --</option>
                  {project.members?.map(m => (
                    <option key={m.user.userID} value={m.user.userID}>{m.user.username}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition text-sm">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition text-sm">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Add Team Member</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User Email</label>
                <input type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required placeholder="user@example.com"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowMemberModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition text-sm">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition text-sm">Add to Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
