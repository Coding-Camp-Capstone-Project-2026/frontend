import { useState, useEffect } from 'react';
import api from '../services/api';
import './FormPage.css';

const SYMPTOMS = [
  { id: 'cramps', label: 'Cramps', emoji: '🤕' },
  { id: 'headache', label: 'Headache', emoji: '🤯' },
  { id: 'bloating', label: 'Bloating', emoji: '🫧' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'backpain', label: 'Back Pain', emoji: '💆' },
  { id: 'nausea', label: 'Nausea', emoji: '🤢' },
  { id: 'acne', label: 'Acne', emoji: '😖' },
  { id: 'breast_tender', label: 'Breast Tenderness', emoji: '😣' },
  { id: 'mood_swings', label: 'Mood Swings', emoji: '🎭' },
  { id: 'cravings', label: 'Cravings', emoji: '🍫' },
];

const MOOD_EMOJIS = [
  { value: 1, emoji: '😢', label: 'Very Bad' },
  { value: 2, emoji: '😔', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

export default function DailyLogForm() {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: 3,
    symptoms: [],
    sleep_quality: 3,
    stress_level: 3,
    is_fasting: false,
    notes: ''
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecentLogs();
  }, []);

  const loadRecentLogs = async () => {
    try {
      const res = await api.get('/daily-logs');
      setRecentLogs(Array.isArray(res.data) ? res.data.slice(0, 7) : []);
    } catch (err) {
      console.error('Load logs error:', err);
    }
  };

  const toggleSymptom = (id) => {
    setForm(f => ({
      ...f,
      symptoms: f.symptoms.includes(id)
        ? f.symptoms.filter(s => s !== id)
        : [...f.symptoms, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/daily-logs', form);
      setSuccess('Daily log saved! 🌟');
      loadRecentLogs();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save daily log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page container animate-fade-in">
      <header className="page-header">
        <h1>📝 Daily Health Log</h1>
        <p className="page-description">Track your daily mood, symptoms, and wellness</p>
      </header>

      <div className="form-card glass-card">
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="log-date">Date</label>
            <input
              id="log-date"
              type="date"
              className="form-input"
              value={form.date}
              onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
              required
            />
          </div>

          {/* Mood Selector */}
          <div className="form-group">
            <label className="form-label">Mood</label>
            <div className="mood-selector">
              {MOOD_EMOJIS.map(m => (
                <button
                  key={m.value}
                  type="button"
                  className={`mood-btn ${form.mood === m.value ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, mood: m.value }))}
                >
                  <span className="mood-emoji">{m.emoji}</span>
                  <span className="mood-label">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div className="form-group">
            <label className="form-label">Symptoms</label>
            <div className="symptoms-grid">
              {SYMPTOMS.map(s => (
                <button
                  key={s.id}
                  type="button"
                  className={`symptom-btn ${form.symptoms.includes(s.id) ? 'active' : ''}`}
                  onClick={() => toggleSymptom(s.id)}
                >
                  <span className="symptom-emoji">{s.emoji}</span>
                  <span className="symptom-label">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sleep Quality */}
          <div className="form-group">
            <label className="form-label">Sleep Quality: {form.sleep_quality}/5 💤</label>
            <input
              type="range"
              className="range-input"
              min="1" max="5"
              value={form.sleep_quality}
              onChange={(e) => setForm(f => ({ ...f, sleep_quality: parseInt(e.target.value) }))}
            />
            <div className="range-labels">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Stress Level */}
          <div className="form-group">
            <label className="form-label">Stress Level: {form.stress_level}/5 😰</label>
            <input
              type="range"
              className="range-input"
              min="1" max="5"
              value={form.stress_level}
              onChange={(e) => setForm(f => ({ ...f, stress_level: parseInt(e.target.value) }))}
            />
            <div className="range-labels">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Fasting Toggle */}
          <div className="form-group">
            <label className="toggle-container">
              <input
                type="checkbox"
                checked={form.is_fasting}
                onChange={(e) => setForm(f => ({ ...f, is_fasting: e.target.checked }))}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">🕌 Fasting Today</span>
            </label>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label" htmlFor="log-notes">Notes</label>
            <textarea
              id="log-notes"
              className="form-input"
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="How are you feeling today?"
              rows="3"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Saving...' : '📝 Save Daily Log'}
          </button>
        </form>
      </div>

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <div className="history-card glass-card">
          <h2>📋 Recent Logs</h2>
          <div className="history-list">
            {recentLogs.map(log => (
              <div key={log.id} className="history-item compact">
                <div className="history-main">
                  <span className="history-start">
                    {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="history-mood">{MOOD_EMOJIS.find(m => m.value === log.mood)?.emoji || '😐'}</span>
                  <span className="history-detail">💤 {log.sleep_quality}/5</span>
                  <span className="history-detail">😰 {log.stress_level}/5</span>
                  {log.is_fasting ? <span>🕌</span> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
