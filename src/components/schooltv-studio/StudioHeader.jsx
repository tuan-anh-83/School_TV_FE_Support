import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import "./StudioHeader.scss";
import darkLogo from "../../assets/dark-tv-logo.png";
import lightLogo from "../../assets/light-tv-logo.png";

const StudioHeader = ({ channel }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const notifications = [
    { id: 1, text: "New subscriber to your channel", time: "1 giờ trước" },
    { id: 2, text: "Stream quality alert", time: "2 giờ trước" },
    { id: 3, text: "Upcoming schedule reminder", time: "3 giờ trước" },
  ];

  const avatarSrc = channel?.$values?.[0]?.logoUrl
    ? channel?.$values?.[0]?.logoUrl
    : `https://ui-avatars.com/api/?name=SchoolTV&background=random`;

  const handleOutsideClick = (e, dropdownSetter) => {
    if (
      !e.target.closest(".notification-wrapper") &&
      !e.target.closest(".studio-user-profile")
    ) {
      dropdownSetter(false);
    }
  };

  React.useEffect(() => {
    if (showProfileDropdown || showNotiDropdown) {
      document.addEventListener("click", (e) => {
        handleOutsideClick(
          e,
          showProfileDropdown ? setShowProfileDropdown : setShowNotiDropdown
        );
      });
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [showProfileDropdown, showNotiDropdown]);

  return (
    <header className="studio-header">
      <a href="/school-studio/statistics" className="studio-logo">
        <img
          src={theme === "dark" ? darkLogo : lightLogo}
          alt="SchoolTV Studio Logo"
          className="studio-logo-img"
        />
        SchoolTV Studio
      </a>

      <button
        className="studio-mobile-menu-btn"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i>
      </button>

      <nav className={`studio-nav-links ${isMenuOpen ? "active" : ""}`}>
        <button className="studio-switch-button" onClick={() => navigate("/")}>
          <i className="fas fa-external-link-alt"></i>
          Trở về SchoolTV
        </button>

        <div className="notification-wrapper">
          <button
            className="notification-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setShowNotiDropdown(!showNotiDropdown);
              setShowProfileDropdown(false);
            }}
          >
            <i className="fas fa-bell"></i>
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>

          {showNotiDropdown && (
            <div className="notification-dropdown">
              <div className="dropdown-header">
                <h3 className="user-name">Thông báo</h3>
                <button
                  className="mobile-dropdown-close"
                  onClick={() => setShowNotiDropdown(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="dropdown-divider"></div>
              {notifications.map((notification) => (
                <div key={notification.id} className="notification-item">
                  <div className="notification-icon">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div className="notification-content">
                    <p className="notification-text">{notification.text}</p>
                    <p className="notification-time">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className="studio-theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          <i className={`fas ${theme === "light" ? "fa-moon" : "fa-sun"}`}></i>
        </button>

        <div
          className="studio-user-profile"
          onClick={(e) => {
            e.stopPropagation();
            setShowProfileDropdown(!showProfileDropdown);
            setShowNotiDropdown(false);
          }}
        >
          <img src={avatarSrc} alt="Profile" className="studio-profile-pic" />
          {showProfileDropdown && (
            <div className="studio-profile-dropdown">
              <div className="dropdown-header">
                <p className="user-name">
                  {channel?.$values?.[0]?.name || "Quản trị viên"}
                </p>
                <button
                  className="mobile-dropdown-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileDropdown(false);
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="dropdown-divider"></div>
              <a href="/school-studio/your-channel" className="dropdown-item">
                <i className="fas fa-user-cog"></i> Kênh của bạn
              </a>
              <div className="dropdown-divider"></div>
              <a href="/school-studio/program-manage" className="dropdown-item">
                <i className="fas fa-tv"></i> Chương trình
              </a>
              <a href="/studio/schedule" className="dropdown-item">
                <i className="fas fa-calendar-alt"></i> Lịch phát
              </a>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item"
                onClick={() => {
                  localStorage.removeItem("studioToken");
                  navigate("/login");
                }}
              >
                <i className="fas fa-sign-out-alt"></i> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default StudioHeader;
