import React, { useEffect, useState } from "react";
import "./WatchHome.css";
import "swiper/css";
import "swiper/css/effect-fade";
import apiFetch from "../../config/baseAPI";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import Swiper from "swiper";
import dayjs from "dayjs";

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
    const fetchSchedules = async () => {
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
          setVideoHistory(data.data.Replay.$values || []);
          setLiveSchedules(data.data.LiveNow.$values || []);
        }
      } catch (error) {
        console.error("Error fetching upcoming schedules:", error);
      } finally {
        setUpcomingLoading(false);
        setVideoLoading(false);
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  useEffect(() => {
    if (bannerSlides.length > 0) {
      const swiper = new Swiper(".swiper", {
        modules: [Navigation, Pagination, Autoplay],
        // Optional parameters
        loop: true,

        // Enable autoplay
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
        },

        // Enable pagination
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },

        // Navigation arrows
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
      });

      // Cleanup
      return () => {
        if (swiper) swiper.destroy();
      };
    }
  }, [bannerSlides]);

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
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css"
      />
      <script src="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js"></script>
      <section className="banner-section">
        <div className="swiper">
          <div className="swiper-wrapper">
            {bannerSlides.map((slide, index) => (
              <div className="swiper-slide" key={index}>
                <img
                  src={"https://murraysinteriors.com.au/wp-content/uploads/2018/09/dummy-banner.jpg "}
                  alt={slide.title}
                  className="banner-image"
                />
                {/* <div className="banner-content">
                  <div className="banner-badge">{slide.type}</div>
                  <h2>{slide.title || "Không có tiêu đề"}</h2>
                  <p>{slide.channel || "Không xác định"}</p>
                </div> */}
              </div>
            ))}
          </div>
          <div className="swiper-pagination"></div>
          <div className="swiper-button-next"></div>
          <div className="swiper-button-prev"></div>
        </div>
      </section>
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Đang Phát Sóng</h2>
          <Link to="/liveList" className="see-all">
            Xem tất cả <i className="fas fa-arrow-right" />
          </Link>
        </div>

        {loading ? (
          <div className="loading-placeholder">Đang tải...</div>
        ) : liveSchedules.length > 0 ? (
          <div className="horizontal-scroll-container">
            <div className="streams-grid horizontal-scroll">
              {liveSchedules.slice(0, 5).map((schedule) => (
                <Link
                  to={`/watchLive/${
                    schedule.program?.schoolChannel?.schoolChannelID || ""
                  }`}
                  key={schedule.scheduleID}
                >
                  <div className="stream-card">
                    <div className="stream-thumbnail">
                      <img
                        src={
                          schedule.thumbnail ||
                          `https://picsum.photos/seed/${schedule.scheduleID}/300/180`
                        }
                        alt="Stream thumbnail"
                      />
                      <div className="live-badge-home">LIVE</div>
                    </div>
                    <div className="stream-info">
                      <h3 className="stream-title">
                        {schedule.program?.title ||
                          "Chương trình không xác định"}
                      </h3>
                      <div className="stream-meta">
                        <span>
                          {schedule.program?.schoolChannel?.name ||
                            "Trường không xác định"}
                        </span>
                        <span>
                          <i className="fas fa-clock" />{" "}
                          {calculateDuration(
                            schedule.startTime,
                            schedule.endTime
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              <Link to="/liveList" className="see-all-card">
                <i className="fas fa-tv" />
                <p>Bấm vào Xem tất cả để tiếp tục khám phá bạn nhé!</p>
              </Link>
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
      </section>
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Sắp Diễn Ra</h2>
          <Link to="/LiveList" className="see-all">
            Xem tất cả <i className="fas fa-arrow-right" />
          </Link>
        </div>

        {upcomingLoading ? (
          <div className="loading-placeholder">Đang tải...</div>
        ) : upcomingSchedules.length > 0 ? (
          <div className="horizontal-scroll-container">
            <div className="events-grid horizontal-scroll">
              {upcomingSchedules.map((schedule, index) => {
                const startTime = schedule.startTime;
                const endTime = schedule.endTime;
                const now = dayjs(new Date());

                const program = schedule.program || {};
                const programName =
                  program.programName || "Chương trình không xác định";
                const channelName =
                  program.schoolChannel?.name || "Trường không xác định";
                const programID = program.programID || "";
                const totalSeconds = dayjs(startTime).diff(now, "second");
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;

                return (
                  <div className="event-card" data-aos="fade-up" key={index}>
                    <div className="event-date">
                      <i className="far fa-calendar" />
                      {formatDateTime(startTime)}
                    </div>
                    <h3 className="event-title">
                      <div className="title-text">{programName}</div>
                    </h3>
                    <p>{channelName}</p>
                    <div className="event-meta">
                      <span>
                        <i className="fas fa-clock" />
                        {totalSeconds < 0
                          ? "Đang diễn ra"
                          : `${minutes}m ${seconds}s`}
                      </span>
                    </div>
                    {programID && (
                      <Link to={`/program/${programID}`}>
                        <button className="reminder-btn">
                          <i className="fas fa-info-circle" /> Xem Chi Tiết
                        </button>
                      </Link>
                    )}
                  </div>
                );
              })}
              <Link to="/LiveList" className="see-all-card">
                <i className="fas fa-calendar-alt" />
                <p>Bấm vào Xem tất cả để tiếp tục khám phá bạn nhé!</p>
              </Link>
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
      </section>
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Video Lưu Trữ</h2>
          <Link to="/archive" className="see-all">
            Xem tất cả <i className="fas fa-arrow-right" />
          </Link>
        </div>

        {videoLoading ? (
          <div className="loading-placeholder">Đang tải...</div>
        ) : videoHistory.length > 0 ? (
          <div className="horizontal-scroll-container">
            <div className="videos-grid horizontal-scroll">
              {videoHistory
                .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                .map((video, index) => {
                  const updatedAt = convertToGMT7(video.updatedAt);

                  const programName =
                    video.program?.programName || "Chương trình không xác định";
                  const channelName =
                    video.program?.schoolChannel?.name ||
                    "Trường không xác định";
                  const channelLogo =
                    video.program?.schoolChannel?.logoUrl ||
                    `https://picsum.photos/seed/${video.videoHistoryID}/100/100`;

                  return (
                    <div className="video-card" key={index} data-aos="fade-up">
                      <div className="video-thumbnail">
                        <img
                          src={
                            video.thumbnail ||
                            `https://picsum.photos/seed/${video.videoHistoryID}/300/180`
                          }
                          alt="Video thumbnail"
                        />
                      </div>
                      <div className="video-info">
                        <div className="video-header">
                          <h3 className="video-title">{programName}</h3>
                          <div className="video-meta">
                            <div className="channel-info">
                              <img
                                src={channelLogo}
                                alt="University avatar"
                                className="university-avatar"
                              />
                              <span className="university-name">
                                {channelName}
                              </span>
                            </div>
                            <div className="video-time">
                              <i className="far fa-clock" />
                              {formatDateTime(updatedAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              <Link to="/archive" className="see-all-card">
                <i className="fas fa-video" />
                <p>Bấm vào Xem tất cả để tiếp tục khám phá bạn nhé!</p>
              </Link>
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
      </section>
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Bài Viết Cộng Đồng</h2>
          <Link to="/communityPost" className="see-all">
            Xem tất cả <i className="fas fa-arrow-right" />
          </Link>
        </div>

        {postsLoading ? (
          <div className="loading-placeholder">Đang tải...</div>
        ) : posts.length > 0 ? (
          <div className="horizontal-scroll-container">
            <div className="posts-grid horizontal-scroll">
              {posts.slice(0, 3).map((post, index) => (
                <div className="post-card" key={index} data-aos="fade-up">
                  <div className="post-header">
                    <img
                      src={
                        post.schoolChannel?.logoUrl ||
                        `https://picsum.photos/seed/${post.newsID}/32/32`
                      }
                      alt="University avatar"
                      className="university-avatar"
                    />
                    <div className="post-meta">
                      <h3 className="university-name">
                        {post.schoolChannel?.name || "Trường không xác định"}
                      </h3>
                      <span className="post-time">
                        {getTimeAgo(post.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="post-content">
                    <div className="post-text">
                      <h4
                        style={{
                          fontWeight: "600",
                          marginBottom: "0.5rem",
                          display: "-webkit-box",
                          WebkitLineClamp: "1",
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {post.title}
                      </h4>
                      <p>{post.content}</p>
                    </div>
                    {post.newsPictures &&
                      post.newsPictures.$values &&
                      post.newsPictures.$values.length > 0 && (
                        <div className="post-image-container">
                          <img
                            src={`data:image/jpeg;base64,${post.newsPictures.$values[0].fileData}`}
                            alt={post.title}
                          />
                        </div>
                      )}
                    <div className="post-actions">
                      <button>
                        <i className="far fa-heart" />{" "}
                        {Math.floor(Math.random() * 1000)}
                      </button>
                      <button>
                        <i className="far fa-comment" />{" "}
                        {Math.floor(Math.random() * 100)}
                      </button>
                      <button>
                        <i className="far fa-share-square" /> Chia sẻ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <Link to="/communityPost" className="see-all-card">
                <i className="fas fa-newspaper" />
                <p>Bấm vào Xem tất cả để tiếp tục khám phá bạn nhé!</p>
              </Link>
            </div>
          </div>
        ) : (
          <div className="no-live-container">
            <div className="no-live-content">
              <i className="fas fa-newspaper fa-3x" />
              <p>Không có Bài Viết Cộng Đồng nào được tìm thấy.</p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
