import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Card,
  Typography,
  Switch,
  Upload,
  InputNumber,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
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

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [form] = Form.useForm();

  // Handle edit video
  const handleEdit = (record) => {
    // setEditingVideo(record);
    // form.setFieldsValue({
    //   title: record.title,
    // });
    // setIsModalVisible(true);
  };

  // Handle delete post
  const handleDelete = async (record) => {
    // setIsLoading(true);
    // const response = await apiFetch(`VideoHistory/${record.videoHistoryID}`, {
    //   method: "DELETE",
    // });
    // if (!response.ok) {
    //   toast.error(data?.error || "Có lỗi xảy ra khi xóa!");
    //   throw new Error(data?.error || "Có lỗi xảy ra khi xóa!");
    // }
    // toast.success("Video deleted successfully!");
    // setIsModalVisible(false);
    // form.resetFields();
    // setIsLoading(false);
  };

  // Handle modal OK
  const handleModalOk = async () => {
    try {
      setIsLoading(true);
      const formValues = await form.validateFields();

      // Update existing post
      const response = await apiFetch(
        `VideoHistory/${editingVideo.videoHistoryID}`,
        {
          method: "PUT",
          body: JSON.stringify(formValues),
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error || "Có lỗi xảy ra khi cập nhật!");
        throw new Error(data?.error || "Có lỗi xảy ra khi cập nhật!");
      }

      toast.success("Video updated successfully!");

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingVideo(null);
  };

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
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          ></Button>
          <Popconfirm
            title="Delete Post"
            description="Are you sure you want to delete this post?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            ></Button>
          </Popconfirm>
        </Space>
      ),
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
            Danh sách chương trình
          </Title>
        </div>

        <Table
          columns={columns}
          dataSource={videos}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} videos`,
          }}
          scroll={{ x: 800 }}
        />

        <Modal
          title={"Edit Video"}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          loading={isLoading}
          width={600}
          okText={"Update"}
        >
          <Form form={form} layout="vertical" name="post_form">
            <Form.Item
              name="programName"
              label="Tên chương trình"
              rules={[
                {
                  required: false,
                  message: "Please input the program name!",
                },
              ]}
            >
              <Input placeholder="Enter program name" />
            </Form.Item>

            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[
                { required: true, message: "Please input the program title!" },
                {
                  min: 3,
                  message: "Title must be at least 3 characters long!",
                },
              ]}
            >
              <Input placeholder="Enter program title" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default VideoHistoryListPage;
