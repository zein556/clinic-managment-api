
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login";
import AdminDashboard from "./pages/adminDashboard";
import DoctorDashboard from "./pages/doctorDashboard";
import PatientDashboard from "./pages/patientDashboard";

import ProtectedRoute from "./components/protectedRoute";

function App() {
  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  const isAuthenticated = Boolean(token && user);

  const getDashboardPath = () => {
    switch (user?.role) {
      case "admin":
        return "/admin";

      case "doctor":
        return "/doctor";

      case "patient":
        return "/patient";

      default:
        return "/";
    }
  };

  return (
    <Routes>
      {/* Login page */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to={getDashboardPath()} replace />
            : <Login />
        }
      />

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Doctor routes */}
      <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
        <Route path="/doctor" element={<DoctorDashboard />} />
      </Route>

      {/* Patient routes */}
      <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
        <Route path="/patient" element={<PatientDashboard />} />
      </Route>

      {/* Unknown routes */}
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? getDashboardPath() : "/"}
            replace
          />
        }
      />
    </Routes>
  );
}
export default App;
