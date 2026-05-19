import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user: currentUser } = useAuthStore();
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, username: '', email: '', role: 'team_member', password: '' });

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const payload = { username: formData.username, email: formData.email, role: formData.role };
        if (formData.password) payload.password = formData.password;
        await axios.put(`http://localhost:3000/api/users/${formData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:3000/api/users', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const openModal = (userToEdit = null) => {
    if (userToEdit) {
      setIsEditing(true);
      setFormData({ id: userToEdit.userID, username: userToEdit.username, email: userToEdit.email, role: userToEdit.role, password: '' });
    } else {
      setIsEditing(false);
      setFormData({ id: null, username: '', email: '', role: 'team_member', password: '' });
    }
    setShowModal(true);
  };

  if (currentUser?.role !== 'admin') {
    return <div className="p-8 text-center text-red-600 font-bold">Unauthorized. Administrator access only.</div>;
  }

  if (loading) return <div className="p-4 text-gray-600">Loading users...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          + Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Username</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.userID} className="hover:bg-gray-50 transition">
                <td className="p-4 text-gray-500">{u.userID}</td>
                <td className="p-4 font-medium text-gray-900">{u.username}</td>
                <td className="p-4 text-gray-600">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    u.role === 'admin' ? 'bg-red-100 text-red-800' :
                    u.role === 'project_manager' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {u.role.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => openModal(u)} className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">Edit</button>
                  <button onClick={() => handleDelete(u.userID)} className="text-red-600 hover:text-red-900 font-medium text-sm">Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500 italic">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit User' : 'Add New User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="team_member">Team Member</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {isEditing && <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>}
                </label>
                <input type="password" required={!isEditing} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">{isEditing ? 'Save Changes' : 'Add User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
