import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('show');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }, []);

  return (
    <div className="home-wrapper">
      {/* 🚥 TOP STATUS BAR */}
      <div className="top-status-bar d-none d-lg-flex">
        <div className="container d-flex justify-content-between align-items-center">
          <span className="status-text"><span className="status-dot"></span> All Campus Nodes Operational</span>
          <span className="version-tag">Build v4.2.0-stable</span>
        </div>
      </div>

      {/* 🚀 NAVIGATION */}
      <nav className="navbar-custom sticky-top">
        <div className="container d-flex justify-content-between align-items-center py-3">
          <div className="nav-logo">KRMU <span className="text-indigo">TRANSIT</span></div>
          <div className="nav-links d-none d-md-flex gap-5">
            <a href="#workflow">Process</a>
            <a href="#admin">Admin</a>
            <a href="#driver">Driver</a>
            <a href="#student">Student</a>
          </div>
          <Link to="/login" className="btn-signin">Sign In</Link>
        </div>
      </nav>

      {/* 🏛️ HERO SECTION */}
      <header className="hero-section reveal">
        <div className="container text-center">
          <div className="pill-badge mb-4">ENGINEERING CAMPUS MOBILITY</div>
          <h1 className="main-title">
            THE UNIFIED <br/>
            <span className="glow-text">TRANSIT ENGINE</span>
          </h1>
          <p className="hero-subtext mx-auto mt-4 mb-5">
            A specialized framework designed to orchestrate K.R. Mangalam University's 
            fleet, telemetry data, and student logistics into one high-performance ecosystem.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/login" className="btn-indigo-lg">Access The Hub</Link>
            <a href="#workflow" className="btn-outline-lg text-decoration-none">View Workflow</a>
          </div>
        </div>
      </header>

      {/* 📊 LIVE METRICS */}
      <section className="metrics-bar border-top border-bottom border-secondary reveal">
        <div className="container py-5">
          <div className="row text-center">
            <div className="col-md-3">
              <h2 className="fw-bold text-white mb-0">60+</h2>
              <p className="small text-silver text-uppercase tracking-widest">Active Fleet</p>
            </div>
            <div className="col-md-3">
              <h2 className="fw-bold text-white mb-0">9ms</h2>
              <p className="small text-silver text-uppercase tracking-widest">Data Latency</p>
            </div>
            <div className="col-md-3">
              <h2 className="fw-bold text-white mb-0">12k</h2>
              <p className="small text-silver text-uppercase tracking-widest">Monthly Trips</p>
            </div>
            <div className="col-md-3">
              <h2 className="fw-bold text-white mb-0">99.9%</h2>
              <p className="small text-silver text-uppercase tracking-widest">GPS Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🔄 THE WORKFLOW */}
      <section id="workflow" className="section-padding reveal">
        <div className="container">
          <div className="text-center mb-100">
            <span className="role-label text-indigo">THE INFRASTRUCTURE</span>
            <h2 className="display-4 fw-bold text-white">How it Synchronizes</h2>
          </div>
          <div className="row g-0 workflow-grid">
            <div className="col-md-4 workflow-step">
              <div className="step-number">01</div>
              <h4>Orchestrate</h4>
              <p className="text-silver">Admins define fleet logic, assign authenticated drivers, and verify route security tokens.</p>
            </div>
            <div className="col-md-4 workflow-step">
              <div className="step-number">02</div>
              <h4>Broadcast</h4>
              <p className="text-silver">Drivers initiate the high-frequency beacon, streaming live telemetry to the Transit cloud.</p>
            </div>
            <div className="col-md-4 workflow-step">
              <div className="step-number">03</div>
              <h4>Consume</h4>
              <p className="text-silver">Students ingest live data via the Radar Map, enabling precise commute timing and safety.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ ADMIN SECTION */}
      <section id="admin" className="section-padding bg-darker reveal">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="role-label text-indigo">ADMIN CONTROL</span>
              <h2 className="display-4 fw-bold text-white mb-4">Command Center</h2>
              <p className="text-silver fs-5 mb-5">The ultimate dashboard for fleet oversight. Manage every node of the university transportation network from one screen.</p>
              <div className="feature-item-complex d-flex gap-4 mb-4">
                 <div className="feat-icon-box"><i className="bi bi-cpu"></i></div>
                 <div>
                    <h5 className="text-white">Centralized Logic</h5>
                    <p className="text-silver small">Maintain full authority over driver credentials and bus scheduling.</p>
                 </div>
              </div>
              <div className="feature-item-complex d-flex gap-4">
                 <div className="feat-icon-box"><i className="bi bi-graph-up-arrow"></i></div>
                 <div>
                    <h5 className="text-white">Real-time Analytics</h5>
                    <p className="text-silver small">Monitor peak hour usage and optimize route efficiency through data.</p>
                 </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="code-card">
                 <div className="code-header"><span></span><span></span><span></span></div>
                 <pre><code>{`// Registering New Node
KRMU_Transit.registerBus({
  id: "BUS-99",
  route: "NORTH-WING",
  driver_auth: "REQUIRED",
  gps_interval: "250ms"
});`}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 👨‍✈️ DRIVER SECTION */}
      <section id="driver" className="section-padding reveal">
        <div className="container">
          <div className="row align-items-center g-5 flex-column-reverse flex-lg-row">
            <div className="col-lg-6">
               <div className="radar-visual mx-auto">
                  <div className="radar-line"></div>
                  <div className="radar-circles"></div>
               </div>
            </div>
            <div className="col-lg-6">
              <span className="role-label text-emerald">DRIVER TELEMETRY</span>
              <h2 className="display-4 fw-bold text-white mb-4">One-Tap Broadcast</h2>
              <p className="text-silver mb-5">Built for focus. The driver interface is stripped of distractions, focusing purely on location integrity and trip status.</p>
              <div className="stat-card-row d-flex gap-3">
                 <div className="mini-stat">
                    <span className="text-emerald fw-bold">LATENCY</span>
                    <h4>0.4s</h4>
                 </div>
                 <div className="mini-stat">
                    <span className="text-emerald fw-bold">ACCURACY</span>
                    <h4>99%</h4>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🎓 STUDENT SECTION */}
      <section id="student" className="section-padding bg-darker reveal">
        <div className="container text-center">
          <span className="role-label text-indigo">STUDENT HUB</span>
          <h2 className="display-4 fw-bold text-white mb-5">Seamless Commutes</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="bento-card-v3">
                <i className="bi bi-radar"></i>
                <h3>Live Tracking</h3>
                <p>High-detail radar map showing precise bus movements.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="bento-card-v3">
                <i className="bi bi-bell-fill"></i>
                <h3>Stop Alerts</h3>
                <p>Get notified exactly when the bus is 2 stops away.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="bento-card-v3">
                <i className="bi bi-shield-lock-fill"></i>
                <h3>Seat Security</h3>
                <p>Encrypted booking system ensures your seat is reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌑 REFINED FOOTER */}
      <footer className="footer-area">
        <div className="container py-100">
          <div className="row g-5">
            <div className="col-lg-4">
              <div className="nav-logo mb-4">KRMU <span className="text-indigo">TRANSIT</span></div>
              <p className="text-silver pe-lg-5 mb-4">
                The official infrastructure powering mobility at K.R. Mangalam University. 
                Built for safety, performance, and transparency.
              </p>
              <div className="d-flex gap-3">
                <a href="#" className="social-pill"><i className="bi bi-twitter-x"></i></a>
                <a href="#" className="social-pill"><i className="bi bi-linkedin"></i></a>
                <a href="#" className="social-pill"><i className="bi bi-github"></i></a>
              </div>
            </div>
            <div className="col-lg-2 col-6">
              <h6 className="footer-heading">Platform</h6>
              <ul className="footer-link-list">
                <li><Link to="/login">Admin Suite</Link></li>
                <li><Link to="/login">Driver Beacon</Link></li>
                <li><Link to="/login">Student Radar</Link></li>
                <li><a href="#">System Status</a></li>
              </ul>
            </div>
            <div className="col-lg-2 col-6">
              <h6 className="footer-heading">Resources</h6>
              <ul className="footer-link-list">
                <li><a href="#">Fleet API</a></li>
                <li><a href="#">Support Hub</a></li>
                <li><a href="#">Security Docs</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
            <div className="col-lg-4 text-lg-end">
              <h6 className="footer-heading">Global Headquarters</h6>
              <p className="text-silver small">Sohna Road, Gurugram, Delhi-NCR<br/>Haryana, India</p>
              <div className="mt-4 p-3 bg-dark-pill d-inline-block">
                <span className="text-emerald small fw-bold">● SYSTEM OPERATIONAL</span>
              </div>
            </div>
          </div>
          <div className="footer-bottom border-top border-secondary mt-5 pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p className="x-small text-white-50">© 2026 K.R. Mangalam University. TransitCore Engineering.</p>
            <p className="x-small text-white-50">Powered by NextGen Cloud Infrastructure</p>
          </div>
        </div>
      </footer>
    </div>
  );
}