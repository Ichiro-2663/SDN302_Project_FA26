import React, { useCallback, useContext, useEffect, useState } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import {
  ArrowRight,
  BookOpen,
  Check,
  CircleCheck,
  CircleX,
  ClipboardList,
  Flame,
  GraduationCap,
  Layers3,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Homepage.css";

// Static data lives outside the component to avoid re-creation on each render
const FEATURES_DATA = [
  {
    icon: BookOpen,
    title: "Luyện tập",
    description: "Ôn ngữ pháp và từ vựng qua từng câu hỏi theo chủ đề.",
    tag: "Phổ biến",
    tone: "orange",
    path: "/login",
  },
  {
    icon: ClipboardList,
    title: "Thi thử",
    description: "Làm bài kiểm tra có tính giờ theo định dạng đề thi.",
    tag: "Theo đề",
    tone: "sky",
    path: "/login",
  },
  {
    icon: Layers3,
    title: "Flashcard 3D",
    description: "Lật thẻ ôn từ vựng, lặp lại ngắt quãng với hệ thống 5 hộp.",
    tag: "5 Hộp",
    tone: "violet",
    path: "/login",
  },
  {
    icon: MessageCircle,
    title: "Gia sư AI",
    description: "Hỏi đáp, giải thích đáp án và luyện hội thoại cùng AI.",
    tag: "AI Mới",
    tone: "rose",
    path: "/login",
  },
];

const CERTIFICATIONS = ["CEFR", "TOEIC", "IELTS"];

const SAMPLE_QUIZ = {
  before: "She",
  after: "English every day.",
  options: ["study", "studies", "studying"],
  answer: "studies",
};

const PROGRESS_PERCENT = 85;
const STREAK_DAYS = 5;
const WEEK_LENGTH = 7;
const RING_RADIUS = 26;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const ProgressRing = ({ value }) => (
  <div
    className="hp-ring"
    role="img"
    aria-label={`Hoàn thành ${value}% mục tiêu hôm nay`}
  >
    <svg width="64" height="64" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="hpRingGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <circle className="hp-ring-track" cx="32" cy="32" r={RING_RADIUS} fill="none" strokeWidth="7" />
      <circle
        className="hp-ring-bar"
        cx="32"
        cy="32"
        r={RING_RADIUS}
        fill="none"
        strokeWidth="7"
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={RING_CIRCUMFERENCE * (1 - value / 100)}
      />
    </svg>
    <span className="hp-ring-text" aria-hidden="true">
      {value}%
    </span>
  </div>
);

const MiniQuiz = () => {
  const [selected, setSelected] = useState(null);
  const answered = selected !== null;
  const isCorrect = selected === SAMPLE_QUIZ.answer;

  const handleReset = useCallback(() => setSelected(null), []);

  const getOptionClass = (option) => {
    if (!answered) return "hp-quiz-option";
    if (option === SAMPLE_QUIZ.answer) return "hp-quiz-option is-correct";
    if (option === selected) return "hp-quiz-option is-wrong";
    return "hp-quiz-option";
  };

  let feedbackClass = "is-idle";
  let feedback = "Chọn một đáp án để kiểm tra.";
  if (answered) {
    feedbackClass = isCorrect ? "is-correct" : "is-wrong";
    feedback = isCorrect
      ? "Chính xác. Với “she”, động từ thêm “-es”: studies."
      : `Chưa đúng. Đáp án đúng: ${SAMPLE_QUIZ.answer}.`;
  }

  return (
    <div className="hp-quiz">
      <div className="hp-quiz-head">
        <p className="hp-quiz-label">Câu hỏi mẫu</p>
        {answered && (
          <button type="button" className="hp-quiz-reset" onClick={handleReset}>
            <RotateCcw size={14} aria-hidden="true" />
            Làm lại
          </button>
        )}
      </div>

      <p className="hp-quiz-prompt" id="hp-quiz-prompt">
        {SAMPLE_QUIZ.before}{" "}
        <span className="hp-quiz-blank">{answered ? selected : "___"}</span>{" "}
        {SAMPLE_QUIZ.after}
      </p>

      <div className="hp-quiz-options" role="group" aria-labelledby="hp-quiz-prompt">
        {SAMPLE_QUIZ.options.map((option) => (
          <button
            key={option}
            type="button"
            className={getOptionClass(option)}
            onClick={() => setSelected(option)}
            disabled={answered}
            aria-pressed={selected === option}
          >
            {answered && option === SAMPLE_QUIZ.answer && <Check size={16} aria-hidden="true" />}
            {option}
          </button>
        ))}
      </div>

      <div className={`hp-quiz-feedback ${feedbackClass}`} aria-live="polite">
        {answered &&
          (isCorrect ? (
            <CircleCheck size={18} aria-hidden="true" />
          ) : (
            <CircleX size={18} aria-hidden="true" />
          ))}
        <span>{feedback}</span>
      </div>
    </div>
  );
};

const DashboardPreview = () => (
  <div className="hp-preview-wrap hp-reveal hp-delay-3">
    <div className="hp-preview">
      <div className="hp-preview-head">
        <h2 className="hp-preview-title">Tiến độ học tập</h2>
        <span className="hp-preview-tag">Bản xem thử</span>
      </div>

      <div className="hp-stats">
        <div className="hp-stat">
          <ProgressRing value={PROGRESS_PERCENT} />
          <div>
            <p className="hp-stat-label">Mục tiêu hôm nay</p>
            <p className="hp-stat-value">
              17<span className="hp-stat-unit">/ 20 câu</span>
            </p>
          </div>
        </div>

        <div className="hp-stat">
          <div className="hp-flame">
            <Flame size={26} aria-hidden="true" />
          </div>
          <div>
            <p className="hp-stat-value">
              {STREAK_DAYS}
              <span className="hp-stat-unit">ngày liên tiếp</span>
            </p>
            <div className="hp-streak-days" aria-label={`Chuỗi ${STREAK_DAYS} trên ${WEEK_LENGTH} ngày`}>
              {Array.from({ length: WEEK_LENGTH }, (_, i) => (
                <span key={i} className={`hp-streak-day${i < STREAK_DAYS ? " is-on" : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <MiniQuiz />
    </div>
  </div>
);

const FeatureCard = ({ feature }) => {
  const Icon = feature.icon;
  return (
    <Card as={Link} to={feature.path} className="hp-feature d-flex flex-column">
      <span className={`hp-feature-tag hp-feature-tag--${feature.tone}`}>{feature.tag}</span>
      <div className={`hp-feature-icon hp-feature-icon--${feature.tone}`}>
        <Icon size={26} aria-hidden="true" />
      </div>
      <h3 className="hp-feature-title">{feature.title}</h3>
      <p className="hp-feature-desc">{feature.description}</p>
      <span className="hp-feature-link">
        Bắt đầu
        <ArrowRight size={16} aria-hidden="true" />
      </span>
    </Card>
  );
};

const Homepage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated && user) {
      const role = (user.role || "").toUpperCase();
      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "TEACHER") {
        navigate("/teacher");
      } else {
        navigate("/student");
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="hp">
      <span className="hp-glow hp-glow--orange" aria-hidden="true" />
      <span className="hp-glow hp-glow--amber" aria-hidden="true" />
      <span className="hp-glow hp-glow--soft" aria-hidden="true" />

      <Container className="hp-inner px-4">
        {/* HEADER */}
        <header className="hp-header">
          <Link to="/" className="hp-brand">
            <span className="hp-brand-mark">
              <GraduationCap size={20} aria-hidden="true" />
            </span>
            English Quiz
          </Link>
          <Link to="/login" className="hp-header-link">
            Đăng nhập
          </Link>
        </header>

        {/* HERO */}
        <section className="hp-hero">
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <span className="hp-badge hp-reveal">🔥 Nền Tảng Học Tiếng Anh Thông Minh</span>

              <h1 className="hp-title hp-reveal hp-delay-1">
                Luyện tiếng Anh mỗi ngày, <span className="hp-title-accent">tiến bộ rõ rệt</span>
              </h1>

              <p className="hp-lead hp-reveal hp-delay-2">
                Luyện tập, thi thử, ôn từ vựng bằng flashcard và hỏi gia sư AI trên cùng một nền tảng.
              </p>

              <div className="hp-ctas hp-reveal hp-delay-3">
                <Button className="hp-btn hp-btn--primary" onClick={() => navigate("/login")}>
                  Bắt đầu luyện tập
                  <ArrowRight size={18} aria-hidden="true" />
                </Button>
                <Button className="hp-btn hp-btn--outline" onClick={() => navigate("/register")}>
                  Tạo tài khoản
                </Button>
              </div>

              <ul className="hp-certs hp-reveal hp-delay-4" aria-label="Khung chuẩn hỗ trợ">
                {CERTIFICATIONS.map((cert) => (
                  <li key={cert} className="hp-cert">
                    <span className="hp-cert-check">
                      <Check size={14} strokeWidth={3} aria-hidden="true" />
                    </span>
                    {cert}
                  </li>
                ))}
              </ul>
            </Col>

            <Col lg={6}>
              <DashboardPreview />
            </Col>
          </Row>
        </section>

        {/* FEATURES */}
        <section className="hp-features" aria-labelledby="hp-features-title">
          <h2 className="hp-section-title hp-reveal hp-delay-4" id="hp-features-title">
            Bốn cách học trong một tài khoản
          </h2>
          <p className="hp-section-sub hp-reveal hp-delay-4">
            Chọn hình thức phù hợp với mục tiêu của bạn hôm nay.
          </p>

          <Row className="g-4">
            {FEATURES_DATA.map((feature, index) => (
              <Col key={feature.title} xs={12} sm={6} lg={3} className={`hp-reveal hp-delay-${Math.min(index + 2, 5)}`}>
                <FeatureCard feature={feature} />
              </Col>
            ))}
          </Row>
        </section>
      </Container>
    </div>
  );
};

export default Homepage;
