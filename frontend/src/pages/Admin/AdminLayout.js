import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./AdminLayout.css"; 

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path ? "adm-link-active" : "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="adm-layout-root">
      <div className="row g-0">
        {/* 🔵 SIDEBAR */}
        <div className="col-md-2 adm-sidebar shadow-sm">
          <div className="adm-sidebar-top">
            <div className="adm-brand-box">
              <span className="adm-brand-icon">🛡️</span>
              <div className="adm-brand-text">
                <h5 className="adm-brand-name">CampusCommute</h5>
                <p className="adm-brand-sub">ADMIN TERMINAL</p>
              </div>
            </div>

            <ul className="adm-nav-list mt-4">
              <li className="adm-nav-item">
                <Link className={`adm-link ${isActive("/admin/add-bus")}`} to="/admin/add-bus">
                  <span className="adm-nav-icon">➕</span> Add Bus
                </Link>
              </li>
              <li className="adm-nav-item">
                <Link className={`adm-link ${isActive("/admin/track")}`} to="/admin/track">
                  <span className="adm-nav-icon">📍</span> Track Buses
                </Link>
              </li>
              <li className="adm-nav-item">
                <Link className={`adm-link ${isActive("/admin/add-driver")}`} to="/admin/add-driver">
                  <span className="adm-nav-icon">👨‍✈️</span> Add Driver
                </Link>
              </li>
              <li className="adm-nav-item">
                <Link className={`adm-link ${isActive("/admin/buses")}`} to="/admin/buses">
                  <span className="adm-nav-icon">🚌</span> Buses List
                </Link>
              </li>
              <li className="adm-nav-item">
                <Link className={`adm-link ${isActive("/admin/add-route")}`} to="/admin/add-route">
                  <span className="adm-nav-icon">🛣️</span> Add Route
                </Link>
              </li>
            </ul>
          </div>

          {/* SIDEBAR BOTTOM LOGOUT */}
          <div className="adm-sidebar-footer">
            <button onClick={handleLogout} className="adm-logout-full">
              LOGOUT SESSION
            </button>
          </div>
        </div>

        {/* ⚪ MAIN CONTENT AREA */}
        <div className="col-md-10 adm-content-area">
          <nav className="adm-top-nav shadow-sm">
            <span className="adm-page-title">Dashboard Overview</span>
            <div className="adm-user-profile">
               <div className="adm-user-details d-none d-md-block">
                 <span className="adm-role-label">LOGGED IN AS</span>
                 <span className="adm-user-name">System Admin</span>
               </div>
               <div className="adm-avatar">A</div>
            </div>
          </nav>
          
          <div className="adm-main-viewport">
            <div className="adm-view-card">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}