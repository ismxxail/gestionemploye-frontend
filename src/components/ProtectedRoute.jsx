// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ allowedRoles = [] }) {

  const { user, loading, token } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card p-8 text-center">
          <div className="loader mx-auto mb-4" style={{ width: '48px', height: '48px' }}></div>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
            Vérification de votre session...
          </p>
        </div>
      </div>
    );
  }

  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const redirectPath = user.role === 'admin' 
      ? '/admin/employeurs' 
      : '/employeur/dashboard';
    
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}