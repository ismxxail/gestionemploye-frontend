// src/pages/Employeur/MesPresences.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyPresences } from '../../services/api';
import CheckInOut from '../../components/CheckInOut';
import { toast } from 'react-toastify';

export default function MesPresences() {
  const { user } = useAuth();
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPresences = async () => {
    if (!user?.id) {
      setError("Utilisateur non identifié");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await getMyPresences(user.id);
      const sorted = (data.presences || []).sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setPresences(sorted);
    } catch (err) {
      const msg = err.response?.data?.message || "Impossible de charger l'historique";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresences();
  }, [user?.id]);

  const handlePresenceUpdate = () => {
    fetchPresences();
  };

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '—';
    const start = new Date(`1970-01-01T${checkIn}`);
    const end   = new Date(`1970-01-01T${checkOut}`);
    let diffMs = end - start;
    if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins  = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins.toString().padStart(2, '0')}min`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos présences...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-2xl mx-auto">
          <p className="text-red-700 font-medium mb-2">Une erreur est survenue</p>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchPresences}
            className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="loader"></div>
          <p style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-light)' }}>
            Chargement de vos présences...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Erreur</h2>
          <p style={{ color: '#ef4444', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={fetchPresences} className="btn btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '3rem' }}>
        <h1>Mes Présences</h1>
        <p className="subtitle">Suivez vos pointages et consultez votre historique</p>
      </div>

      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div className="section-header">Pointage du jour</div>
        <div style={{ padding: '2rem' }}>
          <CheckInOut onSuccess={handlePresenceUpdate} />
        </div>
      </div>

      <div className="card">
        <div className="section-header" style={{ background: 'linear-gradient(to right, #1f2937, #111827)' }}>
          Historique complet
        </div>

        {presences.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px',
              background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <svg width="40" height="40" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Aucune présence pour le moment
            </p>
            <p style={{ color: 'var(--text-light)' }}>Vos pointages apparaîtront ici</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th style={{ textAlign: 'center' }}>Entrée</th>
                  <th style={{ textAlign: 'center' }}>Sortie</th>
                  <th style={{ textAlign: 'center' }}>Durée</th>
                  <th style={{ textAlign: 'center' }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {presences.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>
                      {new Date(p.date).toLocaleDateString('fr-FR', {
                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="status-pill" style={{ background: '#dbeafe', color: '#1e40af' }}>
                        {p.check_in ? p.check_in.substring(0,5) : '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="status-pill" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                        {p.check_out ? p.check_out.substring(0,5) : '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      {calculateDuration(p.check_in, p.check_out)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {p.check_in && p.check_out ? (
                        <span className="status-pill" style={{ background: '#dcfce7', color: '#166534' }}>Complet</span>
                      ) : p.check_in ? (
                        <span className="status-pill" style={{ background: '#fef3c7', color: '#92400e' }}>En cours</span>
                      ) : (
                        <span className="status-pill" style={{ background: '#f3f4f6', color: '#374151' }}>Absent</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}