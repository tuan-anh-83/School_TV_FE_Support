import React, { useEffect, useState } from "react";
import { Table, Card, Typography } from "antd";
import { useOutletContext } from "react-router";
import apiFetch from "../../config/baseAPI";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { extractVideoId, getThumbnailUrl } from "../../utils/image";

const { Title } = Typography;

const VideoHistoryListPage = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { channel } = useOutletContext();

  // Sample data for videoHistories
  const getVideos = async (channelId) => {
    if (!channelId) {
      toast.error("ID kênh không hợp lệ!");
      return;
    }
    try {
      setIsLoading(true);
      const response = await apiFetch(`VideoHistory/by-channel/${channelId}`, {
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

      console.log(data);

      if (data && data.$values.length > 0) {
        setVideos(data.$values);
      }
    } catch (error) {
      console.error("Error checking channel:", error);
      toast.error(error.message || "Có lỗi xảy ra khi kiểm tra kênh!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (channel && channel.$values) {
      getVideos(channel.$values[0].schoolChannelID);
    } else {
      setIsLoading(false);
    }
  }, [channel]);

  const handleError = (e) => {
    e.target.onerror = null; // tránh loop nếu fallback lỗi
    e.target.src =
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYe8pY2GWIHYPfuxsUChCBHeVmX5vplQetsQ&s";
  };

  // Table columns configuration
  const columns = [
    {
      title: "Thumbnail",
      dataIndex: "playbackUrl",
      key: "playbackUrl",
      width: 80,
      render: (playbackUrl) => (
        <img
          width={80}
          height={80}
          style={{ objectFit: "cover" }}
          src={getThumbnailUrl(extractVideoId(playbackUrl))}
          alt=""
          onError={handleError}
        />
      ),
    },
    {
      title: "Program",
      dataIndex: "programName",
      key: "programName",
      width: 150,
      ellipsis: true,
      sorter: (a, b) =>
        a.program.programName.localeCompare(b.program.programName),
      render: (_, record) => record.program.programName,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 150,
      ellipsis: true,
      sorter: (a, b) => a.description.localeCompare(b.description),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: "Storage",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (status ? "Có" : "Không"),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (createdAt) => dayjs(createdAt).format("DD-MM-YYYY"),
    },
  ];

  return (
    <div>
      <Card style={{ border: 0 }}>
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Danh sách Video
          </Title>
        </div>

        <Table
          columns={columns}
          dataSource={videos}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} videos`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default VideoHistoryListPage;
