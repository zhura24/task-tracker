import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const STATUS_CONFIG = {
  to_do:  { label: 'To Do',       color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',         dot: 'bg-gray-400'   },
  doing:  { label: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',      dot: 'bg-blue-500'   },
  done:   { label: 'Done',        color: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',  dot: 'bg-green-500'  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.to_do;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
      {cfg.label}
    </span>
  );
}

export default function TaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ title: '', description: '', assigneeID: '', deadline: '' });
  const [savingStatus, setSavingStatus] = useState(false);
  const { token, user } = useAuthStore();

  const fetchTaskDetails = async () => {
    try {
      const res = await axios.get(`https://task-tracker-backend-ruddy.vercel.app/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const currentTask = res.data;
      setTask(currentTask);

      if (currentTask) {
        const projRes = await axios.get(`https://task-tracker-backend-ruddy.vercel.app/api/projects/${currentTask.projectID}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjectMembers(projRes.data.members || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`https://task-tracker-backend-ruddy.vercel.app/api/tasks/${id}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTaskDetails();
      fetchComments();
    }
  }, [token, id]);

  const handleUpdateStatus = async (status) => {
    setSavingStatus(true);
    try {
      await axios.patch(`https://task-tracker-backend-ruddy.vercel.app/api/tasks/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTask({ ...task, status });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  const openEditModal = () => {
    setEditFormData({
      title: task.title || '',
      description: task.description || '',
      assigneeID: task.assigneeID || '',
      deadline: task.deadline ? new Date(task.deadline).toISOString().substring(0, 10) : ''
    });
    setShowEditModal(true);
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://task-tracker-backend-ruddy.vercel.app/api/tasks/${id}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEditModal(false);
      fetchTaskDetails();
    } catch (err) {
      alert('Failed to edit task');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await axios.post(`https://task-tracker-backend-ruddy.vercel.app/api/tasks/${id}/comments`, { content: newComment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewComment('');
      fetchComments();
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
        <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Loading task details...
      </div>
    </div>
  );

  if (!task) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Task not found</p>
        <Link to="/projects" className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:underline text-sm">← Back to Projects</Link>
      </div>
    </div>
  );

  const isManager = user?.role === 'admin' || user?.role === 'project_manager';
  // Fix: use id (from JWT) not userID
  const canEditStatus = isManager || user?.id === task.assigneeID;

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

      {/* ── Left: Task Info ─────────────────────────────── */}
      <div className="lg:col-span-2 space-y-5">

        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-indigo-100/40 dark:shadow-none border border-gray-100 dark:border-gray-700/60 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100/50">
          {/* Top accent bar by status */}
          <div className={`h-2.5 w-full ${task.status === 'done' ? 'bg-gradient-to-r from-green-400 to-green-600' : task.status === 'doing' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500'}`} />

          <div className="p-6 md:p-8">
            {/* Breadcrumb */}
            <Link
              to={`/projects/${task.projectID}`}
              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium mb-5 group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to {task.project?.name || 'Project'}
            </Link>

            {/* Title Row */}
            <div className="flex flex-wrap gap-3 items-start justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 leading-tight break-words">
                  {task.title}
                </h1>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={task.status} />
                {isManager && (
                  <button
                    onClick={openEditModal}
                    className="flex items-center gap-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-400 px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Edit Task
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {task.description || <span className="italic text-gray-400 dark:text-gray-500">No description provided.</span>}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Assignee */}
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/80 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700/60 p-6 flex flex-col justify-center transition-transform hover:-translate-y-1 hover:shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Assignee</p>
            <div className="flex items-center gap-3">
              {task.assignee ? (
                <>
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {task.assignee.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{task.assignee.username}</span>
                </>
              ) : (
                <span className="text-gray-400 dark:text-gray-500 italic text-sm">Unassigned</span>
              )}
            </div>
          </div>

          {/* Deadline */}
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/80 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700/60 p-6 flex flex-col justify-center transition-transform hover:-translate-y-1 hover:shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Deadline</p>
            {task.deadline ? (
              <div className={`flex items-center gap-2 font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                {isOverdue && <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">Overdue</span>}
              </div>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 italic text-sm">Not set</span>
            )}
          </div>
        </div>

        {/* Status Updater */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700/60 p-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Update Status</p>
          {canEditStatus ? (
            <div className="flex gap-2 flex-wrap">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => handleUpdateStatus(key)}
                  disabled={savingStatus}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                    task.status === key
                      ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
                  {cfg.label}
                  {task.status === key && (
                    <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  )}
                </button>
              ))}
              {savingStatus && <span className="text-xs text-gray-400 dark:text-gray-500 self-center italic">Saving...</span>}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Only the assigned member or project manager can change this task's status.
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Comments ─────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-indigo-100/30 dark:shadow-none border border-gray-100 dark:border-gray-700/60 flex flex-col sticky top-6 overflow-hidden" style={{ maxHeight: 'calc(100vh - 6rem)' }}>
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            Comments
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 font-normal">{comments.length} message{comments.length !== 1 ? 's' : ''}</span>
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {comments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
              <svg className="w-10 h-10 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <p className="text-sm italic">No comments yet. Be the first!</p>
            </div>
          )}
          {comments.map(c => (
            <div key={c.commentID} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/60 dark:to-purple-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm border border-indigo-50 dark:border-indigo-800/50">
                {c.user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 bg-white dark:bg-gray-700/80 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-600/50 relative">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-200">{c.user?.username}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(c.createdAt).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddComment} className="p-5 border-t border-gray-100 dark:border-gray-700">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none transition"
            rows="3"
            required
          />
          <button
            type="submit"
            className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            Post Comment
          </button>
        </form>
      </div>

      {/* ── Edit Task Modal ──────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Task</h2>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleEditTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title <span className="text-red-500">*</span></label>
                <input
                  type="text" required
                  value={editFormData.title}
                  onChange={e => setEditFormData({...editFormData, title: e.target.value})}
                  className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea
                  rows="3"
                  value={editFormData.description}
                  onChange={e => setEditFormData({...editFormData, description: e.target.value})}
                  className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Assignee</label>
                <select
                  value={editFormData.assigneeID}
                  onChange={e => setEditFormData({...editFormData, assigneeID: e.target.value})}
                  className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
                >
                  <option value="">— Unassigned —</option>
                  {projectMembers.map(m => (
                    <option key={m.user.userID} value={m.user.userID}>{m.user.username} ({m.user.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Deadline</label>
                <input
                  type="date"
                  value={editFormData.deadline}
                  onChange={e => setEditFormData({...editFormData, deadline: e.target.value})}
                  className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-xl font-semibold transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
