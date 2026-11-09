import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import Footer from "../components/common/Footer";

// Admin components
import AdminDashboard from "../components/Admin/Admindashboard";
import UserManagement from "../components/Admin/Usermanagement";
import Reports from "../components/Admin/Reports";
import SystemNotice from "../components/Admin/SystemNotice";
import FeedbackManagement from "../components/Admin/FeedbackManagement";

const AdminPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialTab = () => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[0] === "admin") {
      return parts[1];
    }
    return localStorage.getItem("admin_active_tab") || "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[0] === "admin") {
      setActiveTab(parts[1]);
      localStorage.setItem("admin_active_tab", parts[1]);
    } else if (parts.length === 1 && parts[0] === "admin") {
      const saved = localStorage.getItem("admin_active_tab") || "dashboard";
      setActiveTab(saved);
      if (saved !== "dashboard") {
        navigate(`/admin/${saved}`, { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  const handleTabSelect = (tabKey) => {
    setActiveTab(tabKey);
    localStorage.setItem("admin_active_tab", tabKey);
    navigate(`/admin/${tabKey === "dashboard" ? "" : tabKey}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement />;
      case "reports":
        return <Reports />;
      case "system":
        return <SystemNotice />;
      case "feedbacks":
        return <FeedbackManagement />;
      case "dashboard":
      default:
        return <AdminDashboard onSelect={handleTabSelect} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Sidebar */}
      <Sidebar
        role="admin"
        activeTab={activeTab}
        onSelect={handleTabSelect}
        onToggle={setIsSidebarOpen}
      />

      {/* Main Content */}
      <div
        style={{
          marginLeft: isSidebarOpen ? "240px" : "70px",
          transition: "margin-left 0.3s ease",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />

        <Container fluid className="py-4 px-4 px-md-5 flex-grow-1">
          {renderContent()}
        </Container>

        <Footer />
      </div>
    </div>
  );
};

export default AdminPage;
