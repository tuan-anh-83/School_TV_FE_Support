import { createContext, useContext, useState, useEffect } from "react";

// Tạo context cho toàn ứng dụng
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.roleName) {
          setUser(parsed);
        }
      } catch (err) {
        console.error("Failed to parse userData:", err);
        localStorage.removeItem("userData");
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("userData");
  };

  const checkRole = (role) => {
    return user && user.roleName?.toLowerCase() === role.toLowerCase();
  };

  const hasAnyRole = (roles) => {
    if (!user || !user.roleName) return false;
    return roles
      .map((r) => r.toLowerCase())
      .includes(user.roleName.toLowerCase());
  };

  return (
    <UserContext.Provider
      value={{ user, loginUser, logoutUser, checkRole, hasAnyRole, loading }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
