import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { Button, Result } from "antd";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, hasAnyRole, loading } = useUser();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  const isAllowed = hasAnyRole(allowedRoles);
  if (!isAllowed) {
    return (
      <Result
        style={{ marginTop: "50px" }}
        status="403"
        title="403 - Forbidden"
        subTitle="Bạn không có quyền truy cập vào trang này."
        extra={
          <Button type="primary" href="/">
            Quay về trang chủ
          </Button>
        }
      />
    );
  }
  return children;
};

export default ProtectedRoute;
