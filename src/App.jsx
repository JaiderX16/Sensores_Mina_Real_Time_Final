import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/auth/Login.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Settings from './pages/settings/Settings';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return children;
};
  
function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;