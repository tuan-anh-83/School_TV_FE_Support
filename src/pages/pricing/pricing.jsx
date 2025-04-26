import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiFetch from "../../config/baseAPI";
import "./pricing.css";
import { convertDurationToText } from "../../utils/time";

const PricingPage = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const featureMapping = {
    1: (duration, timeDuration) => [
      "Tối đa 500 videos",
      `${timeDuration} giờ stream liên tục`,
      `Lưu trữ ${convertDurationToText(duration)}`,
      "Hỗ trợ cơ bản",
    ],
    2: (duration, timeDuration) => [
      "Không giới hạn videos",
      `${timeDuration} giờ stream liên tục`,
      `Lưu trữ ${convertDurationToText(duration)}`,
      "Hỗ trợ 24/7",
    ],
    3: (time) => [
      "Giải pháp tùy chỉnh",
      "API tích hợp",
      "SLA cam kết",
      "Bảo mật nâng cao",
    ],
    4: (duration, timeDuration) => [
      "Tất cả tính năng của các gói trước",
      "Dung lượng & băng thông không giới hạn",
      "Hỗ trợ chuyên viên 1:1",
      "Truy cập trước các tính năng beta",
    ],
    5: (duration, timeDuration) => [
      "Bao gồm Elite Membership trong 12 tháng",
      "Ưu tiên trải nghiệm tính năng mới sớm",
      "Hỗ trợ kỹ thuật ưu tiên",
    ],
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await apiFetch("/api/Package/active");

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        console.log("Data fetched:", data);

        if (!data?.$values) {
          throw new Error("Invalid package data structure");
        }

        setPackages(
          data.$values.map((pkg) => ({
            ...pkg,
            features:
              typeof featureMapping[pkg.packageID] === "function"
                ? featureMapping[pkg.packageID](pkg.duration, pkg.timeDuration)
                : featureMapping[pkg.packageID] || [
                    "Tính năng đang cập nhật...",
                  ],
          }))
        );
      } catch (err) {
        setError(err.message);
        console.error("Package fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handlePayment = (selectedPackage) => {
    localStorage.setItem("selectedPackage", JSON.stringify(selectedPackage));
    navigate("/checkout");
  };

  const handleLearnMore = (packageId) => {
    navigate(`/packages/${packageId}`);
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="prc-container">
      <div className="prc-hero">
        <h1 className="prc-title">Lựa Chọn Gói Dịch Vụ Phù Hợp</h1>
        <p className="prc-subtitle">
          Giải pháp streaming và học trực tuyến toàn diện cho mọi quy mô trường
          học
        </p>
      </div>

      <div className="prc-grid">
        {error ? (
          <div className="prc-error">
            <div className="prc-error-icon">⚠️</div>
            <div>
              <h3>Có lỗi xảy ra!</h3>
              <p>
                {error}. Vui lòng thử lại sau hoặc{" "}
                <a href="/contact">liên hệ hỗ trợ</a>
              </p>
            </div>
          </div>
        ) : packages.length === 0 ? (
          <div className="prc-empty">
            <div className="prc-empty-illustration">🎯</div>
            <p className="prc-empty-text">
              Hiện không có gói dịch vụ nào khả dụng
            </p>
          </div>
        ) : (
          packages.map((pkg) => (
            <div key={pkg.packageID} className="prc-card">
              {pkg.packageID === 2 && <div className="prc-badge">Phổ biến</div>}
              <div className="prc-card-header">
                <h3 className="prc-plan">{pkg.name}</h3>
                <div className="prc-price">
                  <span className="prc-amount">
                    {pkg.price.toLocaleString()}
                  </span>
                  <span className="prc-currency">
                    VND/{convertDurationToText(pkg.duration)}
                    {pkg.timeDuration > 0 && ` + ${pkg.timeDuration} phút`}
                  </span>
                </div>
              </div>

              <ul className="prc-features">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="prc-feature">
                    <svg className="prc-feature-icon" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="prc-actions">
                <button
                  onClick={() => handlePayment(pkg)}
                  className="prc-primary-btn"
                >
                  Mua ngay
                  <svg className="prc-btn-icon" viewBox="0 0 24 24">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleLearnMore(pkg.packageID)}
                  className="prc-secondary-btn"
                >
                  Khám phá tính năng
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PricingPage;
