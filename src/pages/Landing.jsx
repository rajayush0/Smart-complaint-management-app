import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/Landing.css';

const FEATURES = [
  {
    icon: '✨',
    title: 'AI-Powered Auto-Fill',
    desc: 'Describe your issue in plain English — our AI instantly extracts and fills your form fields accurately.',
    accent: '#6366f1',
  },
  {
    icon: '⚡',
    title: 'Real-Time Tracking',
    desc: 'Follow every status change live. Instant in-app notifications keep you informed at every step.',
    accent: '#f59e0b',
  },
  {
    icon: '🛡️',
    title: 'Role-Based Access',
    desc: 'Admins, staff, and users each get a tailored workspace with exactly the tools they need.',
    accent: '#10b981',
  },
  {
    icon: '💬',
    title: 'Threaded Discussions',
    desc: 'Communicate directly on each complaint. Staff can post internal notes invisible to end users.',
    accent: '#a855f7',
  },
  {
    icon: '📊',
    title: 'Admin Analytics',
    desc: 'Visual dashboards show resolution rates, priority breakdowns, and team workload at a glance.',
    accent: '#ef4444',
  },
  {
    icon: '🔒',
    title: 'Google OAuth',
    desc: 'One-click sign-in with Google. Secure, fast, and no passwords to remember.',
    accent: '#06b6d4',
  },
];

const STEPS = [
  { num: '01', title: 'Submit', desc: 'Describe your issue — AI fills the form for you.' },
  { num: '02', title: 'Assign', desc: 'Admin routes it to the right staff member instantly.' },
  { num: '03', title: 'Resolve', desc: 'Staff updates status; you get notified every step.' },
  { num: '04', title: 'Close', desc: 'Mark resolved, close the loop, keep the record.' },
];

