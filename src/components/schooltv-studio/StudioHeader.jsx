import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import "./StudioHeader.scss";
import darkLogo from "../../assets/dark-tv-logo.png";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../../utils/useNotificationAPI";
import lightLogo from "../../assets/light-tv-logo.png";
import { Badge, Dropdown, Space } from "antd";
import { BellOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import NotificationItem from "../notification-item/NotificationItem";

const StudioHeader = ({ channel }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [totalNotifications, setTotalNotifications] = useState([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [pageNoti, setPageNoti] = useState(1);
  const [pageSizeNoti, setPageSizeNoti] = useState(3);

  const fetchNotifications = async () => {
    try {
      const notification = await getMyNotifications(pageNoti, pageSizeNoti);
      const values = notification?.$values ?? [];

      const sorted = values.sort((a, b) => {
        const dateA = dayjs(a.createdAt).tz("Asia/Ho_Chi_Minh");
        const dateB = dayjs(b.createdAt).tz("Asia/Ho_Chi_Minh");
        return dateA - dateB;
      });

      if (pageNoti === 1) {
        setTotalNotifications(sorted);
      } else {
        setTotalNotifications((prev) => [...prev, ...sorted]);
      }
    } catch (error) {
      console.error("Lỗi khi fetch thông báo:", error);
      setTotalNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [pageNoti]);

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

  useEffect(() => {
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

  const notificationItems = {
    items: [
      {
        label: (
          <div className="user-notification-header">
            <h3>Thông báo</h3>
          </div>
        ),
        key: "header",
      },
      {
        type: "divider",
      },
      ...(totalNotifications?.length === 0
        ? [
            {
              label: (
                <div className="user-notification-empty">
                  Không có thông báo mới
                </div>
              ),
              key: "empty",
            },
          ]
        : totalNotifications
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((item, index) => ({
              label: (
                <NotificationItem
                  key={item.notificationID || index}
                  title={item.title}
                  message={item.message}
                  createdAt={item.createdAt}
                  isRead={item.isRead}
                  onClick={async (e) => {
                    e.stopPropagation();
                    const response = await markNotificationAsRead(
                      item.notificationID
                    );
                  }}
                />
              ),
              key: item.id || index,
            }))),

      {
        key: "footer",
        label: (
          <div
            style={{
              textAlign: "center",
              marginTop: 8,
              paddingBottom: 8, // tránh bị cắt mất
              minHeight: 32, // đảm bảo có đủ không gian
            }}
          >
            {totalNotifications.length >= pageSizeNoti && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setPageNoti(pageNoti + 1);
                }}
                style={{
                  color: "#1890ff",
                  cursor: "pointer",
                  fontWeight: 500,
                  marginRight: 12,
                }}
              >
                Hiển thị thêm
              </span>
            )}
            {pageNoti > 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setTotalNotifications([]);
                  setPageNoti(1);
                }}
                style={{
                  color: "#1890ff",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Ẩn bớt
              </span>
            )}
          </div>
        ),
      },
    ],
  };

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
          <Dropdown
            menu={notificationItems}
            trigger={["click"]}
            open={open}
            onOpenChange={setOpen}
            placement="bottomRight"
            overlayClassName="user-notification-dropdown"
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space className="user-notification-trigger">
                {hasNewNotification ? (
                  <Badge
                    dot
                    className="blinking-dot-badge"
                    onClick={() => setHasNewNotification(false)}
                  >
                    <BellOutlined className="user-notification-icon" />
                  </Badge>
                ) : (
                  <BellOutlined className="user-notification-icon" />
                )}
              </Space>
            </a>
          </Dropdown>
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
