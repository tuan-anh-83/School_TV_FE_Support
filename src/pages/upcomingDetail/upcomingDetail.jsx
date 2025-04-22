import React, { useState, useEffect } from "react";
import { Menu, Bell, Calendar, MapPin, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import "./upcomingDetail.scss";

const UpComingDetail = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.body.classList.add("upcoming-detail-dark-mode");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    document.body.classList.toggle("upcoming-detail-dark-mode");
  };

  return (
    <div className={`upcoming-detail-app ${darkMode ? "upcoming-detail-dark-mode" : ""}`}>
      <main className="upcoming-detail-main-content">
        <div className="upcoming-detail-event-header">
          <h1 className="upcoming-detail-event-title upcoming-detail-event-big-title">
            Lễ Tốt Nghiệp 2023 - ĐH Bách Khoa Hà Nội
          </h1>
          <div className="upcoming-detail-event-meta">
            <span className="upcoming-detail-meta-item">
              <Calendar className="upcoming-detail-meta-icon" />
              25/12/2023 - 14:00
            </span>
            <span className="upcoming-detail-meta-item">
              <MapPin className="upcoming-detail-meta-icon" />
              Nhà hát lớn Hà Nội
            </span>
          </div>
        </div>

        <div className="upcoming-detail-content-wrapper">
          <div className="upcoming-detail-main-section">
            <div className="upcoming-detail-info-card">
              <h2 className="upcoming-detail-section-title">Về sự kiện</h2>
              <p className="upcoming-detail-description">
                Chúng tôi tại Career Bliss Academy hân hạnh được mời bạn tham dự
                Lễ Trao Bằng Tốt Nghiệp, nơi chúng ta cùng nhau tôn vinh những
                nỗ lực và thành tựu của các học viên xuất sắc.
              </p>
              <blockquote className="upcoming-detail-event-quote">
                "Khi mọi người thực sự khai phá tiềm năng của bản thân và áp
                dụng những kỹ năng đã học vào cuộc sống, họ không chỉ thay đổi
                bản thân mà còn tạo ra sự khác biệt trong cộng đồng."
              </blockquote>
            </div>

            <div className="upcoming-detail-video-section">
              <h2 className="upcoming-detail-section-title">Video liên quan</h2>
              <div className="upcoming-detail-video-grid">
                <motion.div className="upcoming-detail-video-card" whileHover={{ scale: 1.02 }}>
                  <div className="upcoming-detail-video-thumbnail">
                    <img
                      src="https://picsum.photos/800/450?random=1"
                      alt="Video thumbnail"
                    />
                    <div className="upcoming-detail-video-duration">10:25</div>
                  </div>
                  <div className="upcoming-detail-video-info">
                    <h3>Highlights Lễ Tốt Nghiệp 2022</h3>
                    <p>10,234 lượt xem</p>
                  </div>
                </motion.div>

                <motion.div className="upcoming-detail-video-card" whileHover={{ scale: 1.02 }}>
                  <div className="upcoming-detail-video-thumbnail">
                    <img
                      src="https://picsum.photos/800/450?random=2"
                      alt="Video thumbnail"
                    />
                    <div className="upcoming-detail-video-duration">15:30</div>
                  </div>
                  <div className="upcoming-detail-video-info">
                    <h3>Phỏng vấn Tân Cử Nhân</h3>
                    <p>8,567 lượt xem</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          <aside className="upcoming-detail-sidebar">
            <div className="upcoming-detail-notification-card">
              <h3>Nhận thông báo cho sự kiện này</h3>
              <motion.button
                className="upcoming-detail-notify-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Bell className="upcoming-detail-icon" />
                Đặt lịch nhắc
              </motion.button>
            </div>

            <div className="upcoming-detail-related-events">
              <h3>Sự kiện liên quan</h3>
              <div className="upcoming-detail-events-list">
                <motion.div className="upcoming-detail-event-item" whileHover={{ scale: 1.02 }}>
                  <img
                    src="https://picsum.photos/200/200?random=3"
                    alt="Event"
                  />
                  <div>
                    <h4>Hội thảo Khoa học 2023</h4>
                    <time>30/12/2023</time>
                  </div>
                </motion.div>

                <motion.div className="upcoming-detail-event-item" whileHover={{ scale: 1.02 }}>
                  <img
                    src="https://picsum.photos/200/200?random=4"
                    alt="Event"
                  />
                  <div>
                    <h4>Triển lãm Công nghệ</h4>
                    <time>05/01/2024</time>
                  </div>
                </motion.div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default UpComingDetail;