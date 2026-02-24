import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import "./AdminDashboard.css";

export default function AddBus() {
  const [busNo, setBusNo] = useState("");
  const [totalSeats, setTotalSeats] = useState(20);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [driverId, setDriverId] = useState("");
  const [routeId, setRouteId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const driverRes = await api.get("/auth/get-drivers");
        const routeRes = await api.get("/routes/get-route");
        setDrivers(driverRes.data.drivers);
        setRoutes(routeRes.data.allRoutes);
      } catch {
        toast.error("Failed to load drivers or routes");
      }
    };
    fetchData();
  }, []);

  const addBus = async (e) => {
    e.preventDefault();
    if (!busNo || !driverId || !routeId) {
      toast.error("All fields are required");
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      await api.post("/bus/add-bus", { busNo, totalSeats, driverId, routeId });
      toast.success("Bus added successfully");
      setBusNo(""); setTotalSeats(20); setDriverId(""); setRouteId("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add bus");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-page-root">
      <div className="adm-form-container">
        <div className="adm-card shadow-sm animate-fadeIn">
          <div className="adm-card-header">
            <div className="adm-icon-circle">🚌</div>
            <h4 className="adm-title">Add New Bus</h4>
            <p className="adm-subtitle">Enter bus details and assign a driver and route.</p>
          </div>

          <form onSubmit={addBus} className="adm-form-body">
            <div className="adm-input-group">
              <label className="adm-label">Bus Number</label>
              <input
                className="adm-input"
                placeholder="e.g. DL 1PC 1234"
                value={busNo}
                onChange={(e) => setBusNo(e.target.value)}
                required
              />
            </div>

            <div className="adm-input-group">
              <label className="adm-label">Total Seats</label>
              <input
                type="number"
                className="adm-input"
                value={totalSeats}
                onChange={(e) => setTotalSeats(Number(e.target.value))}
                min={1}
                required
              />
            </div>

            <div className="adm-input-group">
              <label className="adm-label">Assign Driver</label>
              <select
                className="adm-select"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                required
              >
                <option value="">Select Driver</option>
                {drivers?.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="adm-input-group">
              <label className="adm-label">Assign Route</label>
              <select
                className="adm-select"
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                required
              >
                <option value="">Select Route</option>
                {routes?.map((route) => (
                  <option key={route._id} value={route._id}>
                    {route.routeName}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="adm-btn-submit"
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
              ) : "Register Bus"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}