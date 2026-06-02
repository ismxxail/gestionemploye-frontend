// src/components/CheckInOut.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkIn, checkOut, getMyPresences } from '../services/api';
import { toast } from 'react-toastify';

export default function CheckInOut() {
  const { user } = useAuth();
  const [todayPresence, setTodayPresence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTodayPresence = async () => {
    if (!user?.id) return;
    try {
      const { data } = await getMyPresences(user.id);
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = data.presences?.find(p => p.date === today) || null;
      setTodayPresence(todayRecord);
    } catch (err) {
      console.error("Erreur chargement présence du jour:", err);
    }
  };

  useEffect(() => {
    fetchTodayPresence();
    // Optionnel : refresh automatique toutes les 60 secondes
    // const interval = setInterval(fetchTodayPresence, 60000);
    // return () => clearInterval(interval);
  }, [user?.id]);

  const handleCheckIn = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await checkIn(user.id);
      setTodayPresence(data.presence);
      toast.success("Pointage d'entrée enregistré avec succès !", { autoClose: 4000 });
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors du check-in";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await checkOut(user.id);
      setTodayPresence(data.presence);
      toast.success("Pointage de sortie enregistré avec succès !", { autoClose: 4000 });
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors du check-out";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const hasCheckedIn = !!todayPresence?.check_in;
  const hasCheckedOut = !!todayPresence?.check_out;
  const canCheckIn = !hasCheckedIn && !loading;
  const canCheckOut = hasCheckedIn && !hasCheckedOut && !loading;

  return (
    <div className="card" style={{ padding: '2.5rem', maxWidth: '480px', margin: '0 auto' }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: '2rem',
        color: 'var(--text)',
      }}>
        Pointage du jour
        <br />
        <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-light)' }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </h2>

      {error && (
        <div style={{
          padding: '1rem',
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          color: '#dc2626',
          textAlign: 'center',
          marginBottom: '1.8rem',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-light)', marginBottom: '0.4rem' }}>
            Heure d'entrée
          </p>
          <p style={{
            fontSize: '2.2rem',
            fontWeight: 700,
            color: hasCheckedIn ? '#10b981' : 'var(--text-light)',
          }}>
            {todayPresence?.check_in ? todayPresence.check_in.substring(0, 5) : '--:--'}
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-light)', marginBottom: '0.4rem' }}>
            Heure de sortie
          </p>
          <p style={{
            fontSize: '2.2rem',
            fontWeight: 700,
            color: hasCheckedOut ? '#3b82f6' : 'var(--text-light)',
          }}>
            {todayPresence?.check_out ? todayPresence.check_out.substring(0, 5) : '--:--'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'center' }}>
        <button
          onClick={handleCheckIn}
          disabled={!canCheckIn}
          style={{
            width: '100%',
            maxWidth: '320px',
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            border: 'none',
            borderRadius: '14px',
            color: 'white',
            background: canCheckIn
              ? 'linear-gradient(90deg, #10b981, #059669)'
              : 'linear-gradient(90deg, #9ca3af, #6b7280)',
            boxShadow: canCheckIn ? '0 10px 25px rgba(16,185,129,0.35)' : 'none',
            cursor: canCheckIn ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {loading ? 'En cours...' : (hasCheckedIn ? 'Déjà pointé entrée' : 'Check-in (Entrée)')}
          </div>
        </button>

        <button
          onClick={handleCheckOut}
          disabled={!canCheckOut}
          style={{
            width: '100%',
            maxWidth: '320px',
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            border: 'none',
            borderRadius: '14px',
            color: 'white',
            background: canCheckOut
              ? 'linear-gradient(90deg, #3b82f6, #6366f1)'
              : 'linear-gradient(90deg, #9ca3af, #6b7280)',
            boxShadow: canCheckOut ? '0 10px 25px rgba(59,130,246,0.35)' : 'none',
            cursor: canCheckOut ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            {loading ? 'En cours...' : (hasCheckedOut ? 'Déjà pointé sortie' : 'Check-out (Sortie)')}
          </div>
        </button>
      </div>
    </div>
  );
}