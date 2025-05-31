import { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Home from "./pages/BusinessHome/Home";
import WatchHome from "./pages/WatchHome/WatchHome";
import LiveList from "./pages/LiveList/LiveList";
import ChannelList from "./pages/ChannelList/ChannelList";
import WatchLive from "./pages/WatchLive/WatchLive";
import AllFeaturedVideo from "./pages/featuredVideo/AllFeaturedVideo";
import PlayFeaturedVideo from "./pages/featuredVideo/PlayFeaturedVideo";
import UserProfile from "./pages/UserProfile/UserProfile";
import PageLayout from "./components/layout/PageLayout";
import SchoolChannelStudio from "./pages/school-channel/SchoolChannelStudio";
import StudioLiveStream from "./components/schooltv-studio/functions/live-stream/StudioLiveStream";
import UpComingList from "./pages/upcomingList/upcomingList";
import UpComingDetail from "./pages/upcomingDetail/upcomingDetail";
import ForgottenPassword from "./pages/forgottenPassword/forgottenPassword";
import StatisticsPage from "./pages/StatisticsPage/StatisticsPage";
import Login from "./pages/login/login";
import Register from "./pages/register/register";
import "@fortawesome/fontawesome-free/css/all.min.css";
import CommunityPost from "./pages/CommunityPost/CommunityPost";
import SchoolLogin from "./pages/SchoolLogin/SchoolLogin";
import SchoolRegister from "./pages/SchoolRegister/SchoolRegister";
import PricingPage from "./pages/pricing/pricing";
import Checkout from "./pages/payment/payment";
import StudioPost from "./components/schooltv-studio/functions/post/StudioPost";
import AdminPage from "./pages/AdminPage/AdminPage";
import UserList from "./pages/AdminPage/UserList";
import StudioVideo from "./components/schooltv-studio/functions/up-video/StudioVideo";
import AdminList from "./pages/AdminPage/AdminList";
import SchoolOwnerPending from "./pages/AdminPage/SchoolOwnerPending";
import AdvertiserPending from "./pages/AdminPage/AdvertiserPending";
import SchoolOwnerAccount from "./pages/AdminPage/SchoolOwnerAccount";
import { UserProvider } from "./context/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateSchoolChannel from "./pages/school-channel/create/CreateSchoolChannel";
import AdminPackage from "./pages/AdminPage/AdminPackage";
import CreatePackage from "./pages/AdminPage/CreatePackage";
import ProgramDetailPage from "./pages/ProgramDetail/ProgramDetailPage";
import PaymentSuccess from "./pages/PaymentComplete/Success/success";
import PaymentCancel from "./pages/PaymentComplete/Cancel/cancel";
import ViewChannelProgram from "./pages/watch-program/ViewChannelProgram";
import StudioChannel from "./pages/school-channel/view-channel/StudioChannel";
import StudioPrograms from "./pages/school-channel/program-manage/StudioPrograms";
import AdminPaymentManagement from "./pages/AdminPage/AdminPaymentManagement";
import AdsList from "./pages/AdminPage/AdsList";
import AdsLogin from "./pages/AdsLogin/AdsLogin";
import AdsRegister from "./pages/AdsRegister/AdsRegister";
import AdsManagement from "./pages/Ads-Management/AdsManagement";
import AdsPost from "./components/ads-studio/functions/post/AdsPost";
import ScheduleList from "./pages/AdminPage/ScheduleList";
import PostListPage from "./pages/PostList/PostListPage";
import { default as AdsListForAd } from "./components/ads-studio/AdsList";
import ProgramListPage from "./pages/ProgramList/ProgramListPage";
import ScheduleListPage from "./pages/ScheduleList/ScheduleListPage";
import AdvertiserAccount from "./pages/AdminPage/AdvertiserAccount";

const ScrollToTopWrapper = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: (
        <ThemeProvider>
          <ScrollToTopWrapper />
          <Login />
        </ThemeProvider>
      ),
    },
    {
      path: "/checkout/cancel",
      element: (
        <ThemeProvider>
          <ScrollToTopWrapper />
          <PaymentCancel />
        </ThemeProvider>
      ),
    },
    {
      path: "/checkout/success",
      element: (
        <ThemeProvider>
          <ScrollToTopWrapper />
          <PaymentSuccess />
        </ThemeProvider>
      ),
    },
    {
      path: "/upcomingDetail",
      element: <UpComingDetail />,
    },
    {
      path: "/register",
      element: (
        <ThemeProvider>
          <ScrollToTopWrapper />
          <Register />
        </ThemeProvider>
      ),
    },
    {
      path: "/school-register",
      element: (
        <ThemeProvider>
          <ScrollToTopWrapper />
          <SchoolRegister />
        </ThemeProvider>
      ),
    },
    {
      path: "/ads-register",
      element: (
        <ThemeProvider>
          <ScrollToTopWrapper />
          <AdsRegister />
        </ThemeProvider>
      ),
    },
    {
      path: "/school-login",
      element: (
        <ThemeProvider>
          <ScrollToTopWrapper />
          <SchoolLogin />
        </ThemeProvider>
      ),
    },
    {
      path: "/ads-login",
      element: (
        <ThemeProvider>
          <ScrollToTopWrapper />
          <AdsLogin />
        </ThemeProvider>
      ),
    },
    {
      path: "/forgottenPassword",
      element: (
        <ThemeProvider>
          <ScrollToTopWrapper />
          <ForgottenPassword />
        </ThemeProvider>
      ),
    },

    {
      path: "/create-channel",
      element: <CreateSchoolChannel />,
    },
    {
      path: "school-studio",
      element: (
        <ThemeProvider>
          <ScrollToTopWrapper />
          <SchoolChannelStudio />
        </ThemeProvider>
      ),
      children: [
        {
          index: true,
          element: <StatisticsPage />,
        },
        {
          path: "statistics",
          element: <StatisticsPage />,
        },
        {
          path: "post",
          element: <StudioPost />,
        },
        {
          path: "video",
          element: <StudioVideo />,
        },
        {
          path: "live-stream",
          element: <StudioLiveStream />,
        },
        {
          path: "your-channel",
          element: <StudioChannel />,
        },
        {
          path: "program-manage",
          children: [
            {
              index: true,
              element: <StudioPrograms />,
            },
          ],
        },
        {
          path: "postList",
          element: <PostListPage />,
        },
        {
          path: "programList",
          element: <ProgramListPage />,
        },
        {
          path: "videoHistoryList",
          element: <PostListPage />,
        },
        {
          path: "scheduleList",
          element: <ScheduleListPage />,
        },
      ],
    },
    {
      path: "ads-management",
      element: (
        <ThemeProvider>
          <ScrollToTopWrapper />
          <AdsManagement />
        </ThemeProvider>
      ),
      children: [
        {
          index: true,
          element: <StatisticsPage />,
        },
        {
          path: "statistics",
          element: <StatisticsPage />,
        },
        {
          path: "post",
          element: <AdsPost />,
        },
        {
          path: "video",
          element: <StudioVideo />,
        },
        {
          path: "live-stream",
          element: <StudioLiveStream />,
        },
        {
          path: "program-manage",
          children: [
            {
              index: true,
              element: <StudioPrograms />,
            },
          ],
        },
        {
          path: "ads",
          element: <AdsListForAd />,
        },
      ],
    },
    {
      path: "",
      element: (
        <ThemeProvider>
          <ScrollToTopWrapper />
          <UserProvider>
            <PageLayout />
          </UserProvider>
        </ThemeProvider>
      ),
      children: [
        {
          path: "featured-video",
          element: <AllFeaturedVideo />,
        },
        {
          path: "play-featured-video",
          element: <PlayFeaturedVideo />,
        },
        {
          path: "/watchLive/:channelId",
          element: <WatchLive />,
        },
        {
          path: "/",
          element: <WatchHome />,
        },
        {
          path: "/watchHome",
          element: <WatchHome />,
        },
        {
          path: "/liveList",
          element: <LiveList />,
        },
        {
          path: "/channelList",
          element: <ChannelList />,
        },
        {
          path: "/businessHome",
          element: <Home />,
        },
        {
          path: "/userProfile",
          element: <UserProfile />,
        },
        {
          path: "/upcomingList",
          element: <UpComingList />,
        },
        {
          path: "/package",
          element: <PricingPage />,
        },
        {
          path: "/checkout",
          element: <Checkout />,
        },
        {
          path: "/communityPost",
          element: <CommunityPost />,
        },
        {
          path: "/program/:id",
          element: <ProgramDetailPage />,
        },
        {
          path: "/view-channel/:channelId",
          element: <ViewChannelProgram />,
        },
        {
          path: "/adminpage",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/userlist",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserList />
            </ProtectedRoute>
          ),
        },
        {
          path: "/adminlist",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminList />
            </ProtectedRoute>
          ),
        },
        {
          path: "/sopending",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <SchoolOwnerPending />
            </ProtectedRoute>
          ),
        },
        {
          path: "/adpending",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdvertiserPending />
            </ProtectedRoute>
          ),
        },
        {
          path: "/soaccount",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <SchoolOwnerAccount />
            </ProtectedRoute>
          ),
        },
        {
          path: "/adminpackage",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPackage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/createpackage",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreatePackage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/adminpayment",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPaymentManagement />
            </ProtectedRoute>
          ),
        },
        {
          path: "/ads",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdsList />
            </ProtectedRoute>
          ),
        },
        {
          path: "/schedule-management",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <ScheduleList />
            </ProtectedRoute>
          ),
        },
        {
          path: "/advertiseraccount",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdvertiserAccount />
            </ProtectedRoute>
          ),
        },
      ],
    },
  ]);

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
export default App;
