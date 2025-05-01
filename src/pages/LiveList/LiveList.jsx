import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBroadcastTower,
  faSearch,
  faUsers,
  faPlay,
  faVideo,
  faTimes,
  faSpinner,
  faSort,
  faSchool,
  faCalendarAlt,
  faTv,
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { faBell, faClock } from "@fortawesome/free-solid-svg-icons";
import { faCalendarTimes } from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../../context/ThemeContext";
import apiFetch from "../../config/baseAPI";
import styles from "./live-list.module.scss";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`${styles.toast} ${styles[type]}`}
    >
      <FontAwesomeIcon
        icon={
          type === "success"
            ? faCheckCircle
            : type === "error"
            ? faExclamationCircle
            : faInfoCircle
        }
      />
      {message}
    </motion.div>
  );
};

const SortModal = ({ isOpen, onClose, currentSort, onSave }) => {
  const [selectedSort, setSelectedSort] = useState(currentSort);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Sắp xếp theo</h3>
          <button onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className={styles.modalOptions}>
          <label
            className={`${styles.modalOption} ${
              selectedSort === "newest" ? styles.selected : ""
            }`}
            onClick={() => setSelectedSort("newest")}
          >
            <input
              type="radio"
              name="sort"
              checked={selectedSort === "newest"}
              readOnly
            />
            <span>Mới thêm</span>
          </label>
          <label
            className={`${styles.modalOption} ${
              selectedSort === "newest-updated" ? styles.selected : ""
            }`}
            onClick={() => setSelectedSort("newest-updated")}
          >
            <input
              type="radio"
              name="sort"
              checked={selectedSort === "newest-updated"}
              readOnly
            />
            <span>Cập nhật mới nhất</span>
          </label>
          <label
            className={`${styles.modalOption} ${
              selectedSort === "viewers" ? styles.selected : ""
            }`}
            onClick={() => setSelectedSort("viewers")}
          >
            <input
              type="radio"
              name="sort"
              checked={selectedSort === "viewers"}
              readOnly
            />
            <span>Lượt xem cao nhất</span>
          </label>
          <label
            className={`${styles.modalOption} ${
              selectedSort === "following" ? styles.selected : ""
            }`}
            onClick={() => setSelectedSort("following")}
          >
            <input
              type="radio"
              name="sort"
              checked={selectedSort === "following"}
              readOnly
            />
            <span>Đang theo dõi</span>
          </label>
        </div>
        <div className={styles.modalActions}>
          <button onClick={() => onSave(selectedSort)}>Áp dụng</button>
        </div>
      </div>
    </div>
  );
};

