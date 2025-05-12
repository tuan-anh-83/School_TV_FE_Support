import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import YouTube from "react-youtube";
import AOS from "aos";
import "aos/dist/aos.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./WatchLive.css";
import { ThemeContext } from "../../context/ThemeContext";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../../config/baseAPI";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import VideoComment from "../watch-program/VideoComment";
import { Timeline } from "antd";
import { startAdsHub, stopAdsHub } from "../../utils/AdsHub";

dayjs.extend(utc);
dayjs.extend(timezone);

const WatchLive = () => {
  const { theme } = useContext(ThemeContext);
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [currentDate, setCurrentDate] = useState(
    dayjs().tz("Asia/Ho_Chi_Minh")
  );

  const [logicDate, setLogicDate] = useState(
    currentDate.format("YYYY-MM-DD") || ""
  );
  const [displaySchedule, setDisplaySchedule] = useState([]);
  const [displayIframeUrl, setDisplayIframeUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoHistoryId, setVideoHistoryId] = useState(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const playerRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const isToday = currentDate.isSame(dayjs(), "day");
  const displayDate = currentDate.format("DD/MM/YYYY");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [likes, setLikes] = useState([]);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [likeError, setLikeError] = useState(null);
  const [channelInfo, setChannelInfo] = useState(null);
  const [followedPrograms, setFollowedPrograms] = useState([]);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [followError, setFollowError] = useState(null);
  const [currentProgram, setCurrentProgram] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [ads, setAds] = useState([]);
  const [currentAd, setCurrentAd] = useState(null);
  const [isPlayingAd, setIsPlayingAd] = useState(false);

  const getAccountId = () => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData).accountID : null;
  };

  if (!localStorage.getItem("authToken")) {
    return (
      <div className="main-container" style={{ background: "var(--bg-color)" }}>
        <div className="auth-required">
          <h3>Bạn cần đăng nhập để xem nội dung này</h3>
          <p>
            Vui lòng đăng nhập để tiếp tục xem chương trình trực tiếp và tham
            gia trò chuyện.
          </p>
          <button onClick={() => navigate("/login")}>Đăng nhập ngay</button>
        </div>
      </div>
    );
  }

  const fetchFollowedPrograms = useCallback(async () => {
    const accountId = getAccountId();
    if (!accountId) return;

    try {
      const response = await apiFetch(`ProgramFollow/account/${accountId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          Accept: "application/json",
        },
      });

      if (response.status === 500) {
        // This is the "no follows found" case, which is expected
        setFollowedPrograms([]);
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch followed programs");

      const data = await response.json();
      if (data?.$values) {
        setFollowedPrograms(data.$values);
      } else {
        setFollowedPrograms([]);
      }
    } catch (error) {
      console.error("Error fetching followed programs:", error);
      // Only show error if it's not the "no follows" case
      if (!error.message.includes("No follows found")) {
        setFollowError("Failed to load followed programs");
      }
    }
  }, []);

  useEffect(() => {
    fetchFollowedPrograms();
  }, [fetchFollowedPrograms]);

  const handleFollow = async (programId) => {
    const accountId = getAccountId();

    if (!accountId) {
      toast.error("Vui lòng đăng nhập để theo dõi chương trình");
      return;
    }

    setIsLoadingFollow(true);
    setFollowError(null);

    try {
      const existingFollow = followedPrograms.find(
        (f) => f.programID === programId
      );
      const token = localStorage.getItem("authToken");

      if (existingFollow) {
        // Unfollow
        const response = await apiFetch(
          `ProgramFollow/${existingFollow.programFollowID}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to unfollow program");

        setFollowedPrograms((prev) =>
          prev.filter((f) => f.programID !== programId)
        );
        toast.success("Đã hủy theo dõi chương trình");
      } else {
        // Follow
        const response = await apiFetch("ProgramFollow/follow", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            accountID: accountId,
            programID: programId,
          }),
        });

        if (!response.ok) throw new Error("Failed to follow program");

        const data = await response.json();
        setFollowedPrograms((prev) => [...prev, data]);
        toast.success("Đã theo dõi chương trình thành công");
      }
    } catch (error) {
      console.error("Follow/unfollow error:", error);
      // Only show error if it's not the "no follows" case
      if (!error.message.includes("No follows found")) {
        setFollowError(error.message || "Có lỗi xảy ra khi xử lý theo dõi");
        toast.error(
          existingFollow
            ? "Đã có lỗi trong khi xử lý yêu cầu hủy theo dõi. Vui lòng thử lại sau."
            : "Không thể theo dõi chương trình"
        );
      }
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const isProgramFollowed = (programId) => {
    return followedPrograms.some((f) => f.programID === programId);
  };

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await apiFetch("VideoLike/active", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch likes");

        const data = await response.json();
        if (data?.$values) {
          setLikes(data.$values);
        }
      } catch (error) {
        console.error("Error fetching likes:", error);
        setLikeError("Failed to load like information");
      }
    };

    if (videoHistoryId && localStorage.getItem("authToken")) {
      fetchLikes();
    }
  }, [videoHistoryId]);

  // Add this function to handle like/unlike actions
  const handleLike = async () => {
    if (!videoHistoryId) return;

    setIsLoadingLike(true);
    setLikeError(null);

    try {
      const existingLike = likes.find(
        (like) => like.videoHistoryID === videoHistoryId
      );

      if (existingLike) {
        // Unlike
        const response = await apiFetch(`VideoLike/${existingLike.likeID}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to unlike");

        setLikes((prev) =>
          prev.filter((like) => like.likeID !== existingLike.likeID)
        );
        toast.success("Đã bỏ thích chương trình");
      } else {
        // Like
        const response = await apiFetch("VideoLike", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            videoHistoryID: videoHistoryId,
          }),
        });

        if (!response.ok) throw new Error("Failed to like");

        const data = await response.json();
        setLikes((prev) => [...prev, data]);
        toast.success("Đã thích chương trình");
      }
    } catch (error) {
      console.error("Error handling like:", error);
      setLikeError(error.message || "Có lỗi xảy ra khi xử lý thích");
      toast.error("Có lỗi xảy ra khi xử lý thích");
    } finally {
      setIsLoadingLike(false);
    }
  };

  const isLiked = likes.some((like) => like.videoHistoryID === videoHistoryId);

  useEffect(() => {
    const chatContainer = chatMessagesRef.current;
    if (!chatContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 50; // 50px threshold
      setIsUserScrolledUp(!isNearBottom);
    };

    chatContainer.addEventListener("scroll", handleScroll);
    return () => chatContainer.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!channelId) {
      toast.error("Không tìm thấy kênh!");
      navigate("/");
      return;
    }
  }, [channelId]);

  useEffect(() => {
    // Initial fetch
    fetchScheduleProgram(logicDate);

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchScheduleProgram(logicDate);
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [logicDate, channelId]);

  useEffect(() => {
    // Fetch comments when videoHistoryId changes
    if (videoHistoryId) {
      fetchComments();
      // Set up interval to fetch comments every 5 seconds
      const commentInterval = setInterval(fetchComments, 5000);
      return () => clearInterval(commentInterval);
    }
  }, [videoHistoryId]);

  const fetchComments = async () => {
    try {
      if (isInitialLoad) {
        setIsLoadingComments(true);
      }

      setCommentError(null);
      const response = await apiFetch(`Comment/video/${videoHistoryId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Không thể tải bình luận!");

      const data = await response.json();
      if (data?.$values) {
        const formattedComments = data.$values.map((comment) => ({
          id: comment.commentID,
          text: comment.content,
          user: {
            name: "Người xem",
            badge: null,
          },
          // Explicitly parse UTC and convert to GMT+7
          time: dayjs
            .utc(comment.createdAt)
            .tz("Asia/Ho_Chi_Minh")
            .format("HH:mm"),
        }));

        setMessages(formattedComments);

        setTimeout(() => {
          if (!isUserScrolledUp && chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop =
              chatMessagesRef.current.scrollHeight;
          }
        }, 0);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setCommentError("Có lỗi đã xảy ra. Vui lòng thử lại sau.");
    } finally {
      if (isInitialLoad) {
        setIsInitialLoad(false);
        setIsLoadingComments(false);
      }
    }
  };

  useEffect(() => {
    if (videoHistoryId) {
      setIsInitialLoad(true); // Reset loading state for new video
      fetchComments();
    }
  }, [videoHistoryId]);

  const postComment = async (content) => {
    try {
      const response = await apiFetch(`Comment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          content: content,
          videoHistoryID: videoHistoryId,
        }),
      });

      if (!response.ok) throw new Error("Không thể đăng bình luận!");

      // After posting, fetch latest comments
      await fetchComments();
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Không thể đăng bình luận. Vui lòng thử lại sau.");
    }
  };

  const callAdsHook = async (accountID, duration, adLiveStreamId) => {
    try {
      const response = await apiFetch(`AdLiveStream/ads-hook?accountID=${accountID}&duration=${duration}&adLiveStreamID=${adLiveStreamId}`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Lỗi khi xử lý quảng cáo!");

    } catch (error) {
      console.error("Error fetching ads hook:", error);
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 800,
      offset: 100,
      once: true,
    });

    handleExistChannel();
  }, []);

  useEffect(() => {
    const accountId = getAccountId();

    if (!accountId) {
      toast.error("Vui lòng đăng nhập để theo dõi chương trình");
      return;
    }

    startAdsHub(accountId, (ad) => {
      const now = dayjs().tz("Asia/Ho_Chi_Minh");
      const adStart = dayjs(ad.startTime).tz("Asia/Ho_Chi_Minh");
      const adEnd = dayjs(ad.endTime).tz("Asia/Ho_Chi_Minh");

      const delayMs = adStart.diff(now);

      if (delayMs > 0) {
        // ⏳ Chưa tới giờ → delay phát
        setTimeout(() => {
          setCurrentAd(ad);
          setIsPlayingAd(true);

          setTimeout(() => {
            setIsPlayingAd(false);
            setCurrentAd(null);
          }, adEnd.diff(adStart));
        }, delayMs);
      } else {
        // ✅ Đã tới giờ hoặc trễ rồi → phát ngay
        setCurrentAd(ad);
        setIsPlayingAd(true);

        setTimeout(async () => {
          setIsPlayingAd(false);
          setCurrentAd(null);
          await callAdsHook(ad.accountId, adEnd.diff(adStart, "second"), ad.adLiveStreamId);
        }, adEnd.diff(now));
      }
    });

    return () => {
      stopAdsHub();
    };
  }, []);

  useEffect(() => {
    // Convert the current date (which is in local time) to GMT+7 first, then to UTC
    const newLogicDate = dayjs
      .tz(currentDate, "Asia/Ho_Chi_Minh")
      .utc()
      .format("YYYY-MM-DD");
    setLogicDate(newLogicDate);
  }, [currentDate]);

  const handlePrevDay = () => {
    setCurrentDate((prev) => prev.subtract(1, "day"));
  };

  const handleNextDay = () => {
    setCurrentDate((prev) => prev.add(1, "day"));
  };

  const programList = displaySchedule.map((schedule) => ({
    color: "#FF4757", // Always red since all are live
    children: (
      <div
        className="schedule-item live"
        onClick={() => {
          setDisplayIframeUrl(schedule.iframeUrl);
          setVideoHistoryId(schedule.videoHistoryIdFromSchedule);
          setCurrentProgram(schedule.program);
        }}
      >
        <div className="schedule-time">
          <div className="time-indicator live" />
          {/* Convert startTime to GMT+7 */}
          {dayjs.utc(schedule.startTime).tz("Asia/Ho_Chi_Minh").format("HH:mm")}
        </div>
        <div className="schedule-info">
          <div className="schedule-name">{schedule.programName}</div>
          <div className="schedule-description">
            <span className="live-status">LIVE</span>
          </div>
        </div>
      </div>
    ),
  }));

  const fetchScheduleProgram = async (date) => {
    try {
      // Convert the GMT+7 date to UTC before sending to API
      const utcDate = dayjs.tz(date, "Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
      console.log("Call from watch live");
      const response = await apiFetch(
        `Schedule/by-channel-and-date?channelId=${channelId}&date=${encodeURIComponent(
          utcDate
        )}`,
        { method: "GET" }
      );

      if (!response.ok) throw new Error("Không thể lấy lịch phát sóng!");

      const data = await response.json();

      if (data?.data?.$values) {
        const schedules = data.data.$values
          .filter(
            (schedule) =>
              schedule.status === "Live" || schedule.status === "LateStart"
          )
          .map((schedule) => ({
            // Parse as UTC first, then convert to GMT+7 when displaying
            startTime: dayjs.utc(schedule.startTime),
            endTime: dayjs.utc(schedule.endTime),
            programName: schedule.program.programName,
            title: schedule.program.title,
            status: true,
            iframeUrl: schedule.iframeUrl,
            isReplay: schedule.isReplay,
            videoHistoryIdFromSchedule: schedule.videoHistoryIdFromSchedule,
            program: schedule.program,
          }))
          .sort((a, b) => a.startTime.valueOf() - b.startTime.valueOf());

        setDisplaySchedule(schedules);

        if (schedules.length > 0) {
          setDisplayIframeUrl(schedules[0].iframeUrl);
          setVideoHistoryId(schedules[0].videoHistoryIdFromSchedule);
          setCurrentProgram(schedules[0].program);
        } else {
          setDisplayIframeUrl("");
          setVideoHistoryId(null);
          setCurrentProgram(null);
        }
      }
    } catch (error) {
      console.error("Error fetching schedule program:", error);
      toast.error("Có lỗi xảy ra khi lấy lịch phát sóng!");
    }
  };

  useEffect(() => {
    console.log("videoHistoryId updated:", videoHistoryId);
  }, [videoHistoryId]);

  const handleExistChannel = async () => {
    if (!channelId) {
      toast.error("ID kênh không hợp lệ!");
      navigate("/channelList");
      return;
    }

    try {
      const response = await apiFetch(`schoolchannels/${channelId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Kênh không tồn tại!");
      }

      const data = await response.json();
      if (!data) {
        throw new Error("Không có dữ liệu kênh!");
      }

      setChannelInfo(data); // Store channel info
    } catch (error) {
      console.error("Error checking channel:", error);
      toast.error(error.message || "Có lỗi xảy ra khi kiểm tra kênh!");
      navigate("/channelList");
    }
  };

  const addMessage = (text, user) => {
    const newMessage = {
      id: Date.now(),
      text,
      user,
      // Format current time in GMT+7
      time: dayjs().tz("Asia/Ho_Chi_Minh").format("HH:mm"),
    };
    setMessages((prev) => [...prev, newMessage]);
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  const sendMessage = () => {
    if (messageInput.trim()) {
      if (videoHistoryId) {
        postComment(messageInput);
      } else {
        addMessage(messageInput, { name: "Bạn", badge: null });
      }
      setMessageInput("");

      // Force scroll to bottom on send (regardless of user scroll)
      setTimeout(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTop =
            chatMessagesRef.current.scrollHeight;
        }
      }, 0);
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessageInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleShare = async () => {
    if (!videoHistoryId) {
      toast.error("Không có chương trình nào để chia sẻ");
      return;
    }

    setIsSharing(true);
    setShareError(null);

    try {
      // First try to use the Web Share API if available
      if (navigator.share) {
        const shareData = {
          title: currentProgram?.programName || "Chương trình đang phát sóng",
          text: currentProgram?.title || "Đang xem chương trình trực tiếp",
          url: window.location.href,
        };

        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Đã sao chép liên kết vào clipboard");
      }

      // Call the API to record the share
      const response = await apiFetch("Share", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          videoHistoryID: videoHistoryId,
        }),
      });

      if (!response.ok) throw new Error("Failed to record share");

      const data = await response.json();
      console.log("Share recorded:", data);
      toast.success("Chia sẻ thành công!");
    } catch (error) {
      console.error("Error sharing:", error);
      setShareError(error.message || "Có lỗi xảy ra khi chia sẻ");

      if (error.name !== "AbortError") {
        // Don't show error if user cancelled share
        toast.error("Có lỗi xảy ra khi chia sẻ. Vui lòng thử lại.");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!videoHistoryId) {
      toast.error("Không có chương trình nào để báo cáo");
      return;
    }

    if (!reportReason.trim()) {
      toast.error("Vui lòng nhập lý do báo cáo");
      return;
    }

    setIsReporting(true);
    setReportError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Vui lòng đăng nhập để báo cáo");
        setIsReportModalOpen(false);
        return;
      }

      const response = await apiFetch("Report", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          videoHistoryID: videoHistoryId,
          reason: reportReason,
        }),
      });

      if (response.status !== 201) {
        throw new Error("Không thể gửi báo cáo");
      }

      const data = await response.json();

      toast.success("Báo cáo đã được gửi thành công");
      setIsReportModalOpen(false);
      setReportReason("");
    } catch (error) {
      console.error("Error submitting report:", error);
      setReportError(error.message || "Có lỗi xảy ra khi gửi báo cáo");
      toast.error("Không thể gửi báo cáo. Vui lòng thử lại sau.");
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="main-container" style={{ background: "var(--bg-color)" }}>
      <div className="content-section">
        <section className="stream-section">
          <div className="video-container">
            {showSchedule && (
              <div
                className="schedule-overlay visible"
                onClick={() => setShowSchedule(false)}
              />
            )}
            {/* {isPlayingAd && currentAd && (
              <iframe
                src={`${currentAd.videoUrl}?autoplay=1&mute=1&controls=1&rel=0&playsinline=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  zIndex: 3,
                }}
              />
            )} */}
            {displayIframeUrl ? (
              <>
                <button
                  className={`schedule-button ${showSchedule ? "active" : ""}`}
                  onClick={() => setShowSchedule(!showSchedule)}
                >
                  <i className="fas fa-calendar-alt" /> Lịch chiếu
                </button>
                {isPlayingAd && currentAd ? (
                  <iframe
                    src={`${currentAd.videoUrl}?autoplay=1&mute=1&controls=1&rel=0&playsinline=1`}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      zIndex: 3,
                    }}
                  />
                ) : (
                  <iframe
                    src={displayIframeUrl}
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="youtube-player"
                  />
                )}
              </>
            ) : (
              <div className="no-video-placeholder">
                <i className="fas fa-tv fa-3x" />
                <p>Không có chương trình nào đang phát sóng</p>
              </div>
            )}
            {showSchedule && (
              <div className="schedule-panel visible">
                <div className="schedule-header">
                  <h3 className="schedule-title">
                    <i className="fas fa-calendar-alt" /> Lịch phát sóng
                  </h3>
                  <button
                    className="schedule-close"
                    onClick={() => setShowSchedule(false)}
                  >
                    <i className="fas fa-times" />
                  </button>
                </div>

                <div className="schedule-nav">
                  <div className="schedule-date">
                    <i className="fas fa-calendar" />
                    {isToday && "Hôm nay - "}
                    {dayjs
                      .utc(currentDate)
                      .tz("Asia/Ho_Chi_Minh")
                      .format("DD/MM/YYYY")}
                  </div>
                  <div className="schedule-arrows">
                    <button className="schedule-arrow" onClick={handlePrevDay}>
                      <i className="fas fa-chevron-left" />
                    </button>
                    <button className="schedule-arrow" onClick={handleNextDay}>
                      <i className="fas fa-chevron-right" />
                    </button>
                  </div>
                </div>

                <div className="schedule-content">
                  {displaySchedule.length > 0 ? (
                    <Timeline items={programList} />
                  ) : (
                    <div className="no-schedule">Không có lịch phát sóng</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="stream-info">
            <div className="stream-header">
              <div className="stream-title-row">
                <h1 className="stream-title">
                  {displaySchedule.find((s) => s.iframeUrl === displayIframeUrl)
                    ?.programName || "Chương trình đang phát sóng"}
                </h1>
                <div className="live-badge">LIVE</div>
              </div>

              <div className="stream-actions">
                <button
                  className="action-button primary-action"
                  onClick={handleLike}
                  disabled={isLoadingLike || !videoHistoryId}
                >
                  <i className="fas fa-thumbs-up" />
                  {isLoadingLike
                    ? "Đang xử lý..."
                    : isLiked
                    ? "Đã thích"
                    : "Thích"}
                </button>
                <button
                  className="action-button secondary-action"
                  onClick={handleShare}
                  disabled={!videoHistoryId || isSharing}
                >
                  <i className="fas fa-share" />
                  {isSharing ? "Đang chia sẻ..." : "Chia sẻ"}
                </button>
                {shareError && (
                  <div
                    className="error-message"
                    style={{ color: "var(--error-color)", marginTop: "0.5rem" }}
                  >
                    {shareError}
                  </div>
                )}
                <button
                  className="action-button secondary-action"
                  onClick={() => {
                    if (!localStorage.getItem("authToken")) {
                      toast.error("Vui lòng đăng nhập để báo cáo");
                      return;
                    }
                    setIsReportModalOpen(true);
                  }}
                >
                  <i className="fas fa-flag" /> Báo cáo
                </button>
              </div>
            </div>

            <div className="watchlive-channel-info">
              <div className="channel-avatar">
                <img
                  src="https://picsum.photos/200/200"
                  alt={channelInfo?.name || "Channel Avatar"}
                />
              </div>
              <div className="channel-details">
                <div className="channel-name">
                  {channelInfo?.name || "Đang tải..."}
                </div>
              </div>
              <button
                className={`subscribe-button ${
                  isProgramFollowed(currentProgram?.programID)
                    ? "subscribed"
                    : ""
                }`}
                onClick={() => handleFollow(currentProgram?.programID)}
                disabled={isLoadingFollow}
              >
                <i className="fas fa-bell" />
                {isLoadingFollow
                  ? "Đang xử lý..."
                  : isProgramFollowed(currentProgram?.programID)
                  ? "Đang theo dõi"
                  : "Theo dõi"}
                {followError && (
                  <div
                    className="error-message"
                    style={{ color: "var(--error-color)", marginTop: "0.5rem" }}
                  >
                    {followError}
                  </div>
                )}
              </button>
            </div>

            <div className="stream-description">
              <h3>Giới thiệu chương trình</h3>
              <p>
                {displaySchedule.find((s) => s.iframeUrl === displayIframeUrl)
                  ?.program?.title ||
                  "Nội dung chương trình sẽ được cập nhật sớm nhất"}
              </p>
            </div>
          </div>
        </section>
      </div>

      <aside className="chat-section">
        <div className="chat-header">
          <h2 className="chat-title">
            <i className="fas fa-comments" /> Trò chuyện trực tiếp
          </h2>
        </div>

        <div className="chat-messages" ref={chatMessagesRef}>
          {commentError ? (
            <div className="message">
              <div className="message-content">{commentError}</div>
            </div>
          ) : messages.length === 0 ? (
            isInitialLoad ? (
              <div className="message">
                <div className="message-content">Đang tải bình luận...</div>
              </div>
            ) : (
              <div className="message">
                <div className="message-content">Chưa có bình luận nào.</div>
              </div>
            )
          ) : (
            messages.map((message) => (
              <div className="message" key={message.id}>
                <div className="message-header">
                  <span className="username">
                    {message.user.name}
                    {message.user.badge && (
                      <span className="user-badge">{message.user.badge}</span>
                    )}
                  </span>
                  <span className="message-time">{message.time}</span>
                </div>
                <div className="message-content">{message.text}</div>
              </div>
            ))
          )}
        </div>

        <div className="chat-input">
          <div className="input-container">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />

            <button
              className="send-button"
              onClick={sendMessage}
              disabled={!messageInput.trim()}
            >
              <i className="fas fa-paper-plane" /> Gửi
            </button>
          </div>
        </div>
      </aside>

      {isReportModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsReportModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Báo cáo chương trình</h3>
              <button
                className="modal-close"
                onClick={() => setIsReportModalOpen(false)}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Lý do báo cáo</label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Nhập lý do báo cáo..."
                  rows={4}
                />
              </div>
            </div>

            <div className="modal-footer">
              {reportError && (
                <div className="error-message">{reportError}</div>
              )}
              <button
                className="submit-button"
                onClick={handleReportSubmit}
                disabled={isReporting}
              >
                {isReporting ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchLive;
