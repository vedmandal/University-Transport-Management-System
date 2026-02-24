import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('show');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }, []);

  return (
    <div className="unified-home-root">
      <div className="mesh-gradient-1"></div>
      <div className="mesh-gradient-2"></div>

      {/* 🚀 NAVIGATION */}
      <nav className="navbar-custom sticky-top">
        <div className="container d-flex justify-content-between align-items-center py-3">
          <div className="nav-logo">
            <div className="logo-dot"></div>
            KRMU <span className="text-blue">TRANSIT</span>
          </div>
          <div className="nav-links d-none d-lg-flex">
            <a href="#architecture">Architecture</a>
            <a href="#admin">Admin Suite</a>
            <a href="#driver">Driver Beacon</a>
            <a href="#student">Student Radar</a>
          </div>
          <Link to="/login" className="btn-signin-nav">Portal Access</Link>
        </div>
      </nav>

      {/* 🏛️ HERO SECTION */}
      <header className="hero-section reveal">
        <div className="container text-center">
          <div className="pill-badge-hero mb-4">
             <span className="live-dot"></span> INFRASTRUCTURE STATUS: OPERATIONAL
          </div>
          <h1 className="main-title">
            Campus Mobility <br/>
            <span className="text-blue">Reimagined.</span>
          </h1>
          <p className="hero-subtext mx-auto mt-4 mb-5">
            The next-generation framework orchestrating fleet telemetry, encrypted driver logs, 
            and live student radar for K.R. Mangalam University.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/login" className="unified-btn-primary">Initialize Hub</Link>
            <a href="#architecture" className="btn-outline-custom">View Technicals</a>
          </div>
        </div>
      </header>

      {/* 📊 NETWORK STATS STRIP */}
      <section id="architecture" className="stats-strip reveal">
        <div className="container">
          <div className="stats-inner-glass d-flex justify-content-around align-items-center flex-wrap gap-4">
            <div className="stat-node">
              <span className="node-label">NETWORK LATENCY</span>
              <div className="node-value">14ms</div>
            </div>
            <div className="stat-node">
              <span className="node-label">FLEET CAPACITY</span>
              <div className="node-value">85+ Units</div>
            </div>
            <div className="stat-node">
              <span className="node-label">DAILY SESSIONS</span>
              <div className="node-value">12.4k</div>
            </div>
            <div className="stat-node border-0">
              <span className="node-label">GPS DRIFT</span>
              <div className="node-value">{"<"} 2.0m</div>
            </div>
          </div>
        </div>
      </section>

      {/* 📦 BENTO FEATURE GRID */}
      <section className="section-padding reveal">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="fw-800">The Transit Ecosystem</h2>
            <p className="text-muted">Three specialized interfaces. One unified engine.</p>
          </div>
          <div className="bento-grid-wrapper">
            
            {/* ADMIN */}
            <div id="admin" className="bento-item bento-large">
              <div className="bento-content h-100 d-flex flex-column">
                <span className="role-label-blue">Centralized Admin</span>
                <h3>Command & Control</h3>
                <p>Verify security tokens, manage driver credentials, and optimize route logic from a single source of truth. Features deep-analytics on peak hour congestion.</p>
                <div className="mockup-ui mt-auto">
                   <div className="mock-bar"></div>
                   <div className="mock-bar mid"></div>
                   <div className="mock-bar short"></div>
                </div>
              </div>
            </div>

            {/* DRIVER */}
            <div id="driver" className="bento-item bento-medium">
              <div className="bento-content">
                <span className="role-label-blue">Driver Telemetry</span>
                <h4>Sub-second Precision</h4>
                <div className="radar-mini-wrap mt-3 mb-3">
                   <div className="radar-scanner"></div>
                </div>
                <p className="small text-muted">A distraction-free HUD for fleet operators to stream location data.</p>
              </div>
            </div>

            {/* STUDENT */}
            <div id="student" className="bento-item bento-medium student-bg">
              <div className="bento-content">
                <span className="role-label-blue">Student Hub</span>
                <h4>Live Radar Map</h4>
                <p>Real-time visuals for safer commutes. Integrated with smart ETA notifications.</p>
                <div className="feature-tags">
                   <span>#LiveTracking</span>
                   <span>#SmartAlerts</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🌑 COMPREHENSIVE FOOTER */}
      <footer className="footer-area">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-4">
              <div className="nav-logo mb-4">
                <div className="logo-dot"></div>
                KRMU <span className="text-blue">TRANSIT</span>
              </div>
              <p className="footer-about-text">
                The official mobility infrastructure powering K.R. Mangalam University. 
                Built for performance, scalability, and absolute transparency in campus logistics.
              </p>
              <div className="social-links d-flex gap-3">
                <a href="#"><i className="bi bi-linkedin"></i></a>
                <a href="#"><i className="bi bi-twitter-x"></i></a>
                <a href="#"><i className="bi bi-github"></i></a>
              </div>
            </div>
            
            <div className="col-md-3 col-6 ms-lg-auto">
              <h6 className="footer-title">Platform</h6>
              <ul className="footer-list">
                <li><Link to="/login">Admin Suite</Link></li>
                <li><Link to="/login">Driver Beacon</Link></li>
                <li><Link to="/login">Student Radar</Link></li>
                <li><a href="#">System Status</a></li>
              </ul>
            </div>

            <div className="col-md-3 col-6">
              <h6 className="footer-title">Support & Safety</h6>
              <ul className="footer-list">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Security Protocols</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom border-top mt-5 pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p className="copyright-text m-0">© 2026 KRMU TransitCore Engineering. All rights reserved.</p>
            <div className="footer-badge">
              <span className="secure-dot"></span> ENCRYPTED DATA CHANNEL
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}