const UniversityModal = ({
  isOpen,
  onClose,
  universities,
  selectedUniversity,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredList, setFilteredList] = useState(universities);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleSearch = useCallback(
    (query) => {
      setIsLoading(true);
      try {
        const filtered = universities.filter((uni) =>
          uni.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredList(filtered);
      } finally {
        setIsLoading(false);
      }
    },
    [universities]
  );

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleClose = () => {
    setSearchQuery("");
    setFilteredList(universities);
    onClose();
  };

  const handleSelect = (uni) => {
    onSelect(uni);
    handleClose();
  };

  useEffect(() => {
    // Reset filtered list when universities prop changes
    setFilteredList(universities);
  }, [universities]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div
        className={`${styles.modalContent} ${styles.universityModalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>Chọn trường</h3>
          <button onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.searchBox}>
          <FontAwesomeIcon
            icon={isLoading ? faSpinner : faSearch}
            className={styles.searchIcon}
            spin={isLoading}
          />
          <input
            type="text"
            placeholder="Tìm kiếm trường..."
            value={searchQuery}
            onChange={handleInputChange}
            className={styles.searchInput}
            disabled={isLoading}
          />
          {searchQuery && (
            <button
              className={styles.cancelButton}
              onClick={() => {
                setSearchQuery("");
                setFilteredList(universities);
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        <div className={styles.universityList}>
          {isLoading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                color: "var(--text-secondary)",
              }}
            >
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                style={{ marginRight: "1rem" }}
              />
              <span>Đang tải danh sách trường...</span>
            </div>
          ) : (
            <div className={styles.modalOptions}>
              <label
                className={`${styles.modalOption} ${
                  selectedUniversity === "all" ? styles.selected : ""
                }`}
                onClick={() => handleSelect("all")}
              >
                <input
                  type="radio"
                  name="university"
                  checked={selectedUniversity === "all"}
                  readOnly
                />
                <span>Tất cả trường</span>
              </label>

              {filteredList.map((uni) => (
                <label
                  key={uni}
                  className={`${styles.modalOption} ${
                    selectedUniversity === uni ? styles.selected : ""
                  }`}
                  onClick={() => handleSelect(uni)}
                >
                  <input
                    type="radio"
                    name="university"
                    checked={selectedUniversity === uni}
                    readOnly
                  />
                  <span>{uni}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProgramModal = ({
  program,
  onClose,
  followedProgramIds,
  handleFollow,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const { theme } = useContext(ThemeContext);

  const memoizedImages = useMemo(
    () => ({
      programThumbnail:
        program.thumbnail ||
        `https://picsum.photos/800/450?random=${program.id}`,
      universityAvatar:
        program.schoolChannel?.universityAvatar ||
        `https://picsum.photos/40/40?random=${program.id}`,
    }),
    [program.id, program.thumbnail, program.schoolChannel?.universityAvatar]
  );

  const getStatus = useCallback((schedule) => {
    const status = schedule.status;
    switch (status) {
      case "Live":
        return "LIVE";
      case "Ready":
      case "Pending":
      case "LateStart":
      case "EndedEarly":
        return "CHỜ PHÁT";
      case "Ended":
        return "ĐÃ PHÁT";
      default:
        return "CHỜ PHÁT";
    }
  }, []);

  const handleScheduleClick = useCallback(
    (schedule) => {
      const status = getStatus(schedule);
      if (status === "LIVE" && program.schoolChannel?.schoolChannelID) {
        navigate(`/watchLive/${program.schoolChannel.schoolChannelID}`);
      }
    },
    [navigate, program.schoolChannel]
  );

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case "LIVE":
        return "var(--live-color)";
      case "ĐÃ PHÁT":
        return "var(--primary-color)";
      default:
        return "var(--disabled-color)";
    }
  }, []);

  const formatDuration = useCallback((start, end) => {
    const duration = Math.floor((end - start) / (1000 * 60));
    return `${duration} phút`;
  }, []);

  const filteredSchedules = useMemo(
    () =>
      program.schedules.filter((schedule) => {
        const status = getStatus(schedule);
        return activeTab === "all" || activeTab === status;
      }),
    [program.schedules, activeTab, getStatus]
  );

  const TabButton = React.memo(
    ({ tab, activeTab, onClick }) => {
      const iconMap = {
        all: faCalendarAlt,
        LIVE: faBroadcastTower,
        "CHỜ PHÁT": faClock,
        "ĐÃ PHÁT": faPlay,
      };

      return (
        <button
          onClick={() => onClick(tab)}
          className={`${styles.tabButton} ${
            activeTab === tab ? styles.active : ""
          }`}
        >
          <FontAwesomeIcon
            icon={iconMap[tab]}
            style={{
              color: activeTab === tab ? "white" : "var(--text-secondary)",
              fontSize: window.innerWidth <= 768 ? "0.8rem" : "0.9rem",
              marginRight: "4px",
            }}
          />
          {tab === "all" ? "Tất cả" : tab}
        </button>
      );
    },
    (prevProps, nextProps) => {
      return (
        prevProps.activeTab === nextProps.activeTab ||
        (prevProps.tab !== prevProps.activeTab &&
          nextProps.tab !== nextProps.activeTab)
      );
    }
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.programModalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={styles.modalHeader}
          style={{ position: "relative", zIndex: 1 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <img
              src={memoizedImages.universityAvatar}
              className={styles.universityAvatar}
              style={{ width: "40px", height: "40px" }}
              alt="University"
            />
            <div>
              <h3 style={{ margin: 0 }}>{program.programName}</h3>
              <span
                style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
              >
                {program.schoolChannel?.name || "Trường không xác định"}
              </span>
            </div>
          </div>
          <button onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div
          style={{
            marginBottom: "1.5rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className={styles.filterGroup}>
            {["all", "LIVE", "CHỜ PHÁT", "ĐÃ PHÁT"].map((tab) => (
              <TabButton
                key={tab}
                tab={tab}
                activeTab={activeTab}
                onClick={setActiveTab}
              />
            ))}
          </div>
        </div>

        {filteredSchedules.length > 0 ? (
          <div
            className={styles.contentGrid}
            style={{
              maxHeight: "60vh",
              overflowY: "auto",
              padding: "20px 1rem 1rem",
              marginBottom: "1rem",
              marginTop: "-10px",
            }}
          >
            {filteredSchedules.map((schedule, index) => {
              const status = getStatus(schedule);
              const isLive = status === "LIVE";
              const statusIcon = {
                LIVE: faBroadcastTower,
                "ĐÃ PHÁT": faPlay,
                "CHỜ PHÁT": faClock,
              }[status];

              // Format the date in Vietnamese locale
              const formattedDate = schedule?.startTime?.toLocaleDateString(
                "vi-VN",
                {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }
              );

              return (
                <div
                  key={`${schedule.id}-${index}`}
                  className={styles.streamCard}
                  onClick={() =>
                    isLive ? handleScheduleClick(schedule) : null
                  }
                  style={{
                    cursor: isLive ? "pointer" : "default",
                    position: "relative",
                  }}
                >
                  {isLive && (
                    <div className={styles.liveOverlay}>
                      <span>Bấm để xem trực tiếp</span>
                    </div>
                  )}
                  <div className={styles.streamThumbnail}>
                    <img
                      src={memoizedImages.programThumbnail}
                      alt={program.programName}
                    />
                    <div className={styles.recordedBadge} data-status={status}>
                      <FontAwesomeIcon
                        icon={statusIcon}
                        style={{ marginRight: "6px" }}
                      />
                      {status}
                    </div>
                    {status === "ĐÃ PHÁT" && (
                      <div className={styles.streamDuration}>
                        {schedule?.startTime?.toLocaleDateString("vi-VN")}
                      </div>
                    )}
                  </div>
                  <div className={styles.streamInfo}>
                    <h3 className={styles.streamTitle}>
                      {schedule.mode ||
                        program.programName ||
                        "Chương trình phát sóng"}
                    </h3>
                    {/* Add the date here */}
                    <div className={styles.scheduleDate}>{formattedDate}</div>
                    <div className={styles.streamMeta}>
                      <div className={styles.timeContainer}>
                        <div className={styles.streamStats}>
                          <span>
                            <FontAwesomeIcon icon={faClock} />
                            {` ${formatDuration(
                              schedule.startTime,
                              schedule.endTime
                            )} • `}
                            {schedule.startTime.toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "var(--text-secondary)",
              background: "var(--card-bg)",
              borderRadius: "12px",
              margin: "1rem 0",
            }}
          >
            <FontAwesomeIcon
              icon={faCalendarTimes}
              style={{
                fontSize: "2rem",
                marginBottom: "1rem",
                color: "var(--disabled-color)",
              }}
            />
            <p>Không tìm thấy lịch phát nào phù hợp</p>
          </div>
        )}

        <div className={styles.modalActions}>
          <button
            onClick={() => {
              onClose();
              navigate(`/program/${program.programID}`);
            }}
            className={styles.followButton} // Use the same class as follow button
            style={{ background: "var(--primary-color)" }} // Ensure primary color
          >
            <FontAwesomeIcon icon={faInfoCircle} /> Xem chi tiết
          </button>
          <button
            onClick={() => handleFollow(program.programID)}
            className={`${styles.followButton} ${
              followedProgramIds.includes(program.programID)
                ? styles.following
                : ""
            }`}
          >
            {followedProgramIds.includes(program.programID) ? (
              <>
                <FontAwesomeIcon icon={faBell} /> Đang theo dõi
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faBell} /> Theo dõi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const LiveList = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [followedPrograms, setFollowedPrograms] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [videos, setVideos] = useState([]);
  const [filters, setFilters] = useState({
    sort: "newest",
    university: "all",
    search: "",
  });
  const [searchState, setSearchState] = useState({
    isLoading: false,
    lastSearch: "",
    originalPrograms: [],
  });
  const [universities, setUniversities] = useState([]);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showUniversityModal, setShowUniversityModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [pendingUniversityModal, setPendingUniversityModal] = useState(false);

  const getAccountId = () => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData).accountID : null;
  };

  // LOGIN CHECK: ADD THIS BLOCK AT THE VERY TOP OF THE COMPONENT FUNCTION
  if (!localStorage.getItem("authToken")) {
    return (
      <div
        className={styles.mainContainer}
        style={{
          paddingTop: "150px",
          marginBottom: "130px",
          background: "var(--bg-color)",
        }}
      >
        <div
          className="auth-required"
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "var(--card-bg)",
            borderRadius: "12px",
            margin: "2rem 0",
          }}
        >
          <h3 style={{ color: "var(--primary-text)", marginBottom: "1rem" }}>
            Bạn cần đăng nhập để xem nội dung này
          </h3>
          <p style={{ color: "var(--secondary-text)", marginBottom: "1.5rem" }}>
            Vui lòng đăng nhập để tiếp tục xem các chương trình và tương tác.
          </p>
          <button
            style={{
              padding: "0.8rem 1.5rem",
              borderRadius: "8px",
              background: "var(--primary-color)",
              color: "white",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onClick={() => navigate("/login")}
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchInitialFollows = async () => {
      const accountId = getAccountId();
      if (accountId) {
        try {
          const response = await apiFetch(
            `ProgramFollow/account/${accountId}`,
            {
              headers: { accept: "text/plain" },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setFollowedPrograms(data.$values); // Store full follow objects
          }
        } catch (error) {
          console.error("Initial follow fetch error:", error);
        }
      }
    };

    fetchInitialFollows();
  }, []);

  // Add this function in LiveList component
  const handleFollow = async (programId) => {
    const accountId = getAccountId();

    if (!accountId) {
      showToast("Vui lòng đăng nhập để theo dõi chương trình", "error");
      return;
    }

    // Check if already following
    const existingFollow = followedPrograms.find(
      (f) => f.programID === programId
    );

    try {
      const token = localStorage.getItem("token");

      if (existingFollow) {
        // Unfollow case
        const response = await apiFetch(
          `ProgramFollow/${existingFollow.programFollowID}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              accept: "*/*",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to unfollow program");
        }

        setFollowedPrograms((prev) =>
          prev.filter((f) => f.programID !== programId)
        );
        showToast("Đã hủy theo dõi chương trình", "success");
      } else {
        // Follow case
        const response = await apiFetch("ProgramFollow/follow", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
          body: JSON.stringify({
            accountID: accountId,
            programID: programId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to follow program");
        }

        const data = await response.json();
        setFollowedPrograms((prev) => [...prev, data]);
        showToast("Đã theo dõi chương trình thành công", "success");
      }
    } catch (error) {
      console.error("Follow/unfollow error:", error);
      showToast(
        existingFollow
          ? "Đã có lỗi trong khi xử lý yêu cầu hủy theo dõi. Vui lòng thử lại sau."
          : "Không thể theo dõi chương trình",
        "error"
      );
    }
  };

  const showToast = (message, type = "info") => {
    setToast({
      show: true,
      message,
      type,
    });
  };

  const convertToGMT7 = (dateString) => {
    if (!dateString) return new Date();
    const date = new Date(dateString);
    return new Date(date.getTime() + 7 * 60 * 60 * 1000);
  };

  const fetchPrograms = async () => {
    try {
      const response = await apiFetch("Program/all", {
        headers: { accept: "*/*" },
      });

      if (!response.ok) {
        throw new Error("Lỗi khi tải dữ liệu");
      }

      const data = await response.json();
      const processedPrograms = data.data.$values
        .filter((program) => program.status === "Active")
        .map((program) => ({
          ...program,
          schedules: program.schedules.$values.map((schedule) => ({
            ...schedule,
            startTime: convertToGMT7(schedule.startTime),
            endTime: convertToGMT7(schedule.endTime),
            status: schedule.status,
          })),
        }));

      setPrograms(processedPrograms);
      setSearchState((prev) => ({
        ...prev,
        originalPrograms: processedPrograms,
      }));
      return processedPrograms;
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      showToast("Lỗi khi tải dữ liệu chương trình", "error");
      return [];
    }
  };

  useEffect(() => {
    const fetchFollowedPrograms = async () => {
      const accountId = getAccountId();

      if (filters.sort === "following") {
        if (!accountId) {
          showToast("Vui lòng đăng nhập để xem danh sách theo dõi", "error");
          setFilters((prev) => ({ ...prev, sort: "newest" }));
          return;
        }

        try {
          const response = await apiFetch(
            `ProgramFollow/account/${accountId}`,
            {
              headers: { accept: "text/plain" },
            }
          );

          if (!response.ok) {
            if (response.status === 500) {
              const errorData = await response.json();
              if (errorData.message === "No follows found for this account.") {
                showToast("Bạn chưa theo dõi chương trình nào.", "info");
                setFollowedPrograms([]);
                return;
              }
            }
            throw new Error("Failed to fetch followed programs");
          }

          const data = await response.json();
          setFollowedPrograms(data.$values);
          showToast(
            `Có ${data.$values.length} kết quả cho mục Đang theo dõi.`,
            "success"
          );
        } catch (error) {
          console.error("Fetch error:", error);
          showToast("Đã có lỗi không xác định xảy ra.", "error");
          setFollowedPrograms([]);
        }
      }
    };

    fetchFollowedPrograms();
  }, [filters.sort]);

  const fetchVideoHistory = async () => {
    try {
      const response = await apiFetch("VideoHistory/active", {
        headers: { accept: "*/*" },
      });

      if (!response.ok) throw new Error("Lỗi khi tải lịch sử video");
      const data = await response.json();

      const videos = data.$values.map((video) => ({
        title: video.program?.programName || "Chương trình không xác định",
        university:
          video.program?.schoolChannel?.name || "Trường không xác định",
        viewers: Math.floor(Math.random() * 10000),
        duration: "1:00:00",
        timestamp: new Date(video.streamAt).getTime(),
        thumbnail: `https://picsum.photos/800/450?random=${Math.random()}`,
        universityAvatar: `https://picsum.photos/24/24?random=${Math.random()}`,
      }));

      setVideos(videos);
      return videos;
    } catch (error) {
      console.error("Lỗi khi tải video:", error);
      showToast("Lỗi khi tải video lưu trữ", "error");
      return [];
    }
  };

  const handleSearchInputChange = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));

    // If search box is cleared, restore original programs
    if (value === "") {
      setPrograms(searchState.originalPrograms);
    }
  };

  const executeSearch = useCallback(
    async (searchTerm) => {
      try {
        setSearchState((prev) => ({ ...prev, isLoading: true }));

        if (searchTerm.trim() === "") {
          setPrograms(searchState.originalPrograms);
        } else {
          const results = searchState.originalPrograms.filter((program) =>
            program.programName.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setPrograms(results);

          // Show appropriate toast message
          if (results.length === 0) {
            showToast("Không tìm thấy chương trình phù hợp", "info");
          } else {
            showToast(`Tìm thấy ${results.length} chương trình`, "success");
          }
        }
      } catch (error) {
        showToast("Lỗi tìm kiếm", "error");
      } finally {
        setSearchState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [searchState.originalPrograms]
  );

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (filters.search !== searchState.lastSearch) {
        executeSearch(filters.search);
        setSearchState((prev) => ({ ...prev, lastSearch: filters.search }));
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters.search, executeSearch]);

  const handleUniversityFilterClick = useCallback(async () => {
    setShowUniversityModal(true); // Show modal immediately

    if (universities.length === 0) {
      try {
        const freshPrograms = await fetchPrograms();
        const uniqueUnis = [
          ...new Set(freshPrograms.map((p) => p.schoolChannel?.name)),
        ].filter(Boolean);
        setUniversities(uniqueUnis);
      } catch (error) {
        showToast("Không tải được danh sách trường", "error");
        setShowUniversityModal(false);
      }
    }
  }, [universities]);

  useEffect(() => {
    if (pendingUniversityModal && universities.length > 0) {
      setShowUniversityModal(true);
      setPendingUniversityModal(false);
    }
  }, [universities, pendingUniversityModal]);

  const sortPrograms = (programArray, criteria) => {
    const sortedArray = [...programArray];
    switch (criteria) {
      case "newest":
        return sortedArray.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt) // Old "Mới nhất" (by creation time)
        );
      case "newest-updated": // New sorting option
        return sortedArray.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt) // NEW: Sort by last updated time
        );
      case "viewers":
        return sortedArray.sort((a, b) => b.viewers - a.viewers);
      default:
        return sortedArray;
    }
  };

  const filterByUniversity = (programArray, university) => {
    if (university === "all") return programArray;
    return programArray.filter(
      (program) => program.schoolChannel?.name === university
    );
  };

  const getFilteredPrograms = () => {
    let filteredPrograms = programs;

    // Apply university filter first
    filteredPrograms = filterByUniversity(filteredPrograms, filters.university);

    // Then apply sorting/following filter
    if (filters.sort === "following") {
      filteredPrograms = filteredPrograms.filter((program) =>
        followedPrograms.some((f) => f.programID === program.programID)
      );
    } else {
      filteredPrograms = sortPrograms(filteredPrograms, filters.sort);
    }

    return filteredPrograms;
  };

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);

    const initializeData = async () => {
      await fetchPrograms();
      await fetchVideoHistory();

      if (programs.length > 0) {
        const uniqueUnis = [
          ...new Set(programs.map((p) => p.schoolChannel?.name)),
        ].filter(Boolean);
        setUniversities(uniqueUnis);
      }
    };

    initializeData();
  }, [theme]);

  const ProgramSection = () => {
    const filteredPrograms = getFilteredPrograms();

    return (
      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faBroadcastTower} />
            Chương trình sẵn có
            <span className={styles.streamCount}>
              {`${filteredPrograms.length} chương trình`}
            </span>
          </h2>
        </div>

        {searchState.isLoading ? (
          <div style={{ textAlign: "center", margin: "2rem" }}>
            <FontAwesomeIcon icon={faSpinner} spin />
            Đang tải...
          </div>
        ) : filteredPrograms.length > 0 ? (
          <div className={styles.contentGrid}>
            {filteredPrograms.map((program, index) => (
              <div
                key={index}
                className={styles.streamCard}
                onClick={() => setSelectedProgram(program)}
              >
                <div className={styles.streamThumbnail}>
                  <img
                    src={
                      program.thumbnail ||
                      `https://picsum.photos/800/450?${program.id}`
                    }
                    alt={program.programName}
                  />
                  <div className={styles.recordedBadge}>
                    <FontAwesomeIcon icon={faTv} /> CHƯƠNG TRÌNH
                  </div>
                </div>
                <div className={styles.streamInfo}>
                  <h3 className={styles.streamTitle}>{program.programName}</h3>
                  <div className={styles.streamMeta}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <div className={styles.streamScheduleCounter}>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          {` ${program.schedules.length} lịch phát`}
                        </span>
                      </div>
                      <div className={styles.streamUniversity}>
                        <img
                          src={
                            program.schoolChannel?.universityAvatar ||
                            `https://picsum.photos/24/24?${program.id}`
                          }
                          className={styles.universityAvatar}
                          alt="University"
                        />
                        <span>
                          {program.schoolChannel?.name ||
                            "Trường không xác định"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", margin: "2rem" }}>
            Không tìm thấy chương trình nào
          </div>
        )}
      </section>
    );
  };

  const VideoSection = () => {
    return (
      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faVideo} />
            Video Lưu Trữ
            <span className={styles.streamCount}>
              {`${videos.length} video`}
            </span>
          </h2>
        </div>

        {videos.length > 0 ? (
          <div className={styles.contentGrid}>
            {videos.map((video, index) => (
              <div key={index} className={styles.streamCard}>
                <div className={styles.streamThumbnail}>
                  <img src={video.thumbnail} alt={video.title} />
                  <div className={styles.recordedBadge}>
                    <FontAwesomeIcon icon={faPlay} /> ĐÃ PHÁT
                  </div>
                  <div className={styles.streamDuration}>{video.duration}</div>
                </div>
                <div className={styles.streamInfo}>
                  <h3 className={styles.streamTitle}>{video.title}</h3>
                  <div className={styles.streamMeta}>
                    <div className={styles.streamUniversity}>
                      <img
                        src={video.universityAvatar}
                        className={styles.universityAvatar}
                        alt="University"
                      />
                      <span>{video.university}</span>
                    </div>
                    <div className={styles.streamStats}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", margin: "2rem" }}>
            Không tìm thấy video nào
          </div>
        )}
      </section>
    );
  };

  return (
    <>
      <div className={styles.globalStyles} />
      <main className={styles.mainContainer}>
        <AnimatePresence>
          {toast.show && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast({ message: "", type: "", show: false })}
            />
          )}
        </AnimatePresence>

        <section className={styles.filterSection}>
          <div className={styles.filterButtonGroup}>
            <button
              className={styles.sortButton}
              onClick={() => setShowSortModal(true)}
            >
              <FontAwesomeIcon icon={faSort} />
              Sắp xếp
              {filters.sort !== "newest" && (
                <span style={{ marginLeft: "0.5rem" }}>
                  (
                  {filters.sort === "viewers"
                    ? "Lượt xem"
                    : filters.sort === "following"
                    ? "Theo dõi"
                    : filters.sort === "newest-updated"
                    ? "Cập nhật"
                    : ""}
                  )
                </span>
              )}
            </button>

            <button
              className={styles.filterButton}
              onClick={handleUniversityFilterClick}
            >
              <FontAwesomeIcon icon={faSchool} />
              Trường
              {filters.university !== "all" && (
                <span style={{ marginLeft: "0.5rem" }}>
                  ({filters.university})
                </span>
              )}
            </button>
          </div>

          <div className={styles.searchBoxWrapper}>
            <div className={styles.searchBox}>
              <FontAwesomeIcon
                icon={searchState.isLoading ? faSpinner : faSearch}
                spin={searchState.isLoading}
                className={styles.searchIcon}
              />
              <input
                type="text"
                placeholder="Tìm kiếm chương trình..."
                value={filters.search}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                className={styles.searchInput}
                onKeyPress={(e) =>
                  e.key === "Enter" && executeSearch(filters.search)
                }
              />
              {filters.search && (
                <button
                  className={styles.cancelButton}
                  onClick={() => handleSearchInputChange("")}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
              <button
                className={styles.searchButton}
                onClick={() => executeSearch(filters.search)}
                disabled={searchState.isLoading}
              >
                {searchState.isLoading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  "Tìm kiếm"
                )}
              </button>
            </div>
          </div>
        </section>

        <SortModal
          isOpen={showSortModal}
          onClose={() => setShowSortModal(false)}
          currentSort={filters.sort}
          onSave={(sort) => {
            setFilters((prev) => ({ ...prev, sort }));
            setShowSortModal(false);
            showToast(
              sort === "newest"
                ? "Đã sắp xếp theo mới nhất"
                : sort === "newest-updated"
                ? "Đã sắp xếp theo cập nhật mới nhất"
                : sort === "viewers"
                ? "Đã sắp xếp theo lượt xem"
                : "Đã sắp xếp",
              "success"
            );
          }}
        />

        <UniversityModal
          isOpen={showUniversityModal}
          onClose={() => setShowUniversityModal(false)}
          universities={universities}
          selectedUniversity={filters.university}
          onSelect={(uni) =>
            setFilters((prev) => ({ ...prev, university: uni }))
          }
        />

        <ProgramSection />

        <VideoSection />

        {selectedProgram && (
          <ProgramModal
            key={selectedProgram.id}
            program={selectedProgram}
            onClose={() => setSelectedProgram(null)}
            followedProgramIds={followedPrograms.map((f) => f.programID)}
            handleFollow={handleFollow}
          />
        )}
      </main>
    </>
  );
};

export default LiveList;
