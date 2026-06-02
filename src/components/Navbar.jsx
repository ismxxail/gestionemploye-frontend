// src/components/Navbar.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin, isEmployeur } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.info("Déconnexion effectuée");
    } catch (err) {
      console.error("Erreur logout:", err);
    }
  };

  if (!user) return null;

  return (
    <nav style={{
      background: 'linear-gradient(to right, #1f2937, #111827)',
      color: 'white',
      padding: '1rem 2rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>
          {isAdmin ? 'Administration' : 'Espace Employé'}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
        }}>
          {isAdmin && (
            <>
              <button
                onClick={() => navigate('/admin/employeurs')}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1rem', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = 'white'}
              >
                Employés
              </button>
              <button
                onClick={() => navigate('/admin/conges')}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1rem', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = 'white'}
              >
                Congés
              </button>
              <button
                onClick={() => navigate('/admin/presences')}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1rem', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = 'white'}
              >
                Présences
              </button>
            </>
          )}

          {isEmployeur && (
            <>
              <button
                onClick={() => navigate('/employeur/dashboard')}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1rem', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = 'white'}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/employeur/conges')}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1rem', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = 'white'}
              >
                Mes congés
              </button>
              <button
                onClick={() => navigate('/employeur/presences')}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1rem', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = 'white'}
              >
                Mes présences
              </button>
            </>
          )}

          <button
            onClick={handleLogout}
            style={{
              padding: '0.6rem 1.4rem',
              background: 'linear-gradient(90deg, #ef4444, #dc2626)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.25s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
}