import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import AsyncSelect from "react-select/async";
import { toast } from "react-toastify";
import "./ParentManagement.css";

export default function ParentManagement() {
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
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

  // Use useCallback to prevent function recreation on every render
  const loadStudentOptions = useCallback(async (inputValue) => {
    if (!inputValue || inputValue.length < 2) return [];

    try {
      // Added query parameter to match your backend controller
      const res = await api.get(`/auth/students/search?query=${inputValue}`);
      
      // Safety check for data structure
      const students = res.data.students || [];
      
      return students.map((s) => ({
        value: s._id,
        label: `${s.name} (${s.email})`,
      }));
    } catch (err) {
      console.error("Student search failed:", err);
      return [];
    }
  }, []);

  const handleCreateParent = async () => {
    if (!parentName || !parentEmail || !selectedStudent) {
      return toast.warn("Please fill name, email and link a student");
    }
    try {
      setLoading(true);
      await api.post("/auth/create-parent", {
        name: parentName,
        email: parentEmail,
        studentId: selectedStudent.value,
      });
      toast.success("Parent registered! Credentials sent via Email.");
      setParentName("");
      setParentEmail("");
      setSelectedStudent(null);
      fetchParents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating parent");
    } finally {
      setLoading(false);
    }
  };

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '14px',
      padding: '6px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      boxShadow: 'none',
      transition: '0.3s',
      '&:hover': { border: '1px solid #3b82f6' }
    })
  };

  return (
    <div className="admin-page-root">
      <div className="mesh-gradient-1"></div>
      
      <div className="container py-4 py-md-5 position-relative" style={{ zIndex: 10 }}>
        <header className="mb-5">
          <span className="role-label-blue">User Management</span>
          <h2 className="main-title-sm">Parent Directory</h2>
          <p className="text-muted max-w-500">
            Create parent accounts and link them to students for live transit monitoring.
          </p>
        </header>

        <div className="row g-4">
          {/* CREATE FORM */}
          <div className="col-lg-4">
            <div className="unified-glass-card p-4 h-100">
              <div className="d-flex align-items-center mb-4">
                <div className="icon-badge me-3">
                  <i className="bi bi-person-plus-fill"></i>
                </div>
                <h5 className="fw-800 m-0">Add New Parent</h5>
              </div>
              
              <div className="mb-3">
                <label className="form-label-custom">Full Name</label>
                <input
                  type="text"
                  className="unified-input"
                  placeholder="e.g. Robert Fox"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Email Address</label>
                <input
                  type="email"
                  className="unified-input"
                  placeholder="parent@email.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label-custom">Link to Student</label>
                <AsyncSelect
                  key="student-search-select" // Added key to force refresh
                  cacheOptions={false} // Set to false to ensure it triggers network call while debugging
                  styles={customSelectStyles}
                  loadOptions={loadStudentOptions}
                  value={selectedStudent}
                  onChange={setSelectedStudent}
                  placeholder="Search by name/email..."
                  noOptionsMessage={() => "No students found"}
                />
                <div className="form-info-tag mt-2">
                   <i className="bi bi-info-circle me-1"></i>
                   Password will be auto-generated & emailed.
                </div>
              </div>

              <button
                className="unified-btn-primary w-100 py-3"
                onClick={handleCreateParent}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <>Register & Send Access <i className="bi bi-send-fill ms-2"></i></>
                )}
              </button>
            </div>
          </div>

          {/* PARENT LIST */}
          <div className="col-lg-8">
            <div className="unified-glass-card p-0 overflow-hidden h-100">
              <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-white">
                <h5 className="fw-800 m-0">Active Parent Records</h5>
                <div className="badge-count">{parents.length} Accounts</div>
              </div>
              <div className="table-responsive">
                <table className="table table-custom m-0">
                  <thead>
                    <tr>
                      <th>Parent Identity</th>
                      <th>Connected Student</th>
                      <th>Account Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parents.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-5 text-muted">
                          <i className="bi bi-inbox display-4 d-block mb-3 opacity-25"></i>
                          No parent records found.
                        </td>
                      </tr>
                    ) : (
                      parents.map((parent) => (
                        <tr key={parent._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-initials me-3">
                                {parent.name?.charAt(0) || "?"}
                              </div>
                              <div>
                                <div className="fw-bold text-dark">{parent.name}</div>
                                <div className="small text-muted">{parent.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {parent.student ? (
                              <div className="student-link-box">
                                <span className="text-blue fw-700">{parent.student.name}</span>
                                <span className="d-block extra-small text-muted">{parent.student.email}</span>
                              </div>
                            ) : (
                              <span className="badge-unlinked">No Student Linked</span>
                            )}
                          </td>
                          <td>
                            <div className="status-pill-active">
                              <span className="dot"></span> Verified
                            </div>
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