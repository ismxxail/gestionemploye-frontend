// src/pages/Employeur/MesConge.jsx
import CongeForm from '../../components/CongeForm';
import CongeList from '../../components/CongeList';

export default function MesConge() {
  return (
    <div className="container">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 2.8rem)',
          fontWeight: 800,
          background: 'linear-gradient(to right, var(--primary), var(--accent))',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          marginBottom: '0.75rem',
        }}>
          Mes Congés
        </h1>
        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-light)',
        }}>
          Gérez vos demandes de congés et consultez leur statut en temps réel
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2.5rem',
      }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="section-header">
            Nouvelle Demande
          </div>
          <div style={{ padding: '2.2rem' }}>
            <CongeForm 
              onSuccess={() => window.location.reload()} 
            />
          </div>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="section-header">
            Historique des Demandes
          </div>
          <div style={{ padding: '1.5rem 0' }}>
            <CongeList />
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        background: 'rgba(99,102,241,0.07)',
        borderRadius: 'var(--radius-xl)',
        textAlign: 'center',
        border: '1px solid var(--glass-border)',
        fontSize: '0.95rem',
        color: 'var(--text-light)',
      }}>
        <p>
          Solde actuel disponible • Demandes en attente : 0 • Dernière approbation : —
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
          (Ces informations seront dynamiques une fois la logique solde implémentée)
        </p>
      </div>
    </div>
  );
    
}