import React, { useState } from "react";
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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
        return <AdminDashboard onSelect={setActiveTab} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Sidebar */}
      <Sidebar
        role="admin"
        activeTab={activeTab}
        onSelect={setActiveTab}
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
