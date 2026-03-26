import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

// ─── Data ──────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '🩸',
    colorClass: 'lp-icon-pink',
    name: 'Pelacakan Siklus',
    desc: 'Catat tanggal mulai & selesai, intensitas aliran, dan panjang siklus dengan mudah. Visualisasikan pola menstruasimu dari waktu ke waktu.',
  },
  {
    icon: '📝',
    colorClass: 'lp-icon-purple',
    name: 'Log Harian',
    desc: 'Rekam mood, gejala, kualitas tidur, tingkat stres, dan hari puasa setiap hari untuk insight kesehatan yang lebih dalam.',
  },
  {
    icon: '🤖',
    colorClass: 'lp-icon-blue',
    name: 'Prediksi AI (LSTM)',
    desc: 'Model deep learning LSTM kami menganalisis pola siklusmu untuk memprediksi tanggal menstruasi berikutnya dengan akurasi tinggi.',
  },
  {
    icon: '📅',
    colorClass: 'lp-icon-green',
    name: 'Kalender Interaktif',
    desc: 'Lihat seluruh riwayat siklusmu dalam tampilan kalender yang intuitif. Tandai fase menstruasi, prediksi, dan log harian sekaligus.',
  },
  {
    icon: '📊',
    colorClass: 'lp-icon-orange',
    name: 'Dashboard Analytics',
    desc: 'Ringkasan cerdas yang menampilkan panjang siklus rata-rata, prediksi mendatang, dan status kesehatan harianmu dalam satu tampilan.',
  },
  {
    icon: '⭐',
    colorClass: 'lp-icon-rose',
    name: 'Feedback & Akurasi',
    desc: 'Beri rating akurasi setiap prediksi dan bantu model AI terus belajar dari data nyatamu untuk prediksi yang semakin baik.',
  },
];

const STEPS = [
  {
    emoji: '📱',
    num: '1',
    title: 'Daftar Akun Gratis',
    desc: 'Buat akun dalam hitungan detik. Tidak perlu kartu kredit, langsung mulai melacak kesehatanmu.',
  },
  {
    emoji: '📋',
    num: '2',
    title: 'Catat Siklus & Log Harian',
    desc: 'Input data siklus dan kondisi harianmu. Semakin banyak data, semakin akurat prediksi AI-nya.',
  },
  {
    emoji: '🎯',
    num: '3',
    title: 'Dapatkan Prediksi AI',
    desc: 'Model LSTM kami menganalisis polamu dan memprediksi siklus berikutnya dengan confidence score real-time.',
  },
];

const TESTIMONIALS = [
  {
    stars: 5,
    text: '"Aplikasi ini benar-benar mengubah cara aku memahami tubuhku. Prediksi AI-nya akurat sekali — hanya meleset 1 hari dari prediksi sebelumnya!"',
    initial: 'S',
    name: 'Sari Dewi',
    role: 'Mahasiswi, 22 tahun',
  },
  {
    stars: 5,
    text: '"Fitur log harian yang bisa mencatat mood dan stres sangat membantu. Aku jadi tahu pola emosiku berkaitan dengan siklus menstruasiku."',
    initial: 'A',
    name: 'Anisa Putri',
    role: 'Karyawan Swasta, 27 tahun',
  },
  {
    stars: 5,
    text: '"Dashboard-nya bersih dan informatif. Sekarang aku tidak pernah khawatir lagi karena sudah bisa mempersiapkan diri jauh-jauh hari."',
    initial: 'R',
    name: 'Rina Wulandari',
    role: 'Ibu Rumah Tangga, 31 tahun',
  },
];

