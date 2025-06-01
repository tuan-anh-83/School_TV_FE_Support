import React, { useEffect } from "react";
import "./SchoolChannelStudio.scss";
import StudioHeader from "../../components/schooltv-studio/StudioHeader";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import StudioNavbar from "../../components/schooltv-studio/StudioNavbar";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { checkExistChannel } from "./check-channel/CheckExistChannel";

function SchoolChannelStudio() {
  const user = useSelector((state) => state.userData.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [schoolChannel, setSchoolChannel] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchChannel = async () => {
    try {
      setIsLoading(true);
      const data = await checkExistChannel(user.accountID);

      if (!data || (data.$values && data.$values.length === 0)) {
        navigate("/create-channel");
        return;
      }

      setSchoolChannel(data);
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau!");
      navigate("/create-channel");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.accountID) {
      fetchChannel();
    }
  }, [user?.accountID, navigate]);

  useEffect(() => {
    if (schoolChannel && schoolChannel.$values?.[0]?.name) {
      toast.success(
        `Bạn đang đăng nhập kênh ${schoolChannel.$values[0].name}!`
      );
    }
  }, [schoolChannel]);

  // Consolidated logic
  const noStylesRoutes = [
    "/school-studio/your-channel",
    "/school-studio/program-manage",
  ];
  const shouldHideNavbar = noStylesRoutes.some((route) =>
    location.pathname.includes(route)
  );
  const containerClass = `studio-function-container ${
    shouldHideNavbar ? "no-styles" : ""
  }`;

  if (isLoading) {
    return <div>Loading...</div>; // You might want to use a proper loading component here
  }

  return (
    <>
      <StudioHeader channel={schoolChannel} />
      <div className={containerClass}>
        {!shouldHideNavbar && <StudioNavbar />}
        <Outlet context={{ channel: schoolChannel, isLoading }} />
      </div>
    </>
  );
}

export default SchoolChannelStudio;
