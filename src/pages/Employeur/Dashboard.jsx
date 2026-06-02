// src/pages/Employeur/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyPresences, getMyConges } from '../../services/api';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    presencesToday: null,
    presencesThisMonth: 0,
    congesEnAttente: 0,
    congesAcceptes: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        const presRes = await getMyPresences(user.id);
        const presences = presRes.data.presences || [];

        const congeRes = await getMyConges(user.id);
        const conges = congeRes.data.conges || [];

        const today = new Date().toISOString().split('T')[0];
        const todayPresence = presences.find(p => p.date === today);

        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const presencesThisMonth = presences.filter(p => {
          const d = new Date(p.date);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length;

        const congesEnAttente = conges.filter(c => c.status?.toLowerCase() === 'en attente').length;
        const congesAcceptes = conges.filter(c =>
          c.status?.toLowerCase() === 'accepter' || c.status?.toLowerCase() === 'accepté'
        ).length;

        setStats({
          presencesToday: todayPresence,
          presencesThisMonth,
          congesEnAttente,
          congesAcceptes,
          loading: false,
        });
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors de la récupération des données");
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, [user?.id]);

  if (stats.loading) {
    return (
      <div className="container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card p-10 text-center">
          <div className="loader mx-auto mb-6" style={{ width: '60px', height: '60px' }}></div>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-light)' }}>
            Chargement du tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '3.5rem' }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 5.5vw, 3.2rem)',
          background: 'linear-gradient(to right, var(--primary), var(--accent))',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          fontWeight: 800,
          lineHeight: 1.1,
        }}>
          Tableau de bord
        </h1>
        <p className="subtitle" style={{ marginTop: '1rem', fontSize: '1.15rem' }}>
          {user?.name ? `Bienvenue ${user.name}` : 'Bienvenue'} • {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.8rem',
        marginBottom: '3rem',
      }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.4rem', color: 'var(--text)' }}>
            Pointage du jour
          </h3>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '3.5rem',
              fontWeight: 700,
              color: stats.presencesToday?.check_in ? '#10b981' : '#9ca3af',
              marginBottom: '0.5rem',
            }}>
              {stats.presencesToday?.check_in ? stats.presencesToday.check_in.substring(0, 5) : '—'}
            </div>
            <p style={{ color: 'var(--text-light)', fontSize: '1.05rem' }}>
              {stats.presencesToday?.check_out ? 'Complet' : (stats.presencesToday?.check_in ? 'En cours' : 'Non pointé')}
            </p>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.4rem', color: 'var(--text)' }}>
            Présences ce mois
          </h3>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '3.8rem', fontWeight: 800, color: '#6366f1' }}>
              {stats.presencesThisMonth}
            </p>
            <p style={{ color: 'var(--text-light)', fontSize: '1.05rem' }}>
              jour(s) travaillé(s)
            </p>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.4rem', color: 'var(--text)' }}>
            Demandes en attente
          </h3>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '3.8rem', fontWeight: 800, color: '#f59e0b' }}>
              {stats.congesEnAttente}
            </p>
            <p style={{ color: 'var(--text-light)', fontSize: '1.05rem' }}>
              demande(s)
            </p>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.4rem', color: 'var(--text)' }}>
            Congés acceptés
          </h3>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '3.8rem', fontWeight: 800, color: '#10b981' }}>
              {stats.congesAcceptes}
            </p>
            <p style={{ color: 'var(--text-light)', fontSize: '1.05rem' }}>
              demande(s) (total)
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '1.8rem',
          color: 'var(--text)',
        }}>
          Accès rapide
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.6rem',
        }}>
          <QuickAccessCard
            icon="🕒"
            title="Mes pointages"
            path="/employeur/presences"
            color="#10b981"
          />
          <QuickAccessCard
            icon="🏖️"
            title="Mes congés"
            path="/employeur/conges"
            color="#8b5cf6"
          />
          
        </div>
      </div>
    </div>
  );
}

function QuickAccessCard({ icon, title, path, color }) {
  return (
    <div
      className="card"
      onClick={() => window.location.href = path}
      style={{
        padding: '2rem 1.5rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        borderLeft: `5px solid ${color}`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      <div style={{
        fontSize: '3.5rem',
        marginBottom: '1.2rem',
        color,
      }}>
        {icon}
      </div>
      <p style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        color: 'var(--text)',
      }}>
        {title}
      </p>
    </div>
  );
}