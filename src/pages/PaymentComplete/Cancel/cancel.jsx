import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { XCircle, Home, ArrowLeft, RefreshCcw } from "lucide-react";
import "./cancel.css";
import { Link } from "react-router-dom";
const PaymentCancel = () => {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return (
    <div className="cancel-container">
      <motion.div
        className="cancel-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        <motion.div
          className="cancel-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <XCircle size={80} />
        </motion.div>

        <motion.h1
          className="cancel-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Thanh toán đã bị hủy
        </motion.h1>

        <motion.p
          className="cancel-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Giao dịch của bạn đã bị hủy. Nếu bạn gặp bất kỳ vấn đề nào trong quá
          trình thanh toán, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.
        </motion.p>

        <motion.div
          className="cancel-details"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="detail-row">
            <span>Mã đơn hàng</span>
            <span>#SCH123456</span>
          </div>
          <div className="detail-row">
            <span>Trạng thái</span>
            <span className="status-cancelled">Đã hủy</span>
          </div>
          <div className="detail-row">
            <span>Thời gian</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </motion.div>

        <motion.div
          className="cancel-reason"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3>Có thể do một trong các nguyên nhân sau:</h3>
          <ul>
            <li>Bạn đã chủ động hủy giao dịch</li>
            <li>Phiên thanh toán đã hết hạn</li>
            <li>Có lỗi trong quá trình xử lý thanh toán</li>
          </ul>
        </motion.div>

        <motion.div
          className="cancel-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link className="action-button secondary" to={"/"}>
            <Home size={20} />
            Trang chủ
          </Link>
          <button className="action-button primary">
            <RefreshCcw size={20} />
            Thử lại
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
