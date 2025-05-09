import React from "react";
import "./AdsManagement.scss";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import AdsHeader from "../../components/ads-studio/AdsHeader";
import AdsNavbar from "../../components/ads-studio/AdsNavbar";

function AdsManagement() {
  const user = useSelector((state) => state.userData.user);
  const navigate = useNavigate();
  const location = useLocation();

  // Consolidated logic
  const noStylesRoutes = [
    "/school-studio/program-manage",
  ];
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
