import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { notification } from "antd";
import { ThemeContext } from "../../context/ThemeContext";
import "./login.scss";
import apiFetch from "../../config/baseAPI";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/features/userData/userLoginSlice";

function Login() {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      const req = await apiFetch("accounts/login", {
        method: "POST",
        body: JSON.stringify({ email, password, remember: rememberMe }),
        headers: { "Content-Type": "application/json" },
      });

      if (req.ok) {
        let data = await req.json();
        console.log("Login response:", data);

        const { token, account } = data;

        if (token && account) {
          // Check for SchoolOwner role
          if (account.roleName === "SchoolOwner") {
            notification.error({
              message: "Đăng nhập thất bại!",
              description:
                "Bạn phải chuyển qua đăng nhập bằng chức năng dành cho Trường Học.",
              placement: "topRight",
              duration: 5,
            });
            setLoading(false);
            return; // Abort login process
          }

          // Proceed with normal login
          localStorage.setItem("authToken", token);
          const userData = {
            accountID: account.accountID,
            username: account.username,
            email: account.email,
            fullname: account.fullname,
            roleName: account.roleName,
          };

          dispatch(login(account));
          localStorage.setItem("userData", JSON.stringify(userData));

          notification.success({
            message: "Đăng nhập thành công!",
            description: "Chào mừng bạn quay trở lại!",
            placement: "topRight",
            duration: 3,
          });

          navigate("/watchHome");
        } else {
          throw new Error("Invalid response format");
        }
      } else {
        throw {
          status: req.status,
        };
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

  return (
    <div className="auth-login-container" data-theme={theme}>
      <div className="auth-login-card">
        <h1>Chào mừng trở lại</h1>
        <p>Đăng nhập để tiếp tục hành trình của bạn</p>

        <Link to="/school-login" className="auth-login-school">
          <svg
            className="auth-login-school-icon"
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
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          Bạn muốn tiếp tục với tư cách trường học?
        </Link>

        <div className="auth-login-divider">
          <div className="auth-login-divider-line"></div>
          <span className="auth-login-divider-text">Hoặc</span>
          <div className="auth-login-divider-line"></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-login-field">
            <label className="auth-login-label">Địa chỉ Email</label>
            <div className="auth-login-input-wrapper">
              <svg
                className="auth-login-icon"
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
                className="auth-login-input"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-login-field">
            <label className="auth-login-label">Mật khẩu</label>
            <div className="auth-login-input-wrapper">
              <svg
                className="auth-login-icon"
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
                className="auth-login-input auth-login-password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <svg
                onClick={() => setShowPassword(!showPassword)}
                className="auth-login-eye-icon"
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

          <div className="auth-login-options">
            <div className="auth-login-remember">
              <input
                type="checkbox"
                className="auth-login-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                id="remember-me"
              />
              <label htmlFor="remember-me" className="auth-login-remember-text">
                Ghi nhớ mình nhé
              </label>
            </div>
            <Link to="/forgottenPassword" className="auth-login-forgot">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            className="auth-login-submit"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="auth-login-register">
          <span>Chưa có tài khoản?</span>
          <Link to="/register" className="auth-login-register-link">
            Đăng ký ngay
          </Link>
        </div>

        <div className="auth-login-back">
          <Link to="/watchHome" className="auth-login-back-link">
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
            Quay lại trang chủ SchoolTV
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