const STATS = [
  { value: '98%', label: 'Resolution Rate' },
  { value: '<2h', label: 'Avg. Response Time' },
  { value: '10k+', label: 'Complaints Managed' },
  { value: '3', label: 'Role Types Supported' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="lp-root">
      {/* Ambient blobs */}
      <div className="lp-blob lp-blob-1" />
      <div className="lp-blob lp-blob-2" />
      <div className="lp-blob lp-blob-3" />

      {/* ── Navbar ── */}
      <nav className={`lp-nav${scrolled ? ' lp-nav--scrolled' : ''}`}>
        <div className="lp-nav__logo">
          <div className="lp-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span>ComplaintSys</span>
        </div>
        <div className="lp-nav__links">
          <a href="#features" className="lp-nav__link">Features</a>
          <a href="#how-it-works" className="lp-nav__link">How it works</a>
        </div>
        <div className="lp-nav__actions">
          <button className="btn-ghost" onClick={() => navigate('/login')}>Sign in</button>
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Get Started
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </nav>

      <main>
        {/* ── Hero ── */}
        <section className="lp-hero">
          <div className="lp-hero__pill fade-up delay-1">
            <span className="lp-pill-dot" />
            AI-Powered Complaint Management
          </div>

          <h1 className="lp-hero__h1 fade-up delay-2">
            Resolve Every Issue
            <br />
            <span className="lp-gradient-text">Beautifully & Fast</span>
          </h1>

          <p className="lp-hero__sub fade-up delay-3">
            Submit, track, and close complaints in one unified workspace — powered by AI, designed for modern teams.
          </p>

          <div className="lp-hero__actions fade-up delay-4">
            <button className="btn-primary btn-lg lp-cta-btn" onClick={() => navigate('/login')}>
              Start for Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
            <a href="#how-it-works" className="lp-ghost-link btn-lg">
              See how it works ↓
            </a>
          </div>

          {/* Stats strip */}
          <div className="lp-stats fade-up delay-5">
            {STATS.map(s => (
              <div key={s.label} className="lp-stat">
                <span className="lp-stat__value">{s.value}</span>
                <span className="lp-stat__label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Dashboard preview card */}
          <div className="lp-hero__preview fade-up delay-5">
            <div className="lp-preview-card">
              <div className="lp-preview-topbar">
                <div className="lp-preview-dots">
                  <span style={{ background: '#ef4444' }} />
                  <span style={{ background: '#f59e0b' }} />
                  <span style={{ background: '#10b981' }} />
                </div>
                <div className="lp-preview-url">complaintsys.app/dashboard</div>
              </div>
              <div className="lp-preview-body">
                <div className="lp-preview-sidebar">
                  {['Dashboard', 'My Complaints', 'Notifications', 'Settings'].map((item, i) => (
                    <div key={item} className={`lp-preview-nav-item${i === 0 ? ' active' : ''}`}>{item}</div>
                  ))}
                </div>
                <div className="lp-preview-content">
                  <div className="lp-preview-row">
                    {[
                      { label: 'Total', val: '12', color: '#818cf8' },
                      { label: 'Open', val: '4', color: '#fbbf24' },
                      { label: 'Resolved', val: '7', color: '#34d399' },
                    ].map(m => (
                      <div key={m.label} className="lp-preview-metric">
                        <span className="lp-preview-metric__val" style={{ color: m.color }}>{m.val}</span>
                        <span className="lp-preview-metric__label">{m.label}</span>
                      </div>
                    ))}
                  </div>
                  {['WiFi down in Block B', 'Printer not working', 'AC unit broken'].map((t, i) => (
                    <div key={t} className="lp-preview-item">
                      <div className="lp-preview-item__dot" style={{ background: ['#818cf8', '#fbbf24', '#34d399'][i] }} />
                      <span className="lp-preview-item__text">{t}</span>
                      <span className="lp-preview-item__badge" style={{ color: ['#818cf8', '#fbbf24', '#34d399'][i] }}>
                        {['Open', 'In Progress', 'Resolved'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="lp-features" id="features">
          <div className="lp-section-head fade-up">
            <span className="lp-section-tag">Features</span>
            <h2 className="lp-section-title">Everything your team needs</h2>
            <p className="lp-section-sub">A complete complaint lifecycle management platform — from submission to resolution.</p>
          </div>

          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`lp-feature-card fade-up delay-${(i % 3) + 1}`}>
                <div className="lp-feature-icon" style={{ background: `${f.accent}18`, border: `1px solid ${f.accent}30` }}>
                  <span>{f.icon}</span>
                </div>
                <div className="lp-feature-line" style={{ background: f.accent }} />
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="lp-how" id="how-it-works">
          <div className="lp-section-head fade-up">
            <span className="lp-section-tag">Workflow</span>
            <h2 className="lp-section-title">How it works</h2>
            <p className="lp-section-sub">Four simple steps from complaint to resolution.</p>
          </div>

          <div className="lp-steps">
            {STEPS.map((s, i) => (
              <div key={s.num} className={`lp-step fade-up delay-${i + 1}`}>
                <div className="lp-step__num">{s.num}</div>
                {i < STEPS.length - 1 && <div className="lp-step__connector" />}
                <h3 className="lp-step__title">{s.title}</h3>
                <p className="lp-step__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="lp-cta fade-up">
          <div className="lp-cta__glow" />
          <span className="lp-section-tag">Get started today</span>
          <h2 className="lp-cta__title">Ready to streamline your complaints?</h2>
          <p className="lp-cta__sub">Join teams already managing issues faster with ComplaintSys.</p>
          <div className="lp-cta__actions">
            <button className="btn-primary btn-lg lp-cta-btn" onClick={() => navigate('/login')}>
              Start for Free — it's quick
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer__logo">
          <div className="lp-logo-icon" style={{ width: '28px', height: '28px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span>ComplaintSys</span>
        </div>
        <p className="lp-footer__copy">© {new Date().getFullYear()} ComplaintSys Inc. All rights reserved.</p>
        <div className="lp-footer__links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <span onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Sign in</span>
        </div>
      </footer>
    </div>
  );
}
