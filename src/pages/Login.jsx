import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!loading && user) {
      if (user.role === 'employeur') {
        navigate('/employeur/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/employeurs');    
      }
    } }catch (err) {
      setError(err.message || 'Identifiants incorrects ou erreur serveur');
      toast.error(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'linear-gradient(135deg, var(--bg) 0%, color-mix(in srgb, var(--bg) 70%, #000 100%)',
    }}>
      <div className="card" style={{ padding: '2.5rem 2rem', maxWidth: '420px', width: '100%' }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '2rem',
          background: 'linear-gradient(to right, var(--primary), var(--accent))',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}>
          Connexion
        </h2>

        {error && (
          <div style={{
            padding: '1rem',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            color: '#dc2626',
            marginBottom: '1.8rem',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: 'var(--text-light)' }}>
              Adresse email
            </label>
            <input
              type="email"
              placeholder="exemple@entreprise.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.45)',
                backdropFilter: 'blur(10px)',
                fontSize: '1rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: 'var(--text-light)' }}>
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.45)',
                backdropFilter: 'blur(10px)',
                fontSize: '1rem',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '1rem',
              padding: '1rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: '14px',
              color: 'white',
              background: loading
                ? 'linear-gradient(90deg, #9ca3af, #6b7280)'
                : 'linear-gradient(90deg, var(--primary), var(--accent))',
              boxShadow: loading ? 'none' : '0 10px 25px rgba(99,102,241,0.35)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
          Mot de passe oublié ? Contactez votre administrateur
        </p>
      </div>
    </div>
  );
}