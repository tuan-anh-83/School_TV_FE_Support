import React, { useState, useEffect, useRef, useCallback } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./WatchLive.css";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../../config/baseAPI";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import { Timeline } from "antd";
import {
  connection,
  joinScheduleGroup,
  leaveScheduleGroup,
  startAdsHub,
  stopAdsHub,
} from "../../utils/AdsHub";
import videojs from "video.js";
import "video.js/dist/video-js.css";

dayjs.extend(timezone);

const WatchLive = () => {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [setShowEmojiPicker] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [currentDate, setCurrentDate] = useState(
    dayjs().tz("Asia/Ho_Chi_Minh")
  );
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  const [logicDate, setLogicDate] = useState(
    currentDate.format("YYYY-MM-DD") || ""
  );
  const [displaySchedule, setDisplaySchedule] = useState([]);
  const [displayIframeUrl, setDisplayIframeUrl] = useState("");
  const [displayMp4Url, setDisplayMp4Url] = useState("");
  const [videoHistoryId, setVideoHistoryId] = useState(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const chatMessagesRef = useRef(null);
  const isToday = currentDate.isSame(dayjs(), "day");
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
  const [currentAd, setCurrentAd] = useState(null);
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [currentScheduleId, setCurrentScheduleId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const initializePlayer = () => {
      if (!videoRef.current) return;

      playerRef.current = videojs(videoRef.current, {
        controls: true,
        responsive: true,
        fluid: true,
        html5: {
          hls: {
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            overrideNative: true,
          },
        },
      });

      playerRef.current.ready(() => {
        console.log("Player is ready");
        playerRef.current.isPlayerReady = true;
      });
    };

    if (!playerRef.current && videoRef.current) {
      initializePlayer();
    }

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  // Detect fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
      console.log("🖥️ Fullscreen changed:", isCurrentlyFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  // Second useEffect: Handle source changes
  useEffect(() => {
    if (!displayMp4Url) {
      // Nếu không có video → không làm gì
      return;
    }

    // Trường hợp player chưa init nhưng video DOM đã bị mất
    if (!videoRef.current || videoRef.current.tagName !== "VIDEO") {
      const container = document.querySelector("[data-vjs-player]");
      if (container) {
        container.innerHTML = ""; // Clear old content
        const videoEl = document.createElement("video");
        videoEl.className = "video-js vjs-default-skin vjs-16-9";
        videoEl.setAttribute("playsinline", "");
        container.appendChild(videoEl);
        videoRef.current = videoEl;
      }
    }

    // Re-init nếu bị dispose
    if (!playerRef.current || playerRef.current.isDisposed()) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        responsive: true,
        fluid: true,
        html5: {
          hls: {
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            overrideNative: true,
          },
        },
      });
    }

    const setSource = () => {
      playerRef.current.src({
        src: displayMp4Url,
        type: displayMp4Url.includes(".m3u8")
          ? "application/x-mpegURL"
          : "video/mp4",
      });

      playerRef.current.ready(() => {
        playerRef.current.liveTracker?.seekToLiveEdge?.();

        const seekable = playerRef.current.seekable();
        if (seekable && seekable.length > 0) {
          const livePoint = seekable.end(seekable.length - 1);
          playerRef.current.currentTime(livePoint);
        }

        playerRef.current.play().catch(console.error);
      });
    };

    if (playerRef.current.isPlayerReady || playerRef.current.readyState() > 0) {
      setSource();
    } else {
      playerRef.current.ready(setSource);
    }
  }, [displayMp4Url]);

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
    if (!videoHistoryId || !getAccountId()) return;

    setIsLoadingLike(true);
    setLikeError(null);

    try {
      const existingLike = likes.find(
        (like) =>
          like.videoHistoryID === videoHistoryId &&
          like.accountID === getAccountId()
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
            accountID: getAccountId(),
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

  const isLiked = likes.some(
    (like) =>
      like.videoHistoryID === videoHistoryId && like.accountID == getAccountId()
  );

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

  // useEffect(() => {
  //   // Initial fetch
  //   fetchScheduleProgram(logicDate);

  //   // Set up auto-refresh every 30 seconds
  //   const refreshInterval = setInterval(() => {
  //     fetchScheduleProgram(logicDate);
  //   }, 30000); // 30 seconds

  //   // Cleanup interval on component unmount
  //   return () => clearInterval(refreshInterval);
  // }, [logicDate, channelId]);

  useEffect(() => {
    // Initial fetch
    fetchScheduleProgram(logicDate);
  }, [logicDate]);

  useEffect(() => {
    // Only set up auto-switching if we're viewing today's schedule
    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    const today = now.format("YYYY-MM-DD");
    const selectedDate = dayjs
      .tz(logicDate, "Asia/Ho_Chi_Minh")
      .format("YYYY-MM-DD");

    if (selectedDate !== today) {
      // Don't set up auto-switching for non-today schedules
      return;
    }

    // Find the current active program
    const currentActiveProgram = displaySchedule.find(
      (s) => s.startTime.isBefore(now) && s.endTime.isAfter(now)
    );

    // If there's a current active program, set timer to switch when it ends
    if (currentActiveProgram) {
      const timeUntilEnd = currentActiveProgram.endTime.diff(now);

      if (timeUntilEnd > 0 && timeUntilEnd < 24 * 60 * 60 * 1000) {
        // Less than 24 hours
        console.log(
          `Current program "${currentActiveProgram.programName}" ends in ${
            timeUntilEnd / 60000
          } minutes`
        );

        const timerId = setTimeout(() => {
          console.log("Program ended, switching to next program");

          // Find the next program
          const nextProgram = displaySchedule.find((s) =>
            s.startTime.isAfter(currentActiveProgram.endTime)
          );

          if (nextProgram) {
            // Switch to the next program
            console.log(
              `Switching to next program: ${nextProgram.programName}`
            );
            setDisplayIframeUrl(nextProgram.iframeUrl);
            setDisplayMp4Url(nextProgram.mp4Url);
            setVideoHistoryId(nextProgram.videoHistoryIdFromSchedule);
            setCurrentScheduleId(nextProgram.scheduleID);
            setCurrentProgram(nextProgram.program);
            setCurrentStatus(nextProgram.status);
          } else {
            // If no next program, re-fetch schedule (in case there are updates)
            fetchScheduleProgram(logicDate);
          }
        }, timeUntilEnd + 1000); // Add 1 second buffer

        return () => clearTimeout(timerId);
      }
    } else {
      // If there's no current program, check if there's an upcoming one today
      const nextUpcomingProgram = displaySchedule.find((s) =>
        s.startTime.isAfter(now)
      );

      if (nextUpcomingProgram) {
        const timeUntilStart = nextUpcomingProgram.startTime.diff(now);

        if (timeUntilStart > 0 && timeUntilStart < 24 * 60 * 60 * 1000) {
          // Less than 24 hours
          console.log(
            `Next program "${nextUpcomingProgram.programName}" starts in ${
              timeUntilStart / 60000
            } minutes`
          );

          const timerId = setTimeout(() => {
            console.log(
              `Time to start program: ${nextUpcomingProgram.programName}`
            );
            setDisplayIframeUrl(nextUpcomingProgram.iframeUrl);
            setDisplayMp4Url(nextUpcomingProgram.mp4Url);
            setVideoHistoryId(nextUpcomingProgram.videoHistoryIdFromSchedule);
            setCurrentScheduleId(nextUpcomingProgram.scheduleID);
            setCurrentProgram(nextUpcomingProgram.program);
            setCurrentStatus(nextUpcomingProgram.status);
          }, timeUntilStart + 1000); // Add 1 second buffer

          return () => clearTimeout(timerId);
        }
      }
    }
  }, [displaySchedule, logicDate]);

  // Safety check interval every minute to ensure programs switch even if setTimeout fails
  useEffect(() => {
    // Only run for today's schedule
    const checkInterval = setInterval(() => {
      const now = dayjs().tz("Asia/Ho_Chi_Minh");
      const today = now.format("YYYY-MM-DD");
      const selectedDate = dayjs
        .tz(logicDate, "Asia/Ho_Chi_Minh")
        .format("YYYY-MM-DD");

      if (selectedDate !== today) {
        return; // Don't check for non-today schedules
      }

      // Check if the currently displayed program has ended
      if (currentScheduleId) {
        const currentSchedule = displaySchedule.find(
          (s) => s.scheduleID === currentScheduleId
        );

        if (currentSchedule && currentSchedule.endTime.isBefore(now)) {
          // Current program has ended, find the next one
          const nextProgram = displaySchedule.find((s) =>
            s.startTime.isAfter(currentSchedule.endTime)
          );

          if (nextProgram) {
            console.log(
              `Current program has ended. Switching to: ${nextProgram.programName}`
            );
            setDisplayIframeUrl(nextProgram.iframeUrl);
            setDisplayMp4Url(nextProgram.mp4Url);
            setVideoHistoryId(nextProgram.videoHistoryIdFromSchedule);
            setCurrentScheduleId(nextProgram.scheduleID);
            setCurrentProgram(nextProgram.program);
            setCurrentStatus(nextProgram.status);
          }
        } else if (!currentSchedule) {
          // If currentSchedule is not found, refresh the schedule
          fetchScheduleProgram(logicDate);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [currentScheduleId, displaySchedule, logicDate]);

  useEffect(() => {
    // Fetch comments when videoHistoryId changes
    if (videoHistoryId) {
      fetchComments();
      // Set up interval to fetch comments every 2 seconds
      const commentInterval = setInterval(fetchComments, 2000);
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
          // Explicitly parse and convert to GMT+7
          time: dayjs(comment.createdAt).tz("Asia/Ho_Chi_Minh").format("HH:mm"),
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

      if (!response.ok) {
        const errData = await response.json();
        console.log(errData);
        throw new Error(
          errData.message || "Không thể đăng bình luận. Vui lòng thử lại sau."
        );
      }

      // After posting, fetch latest comments
      await fetchComments();
    } catch (error) {
      toast.error(error.message);
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
      console.log("🎯 Processing received ad:", ad);

      const now = dayjs().tz("Asia/Ho_Chi_Minh");
      const adStart = dayjs(ad.startTime).tz("Asia/Ho_Chi_Minh");
      const adEnd = dayjs(ad.endTime).tz("Asia/Ho_Chi_Minh");

      console.log("⏰ Time comparison:", {
        now: now.format("YYYY-MM-DD HH:mm:ss"),
        adStart: adStart.format("YYYY-MM-DD HH:mm:ss"),
        adEnd: adEnd.format("YYYY-MM-DD HH:mm:ss"),
        delayMs: adStart.diff(now),
        durationMs: adEnd.diff(adStart),
      });

      const delayMs = adStart.diff(now);

      const startAdPlayback = () => {
        console.log("▶️ Starting ad playback:", ad.title);
        // Pause main video when ad starts
        if (playerRef.current && !playerRef.current.isDisposed()) {
          playerRef.current.pause();
          console.log("⏸️ Main video paused");
        }

        setCurrentAd(ad);
        setIsPlayingAd(true);
      };

      const endAdPlayback = () => {
        console.log("⏹️ Ending ad playback");
        // Resume main video when ad ends
        if (playerRef.current && !playerRef.current.isDisposed()) {
          playerRef.current.play().catch(console.error);
          console.log("▶️ Main video resumed");
        }

        setIsPlayingAd(false);
        setCurrentAd(null);
      };

      if (delayMs > 0) {
        // ⏳ Chưa tới giờ → delay phát
        console.log(`⏳ Scheduling ad to start in ${delayMs}ms`);
        setTimeout(() => {
          startAdPlayback();

          setTimeout(() => {
            endAdPlayback();
          }, adEnd.diff(adStart) + 5000);
        }, delayMs);
      } else if (adEnd.isAfter(now)) {
        // ✅ Đã tới giờ và chưa kết thúc → phát ngay
        console.log("✅ Starting ad immediately");
        startAdPlayback();

        setTimeout(() => {
          endAdPlayback();
        }, adEnd.diff(now) + 1000);
      } else {
        console.log("⚠️ Ad time has already passed, skipping");
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
        style={
          currentScheduleId === schedule.scheduleID
            ? { background: "#980d99" }
            : schedule.status === "Live" || schedule.status === "LateStart"
            ? { background: "#960134" }
            : { background: "#30106a" }
        }
        onClick={() => {
          const now = dayjs().tz("Asia/Ho_Chi_Minh");
          if (now.isBefore(schedule.startTime)) {
            const totalSeconds = schedule.startTime.diff(now, "second");
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            toast.warning(
              `⏰ Livestream chưa bắt đầu. Hãy quay lại sau ${hours} giờ ${minutes} phút ${seconds} giây.`
            );
            return;
          }

          // When user clicks on a schedule item, display that video
          setDisplayIframeUrl(
            schedule.videoHistoryPlaybackUrl
              ? schedule.videoHistoryPlaybackUrl
              : schedule.iframeUrl
          );
          setDisplayMp4Url(schedule.mp4Url);
          setVideoHistoryId(schedule.videoHistoryIdFromSchedule);
          setCurrentScheduleId(schedule.scheduleID);
          setCurrentProgram(schedule.program);
          setCurrentStatus(schedule.status);

          // Optional: Close the schedule panel after selecting a program
          setShowSchedule(false);

          console.log(`User selected program: ${schedule.programName}`);
        }}
      >
        <div className="schedule-time">
          {schedule.status === "Live" ||
            (schedule.status === "LateStart" && (
              <div className="time-indicator live" />
            ))}
          {/* Convert startTime to GMT+7 */}
          {dayjs(schedule.startTime).tz("Asia/Ho_Chi_Minh").format("HH:mm")}
        </div>
        <div className="schedule-info">
          <div className="schedule-name">{schedule.programName}</div>
          <div className="schedule-description">
            {schedule.status === "Live" || schedule.status === "LateStart" ? (
              <span className="live-status">Live</span>
            ) : (
              <span className="live-empty"></span>
            )}
          </div>
        </div>
      </div>
    ),
  }));

  console.log(displayMp4Url);

  const fetchScheduleProgram = async (date) => {
    try {
      // Convert the GMT+7 date to UTC before sending to API
      const utcDate = dayjs.tz(date, "Asia/Ho_Chi_Minh").format("YYYY-MM-DD");

      const response = await apiFetch(
        `Schedule/by-channel-and-date?channelId=${channelId}&date=${encodeURIComponent(
          utcDate
        )}`,
        { method: "GET" }
      );

      if (!response.ok) throw new Error("Không thể lấy lịch phát sóng!");

      const data = await response.json();

      console.log(data?.data?.$values);

      if (data?.data?.$values) {
        const schedules = data.data.$values
          .map((schedule) => ({
            // Parse as UTC first, then convert to GMT+7 when displaying
            scheduleID: schedule.scheduleID,
            startTime: dayjs(schedule.startTime).tz("Asia/Ho_Chi_Minh"),
            endTime: dayjs(schedule.endTime).tz("Asia/Ho_Chi_Minh"),
            programName: schedule.program.programName,
            title: schedule.program.title,
            status: schedule.status,
            iframeUrl: schedule.iframeUrl,
            mp4Url: schedule.mp4Url,
            isReplay: schedule.isReplay,
            videoHistoryIdFromSchedule: schedule.videoHistoryIdFromSchedule,
            program: schedule.program,
            videoHistoryPlaybackUrl: schedule.videoHistoryPlaybackUrl,
          }))
          .sort((a, b) => a.startTime.valueOf() - b.startTime.valueOf());

        setDisplaySchedule(schedules);

        if (schedules.length > 0) {
          // Get current time in GMT+7
          const now = dayjs().tz("Asia/Ho_Chi_Minh");
          const today = now.format("YYYY-MM-DD");
          const selectedDate = dayjs
            .tz(date, "Asia/Ho_Chi_Minh")
            .format("YYYY-MM-DD");

          // Check if we're looking at today's schedule or a past/future day
          const isToday = selectedDate === today;

          if (isToday) {
            // For today's schedule, find the current or upcoming program
            let currentProgram = null;

            // First try to find a program that's currently live
            currentProgram = schedules.find(
              (s) => s.startTime.isBefore(now) && s.endTime.isAfter(now)
            );

            // If no current program, find the next upcoming program
            if (!currentProgram) {
              currentProgram = schedules.find((s) => s.startTime.isAfter(now));
            }

            // If still no program found (all programs already ended), use the last one
            if (!currentProgram && schedules.length > 0) {
              currentProgram = schedules[schedules.length - 1];
            }

            // If we found a program to display, set it
            if (currentProgram) {
              const hasStarted =
                now.isAfter(currentProgram.startTime) ||
                now.isSame(currentProgram.startTime);
              const hasEnded = now.isAfter(currentProgram.endTime);

              if (hasStarted && !hasEnded) {
                setDisplayIframeUrl(currentProgram.iframeUrl);
                setDisplayMp4Url(currentProgram.mp4Url);
                setVideoHistoryId(currentProgram.videoHistoryIdFromSchedule);
              } else {
                setDisplayIframeUrl(""); // Hoặc null tùy UI
                setDisplayMp4Url("");
                setVideoHistoryId(null);
              }

              setCurrentScheduleId(currentProgram.scheduleID);
              setCurrentProgram(currentProgram.program);
              setCurrentStatus(currentProgram.status);

              console.log(
                `Selected program: ${
                  currentProgram.programName
                } (${currentProgram.startTime.format(
                  "HH:mm"
                )} - ${currentProgram.endTime.format("HH:mm")})`
              );
            } else {
              if (!now.isBefore(schedules[0].startTime)) {
                // Fallback to first program if something went wrong in our logic
                setDisplayIframeUrl(schedules[0].iframeUrl);
                setDisplayMp4Url(schedules[0].mp4Url);
                setVideoHistoryId(schedules[0].videoHistoryIdFromSchedule);
                setCurrentScheduleId(schedules[0].scheduleID);
                setCurrentProgram(schedules[0].program);
                setCurrentStatus(schedules[0].status);
              }
            }
          } else {
            if (!now.isBefore(schedules[0].startTime)) {
              // For past or future days, just show the first program in the list
              // (User can click on specific programs to view them)
              setDisplayIframeUrl(schedules[0].iframeUrl);
              setDisplayMp4Url(schedules[0].mp4Url);
              setVideoHistoryId(schedules[0].videoHistoryIdFromSchedule);
              setCurrentScheduleId(schedules[0].scheduleID);
              setCurrentProgram(schedules[0].program);
              setCurrentStatus(schedules[0].status);
            }
          }
        } else {
          setDisplayIframeUrl("");
          setDisplayMp4Url("");
          setVideoHistoryId(null);
          setCurrentScheduleId(null);
          setCurrentProgram(null);
          setCurrentStatus(null);
        }
      }
    } catch (error) {
      console.error("Error fetching schedule program:", error);
      toast.error("Có lỗi xảy ra khi lấy lịch phát sóng!");
    }
  };

  useEffect(() => {
    if (currentScheduleId) {
      joinScheduleGroup(currentScheduleId);
    }
    return () => {
      if (currentScheduleId) {
        leaveScheduleGroup(currentScheduleId);
      }
    };
  }, [currentScheduleId, connection?.state]);

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
    } else if (!getAccountId()) {
      toast.error("Người dùng chưa đăng nhập");
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
          accountID: getAccountId(),
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

      const response = await apiFetch("Report/CreateReport", {
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

      if (!response.ok) {
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

  const addViewCount = async () => {
    if (!videoHistoryId || !getAccountId()) return;

    try {
      const response = await apiFetch("VideoView", {
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

      if (!response.ok) throw new Error("Failed to count view");
    } catch (error) {
      console.error("Error in adding view count:", error);
    }
  };

  useEffect(() => {
    if (videoHistoryId) {
      const timeoutId = setTimeout(() => {
        addViewCount();
      }, 10000);

      return () => clearTimeout(timeoutId);
    }
  }, [videoHistoryId]);

  const toIframeUrl = (url) => {
    if (url.includes("/watch")) {
      return url.replace("/watch", "/iframe");
    }
    return url;
  };

  return (
    <div className="main-container" style={{ background: "var(--bg-color)" }}>
      {/* Fullscreen Ad Overlay */}
      {isPlayingAd && currentAd && isFullscreen && (
        <div className="ad-overlay-fullscreen">
          <div className="ad-container-fullscreen">
            <iframe
              src={`${currentAd.videoUrl}?autoplay=1&mute=0&controls=0&playsinline=1`}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                pointerEvents: "none",
              }}
              onLoad={() =>
                console.log(
                  "📺 Fullscreen Ad iframe loaded:",
                  currentAd.videoUrl
                )
              }
              onError={() =>
                console.error(
                  "❌ Fullscreen Ad iframe failed to load:",
                  currentAd.videoUrl
                )
              }
            />
            <div className="ad-info-fullscreen">
              <span className="ad-label-fullscreen">
                Quảng cáo: {currentAd.title}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="content-section">
        <section className="stream-section">
          <div className="video-container">
            {showSchedule && (
              <div
                className="schedule-overlay visible"
                onClick={() => setShowSchedule(false)}
              />
            )}
            <button
              className={`schedule-button ${showSchedule ? "active" : ""}`}
              onClick={() => setShowSchedule(!showSchedule)}
            >
              <i className="fas fa-calendar-alt" /> Lịch chiếu
            </button>
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
            {displayMp4Url ? (
              <>
                <button
                  className={`schedule-button ${showSchedule ? "active" : ""}`}
                  onClick={() => setShowSchedule(!showSchedule)}
                >
                  <i className="fas fa-calendar-alt" /> Lịch chiếu
                </button>
                {/* Video player chính luôn hiển thị */}
                <div data-vjs-player>
                  <video
                    ref={videoRef}
                    className="video-js vjs-default-skin vjs-16-9"
                    width="352"
                    height="198"
                    playsInline
                  />
                </div>

                {/* Overlay quảng cáo - chỉ hiển thị khi không fullscreen */}
                {isPlayingAd && currentAd && !isFullscreen && (
                  <div className="ad-overlay">
                    <div className="ad-container">
                      <iframe
                        src={`${currentAd.videoUrl}?autoplay=1&mute=0&controls=0&playsinline=1`}
                        allow="autoplay; encrypted-media; fullscreen"
                        allowFullScreen
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "none",
                          pointerEvents: "none",
                        }}
                        onLoad={() =>
                          console.log(
                            "📺 Ad iframe loaded:",
                            currentAd.videoUrl
                          )
                        }
                        onError={() =>
                          console.error(
                            "❌ Ad iframe failed to load:",
                            currentAd.videoUrl
                          )
                        }
                      />
                      <div className="ad-info">
                        <span className="ad-label">
                          Quảng cáo: {currentAd.title}
                        </span>
                      </div>
                    </div>
                  </div>
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
                    {dayjs(currentDate)
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
                {videoHistoryId &&
                  (currentStatus === "Live" ||
                    currentStatus === "LateStart") && (
                    <div className="live-badge">LIVE</div>
                  )}
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
                    } else if (!currentProgram) {
                      toast.warning("Không có chương trình để báo cáo.");
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
                  src={channelInfo?.logoUrl || "https://picsum.photos/200/200"}
                  alt={channelInfo?.name || "Channel Avatar"}
                />
              </div>
              <div className="channel-details">
                <div className="channel-name">
                  {channelInfo?.name || "Đang tải..."}
                </div>
              </div>
              <div>
                <button
                  className={`subscribe-button ${
                    !currentProgram
                      ? "cantSubscribed"
                      : isProgramFollowed(currentProgram?.programID)
                      ? "subscribed"
                      : ""
                  }`}
                  onClick={() => handleFollow(currentProgram?.programID)}
                  disabled={isLoadingFollow || !currentProgram}
                >
                  <i className="fas fa-bell" />
                  {isLoadingFollow
                    ? "Đang xử lý..."
                    : !currentProgram
                    ? "Chưa có chương trình"
                    : isProgramFollowed(currentProgram?.programID)
                    ? "Đang theo dõi"
                    : "Theo dõi"}
                </button>
                {followError && (
                  <div
                    className="error-message"
                    style={{ color: "var(--error-color)", marginTop: "0.5rem" }}
                  >
                    {followError}
                  </div>
                )}
              </div>
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
