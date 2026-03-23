import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const [prediction, setPrediction] = useState(null);
  const [cycles, setCycles] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [predRes, cyclesRes, logsRes] = await Promise.all([
        api.get('/predictions').catch(() => ({ data: null })),
        api.get('/cycles').catch(() => ({ data: [] })),
        api.get('/daily-logs').catch(() => ({ data: [] })),
      ]);
      setPrediction(predRes.data);
      setCycles(cyclesRes.data);
      setRecentLogs(Array.isArray(logsRes.data) ? logsRes.data.slice(0, 5) : []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntil = () => {
    if (!prediction?.predicted_next_date) return null;
    const diff = Math.ceil((new Date(prediction.predicted_next_date) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysUntil = getDaysUntil();
  const moodEmojis = ['', '😢', '😔', '😐', '😊', '😄'];

  if (loading) {
    return (
      <div className="dashboard-page container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page container animate-fade-in">
      <header className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p className="dashboard-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>

      {/* Prediction Card */}
      <div className="prediction-card glass-card">
        <div className="prediction-header">
          <h2>🔮 Next Period Prediction</h2>
          {prediction?.confidence && (
            <span className="confidence-badge">
              {Math.round(prediction.confidence * 100)}% confidence
            </span>
          )}
        </div>

        {prediction?.predicted_next_date ? (
          <div className="prediction-content">
            <div className="prediction-main">
              <div className="prediction-date">
                <span className="date-label">Expected Date</span>
                <span className="date-value">
                  {new Date(prediction.predicted_next_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="prediction-countdown">
                <span className="countdown-number">{daysUntil !== null ? Math.abs(daysUntil) : '—'}</span>
                <span className="countdown-label">{daysUntil !== null && daysUntil < 0 ? 'days ago' : 'days left'}</span>
              </div>
            </div>
            <div className="prediction-meta">
              <div className="meta-item">
                <span className="meta-label">Cycle Length</span>
                <span className="meta-value">{prediction.predicted_cycle_length || '—'} days</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Model</span>
                <span className="meta-value">{prediction.model_version || 'N/A'}</span>
              </div>
            </div>
            {prediction.message && (
              <p className="prediction-message">{prediction.message}</p>
            )}
          </div>
        ) : (
          <div className="prediction-empty">
            <p>📝 Log your cycles to get AI-powered predictions!</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/cycle')}>
              Add First Cycle
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-card glass-card" onClick={() => navigate('/cycle')}>
          <span className="action-icon">🔄</span>
          <span className="action-label">Log Cycle</span>
        </button>
        <button className="action-card glass-card" onClick={() => navigate('/daily-log')}>
          <span className="action-icon">📝</span>
          <span className="action-label">Daily Log</span>
        </button>
        <button className="action-card glass-card" onClick={() => navigate('/calendar')}>
          <span className="action-icon">📅</span>
          <span className="action-label">Calendar</span>
        </button>
        <button className="action-card glass-card" onClick={() => navigate('/profile')}>
          <span className="action-icon">⚙️</span>
          <span className="action-label">Settings</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card glass-card">
          <span className="stat-icon">📊</span>
          <span className="stat-value">{cycles.length}</span>
          <span className="stat-label">Cycles Logged</span>
        </div>
        <div className="stat-card glass-card">
          <span className="stat-icon">📝</span>
          <span className="stat-value">{recentLogs.length > 0 ? recentLogs.length + '+' : '0'}</span>
          <span className="stat-label">Daily Logs</span>
        </div>
        <div className="stat-card glass-card">
          <span className="stat-icon">📏</span>
          <span className="stat-value">
            {cycles.length > 0 ? Math.round(cycles.reduce((s, c) => s + (c.cycle_length || 28), 0) / cycles.length) : '—'}
          </span>
          <span className="stat-label">Avg Cycle (days)</span>
        </div>
      </div>

      {/* Recent Activity */}
      {recentLogs.length > 0 && (
        <div className="recent-section glass-card">
          <h3>📋 Recent Daily Logs</h3>
          <div className="recent-list">
            {recentLogs.map(log => (
              <div key={log.id} className="recent-item">
                <span className="recent-date">{new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span className="recent-mood">{moodEmojis[log.mood] || '😐'}</span>
                <span className="recent-sleep">💤 {log.sleep_quality || '—'}/5</span>
                <span className="recent-stress">😰 {log.stress_level || '—'}/5</span>
                {log.is_fasting ? <span className="recent-fasting">🕌</span> : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Tips */}
      <div className="tips-section glass-card">
        <h3>💡 Health Insights</h3>
        <div className="tips-list">
          <div className="tip-item">
            <span className="tip-icon">🌿</span>
            <p>Regular exercise can help reduce menstrual cramps and improve mood during your cycle.</p>
          </div>
          <div className="tip-item">
            <span className="tip-icon">💧</span>
            <p>Stay hydrated! Drinking enough water helps reduce bloating and fatigue during menstruation.</p>
          </div>
          <div className="tip-item">
            <span className="tip-icon">😴</span>
            <p>Aim for 7-9 hours of quality sleep, especially during the luteal phase of your cycle.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
