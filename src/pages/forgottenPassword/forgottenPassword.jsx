import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Input,
  Button,
  Steps,
  ConfigProvider,
  theme,
  notification,
  Form,
  Spin,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  CheckCircleFilled,
  SecurityScanOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { ThemeContext } from "../../context/ThemeContext";
import "./forgottenPassword.scss";
import apiFetch from "../../config/baseAPI";

const { Step } = Steps;

const ForgottenPassword = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const timerRef = useRef(null);
  const { theme: currentTheme } = useContext(ThemeContext);

  const themeConfig = {
    algorithm:
      currentTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: "#4299e1",
      borderRadius: 12,
    },
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlEmail = queryParams.get("email");
    const urlToken = queryParams.get("token");

    if (urlEmail && urlToken) {
      localStorage.setItem("resetPasswordEmail", urlEmail);
      localStorage.setItem("resetPasswordToken", urlToken);
      setUserEmail(urlEmail);
      form.setFieldsValue({ token: urlToken });
      setCurrentStep(2);
    } else {
      localStorage.removeItem("resetPasswordEmail");
      localStorage.removeItem("resetPasswordToken");
      setUserEmail("");
      form.resetFields();
      setCurrentStep(0);
    }
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);

  useEffect(() => {
    setErrors({});
  }, [currentStep]);

  const validateStep = (values) => {
    const newErrors = {};
    if (currentStep === 0) {
      if (!values.email) {
        newErrors.email = "Vui lòng nhập email";
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        newErrors.email = "Email không hợp lệ";
      }
    } else if (currentStep === 2) {
      if (!values.token) newErrors.token = "Vui lòng nhập mã xác nhận";
      if (!values.newPassword) {
        newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
      } else if (values.newPassword.includes(".")) {
        newErrors.newPassword = "Mật khẩu không được chứa dấu chấm (.)";
      } else if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/.test(
          values.newPassword
        )
      ) {
        newErrors.newPassword =
          "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt";
      }
      if (values.confirmNewPassword !== values.newPassword) {
        newErrors.confirmNewPassword = "Mật khẩu xác nhận không khớp";
      }
    }
    return newErrors;
  };

  const highlightErrorFields = (errorFields) => {
    Object.keys(errorFields).forEach((fieldName) => {
      const input = document.querySelector(`[name="${fieldName}"]`);
      if (input) {
        input.classList.add("fp-input-error");
        setTimeout(() => {
          input.classList.remove("fp-input-error");
        }, 3000);
      }
    });
  };

  const handleEmailSubmit = async (values) => {
    const validationErrors = validateStep(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      highlightErrorFields(validationErrors);
      notification.error({
        message: "Lỗi",
        description: (
          <div>
            {Object.values(validationErrors).map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        ),
        placement: "topRight",
        duration: 5,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch("accounts/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: values.email }),
      });

      if (response.ok) {
        setUserEmail(values.email);
        setCurrentStep(1);
        setResendTimer(60);
        notification.success({
          message: "Gửi email thành công!",
          description: "Email xác nhận đã được gửi thành công!",
          placement: "topRight",
          duration: 3,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send email");
      }
    } catch (error) {
      notification.error({
        message: "Gửi email thất bại!",
        description: error.message || "Có lỗi xảy ra. Vui lòng thử lại sau!",
        placement: "topRight",
        duration: 5,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch("accounts/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (response.ok) {
        setResendTimer(60);
        notification.success({
          message: "Gửi lại email thành công!",
          description: "Email xác nhận đã được gửi lại thành công!",
          placement: "topRight",
          duration: 3,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to resend email");
      }
    } catch (error) {
      notification.error({
        message: "Gửi lại email thất bại!",
        description:
          error.message || "Không thể gửi lại email. Vui lòng thử lại sau!",
        placement: "topRight",
        duration: 5,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (values) => {
    const validationErrors = validateStep(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      highlightErrorFields(validationErrors);
      notification.error({
        message: "Lỗi",
        description: (
          <div>
            {Object.values(validationErrors).map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        ),
        placement: "topRight",
        duration: 5,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch("accounts/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          token: values.token,
          newPassword: values.newPassword,
          confirmNewPassword: values.confirmNewPassword,
        }),
      });

      if (response.ok) {
        setIsResetSuccess(true);
        setCurrentStep(3);
        localStorage.removeItem("resetPasswordEmail");
        localStorage.removeItem("resetPasswordToken");
        notification.success({
          message: "Đặt lại mật khẩu thành công!",
          description: "Bạn có thể đăng nhập bằng mật khẩu mới của mình.",
          placement: "topRight",
          duration: 3,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Reset failed");
      }
    } catch (error) {
      notification.error({
        message: "Đặt lại mật khẩu thất bại!",
        description:
          error.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại!",
        placement: "topRight",
        duration: 5,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form form={form} onFinish={handleEmailSubmit} layout="vertical">
            <Form.Item
              name="email"
              label="Địa chỉ email"
              className="fp-form-item"
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email đã đăng ký"
                className={`fp-input ${errors.email ? "fp-input-error" : ""}`}
                size="large"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
              className="fp-button"
            >
              Gửi Mã Xác Nhận
            </Button>
          </Form>
        );

      case 1:
        return (
          <div className="fp-success">
            <div className="success-icon">
              <CheckCircleFilled style={{ fontSize: "40px" }} />
            </div>
            <h3>Email đã được gửi!</h3>
            <p>
              Chúng tôi đã gửi email xác nhận đến <strong>{userEmail}</strong>.
              <br />
              Vui lòng kiểm tra hộp thư của bạn (bao gồm thư rác).
            </p>

            <div className="fp-resend" data-timer-active={resendTimer > 0}>
              {resendTimer > 0 ? (
                <p>
                  Có thể gửi lại sau: {Math.floor(resendTimer / 60)}:
                  {(resendTimer % 60).toString().padStart(2, "0")}
                </p>
              ) : (
                <Button
                  onClick={handleResendEmail}
                  loading={isLoading}
                  className="fp-button"
                >
                  Gửi Lại Email
                </Button>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <Form form={form} onFinish={handlePasswordReset} layout="vertical">
            {/* Hidden token field - kept in form but not visible to user */}
            <Form.Item name="token" noStyle>
              <Input type="hidden" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              className="fp-form-item"
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu mới"
                className={`fp-input ${
                  errors.newPassword ? "fp-input-error" : ""
                }`}
                inputMode="text"
                autoComplete="new-password"
                spellCheck={false}
              />
            </Form.Item>

            <Form.Item
              name="confirmNewPassword"
              label="Xác nhận mật khẩu"
              className="fp-form-item"
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập lại mật khẩu mới"
                className={`fp-input ${
                  errors.confirmNewPassword ? "fp-input-error" : ""
                }`}
                inputMode="text"
                autoComplete="new-password"
                spellCheck={false}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
              className="fp-button"
            >
              Xác Nhận Đặt Lại Mật Khẩu
            </Button>
          </Form>
        );

      case 3:
        return (
          <div className="fp-success">
            <div className="success-icon">
              <CheckCircleFilled style={{ fontSize: "40px" }} />
            </div>
            <h3>Đặt Lại Mật Khẩu Thành Công!</h3>
            <p>Bạn có thể đăng nhập bằng mật khẩu mới của mình.</p>
            <Button
              type="primary"
              href="/login"
              block
              className="fp-button"
              style={{ marginTop: "20px" }}
            >
              Đăng Nhập
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <div className="fp-modern-container" data-theme={currentTheme}>
        <div className="fp-modern-box">
          <div className="fp-header">
            <h2>Khôi Phục Mật Khẩu</h2>
            <p>Đừng lo lắng! Chúng tôi sẽ giúp bạn khôi phục tài khoản</p>
          </div>

          <Steps
            current={currentStep}
            className="fp-steps"
            responsive={false}
            items={[
              { title: "Email" },
              { title: "Xác nhận" },
              { title: "Mật khẩu mới" },
            ]}
          />

          {renderStepContent()}

          {currentStep < 3 && (
            <div className="fp-back">
              <a href="/login" className="fp-back-link">
                <ArrowLeftOutlined />
                Quay lại đăng nhập
              </a>
            </div>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default ForgottenPassword;
