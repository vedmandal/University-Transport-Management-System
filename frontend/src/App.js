import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* Pages */
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminLayout from "./pages/Admin/AdminLayout";
import AddBus from "./pages/AdminDashboard";
import AddDriver from "./pages/Admin/AddDriver";
import AddRoute from "./pages/Admin/AddRoute";
import AdminTrackBuses from "./pages/Admin/AdminTrackBuses";
import AdminBusList from "./pages/Admin/AdminBustList";
import AdminTrackBus from "./pages/Admin/AdminTrackBus";
import AdminBusAttendance from "./pages/Admin/AdminAttendancePage";
import Home from "./pages/Home";
import ParentManagement from "./pages/Admin/ParentManagement";
import ParentDashboard from "./pages/ParentDashboard";
import AssignBus from "./pages/Admin/AssignBus";
import OAuthSuccess from "./pages/OAuthSuccess";

/* --------------------------------------------------------------------------
   🛡️ PROTECTED ROUTE (FINAL CLEAN VERSION)
-------------------------------------------------------------------------- */
const ProtectedRoute = ({ children, allowedRole }) => {
  const { role, token } = useContext(AuthContext);

  // If not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If role does not match
  if (allowedRole && role?.toLowerCase() !== allowedRole.toLowerCase()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />

        <Routes>
          {/* 🏠 Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🎓 Student */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* 👨‍✈️ Driver */}
          <Route
            path="/driver"
            element={
              <ProtectedRoute allowedRole="driver">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          {/* 👨‍👩‍👧 Parent */}
          <Route
            path="/parent-dashboard"
            element={
              <ProtectedRoute allowedRole="parent">
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/oauth-success" element={<OAuthSuccess />} />

          {/* 🛠️ Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="track" replace />} />
            <Route path="add-bus" element={<AddBus />} />
            <Route path="track" element={<AdminTrackBuses />} />
            <Route path="buses" element={<AdminBusList />} />
            <Route path="track/:busId" element={<AdminTrackBus />} />
            <Route path="attendance/:busId" element={<AdminBusAttendance />} />
            <Route path="add-driver" element={<AddDriver />} />
            <Route path="add-route" element={<AddRoute />} />
            <Route path="assign-bus" element={<AssignBus />} />
            <Route path="parents" element={<ParentManagement />} />
          </Route>

          {/* ❌ Unknown Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}