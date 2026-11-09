import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import Footer from "../components/common/Footer";

// Student components
import UserDashboard from "../components/User/UserDashboard";
import Practice from "../components/User/Practice";
import Quiz from "../components/User/Quiz";
import Flashcards from "../components/User/Flashcards";
import Bookmarks from "../components/User/Bookmarks";
import History from "../components/User/History";
import Profile from "../components/User/Profile";
import UserFeedback from "../components/User/UserFeedback";

const StudentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Resolve initial tab from URL or localStorage
  const getInitialTab = () => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[0] === "student") {
      return parts[1];
    }
    return localStorage.getItem("student_active_tab") || "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isExamLocked, setIsExamLocked] = useState(false);

  // Sync tab state when URL changes (supports browser reload & back/forward)
  useEffect(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[0] === "student") {
      setActiveTab(parts[1]);
      localStorage.setItem("student_active_tab", parts[1]);
    } else if (parts.length === 1 && parts[0] === "student") {
      const saved = localStorage.getItem("student_active_tab") || "dashboard";
      setActiveTab(saved);
      if (saved !== "dashboard") {
        navigate(`/student/${saved}`, { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  const handleTabSelect = (tabKey) => {
    setActiveTab(tabKey);
    localStorage.setItem("student_active_tab", tabKey);
    navigate(`/student/${tabKey === "dashboard" ? "" : tabKey}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "practice":
        return <Practice key="practice" />;
      case "quiz":
        return <Quiz key="quiz" type="quiz" onExamLockChange={setIsExamLocked} />;
      case "minitest":
        return <Quiz key="minitest" type="minitest" onExamLockChange={setIsExamLocked} />;
      case "flashcards":
        return <Flashcards key="flashcards" />;
      case "bookmarks":
        return <Bookmarks key="bookmarks" />;
      case "history":
        return <History key="history" />;
      case "feedback":
        return <UserFeedback key="feedback" />;
      case "profile":
        return <Profile key="profile" />;
      case "dashboard":
      default:
        return <UserDashboard setActiveTab={handleTabSelect} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Sidebar: Completely hidden during Exam Room Lockdown to prevent leaving */}
      {!isExamLocked && (
        <Sidebar
          role="student"
          activeTab={activeTab}
          onSelect={handleTabSelect}
          onToggle={setIsSidebarOpen}
        />
      )}

      {/* Main Content Area */}
      <div
        style={{
          marginLeft: isExamLocked ? "0px" : isSidebarOpen ? "240px" : "70px",
          transition: "margin-left 0.3s ease",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header isExamLocked={isExamLocked} />

        <Container fluid className="py-4 px-4 px-md-5 flex-grow-1">
          {renderContent()}
        </Container>

        {!isExamLocked && <Footer />}
      </div>
    </div>
  );
};

export default StudentPage;
