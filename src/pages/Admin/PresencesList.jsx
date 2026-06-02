// src/pages/Admin/PresencesList.jsx
import { useState, useEffect } from 'react';
import { getAllPresences } from '../../services/api';
import { toast } from 'react-toastify';

export default function PresencesList() {
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllPresences = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getAllPresences(); // endpoint admin only
        // Tri : d'abord par employé, puis par date descendante
        const sorted = (data.presences || []).sort((a, b) => {
          if (a.employeur_id !== b.employeur_id) return a.employeur_id - b.employeur_id;
          return new Date(b.date) - new Date(a.date);
        });
        setPresences(sorted);
      } catch (err) {
        console.error("Erreur chargement présences admin:", err);
        const msg = err.response?.data?.message || "Impossible de charger les présences";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPresences();
  }, []);

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '—';
    const start = new Date(`1970-01-01T${checkIn}`);
    const end = new Date(`1970-01-01T${checkOut}`);
    let diffMs = end - start;
    if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins.toString().padStart(2, '0')}min`;
  };

  const getStatusStyle = (hasIn, hasOut) => {
    if (hasIn && hasOut) return { bg: 'linear-gradient(135deg, #dcfce7, #a7f3d0)', text: '#166534', label: 'Complet' };
    if (hasIn) return { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', text: '#92400e', label: 'En cours' };
    return { bg: 'linear-gradient(135deg, #e5e7eb, #d1d5db)', text: '#374151', label: 'Absent' };
  };

  if (loading) {
    return (
      <div className="container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="loader" style={{ margin: '0 auto 1.5rem' }}></div>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>
            Chargement de toutes les présences...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '600px', margin: '4rem auto' }}>
          <h3 style={{ fontSize: '1.6rem', color: '#dc2626', marginBottom: '1rem' }}>Erreur</h3>
          <p style={{ color: '#ef4444' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1.5rem',
              padding: '0.8rem 1.8rem',
              background: 'linear-gradient(90deg, var(--primary), var(--accent))',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* En-tête */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
          background: 'linear-gradient(to right, var(--primary), var(--accent))',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          fontWeight: 800,
        }}>
          Toutes les Présences
        </h1>
        <p className="subtitle" style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          Suivi global des pointages de tous les employés
          <span style={{
            background: 'rgba(99,102,241,0.1)',
            padding: '0.4rem 1rem',
            borderRadius: '999px',
            fontSize: '0.95rem',
            color: 'var(--primary)',
          }}>
            {presences.length} enregistrement{presences.length !== 1 ? 's' : ''}
          </span>
        </p>
      </div>

      {presences.length === 0 ? (
        <div className="card" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '90px',
            height: '90px',
            margin: '0 auto 1.5rem',
            background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="48" height="48" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Aucune présence enregistrée
          </p>
          <p style={{ color: 'var(--text-light)' }}>
            Les pointages des employés apparaîtront ici une fois effectués
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="section-header" style={{
            background: 'linear-gradient(to right, #1f2937, #111827)'
          }}>
            Historique Complet des Pointages
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}>
                  <th style={{ padding: '1.2rem 1.5rem', textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Employé
                  </th>
                  <th style={{ padding: '1.2rem 1.5rem', textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Date
                  </th>
                  <th style={{ padding: '1.2rem 1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Entrée
                  </th>
                  <th style={{ padding: '1.2rem 1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Sortie
                  </th>
                  <th style={{ padding: '1.2rem 1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Durée
                  </th>
                  <th style={{ padding: '1.2rem 1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {presences.map((p) => {
                  const hasIn = !!p.check_in;
                  const hasOut = !!p.check_out;
                  const statusStyle = getStatusStyle(hasIn, hasOut);

                  return (
                    <tr key={p.id} style={{
                      borderBottom: '1px solid var(--glass-border)',
                      transition: 'background 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '1.2rem 1.5rem', fontWeight: 500, color: 'var(--text)' }}>
                        {p.employeur?.name || `Employé #${p.employeur_id}`}
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.3rem' }}>
                          ID: {p.employeur_id}
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', color: 'var(--text)' }}>
                        {new Date(p.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '999px',
                          fontSize: '0.875rem',
                          background: hasIn ? '#dbeafe' : '#f3f4f6',
                          color: hasIn ? '#1e40af' : '#4b5563',
                        }}>
                          {hasIn ? p.check_in.substring(0, 5) : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '999px',
                          fontSize: '0.875rem',
                          background: hasOut ? '#e0f2fe' : '#f3f4f6',
                          color: hasOut ? '#1e3a8a' : '#4b5563',
                        }}>
                          {hasOut ? p.check_out.substring(0, 5) : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center', fontWeight: 600, color: 'var(--text)' }}>
                        {calculateDuration(p.check_in, p.check_out)}
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.5rem 1.2rem',
                          borderRadius: '999px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          background: statusStyle.bg,
                          color: statusStyle.text,
                        }}>
                          {statusStyle.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{
        marginTop: '2.5rem',
        textAlign: 'center',
        fontSize: '0.9rem',
        color: 'var(--text-light)',
        fontStyle: 'italic',
      }}>
        Données en temps réel • Dernière mise à jour : {new Date().toLocaleString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
}