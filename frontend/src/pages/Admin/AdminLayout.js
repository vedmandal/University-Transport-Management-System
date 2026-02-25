import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./AdminLayout.css"; 

export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path ? "adm-link-active" : "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className={`adm-layout-root ${isSidebarOpen ? "sidebar-open" : ""}`}>
      {/* 📱 MOBILE OVERLAY */}
      {isSidebarOpen && <div className="adm-sidebar-overlay" onClick={toggleSidebar}></div>}

      {/* 🔵 SIDEBAR */}
      <aside className={`adm-sidebar ${isSidebarOpen ? "show" : ""}`}>
        <div className="adm-sidebar-top">
          <div className="adm-brand-box">
            <span className="adm-brand-icon">🛡️</span>
            <div className="adm-brand-text">
              <h5 className="adm-brand-name">CampusCommute</h5>
              <p className="adm-brand-sub">ADMIN TERMINAL</p>
            </div>
          </div>

          <ul className="adm-nav-list mt-3">
            {[
              { path: "/admin/add-bus", label: "Add Bus", icon: "➕" },
              { path: "/admin/track", label: "Track Buses", icon: "📍" },
              { path: "/admin/add-driver", label: "Add Driver", icon: "👨‍✈️" },
              { path: "/admin/buses", label: "Buses List", icon: "🚌" },
              { path: "/admin/add-route", label: "Add Route", icon: "🛣️" },
              { path: "/admin/parents", label: "Manage Parents", icon: "👪" },
              { path: "/admin/assign-bus", label: "Assign Bus", icon: "🎓" },
            ].map((item) => (
              <li className="adm-nav-item" key={item.path}>
                <Link 
                  className={`adm-link ${isActive(item.path)}`} 
                  to={item.path}
                  onClick={() => setSidebarOpen(false)} // Close on mobile link click
                >
                  <span className="adm-nav-icon">{item.icon}</span> {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="adm-sidebar-footer">
          <button onClick={handleLogout} className="adm-logout-full">
            LOGOUT SESSION
          </button>
        </div>
      </aside>

      {/* ⚪ MAIN CONTENT AREA */}
      <main className="adm-content-area">
        <nav className="adm-top-nav shadow-sm">
          <div className="d-flex align-items-center gap-3">
            {/* 🍔 HAMBURGER MENU */}
            <button className="adm-hamburger d-md-none" onClick={toggleSidebar}>
              <span className="bi bi-list"></span>
            </button>
            <span className="adm-page-title d-none d-sm-block">Dashboard</span>
          </div>

          <div className="adm-user-profile">
             <div className="adm-user-details d-none d-md-block">
               <span className="adm-role-label">LOGGED IN AS</span>
               <span className="adm-user-name">System Admin</span>
             </div>
             <div className="adm-avatar shadow-sm">A</div>
          </div>
        </nav>
        
        <div className="adm-main-viewport">
          <div className="adm-view-card">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}