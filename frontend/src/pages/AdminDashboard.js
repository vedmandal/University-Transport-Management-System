import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import "./AdminDashboard.css"
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
    <div className="d-flex justify-content-center align-items-center py-4">
      <div className="form-card shadow-sm">
        <div className="form-card-header mb-4">
          <h4 className="fw-bold mb-1 text-dark">Add New Bus</h4>
          <p className="text-muted small">Enter bus details and assign a driver and route.</p>
        </div>

        <form onSubmit={addBus}>
          <div className="mb-3">
            <label className="form-label custom-label">Bus Number</label>
            <input
              className="form-control custom-input-light"
              placeholder="e.g. DL 1PC 1234"
              value={busNo}
              onChange={(e) => setBusNo(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label custom-label">Total Seats</label>
            <input
              type="number"
              className="form-control custom-input-light"
              value={totalSeats}
              onChange={(e) => setTotalSeats(Number(e.target.value))}
              min={1}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label custom-label">Assign Driver</label>
            <select
              className="form-select custom-input-light"
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

          <div className="mb-4">
            <label className="form-label custom-label">Assign Route</label>
            <select
              className="form-select custom-input-light"
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
            className="btn btn-action w-100 fw-bold"
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
            ) : "Register Bus"}
          </button>
        </form>
      </div>
    </div>
  );
}