import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoutes';

import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Tenants from './pages/Tenants';
import Contracts from './pages/Contracts';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Users from './pages/Users';
import Forbidden from './pages/Forbidden';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forbidden" element={<Forbidden />} />
      
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* LANDLORD and ADMIN can see Dashboard */}
        <Route path="dashboard" element={
          <RoleRoute allowedRoles={['ADMIN', 'LANDLORD']}>
            <Dashboard />
          </RoleRoute>
        } />
        
        {/* All roles can see these */}
        <Route path="rooms" element={<Rooms />} />
        <Route path="tenants" element={<Tenants />} />
        <Route path="contracts" element={<Contracts />} />
        <Route path="notifications" element={<Notifications />} />
        
        {/* LANDLORD and ADMIN can see Reports */}
        <Route path="reports" element={
          <RoleRoute allowedRoles={['ADMIN', 'LANDLORD']}>
            <Reports />
          </RoleRoute>
        } />
        
        {/* ONLY ADMIN can see Users and AuditLogs */}
        <Route path="audit-logs" element={
          <RoleRoute allowedRoles={['ADMIN']}>
            <AuditLogs />
          </RoleRoute>
        } />
        <Route path="users" element={
          <RoleRoute allowedRoles={['ADMIN']}>
            <Users />
          </RoleRoute>
        } />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
