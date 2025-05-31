import { useEffect } from "react";
import "./AdsManagement.scss";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import AdsHeader from "../../components/ads-studio/AdsHeader";
import AdsNavbar from "../../components/ads-studio/AdsNavbar";
import { accountStatusHub } from "../../utils/AccountStatusHub";

function AdsManagement() {
  const user = useSelector((state) => state.userData.user);
  const location = useLocation();

  useEffect(() => {
    // Start AccountStatusHub connection when component mounts
    if (user?.accountID) {
      accountStatusHub.startConnection(user.accountID).catch((error) => {
        console.error("Failed to start AccountStatusHub connection:", error);
      });
    }

    // Cleanup function to stop connection when component unmounts
    return () => {
      if (user?.accountID) {
        accountStatusHub.stopConnection(user.accountID).catch((error) => {
          console.error("Failed to stop AccountStatusHub connection:", error);
        });
      }
    };
  }, [user?.accountID]);

  // Consolidated logic
  const noStylesRoutes = ["/school-studio/program-manage"];
  const shouldHideNavbar = noStylesRoutes.some((route) =>
    location.pathname.includes(route)
  );
  const containerClass = `studio-function-container ${
    shouldHideNavbar ? "no-styles" : ""
  }`;

  return (
    <>
      <AdsHeader user={user} />
      <div className={containerClass}>
        {!shouldHideNavbar && <AdsNavbar />}
        <Outlet context={{ user: user }} />
      </div>
    </>
  );
}

export default AdsManagement;
