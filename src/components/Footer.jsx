import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Về Chúng Tôi</h3>
          <p>
            SchoolTV là nền tảng phát sóng trực tuyến hàng đầu dành cho các
            trường học tại Việt Nam.
          </p>
          <div className="social-links">
            <a href="#">
              <i className="fab fa-facebook" />
            </a>
            <a href="#">
              <i className="fab fa-twitter" />
            </a>
            <a href="#">
              <i className="fab fa-linkedin" />
            </a>
            <a href="#">
              <i className="fab fa-youtube" />
            </a>
          </div>
          <p style={{color: "rgb(189 211 225)"}}>Version code: v1.10</p>
        </div>
        <div className="footer-section">
          <h3>Liên Kết</h3>
          <a href="#">Trang Chủ</a>
          <a href="#">Tính Năng</a>
          <a href="/package">Bảng Giá</a>
          <a href="#">Blog</a>
        </div>
        <div className="footer-section">
          <h3>Hỗ Trợ</h3>
          <a href="#">FAQ</a>
          <a href="#">Hướng Dẫn</a>
          <a href="#">Liên Hệ</a>
          <a href="#">Điều Khoản</a>
        </div>
        <div className="footer-section">
          <h3>Liên Hệ</h3>
          <p>
            <i className="fas fa-phone" /> 1900 xxxx
          </p>
          <p>
            <i className="fas fa-envelope" /> support@schooltv.vn
          </p>
          <p>
            <i className="fas fa-map-marker-alt" /> Hà Nội, Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
