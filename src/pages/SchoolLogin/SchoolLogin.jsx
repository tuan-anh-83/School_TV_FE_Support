// SchoolLogin.jsx
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { notification } from "antd";
import { ThemeContext } from "../../context/ThemeContext";
import "./schoolLogin.scss";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/features/userData/userLoginSlice";
import apiFetch from "../../config/baseAPI";

function SchoolLogin() {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.userData.user);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      notification.warning({
        message: "Vui lòng kiểm tra lại thông tin đăng nhập!",
        description: "Bạn cần nhập đầy đủ thông tin trước khi đăng nhập.",
        placement: "topRight",
        duration: 5,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch("accounts/login", {
        method: "POST",
        body: JSON.stringify({ email, password, remember: rememberMe }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login response:", data);

        const { token, account } = data;

        if (token && account?.accountID) {
          // Check if the user has SchoolOwner role
          if (account.roleName !== "SchoolOwner") {
            notification.error({
              message: "Đăng nhập thất bại!",
              description:
                "Bạn không thể đăng nhập bằng chức năng dành cho Trường Học.",
              placement: "topRight",
              duration: 5,
            });
            return;
          }

          localStorage.setItem("authToken", token);
          localStorage.setItem("accountID", account.accountID);

          // Store additional user info if needed
          localStorage.setItem(
            "userData",
            JSON.stringify({
              username: account.username,
              email: account.email,
              fullname: account.fullname,
              roleName: account.roleName,
            })
          );

          console.log("dispatching login action with account", account);
          dispatch(login(account));
          console.log("Redux state after login:", user);

          notification.success({
            message: "Đăng nhập thành công!",
            description: "Chào mừng đơn vị trường học quay trở lại!",
            placement: "topRight",
            duration: 3,
          });

          // Redirect to appropriate dashboard for school owners
          navigate("/");
        } else {
          throw new Error("Invalid response format");
        }
      } else {
        throw { status: response.status };
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);

      notification.error({
        message: "Đăng nhập thất bại!",
        description:
          error?.status === 401
            ? "Email hoặc mật khẩu của bạn đã sai! Hãy kiểm tra lại."
            : "Có lỗi xảy ra trong quá trình đăng nhập, vui lòng thử lại.",
        placement: "topRight",
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  // The rest of the component remains the same...
  return (
    <div className="school-login-container" data-theme={theme}>
      <div className="school-login-card">
        <div className="school-login-header">
          <svg
            className="school-login-logo"
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
          <h1>Đăng nhập Trường học</h1>
        </div>

        <p className="school-login-description">
          Đăng nhập với tư cách đơn vị trường học để quản lý nội dung và tương
          tác với sinh viên
        </p>

        <form onSubmit={handleSubmit} className="school-login-form">
          <div className="school-login-field">
            <label className="school-login-label">
              Email đơn vị trường học
            </label>
            <div className="school-login-input-wrapper">
              <svg
                className="school-login-icon"
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
                className="school-login-input"
                placeholder="Nhập email trường học"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="school-login-field">
            <label className="school-login-label">Mật khẩu</label>
            <div className="school-login-input-wrapper">
              <svg
                className="school-login-icon"
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
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                className="school-login-input school-login-password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <svg
                onClick={() => setShowPassword(!showPassword)}
                className="school-login-eye-icon"
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

          <div className="school-login-options">
            <div className="school-login-remember">
              <input
                type="checkbox"
                className="school-login-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                id="remember-me-school"
              />
              <label
                htmlFor="remember-me-school"
                className="school-login-remember-text"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>
            <Link to="/forgottenPassword" className="school-login-forgot">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            className="school-login-submit"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đăng nhập vào hệ thống trường học"}
          </button>
        </form>

        <div className="school-login-footer">
          <div className="school-login-register">
            <span>Chưa có tài khoản trường học?</span>
            <Link to="/school-register" className="school-login-register-link">
              Đăng ký tài khoản trường học
            </Link>
          </div>

          <div className="school-login-back">
            <Link to="/login" className="school-login-back-link">
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
              Quay lại đăng nhập thông thường
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SchoolLogin;
