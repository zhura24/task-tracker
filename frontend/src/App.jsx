import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';

// Dummy imports for now, we will create these files next
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import TaskDetail from './pages/TaskDetail';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import Layout from './components/Layout';

function PrivateRoute({ children }) {
  const { user } = useAuthStore();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route path="/*" element={
          <PrivateRoute>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/profile" element={<Profile />} />
              {/* Other routes will be added here */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
