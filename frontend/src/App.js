import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


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

/* --------------------------------------------------------------------------
   🛡️ PROTECTED ROUTE COMPONENT
   -------------------------------------------------------------------------- */
const ProtectedRoute = ({ children, allowedRole }) => {
  const { role } = useContext(AuthContext); // Access role from Context
  const token = localStorage.getItem("token");

  // 1. Check if token exists
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check if role matches (Normalization to lowercase for safety)
  const currentRole = role?.toLowerCase();
  const requiredRole = allowedRole?.toLowerCase();

  if (allowedRole && currentRole !== requiredRole) {
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
          {/* 🏠 Landing Page */}
          <Route path="/" element={<Home />} />

          {/* 🔓 Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🎓 Student Routes */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />

          {/* 👨‍✈️ Driver Routes */}
          <Route 
            path="/driver" 
            element={
              <ProtectedRoute allowedRole="driver">
                <DriverDashboard />
              </ProtectedRoute>
            } 
          />

          {/* 🛠️ Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Redirect /admin to /admin/track so it's not a blank page */}
            <Route index element={<Navigate to="track" replace />} />
            <Route path="add-bus" element={<AddBus />} />
            <Route path="track" element={<AdminTrackBuses />} />
            <Route path="buses" element={<AdminBusList />} />
            <Route path="track/:busId" element={<AdminTrackBus />} />
            <Route path="attendance/:busId" element={<AdminBusAttendance />} />
            <Route path="add-driver" element={<AddDriver />} />
            <Route path="add-route" element={<AddRoute />} />
          </Route>

          {/* 🚪 Catch-all: Redirect unknown paths to Login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}