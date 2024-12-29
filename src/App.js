import React, { useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Navigation from './components/Navigation';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  return (
    <BrowserRouter>
      <Navigation isAuthenticated={isAuthenticated} userRole={userRole} />
      <Routes>
        <Route path="/login" element={<Login setAuth={setIsAuthenticated} setRole={setUserRole} />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/admin" 
          element={
            isAuthenticated && userRole === 'ROLE_ADMIN' 
              ? <AdminDashboard /> 
              : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated 
              ? <UserDashboard /> 
              : <Navigate to="/login" />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 