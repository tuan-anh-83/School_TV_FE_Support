import React, { useState, useEffect } from "react";
import "./StudioNavbar.scss";
import { Flex } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

function StudioNavbar() {
  const buttonLabel = ["Đăng Bài Viết", "Đăng Video", "Live Stream", "Thống kê dữ liệu"];
  const [activeButton, setActiveButton] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    switch (location.pathname) {
      case "/school-studio/post":
        setActiveButton(0);
        break;
      case "/school-studio/video":
        setActiveButton(1);
        break;
      case "/school-studio/live-stream":
        setActiveButton(2);
        break;
      case "/school-studio/statistics":
        setActiveButton(3);
        break;
      default:
        setActiveButton(null);
        break;
    }
  }, [location.pathname]);

  const buttonPicked = (index) => {
    setActiveButton(index);
    switch (index) {
      case 0:
        navigate("/school-studio/post");
        break;
      case 1:
        navigate("/school-studio/video");
        break;
      case 2:
        navigate("/school-studio/live-stream");
        break;
      case 3:
        navigate("/school-studio/statistics");
        break;
      default:
        break;
    }
  };

  return (
    <Flex className="studio-navbar-container" justify="flex-start">
      {buttonLabel.map((label, index) => (
        <div
          key={index}
          onClick={() => buttonPicked(index)}
          className={`studio-navbar-button ${
            activeButton === index ? "studio-navbar-button__active" : ""
          }`}
        >
          <p>{label}</p>
        </div>
      ))}
    </Flex>
  );
}

export default StudioNavbar;
