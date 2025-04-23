import React from "react";
import { useNavigate } from "react-router";
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>School TV Show | Nền Tảng Phát Sóng Trực Tuyến Cho Trường Học</title>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        rel="stylesheet"
      />
      <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" />

      <section className="hero">
        <div className="hero-content" data-aos="fade-right">
          <h1>Nền Tảng TV Show Trực Tuyến Cho Trường Học</h1>
          <p>
            Kết nối và chia sẻ những khoảnh khắc đáng nhớ của trường học thông qua
            nền tảng phát sóng trực tuyến chuyên nghiệp.
          </p>
          <div className="cta-buttons">
            <button onClick={() => navigate("watchHome")} className="cta-button primary-button">Dùng Thử Miễn Phí</button>
            <button onClick={() => navigate("watchHome")} className="cta-button secondary-button">Tìm Hiểu Thêm</button>
          </div>
        </div>
        <div className="hero-image" data-aos="fade-left">
          <div className="floating-card card-1">
            <h3>Đang Phát Sóng</h3>
            <p>Lễ Khai Giảng 2023 - ĐH Bách Khoa</p>
            <p>
              <i className="fas fa-users" /> 1.2k người xem
            </p>
          </div>
          <div className="floating-card card-2">
            <h3>Sắp Diễn Ra</h3>
            <p>Hội Thảo Hướng Nghiệp - ĐH Kinh Tế</p>
            <p>
              <i className="far fa-clock" /> 2 giờ nữa
            </p>
          </div>
        </div>
      </section>
      <section className="features">
        <div className="section-title" data-aos="fade-up">
          <h2>Tính Năng Nổi Bật</h2>
          <p>Khám phá những tính năng độc đáo của nền tảng</p>
        </div>
        <div className="features-grid">
          <div className="feature-card" data-aos="fade-up" data-aos-delay={100}>
            <i className="fas fa-broadcast-tower feature-icon" />
            <h3>Phát Sóng Trực Tiếp</h3>
            <p>
              Dễ dàng thiết lập và phát sóng các sự kiện trực tiếp với chất lượng
              cao
            </p>
          </div>
          <div className="feature-card" data-aos="fade-up" data-aos-delay={200}>
            <i className="fas fa-chart-line feature-icon" />
            <h3>Thống Kê Chi Tiết</h3>
            <p>Theo dõi số liệu người xem và tương tác trong thời gian thực</p>
          </div>
          <div className="feature-card" data-aos="fade-up" data-aos-delay={300}>
            <i className="fas fa-clock feature-icon" />
            <h3>Lịch Phát Sóng</h3>
            <p>Quản lý và lên lịch phát sóng các chương trình một cách linh hoạt</p>
          </div>
        </div>
      </section>
      <section className="statistics">
        <div className="stats-grid">
          <div className="stat-card" data-aos="fade-up">
            <div className="stat-number">100+</div>
            <div className="stat-label">Trường Đại Học</div>
          </div>
          <div className="stat-card" data-aos="fade-up" data-aos-delay={100}>
            <div className="stat-number">50K+</div>
            <div className="stat-label">Sinh Viên</div>
          </div>
          <div className="stat-card" data-aos="fade-up" data-aos-delay={200}>
            <div className="stat-number">1000+</div>
            <div className="stat-label">Chương Trình</div>
          </div>
          <div className="stat-card" data-aos="fade-up" data-aos-delay={300}>
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
        </div>
      </section>
    </>
  );
}