// ─── Component ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const confidenceFillRef = useRef(null);

  // If already logged in, go to dashboard
  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  // Sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        navRef.current.classList.toggle('scrolled', window.scrollY > 40);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll reveal + confidence bar animation
  useEffect(() => {
    const reveals = document.querySelectorAll('.lp-reveal, .lp-feature-card, .lp-step, .lp-testimonial-card');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('lp-visible');
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => observer.observe(el));

    // Confidence bar
    const barObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && confidenceFillRef.current) {
            confidenceFillRef.current.classList.add('lp-animate');
          }
        });
      },
      { threshold: 0.5 }
    );
    if (confidenceFillRef.current) barObserver.observe(confidenceFillRef.current);

    return () => {
      observer.disconnect();
      barObserver.disconnect();
    };
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="lp-root">
      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav ref={navRef} className="lp-nav" aria-label="Main navigation">
        <div className="lp-nav-inner">
          <Link to="/" className="lp-logo">
            <div className="lp-logo-icon">🌸</div>
            <span>MHC</span>
          </Link>

          <ul className="lp-nav-links" role="list">
            <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>Fitur</a></li>
            <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works'); }}>Cara Kerja</a></li>
            <li><a href="#ai-preview" onClick={(e) => { e.preventDefault(); scrollTo('ai-preview'); }}>Teknologi AI</a></li>
            <li><a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollTo('testimonials'); }}>Testimoni</a></li>
          </ul>

          <div className="lp-nav-actions">
            <Link to="/login" className="lp-btn-ghost">Masuk</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Daftar Gratis</Link>
          </div>

          <div className="lp-hamburger" aria-label="Menu" role="button" tabIndex={0}>
            <span /><span /><span />
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="lp-hero" aria-label="Hero section">
        <div className="lp-blobs">
          <div className="lp-blob lp-blob-1" />
          <div className="lp-blob lp-blob-2" />
          <div className="lp-blob lp-blob-3" />
        </div>

        <div className="lp-hero-inner">
          {/* Left: Copy */}
          <div className="lp-hero-copy">
            <div className="lp-hero-badge">
              <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zm-.25-6.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z"/></svg>
              Berbasis AI · LSTM · Gratis Selamanya
            </div>

            <h1 className="lp-hero-title">
              Kenali Tubuhmu,{' '}
              <span className="lp-gradient-text">Kuasai Siklusmu</span> 🌸
            </h1>

            <p className="lp-hero-subtitle">
              Menstrual Health Companion membantu kamu melacak siklus menstruasi,
              mencatat kondisi harian, dan mendapatkan <strong>prediksi AI berbasis LSTM</strong>{' '}
              yang personal dan akurat — semua dalam satu aplikasi.
            </p>

            <div className="lp-hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                🚀 Mulai Gratis Sekarang
              </Link>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => scrollTo('how-it-works')}
              >
                Lihat Cara Kerja
              </button>
            </div>

            <div className="lp-hero-trust">
              <div className="lp-trust-avatars">
                <span>S</span><span>A</span><span>R</span><span>+</span>
              </div>
              <p className="lp-trust-text">
                Dipercaya <strong>500+ pengguna</strong> · Prediksi AI <strong>92% akurat</strong>
              </p>
            </div>
          </div>

          {/* Right: App Mock */}
          <div className="lp-hero-visual">
            <div className="lp-hero-phone">
              <div className="lp-app-mock">
                <div className="lp-mock-header">
                  <span className="lp-mock-title">🌸 Dashboard</span>
                  <span className="lp-mock-badge">AI Active</span>
                </div>

                <div className="lp-mock-cycle">
                  <div className="lp-mock-cycle-label">Siklus Berikutnya</div>
                  <div className="lp-mock-cycle-days">12</div>
                  <div className="lp-mock-cycle-sub">hari lagi · Est. 7 April</div>
                </div>

                <div className="lp-mock-row">
                  <div className="lp-mock-stat">
                    <div className="lp-mock-stat-icon">😊</div>
                    <div className="lp-mock-stat-val">4/5</div>
                    <div className="lp-mock-stat-label">Mood</div>
                  </div>
                  <div className="lp-mock-stat">
                    <div className="lp-mock-stat-icon">💤</div>
                    <div className="lp-mock-stat-val">7j</div>
                    <div className="lp-mock-stat-label">Tidur</div>
                  </div>
                  <div className="lp-mock-stat">
                    <div className="lp-mock-stat-icon">🧘</div>
                    <div className="lp-mock-stat-val">Low</div>
                    <div className="lp-mock-stat-label">Stres</div>
                  </div>
                </div>

                <div className="lp-mock-ai">
                  <div className="lp-mock-ai-text">🤖 Prediksi AI (LSTM)</div>
                  <div className="lp-mock-ai-conf">92%</div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="lp-float-card lp-float-1">
                <div className="lp-float-icon" style={{ background: '#f0fdf4' }}>✅</div>
                Log harian tersimpan!
              </div>
              <div className="lp-float-card lp-float-2">
                <div className="lp-float-icon" style={{ background: '#fdf4ff' }}>🎯</div>
                Prediksi diperbarui
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────── */}
      <section className="lp-stats" aria-label="Statistics">
        <div className="lp-stats-inner">
          <div className="lp-stats-grid">
            {[
              { icon: '👩', num: '500+', label: 'Pengguna Aktif', sub: 'Dan terus bertumbuh setiap hari' },
              { icon: '🎯', num: '92%', label: 'Akurasi Prediksi AI', sub: 'Berdasarkan rata-rata feedback pengguna' },
              { icon: '✨', num: '8+', label: 'Fitur Lengkap', sub: 'Semuanya gratis tanpa batas' },
            ].map((s) => (
              <div key={s.label} className="lp-stat-card lp-reveal">
                <div className="lp-stat-icon">{s.icon}</div>
                <div className="lp-stat-number">{s.num}</div>
                <div className="lp-stat-label">{s.label}</div>
                <div className="lp-stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section id="features" className="lp-features" aria-label="Features">
        <div className="lp-features-inner">
          <div className="lp-section-header lp-reveal">
            <div className="lp-section-tag">✨ Fitur Unggulan</div>
            <h2 className="lp-section-title">Semua yang Kamu Butuhkan, dalam Satu Aplikasi</h2>
            <p className="lp-section-desc">
              Dari pelacakan siklus hingga prediksi berbasis deep learning — kami menghadirkan
              teknologi terkini untuk membantu kamu memahami kesehatanmu lebih baik.
            </p>
          </div>

          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={f.name}
                className="lp-feature-card"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={`lp-feature-icon-wrap ${f.colorClass}`}>{f.icon}</div>
                <h3 className="lp-feature-name">{f.name}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section id="how-it-works" className="lp-how" aria-label="How it works">
        <div className="lp-how-inner">
          <div className="lp-section-header lp-reveal">
            <div className="lp-section-tag">🚀 Cara Kerja</div>
            <h2 className="lp-section-title">Mulai dalam 3 Langkah Mudah</h2>
            <p className="lp-section-desc">
              Tidak perlu pengaturan rumit. Daftar, catat, dan biarkan AI kami bekerja
              untuk memberikan prediksi terbaik untukmu.
            </p>
          </div>

          <div className="lp-steps">
            {STEPS.map((s, i) => (
              <div key={s.title} className="lp-step" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="lp-step-num">
                  <span className="lp-step-emoji">{s.emoji}</span>
                  <span className="lp-step-count">{s.num}</span>
                </div>
                <h3 className="lp-step-title">{s.title}</h3>
                <p className="lp-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI PREVIEW ─────────────────────────────────────── */}
      <section id="ai-preview" className="lp-ai" aria-label="AI Technology">
        <div className="lp-ai-inner">
          {/* Left: Copy */}
          <div className="lp-ai-content">
            <div className="lp-section-header" style={{ textAlign: 'left', marginBottom: 0 }}>
              <div className="lp-section-tag">🧠 Teknologi AI</div>
              <h2 className="lp-section-title" style={{ color: 'white' }}>
                Prediksi Cerdas Berbasis Deep Learning
              </h2>
              <p className="lp-section-desc" style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                Kami menggunakan arsitektur <strong style={{ color: 'white' }}>LSTM (Long Short-Term Memory)</strong> —
                jaringan saraf tiruan yang dirancang untuk memahami pola data sekuensial
                seperti siklus menstruasi kamu.
              </p>
            </div>

            <ul className="lp-ai-features-list">
              {[
                'Belajar dari pola unik setiap pengguna secara personal',
                'Mempertimbangkan 5 faktor: siklus, durasi, tidur, stres & puasa',
                'Dilatih dengan EarlyStopping untuk presisi optimal',
                'Confidence score real-time pada setiap prediksi',
              ].map((item) => (
                <li key={item}>
                  <span className="lp-ai-check">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: AI Card Mock */}
          <div className="lp-ai-card lp-reveal">
            <div className="lp-ai-card-header">
              <div className="lp-ai-card-icon">🤖</div>
              <div>
                <div className="lp-ai-card-title">Prediksi LSTM Model</div>
                <div className="lp-ai-card-sub">v2.1.0 · TensorFlow 2.16</div>
              </div>
            </div>

            <div className="lp-prediction-result">
              <div className="lp-prediction-label">Prediksi Siklus Berikutnya</div>
              <div className="lp-prediction-date">7 April 2026</div>
              <div className="lp-prediction-days">dalam 12 hari · Panjang siklus: 28 hari</div>
            </div>

            <div className="lp-confidence-row">
              <span className="lp-confidence-label">Confidence Score</span>
              <span className="lp-confidence-val">92.4%</span>
            </div>
            <div className="lp-confidence-bar">
              <div ref={confidenceFillRef} className="lp-confidence-fill" />
            </div>

            <div className="lp-ai-mini-stats">
              {[
                { val: '28 hr', label: 'Avg. Cycle Length' },
                { val: '5 hr', label: 'Avg. Period Length' },
                { val: '7.2', label: 'Sleep Quality Avg' },
                { val: '2.1', label: 'Stress Level Avg' },
              ].map((s) => (
                <div key={s.label} className="lp-ai-mini-stat">
                  <div className="lp-ai-mini-val">{s.val}</div>
                  <div className="lp-ai-mini-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────── */}
      <section id="testimonials" className="lp-testimonials" aria-label="Testimonials">
        <div className="lp-testimonials-inner">
          <div className="lp-section-header lp-reveal">
            <div className="lp-section-tag">💬 Testimoni</div>
            <h2 className="lp-section-title">Dipercaya Ribuan Pengguna</h2>
            <p className="lp-section-desc">
              Dengar langsung dari para wanita yang sudah merasakan manfaat melacak kesehatan
              dengan bantuan AI.
            </p>
          </div>

          <div className="lp-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="lp-testimonial-card" style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="lp-testimonial-stars">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <span key={j}>⭐</span>
                  ))}
                </div>
                <p className="lp-testimonial-text">{t.text}</p>
                <div className="lp-testimonial-author">
                  <div className="lp-author-avatar">{t.initial}</div>
                  <div>
                    <div className="lp-author-name">{t.name}</div>
                    <div className="lp-author-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────── */}
      <section className="lp-cta" aria-label="Call to action">
        <div className="lp-cta-inner">
          <div className="lp-cta-card">
            <span className="lp-cta-emoji">🌸</span>
            <h2 className="lp-cta-title">Mulai Perjalanan Kesehatanmu Hari Ini</h2>
            <p className="lp-cta-desc">
              Bergabunglah dengan ratusan wanita yang sudah mengenali pola tubuh mereka.
              Gratis, aman, dan dipersonalisasi khusus untukmu.
            </p>
            <div className="lp-cta-actions">
              <Link to="/register" className="lp-btn-white">
                🚀 Daftar Gratis Sekarang
              </Link>
              <Link to="/login" className="lp-btn-outline-white">
                Sudah punya akun? Masuk
              </Link>
            </div>
            <p className="lp-cta-note">✓ Gratis selamanya &nbsp;·&nbsp; ✓ Tidak perlu kartu kredit &nbsp;·&nbsp; ✓ Data aman & privat</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="lp-footer" aria-label="Footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-top">
            {/* Brand */}
            <div>
              <div className="lp-footer-brand">
                <div className="lp-footer-logo-icon">🌸</div>
                <span className="lp-footer-brand-name">Menstrual Health Companion</span>
              </div>
              <p className="lp-footer-tagline">
                Aplikasi pelacak siklus menstruasi berbasis AI yang membantu wanita memahami
                dan merawat kesehatan reproduksi mereka secara personal.
              </p>
            </div>

            {/* Links */}
            <div>
              <div className="lp-footer-col-title">Fitur</div>
              <ul className="lp-footer-links">
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>Pelacakan Siklus</a></li>
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>Log Harian</a></li>
                <li><a href="#ai-preview" onClick={(e) => { e.preventDefault(); scrollTo('ai-preview'); }}>Prediksi AI</a></li>
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>Kalender</a></li>
              </ul>
            </div>

            <div>
              <div className="lp-footer-col-title">Akun</div>
              <ul className="lp-footer-links">
                <li><Link to="/register">Daftar Gratis</Link></li>
                <li><Link to="/login">Masuk</Link></li>
              </ul>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <span>© 2026 Menstrual Health Companion · Coding Camp Capstone Project</span>
            <div className="lp-footer-tech">
              <span className="lp-tech-badge">React</span>
              <span className="lp-tech-badge">Express</span>
              <span className="lp-tech-badge">TensorFlow LSTM</span>
              <span className="lp-tech-badge">MySQL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
