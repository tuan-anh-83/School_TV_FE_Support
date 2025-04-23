import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { notification } from "antd";
import { ThemeContext } from "../../context/ThemeContext";
import apiFetch from "../../config/baseAPI";
import "./register.scss";

function Register() {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullname: "",
    phoneNumber: "",
    address: "",
  });

  // OTP states
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpValues, setOTPValues] = useState(["", "", "", "", "", ""]);
  const [otpEmail, setOtpEmail] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // State for composition tracking
  const [isComposing, setIsComposing] = useState(false);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = "Vui lòng nhập tên đăng nhập";
    } else if (formData.username.length < 3 || formData.username.length > 50) {
      newErrors.username = "Tên đăng nhập phải từ 3 đến 50 ký tự";
    } else if (/\s/.test(formData.username)) {
      newErrors.username = "Tên đăng nhập không được chứa khoảng trắng";
    }
    // if (!formData.username) {
    //   newErrors.username = "Vui lòng nhập tên đăng nhập";
    // }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (
      !/[A-Z]/.test(formData.password) ||
      !/[a-z]/.test(formData.password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
    ) {
      newErrors.password =
        "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 ký tự đặc biệt";
    }

    // if (!formData.password) {
    //   newErrors.password = "Vui lòng nhập mật khẩu";
    // } else if (formData.password.length < 8) {
    //   newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    // }

    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    // Full name
    if (!formData.fullname) {
      newErrors.fullname = "Vui lòng nhập họ và tên";
    }

    // Phone number
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    }

    // Address
    if (!formData.address) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }

    return newErrors;
  };

  // Highlight fields with errors
  const highlightErrorFields = (errorFields) => {
    Object.keys(errorFields).forEach((fieldName) => {
      const input = document.querySelector(`[name="${fieldName}"]`);
      if (input) {
        input.classList.add("auth-register-input-error");
        setTimeout(() => {
          input.classList.remove("auth-register-input-error");
        }, 3000);
      }
    });
  };

  // Handle OTP input change
  const handleOTPChange = (index, value) => {
    const numericValue = value.replace(/[^0-9]/g, "");

    if (numericValue.length <= 1) {
      const newOTPValues = [...otpValues];
      newOTPValues[index] = numericValue;
      setOTPValues(newOTPValues);

      // Auto-focus next input if value is entered
      if (numericValue && index < 5) {
        const nextInput = document.querySelector(
          `input[name=otp-${index + 1}]`
        );
        if (nextInput) nextInput.focus();
      }

      // Auto-submit if all digits are filled
      if (index === 5 && numericValue) {
        const otpCode = newOTPValues.join("");
        if (otpCode.length === 6) {
          handleVerifyOTP();
        }
      }
    }
  };

  // Handle OTP paste
  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    const numericData = pastedData.replace(/[^0-9]/g, "");
    if (numericData.length === 6) {
      const newOTPValues = numericData.split("");
      setOTPValues(newOTPValues);
    }
  };

  const handleOTPKeyDown = (e, index) => {
    // Handle backspace for chain deletion
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOTPValues = [...otpValues];

      if (newOTPValues[index] === "") {
        // If current field is empty, move to previous field and clear it
        if (index > 0) {
          newOTPValues[index - 1] = "";
          setOTPValues(newOTPValues);
          const prevInput = document.querySelector(
            `input[name=otp-${index - 1}]`
          );
          if (prevInput) prevInput.focus();
        }
      } else {
        // Clear current field
        newOTPValues[index] = "";
        setOTPValues(newOTPValues);
      }
    }

    // Handle enter key for submission
    if (e.key === "Enter") {
      const otpCode = otpValues.join("");
      if (otpCode.length === 6) {
        handleVerifyOTP();
      }
    }
  };

  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    const otpCode = otpValues.join("");
    if (otpCode.length !== 6) {
      notification.error({
        message: "Mã OTP không hợp lệ",
        description: "Vui lòng nhập đầy đủ mã OTP 6 số",
        placement: "topRight",
      });
      return;
    }

    try {
      const req = await apiFetch("accounts/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: otpEmail,
          otpCode: otpCode,
        }),
      });

      if (req.ok) {
        notification.success({
          message: "Xác thực thành công!",
          description: "Tài khoản của bạn đã được kích hoạt.",
          placement: "topRight",
        });
        navigate("/login");
      } else {
        throw new Error("Xác thực thất bại");
      }
    } catch (error) {
      notification.error({
        message: "Xác thực thất bại",
        description: "Mã OTP không chính xác hoặc đã hết hạn",
        placement: "topRight",
      });
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    try {
      const req = await apiFetch("accounts/otp/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });

      if (req.ok) {
        const data = await req.json();
        notification.success({
          message: "Gửi lại mã OTP thành công",
          description: data.message,
          placement: "topRight",
        });
        startResendTimer();
      } else {
        throw new Error("Gửi lại OTP thất bại");
      }
    } catch (error) {
      notification.error({
        message: "Gửi lại mã OTP thất bại",
        description: error.message || "Đã có lỗi xảy ra",
        placement: "topRight",
      });
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      // Show notification with all errors
      notification.error({
        message: "Lỗi đăng ký",
        description: (
          <div>
            {Object.values(newErrors).map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        ),
        placement: "topRight",
        duration: 5,
      });

      // Highlight fields with errors
      highlightErrorFields(newErrors);
      return;
    }

    if (!agreeTerms) {
      notification.error({
        message: "Chưa đồng ý điều khoản",
        description:
          "Bạn cần đồng ý với điều khoản trước khi đăng ký tài khoản.",
        placement: "topRight",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch("accounts/otp/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        notification.success({
          message: "Đăng ký thành công!",
          description:
            "Vui lòng kiểm tra email của bạn (bao gồm thư mục spam) để lấy mã OTP xác thực tài khoản.",
          placement: "topRight",
          duration: 0,
        });
        setOtpEmail(formData.email);
        setShowOTPVerification(true);
        startResendTimer();
      } else {
        // Handle 409 and other errors
        if (response.status === 409) {
          throw new Error("Tên đăng nhập hoặc Email đã được đăng ký.");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "Có lỗi xảy ra");
        }
      }
    } catch (error) {
      notification.error({
        message: "Đăng ký thất bại!",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại sau.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  // Render OTP verification UI
  if (showOTPVerification) {
    return (
      <div className="auth-register-container" data-theme={theme}>
        <div className="auth-register-card auth-otp-card">
          <h1>Xác thực tài khoản</h1>
          <p>
            Chúng tôi đã gửi mã OTP đến email {otpEmail}.<br />
            Vui lòng kiểm tra cả hộp thư spam nếu bạn không nhận được email.
          </p>

          <div className="auth-otp-inputs">
            {otpValues.map((value, index) => (
              <input
                key={index}
                type="tel"
                inputMode="numeric"
                name={`otp-${index}`}
                value={value}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleOTPKeyDown(e, index)}
                onPaste={handleOTPPaste}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={(e) => {
                  setIsComposing(false);
                  handleOTPChange(index, e.target.value);
                }}
                maxLength={1}
                className="auth-otp-input"
                autoComplete="off"
              />
            ))}
          </div>

          <button className="auth-register-submit" onClick={handleVerifyOTP}>
            Xác thực
          </button>

          <div className="auth-otp-resend">
            {resendTimer > 0 ? (
              <p>Gửi lại mã sau {resendTimer} giây</p>
            ) : (
              <button
                className="auth-otp-resend-button"
                onClick={handleResendOTP}
              >
                Gửi lại mã OTP
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main registration form UI
  return (
    <div className="auth-register-container" data-theme={theme}>
      <div className="auth-register-card">
        <h1>Hãy bắt đầu với Một tài khoản mới</h1>
        <p>
          Tham gia SchoolTV ngay hôm nay để bắt đầu một hành trình tại đại học
          của bạn một cách hoàn hảo nhất!
        </p>

        <div className="auth-register-school-banner">
          <svg
            className="auth-register-school-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <Link to="/school-register" className="auth-register-school-link">
            Bạn muốn đăng ký tài khoản với tư cách là trường học?
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-register-columns">
            <div className="auth-register-column">
              <div className="auth-register-field">
                <label className="auth-register-label">Tên đăng nhập</label>
                <div className="auth-register-input-wrapper">
                  <svg
                    className="auth-register-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    type="text"
                    name="username"
                    className={`auth-register-input ${
                      errors.username ? "auth-register-input-error" : ""
                    }`}
                    placeholder="Chọn tên đăng nhập"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="auth-register-field">
                <label className="auth-register-label">Email</label>
                <div className="auth-register-input-wrapper">
                  <svg
                    className="auth-register-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input
                    type="email"
                    name="email"
                    className={`auth-register-input ${
                      errors.email ? "auth-register-input-error" : ""
                    }`}
                    placeholder="Nhập email của bạn"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="auth-register-field">
                <label className="auth-register-label">Mật khẩu</label>
                <div className="auth-register-input-wrapper">
                  <svg
                    className="auth-register-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className={`auth-register-input auth-register-password ${
                      errors.password ? "auth-register-input-error" : ""
                    }`}
                    placeholder="Tạo mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <svg
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-register-eye-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {showPassword ? (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </>
                    )}
                  </svg>
                </div>
              </div>
            </div>

            <div className="auth-register-column">
              <div className="auth-register-field">
                <label className="auth-register-label">Họ và tên</label>
                <div className="auth-register-input-wrapper">
                  <svg
                    className="auth-register-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <input
                    type="text"
                    name="fullname"
                    className={`auth-register-input ${
                      errors.fullname ? "auth-register-input-error" : ""
                    }`}
                    placeholder="Nhập họ và tên của bạn"
                    value={formData.fullname}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="auth-register-field">
                <label className="auth-register-label">Số điện thoại</label>
                <div className="auth-register-input-wrapper">
                  <svg
                    className="auth-register-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <input
                    type="tel"
                    name="phoneNumber"
                    className={`auth-register-input ${
                      errors.phoneNumber ? "auth-register-input-error" : ""
                    }`}
                    placeholder="Nhập số điện thoại của bạn"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="auth-register-field">
                <label className="auth-register-label">Xác nhận mật khẩu</label>
                <div className="auth-register-input-wrapper">
                  <svg
                    className="auth-register-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className={`auth-register-input auth-register-password ${
                      errors.confirmPassword ? "auth-register-input-error" : ""
                    }`}
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <svg
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="auth-register-eye-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {showConfirmPassword ? (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </>
                    )}
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-register-field">
            <label className="auth-register-label">Địa chỉ</label>
            <div className="auth-register-input-wrapper">
              <svg
                className="auth-register-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <input
                type="text"
                name="address"
                className={`auth-register-input ${
                  errors.address ? "auth-register-input-error" : ""
                }`}
                placeholder="Nhập địa chỉ của bạn"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="auth-register-terms">
            <label className="auth-register-terms-checkbox">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                Tôi đồng ý với{" "}
                <span
                  className="auth-register-terms-link"
                  onClick={() => setIsModalVisible(true)}
                >
                  Điều khoản và Điều kiện
                </span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="auth-register-submit"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Tạo Tài Khoản"}
          </button>

          <div className="auth-register-login">
            <span>Bạn đã có tài khoản?</span>
            <Link to="/login" className="auth-register-login-link">
              Đăng nhập
            </Link>
          </div>
        </form>
      </div>

      {isModalVisible && (
        <div className="auth-register-modal">
          <div className="auth-register-modal-content">
            <div className="auth-register-modal-header">
              <h3>Điều khoản và Điều kiện</h3>
              <button
                className="auth-register-modal-close"
                onClick={() => setIsModalVisible(false)}
              >
                ×
              </button>
            </div>
            <div className="auth-register-modal-body">
              <p>
                <strong>
                  Chào mừng bạn đến với ứng dụng SchoolTV! Trước khi sử dụng
                  dịch vụ của chúng tôi, vui lòng đọc kỹ các điều khoản và điều
                  kiện sau đây. Khi bạn đăng ký tài khoản hoặc sử dụng dịch vụ,
                  bạn vui lòng đồng ý tuân thủ các điều khoản này.
                </strong>
              </p>
              <p>
                <strong>1. Đăng ký tài khoản:</strong> Người dùng phải cung cấp
                thông tin chính xác và đầy đủ khi đăng ký tài khoản. Nếu thông
                tin không chính xác, chúng tôi có quyền khóa hoặc xóa tài khoản
                của người dùng mà không cần thông báo trước. Bạn cam kết bảo vệ
                mật khẩu và thông tin đăng nhập của mình. Bạn sẽ chịu trách
                nhiệm cho tất cả các hoạt động xảy ra dưới tài khoản của bạn.
              </p>
              <p>
                <strong>2. Sử dụng dịch vụ:</strong> Ứng dụng SchoolTV cung cấp
                dịch vụ livestream các môn học và sự kiện trường học, cho phép
                người dùng đăng tải bài viết và nội dung liên quan đến hoạt động
                trường học. Bạn cam kết sử dụng dịch vụ của SchoolTV một cách
                hợp pháp, không vi phạm quyền lợi của người khác, không sử dụng
                dịch vụ vào mục đích xâm hại đến lợi ích, quyền lợi của các bên
                liên quan.
              </p>
              <p>
                <strong>3. Nội dung người dùng:</strong> Bạn có quyền đăng tải
                nội dung (video, hình ảnh, bài viết) lên ứng dụng. Tuy nhiên,
                bạn cam kết rằng các nội dung này không vi phạm bản quyền, quyền
                riêng tư hoặc các quy định pháp lý khác. SchoolTV có quyền xóa
                hoặc chỉnh sửa các nội dung vi phạm các quy định hoặc có hại cho
                cộng đồng người dùng.
              </p>
              <p>
                <strong>4. Bảo mật và quyền riêng tư:</strong> Chúng tôi cam kết
                bảo vệ thông tin cá nhân của bạn theo chính sách bảo mật của
                chúng tôi. Bạn có thể tham khảo chi tiết trong Chính Sách Bảo
                Mật. Bạn chịu trách nhiệm bảo mật thông tin tài khoản của mình.
                Nếu phát hiện có bất kỳ hành vi truy cập trái phép nào, bạn phải
                thông báo ngay cho chúng tôi.
              </p>
              <p>
                <strong>5. Quyền sở hữu trí tuệ:</strong> Tất cả các quyền sở
                hữu trí tuệ liên quan đến ứng dụng SchoolTV, bao gồm giao diện,
                mã nguồn, thiết kế, và các tính năng của ứng dụng đều thuộc về
                chúng tôi hoặc các bên cấp phép. Người dùng không được phép sao
                chép, thay đổi hoặc phát tán bất kỳ phần nào của ứng dụng nếu
                không có sự đồng ý bằng văn bản của chúng tôi.
              </p>
              <p>
                <strong>6. Giới hạn trách nhiệm:</strong>Chúng tôi không chịu
                trách nhiệm đối với bất kỳ thiệt hại nào phát sinh từ việc sử
                dụng ứng dụng SchoolTV, bao gồm các sự cố về kết nối mạng, lỗi
                phần mềm hoặc các vấn đề không mong muốn khác. SchoolTV không
                chịu trách nhiệm cho nội dung người dùng đăng tải. Bạn hoàn toàn
                chịu trách nhiệm về các bài viết và livestream của mình.
              </p>
              <p>
                <strong>7. Chấm dứt tài khoản:</strong>Chúng tôi có quyền đình
                chỉ hoặc xóa tài khoản của bạn nếu phát hiện hành vi vi phạm các
                điều khoản sử dụng hoặc các quy định pháp lý. Bạn có thể yêu cầu
                xóa tài khoản của mình bất cứ lúc nào bằng cách liên hệ với
                chúng tôi qua phương thức hỗ trợ.
              </p>
              <p>
                <strong>8. Sửa đổi điều khoản:</strong>Chúng tôi có quyền sửa
                đổi, bổ sung các điều khoản này vào bất kỳ lúc nào. Mọi thay đổi
                sẽ được thông báo trên ứng dụng và có hiệu lực ngay khi được
                công bố.
              </p>
            </div>
            <div className="auth-register-modal-footer">
              <button
                className="auth-register-modal-button"
                onClick={() => setIsModalVisible(false)}
              >
                Tôi đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
