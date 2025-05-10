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
} from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import apiFetch from "../../config/baseAPI";
import AdminMenu from "./AdminMenu";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { getYouTubeThumbnail } from "../../utils/image";
const { Sider, Content } = Layout;
const { Search } = Input;

function ScheduleList() {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [initialData, setInitialData] = useState([]);
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(false);
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

  const handleSubmit = async (selectedAds, scheduleID, accountID) => {
    const requestBody = {
      scheduleId: scheduleID,
      accountId: accountID,
      ads: selectedAds,
    };
    try {
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
      }
    } catch (error) {
      console.error("Error submitting ads:", error);
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
  schedule
}) => {
  const [selectedAdIds, setSelectedAdIds] = useState([]);

  const handleCheckboxChange = (adId) => {
    setSelectedAdIds((prev) => {
      if (prev.includes(adId)) {
        return prev.filter((id) => id !== adId);
      } else {
        return [...prev, adId];
      }
    });
  };

  const handleAddSelected = () => {
    if (selectedAdIds.length === 0) {
      toast.warning("Please select at least one ad");
      return;
    }

    const selectedAds = ads
      .filter((ad) => selectedAdIds.includes(ad.adScheduleID))
      .map((ad) => ({
        adScheduleId: ad.adScheduleID,
        playAt: dayjs(ad.startTime).format("YYYY-MM-DD HH:mm:ss"),
        duration: dayjs(ad.endTime).diff(dayjs(ad.startTime), "second"),
      }));

    onAddAds(selectedAds, schedule?.scheduleID, schedule?.program?.schoolChannel?.accountID);

    // Reset selections
    setSelectedAdIds([]);
    onCancel();
  };

  // Clear selections when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedAdIds([]);
    }
  }, [visible]);

  console.log("Selected Ad IDs:", selectedAdIds);

  useEffect(() => {
    if(schedule && schedule.adLiveStreams && schedule.adLiveStreams.$values.length > 0)
    {
      setSelectedAdIds(schedule.adLiveStreams.$values.map(ad => ad.adScheduleID));
    }
  }, [schedule]);

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
          disabled={selectedAdIds.length === 0}
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
        <List
          className="ads-ant-list"
          itemLayout="horizontal"
          dataSource={ads}
          renderItem={(ad) => (
            <List.Item
              key={ad.adScheduleID}
              className={`ads-ant-list-item ${
                selectedAdIds.includes(ad.adScheduleID)
                  ? "ads-ant-list-item-selected"
                  : ""
              }`}
              onClick={() => handleCheckboxChange(ad.adScheduleID)}
            >
              <div className="ads-ant-item-container">
                <Checkbox
                  checked={selectedAdIds.includes(ad.adScheduleID)}
                  onChange={() => handleCheckboxChange(ad.adScheduleID)}
                  className="ads-ant-item-checkbox"
                />
                <img
                  src={getYouTubeThumbnail(ad.videoUrl)}
                  alt="Ad Thumbnail"
                  className="ads-ant-item-image"
                />
                <div className="ads-ant-item-content">
                  <div className="ads-ant-item-title">{ad.title}</div>
                  <div className="ads-ant-item-subtitle">
                    {dayjs(ad.endTime).diff(dayjs(ad.startTime), "second")}{" "}
                    seconds
                  </div>
                </div>
                <div className="ads-ant-item-meta">
                  <div className="ads-ant-item-id">ID: {ad.adScheduleID}</div>
                  <div className="ads-ant-item-url">
                    <a
                      href={ad.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {ad.videoUrl}
                    </a>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description={"Select dates to search for available ads"}
          style={{ paddingBlock: 32 }}
        />
      )}
    </Modal>
  );
};

export default ScheduleList;
