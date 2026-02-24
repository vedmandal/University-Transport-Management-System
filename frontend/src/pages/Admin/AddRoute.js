import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import RouteFormModal from "./RouteFormModal";
import "./AddRoute.css"; 

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editRoute, setEditRoute] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadRoutes = async () => {
    try {
      const res = await api.get("/routes/get-route");
      setRoutes(res.data.allRoutes);
    } catch {
      toast.error("Failed to load routes");
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      if (editRoute) {
        await api.put(`/routes/update-route/${editRoute._id}`, data);
        toast.success("Route updated");
      } else {
        await api.post("/routes/add-route", data);
        toast.success("Route added");
      }
      setShowModal(false);
      setEditRoute(null);
      loadRoutes();
    } catch {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = async (route) => {
    const res = await api.get(`/routes/get-route/${route._id}`);
    setEditRoute(res.data.route);
    setShowModal(true);
  };

  const deleteRoute = async (id) => {
    if (!window.confirm("Delete this route?")) return;
    try {
      await api.delete(`/routes/delete-route/${id}`);
      toast.success("Route deleted");
      loadRoutes();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="adm-page-content">
      {/* HEADER SECTION */}
      <div className="adm-header-flex mb-4">
        <div>
          <h4 className="adm-section-title">Transit Routes</h4>
          <p className="adm-section-subtitle">Manage university bus paths and stops</p>
        </div>
        <button
          className="adm-btn-primary px-4 fw-bold"
          onClick={() => {
            setEditRoute(null);
            setShowModal(true);
          }}
        >
          ➕ ADD NEW ROUTE
        </button>
      </div>

      {/* ROUTES LIST */}
      <div className="adm-routes-wrapper">
        {routes.length === 0 ? (
          <div className="adm-empty-state text-center py-5">
             <span className="adm-empty-icon">🛣️</span>
             <p className="text-muted">No routes available. Click "+ Add Route" to start.</p>
          </div>
        ) : (
          routes.map((route) => (
            <div key={route._id} className="adm-route-strip animate-fadeIn">
              <div className="adm-route-main">
                <div className="adm-route-icon-box">
                  📍
                </div>
                <div className="adm-route-info">
                  <h6 className="adm-route-name">{route.routeName}</h6>
                  <span className="adm-route-id">UUID: {route._id.substring(0, 8)}...</span>
                </div>
              </div>
              
              <div className="adm-route-actions">
                <button
                  className="adm-btn-subtle-edit me-2"
                  onClick={() => openEdit(route)}
                >
                  EDIT
                </button>
                <button
                  className="adm-btn-subtle-delete"
                  onClick={() => deleteRoute(route._id)}
                >
                  DELETE
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <RouteFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        initialData={editRoute}
        loading={loading}
      />
    </div>
  );
}