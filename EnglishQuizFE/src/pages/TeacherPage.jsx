import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import Footer from "../components/common/Footer";

// Teacher components
import TeacherDashboard from "../components/Teacher/TeacherDashboard";
import QuestionBank from "../components/Admin/QuestionBank";
import ExamManagement from "../components/Admin/ExamManagement";
import TopicManagement from "../components/Admin/TopicManagement";

const TeacherPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialTab = () => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[0] === "teacher") {
      return parts[1];
    }
    return localStorage.getItem("teacher_active_tab") || "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[0] === "teacher") {
      setActiveTab(parts[1]);
      localStorage.setItem("teacher_active_tab", parts[1]);
    } else if (parts.length === 1 && parts[0] === "teacher") {
      const saved = localStorage.getItem("teacher_active_tab") || "dashboard";
      setActiveTab(saved);
      if (saved !== "dashboard") {
        navigate(`/teacher/${saved}`, { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  const handleTabSelect = (tabKey) => {
    setActiveTab(tabKey);
    localStorage.setItem("teacher_active_tab", tabKey);
    navigate(`/teacher/${tabKey === "dashboard" ? "" : tabKey}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "questions":
        return <QuestionBank />;
      case "exams":
        return <ExamManagement />;
      case "topics":
        return <TopicManagement />;
      case "dashboard":
      default:
        return <TeacherDashboard setActiveTab={handleTabSelect} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Sidebar */}
      <Sidebar
        role="teacher"
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

export default TeacherPage;
