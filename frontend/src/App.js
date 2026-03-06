import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";

/* --- 🤖 AI INTEGRATION IMPORTS --- */
import { AIProvider } from "./context/AIContext"; 
import AIChatWidget from "./components/AIChatWidget"; 

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* 🏠 Public Pages */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OAuthSuccess from "./pages/OAuthSuccess";

/* 🎓 Student Pages */
import StudentDashboard from "./pages/StudentDashboard";

/* 👨‍✈️ Driver Pages */
import DriverDashboard from "./pages/DriverDashboard";

/* 👨‍👩‍👧 Parent Pages */
import ParentDashboard from "./pages/ParentDashboard";
import ChangePassword from "./pages/ChangePassword";

/* 🛠️ Admin Pages */
import AdminLayout from "./pages/Admin/AdminLayout";
import AddBus from "./pages/AdminDashboard"; 
import AddDriver from "./pages/Admin/AddDriver";
import AddRoute from "./pages/Admin/AddRoute";
import AdminTrackBuses from "./pages/Admin/AdminTrackBuses";
import AdminBusList from "./pages/Admin/AdminBustList";
import AdminTrackBus from "./pages/Admin/AdminTrackBus";
import AdminBusAttendance from "./pages/Admin/AdminAttendancePage";
import ParentManagement from "./pages/Admin/ParentManagement";
import AssignBus from "./pages/Admin/AssignBus";

/* --------------------------------------------------------------------------
   🛡️ PROTECTED ROUTE COMPONENT
-------------------------------------------------------------------------- */
const ProtectedRoute = ({ children, allowedRole }) => {
  const { role, token } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role?.toLowerCase() !== allowedRole.toLowerCase()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/* --------------------------------------------------------------------------
   🤖 AI WIDGET VISIBILITY CONTROL
   The widget only appears if a user is logged in (token exists).
   It remains hidden on Home, Login, and Register pages.
-------------------------------------------------------------------------- */
const GlobalAIWrapper = () => {
  const { token } = useContext(AuthContext);
  
  // Only render the widget if the user is authenticated
  if (token) {
    return <AIChatWidget />;
  }
  return null;
};

/* --------------------------------------------------------------------------
   🚀 MAIN APP COMPONENT
-------------------------------------------------------------------------- */
export default function App() {
  return (
    <AuthProvider>
      {/* AIProvider wraps everything to maintain chat history across navigation */}
      <AIProvider>
        <BrowserRouter>
          <ToastContainer position="top-right" autoClose={3000} />

          <Routes>
            {/* 🏠 Public Routes (No Chat shown here) */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />

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

            {/* 👨‍👩‍👧 Parent Routes */}
            <Route
              path="/parent-dashboard"
              element={
                <ProtectedRoute allowedRole="parent">
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/settings"
              element={
                <ProtectedRoute allowedRole="parent">
                  <ChangePassword />
                </ProtectedRoute>
              }
            />

            {/* 🛠️ Admin Routes (Nested in AdminLayout) */}
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

            {/* ❌ 404 Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* 📱 Floating AI Assistant (Visible role-wise after login) */}
          <GlobalAIWrapper />
          
        </BrowserRouter>
      </AIProvider>
    </AuthProvider>
  );
}