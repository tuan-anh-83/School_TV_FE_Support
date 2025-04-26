import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import apiFetch from "../../config/baseAPI";
import styles from "./program-detail.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBroadcastTower,
  faPlay,
  faClock,
  faCalendarAlt,
  faSchool,
  faLink,
  faInfoCircle,
  faSpinner,
  faShare,
  faHeart,
  faExclamationCircle,
  faMapMarkerAlt,
  faUsers,
  faChartLine,
  faTimes,
  faCheckCircle,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { ClockCircleOutlined, HeartOutlined, PlayCircleOutlined, ShareAltOutlined } from "@ant-design/icons";
import { createAvatarText } from "../../utils/text";

const ProgramDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [textColor, setTextColor] = useState("light");
  const heroImageRef = useRef(null);
  const [relatedPrograms, setRelatedPrograms] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState(null);

  useEffect(() => {
    if (program?.thumbnail && heroImageRef.current) {
      checkImageBrightness(heroImageRef.current);
    }
  }, [program?.thumbnail]);

  // Add this utility function at the top of your file
  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;

    // Try to find a space to break at
    const spaceIndex = text.lastIndexOf(" ", maxLength);

    // If no space found or the space is too far from maxLength, just cut at maxLength
    const truncateAt =
      spaceIndex > 0 && maxLength - spaceIndex < 20 ? spaceIndex : maxLength;

    return `${text.substring(0, truncateAt)}...`;
  };

  // Create a custom hook for responsive truncation
  const useResponsiveTruncate = () => {
    const [maxLength, setMaxLength] = useState(50);

    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth < 768) {
          setMaxLength(20);
        } else if (window.innerWidth < 1024) {
          setMaxLength(30);
        } else {
          setMaxLength(50);
        }
      };

      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return maxLength;
  };

  const maxLength = useResponsiveTruncate();

  useEffect(() => {
    const fetchRelatedPrograms = async () => {
      if (!program?.schoolChannelID) return;

      try {
        setRelatedLoading(true);
        const response = await apiFetch(
          `Program/by-channel/${program.schoolChannelID}`
        );

        if (!response.ok)
          throw new Error("Không thể tải chương trình liên quan");

        const data = await response.json();
        setRelatedPrograms(data.data.$values || []);
      } catch (err) {
        setRelatedError(err.message);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelatedPrograms();
  }, [program?.schoolChannelID]);

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const cardTransition = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
  };

  useEffect(() => {
    fetchProgramData();
  }, [id]);

  const fetchProgramData = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`Program/${id}`);

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "Chương trình không tồn tại"
            : "Đã xảy ra lỗi khi tải thông tin chương trình"
        );
      }

      const data = await response.json();
      setProgram(data.data);
      await checkFollowStatus(data.data.programID);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async (programId) => {
    const accountId = localStorage.getItem("userData")?.accountID;
    if (!accountId) return;

    try {
      const response = await apiFetch(
        `ProgramFollow/check/${accountId}/${programId}`
      );
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleFollow = async () => {
    try {
      const accountId = localStorage.getItem("userData")?.accountID;
      if (!accountId) {
        toast.warning("Vui lòng đăng nhập để theo dõi chương trình");
        return;
      }

      const response = await apiFetch("ProgramFollow", {
        method: "POST",
        body: JSON.stringify({
          accountId,
          programId: program.programID,
        }),
      });

      if (response.ok) {
        setIsFollowing((prev) => !prev);
        toast.success(
          isFollowing
            ? "Đã hủy theo dõi chương trình"
            : "Đã theo dõi chương trình thành công"
        );
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi thực hiện thao tác");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: program.programName,
          text: program.description,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      setShareModalOpen(true);
    }
  };

  const ShareModal = ({ isOpen, onClose, program }) => {
    const [copied, setCopied] = useState(false);
    const shareUrl = window.location.href;

    const handleCopy = () => {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>Chia sẻ chương trình</h3>
                <button onClick={onClose}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className={styles.shareOptions}>
                <button onClick={handleCopy} className={styles.shareOption}>
                  <FontAwesomeIcon icon={faLink} />
                  {copied ? "Đã sao chép!" : "Sao chép liên kết"}
                </button>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    shareUrl
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.shareOption}
                >
                  <FontAwesomeIcon icon={faShareNodes} />
                  Chia sẻ qua Facebook
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  if (loading) {
    return (
      <motion.div
        className={styles.loadingContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Đang tải thông tin chương trình...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className={styles.errorContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <FontAwesomeIcon icon={faExclamationCircle} size="3x" />
        <h2>{error}</h2>
        <button onClick={() => navigate("/liveList")}>
          Quay lại danh sách chương trình
        </button>
      </motion.div>
    );
  }

  const StatusIndicator = ({ schedule }) => {
    if (!schedule) {
      return (
        <div
          className={styles.statusIndicator}
          style={{ background: "var(--text-secondary)" }}
        >
          <FontAwesomeIcon icon={faInfoCircle} />
          <span>Trạng thái không xác định</span>
        </div>
      );
    }

    let statusText;
    let icon;
    let bgColor;

    const getStatus = () => {
      try {
        // Live stream is currently active
        if (schedule.liveStreamStarted && !schedule.liveStreamEnded)
          return "live";

        // Special case: Ready status but stream has ended
        if (schedule.status === "Ready" && schedule.liveStreamEnded)
          return "ended";

        // Ended status
        if (schedule.status === "Ended") return "ended";

        // All other statuses (Ready, Pending, LateStart, EndedEarly) are considered upcoming
        return "upcoming";
      } catch (error) {
        console.error("Error determining status:", error);
        return "unknown";
      }
    };

    const status = getStatus();

    switch (status) {
      case "live":
        statusText = "Đang phát sóng";
        icon = faBroadcastTower;
        bgColor = "var(--primary-color)";
        break;
      case "ended":
        statusText = "Đã phát";
        icon = faCheckCircle;
        bgColor = "var(--primary-color)";
        break;
      case "upcoming":
        statusText = "Chờ phát";
        icon = faClock;
        bgColor = "var(--primary-color)";
        break;
      default:
        statusText = "Trạng thái không xác định";
        icon = faInfoCircle;
        bgColor = "var(--primary-color)";
    }

    return (
      <div className={styles.statusIndicator} style={{ background: bgColor }}>
        <FontAwesomeIcon icon={icon} />
        <span>{statusText}</span>
      </div>
    );
  };

  const convertUTCToGMT7 = (utcDateString) => {
    const date = new Date(utcDateString);
    date.setHours(date.getHours() + 7); // Add 7 hours for GMT+7
    return date;
  };

  return (
    <motion.div
      className={styles.programDetailContainer}
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Hero Section */}
      <div className={styles.profileContainer}>
        <div className={styles.bannerImage}>
          <p className={styles.title}>{truncateText(program.programName, maxLength)}</p>
          <img
            className={styles.profileImageItem}
            src="https://images.unsplash.com/photo-1625496015236-96a3847ccd11?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt=""
          />
        </div>
        <div className={styles.profileCard}>
          <div className={styles.profileImage}>
            <div className={styles.profileImageBag}>
              {createAvatarText(program.schoolChannel?.name ?? "A")}
            </div>
            <div className={styles.onlineStatus}></div>
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.profileInfoContainer}>
              <div className={styles.profileName}>
                {program.schoolChannel?.name}
              </div>
              <div
                className={styles.liveContainer}
              >
                <span className={styles.liveDot}></span>
                <p>Upcomming</p>-
                <ClockCircleOutlined />
                <p>Còn 20 giờ</p>
              </div>
            </div>
            <div className={styles.profileStats}>
              {program.followCount || 0} người theo dõi · 120 video · 35 người đang chờ
            </div>
          </div>
          <div className={styles.actionButtons}>
            <button className={styles.messageThirdBtn}>Xem live</button>
            <button className={styles.messageBtn}>Theo dõi</button>
            <button className={styles.messageSecondBtn} onClick={handleShare}>
              Chia sẻ
            </button>
          </div>
          <div className={styles.actionButtonsMobile}>
            <button className={styles.messageThirdBtn}><PlayCircleOutlined /></button>
            <button className={styles.messageBtn}><HeartOutlined /></button>
            <button className={styles.messageSecondBtn} onClick={handleShare}>
              <ShareAltOutlined />
            </button>
          </div>
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className={styles.navigationTabs}>
        {["overview", "schedule", "related"].map((tab) => (
          <button
            key={tab}
            className={`${styles.tabButton} ${
              activeTab === tab ? styles.active : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "overview" && "Tổng quan"}
            {tab === "schedule" && "Lịch phát sóng"}
            {tab === "related" && "Liên quan"}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "overview" && (
            <div className={styles.overviewSection}>
              <div className={styles.programInfo}>
                <h2>Thông tin chi tiết</h2>
                <p>{program.title || "Chưa có mô tả chi tiết"}</p>

                <div className={styles.infoGrid}>
                  <motion.div
                    className={styles.infoCard}
                    variants={cardTransition}
                  >
                    <div className={styles.icon}>
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                    </div>
                    <div className={styles.content}>
                      <h4>Địa điểm</h4>
                      <p>{program.schoolChannel?.address || "Chưa cập nhật"}</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className={styles.infoCard}
                    variants={cardTransition}
                  >
                    <div className={styles.icon}>
                      <FontAwesomeIcon icon={faLink} />
                    </div>
                    <div className={styles.content}>
                      <h4>Website</h4>
                      <a
                        href={program.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {program.link || "Chưa cập nhật"}
                      </a>
                    </div>
                  </motion.div>

                  <motion.div
                    className={styles.infoCard}
                    variants={cardTransition}
                  >
                    <div className={styles.icon}>
                      <FontAwesomeIcon icon={faChartLine} />
                    </div>
                    <div className={styles.content}>
                      <h4>Thống kê</h4>
                      <p>{program.viewCount || 0} lượt xem</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "schedule" && (
            <div className={styles.scheduleSection}>
              <h2>Lịch phát sóng</h2>
              {program.schedules.$values.length > 0 ? (
                <div className={styles.scheduleList}>
                  {program.schedules.$values
                    .sort(
                      (a, b) => new Date(a.startTime) - new Date(b.startTime)
                    )
                    .map((schedule, index) => (
                      <motion.div
                        key={schedule.scheduleID}
                        className={styles.scheduleCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className={styles.scheduleTime}>
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          {convertUTCToGMT7(schedule.startTime).toLocaleString(
                            "vi-VN"
                          )}
                        </div>
                        <StatusIndicator schedule={schedule} />
                      </motion.div>
                    ))}
                </div>
              ) : (
                <div className={styles.noSchedule}>
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <p>Chưa có lịch phát sóng được cập nhật</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "related" && (
            <div className={styles.scheduleSection}>
              <h2>Chương trình liên quan</h2>
              {relatedLoading ? (
                <div className={styles.loadingContainer}>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <p>Đang tải chương trình liên quan...</p>
                </div>
              ) : relatedError ? (
                <div className={styles.noSchedule}>
                  <FontAwesomeIcon icon={faExclamationCircle} />
                  <p>{relatedError}</p>
                </div>
              ) : (
                <div className={styles.scheduleList}>
                  {relatedPrograms.map((related, index) => (
                    <motion.div
                      key={related.programID}
                      className={styles.scheduleCard}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => navigate(`/program/${related.programID}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <div
                        className={`${styles.scheduleTime} ${styles.truncateContainer}`}
                      >
                        <FontAwesomeIcon icon={faPlay} />
                        <span
                          className={styles.truncateText}
                          title={related.programName}
                        >
                          {truncateText(related.programName, maxLength)}
                        </span>
                      </div>
                      <div className={styles.metaItem}>
                        <FontAwesomeIcon icon={faUsers} />
                        {related.followCount || 0} người theo dõi
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        program={program}
      />
    </motion.div>
  );
};

export default ProgramDetailPage;
