import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { Users, Eye, Clock, Download, Info, ChevronDown } from "lucide-react";
import "./StatisticsPage.css";
import { toast } from "react-toastify";
import {
  CommentOutlined,
  EyeOutlined,
  HeartOutlined,
  LoadingOutlined,
  PlayCircleOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import apiFetch from "../../config/baseAPI";
import { Typography, Card, Avatar } from "antd";
import { extractVideoId, getThumbnailUrl } from "../../utils/image";
import dayjs from "dayjs";

const { Text, Title } = Typography;

const StatisticsPage = () => {
  const [timeRange, setTimeRange] = useState("7days");
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dateRange, setDateRange] = useState("7");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [audienceTimeFilter, setAudienceTimeFilter] = useState("hour");
  const [contentDistFilter, setContentDistFilter] = useState("type");
  const [viewData, setViewData] = useState([]);
  const [summaryStats, setSummaryStats] = React.useState([
    {
      icon: Eye,
      label: "Tổng lượt xem",
      value: "45.2K",
      trend: "+12.5%",
      isPositive: true,
    },
    {
      icon: Clock,
      label: "Thời gian xem",
      value: "1.2K giờ",
      trend: "+8.3%",
      isPositive: true,
    },
    {
      icon: Users,
      label: "Người theo dõi mới",
      value: "2.5K",
      trend: "-2.1%",
      isPositive: false,
    },
  ]);
  const { channel } = useOutletContext();
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're sure there's no channel after loading is complete
    if (
      !isLoading &&
      (!channel || (channel?.$values && channel.$values.length === 0))
    ) {
      toast.error("Không tìm thấy thông tin kênh!");
      navigate("/create-channel");
      return;
    }
  }, [channel, isLoading, navigate]);

  useEffect(() => {
    // Apply dark mode class
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  const audienceDataByDay = [
    { time: "T2", viewers: 850 },
    { time: "T3", viewers: 920 },
    { time: "T4", viewers: 1100 },
    { time: "T5", viewers: 980 },
    { time: "T6", viewers: 1250 },
    { time: "T7", viewers: 890 },
    { time: "CN", viewers: 750 },
  ];

  const contentTypeByTopic = [
    { name: "Giáo dục", value: 35, color: "#4a90e2" },
    { name: "Tin tức", value: 25, color: "#ff4757" },
    { name: "Giải trí", value: 20, color: "#28a745" },
    { name: "Hướng dẫn", value: 20, color: "#a55eea" },
  ];

  const generateMockData = (days) => {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date?.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        views: Math.floor(Math.random() * 5000) + 1000,
        likes: Math.floor(Math.random() * 400) + 100,
        comments: Math.floor(Math.random() * 100) + 30,
        shares: Math.floor(Math.random() * 60) + 10,
        revenue: Math.floor(Math.random() * 250) + 50,
        watchTime: Math.floor(Math.random() * 2000) + 800,
      });
    }
    return data;
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    switch (range) {
      case "7days":
        setDateRange("7");
        setViewData(generateMockData(7));
        break;
      case "30days":
        setDateRange("30");
        setViewData(generateMockData(30));
        break;
      case "90days":
        setDateRange("90");
        setViewData(generateMockData(90));
        break;
      case "custom":
        setDateRange("custom");
        // Add custom date picker logic here
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const fetchChannelData = async () => {
      if (!channel || !channel.$values?.length) {
        setIsLoading(false);
        return;
      }

      const channelId = channel.$values[0].schoolChannelID;

      try {
        setIsLoading(true);

        // Gọi Analytics
        const analyticsResponse = await apiFetch(
          `Analytics/analys-by-channel?channelId=${channelId}&dateRange=${dateRange}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              Accept: "application/json",
            },
          }
        );

        if (!analyticsResponse.ok) throw new Error("Kênh không tồn tại!");
        const analyticsData = await analyticsResponse.json();
        if (!analyticsData) throw new Error("Không có dữ liệu kênh!");

        const formattedStats = formatSummaryStats(analyticsData);
        setSummaryStats(formattedStats);

        // Gọi Videos
        const videoResponse = await apiFetch(
          `VideoHistory/by-channel/${channelId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              Accept: "application/json",
            },
          }
        );

        if (!videoResponse.ok) throw new Error("Kênh không tồn tại!");
        const videoData = await videoResponse.json();
        if (!videoData) throw new Error("Không có dữ liệu kênh!");
        if (videoData.$values?.length > 0) {
          setVideos(videoData.$values);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error(error.message || "Có lỗi xảy ra khi kiểm tra kênh!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannelData();
  }, [channel, dateRange]);

  const audienceData = [
    { time: "00:00", viewers: 120 },
    { time: "04:00", viewers: 250 },
    { time: "08:00", viewers: 580 },
    { time: "12:00", viewers: 890 },
    { time: "16:00", viewers: 1200 },
    { time: "20:00", viewers: 980 },
    { time: "23:59", viewers: 600 },
  ];

  const contentTypeData = [
    { name: "Video", value: 45, color: "#4a90e2" },
    { name: "Livestream", value: 30, color: "#ff4757" },
    { name: "Bài viết", value: 25, color: "#28a745" },
  ];

  const formatSummaryStats = (data) => [
    {
      icon: Eye,
      label: "Tổng lượt xem",
      value: data.totalViews.toLocaleString(), // hoặc format theo ý bạn
      trend:
        (data.viewsComparisonPercent > 0 ? "+" : "") +
        data.viewsComparisonPercent +
        "%",
      isPositive: data.viewsComparisonPercent >= 0,
    },
    {
      icon: Clock,
      label: "Thời gian xem",
      value: data.watchTimeHours + " giờ",
      trend:
        (data.watchTimeComparisonPercent > 0 ? "+" : "") +
        data.watchTimeComparisonPercent +
        "%",
      isPositive: data.watchTimeComparisonPercent >= 0,
    },
    {
      icon: Users,
      label: "Người theo dõi mới",
      value: data.newFollowers.toLocaleString(),
      trend:
        (data.followersComparisonPercent > 0 ? "+" : "") +
        data.followersComparisonPercent +
        "%",
      isPositive: data.followersComparisonPercent >= 0,
    },
  ];

  const renderStatsCard = ({ icon: Icon, label, value, trend, isPositive }) => (
    <motion.div
      className="stats-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="stats-card-header">
        <Icon size={24} className="stats-icon" />
        <span className="stats-label">{label}</span>
      </div>
      <div className="stats-card-content">
        {isLoading ? (
          <LoadingOutlined />
        ) : (
          <span className="stats-value">{value}</span>
        )}
        <span className={`stats-trend ${isPositive ? "positive" : "negative"}`}>
          {trend}
        </span>
      </div>
    </motion.div>
  );

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num?.toString();
  };

  const cardStyle = {
    minWidth: 250,
    marginRight: 16,
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
  };

  const containerStyle = {
    paddingBottom: 10,
  };

  const scrollContainerStyle = {
    display: "flex",
    overflowX: "auto",
    paddingBottom: "10px",
    gap: "0px",
    scrollbarWidth: "thin",
    scrollbarColor: "#d9d9d9 transparent",
  };

  const thumbnailContainerStyle = {
    position: "relative",
    cursor: "pointer",
  };

  const durationBadgeStyle = {
    position: "absolute",
    bottom: "8px",
    right: "8px",
    background: "rgba(0,0,0,0.8)",
    color: "white",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
  };

  const playOverlayStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "48px",
    color: "rgba(255,255,255,0.9)",
    transition: "opacity 0.2s",
  };

  const statsStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #f0f0f0",
  };

  const statItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "#666",
    fontSize: "13px",
  };

  const handleError = (e) => {
    e.target.onerror = null; // tránh loop nếu fallback lỗi
    e.target.src =
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYe8pY2GWIHYPfuxsUChCBHeVmX5vplQetsQ&s";
  };

  return (
    <div className={`stats-page ${isDarkMode ? "dark-mode" : ""}`}>
      <header className="stats-page-header">
        <div className="stats-header-left">
          <h1>Số liệu phân tích kênh</h1>
          <span className="stats-channel-name">School Studio</span>
        </div>
        <div className="stats-header-right">
          <div className="stats-export-dropdown">
            <button
              className="stats-export-button"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download size={18} />
              <span>Xuất báo cáo</span>
              <ChevronDown size={16} />
            </button>
            {showExportMenu && (
              <div className="stats-export-menu">
                <button>Xuất PDF</button>
                <button>Xuất Excel</button>
                <button>Xuất CSV</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="stats-time-range-container">
        <div className="stats-time-range-selector">
          {[
            { id: "7days", label: "7 ngày" },
            { id: "30days", label: "30 ngày" },
            { id: "90days", label: "90 ngày" },
            { id: "custom", label: "Tùy chỉnh" },
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => handleTimeRangeChange(range.id)}
              className={`stats-time-range-button ${
                timeRange === range.id ? "active" : ""
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
        {timeRange === "custom" && (
          <div className="stats-custom-date-picker">
            {/* Add your custom date picker component here */}
          </div>
        )}
      </div>

      <div className="stats-summary">
        {summaryStats.map((stat, index) => renderStatsCard(stat))}
      </div>

      <div style={containerStyle}>
        <div style={{ marginBottom: "20px" }}>
          <Title level={3} style={{ margin: 0, color: "#333" }}>
            Danh sách Video
          </Title>
        </div>

        <div style={scrollContainerStyle}>
          {videos &&
            videos.map((video) => (
              <Card
                key={video.videoHistoryID}
                style={cardStyle}
                bodyStyle={{ padding: "16px" }}
                hoverable
                cover={
                  <div style={thumbnailContainerStyle}>
                    <img
                      alt=""
                      src={getThumbnailUrl(extractVideoId(video.playbackUrl))}
                      style={{
                        width: "100%",
                        height: "157px",
                        objectFit: "cover",
                      }}
                      onError={handleError}
                    />
                    <div style={playOverlayStyle}>
                      <PlayCircleOutlined />
                    </div>
                    <div style={durationBadgeStyle}>
                      {video.duration.toFixed(2)}
                    </div>
                  </div>
                }
              >
                <div>
                  <Title
                    level={5}
                    style={{
                      margin: "0 0 0 0",
                      fontSize: "14px",
                      lineHeight: "1.4",
                      height: "20px",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {video?.program?.programName ?? "N/A"}
                  </Title>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div>
                      <Text
                        strong
                        style={{
                          fontSize: "13px",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          width: "80%",
                        }}
                        ellipsis
                      >
                        {video.description}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        <EyeOutlined style={{ marginRight: "4px" }} />
                        {formatNumber(video.viewCount)} lượt xem •{" "}
                        {dayjs(video.createdAt).format("DD-MM-YYYY HH:mm:ss")}
                      </Text>
                    </div>
                  </div>

                  <div style={statsStyle}>
                    <div style={statItemStyle}>
                      <HeartOutlined style={{ color: "#ff4d4f" }} />
                      <span>{formatNumber(video.likeCount)}</span>
                    </div>
                    <div style={statItemStyle}>
                      <ShareAltOutlined style={{ color: "#1890ff" }} />
                      <span>{formatNumber(video.shareCount)}</span>
                    </div>
                    <div style={statItemStyle}>
                      <CommentOutlined style={{ color: "#52c41a" }} />
                      <span>{formatNumber(video.commentCount)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>

        <style jsx>{`
          div::-webkit-scrollbar {
            height: 8px;
          }
          div::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb {
            background: #d9d9d9;
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: #bfbfbf;
          }
        `}</style>
      </div>

      <div className="stats-analytics-grid">
        <div className="stats-chart-card audience">
          <div className="stats-chart-header">
            <div className="stats-chart-title">
              <h3>Phân tích khán giả</h3>
              <Info size={16} className="stats-info-icon" />
            </div>
            <div className="stats-chart-filters">
              <button
                className={audienceTimeFilter === "hour" ? "active" : ""}
                onClick={() => setAudienceTimeFilter("hour")}
              >
                Theo giờ
              </button>
              <button
                className={audienceTimeFilter === "day" ? "active" : ""}
                onClick={() => setAudienceTimeFilter("day")}
              >
                Theo ngày
              </button>
            </div>
          </div>
          <div className="stats-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={
                  audienceTimeFilter === "hour"
                    ? audienceData
                    : audienceDataByDay
                }
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorAudience"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#4a90e2" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4a90e2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "10px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="viewers"
                  stroke="#4a90e2"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAudience)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stats-chart-card content-distribution">
          <div className="stats-chart-header">
            <div className="stats-chart-title">
              <h3>Phân bố nội dung</h3>
              <Info size={16} className="stats-info-icon" />
            </div>
            <div className="stats-chart-filters">
              <button
                className={contentDistFilter === "type" ? "active" : ""}
                onClick={() => setContentDistFilter("type")}
              >
                Theo loại
              </button>
              <button
                className={contentDistFilter === "topic" ? "active" : ""}
                onClick={() => setContentDistFilter("topic")}
              >
                Theo chủ đề
              </button>
            </div>
          </div>
          <div className="stats-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={
                  contentDistFilter === "type"
                    ? contentTypeData
                    : contentTypeByTopic
                }
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "10px",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {(contentDistFilter === "type"
                    ? contentTypeData
                    : contentTypeByTopic
                  ).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      style={{ filter: "brightness(1.1)" }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* <div className="stats-content-sections">
        <ContentSection
          title="Livestreams"
          items={popularContent.filter((c) => c.type === "Livestream")}
          icon={Radio}
        />
        <ContentSection
          title="Videos"
          items={popularContent.filter((c) => c.type === "Video")}
          icon={Video}
        />
        <ContentSection
          title="Bài viết"
          items={popularContent.filter((c) => c.type === "Bài viết")}
          icon={FileText}
        />
      </div> */}
    </div>
  );
};

export default StatisticsPage;
