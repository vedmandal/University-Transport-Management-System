import { useState, useEffect } from "react";
import api from "../../api/axios";
import AsyncSelect from "react-select/async";
import "./AssignBus.css";

export default function AssignBus() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🔎 Search Students */
  const loadStudentOptions = async (inputValue) => {
    if (!inputValue) return [];
    try {
      const res = await api.get(`/auth/students/search?query=${inputValue}`);
      return res.data.students.map((s) => ({
        value: s._id,
        label: `${s.name} (${s.email})`,
      }));
    } catch {
      return [];
    }
  };

  /* 🚌 Fetch All Buses */
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await api.get("/bus/get-bus");
        setBuses(res.data.allBus || []);
      } catch (err) {
        console.error("Bus fetch failed", err);
      }
    };
    fetchBuses();
  }, []);

  /* ✅ Assign Bus */
  const handleAssign = async () => {
    if (!selectedStudent || !selectedBus) {
      return alert("Select student and bus");
    }

    try {
      setLoading(true);
      await api.put("/auth/assign-bus", {
        studentId: selectedStudent.value,
        busId: selectedBus,
      });

      alert("Bus assigned successfully");
      setSelectedStudent(null);
      setSelectedBus("");
    } catch (err) {
      alert("Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '12px',
      padding: '5px',
      border: '1px solid #e2e8f0',
      boxShadow: 'none',
      '&:hover': { border: '1px solid #3b82f6' }
    })
  };

  return (
    <div className="admin-page-root">
      <div className="mesh-gradient-1"></div>

      <div className="container py-4 position-relative" style={{ zIndex: 10 }}>
        <div className="mb-5">
          <span className="role-label-blue">Logistics Orchestration</span>
          <h2 className="main-title-sm">Fleet Assignment</h2>
          <p className="text-muted">Link students to specific transit units for live telemetry access.</p>
        </div>

        <div className="row g-4 justify-content-center">
          <div className="col-lg-6">
            <div className="unified-glass-card p-4">
              <h5 className="fw-800 mb-4">
                <i className="bi bi-link-45deg me-2 text-blue"></i>Create Assignment
              </h5>

              <div className="mb-4">
                <label className="form-label-custom">Identify Student</label>
                <AsyncSelect
                  cacheOptions
                  styles={customSelectStyles}
                  loadOptions={loadStudentOptions}
                  value={selectedStudent}
                  onChange={setSelectedStudent}
                  placeholder="Type name or email..."
                />
              </div>

              <div className="mb-4">
                <label className="form-label-custom">Select Transit Unit</label>
                <select
                  className="unified-input"
                  value={selectedBus}
                  onChange={(e) => setSelectedBus(e.target.value)}
                >
                  <option value="">Choose a Bus...</option>
                  {buses.map((bus) => (
                    <option key={bus._id} value={bus._id}>
                      Bus {bus.busNo} — {bus.routeId?.name || "No Route Name"}
                    </option>
                  ))}
                </select>
              </div>

              {/* VISUAL FEEDBACK CARD */}
              {(selectedStudent || selectedBus) && (
                <div className="assignment-preview mb-4 animate__animated animate__fadeIn">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="preview-node">
                      <span className="node-label">STUDENT</span>
                      <div className="node-text text-truncate" style={{maxWidth: '150px'}}>
                        {selectedStudent ? selectedStudent.label.split(' (')[0] : "---"}
                      </div>
                    </div>
                    <div className="preview-connector">
                      <div className="connector-line"></div>
                      <i className="bi bi-chevron-right"></i>
                    </div>
                    <div className="preview-node text-end">
                      <span className="node-label">TRANSIT UNIT</span>
                      <div className="node-text">
                        {selectedBus ? `Bus ${buses.find(b => b._id === selectedBus)?.busNo}` : "---"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button 
                className="unified-btn-primary w-100" 
                onClick={handleAssign}
                disabled={loading}
              >
                {loading ? "Updating Engine..." : "Finalize Assignment"}
              </button>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="unified-glass-card-mini student-bg h-100">
               <h6 className="fw-800 mb-3"><i className="bi bi-lightbulb me-2"></i>Quick Tip</h6>
               <p className="small text-muted mb-0">
                 Assigning a bus gives the student (and their linked parent) immediate access to the 
                 <b> Live Radar Hub </b> and proximity notifications for that specific transit unit.
               </p>
               <div className="mt-4 pt-4 border-top">
                  <div className="d-flex align-items-center gap-3">
                    <div className="system-dot"></div>
                    <span className="small fw-bold text-blue">System v4.2 Ready</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}