import React, { useEffect, useState } from "react";
import "./AdsList.scss";
import {
  Form,
  Table,
  Button,
  Modal,
  Space,
  Input,
  InputNumber,
  Spin,
  Popconfirm,
  Typography,
  Upload,
  message,
} from "antd";
import { useSelector } from "react-redux";
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import "@mdxeditor/editor/style.css";
import { toast } from "react-toastify";
import apiFetch from "../../config/baseAPI";
import { extractVideoId, getThumbnailUrl } from "../../utils/image";

const { Title } = Typography;

function AdsList() {
  const user = useSelector((state) => state.userData.user);
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUploadBtn, setLoadingUploadBtn] = useState(false);
  const [ads, setAds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [previewPostData, setPreviewPostData] = useState({
    owner: user?.fullname ?? "Not found advertiser",
    Title: "",
    VideoFile: null,
    VideoPreviewUrl: "",
    DurationSeconds: 0,
  });

  const handleVideoUpload = (info) => {
    // Check if we have a file from different possible sources
    const file =
      info.file || (info.fileList && info.fileList[0]?.originFileObj) || info;

    // Verify it's a real file object
    if (!file || typeof file !== "object" || !file.type) {
      console.error("Invalid file object:", file);
      message.error("Invalid file. Please try again.");
      return;
    }

    const isVideo = file.type.startsWith("video/");

    if (!isVideo) {
      message.error("You can only upload video files!");
      return;
    }

    const fileSizeMB = file.size / 1024 / 1024;
    console.log("File size (MB):", fileSizeMB);

    const isLt100M = fileSizeMB < 100;
    if (!isLt100M) {
      message.error("Video must be smaller than 100MB!");
      return;
    }

    setVideoFile(file);

    // Create object URL for preview
    try {
      const videoPreviewUrl = URL.createObjectURL(file);
      console.log("Created preview URL:", videoPreviewUrl);

      setPreviewPostData((prev) => ({
        ...prev,
        VideoFile: file,
        VideoPreviewUrl: videoPreviewUrl,
      }));

      // Need to manually update form since this happens outside normal form event
      form.setFieldsValue({
        VideoFile: file,
      });
    } catch (error) {
      console.error("Error creating object URL:", error);
      message.error("Error previewing video. Please try another file.");
    }
  };

  //Cập nhật text xem trước
  const handleFormChange = (_, allValues) => {
    setPreviewPostData((prev) => ({
      ...prev,
      Title: allValues.Title || "",
      DurationSeconds: allValues.DurationSeconds || 0,
    }));
  };

  const onFinish = async (values) => {
    try {
      if (!videoFile) {
        toast.error("Vui lòng tải lên video quảng cáo!");
        return;
      }

      setLoadingUploadBtn(true);

      const formData = new FormData();
      formData.append("title", values.Title);
      formData.append("durationSeconds", values.DurationSeconds);
      formData.append("videoFile", videoFile);

      const response = await apiFetch("AdSchedule/ads", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error || "Có lỗi xảy ra!");
        throw new Error(data?.error || "Có lỗi xảy ra!");
      }

      if (data) {
        toast.success("Tạo quảng cáo thành công!");
        form.resetFields();
        setVideoFile(null);
        setPreviewPostData({
          owner: user?.fullname ?? "Not found advertiser",
          Title: values.Title,
          VideoFile: null,
          VideoPreviewUrl: "",
          DurationSeconds: values.DurationSeconds,
        });
        onFetchAds(); // Refresh the ads list
      }
    } catch (error) {
      console.error("Error creating ad:", error);
    } finally {
      setLoadingUploadBtn(false);
    }
  };

  const onFetchAds = async () => {
    try {
      setLoading(true);

      const response = await apiFetch("AdSchedule/my", {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error || "Có lỗi xảy ra!");
        throw new Error(data?.error || "Có lỗi xảy ra!");
      }

      if (data) {
        setAds(data.data?.$values || []);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (record) => {
    setSelectedAd(record);
    updateForm.setFieldsValue({
      Title: record.title,
      DurationSeconds: record.durationSeconds,
    });
    setIsModalOpen(true);
  };

  const handlePreview = (record) => {
    setSelectedAd(record);
    setIsPreviewModalOpen(true);
  };

  const handleUpdateFinish = async (values) => {
    console.log(values);
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", values.Title);
      formData.append("durationSeconds", values.DurationSeconds);

      if (videoFile) {
        formData.append("videoFile", videoFile);
      }

      const response = await apiFetch(`AdSchedule/${selectedAd.adScheduleID}`, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error || "Có lỗi xảy ra khi cập nhật!");
        throw new Error(data?.error || "Có lỗi xảy ra khi cập nhật!");
      }

      toast.success("Cập nhật quảng cáo thành công!");
      setIsModalOpen(false);
      setVideoFile(null);
      setSelectedAd(null);
      onFetchAds(); // Refresh the ads list
    } catch (error) {
      console.error("Error updating ad:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);

      const response = await apiFetch(`AdSchedule/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error || "Có lỗi xảy ra khi xóa!");
        throw new Error(data?.error || "Có lỗi xảy ra khi xóa!");
      }

      toast.success("Xóa quảng cáo thành công!");
      onFetchAds(); // Refresh the ads list
    } catch (error) {
      console.error("Error deleting ad:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    onFetchAds();
  }, []);

  const uploadProps = {
    beforeUpload: (file) => {
      handleVideoUpload(file);
      return false; // Prevent auto upload
    },
    showUploadList: false,
  };

  const columns = [
    {
      title: "",
      dataIndex: "videoUrl",
      key: "videoUrl",
      width: 80,
      render: (videoUrl) => (
        <img
          width={80}
          height={80}
          style={{ borderRadius: 10 }}
          src={getThumbnailUrl(extractVideoId(videoUrl))}
          alt=""
        />
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Thời lượng (giây)",
      dataIndex: "durationSeconds",
      key: "durationSeconds",
      width: 160,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => {
        return text ? new Date(text).toLocaleString() : "N/A";
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
            size="small"
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleUpdate(record)}
            size="small"
          />
          <Popconfirm
            title="Xác nhận xóa quảng cáo này?"
            onConfirm={() => handleDelete(record.adScheduleID)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ marginTop: "50px" }}>
      <Title level={3} className="studio-function-title">
        Danh sách quảng cáo đã đăng
      </Title>

      <Spin spinning={loading}>
        <Table
          dataSource={ads}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          style={{ marginTop: 20 }}
        />
      </Spin>

      {/* Update Modal */}
      <Modal
        title="Cập nhật quảng cáo"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setVideoFile(null);
        }}
        footer={null}
      >
        <Form form={updateForm} layout="vertical" onFinish={handleUpdateFinish}>
          <Form.Item
            name="Title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input placeholder="Nhập tiêu đề quảng cáo" />
          </Form.Item>

          <Form.Item
            name="DurationSeconds"
            label="Thời lượng (giây)"
            rules={[{ required: true, message: "Vui lòng nhập thời lượng!" }]}
          >
            <InputNumber
              min={1}
              max={300}
              style={{ width: "100%" }}
              placeholder="Nhập thời lượng quảng cáo (giây)"
            />
          </Form.Item>

          <Form.Item
            label="Video quảng cáo"
            extra="Bỏ trống nếu không thay đổi video"
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>
                Click để tải lên video mới
              </Button>
            </Upload>
            {videoFile && <p style={{ marginTop: 8 }}>{videoFile.name}</p>}
          </Form.Item>

          <Form.Item style={{ marginTop: 16, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Xem trước quảng cáo"
        open={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setSelectedAd(null);
        }}
        onCancel={() => {
          setIsPreviewModalOpen(false);
          setSelectedAd(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsPreviewModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedAd && (
          <div>
            <p>
              <strong>Tiêu đề:</strong> {selectedAd.title}
            </p>
            <p>
              <strong>Thời lượng:</strong> {selectedAd.durationSeconds} giây
            </p>
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {new Date(selectedAd.createdAt).toLocaleString()}
            </p>
            {selectedAd.videoUrl && (
              <div style={{ marginTop: 16 }}>
                <iframe
                  width="100%"
                  controls
                  src={selectedAd.videoUrl}
                  style={{ height: "400px" }}
                >
                  Your browser does not support the video tag.
                </iframe>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdsList;
