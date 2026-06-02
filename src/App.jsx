import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import EmployeursList from './pages/Admin/EmployeursList';
import CongesManagement from './pages/Admin/CongesManagement';
import PresencesList from './pages/Admin/PresencesList';
import Dashboard from './pages/Employeur/Dashboard';
import MesConge from './pages/Employeur/MesConge';
import MesPresences from './pages/Employeur/MesPresences';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        
        <div className="container" style={{ paddingTop: '2rem', minHeight: 'calc(100vh - 70px)' }}>
          <Routes>
            
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/employeurs" element={<EmployeursList />} />
              <Route path="/admin/conges" element={<CongesManagement />} />
              <Route path="/admin/presences" element={<PresencesList />} />
              <Route path="/admin" element={<Navigate to="/admin/employeurs" replace />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['employeur']} />}>
              <Route path="/employeur/dashboard" element={<Dashboard />} />
              <Route path="/employeur/conges" element={<MesConge />} />
              <Route path="/employeur/presences" element={<MesPresences />} />
              <Route path="/employeur" element={<Navigate to="/employeur/dashboard" replace />} />
            </Route>
            <Route index element={<Navigate to="/login" replace />} />

            <Route path="*" element={<div className="text-center py-20 text-2xl">404 - Page non trouvée</div>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}



export default App;