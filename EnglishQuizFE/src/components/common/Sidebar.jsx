import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaBookOpen,
  FaFileAlt,
  FaClock,
  FaLayerGroup,
  FaBookmark,
  FaHistory,
  FaUser,
  FaCommentDots,
  FaQuestionCircle,
  FaFolder,
  FaUsers,
  FaChartBar,
  FaBullhorn,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const Sidebar = ({ role = "student", activeTab, onSelect, onToggle }) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    if (onToggle) onToggle(!nextState); // true = open, false = collapsed
  };

  const getMenuItems = () => {
    switch (role) {
      case "teacher":
        return [
          { id: "dashboard", label: "Tổng Quan", icon: <FaTachometerAlt /> },
          { id: "questions", label: "Ngân Hàng Câu Hỏi", icon: <FaQuestionCircle /> },
          { id: "exams", label: "Quản Lý Đề Thi", icon: <FaFileAlt /> },
          { id: "topics", label: "Quản Lý Chủ Đề", icon: <FaFolder /> },
        ];
      case "admin":
        return [
          { id: "dashboard", label: "Tổng Quan", icon: <FaTachometerAlt /> },
          { id: "users", label: "Quản Lý Người Dùng", icon: <FaUsers /> },
          { id: "reports", label: "Báo Cáo & Thống Kê", icon: <FaChartBar /> },
          { id: "system", label: "Thông Báo Hệ Thống", icon: <FaBullhorn /> },
          { id: "feedbacks", label: "Góp Ý Học Viên", icon: <FaCommentDots /> },
        ];
      case "student":
      default:
        return [
          { id: "dashboard", label: "Bảng Điều Khiển", icon: <FaTachometerAlt /> },
          { id: "practice", label: "Luyện Tập Tự Do", icon: <FaBookOpen /> },
          { id: "quiz", label: "Thi Thử Bấm Giờ", icon: <FaFileAlt /> },
          { id: "minitest", label: "Mini Test Nhanh", icon: <FaClock /> },
          { id: "flashcards", label: "Flashcards Leitner", icon: <FaLayerGroup /> },
          { id: "bookmarks", label: "Sổ Tay Đánh Dấu", icon: <FaBookmark /> },
          { id: "history", label: "Lịch Sử Làm Bài", icon: <FaHistory /> },
          { id: "feedback", label: "Góp Ý Hệ Thống", icon: <FaCommentDots /> },
          { id: "profile", label: "Hồ Sơ Cá Nhân", icon: <FaUser /> },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: collapsed ? "70px" : "240px",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        transition: "width 0.3s ease",
        zIndex: 1020,
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 10px rgba(0,0,0,0.03)",
      }}
    >
      {/* Sidebar Header / Brand */}
      <div
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: "0 16px",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        {!collapsed && (
          <span
            style={{
              fontWeight: "700",
              fontSize: "16px",
              background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {role === "admin" ? "Admin Portal" : role === "teacher" ? "Teacher Studio" : "Student Space"}
          </span>
        )}

        <button
          onClick={handleToggle}
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748b",
          }}
          title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
        >
          {collapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
        </button>
      </div>

      {/* Menu items */}
      <div
        style={{
          flex: 1,
          padding: "16px 8px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "10px 14px",
                width: "100%",
                borderRadius: "10px",
                border: "none",
                background: isActive ? "linear-gradient(135deg, #ffedd5 0%, #fef3c7 100%)" : "transparent",
                color: isActive ? "#ea580c" : "#475569",
                fontWeight: isActive ? "600" : "500",
                fontSize: "14px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
              title={collapsed ? item.label : undefined}
            >
              <span
                style={{
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isActive ? "#ea580c" : "#64748b",
                }}
              >
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Footer Info in Sidebar */}
      {!collapsed && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #f1f5f9",
            fontSize: "12px",
            color: "#94a3b8",
            textAlign: "center",
          }}
        >
          EnglishQuiz v2.0 &bull; SDN302
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
