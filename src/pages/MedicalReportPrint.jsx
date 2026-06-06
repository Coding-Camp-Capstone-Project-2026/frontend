import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.png';
import './MedicalReportPrint.css';

// Helper to format dates to local YYYY-MM-DD strings without timezone shifting
const formatLocalDateString = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);
  
  const d = new Date(year, month, day);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);
  
  const d = new Date(year, month, day);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const moodLabels = { 1: 'Sangat Buruk', 2: 'Buruk', 3: 'Biasa', 4: 'Baik', 5: 'Sangat Baik' };
const moodEmojis = ['', '😢', '😔', '😐', '😊', '😄'];

export default function MedicalReportPrint() {
  const [searchParams] = useSearchParams();
  const range = searchParams.get('range') || '3';
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [cycleData, setCycleData] = useState([]);
  const [logData, setLogData] = useState([]);
  const [predictionData, setPredictionData] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [range]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      const [profileRes, cyclesRes, logsRes, predLatestRes, predHistoryRes] = await Promise.all([
        api.get('/profile'),
        api.get('/cycles'),
        api.get('/daily-logs'),
        api.get('/predictions/latest').catch(() => ({ data: null })),
        api.get('/predictions/history').catch(() => ({ data: [] })),
      ]);

      setUserData(profileRes.data);
      setPredictionData(predLatestRes.data);
      setPredictionHistory(Array.isArray(predHistoryRes.data) ? predHistoryRes.data : []);
      
      // Filter logs by date range
      let filteredLogs = logsRes.data || [];
      if (range === '3' || range === '6') {
        const monthsLimit = parseInt(range);
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - monthsLimit);
        filteredLogs = filteredLogs.filter(log => new Date(log.date) >= cutoffDate);
      }
      setLogData(filteredLogs);

      // Filter cycles by date range
      let filteredCycles = cyclesRes.data || [];
      if (range === '3' || range === '6') {
        const monthsLimit = parseInt(range);
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - monthsLimit);
        filteredCycles = filteredCycles.filter(c => new Date(c.start_date) >= cutoffDate);
      }
      setCycleData(filteredCycles);

    } catch (err) {
      console.error('Error loading report data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger print dialog
  useEffect(() => {
    if (!loading && userData) {
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [loading, userData]);

  if (loading) {
    return (
      <div className="print-loading-screen">
        <div className="loading-spinner" />
        <p>Mempersiapkan Laporan Medis Komprehensif...</p>
      </div>
    );
  }

  // ── Calculate Statistics ──
  const avgCycle = cycleData.length > 0
    ? Math.round(cycleData.reduce((s, c) => s + (c.cycle_length || 28), 0) / cycleData.length)
    : userData?.avg_cycle_length || 28;

  const avgPeriod = cycleData.length > 0
    ? parseFloat((cycleData.reduce((s, c) => s + (c.period_length || 5), 0) / cycleData.length).toFixed(1))
    : 5;

  const minCycle = cycleData.length > 0
    ? Math.min(...cycleData.map(c => c.cycle_length || 28))
    : null;
  const maxCycle = cycleData.length > 0
    ? Math.max(...cycleData.map(c => c.cycle_length || 28))
    : null;

  // Regularity (std deviation)
  let regularityScore = 0;
  let regularityStatus = 'Belum Cukup Data';
  if (cycleData.length >= 2) {
    const lengths = cycleData.map(c => c.cycle_length || 28);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / lengths.length;
    regularityScore = parseFloat(Math.sqrt(variance).toFixed(2));
    if (regularityScore < 2) regularityStatus = '✅ Sangat Teratur';
    else if (regularityScore <= 5) regularityStatus = '⚠️ Teratur';
    else regularityStatus = '❌ Tidak Teratur';
  } else if (cycleData.length === 1) {
    regularityStatus = '⚠️ Data Terbatas (1 siklus)';
  }

  // Mood distribution
  const moodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalMood = 0;
  let moodSum = 0;
  logData.forEach(l => {
    if (l.mood && moodCounts[l.mood] !== undefined) {
      moodCounts[l.mood]++;
      totalMood++;
      moodSum += l.mood;
    }
  });
  const avgMood = totalMood > 0 ? (moodSum / totalMood).toFixed(1) : null;
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  // Sleep & Stress averages
  let avgSleep = null;
  let avgStress = null;
  const sleepLogs = logData.filter(l => l.sleep_quality);
  const stressLogs = logData.filter(l => l.stress_level);
  if (sleepLogs.length > 0) avgSleep = (sleepLogs.reduce((s, l) => s + l.sleep_quality, 0) / sleepLogs.length).toFixed(1);
  if (stressLogs.length > 0) avgStress = (stressLogs.reduce((s, l) => s + l.stress_level, 0) / stressLogs.length).toFixed(1);

  // Fasting stats
  const fastingDays = logData.filter(l => l.is_fasting).length;

  // Symptom frequency
  const symptomFreq = {};
  logData.forEach(l => {
    if (l.symptoms) {
      try {
        const arr = JSON.parse(l.symptoms);
        if (Array.isArray(arr)) arr.forEach(s => { symptomFreq[s] = (symptomFreq[s] || 0) + 1; });
      } catch (e) { /* skip */ }
    }
  });
  const sortedSymptoms = Object.entries(symptomFreq).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Health assessment
  const getHealthAssessment = () => {
    const assessments = [];
    if (avgCycle >= 21 && avgCycle <= 35) {
      assessments.push({ status: 'normal', text: `Panjang siklus rata-rata (${avgCycle} hari) berada dalam rentang normal (21-35 hari).` });
    } else {
      assessments.push({ status: 'warning', text: `Panjang siklus rata-rata (${avgCycle} hari) berada di luar rentang normal (21-35 hari). Disarankan untuk berkonsultasi dengan dokter.` });
    }
    if (avgPeriod >= 3 && avgPeriod <= 7) {
      assessments.push({ status: 'normal', text: `Durasi menstruasi rata-rata (${avgPeriod} hari) berada dalam rentang normal (3-7 hari).` });
    } else if (avgPeriod > 7) {
      assessments.push({ status: 'warning', text: `Durasi menstruasi rata-rata (${avgPeriod} hari) melebihi rentang normal (3-7 hari).` });
    }
    if (regularityScore > 0 && regularityScore < 2) {
      assessments.push({ status: 'normal', text: `Siklus sangat teratur dengan simpangan baku ${regularityScore} hari.` });
    } else if (regularityScore >= 5) {
      assessments.push({ status: 'warning', text: `Variabilitas siklus tinggi (simpangan baku ${regularityScore} hari). Disarankan pemeriksaan lebih lanjut.` });
    }
    if (avgStress && parseFloat(avgStress) >= 4) {
      assessments.push({ status: 'warning', text: `Tingkat stres rata-rata tinggi (${avgStress}/5). Stres kronis dapat memengaruhi siklus menstruasi.` });
    }
    if (avgSleep && parseFloat(avgSleep) <= 2) {
      assessments.push({ status: 'warning', text: `Kualitas tidur rata-rata rendah (${avgSleep}/5). Tidur yang cukup penting untuk regulasi hormon.` });
    }
    return assessments;
  };

  const healthAssessments = getHealthAssessment();

  const reportId = `YC-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="print-report-container">
      {/* Interactive Controls (Hidden on Print) */}
      <div className="print-controls no-print">
        <div className="print-guide-message">
          <h3>💡 Petunjuk Menyimpan Sebagai PDF:</h3>
          <p>
            Dialog cetak sistem akan terbuka secara otomatis. Untuk menyimpannya sebagai PDF digital, 
            ubah pilihan <strong>Tujuan (Destination)</strong> menjadi <strong>"Simpan sebagai PDF" / "Save as PDF"</strong>.
          </p>
        </div>
        <div className="print-action-buttons">
          <button onClick={() => navigate('/profile')} className="btn btn-secondary btn-sm">
            ⬅️ Kembali ke Profil
          </button>
          <button onClick={() => window.print()} className="btn btn-primary btn-sm">
            🖨️ Cetak / Simpan PDF
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="print-document">

        {/* ═══ HEADER WITH LOGO ═══ */}
        <header className="doc-header">
          <div className="header-brand-block">
            <img src={logo} alt="YeoCycles" className="doc-logo" />
            <div className="header-title-block">
              <h1>LAPORAN RIWAYAT KESEHATAN MENSTRUASI</h1>
              <span className="doc-brand">YeoCycles — Menstrual Health Companion</span>
            </div>
          </div>
          <div className="header-meta-block">
            <p><strong>No. Laporan:</strong> {reportId}</p>
            <p><strong>Tanggal Cetak:</strong> {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
            <p><strong>Periode:</strong> {range === 'all' ? 'Semua Riwayat' : `${range} Bulan Terakhir`}</p>
          </div>
        </header>

        <div className="doc-divider" />

        {/* ═══ PATIENT INFO ═══ */}
        <section className="doc-section patient-info-section">
          <h2>👤 Informasi Pengguna</h2>
          <div className="patient-info-grid">
            <div className="info-item">
              <span className="info-label">Nama Lengkap:</span>
              <span className="info-value">{userData?.name || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email Terdaftar:</span>
              <span className="info-value">{userData?.email || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tanggal Lahir:</span>
              <span className="info-value">
                {userData?.date_of_birth ? formatLocalDateString(userData.date_of_birth.split('T')[0]) : '—'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Terdaftar Sejak:</span>
              <span className="info-value">
                {userData?.created_at ? new Date(userData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </span>
            </div>
          </div>
        </section>

        {/* ═══ STATISTICS OVERVIEW ═══ */}
        <section className="doc-section summary-stats-section">
          <h2>📊 Ringkasan Statistik</h2>
          <div className="summary-stats-grid-print">
            <div className="stat-print-box">
              <span className="stat-print-val">{cycleData.length}</span>
              <span className="stat-print-label">Siklus Tercatat</span>
            </div>
            <div className="stat-print-box">
              <span className="stat-print-val">{avgCycle} hari</span>
              <span className="stat-print-label">Rerata Panjang Siklus</span>
            </div>
            <div className="stat-print-box">
              <span className="stat-print-val">{avgPeriod} hari</span>
              <span className="stat-print-label">Rerata Durasi Haid</span>
            </div>
            <div className="stat-print-box">
              <span className="stat-print-val">{logData.length}</span>
              <span className="stat-print-label">Total Log Harian</span>
            </div>
          </div>

          {/* Extended stats row */}
          <div className="summary-stats-grid-print" style={{ marginTop: '12px' }}>
            <div className="stat-print-box">
              <span className="stat-print-val">{minCycle !== null ? `${minCycle}` : '—'}</span>
              <span className="stat-print-label">Siklus Terpendek (Hari)</span>
            </div>
            <div className="stat-print-box">
              <span className="stat-print-val">{maxCycle !== null ? `${maxCycle}` : '—'}</span>
              <span className="stat-print-label">Siklus Terpanjang (Hari)</span>
            </div>
            <div className="stat-print-box">
              <span className="stat-print-val">{regularityScore || '—'}</span>
              <span className="stat-print-label">Simpangan Baku (Hari)</span>
            </div>
            <div className="stat-print-box">
              <span className="stat-print-val">{fastingDays}</span>
              <span className="stat-print-label">Hari Puasa Tercatat</span>
            </div>
          </div>
        </section>

        {/* ═══ REGULARITY & LIFESTYLE ═══ */}
        <section className="doc-section">
          <h2>⚖️ Analisis Keteraturan Siklus & Gaya Hidup</h2>
          <div className="analysis-grid">
            <div className="analysis-box">
              <div className="analysis-box-header">Status Keteraturan Siklus</div>
              <div className="analysis-box-value">{regularityStatus}</div>
              <div className="analysis-box-note">Simpangan baku: {regularityScore} hari (Normal: &lt;2 hari)</div>
            </div>
            <div className="analysis-box">
              <div className="analysis-box-header">Rata-rata Mood Harian</div>
              <div className="analysis-box-value">
                {avgMood ? `${avgMood}/5 ${moodEmojis[Math.round(avgMood)]}` : '—'}
              </div>
              <div className="analysis-box-note">
                Mood dominan: {dominantMood ? `${moodLabels[dominantMood[0]]} (${dominantMood[1]}x)` : '—'}
              </div>
            </div>
            <div className="analysis-box">
              <div className="analysis-box-header">Rata-rata Kualitas Tidur</div>
              <div className="analysis-box-value">{avgSleep ? `${avgSleep}/5` : '—'}</div>
              <div className="analysis-box-note">Berdasarkan {sleepLogs.length} catatan harian</div>
            </div>
            <div className="analysis-box">
              <div className="analysis-box-header">Rata-rata Tingkat Stres</div>
              <div className="analysis-box-value">{avgStress ? `${avgStress}/5` : '—'}</div>
              <div className="analysis-box-note">Berdasarkan {stressLogs.length} catatan harian</div>
            </div>
          </div>
        </section>

        {/* ═══ HEALTH ASSESSMENT ═══ */}
        {healthAssessments.length > 0 && (
          <section className="doc-section">
            <h2>🩺 Penilaian Kesehatan</h2>
            <div className="health-assessment-list">
              {healthAssessments.map((item, idx) => (
                <div key={idx} className={`assessment-item ${item.status}`}>
                  <span className="assessment-icon">{item.status === 'normal' ? '✅' : '⚠️'}</span>
                  <span className="assessment-text">{item.text}</span>
                </div>
              ))}
            </div>
            <p className="assessment-disclaimer">
              <em>Catatan: Penilaian ini bersifat informatif dan dihasilkan secara otomatis berdasarkan data yang Anda input. 
              Bukan merupakan diagnosis medis. Konsultasikan dengan dokter untuk evaluasi klinis yang komprehensif.</em>
            </p>
          </section>
        )}

        {/* ═══ AI PREDICTION ═══ */}
        {predictionData && (
          <section className="doc-section prediction-section">
            <h2>🤖 Prediksi AI (Machine Learning)</h2>
            <div className="prediction-grid">
              <div className="prediction-box main-prediction">
                <div className="pred-label">Prediksi Siklus Berikutnya</div>
                <div className="pred-date">
                  {predictionData.predicted_next_date ? formatLocalDateString(predictionData.predicted_next_date) : '—'}
                </div>
                <div className="pred-meta">
                  Panjang siklus prediksi: {predictionData.predicted_cycle_length || '—'} hari
                </div>
              </div>
              <div className="prediction-box">
                <div className="pred-label">Tingkat Keyakinan Model</div>
                <div className="pred-confidence">
                  {predictionData.confidence ? `${Math.round(predictionData.confidence * 100)}%` : '—'}
                </div>
                <div className="pred-bar-container">
                  <div className="pred-bar-fill" style={{ width: `${(predictionData.confidence || 0) * 100}%` }} />
                </div>
              </div>
              <div className="prediction-box">
                <div className="pred-label">Versi Model AI</div>
                <div className="pred-model-ver">{predictionData.model_version || '—'}</div>
                <div className="pred-meta">Arsitektur: LSTM + Attention Layer</div>
              </div>
            </div>

            {/* Prediction History */}
            {predictionHistory.length > 1 && (
              <>
                <h3 className="subsection-title">Riwayat Prediksi AI</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Tanggal Dibuat</th>
                      <th>Prediksi Tanggal</th>
                      <th>Panjang Siklus</th>
                      <th>Confidence</th>
                      <th>Model</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictionHistory.slice(0, 10).map((p, idx) => (
                      <tr key={p.id || idx}>
                        <td>{p.created_at ? formatShortDate(p.created_at.split('T')[0]) : '—'}</td>
                        <td>{p.predicted_next_date ? formatShortDate(p.predicted_next_date) : '—'}</td>
                        <td>{p.predicted_cycle_length ? `${p.predicted_cycle_length} hari` : '—'}</td>
                        <td>{p.confidence ? `${Math.round(p.confidence * 100)}%` : '—'}</td>
                        <td>{p.model_version || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </section>
        )}

        {/* ═══ SYMPTOM & MOOD DISTRIBUTION ═══ */}
        {(sortedSymptoms.length > 0 || totalMood > 0) && (
          <section className="doc-section">
            <h2>📋 Distribusi Gejala & Mood</h2>
            <div className="distribution-grid">
              {/* Symptoms */}
              {sortedSymptoms.length > 0 && (
                <div className="distribution-col">
                  <h3 className="subsection-title">Gejala Fisik Terbanyak</h3>
                  <table className="report-table compact">
                    <thead>
                      <tr><th>Gejala</th><th>Frekuensi</th></tr>
                    </thead>
                    <tbody>
                      {sortedSymptoms.map(([name, count], idx) => (
                        <tr key={idx}>
                          <td className="capitalize">{name}</td>
                          <td>{count} kali</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Mood */}
              {totalMood > 0 && (
                <div className="distribution-col">
                  <h3 className="subsection-title">Distribusi Mood Harian</h3>
                  <table className="report-table compact">
                    <thead>
                      <tr><th>Mood</th><th>Frekuensi</th><th>Persentase</th></tr>
                    </thead>
                    <tbody>
                      {Object.entries(moodCounts).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]).map(([val, count]) => (
                        <tr key={val}>
                          <td>{moodEmojis[val]} {moodLabels[val]}</td>
                          <td>{count} hari</td>
                          <td>{Math.round((count / totalMood) * 100)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ═══ CYCLE HISTORY TABLE ═══ */}
        <section className="doc-section cycles-section">
          <h2>🔄 Riwayat Siklus Menstruasi</h2>
          {cycleData.length > 0 ? (
            <table className="report-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Mulai Siklus</th>
                  <th>Selesai Siklus</th>
                  <th>Panjang Siklus</th>
                  <th>Durasi Haid</th>
                  <th>Volume Aliran</th>
                  <th>Catatan / Keluhan</th>
                </tr>
              </thead>
              <tbody>
                {cycleData.map((c, index) => (
                  <tr key={c.id || index}>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{index + 1}</td>
                    <td>{formatLocalDateString(c.start_date)}</td>
                    <td>{c.end_date ? formatLocalDateString(c.end_date) : 'Aktif/Sedang Berjalan'}</td>
                    <td>{c.cycle_length ? `${c.cycle_length} hari` : '—'}</td>
                    <td>{c.period_length ? `${c.period_length} hari` : '—'}</td>
                    <td className="capitalize">{c.flow_intensity || 'medium'}</td>
                    <td>{c.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data-msg">Tidak ada catatan siklus dalam rentang waktu terpilih.</p>
          )}
        </section>

        {/* ═══ DAILY LOG TABLE ═══ */}
        <section className="doc-section logs-section">
          <h2>📝 Log Gejala & Gaya Hidup Harian</h2>
          {logData.length > 0 ? (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Mood</th>
                  <th>Tidur</th>
                  <th>Stres</th>
                  <th>Puasa</th>
                  <th>Gejala Fisik</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {logData.map((l, index) => {
                  let symptomsArr = [];
                  if (l.symptoms) {
                    try { symptomsArr = JSON.parse(l.symptoms); } catch (e) { /* skip */ }
                  }
                  
                  return (
                    <tr key={l.id || index}>
                      <td>{formatShortDate(l.date)}</td>
                      <td>{l.mood ? `${moodEmojis[l.mood]} ${l.mood}/5` : '—'}</td>
                      <td>{l.sleep_quality ? `${l.sleep_quality}/5` : '—'}</td>
                      <td>{l.stress_level ? `${l.stress_level}/5` : '—'}</td>
                      <td>{l.is_fasting ? '🕌 Ya' : 'Tidak'}</td>
                      <td>
                        {symptomsArr.length > 0 ? (
                          <div className="print-symptoms-list">
                            {symptomsArr.map((sym, sIdx) => (
                              <span key={sIdx} className="print-symptom-tag">{sym}</span>
                            ))}
                          </div>
                        ) : '—'}
                      </td>
                      <td>{l.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="no-data-msg">Tidak ada catatan harian dalam rentang waktu terpilih.</p>
          )}
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="doc-footer">
          <div className="footer-brand">
            <img src={logo} alt="YeoCycles" className="footer-logo" />
            <span className="footer-brand-name">YeoCycles</span>
          </div>
          <div className="footer-legal">
            <p>Dokumen ini dihasilkan secara otomatis oleh sistem YeoCycles atas permintaan pengguna terdaftar.</p>
            <p>Laporan ini bersifat informatif dan <strong>bukan merupakan diagnosis medis</strong>. Konsultasikan dengan tenaga medis profesional untuk evaluasi klinis.</p>
            <p>© {new Date().getFullYear()} YeoCycles — Menstrual Health Companion · Coding Camp Capstone Project 2026</p>
            <p className="footer-report-id">ID Laporan: {reportId}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
