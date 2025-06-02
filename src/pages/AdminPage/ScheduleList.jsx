import "./ScheduleList.scss";
import {
  Layout,
  Table,
  Input,
  Button,
  Modal,
  Spin,
  List,
  Checkbox,
  Empty,
  TimePicker,
  Tooltip,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import apiFetch from "../../config/baseAPI";
import AdminMenu from "./AdminMenu";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { extractVideoClId, getThumbnailUrl } from "../../utils/image";
import { CheckCircleFilled, WarningFilled } from "@ant-design/icons";
const { Sider, Content } = Layout;
const { Search } = Input;

function ScheduleList() {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [initialData, setInitialData] = useState([]);
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const handleCancel = () => {
    setIsModalVisible(false);
    setAds([]);
    setAdsLoading(false);
    setSelectedSchedule(null);
  };

  const fetchData = async () => {
    try {
      const response = await apiFetch("schedule/suitable", {
        headers: {
          accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const responseData = await response.json();

      if (
        responseData &&
        responseData?.$values &&
        responseData?.$values.length > 0
      ) {
        setData(responseData.$values);
        setInitialData(responseData.$values);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.message.includes("Failed to fetch data")) {
        localStorage.removeItem("authToken");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleSubmit = async (selectedAds, scheduleID) => {
    // Format the request body according to AdLiveStream model properties
    const requestBody = {
      scheduleId: scheduleID,
      ads: selectedAds.map((ad) => ({
        adScheduleId: ad.adScheduleId,
        playAt: ad.playAt,
        duration: ad.duration,
      })),
    };

    try {
      setRequestLoading(true);
      const response = await apiFetch("AdLiveStream/add-to-livestream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = new Error("Request failed");
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      if (data) {
        toast.success(
          data?.message && data?.message !== ""
            ? data?.message
            : `Chèn quảng cáo thành công. Đã thêm ${
                data?.added ?? 0
              } - bỏ qua ${data?.skipped ?? 0} quảng cáo.`
        );
        await fetchData();
      }
    } catch (error) {
      console.error("Error submitting ads:", error);
      toast.error("Failed to add advertisements");
    } finally {
      setRequestLoading(false);
      setIsModalVisible(false);
    }
  };

  const handleSearch = (value) => {
    if (value.trim() === "") {
      setData(initialData);
    } else {
      const filteredData = initialData.filter(
        (user) =>
          user.username.toLowerCase().startsWith(value.toLowerCase()) ||
          user.email.toLowerCase().startsWith(value.toLowerCase())
      );
      setData(filteredData);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/login");
    window.dispatchEvent(new Event("storage"));
  };

  const handleOpenSelectAds = async (record) => {
    setIsModalVisible(true);
    setAdsLoading(true);
    setSelectedSchedule(record);

    try {
      const response = await apiFetch(
        `AdSchedule/valid?start=${dayjs(record.startTime).format(
          "YYYY-MM-DD HH:mm:ss"
        )}&end=${dayjs(record.endTime).format("YYYY-MM-DD HH:mm:ss")}`,
        {
          headers: {
            accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const responseData = await response.json();

      if (
        responseData?.data &&
        responseData?.data?.$values &&
        responseData?.data?.$values.length > 0
      ) {
        setAds(responseData?.data?.$values);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.message.includes("Failed to fetch data")) {
        localStorage.removeItem("authToken");
        navigate("/login");
      }
    } finally {
      setTimeout(() => setAdsLoading(false), 500);
    }
  };

  const columns = [
    {
      title: "",
      dataIndex: "",
      key: "image",
      width: 50,
      render: () => (
        <img
          src="https://media.istockphoto.com/id/1191487528/vector/live-stream-icon-live-streaming-element-for-broadcasting-or-online-tv-stream-video-stream.jpg?s=612x612&w=0&k=20&c=rD0ksJFyHUsh71gbduf3G-LwMoPmefinSaCqH8pwBCo="
          alt="Avatar"
          style={{ width: "50px", height: "50px", borderRadius: "50%" }}
        />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (_, record) => (
        <span>
          {record.program?.title ?? "No title"} <br />
        </span>
      ),
    },
    {
      title: "Channel",
      dataIndex: "channel",
      key: "channel",
      render: (_, record) => (
        <span>
          {record.program?.schoolChannel?.name ?? "No channel"} <br />
        </span>
      ),
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      key: "startTime",
      render: (value) =>
        value ? dayjs(value).format("DD/MM/YYYY HH:mm:ss") : "-",
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      key: "endTime",
      render: (value) =>
        value ? dayjs(value).format("DD/MM/YYYY HH:mm:ss") : "-",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            type="primary"
            danger
            style={{ marginLeft: 10, width: "60px" }}
            onClick={async () => await handleOpenSelectAds(record)}
          >
            Chèn
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="userlist-body">
      <Layout style={{ minHeight: "90vh" }}>
        <Sider width={225} className="site-layout-background">
          <AdminMenu onLogout={handleLogout} />
        </Sider>

        <Layout style={{ padding: "0 24px 24px" }}>
          <Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Search
                placeholder="Search Ads"
                allowClear
                enterButton="Search"
                size="large"
                onSearch={handleSearch}
                style={{ marginBottom: "20px", width: "300px" }}
              />
            </div>
            <Table
              columns={columns}
              dataSource={data}
              pagination={{ pageSize: 8 }}
              rowKey="scheduleID"
            />
          </Content>
        </Layout>
      </Layout>

      <AdsSelectionModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onAddAds={handleSubmit}
        ads={ads}
        loading={adsLoading}
        schedule={selectedSchedule}
        requestLoading={requestLoading}
      />
    </div>
  );
}

const AdsSelectionModal = ({
  visible,
  onCancel,
  onAddAds,
  ads,
  loading,
  schedule,
  requestLoading
}) => {
  const [selectedAdIds, setSelectedAdIds] = useState([]);
  const [selectedAdDetails, setSelectedAdDetails] = useState([]);
  const [selectedAdForTimeline, setSelectedAdForTimeline] = useState(null);

  // Calculate schedule start and end times
  const scheduleStartTime = schedule ? dayjs(schedule.startTime) : null;
  const scheduleEndTime = schedule ? dayjs(schedule.endTime) : null;

  // Calculate timeline points
  const timelinePoints = useMemo(() => {
    if (!scheduleStartTime || !scheduleEndTime) return [];

    const durationMinutes = scheduleEndTime.diff(scheduleStartTime, "minute");
    const points = [];

    // Create points every 5 minutes
    for (let i = 0; i <= durationMinutes; i += 5) {
      const time = scheduleStartTime.add(i, "minute");
      points.push({
        time,
        label: time.format("HH:mm"),
        position: (i / durationMinutes) * 100,
      });
    }

    return points;
  }, [scheduleStartTime, scheduleEndTime]);

  const handleCheckboxChange = (ad) => {
    const adId = ad.adScheduleID;

    setSelectedAdIds((prev) => {
      if (prev.includes(adId)) {
        // Remove ad
        setSelectedAdDetails((prevDetails) =>
          prevDetails.filter((detail) => detail.adScheduleId !== adId)
        );
        return prev.filter((id) => id !== adId);
      } else {
        // Add ad and select it for timeline placement
        setSelectedAdForTimeline(ad);
        return [...prev, adId];
      }
    });
  };

  const handleTimePickerChange = (time) => {
    if (!time || !selectedAdForTimeline) return;

    // Combine the selected date with the selected time
    const combinedDateTime = scheduleStartTime
      .hour(time.hour())
      .minute(time.minute())
      .second(time.second());

    // Validate time is within schedule
    if (
      combinedDateTime.isBefore(scheduleStartTime) ||
      combinedDateTime.isAfter(scheduleEndTime)
    ) {
      toast.warning("Selected time must be within schedule duration");
      return;
    }

    const playAt = combinedDateTime;
    const durationSeconds = selectedAdForTimeline.durationSeconds;

    // Calculate end time based on duration
    const endTime = playAt.add(durationSeconds, "second");

    // Check if end time exceeds schedule end time
    if (endTime.isAfter(scheduleEndTime)) {
      toast.warning("Ad would run past the end of scheduled stream time");
      return;
    }

    // Check for overlaps with other selected ads
    const hasOverlap = selectedAdDetails.some((ad) => {
      const adStartTime = dayjs(ad.playAt);
      const adEndTime = adStartTime.add(ad.duration, "second");

      return (
        (playAt.isAfter(adStartTime) && playAt.isBefore(adEndTime)) ||
        (endTime.isAfter(adStartTime) && endTime.isBefore(adEndTime)) ||
        (playAt.isBefore(adStartTime) && endTime.isAfter(adEndTime))
      );
    });

    if (hasOverlap) {
      toast.warning("This time slot overlaps with another ad");
      return;
    }

    // Add or update ad timing
    setSelectedAdDetails((prev) => {
      const existingIndex = prev.findIndex(
        (ad) => ad.adScheduleId === selectedAdForTimeline.adScheduleID
      );

      const newAdDetail = {
        adScheduleId: selectedAdForTimeline.adScheduleID,
        playAt: playAt.format("YYYY-MM-DD HH:mm:ss"),
        duration: durationSeconds,
        title: selectedAdForTimeline.title,
      };

      if (existingIndex >= 0) {
        const newDetails = [...prev];
        newDetails[existingIndex] = newAdDetail;
        return newDetails;
      } else {
        return [...prev, newAdDetail];
      }
    });

    setSelectedAdForTimeline(null);
  };

  const handleAddSelected = () => {
    if (selectedAdIds.length === 0) {
      toast.warning("Please select at least one ad");
      return;
    }

    if (selectedAdDetails.length < selectedAdIds.length) {
      toast.warning("Please set play time for all selected ads");
      return;
    }

    // Format data for AdLiveStream table
    const adLiveStreamData = selectedAdDetails.map((ad) => ({
      adScheduleId: ad.adScheduleId,
      scheduleID: schedule?.scheduleID,
      playAt: ad.playAt,
      isPlayed: false,
      duration: ad.duration,
    }));

    onAddAds(
      adLiveStreamData,
      schedule?.scheduleID,
    );

    // Reset selections
    setSelectedAdIds([]);
    setSelectedAdDetails([]);
  };

  // Timeline display of scheduled ads
  const scheduledAdsMarkers = useMemo(() => {
    if (!scheduleStartTime || !scheduleEndTime) return [];

    const totalDuration = scheduleEndTime.diff(scheduleStartTime, "minute");

    return selectedAdDetails.map((ad, index) => {
      const adStart = dayjs(ad.playAt);
      const startPosition =
        (adStart.diff(scheduleStartTime, "minute") / totalDuration) * 100;

      // Calculate ad duration in minutes for display
      const durationInMinutes = ad.duration / 60;
      const durationWidth = (durationInMinutes / totalDuration) * 100;

      // Calculate end time for display
      const adEnd = adStart.add(ad.duration, "second");

      return {
        id: ad.adScheduleId,
        start: startPosition,
        width: Math.max(durationWidth, 1), // Ensure minimum width for visibility
        title: ad.title,
        time: `${adStart.format("HH:mm:ss")} - ${adEnd.format("HH:mm:ss")}`,
        color: `hsl(${(index * 35) % 360}, 70%, 60%)`,
      };
    });
  }, [selectedAdDetails, scheduleStartTime, scheduleEndTime]);

  // Clear selections when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedAdIds([]);
      setSelectedAdDetails([]);
      setSelectedAdForTimeline(null);
    }
  }, [visible]);

  // Load existing ads if any
  useEffect(() => {
    if (
      schedule &&
      schedule.adLiveStreams &&
      schedule.adLiveStreams.$values &&
      schedule.adLiveStreams.$values.length > 0
    ) {
      const existingAds = schedule.adLiveStreams.$values;
      setSelectedAdIds(existingAds.map((ad) => ad.adScheduleID));

      const details = existingAds.map((ad) => ({
        adScheduleId: ad.adScheduleID,
        playAt: ad.playAt,
        duration: ad.duration,
        title:
          ads.find((a) => a.adScheduleID === ad.adScheduleID)?.title || "Ad",
      }));

      setSelectedAdDetails(details);
    }
  }, [schedule, ads]);

  // Remove an ad from timeline
  const handleRemoveAdFromTimeline = (adId) => {
    setSelectedAdDetails((prev) =>
      prev.filter((ad) => ad.adScheduleId !== adId)
    );
    setSelectedAdIds((prev) => prev.filter((id) => id !== adId));
  };

  return (
    <Modal
      title="Select Advertisements"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="add"
          type="primary"
          onClick={handleAddSelected}
          loading={requestLoading}
          disabled={
            requestLoading ||
            selectedAdIds.length === 0 ||
            selectedAdDetails.length < selectedAdIds.length
          }
        >
          Add Selected ({selectedAdIds.length})
        </Button>,
      ]}
      width={700}
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingBlock: 32,
          }}
        >
          <Spin size="large" />
        </div>
      ) : ads.length > 0 ? (
        <div>
          {/* Timeline Section */}
          <div className="timeline-section" style={{ marginBottom: 20 }}>
            <h3>Schedule Timeline</h3>
            <p>
              {scheduleStartTime && scheduleEndTime
                ? `${scheduleStartTime.format(
                    "DD/MM/YYYY HH:mm"
                  )} - ${scheduleEndTime.format("HH:mm")}`
                : "No schedule selected"}
            </p>

            {/* Timeline visualization */}
            <div
              className="timeline-container"
              style={{
                position: "relative",
                height: "120px",
                backgroundColor: "#f0f2f5",
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              {/* Timeline ruler */}
              <div
                className="timeline-ruler"
                style={{
                  position: "relative",
                  height: "30px",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "2px",
                    backgroundColor: "#d9d9d9",
                    top: "15px",
                  }}
                />

                {timelinePoints.map((point, index) => (
                  <div
                    key={index}
                    style={{
                      position: "absolute",
                      left: `${point.position}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div
                      style={{
                        width: "1px",
                        height: "10px",
                        backgroundColor: "#979797",
                        margin: "0 auto",
                      }}
                    />
                    <div
                      style={{
                        fontSize: "10px",
                        marginTop: "2px",
                        textAlign: "center",
                      }}
                    >
                      {point.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ad markers */}
              <div
                className="timeline-ads"
                style={{ position: "relative", height: "40px" }}
              >
                {scheduledAdsMarkers.map((marker, index) => (
                  <Tooltip
                    key={marker.id}
                    title={`${marker.title} (${marker.time})`}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: `${marker.start}%`,
                        width: `${Math.max(marker.width, 2)}%`,
                        height: "30px",
                        backgroundColor: marker.color,
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "10px",
                        color: "white",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        padding: "0 4px",
                      }}
                      onClick={() => handleRemoveAdFromTimeline(marker.id)}
                    >
                      {marker.width > 5 ? marker.title : ""}
                    </div>
                  </Tooltip>
                ))}
              </div>

              {/* Ad placement controls */}
              {selectedAdForTimeline && (
                <div
                  className="ad-placement-controls"
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ marginRight: "10px", fontWeight: "bold" }}>
                    Place "{selectedAdForTimeline.title}" at:
                  </span>
                  <TimePicker
                    format="HH:mm:ss"
                    allowClear={false}
                    onChange={handleTimePickerChange}
                    defaultValue={scheduleStartTime}
                    disabledTime={() => ({
                      disabledHours: () => {
                        const hours = [];
                        for (let i = 0; i < 24; i++) {
                          if (
                            i < scheduleStartTime.hour() ||
                            i > scheduleEndTime.hour()
                          ) {
                            hours.push(i);
                          }
                        }
                        return hours;
                      },
                    })}
                  />
                  <Button
                    style={{ marginLeft: "10px" }}
                    onClick={() => setSelectedAdForTimeline(null)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Ad Selection List */}
          <List
            className="ads-ant-list"
            itemLayout="horizontal"
            dataSource={ads}
            renderItem={(ad) => {
              const isSelected = selectedAdIds.includes(ad.adScheduleID);
              const isScheduled = selectedAdDetails.some(
                (detail) => detail.adScheduleId === ad.adScheduleID
              );

              return (
                <List.Item
                  key={ad.adScheduleID}
                  className={`ads-ant-list-item ${
                    isSelected ? "ads-ant-list-item-selected" : ""
                  }`}
                  onClick={() => handleCheckboxChange(ad)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="ads-ant-item-container"
                    style={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleCheckboxChange(ad)}
                      className="ads-ant-item-checkbox"
                    />
                    <img
                      src={getThumbnailUrl(extractVideoClId(ad.videoUrl))}
                      alt="Ad Thumbnail"
                      className="ads-ant-item-image"
                      style={{
                        width: "120px",
                        height: "68px",
                        objectFit: "cover",
                        margin: "0 10px",
                      }}
                    />
                    <div className="ads-ant-item-content" style={{ flex: 1 }}>
                      <div
                        className="ads-ant-item-title"
                        style={{ fontWeight: "bold" }}
                      >
                        {ad.title}
                      </div>
                      <div className="ads-ant-item-subtitle">
                        Duration: {ad.durationSeconds} seconds
                      </div>
                    </div>
                    <div
                      className="ads-ant-item-status"
                      style={{
                        marginLeft: "10px",
                        width: "100px",
                        textAlign: "center",
                      }}
                    >
                      {isScheduled ? (
                        <Tooltip title="Scheduled">
                          <CheckCircleFilled
                            style={{ color: "#52c41a", fontSize: "18px" }}
                          />
                        </Tooltip>
                      ) : isSelected ? (
                        <Tooltip title="Select a time slot">
                          <WarningFilled
                            style={{ color: "#faad14", fontSize: "18px" }}
                          />
                        </Tooltip>
                      ) : null}
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        </div>
      ) : (
        <Empty
          description={"No available ads for this time period"}
          style={{ paddingBlock: 32 }}
        />
      )}
    </Modal>
  );
};

export default ScheduleList;
