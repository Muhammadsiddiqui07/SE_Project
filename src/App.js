import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './Pages/Login';
import AdminDash from './Pages/AdminDash'; // Uses AdminDashLayout
import Dashboard from './Pages/dashboard'; // Student Dashboard (uses DashLayout)
import TeacherDashLayout from './components/Teacher/TeacherDashLayout';
import Loader from './components/Loader';
import './App.css';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullScreen={true} text="Verifying session..." />;

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const DashboardRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullScreen={true} text="Redirecting..." />;
  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case 'admin': return <Navigate to="/admin" />;
    case 'teacher': return <Navigate to="/teacher" />;
    case 'student': return <Navigate to="/student" />;
    default: return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DashboardRedirect />} />

          <Route path="/admin" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDash />
            </PrivateRoute>
          } />

          <Route path="/teacher" element={
            <PrivateRoute allowedRoles={['teacher']}>
              <TeacherDashLayout />
            </PrivateRoute>
          } />

          <Route path="/student" element={
            <PrivateRoute allowedRoles={['student']}>
              <Dashboard />
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
