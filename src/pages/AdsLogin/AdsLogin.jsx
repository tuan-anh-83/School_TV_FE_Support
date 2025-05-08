// AdsLogin.jsx
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { notification } from "antd";
import { ThemeContext } from "../../context/ThemeContext";
import "./AdsLogin.scss";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/features/userData/userLoginSlice";
import apiFetch from "../../config/baseAPI";

function AdsLogin() {
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
          // Check if the user has Advertiser role
          if (account.roleName !== "Advertiser") {
            notification.error({
              message: "Đăng nhập thất bại!",
              description:
                "Bạn không thể đăng nhập bằng chức năng dành cho đơn vị quảng cáo.",
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
            description: "Chào mừng đơn vị quảng cáo quay trở lại!",
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
            width="40"
            height="40"
            viewBox="0 0 48 48"
            version="1"
            xmlns="http://www.w3.org/2000/svg"
            enable-background="new 0 0 48 48"
          >
            <g fill="#90CAF9">
              <path d="M17.4,33H15v-4h4l0.4,1.5C19.7,31.8,18.7,33,17.4,33z" />
              <path d="M37,36c0,0-11.8-7-18-7V15c5.8,0,18-7,18-7V36z" />
            </g>
            <g fill="#283593">
              <circle cx="9" cy="22" r="5" />
              <path d="M40,19h-3v6h3c1.7,0,3-1.3,3-3S41.7,19,40,19z" />
              <path d="M18.6,41.2c-0.9,0.6-2.5,1.2-4.6,1.4c-0.6,0.1-1.2-0.3-1.4-1L8.2,27.9c0,0,8.8-6.2,8.8,1.1 c0,5.5,1.5,8.4,2.2,9.5c0.5,0.7,0.5,1.6,0,2.3C19,41,18.8,41.1,18.6,41.2z" />
            </g>
            <path
              fill="#3F51B5"
              d="M9,29h10V15H9c-1.1,0-2,0.9-2,2v10C7,28.1,7.9,29,9,29z"
            />
            <path
              fill="#42A5F5"
              d="M38,38L38,38c-1.1,0-2-0.9-2-2V8c0-1.1,0.9-2,2-2h0c1.1,0,2,0.9,2,2v28C40,37.1,39.1,38,38,38z"
            />
          </svg>
          <h1>Đăng nhập Nhà quảng cáo</h1>
        </div>

        <p className="school-login-description">
          Đăng nhập với tư cách nhà quảng cáo để quản lý nội dung và các video
          quảng cáo
        </p>

        <form onSubmit={handleSubmit} className="school-login-form">
          <div className="school-login-field">
            <label className="school-login-label">Email đơn vị quảng cáo</label>
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
                placeholder="Nhập email nhà quảng cáo"
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
            {loading ? "Đang xử lý..." : "Đăng nhập vào trang quảng trị"}
          </button>
        </form>

        <div className="school-login-footer">
          <div className="school-login-register">
            <span>Chưa có tài khoản?</span>
            <Link to="/ads-register" className="school-login-register-link">
              Đăng ký tài khoản nhà quảng cáo
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

export default AdsLogin;
