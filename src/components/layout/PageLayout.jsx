import React, { useEffect, useState } from "react";
import Header from "../Header";
import { Outlet } from "react-router-dom";
import Footer from "../Footer";
import AOS from "aos";
import apiFetch from "../../config/baseAPI";

function PageLayout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      // First try to load from localStorage for immediate display
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData);
          setUser(parsedUserData);
          console.log("Loaded user data from localStorage:", parsedUserData);
        } catch (error) {
          console.error("Error parsing stored user data:", error);
        }
      }

      // Determine if user is Admin from localStorage
      const isAdmin =
        storedUserData && JSON.parse(storedUserData).roleName === "Admin";
      const accountID = storedUserData && JSON.parse(storedUserData).accountID;

      // Then fetch fresh data from the appropriate API
      const apiUrl = isAdmin ? `accounts/admin/${accountID}` : "accounts/info";

      apiFetch(apiUrl, {
        headers: {
          accept: "*/*",
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch user data: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("API response for user info:", data);

          // Handle different response structures for Admin vs regular user
          const userData = isAdmin
            ? {
                accountID: data.accountID,
                username: data.username,
                email: data.email,
                fullname: data.fullname,
                address: data.address,
                phoneNumber: data.phoneNumber,
                roleName: data.role.roleName,
              }
            : {
                accountID: data.accountID,
                username: data.username,
                email: data.email,
                fullname: data.fullname,
                address: data.address,
                phoneNumber: data.phoneNumber,
                roleName:
                  data.roleName ||
                  (storedUserData ? JSON.parse(storedUserData).roleName : null),
              };

          setUser(userData);
          localStorage.setItem("userData", JSON.stringify(userData));
        })
        .catch((err) => {
          console.error("Error fetching user info:", err);
          if (err.message.includes("Failed to fetch user data")) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userData");
            setUser(null);
          }
        });
    }

    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <>
      <Header user={user} />
      <Outlet context={{ user }} />
      <Footer />
    </>
  );
}

export default PageLayout;
