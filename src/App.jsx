import './App.css'
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import Register from "./pages/Register";
import Track from "./pages/Track";
import Login from "./pages/Login";
import AuthSuccess from "./pages/AuthSuccess";
import Dashboard from "./pages/Dashboard";

function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* Navbar */}
      <nav className="navbar fade-up delay-1">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          ComplaintSys
        </div>
        <div className="nav-buttons">
          <button className="btn-ghost" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="btn-primary" onClick={() => navigate("/register")}>
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="hero fade-up delay-2">
          <div className="hero-pill">
            <span role="img" aria-label="sparkles">✨</span>
            The New Standard in Resolution
          </div>
          <h1>Manage Complaints <span className="gradient-text">Beautifully</span></h1>
          <p>Submit, track, and resolve complaints effortlessly in one unified, intelligent workspace designed for modern teams.</p>

          <div className="hero-actions">
            <button className="btn-primary btn-lg" onClick={() => navigate("/register")}>
              Get Started
            </button>
            <button className="btn-ghost btn-lg" onClick={() => navigate("/track")}>
              Track Status
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section fade-up delay-3" id="features">
          <span className="section-label">Features</span>
          <h2 className="section-title">Everything you need</h2>

          <div className="features-grid">
            <div className="feature-card" id="card-submit">
              <div className="feature-icon-wrapper">📝</div>
              <h3>Seamless Submission</h3>
              <p>Users can submit their complaints in seconds using our highly optimized and beautifully designed forms.</p>
            </div>

            <div className="feature-card" id="card-track">
              <div className="feature-icon-wrapper">⚡</div>
              <h3>Real-Time Tracking</h3>
              <p>Stay updated at every step. Receive instant notifications and actionable insights on complaint status.</p>
            </div>

            <div className="feature-card" id="card-manage">
              <div className="feature-icon-wrapper">🛡️</div>
              <h3>Admin Dashboard</h3>
              <p>A powerful central hub for managers to efficiently organize, assign, and resolve issues with complete visibility.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer fade-up delay-4">
        <p>&copy; {new Date().getFullYear()} ComplaintSys Inc. All rights reserved.</p>
      </footer>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/track" element={<Track />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;