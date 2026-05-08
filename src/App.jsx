import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Landing from './pages/Landing';
import Register from './pages/Register';
import Track from './pages/Track';
import Login from './pages/Login';
import AuthSuccess from './pages/AuthSuccess';
import ProtectedRoute from './components/ProtectedRoute';
import Onboarding from './pages/Onboarding/Onboarding';

import UserDashboard from './pages/Dashboard/UserDashboard';
import StaffDashboard from './pages/Dashboard/StaffDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ComplaintDetail from './pages/Complaint/ComplaintDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<Landing />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/track"      element={<Track />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/onboarding"   element={<Onboarding />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        } />

        <Route path="/staff" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/complaint/:id" element={
          <ProtectedRoute>
            <ComplaintDetail />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;