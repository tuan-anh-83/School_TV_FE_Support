import React, { useEffect, useState } from "react";
import "./WatchHome.css";
import "swiper/css";
import "swiper/css/effect-fade";
import apiFetch from "../../config/baseAPI";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  AlertOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  NotificationOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { AlertCircleIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { extractVideoId } from "../../utils/image";

export default function WatchHome() {
  const [liveSchedules, setLiveSchedules] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  const [videoHistory, setVideoHistory] = useState([]);
  const [videoLoading, setVideoLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [bannerSlides, setBannerSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const generateBannerSlides = () => {
      const allContent = [
        ...(liveSchedules || []).map((item) => ({
          ...item,
          type: "Đang Phát Sóng",
          title: item.program?.title,
          channel: item.schoolChannelName,
          image: `https://picsum.photos/seed/${item.scheduleID}/1920/1080`,
        })),
        ...(upcomingSchedules || []).map((item) => ({
          ...item,
          type: "Sắp Diễn Ra",
          title: item.program?.programName,
          channel: item.program?.schoolChannel?.name,
          image: `https://picsum.photos/seed/${item.scheduleID}/1920/1080`,
        })),
        ...(videoHistory || []).map((item) => ({
          ...item,
          type: "Video Lưu Trữ",
          title: item.program?.programName,
          channel: item.program?.schoolChannel?.name,
          image: `https://picsum.photos/seed/${item.videoHistoryID}/1920/1080`,
        })),
        ...(posts || []).map((item) => ({
          ...item,
          type: "Bài Viết Cộng Đồng",
          title: item.title,
          channel: item.schoolChannel?.name,
          image: item.newsPictures?.$values?.[0]?.fileData
            ? `data:image/jpeg;base64,${item.newsPictures.$values[0].fileData}`
            : `https://picsum.photos/seed/${item.newsID}/1920/1080`,
        })),
      ];

      console.log(allContent);

      // Shuffle array and take 5 items
      const shuffled = [...allContent].sort(() => Math.random() - 0.5);
      setBannerSlides(shuffled.slice(0, 5));
    };

    // Generate slides when content is loaded
    if (!loading && !upcomingLoading && !videoLoading && !postsLoading) {
      generateBannerSlides();
    }
  }, [
    liveSchedules,
    upcomingSchedules,
    videoHistory,
    posts,
    loading,
    upcomingLoading,
    videoLoading,
    postsLoading,
  ]);

  useEffect(() => {
    const fetchLiveSchedules = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await apiFetch("Schedule/live-now", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch live schedules");

        const data = await response.json();
        setLiveSchedules(data.$values || []);
      } catch (error) {
        console.error("Error fetching live schedules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveSchedules();
  }, []);

  const convertToGMT7 = (dateString) => {
    if (!dateString) return new Date();
    const date = new Date(dateString);
    return new Date(date.getTime() + 7 * 60 * 60 * 1000);
  };

  const formatDateTime = (date) => {
    return date
      ? new Date(date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";
  };

  const calculateDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diff = endTime - startTime;

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    const fetchLiveSchedules = async () => {
      try {
        const response = await apiFetch("Schedule/live-now", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            Accept: "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setLiveSchedules(data.$values || []);
        }
      } catch (error) {
        console.error("Error fetching live schedules:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUpcomingSchedules = async () => {
      try {
        const response = await apiFetch("Schedule/timeline", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            Accept: "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUpcomingSchedules(data.data.Upcoming.$values || []);
        }
      } catch (error) {
        console.error("Error fetching upcoming schedules:", error);
      } finally {
        setUpcomingLoading(false);
      }
    };

    fetchLiveSchedules();
    fetchUpcomingSchedules();
  }, []);

  useEffect(() => {
    const fetchVideoHistory = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await apiFetch("VideoHistory/active", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch video history");

        const data = await response.json();
        setVideoHistory(data.$values.slice(0, 6) || []);
      } catch (error) {
        console.error("Error fetching video history:", error);
      } finally {
        setVideoLoading(false);
      }
    };

    fetchVideoHistory();
  }, []);

  const getTimeAgo = (dateString) => {
    const updatedAt = convertToGMT7(dateString);
    const now = new Date();
    const diff = now - updatedAt;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    return `${minutes} phút trước`;
  };

  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await apiFetch("News/combined", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch posts");

        const data = await response.json();
        setPosts(data.$values || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>School TV | Khám Phá Thế Giới Đại Học</title>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        rel="stylesheet"
      />
      <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" />
      <div className="main-content">
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          onSlideChange={(swiper) => setActiveSlide(swiper.activeIndex)}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          className="w-full h-full"
        >
          {bannerSlides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="watch-hero">
                <div className="watch-hero-overlay"></div>
                <div
                  className="watch-hero-image"
                  style={{
                    backgroundImage: `url("${slide.image}")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center right",
                    backgroundSize: "cover",
                  }}
                ></div>
                <div className="watch-hero-content">
                  <div className="subtitle">{slide.type}</div>
                  <h1>{slide.title}</h1>
                  <p>{slide.content}</p>
                  <div className="streaming-stats">
                    {slide.type === "Đang Phát Sóng" && (
                      <span className="live-indicator">
                        <span className="live-dot"></span> LIVE
                      </span>
                    )}
                    <span className="viewers">
                      <EyeOutlined /> 2.4K lượt xem
                    </span>
                    <span className="duration">
                      <ClockCircleOutlined />{" "}
                      {slide.type === "Đang Phát Sóng" ? "Bắt đầu" : "Đã đăng"}{" "}
                      45 phút trước
                    </span>
                  </div>
                  <div className="watch-hero-buttons">
                    <button className="btn btn-primary">
                      <span className="icon">
                        <PlayCircleOutlined />
                      </span>{" "}
                      Xem{" "}
                      {slide.type === "Đang Phát Sóng"
                        ? "live"
                        : slide.type === "Video Lưu Trữ"
                        ? "video"
                        : "bài viết"}
                    </button>
                    {slide.type === "Sắp Diễn Ra" && (
                      <button className="btn btn-secondary">
                        <span className="icon">
                          <AlertOutlined />
                        </span>{" "}
                        Nhận thông báo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="content-section">
          <div className="section-header">
            <h2>Đang phát sóng</h2>
            <Link to="liveList" className="view-all">
              Xem tất cả
            </Link>
          </div>

          {/* <div className="category-tabs">
            <div className="category-tab active">All</div>
            <div className="category-tab">Leadership</div>
            <div className="category-tab">Finance</div>
            <div className="category-tab">Technology</div>
            <div className="category-tab">Strategy</div>
          </div> */}

          <div className="content-grid">
            {loading ? (
              <div className="loading-placeholder">Đang tải...</div>
            ) : liveSchedules.length > 0 ? (
              <div className="horizontal-scroll-container">
                <div className="streams-grid horizontal-scroll">
                  {liveSchedules.slice(0, 5).map((schedule, index) => (
                    <Link
                      to={`/watchLive/${
                        schedule.program?.schoolChannel?.schoolChannelID || ""
                      }`}
                      data-aos="fade-up"
                      data-aos-delay={index * 100}
                      style={{ textDecoration: "none" }}
                      key={schedule.scheduleID}
                    >
                      <div className="content-card">
                        <div className="content-header">
                          <img
                            src={`https://picsum.photos/seed/${schedule.scheduleID}/300/180`}
                            alt="Content thumbnail"
                          />
                          <div className="card-badge">
                            <span className="live-indicator">
                              <span className="live-dot"></span> LIVE
                            </span>
                          </div>
                        </div>
                        <div className="content-info">
                          <h3>
                            {schedule.program?.title ||
                              "Chương trình không xác định"}
                          </h3>
                          <div className="content-meta">
                            <span>
                              {calculateDuration(
                                schedule.startTime,
                                schedule.endTime
                              )}
                            </span>
                            <span>April 24, 2025</span>
                          </div>
                          <div className="content-description">
                            Strategic approaches to navigating volatile market
                            conditions while maintaining growth.
                          </div>
                          <div className="content-tags">
                            <span className="tag">Strategy</span>
                            <span className="tag">Decision-making</span>
                          </div>
                          <div className="card-footer">
                            <div className="author">
                              <div className="author-avatar"></div>
                              <span>
                                {schedule.program?.schoolChannel?.name ||
                                  "Trường không xác định"}
                              </span>
                            </div>
                            <div className="views">3,421 views</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-live-container">
                <div className="no-live-content">
                  <i className="fas fa-satellite-dish fa-3x" />
                  <p>Không có chương trình trực tiếp nào đang hoạt động.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="secondary-section">
          <div className="section-header">
            <h2>Sắp diễn ra</h2>
            <Link to="/liveList" className="view-all">
              Xem tất cả
            </Link>
          </div>

          <div className="content-grid">
            {upcomingLoading ? (
              <div className="loading-placeholder">Đang tải...</div>
            ) : upcomingSchedules.length > 0 ? (
              <div className="horizontal-scroll-container">
                <div className="events-grid horizontal-scroll">
                  {upcomingSchedules.map((schedule, index) => (
                    <Link
                      data-aos="fade-up"
                      data-aos-delay={index * 100}
                      key={schedule.scheduleID}
                      to={
                        schedule?.program &&
                        `/program/${schedule?.program?.programID}`
                      }
                    >
                      <div className="content-card">
                        <div className="content-header">
                          <img
                            src={`https://picsum.photos/seed/${schedule.scheduleID}/300/180`}
                            alt="Content thumbnail"
                          />
                        </div>
                        <div className="content-info">
                          <h3>
                            {schedule?.program?.programName ??
                              "Chương trình không xác định"}
                          </h3>
                          <div className="content-meta">
                            <span>{` ${Math.floor(
                              (schedule.endTime - schedule.startTime) / 3600000
                            )}h 
                        ${Math.floor(
                          ((schedule.endTime - schedule.startTime) % 3600000) /
                            60000
                        )}m`}</span>
                            <span>
                              {" "}
                              {formatDateTime(
                                schedule?.startTime ?? new Date()
                              )}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress"
                              style={{ width: "68%" }}
                            ></div>
                          </div>
                          <div className="card-footer">
                            <div className="author">
                              <div className="author-avatar"></div>
                              <span>
                                {schedule?.program?.schoolChannel?.name ??
                                  "Trường không xác định"}
                              </span>
                            </div>
                            <div className="views">2,954 views</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-live-container">
                <div className="no-live-content">
                  <i className="fas fa-calendar-times fa-3x" />
                  <p>Không có lịch phát sóng nào sắp diễn ra.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>Video Lưu Trữ</h2>
            <Link to="/archive" className="view-all">
              Xem tất cả
            </Link>
          </div>

          <div className="content-grid">
            {videoLoading ? (
              <div className="loading-placeholder">Đang tải...</div>
            ) : videoHistory.length > 0 ? (
              <div className="horizontal-scroll-container">
                <div className="videos-grid horizontal-scroll">
                  {videoHistory.map((video, index) => (
                    <Link
                      key={video.videoHistoryID}
                      data-aos="fade-up"
                      data-aos-delay={index * 100}
                      style={{ textDecoration: "none" }}
                    >
                      <div className="content-card">
                        <div className="content-header">
                          <img
                            src={video.playbackUrl ? `https://videodelivery.net/${extractVideoId(video.playbackUrl)}/thumbnails/thumbnail.jpg` : `https://picsum.photos/seed/${video.videoHistoryID}/300/180`}
                            alt="Content thumbnail"
                          />
                        </div>
                        <div className="content-info">
                          <h3>
                            {video.program?.programName ??
                              "Chương trình không xác định"}
                          </h3>
                          <div className="content-meta">
                            <span>Series</span>
                            <span>{formatDateTime(video.updatedAt)}</span>
                          </div>
                          <div className="content-description">
                            Annual gathering of finance leaders discussing
                            emerging market trends and opportunities.
                          </div>
                          <div className="content-tags">
                            <span className="tag">Finance</span>
                            <span className="tag">Global</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-live-container">
                <div className="no-live-content">
                  <i className="fas fa-video-slash fa-3x" />
                  <p>Không có Video Lưu Trữ nào.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
