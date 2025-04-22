import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { notification } from "antd";
import { ThemeContext } from "../../context/ThemeContext";
import "./schoolRegister.scss";
import apiFetch from "../../config/baseAPI";

function SchoolRegister() {
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

  // OTP verification states
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "Vui lòng nhập tên đăng nhập";
    } else if (formData.username.length < 3 || formData.username.length > 50) {
      newErrors.username = "Tên đăng nhập phải từ 3 đến 50 ký tự";
    } else if (/\s/.test(formData.username)) {
      newErrors.username = "Tên đăng nhập không được chứa khoảng trắng";
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại liên hệ";
    }

    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    if (!formData.fullname) {
      newErrors.fullname = "Vui lòng nhập tên trường học";
    }

    if (!formData.address) {
      newErrors.address = "Vui lòng nhập địa chỉ trường học";
    }

    return newErrors;
  };

  const highlightErrorFields = (errorFields) => {
    Object.keys(errorFields).forEach((fieldName) => {
      const input = document.querySelector(`[name="${fieldName}"]`);
      if (input) {
        input.classList.add("school-register-input-error");
        setTimeout(() => {
          input.classList.remove("school-register-input-error");
        }, 3000);
      }
    });
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    try {
      const response = await apiFetch("accounts/otp/resend", {
        method: "POST",
        body: JSON.stringify({ email: registeredEmail }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        notification.success({
          message: "Đã gửi lại mã OTP",
          description: data.message,
          placement: "topRight",
        });
        setCountdown(60);
      } else {
        throw new Error("Failed to resend OTP");
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Không thể gửi lại mã OTP",
        placement: "topRight",
      });
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otpValues.join("");
    if (otpCode.length !== 6) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng nhập đầy đủ mã OTP",
        placement: "topRight",
      });
      return;
    }

    try {
      const response = await apiFetch("accounts/otp/schoolowner/verify", {
        method: "POST",
        body: JSON.stringify({
          email: registeredEmail,
          otpCode: otpCode,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        notification.success({
          message: "Thành công",
          description: data.message,
          placement: "topRight",
        });

        setTimeout(() => {
          navigate("/school-login");
        }, 3000);
      } else {
        throw new Error("OTP verification failed");
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Xác thực OTP thất bại",
        placement: "topRight",
      });
    }
  };

  const handleOtpChange = (index, value) => {
    // Allow only numbers and empty string
    if (!/^[0-9]*$/.test(value) && value !== "") {
      return;
    }

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto-focus next input or submit if all filled
    if (value !== "") {
      if (index < 5) {
        const nextInput = document.querySelector(
          `input[name=otp-${index + 1}]`
        );
        if (nextInput) nextInput.focus();
      } else if (index === 5) {
        // If this is the last input and all values are filled, auto-submit
        const isAllFilled = newOtpValues.every((val) => val !== "");
        if (isAllFilled) {
          handleVerifyOtp();
        }
      }
    }
  };

  const handleOtpContainerKeyDown = (e) => {
    if (e.key === "Enter") {
      const isAllFilled = otpValues.every((value) => value !== "");
      if (isAllFilled) {
        handleVerifyOtp();
      }
    }
  };

  // Add this new function to handle keydown events
  const handleOtpKeyDown = (index, e) => {
    // Handle Enter key when all digits are filled
    if (e.key === "Enter") {
      const isAllFilled = otpValues.every((value) => value !== "");
      if (isAllFilled) {
        handleVerifyOtp();
        return;
      }
    }

    // Handle backspace with chain deletion
    if (e.key === "Backspace") {
      if (!otpValues[index]) {
        // If current field is empty, move to previous field and clear it
        if (index > 0) {
          const newOtpValues = [...otpValues];
          newOtpValues[index - 1] = "";
          setOtpValues(newOtpValues);

          const prevInput = document.querySelector(
            `input[name=otp-${index - 1}]`
          );
          if (prevInput) {
            prevInput.focus();
            e.preventDefault();
          }
        }
      }
    }

    // Handle left arrow
    if (e.key === "ArrowLeft" && index > 0) {
      const prevInput = document.querySelector(`input[name=otp-${index - 1}]`);
      if (prevInput) prevInput.focus();
    }

    // Handle right arrow
    if (e.key === "ArrowRight" && index < 5) {
      const nextInput = document.querySelector(`input[name=otp-${index + 1}]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtpValues = pastedData.split("");
      setOtpValues(newOtpValues);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

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
      const response = await apiFetch("accounts/schoolowner/signup", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        notification.success({
          message: "Đăng ký thành công",
          description: data.message,
          placement: "topRight",
        });

        setRegisteredEmail(formData.email);
        setShowOtpVerification(true);
        setCountdown(60);
      } else {
        if (response.status === 409) {
          throw new Error("Tên đăng nhập hoặc Email đã được đăng ký.");
        } else {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Có lỗi xảy ra trong quá trình đăng ký"
          );
        }
      }
    } catch (error) {
      notification.error({
        message: "Đăng ký thất bại",
        description: error.message,
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="school-register-container" data-theme={theme}>
      <div className="school-register-card">
        {!showOtpVerification ? (
          <>
            <div className="school-register-header">
              <svg
                className="school-register-logo"
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <h1>Đăng ký tài khoản Trường học</h1>
            </div>

            <p className="school-register-description">
              Tạo tài khoản đơn vị trường học để cung cấp dịch vụ nội dung giáo
              dục và tương tác với sinh viên trên nền tảng SchoolTV
            </p>

            <div className="school-register-info-box">
              <svg
                className="school-register-info-icon"
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
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <p>
                Sau khi đăng ký, tài khoản của bạn sẽ được gửi đến quản trị viên
                để xem xét và phê duyệt. Bạn sẽ nhận được thông báo qua email
                khi tài khoản được kích hoạt.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="school-register-form">
              <div className="school-register-columns">
                <div className="school-register-column">
                  <div className="school-register-field">
                    <label className="school-register-label">
                      Tên đăng nhập <span className="required">*</span>
                    </label>
                    <div className="school-register-input-wrapper">
                      <svg
                        className="school-register-icon"
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
                        className={`school-register-input ${
                          errors.username ? "school-register-input-error" : ""
                        }`}
                        placeholder="Tên đăng nhập của trường"
                        value={formData.username}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="school-register-field">
                    <label className="school-register-label">
                      Email <span className="required">*</span>
                    </label>
                    <div className="school-register-input-wrapper">
                      <svg
                        className="school-register-icon"
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
                        className={`school-register-input ${
                          errors.email ? "school-register-input-error" : ""
                        }`}
                        placeholder="Email liên hệ chính thức"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="school-register-field">
                    <label className="school-register-label">
                      Mật khẩu <span className="required">*</span>
                    </label>
                    <div className="school-register-input-wrapper">
                      <svg
                        className="school-register-icon"
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
                        className={`school-register-input school-register-password ${
                          errors.password ? "school-register-input-error" : ""
                        }`}
                        placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <svg
                        onClick={() => setShowPassword(!showPassword)}
                        className="school-register-eye-icon"
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

                <div className="school-register-column">
                  <div className="school-register-field">
                    <label className="school-register-label">
                      Tên trường học <span className="required">*</span>
                    </label>
                    <div className="school-register-input-wrapper">
                      <svg
                        className="school-register-icon"
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
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      <input
                        type="text"
                        name="fullname"
                        className={`school-register-input ${
                          errors.fullname ? "school-register-input-error" : ""
                        }`}
                        placeholder="Tên đầy đủ của trường học"
                        value={formData.fullname}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="school-register-field">
                    <label className="school-register-label">
                      Số điện thoại <span className="required">*</span>
                    </label>
                    <div className="school-register-input-wrapper">
                      <svg
                        className="school-register-icon"
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
                        className={`school-register-input ${
                          errors.phoneNumber
                            ? "school-register-input-error"
                            : ""
                        }`}
                        placeholder="Số điện thoại liên hệ"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="school-register-field">
                    <label className="school-register-label">
                      Xác nhận mật khẩu <span className="required">*</span>
                    </label>
                    <div className="school-register-input-wrapper">
                      <svg
                        className="school-register-icon"
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
                        className={`school-register-input school-register-password ${
                          errors.confirmPassword
                            ? "school-register-input-error"
                            : ""
                        }`}
                        placeholder="Nhập lại mật khẩu"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <svg
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="school-register-eye-icon"
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

              <div className="school-register-field">
                <label className="school-register-label">
                  Địa chỉ <span className="required">*</span>
                </label>
                <div className="school-register-input-wrapper">
                  <svg
                    className="school-register-icon"
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
                    className={`school-register-input ${
                      errors.address ? "school-register-input-error" : ""
                    }`}
                    placeholder="Địa chỉ của trường học"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="school-register-terms">
                <label className="school-register-terms-checkbox">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span>
                    Tôi đồng ý với{" "}
                    <span
                      className="school-register-terms-link"
                      onClick={() => setIsModalVisible(true)}
                    >
                      Điều khoản và Điều kiện dành cho Trường học
                    </span>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="school-register-submit"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đăng ký tài khoản trường học"}
              </button>

              <div className="school-register-footer">
                <div className="school-register-login">
                  <span>Đã có tài khoản trường học?</span>
                  <Link
                    to="/school-login"
                    className="school-register-login-link"
                  >
                    Đăng nhập
                  </Link>
                </div>

                <div className="school-register-back">
                  <Link to="/register" className="school-register-back-link">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Quay lại đăng ký thông thường
                  </Link>
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="otp-verification-container">
            <h1>Xác thực tài khoản</h1>
            <p>
              Vui lòng nhập mã OTP đã được gửi đến {registeredEmail}
              <br />
              Vui lòng kiểm tra cả hộp thư spam nếu bạn không nhận được email.
            </p>
            <div
              className="auth-otp-inputs"
              onKeyDown={handleOtpContainerKeyDown}
              tabIndex="-1" // This makes the div focusable
            >
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name={`otp-${index}`}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  maxLength={1}
                  className="auth-otp-input"
                  autoComplete="off"
                />
              ))}
            </div>

            <button
              className="school-register-submit"
              onClick={handleVerifyOtp}
            >
              Xác thực OTP
            </button>

            <div className="resend-otp-section">
              <button
                className="resend-otp-button"
                onClick={handleResendOtp}
                disabled={countdown > 0}
              >
                {countdown > 0
                  ? `Gửi lại mã OTP sau ${countdown}s`
                  : "Gửi lại mã OTP"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SchoolRegister;
