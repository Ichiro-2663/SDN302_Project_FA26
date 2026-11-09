import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectRoute from "./components/common/ProtectRoute";

// Pages
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentPage from "./pages/StudentPage";
import TeacherPage from "./pages/TeacherPage";
import AdminPage from "./pages/AdminPage";

import "./styles/theme.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Route: Student Portal */}
          <Route element={<ProtectRoute allowedRoles={["Student", "Admin"]} />}>
            <Route path="/student/*" element={<StudentPage />} />
          </Route>

          {/* Protected Route: Teacher Studio */}
          <Route element={<ProtectRoute allowedRoles={["Teacher", "Admin"]} />}>
            <Route path="/teacher/*" element={<TeacherPage />} />
          </Route>

          {/* Protected Route: Admin Workspace */}
          <Route element={<ProtectRoute allowedRoles={["Admin"]} />}>
            <Route path="/admin/*" element={<AdminPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
