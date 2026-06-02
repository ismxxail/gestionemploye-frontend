// src/components/CongeList.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMyConges } from '../services/api';

export default function CongeList() {
  const { user } = useAuth();
  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchConges = async () => {
      try {
        const { data } = await getMyConges(user.id);
        // Optionnel : tri par date la plus récente en premier
        const sorted = (data.conges || []).sort((a, b) => 
          new Date(b.start_date) - new Date(a.start_date)
        );
        setConges(sorted);
      } catch (err) {
        console.error("Erreur chargement congés:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConges();
  }, [user?.id]);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepter':
      case 'accepté':
        return {
          bg: 'linear-gradient(135deg, #dcfce7, #a7f3d0)',
          text: '#166534',
          label: 'Accepté'
        };
      case 'refuser':
      case 'refusé':
        return {
          bg: 'linear-gradient(135deg, #fee2e2, #fecaca)',
          text: '#991b1b',
          label: 'Refusé'
        };
      case 'en attente':
      case 'pending':
      default:
        return {
          bg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          text: '#92400e',
          label: 'En attente'
        };
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div className="loader" style={{ margin: '0 auto 1.5rem' }}></div>
        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
          Chargement de vos demandes...
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="section-header">
        Mes Demandes de Congé
      </div>

      {conges.length === 0 ? (
        <div style={{
          padding: '5rem 2rem',
          textAlign: 'center',
          color: 'var(--text-light)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 1.5rem',
            background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <svg width="40" height="40" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Aucune demande pour le moment
          </p>
          <p style={{ fontSize: '1rem' }}>
            Vos demandes de congé apparaîtront ici une fois envoyées
          </p>
        </div>
      ) : (
        <div style={{ padding: '1rem 0' }}>
          {conges.map((conge) => {
            const statusStyle = getStatusStyle(conge.status);
            return (
              <div
                key={conge.id}
                className="hover:bg-white/10 transition-all duration-300"
                style={{
                  padding: '1.5rem 2rem',
                  borderBottom: '1px solid var(--glass-border)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1.5rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: 'var(--text)',
                      marginBottom: '0.5rem'
                    }}>
                      {new Date(conge.start_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                      {' → '}
                      {new Date(conge.end_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>

                    {conge.reason && (
                      <p style={{
                        fontSize: '0.95rem',
                        color: 'var(--text-light)',
                        marginTop: '0.4rem',
                        lineHeight: 1.5
                      }}>
                        {conge.reason}
                      </p>
                    )}
                  </div>

                  <span style={{
                    padding: '0.5rem 1.2rem',
                    borderRadius: '999px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    background: statusStyle.bg,
                    color: statusStyle.text,
                    whiteSpace: 'nowrap'
                  }}>
                    {statusStyle.label}
                  </span>
                </div>

                {conge.admin_comment && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.8rem 1rem',
                    background: 'rgba(0,0,0,0.03)',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    color: 'var(--text-light)',
                    fontStyle: 'italic',
                    borderLeft: '3px solid var(--primary)'
                  }}>
                    Commentaire administrateur : {conge.admin_comment}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}