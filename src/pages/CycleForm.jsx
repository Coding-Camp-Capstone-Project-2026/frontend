import { useState, useEffect } from 'react';
import api from '../services/api';
import './FormPage.css';

export default function CycleForm() {
  const [cycles, setCycles] = useState([]);
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    cycle_length: '',
    period_length: '',
    flow_intensity: 'medium',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCycles();
  }, []);

  const loadCycles = async () => {
    try {
      const res = await api.get('/cycles');
      setCycles(res.data);
    } catch (err) {
      console.error('Load cycles error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Auto-calculate cycle_length if we have dates
      const data = { ...form };
      if (data.start_date && data.end_date) {
        const diff = Math.ceil(
          (new Date(data.end_date) - new Date(data.start_date)) / (1000 * 60 * 60 * 24)
        );
        if (!data.period_length) data.period_length = diff;
      }
      if (data.cycle_length) data.cycle_length = parseInt(data.cycle_length);
      if (data.period_length) data.period_length = parseInt(data.period_length);

      await api.post('/cycles', data);
      setSuccess('Cycle data saved successfully! 🎉');
      setForm({ start_date: '', end_date: '', cycle_length: '', period_length: '', flow_intensity: 'medium', notes: '' });
      loadCycles();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save cycle data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this cycle record?')) return;
    try {
      await api.delete(`/cycles/${id}`);
      setSuccess('Cycle deleted');
      loadCycles();
    } catch (err) {
      setError('Failed to delete cycle');
    }
  };

  const flowColors = {
    light: '#f9a8d4',
    medium: '#ec4899',
    heavy: '#be185d'
  };

  return (
    <div className="form-page container animate-fade-in">
      <header className="page-header">
        <h1>🔄 Cycle Tracker</h1>
        <p className="page-description">Log your menstrual cycle data for accurate predictions</p>
      </header>

      <div className="form-card glass-card">
        <h2>Add Cycle Entry</h2>

        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="cycle-start">Start Date *</label>
              <input
                id="cycle-start"
                type="date"
                className="form-input"
                value={form.start_date}
                onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cycle-end">End Date</label>
              <input
                id="cycle-end"
                type="date"
                className="form-input"
                value={form.end_date}
                onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="cycle-length">Cycle Length (days)</label>
              <input
                id="cycle-length"
                type="number"
                className="form-input"
                value={form.cycle_length}
                onChange={(e) => setForm(f => ({ ...f, cycle_length: e.target.value }))}
                min="18" max="50"
                placeholder="e.g. 28"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="period-length">Period Length (days)</label>
              <input
                id="period-length"
                type="number"
                className="form-input"
                value={form.period_length}
                onChange={(e) => setForm(f => ({ ...f, period_length: e.target.value }))}
                min="1" max="14"
                placeholder="e.g. 5"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Flow Intensity</label>
            <div className="flow-selector">
              {['light', 'medium', 'heavy'].map(level => (
                <button
                  key={level}
                  type="button"
                  className={`flow-btn ${form.flow_intensity === level ? 'active' : ''}`}
                  style={{ '--flow-color': flowColors[level] }}
                  onClick={() => setForm(f => ({ ...f, flow_intensity: level }))}
                >
                  <span className="flow-dot" style={{ background: flowColors[level] }}></span>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cycle-notes">Notes</label>
            <textarea
              id="cycle-notes"
              className="form-input"
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Any additional notes..."
              rows="3"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Saving...' : '💾 Save Cycle'}
          </button>
        </form>
      </div>

      {/* Cycle History */}
      {cycles.length > 0 && (
        <div className="history-card glass-card">
          <h2>📋 Cycle History</h2>
          <div className="history-list">
            {cycles.map(cycle => (
              <div key={cycle.id} className="history-item">
                <div className="history-main">
                  <div className="history-dates">
                    <span className="history-start">
                      {new Date(cycle.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {cycle.end_date && (
                      <>
                        <span className="history-arrow">→</span>
                        <span className="history-end">
                          {new Date(cycle.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="history-meta">
                    {cycle.cycle_length && <span>📏 {cycle.cycle_length} days</span>}
                    {cycle.period_length && <span>⏱ {cycle.period_length} days</span>}
                    <span className="flow-badge" style={{ background: flowColors[cycle.flow_intensity] || flowColors.medium }}>
                      {cycle.flow_intensity}
                    </span>
                  </div>
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cycle.id)}>🗑</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
