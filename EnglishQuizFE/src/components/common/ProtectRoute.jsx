import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Spinner } from "react-bootstrap";

const ProtectRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="warning" />
        <span className="ms-3 fw-semibold text-muted">Đang xác thực tài khoản...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || "").toUpperCase();
    const allowed = allowedRoles.map((r) => r.toUpperCase());

    if (!allowed.includes(userRole)) {
      // If role does not match, redirect to the user's appropriate portal
      if (userRole === "ADMIN") return <Navigate to="/admin" replace />;
      if (userRole === "TEACHER") return <Navigate to="/teacher" replace />;
      return <Navigate to="/student" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectRoute;
