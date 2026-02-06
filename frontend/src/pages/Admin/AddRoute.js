import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import RouteFormModal from "./RouteFormModal";
import "./AddRoute.css"; // Ensure this is imported

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editRoute, setEditRoute] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadRoutes = async () => {
    const res = await api.get("/routes/get-route");
    setRoutes(res.data.allRoutes);
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
    <div className="container-fluid py-2">
      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Transit Routes</h4>
          <p className="text-muted small">Manage university bus paths and stops</p>
        </div>
        <button
          className="btn btn-action px-4 fw-bold shadow-sm"
          onClick={() => {
            setEditRoute(null);
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-lg me-2"></i>Add Route
        </button>
      </div>

      {/* ROUTES LIST */}
      <div className="row">
        {routes.length === 0 ? (
          <div className="col-12 text-center py-5">
             <p className="text-muted">No routes available. Click "+ Add Route" to start.</p>
          </div>
        ) : (
          routes.map((route) => (
            <div key={route._id} className="col-12 mb-3">
              <div className="route-item-card d-flex justify-content-between align-items-center shadow-sm">
                <div className="d-flex align-items-center">
                  <div className="route-icon-box me-3">
                    <i className="bi bi-signpost-2"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-0">{route.routeName}</h6>
                    <span className="text-muted small">ID: {route._id.substring(0, 8)}...</span>
                  </div>
                </div>
                
                <div className="action-buttons">
                  <button
                    className="btn btn-sm btn-edit-subtle me-2"
                    onClick={() => openEdit(route)}
                  >
                    <i className="bi bi-pencil-square me-1"></i> Edit
                  </button>
                  <button
                    className="btn btn-sm btn-delete-subtle"
                    onClick={() => deleteRoute(route._id)}
                  >
                    <i className="bi bi-trash3 me-1"></i> Delete
                  </button>
                </div>
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