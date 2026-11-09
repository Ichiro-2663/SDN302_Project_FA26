import React, { useState } from "react";
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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
        return <TeacherDashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Sidebar */}
      <Sidebar
        role="teacher"
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

export default TeacherPage;
