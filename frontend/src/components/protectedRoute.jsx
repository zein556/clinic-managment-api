
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  // No login session
  if (!token || !savedUser) {
    return <Navigate to="/" replace />;
  }

  let user;

  try {
    user = JSON.parse(savedUser);
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/" replace />;
  }

  // Check user role
  if (!allowedRoles.includes(user.role)) {
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin" replace />;

      case "doctor":
        return <Navigate to="/doctor" replace />;

      case "patient":
        return <Navigate to="/patient" replace />;

      default:
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;
