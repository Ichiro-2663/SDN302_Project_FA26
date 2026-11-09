import React from "react";
import { Container } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="bg-white border-top py-3 text-center text-muted small mt-auto">
      <Container>
        <p className="mb-0">
          &copy; {new Date().getFullYear()} <strong>EnglishQuiz Platform</strong> &bull; Hệ thống luyện thi & học từ vựng trực tuyến (SDN302 FA26)
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
