// src/components/CongeForm.jsx
import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createConge } from '../services/api';
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

export default function CongeForm({ onSuccess }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    type: 'annuel',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  // Calcul du nombre de jours (simple, sans tenir compte des week-ends)
  const daysRequested = useMemo(() => {
    if (!form.start_date || !form.end_date) return 0;
    const start = new Date(form.start_date);
    const end = new Date(form.end_date);
    if (end < start) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le jour de début
  }, [form.start_date, form.end_date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!user?.id) {
      toast.error("Session invalide. Veuillez vous reconnecter.");
      return;
    }

    const start = new Date(form.start_date);
    const end = new Date(form.end_date);

    if (end < start) {
      setFormError("La date de fin doit être postérieure ou égale à la date de début");
      return;
    }

    if (daysRequested > 60) { // exemple de limite arbitraire
      setFormError("La durée demandée semble anormalement longue. Vérifiez les dates.");
      return;
    }

    setLoading(true);

    try {
      await createConge({
        employeur_id: user.id,
        type: form.type,
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason.trim() || null,
      });

      toast.success("Demande envoyée avec succès !", {
        position: "top-right",
        autoClose: 4000,
      });

      setForm({
        type: 'annuel',
        start_date: '',
        end_date: '',
        reason: '',
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'envoi de la demande";
      toast.error(msg, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="card" style={{ padding: '2.2rem', border: 'none' }}>
      <h3 style={{
        fontSize: '1.45rem',
        fontWeight: 700,
        marginBottom: '2rem',
        background: 'linear-gradient(to right, var(--primary), var(--accent))',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      }}>
        Nouvelle demande de congé
      </h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
        {/* Type de congé */}
        <div>
          <label htmlFor="type" style={labelStyle}>
            Type de congé *
          </label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            style={{ ...inputBaseStyle, appearance: 'none', backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'gray\' viewBox=\'0 0 24 24\'><path d=\'M7 10l5 5 5-5z\'/></svg>")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat' }}
          >
            <option value="annuel">Congé annuel</option>
            <option value="maladie">Congé maladie</option>
            <option value="maternite">Congé maternité / paternité</option>
            <option value="exceptionnel">Congé exceptionnel</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        {/* Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.4rem' }}>
          <div>
            <label htmlFor="start_date" style={labelStyle}>
              Date de début *
            </label>
            <input
              id="start_date"
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              required
              min={today}
              style={{
                ...inputBaseStyle,
                borderColor: formError && !form.start_date ? '#ef4444' : undefined,
              }}
            />
          </div>

          <div>
            <label htmlFor="end_date" style={labelStyle}>
              Date de fin *
            </label>
            <input
              id="end_date"
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              required
              min={form.start_date || today}
              style={{
                ...inputBaseStyle,
                borderColor: formError ? '#ef4444' : undefined,
              }}
            />
          </div>
        </div>

        {/* Info jours */}
        {daysRequested > 0 && (
          <div style={{
            fontSize: '0.95rem',
            color: daysRequested > 30 ? '#dc2626' : 'var(--text-light)',
            textAlign: 'center',
            fontWeight: daysRequested > 30 ? 600 : 400,
          }}>
            Durée demandée : <strong>{daysRequested} jour{daysRequested > 1 ? 's' : ''}</strong>
          </div>
        )}

        {/* Motif */}
        <div>
          <label htmlFor="reason" style={labelStyle}>
            Motif / Justification (optionnel)
          </label>
          <textarea
            id="reason"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            rows={4}
            placeholder="Décrivez brièvement le motif de votre demande..."
            style={{
              ...inputBaseStyle,
              minHeight: '110px',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Erreur */}
        {formError && (
          <div style={{
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            color: '#dc2626',
            fontSize: '0.95rem',
            textAlign: 'center',
          }}>
            {formError}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '1.1rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            border: 'none',
            borderRadius: '14px',
            color: 'white',
            background: loading
              ? 'linear-gradient(90deg, #9ca3af, #6b7280)'
              : 'linear-gradient(90deg, var(--primary), var(--accent))',
            boxShadow: loading ? 'none' : '0 12px 28px rgba(99, 102, 241, 0.35)',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.9rem',
            marginTop: '1.2rem',
          }}
        >
          {loading ? (
            <>
              <div className="loader" style={{ width: '24px', height: '24px', borderWidth: '4px', borderTopColor: 'white' }} />
              Envoi en cours...
            </>
          ) : (
            'Envoyer la demande'
          )}
        </button>
      </form>
    </div>
  );
}