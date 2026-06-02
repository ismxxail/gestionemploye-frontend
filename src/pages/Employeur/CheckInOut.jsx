// src/components/CheckInOut.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkIn, checkOut, getMyPresences } from '../services/api';
import { toast } from 'react-toastify';

export default function CheckInOut({ onSuccess }) {
  const { user } = useAuth();
  const [todayPresence, setTodayPresence] = useState(null);
  const [workHours, setWorkHours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWorkingDay, setIsWorkingDay] = useState(true);
  const [isWithinHours, setIsWithinHours] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      try {
        const hoursRes = await fetch('/api/workhours/today');
        const hoursData = await hoursRes.json();

        if (hoursRes.ok && hoursData.start && hoursData.end) {
          setWorkHours({
            start: hoursData.start.substring(0, 5),
            end: hoursData.end.substring(0, 5),
          });
          setIsWorkingDay(true);
        } else {
          setIsWorkingDay(false);
          setError(hoursData.message || "Aucun horaire défini pour aujourd'hui");
        }

        const presRes = await getMyPresences(user.id);
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = presRes.data.presences?.find(p => p.date === today) || null;
        setTodayPresence(todayRecord);
      } catch (err) {
        setError("Erreur lors du chargement des informations");
        toast.error("Impossible de charger les données du jour");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleCheckIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await checkIn(user.id);
      setTodayPresence(data.presence);
      toast.success("Entrée enregistrée avec succès !");
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur check-in";
      setError(msg);
      toast.error(msg);

      if (msg.includes('not a working day')) setIsWorkingDay(false);
      if (msg.includes('Outside working hours')) setIsWithinHours(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await checkOut(user.id);
      setTodayPresence(data.presence);
      toast.success("Sortie enregistrée avec succès !");
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur check-out";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const hasCheckedIn  = !!todayPresence?.check_in;
  const hasCheckedOut = !!todayPresence?.check_out;

  const canCheckIn  = isWorkingDay && isWithinHours && !hasCheckedIn;
  const canCheckOut = isWorkingDay && isWithinHours && hasCheckedIn && !hasCheckedOut;

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des informations du jour...</p>
      </div>
    );
  }

  return (
  <div className="card" style={{ padding: '2.5rem', border: 'none' }}>
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Pointage du jour
      </h3>
      <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>

    {/* Horaires autorisés */}
    {workHours && isWorkingDay && (
      <div style={{
        padding: '1.25rem',
        background: 'linear-gradient(to right, #eef2ff, #e0f2fe)',
        borderRadius: '16px',
        border: '1px solid #c7d2fe',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <svg width="20" height="20" fill="none" stroke="#4f46e5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span style={{ fontWeight: 500, color: '#4338ca' }}>
            Horaires autorisés : <strong>{workHours.start} – {workHours.end}</strong>
          </span>
        </div>
      </div>
    )}

    {/* Erreur */}
    {error && (
      <div style={{
        padding: '1.25rem',
        background: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '16px',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <svg width="20" height="20" fill="none" stroke="#dc2626" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p style={{ fontWeight: 600, color: '#b91c1c', marginBottom: '0.4rem' }}>Action non autorisée</p>
            <p style={{ color: '#991b1b', fontSize: '0.95rem' }}>{error}</p>
          </div>
        </div>
      </div>
    )}

    {/* Cartes entrée/sortie */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
      {['Entrée', 'Sortie'].map((label, i) => (
        <div key={label} style={{
          padding: '1.8rem',
          background: 'linear-gradient(135deg, #f9fafb, #ffffff)',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              width: '60px', height: '60px',
              background: i === 0 ? '#ecfdf5' : '#eff6ff',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto'
            }}>
              <svg width="28" height="28" fill="none" stroke={i === 0 ? '#10b981' : '#3b82f6'} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
            Heure d'{label.toLowerCase()}
          </p>
          <p style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: i === 0 ? '#065f46' : '#1e40af'
          }}>
            {i === 0 
              ? (todayPresence?.check_in ? todayPresence.check_in.substring(0,5) : '--:--')
              : (todayPresence?.check_out ? todayPresence.check_out.substring(0,5) : '--:--')
            }
          </p>
        </div>
      ))}
    </div>

    {/* Boutons */}
    <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    alignItems: 'center',
    marginTop: '2rem'
    }}>
    <button
        onClick={handleCheckIn}
        disabled={!canCheckIn}
        className="btn"
        style={{
        width: '100%',
        maxWidth: '380px',
        padding: '1.1rem 2.5rem',
        fontSize: '1.1rem',
        background: canCheckIn 
            ? 'linear-gradient(90deg, #10b981, #059669)' 
            : 'linear-gradient(90deg, #9ca3af, #6b7280)',
        boxShadow: canCheckIn 
            ? '0 12px 30px rgba(16,185,129,0.35)' 
            : 'none'
        }}
    >
        <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        {hasCheckedIn ? 'Entrée déjà effectuée' : 'Check-in (Entrée)'}
    </button>

    <button
        onClick={handleCheckOut}
        disabled={!canCheckOut}
        className="btn"
        style={{
        width: '100%',
        maxWidth: '380px',
        padding: '1.1rem 2.5rem',
        fontSize: '1.1rem',
        background: canCheckOut 
            ? 'linear-gradient(90deg, #3b82f6, #6366f1)' 
            : 'linear-gradient(90deg, #9ca3af, #6b7280)',
        boxShadow: canCheckOut 
            ? '0 12px 30px rgba(59,130,246,0.35)' 
            : 'none'
        }}
    >
        <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
        </svg>
        {hasCheckedOut ? 'Sortie enregistrée' : 'Check-out (Sortie)'}
    </button>
    </div>

    {/* Non jour travaillé */}
    {!isWorkingDay && !error && (
      <div style={{
        marginTop: '2rem',
        padding: '1.25rem',
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '16px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <svg width="20" height="20" fill="none" stroke="#ca8a04" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span style={{ fontWeight: 600, color: '#a16207' }}>
            Aujourd'hui n'est pas un jour de travail
          </span>
        </div>
      </div>
    )}
  </div>
);
}