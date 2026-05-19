import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  
  login: async (identifier, password) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', { identifier, password });
      const { user, token } = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      set({ user, token });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  },

  signup: async (username, email, password, role) => {
    try {
      await axios.post('http://localhost:3000/api/auth/register', { username, email, password, role });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Signup failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));

export default useAuthStore;
