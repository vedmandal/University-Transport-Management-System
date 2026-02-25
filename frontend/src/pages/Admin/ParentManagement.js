import { useEffect, useState } from "react";
import api from "../../api/axios";
import AsyncSelect from "react-select/async";
import "./ParentManagement.css";

export default function ParentManagement() {
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchParents = async () => {
    try {
      const res = await api.get("/auth/parents");
      setParents(res.data.parents || []);
    } catch (err) {
      console.error("Failed to fetch parents:", err);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

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

  const handleCreateParent = async () => {
    if (!parentName || !parentEmail || !parentPassword || !selectedStudent) {
      return alert("Please fill all fields");
    }
    try {
      setLoading(true);
      await api.post("/auth/create-parent", {
        name: parentName,
        email: parentEmail,
        password: parentPassword,
        studentId: selectedStudent.value,
      });
      alert("Parent created successfully");
      setParentName("");
      setParentEmail("");
      setParentPassword("");
      setSelectedStudent(null);
      fetchParents();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating parent");
    } finally {
      setLoading(false);
    }
  };

  // Custom styles for React Select to match our theme
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
      {/* Aesthetic Backgrounds */}
      <div className="mesh-gradient-1"></div>
      
      <div className="container py-4 position-relative" style={{ zIndex: 10 }}>
        <div className="mb-4">
          <span className="role-label-blue">System Administration</span>
          <h2 className="main-title-sm">Parent Management</h2>
          <p className="text-muted">Register and link parent accounts to student telemetry.</p>
        </div>

        <div className="row g-4">
          {/* ================= CREATE FORM (LEFT) ================= */}
          <div className="col-lg-4">
            <div className="unified-glass-card p-4">
              <h5 className="fw-800 mb-4"><i className="bi bi-person-plus me-2 text-blue"></i>Create Account</h5>
              
              <div className="mb-3">
                <label className="form-label-custom">Parent Name</label>
                <input
                  type="text"
                  className="unified-input"
                  placeholder="Full Name"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Parent Email</label>
                <input
                  type="email"
                  className="unified-input"
                  placeholder="email@example.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Secure Password</label>
                <input
                  type="password"
                  className="unified-input"
                  placeholder="••••••••"
                  value={parentPassword}
                  onChange={(e) => setParentPassword(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label-custom">Link Student</label>
                <AsyncSelect
                  cacheOptions
                  styles={customSelectStyles}
                  loadOptions={loadStudentOptions}
                  value={selectedStudent}
                  onChange={setSelectedStudent}
                  placeholder="Search student..."
                />
              </div>

              <button
                className="unified-btn-primary w-100"
                onClick={handleCreateParent}
                disabled={loading}
              >
                {loading ? "Processing..." : "Register Parent"}
              </button>
            </div>
          </div>

          {/* ================= PARENT LIST (RIGHT) ================= */}
          <div className="col-lg-8">
            <div className="unified-glass-card p-0 overflow-hidden">
              <div className="p-4 border-bottom bg-white-50">
                <h5 className="fw-800 m-0">Registered Parents</h5>
              </div>
              <div className="table-responsive">
                <table className="table table-custom m-0">
                  <thead>
                    <tr>
                      <th>Parent Details</th>
                      <th>Linked Student</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parents.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-5 text-muted">
                          No parent records found in database.
                        </td>
                      </tr>
                    ) : (
                      parents.map((parent) => (
                        <tr key={parent._id}>
                          <td>
                            <div className="fw-bold text-dark">{parent.name}</div>
                            <div className="small text-muted">{parent.email}</div>
                          </td>
                          <td>
                            {parent.student ? (
                              <div>
                                <div className="text-blue fw-600">{parent.student.name}</div>
                                <div className="small text-muted">{parent.student.email}</div>
                              </div>
                            ) : (
                              <span className="badge bg-light text-dark">Unlinked</span>
                            )}
                          </td>
                          <td>
                            <span className="status-dot-active"></span> Active
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}