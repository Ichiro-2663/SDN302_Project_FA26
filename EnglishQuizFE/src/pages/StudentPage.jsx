import React, { useState } from "react";
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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case "practice":
        return <Practice />;
      case "quiz":
        return <Quiz type="quiz" />;
      case "minitest":
        return <Quiz type="minitest" />;
      case "flashcards":
        return <Flashcards />;
      case "bookmarks":
        return <Bookmarks />;
      case "history":
        return <History />;
      case "feedback":
        return <UserFeedback />;
      case "profile":
        return <Profile />;
      case "dashboard":
      default:
        return <UserDashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Sidebar */}
      <Sidebar
        role="student"
        activeTab={activeTab}
        onSelect={setActiveTab}
        onToggle={setIsSidebarOpen}
      />

      {/* Main Content Area */}
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

export default StudentPage;
