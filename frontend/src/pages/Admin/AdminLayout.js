import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./AdminLayout.css"; 

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path ? "active-link" : "";

  // 🚪 Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    // Clear any other admin-specific session data
    navigate("/");
  };

  return (
    <div className="container-fluid min-vh-100 p-0" style={{ backgroundColor: "#12121f" }}>
      <div className="row g-0">
        {/* 🔵 SIDEBAR */}
        <div className="col-md-2 sidebar-admin shadow-lg d-flex flex-column justify-content-between pb-4">
          <div>
            <div className="sidebar-header text-center py-4">
              <h5 className="fw-bold text-white mb-0">Admin Panel</h5>
              <p className="text-info small mb-0" style={{ fontSize: '12px' }}>KRMU Transit System</p>
            </div>

            <ul className="nav flex-column gap-2 px-3 mt-3">
              <li className="nav-item">
                <Link className={`nav-link admin-nav-item ${isActive("/admin/add-bus")}`} to="/admin/add-bus">
                  ➕ Add Bus
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link admin-nav-item ${isActive("/admin/track")}`} to="/admin/track">
                  📍 Track Buses
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link admin-nav-item ${isActive("/admin/add-driver")}`} to="/admin/add-driver">
                  👨‍✈️ Add Driver
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link admin-nav-item ${isActive("/admin/buses")}`} to="/admin/buses">
                  🚌 Buses
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link admin-nav-item ${isActive("/admin/add-route")}`} to="/admin/add-route">
                  🛣️ Add Route
                </Link>
              </li>
            </ul>
          </div>

          {/* SIDEBAR BOTTOM LOGOUT */}
          <div className="px-3">
            <button 
              onClick={handleLogout}
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 border-0 opacity-75 hover-opacity-100"
              style={{ padding: '12px' }}
            >
              <i className="bi bi-power"></i> Logout Session
            </button>
          </div>
        </div>

        {/* ⚪ MAIN CONTENT AREA */}
        <div className="col-md-10 content-area">
          <nav className="navbar px-4 py-3 mb-4 shadow-sm" style={{ backgroundColor: "#1c1c2d" }}>
            <span className="navbar-brand text-white fw-bold">Dashboard Overview</span>
            <div className="d-flex align-items-center">
               <span className="text-light me-3 d-none d-md-block">Welcome, <strong className="text-info">Admin</strong></span>
               
               {/* TOP NAV LOGOUT (ICON STYLE) */}
               <button 
                onClick={handleLogout}
                className="btn btn-dark border-secondary me-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px" }}
                title="Logout"
               >
                 <i className="bi bi-box-arrow-right text-danger"></i>
               </button>

               <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: "40px", height: "40px", border: "2px solid #333" }}>
                 A
               </div>
            </div>
          </nav>
          
          <div className="px-4 pb-4">
            <div className="content-card shadow-sm animate-fade-in">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}