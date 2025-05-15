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
import {
  Calendar,
  TrendingUp,
  Users,
  Eye,
  Clock,
  Video,
  Radio,
  ThumbsUp,
  MessageCircle,
  Share2,
  DollarSign,
  Award,
  Zap,
  TrendingDown,
  Download,
  Filter,
  Settings,
  Info,
  ChevronDown,
  Moon,
  Sun,
  FileText,
  ChevronRight,
} from "lucide-react";
import "./StatisticsPage.css";
import { toast } from "react-toastify";
import { LoadingOutlined } from "@ant-design/icons";
import apiFetch from "../../config/baseAPI";

const StatisticsPage = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("7days");
  const [selectedMetric, setSelectedMetric] = useState("views");
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dateRange, setDateRange] = useState("7");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [audienceTimeFilter, setAudienceTimeFilter] = useState("hour");
  const [contentDistFilter, setContentDistFilter] = useState("type");
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

  useEffect(() => {
    // Apply dark mode class
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  const viewData = [
    {
      date: "20/11",
      views: 2400,
      likes: 150,
      comments: 45,
      shares: 20,
      revenue: 120,
      watchTime: 1200,
    },
    {
      date: "21/11",
      views: 1398,
      likes: 98,
      comments: 32,
      shares: 15,
      revenue: 85,
      watchTime: 980,
    },
    {
      date: "22/11",
      views: 3800,
      likes: 220,
      comments: 65,
      shares: 40,
      revenue: 190,
      watchTime: 1500,
    },
    {
      date: "23/11",
      views: 3908,
      likes: 245,
      comments: 78,
      shares: 35,
      revenue: 195,
      watchTime: 1600,
    },
    {
      date: "24/11",
      views: 4800,
      likes: 300,
      comments: 90,
      shares: 50,
      revenue: 240,
      watchTime: 2000,
    },
    {
      date: "25/11",
      views: 3800,
      likes: 280,
      comments: 85,
      shares: 45,
      revenue: 190,
      watchTime: 1800,
    },
    {
      date: "26/11",
      views: 4300,
      likes: 320,
      comments: 95,
      shares: 55,
      revenue: 215,
      watchTime: 1900,
    },
  ];

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

  const COLORS = ["#4a90e2", "#ff4757", "#28a745"];

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

  const analytics = async (channelId, dateRange) => {
    if (!channelId) {
      toast.error("ID kênh không hợp lệ!");
      return;
    }
    try {
      setIsLoading(true);
      const response = await apiFetch(
        `Analytics/analys-by-channel?channelId=${channelId}&dateRange=${dateRange}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Kênh không tồn tại!");
      }
      const data = await response.json();
      if (!data) {
        throw new Error("Không có dữ liệu kênh!");
      }
      const formattedStats = formatSummaryStats(data);
      setSummaryStats(formattedStats);
    } catch (error) {
      console.error("Error checking channel:", error);
      toast.error(error.message || "Có lỗi xảy ra khi kiểm tra kênh!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (channel && channel.$values) {
      analytics(channel.$values[0].schoolChannelID, dateRange);
    }
    else {
      setIsLoading(false);
    }
  }, [channel, dateRange]);

  const popularContent = [
    // Livestreams
    {
      id: 1,
      title: "Lễ tốt nghiệp khoa CNTT 2023",
      views: "15.2K",
      likes: "1.8K",
      comments: "342",
      type: "Livestream",
      duration: "2:45:30",
      thumbnail: "https://picsum.photos/800/450?random=1",
      performance: "Hiệu suất cao hơn bình thường",
    },
    {
      id: 2,
      title: "Hội thảo: Trí tuệ nhân tạo trong Giáo dục",
      views: "12.8K",
      likes: "1.5K",
      comments: "256",
      type: "Livestream",
      duration: "1:30:15",
      thumbnail: "https://picsum.photos/800/450?random=2",
      performance: "Đang tăng trưởng",
    },
    {
      id: 3,
      title: "Talkshow: Định hướng nghề nghiệp CNTT 2024",
      views: "10.5K",
      likes: "980",
      comments: "185",
      type: "Livestream",
      duration: "1:15:45",
      thumbnail: "https://picsum.photos/800/450?random=3",
      performance: "Hiệu suất trung bình",
    },
    // Videos
    {
      id: 4,
      title: "Hướng dẫn đăng ký học phần HK2 2023-2024",
      views: "18.3K",
      likes: "2.1K",
      comments: "425",
      type: "Video",
      duration: "15:24",
      thumbnail: "https://picsum.photos/800/450?random=4",
      performance: "Hiệu suất cao hơn bình thường",
    },
    {
      id: 5,
      title: "Review chương trình đào tạo ngành KTPM",
      views: "14.7K",
      likes: "1.6K",
      comments: "298",
      type: "Video",
      duration: "22:15",
      thumbnail: "https://picsum.photos/800/450?random=5",
      performance: "Đang tăng trưởng",
    },
    {
      id: 6,
      title: "Giới thiệu cơ sở vật chất phòng lab mới",
      views: "11.9K",
      likes: "1.3K",
      comments: "215",
      type: "Video",
      duration: "18:30",
      thumbnail: "https://picsum.photos/800/450?random=6",
      performance: "Hiệu suất trung bình",
    },
    // Bài viết
    {
      id: 7,
      title: "Thông báo lịch thi cuối kỳ HK1 2023-2024",
      views: "22.4K",
      likes: "1.9K",
      comments: "456",
      type: "Bài viết",
      thumbnail: "https://picsum.photos/800/450?random=7",
      performance: "Hiệu suất cao hơn bình thường",
    },
    {
      id: 8,
      title: "Kế hoạch học tập và giảng dạy năm 2024",
      views: "19.8K",
      likes: "1.7K",
      comments: "385",
      type: "Bài viết",
      thumbnail: "https://picsum.photos/800/450?random=8",
      performance: "Đang tăng trưởng",
    },
    {
      id: 9,
      title: "Thông báo học bổng khoa CNTT 2024",
      views: "17.2K",
      likes: "1.4K",
      comments: "312",
      type: "Bài viết",
      thumbnail: "https://picsum.photos/800/450?random=9",
      performance: "Hiệu suất trung bình",
    },
  ];

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

  const metrics = [
    { key: "views", label: "Lượt xem", color: "#4a90e2" },
    { key: "watchTime", label: "Thời gian xem", color: "#ff4757" },
    { key: "likes", label: "Lượt thích", color: "#28a745" },
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

  const ContentSection = ({ title, items, icon: Icon }) => (
    <div className="stats-content-section">
      <div className="stats-section-header">
        <div className="stats-section-title">
          <Icon size={20} />
          <h3>{title}</h3>
        </div>
        <button className="stats-view-all-button">
          Xem tất cả
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="stats-content-grid">
        {items.map((content) => (
          <ContentCard key={content.id} content={content} />
        ))}
      </div>
    </div>
  );

  const ContentCard = ({ content }) => (
    <div className="stats-content-card">
      <div className="stats-thumbnail-container">
        <img src={content.thumbnail} alt={content.title} />
        {content.duration && (
          <span className="stats-duration">{content.duration}</span>
        )}
        <div className="stats-content-type">{content.type}</div>
      </div>
      <div className="stats-content-info">
        <h4>{content.title}</h4>
        <div className="stats-metrics">
          <span>
            <Eye size={14} /> {content.views}
          </span>
          <span>
            <ThumbsUp size={14} /> {content.likes}
          </span>
          <span>
            <MessageCircle size={14} /> {content.comments}
          </span>
        </div>
        <div className="stats-performance">
          <Zap size={14} />
          <span>{content.performance}</span>
        </div>
      </div>
    </div>
  );

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

      <div className="stats-performance-chart-section">
        <div className="stats-chart-card performance">
          <div className="stats-chart-header">
            <div className="stats-chart-title">
              <h3>Hiệu suất tổng quan</h3>
              <Info size={16} className="stats-info-icon" />
            </div>
          </div>

          <div className="stats-metric-selector-container">
            <div className="stats-metric-selector">
              {metrics.map((metric) => (
                <button
                  key={metric.key}
                  className={`stats-metric-button ${
                    selectedMetric === metric.key ? "active" : ""
                  }`}
                  onClick={() => setSelectedMetric(metric.key)}
                >
                  {metric.key === "views" && <Eye size={16} />}
                  {metric.key === "watchTime" && <Clock size={16} />}
                  {metric.key === "likes" && <ThumbsUp size={16} />}
                  {metric.key === "revenue" && <DollarSign size={16} />}
                  {metric.label}
                </button>
              ))}
            </div>
          </div>

          <div className="stats-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={viewData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={
                        metrics.find((m) => m.key === selectedMetric)?.color
                      }
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={
                        metrics.find((m) => m.key === selectedMetric)?.color
                      }
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
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
                  dataKey={selectedMetric}
                  stroke={metrics.find((m) => m.key === selectedMetric)?.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMetric)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
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

      <div className="stats-content-sections">
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
      </div>
    </div>
  );
};

export default StatisticsPage;
