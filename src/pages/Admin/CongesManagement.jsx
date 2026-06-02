// src/pages/Admin/CongesManagement.jsx
import { useState, useEffect } from 'react';
import { getAllConges, updateCongeStatus } from '../../services/api';
import { toast } from 'react-toastify';

export default function CongesManagement() {
  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // Pour indiquer quel congé est en cours de traitement

  useEffect(() => {
    loadConges();
  }, []);

  const loadConges = async () => {
    setLoading(true);
    try {
      const { data } = await getAllConges();
      // Trier : en attente en premier, puis par date récente
      const sorted = (data.conges || []).sort((a, b) => {
        if (a.status === 'En attente' && b.status !== 'En attente') return -1;
        if (b.status === 'En attente' && a.status !== 'En attente') return 1;
        return new Date(b.start_date) - new Date(a.start_date);
      });
      setConges(sorted);
    } catch (err) {
      console.error("Erreur chargement congés admin:", err);
      toast.error("Impossible de charger les demandes de congés");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (congeId, newStatus) => {
    if (processingId === congeId) return;

    const comment = newStatus === 'Refuser'
      ? prompt("Veuillez indiquer la raison du refus (optionnel) :")
      : '';

    if (newStatus === 'Refuser' && !comment?.trim()) {
      if (!window.confirm("Confirmez-vous le refus sans commentaire ?")) return;
    }

    setProcessingId(congeId);

    try {
      await updateCongeStatus(congeId, { 
        status: newStatus,
        admin_comment: comment?.trim() || null
      });

      toast.success(`Demande ${newStatus.toLowerCase()} avec succès !`);
      loadConges(); // Rafraîchir
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la mise à jour";
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="loader" style={{ margin: '0 auto 1.5rem' }}></div>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>
            Chargement des demandes de congés...
          </p>
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
          Gestion des Demandes de Congés
        </h1>
        <p className="subtitle" style={{ marginTop: '0.75rem' }}>
          Validez ou refusez les demandes des employés • {conges.length} demande(s) au total
        </p>
      </div>

      {conges.length === 0 ? (
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Aucune demande pour le moment
          </p>
          <p style={{ color: 'var(--text-light)' }}>
            Les demandes des employés apparaîtront ici dès qu'elles seront soumises
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="section-header" style={{
            background: 'linear-gradient(to right, #1f2937, #111827)'
          }}>
            Toutes les Demandes de Congés
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
                    Période
                  </th>
                  <th style={{ padding: '1.2rem 1.5rem', textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Motif
                  </th>
                  <th style={{ padding: '1.2rem 1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Statut
                  </th>
                  <th style={{ padding: '1.2rem 1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {conges.map((conge) => {
                  const isProcessing = processingId === conge.id;
                  const statusStyle = {
                    'Accepter': { bg: 'linear-gradient(135deg, #dcfce7, #a7f3d0)', text: '#166534', label: 'Accepté' },
                    'Refuser':  { bg: 'linear-gradient(135deg, #fee2e2, #fecaca)', text: '#991b1b', label: 'Refusé' },
                    'En attente': { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', text: '#92400e', label: 'En attente' },
                  }[conge.status] || { bg: '#e5e7eb', text: '#4b5563', label: conge.status };

                  return (
                    <tr key={conge.id} style={{
                      borderBottom: '1px solid var(--glass-border)',
                      transition: 'background 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '1.2rem 1.5rem', fontWeight: 500, color: 'var(--text)' }}>
                        {conge.employeur?.name || `Employé #${conge.employeur_id}`}
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', color: 'var(--text)' }}>
                        {new Date(conge.start_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {' → '}
                        {new Date(conge.end_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', color: 'var(--text-light)' }}>
                        {conge.reason || '—'}
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
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
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                        {conge.status === 'En attente' && (
                          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => handleStatusChange(conge.id, 'Accepter')}
                              disabled={isProcessing}
                              style={{
                                padding: '0.6rem 1.2rem',
                                background: isProcessing ? '#9ca3af' : 'linear-gradient(90deg, #10b981, #059669)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 600,
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                opacity: isProcessing ? 0.7 : 1,
                                transition: 'all 0.2s',
                              }}
                            >
                              Accepter
                            </button>

                            <button
                              onClick={() => handleStatusChange(conge.id, 'Refuser')}
                              disabled={isProcessing}
                              style={{
                                padding: '0.6rem 1.2rem',
                                background: isProcessing ? '#9ca3af' : 'linear-gradient(90deg, #ef4444, #dc2626)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 600,
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                opacity: isProcessing ? 0.7 : 1,
                                transition: 'all 0.2s',
                              }}
                            >
                              Refuser
                            </button>
                          </div>
                        )}

                        {conge.status !== 'En attente' && (
                          <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>
                            Traitée
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}