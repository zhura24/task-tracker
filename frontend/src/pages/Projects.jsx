import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProjects();
  }, [token]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/projects', 
        { name: newProjectName, description: newProjectDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCreateModal(false);
      setNewProjectName('');
      setNewProjectDesc('');
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create project');
    }
  };

  if (loading) return <div className="p-4 text-gray-600">Loading projects...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Projects</h1>
        {(user?.role === 'project_manager' || user?.role === 'admin') && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            + Create Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full text-gray-500 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
            No projects found.
          </div>
        ) : (
          projects.map(p => (
            <Link key={p.projectID} to={`/projects/${p.projectID}`} className="block group">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition hover:border-indigo-200 dark:hover:border-indigo-500 h-full flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-2">{p.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm flex-1">{p.description || 'No description provided.'}</p>
                <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">Created: {new Date(p.createdAt).toLocaleDateString()}</div>
              </div>
            </Link>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
                <input type="text" required value={newProjectName} onChange={e => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows="3" value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
