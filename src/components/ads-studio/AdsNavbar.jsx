import React, { useState, useEffect } from "react";
import "./AdsNavbar.scss";
import { Flex } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

function AdsNavbar() {
  const buttonLabel = [
    "Đăng Quảng Cáo",
    "Thống kê dữ liệu",
    "Quảng cáo đã đăng",
  ];
  const [activeButton, setActiveButton] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    switch (location.pathname) {
      case "/ads-management/post":
        setActiveButton(0);
        break;
      case "/ads-management/statistics":
        setActiveButton(1);
        break;
      case "/ads-management/ads":
        setActiveButton(2);
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
        navigate("/ads-management/post");
        break;
      case 1:
        navigate("/ads-management/statistics");
        break;
      case 2:
        navigate("/ads-management/ads");
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

export default AdsNavbar;
