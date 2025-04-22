import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Home, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import apiFetch from "../../../config/baseAPI"; // Đảm bảo đường dẫn đúng
import "./success.css";

const PaymentSuccess = () => {
  const [theme, setTheme] = useState("light");
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dataOrderId = JSON.parse(localStorage.getItem("orderId"));
  const orderId = dataOrderId.orderId;
  console.log(orderId, "orderId");
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!orderId) {
          throw new Error("Không tìm thấy mã đơn hàng");
        }

        const response = await apiFetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error(`Lỗi khi lấy thông tin đơn hàng: ${response.status}`);
        }

        const data = await response.json();
        console.log("Order details Thanh:", data);
        setOrderDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <div className="loading-spinner">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Đã xảy ra lỗi: {error}</p>
        <Link to="/">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="success-container">
      <motion.div
        className="success-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <motion.div
          className="success-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <CheckCircle size={80} />
        </motion.div>

        <motion.h1
          className="success-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Thanh toán thành công!
        </motion.h1>

        <motion.p
          className="success-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Cảm ơn bạn đã đăng ký gói tại SchoolUI_TV. Thông tin chi tiết đã được
          gửi vào email của bạn.
        </motion.p>

        <motion.div
          className="success-details"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="detail-row">
            <span>Mã đơn hàng</span>
            <span>{orderDetails?.orderCode || "Không xác định"}</span>
          </div>
          <div className="detail-row">
            <span>Gói đăng ký</span>
            <span>
              {orderDetails?.orderDetails?.$values[0]?.package?.name ||
                "Không xác định"}
            </span>
          </div>
          <div className="detail-row">
            <span>Thời gian</span>
            <span>
              {new Date(orderDetails?.createdAt).toLocaleDateString() ||
                "Không xác định"}
            </span>
          </div>
          <div className="detail-row">
            <span>Tổng thanh toán</span>
            <span>{orderDetails?.totalPrice?.toLocaleString()} VNĐ</span>
          </div>
          <div className="detail-row">
            <span>Trạng thái</span>
            <span>{orderDetails?.status || "Không xác định"}</span>
          </div>
        </motion.div>

        <motion.div
          className="success-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link className="action-button secondary" to="/">
            <Home size={20} />
            Trang chủ
          </Link>
          <button className="action-button primary">
            <FileText size={20} />
            Xem thông tin đơn hàng
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
