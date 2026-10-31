import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Homepage from "./pages/Homepage";
import "./styles/theme.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Trang chủ do Kombai thiết kế */}
          <Route path="/" element={<Homepage />} />

          {/* Các Route cho các tính năng tiếp theo */}
          <Route path="/login" element={
            <div className="container py-5 text-center">
              <h3>Trang Đăng Nhập (Login)</h3>
              <p className="text-muted">Đang được hoàn thiện theo phong cách mới của Kombai.</p>
            </div>
          } />

          <Route path="/register" element={
            <div className="container py-5 text-center">
              <h3>Trang Đăng Ký (Register)</h3>
              <p className="text-muted">Đang được hoàn thiện theo phong cách mới của Kombai.</p>
            </div>
          } />

          <Route path="/student/*" element={
            <div className="container py-5 text-center">
              <h3>Không Gian Học Viên (Student Portal)</h3>
              <p className="text-muted">Dev 1 đang xây dựng với Kombai và Antigravity.</p>
            </div>
          } />

          <Route path="/teacher/*" element={
            <div className="container py-5 text-center">
              <h3>Studio Giáo Viên (Teacher Studio)</h3>
              <p className="text-muted">Dev 2 đang xây dựng với Kombai và Antigravity.</p>
            </div>
          } />

          <Route path="/admin/*" element={
            <div className="container py-5 text-center">
              <h3>Không Gian Quản Trị (Admin Workspace)</h3>
              <p className="text-muted">Dev 3 đang xây dựng với Kombai và Antigravity.</p>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
