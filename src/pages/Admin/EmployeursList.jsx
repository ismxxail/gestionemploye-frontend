// src/pages/Admin/EmployeursList.jsx
import { useState, useEffect } from 'react';
import { 
  getEmployeurs, 
  createEmployeur, 
  updateEmployeur, 
  deleteEmployeur 
} from '../../services/api';
import { toast } from 'react-toastify';
const inputBaseStyle = {
  width: '100%',
  padding: '0.9rem 1rem',
  borderRadius: '12px',
  border: '1px solid var(--glass-border)',
  background: 'rgba(255,255,255,0.45)',
  backdropFilter: 'blur(10px)',
  fontSize: '1rem',
  color: 'var(--text)',
  outline: 'none',
  transition: 'border-color 0.25s, box-shadow 0.25s',
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.6rem',
  fontSize: '0.95rem',
  fontWeight: 500,
  color: 'var(--text-light)',
};

export default function EmployeursList() {
  const [employeurs, setEmployeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchEmployeurs();
  }, []);

  const fetchEmployeurs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getEmployeurs();
      setEmployeurs(data.employeurs || []);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger la liste des employeurs");
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      if (editingId) {
        await updateEmployeur(editingId, formData);
        toast.success("Employeur modifié avec succès");
      } else {
        await createEmployeur(formData);
        toast.success("Employeur ajouté avec succès");
      }

      resetForm();
      fetchEmployeurs();
    } catch (err) {
      const msg = err.response?.data?.message || "Une erreur est survenue";
      setError(msg);
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (employeur) => {
    setFormData({
      name: employeur.name,
      email: employeur.email,
      password: '', // sécurité : ne jamais pré-remplir le mot de passe
    });
    setEditingId(employeur.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmez-vous la suppression définitive de cet employeur ?")) return;

    try {
      await deleteEmployeur(id);
      toast.success("Employeur supprimé");
      fetchEmployeurs();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="loader" style={{ margin: '0 auto 1.5rem' }}></div>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>
            Chargement des employeurs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Titre */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
          background: 'linear-gradient(to right, var(--primary), var(--accent))',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          fontWeight: 800,
        }}>
          Gestion des Employeurs
        </h1>
        <p className="subtitle" style={{ marginTop: '0.75rem' }}>
          Ajoutez, modifiez ou supprimez les comptes employeurs
        </p>
      </div>

      {/* Formulaire Ajout / Modification */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: '3rem' }}>
        <div className="section-header">
          {editingId ? "Modifier l'employeur" : "Ajouter un nouvel employeur"}
        </div>

        <div style={{ padding: '2.2rem' }}>
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

          <form onSubmit={handleSubmit} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.6rem',
          }}>
            <div>
              <label style={labelStyle}>Nom complet *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Nom et prénom"
                style={inputBaseStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="exemple@entreprise.com"
                style={inputBaseStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                {editingId ? "Nouveau mot de passe (optionnel)" : "Mot de passe *"}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                {...(editingId ? {} : { required: true })}
                placeholder={editingId ? "Laisser vide pour ne pas changer" : "Minimum 8 caractères"}
                style={inputBaseStyle}
              />
            </div>

            <div style={{
              gridColumn: '1 / -1',
              display: 'flex',
              gap: '1rem',
              marginTop: '1rem',
              flexWrap: 'wrap',
            }}>
              <button
                type="submit"
                disabled={formLoading}
                className="btn"
                style={{
                  flex: '1',
                  minWidth: '160px',
                  padding: '1rem 2rem',
                  background: formLoading
                    ? 'linear-gradient(90deg, #9ca3af, #6b7280)'
                    : 'linear-gradient(90deg, var(--primary), var(--accent))',
                }}
              >
                {formLoading
                  ? "Enregistrement..."
                  : editingId ? "Modifier l'employeur" : "Ajouter l'employeur"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '1rem 2rem',
                    background: '#6b7280',
                    color: 'white',
                    borderRadius: '14px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Liste des employeurs */}
      {employeurs.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM6 21a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Aucun employeur enregistré
          </p>
          <p style={{ color: 'var(--text-light)' }}>
            Commencez par ajouter un nouvel employeur ci-dessus
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="section-header" style={{
            background: 'linear-gradient(to right, #1f2937, #111827)'
          }}>
            Liste des Employeurs
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
                }}>
                  <th style={{ padding: '1.2rem 1.5rem', textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Nom
                  </th>
                  <th style={{ padding: '1.2rem 1.5rem', textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Email
                  </th>
                  <th style={{ padding: '1.2rem 1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Date création
                  </th>
                  <th style={{ padding: '1.2rem 1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {employeurs.map(emp => (
                  <tr key={emp.id} style={{
                    borderBottom: '1px solid var(--glass-border)',
                    transition: 'background 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 500, color: 'var(--text)' }}>
                      {emp.name}
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', color: 'var(--text)' }}>
                      {emp.email}
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center', color: 'var(--text-light)' }}>
                      {new Date(emp.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(emp)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontWeight: 600,
                          marginRight: '1rem',
                          cursor: 'pointer',
                        }}
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}