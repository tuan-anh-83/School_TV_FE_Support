import React, { useEffect, useState, useRef } from "react";
import { Modal, Form, Input, Button, notification, Spin, Tag } from "antd";
import {
  EditOutlined,
  GlobalOutlined,
  MailOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  FireOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import apiFetch from "../../../config/baseAPI";
import "./StudioChannel.css";
import { formatDecimalHours } from "../../../utils/text";

const StudioChannel = () => {
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const initialValuesRef = useRef({});

  useEffect(() => {
    const fetchChannelData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        notification.error({
          message: "Lỗi xác thực!",
          description: "Bạn cần đăng nhập để xem thông tin kênh.",
          placement: "topRight",
        });
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams();
        params.append(
          "accountId",
          JSON.parse(localStorage.getItem("userData")).accountID
        );
        const response = await apiFetch(
          `/api/schoolchannels/search?${params.toString()}`
        );

        if (response.status === 404) {
          setChannel(null);
          return;
        }

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Có lỗi xảy ra!");
        }

        const data = await response.json();
        setChannel(data.$values[0]);
      } catch (error) {
        console.error("Error fetching channel data:", error);
        notification.error({
          message: "Lỗi!",
          description: "Không thể tải thông tin kênh.",
          placement: "topRight",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUpdateChannel = async (values) => {
    try {
      const changedFields = Object.keys(values).reduce((acc, key) => {
        if (
          String(values[key]).trim() !==
          String(initialValuesRef.current[key]).trim()
        ) {
          acc[key] = values[key];
        }
        return acc;
      }, {});

      // Check if any fields have changed
      if (Object.keys(changedFields).length === 0) {
        notification.info({
          message: "Không có thay đổi",
          description: "Không có trường nào được thay đổi để cập nhật.",
          placement: "topRight",
        });
        return;
      }

      const payload = {
        name: values.name,
        description: values.description,
        ...changedFields,
      };

      const response = await apiFetch(
        `/api/schoolchannels/${channel.schoolChannelID}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Cập nhật thất bại");
      }

      const updatedChannel = await response.json();
      setChannel(updatedChannel);

      notification.success({
        message: "Cập nhật thành công!",
        description: "Thông tin kênh đã được lưu",
        placement: "topRight",
      });

      setEditModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Update error:", error);
      notification.error({
        message: "Cập nhật thất bại!",
        description: error.message || "Lỗi không xác định",
        placement: "topRight",
      });
    }
  };

  if (loading) {
    return (
      <div className="studio-channel-loading-container">
        <Spin size="large" />
        <p>Đang tải thông tin kênh...</p>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="studio-channel-error-container">
        <h2>Không tìm thấy kênh</h2>
        <p>Vui lòng tạo kênh để tiếp tục.</p>
      </div>
    );
  }

  return (
    <div className="studio-channel-container">
      <div className="studio-channel-header">
        <div className="studio-channel-header-content">
          <div className="studio-channel-avatar-wrapper">
            <div className="studio-channel-avatar">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  channel.name
                )}&size=200&background=random`}
                alt={channel.name}
              />
              <div className="studio-channel-avatar-edit">
                <EditOutlined />
              </div>
            </div>
          </div>
          <div className="studio-channel-main-info">
            <h1>{channel.name}</h1>
            <span className="studio-channel-username">Trường Học</span>
            <p className="studio-channel-bio">
              {channel.description || "Chưa có mô tả cho kênh này"}
            </p>
            <div className="studio-channel-actions">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  const initialValues = {
                    name: channel.name,
                    description: channel.description,
                    address: channel.address,
                    email: channel.email,
                    website: channel.website,
                  };
                  form.setFieldsValue(initialValues);
                  initialValuesRef.current = initialValues;
                  setEditModalVisible(true);
                }}
                className="studio-channel-edit-btn"
              >
                Chỉnh Sửa Kênh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="studio-channel-content">
        <div className="studio-channel-info-card">
          <h2>Thông Tin Liên Hệ</h2>
          <div className="studio-channel-info-list">
            <div className="studio-channel-info-item">
              <div className="studio-channel-info-icon">
                <MailOutlined />
              </div>
              <div>
                <label>Email</label>
                <span>{channel.email || "Chưa cập nhật"}</span>
              </div>
            </div>
            <div className="studio-channel-info-item">
              <div className="studio-channel-info-icon">
                <GlobalOutlined />
              </div>
              <div>
                <label>Website</label>
                <span>{channel.website || "Chưa cập nhật"}</span>
              </div>
            </div>
            <div className="studio-channel-info-item">
              <div className="studio-channel-info-icon">
                <EnvironmentOutlined />
              </div>
              <div>
                <label>Địa chỉ</label>
                <span>{channel.address || "Chưa cập nhật"}</span>
              </div>
            </div>
            <div className="studio-channel-info-item">
              <div className="studio-channel-info-icon">
                <ClockCircleOutlined />
              </div>
              <div>
                <label>Thời gian stream còn lại</label>
                <span>
                  {channel.account &&
                  channel.account.accountPackages &&
                  channel.account.accountPackages.$values &&
                  channel.account.accountPackages.$values.length > 0
                    ? formatDecimalHours(
                        channel.account.accountPackages.$values[0]
                          .remainingHours
                      )
                    : "0 giờ"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="studio-channel-info-card">
          <h2>Thông Tin Kênh</h2>
          <div className="studio-channel-info-list">
            <div className="studio-channel-info-item">
              <div className="studio-channel-info-icon">
                <CalendarOutlined />
              </div>
              <div>
                <label>Ngày tạo kênh</label>
                <span>{formatDate(channel.createdAt)}</span>
              </div>
            </div>
            <div className="studio-channel-info-item">
              <div className="studio-channel-info-icon">
                <FireOutlined />
              </div>
              <div>
                <label>Số người theo dõi</label>
                <span>Đang cập nhật</span>
              </div>
            </div>
            <div className="studio-channel-info-item">
              <div className="studio-channel-info-icon">
                <InfoCircleOutlined />
              </div>
              <div>
                <label>Trạng thái</label>
                <span>
                  <Tag color={channel.status ? "green" : "red"}>
                    {channel.status ? "Hoạt động" : "Tạm dừng"}
                  </Tag>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Cập nhật thông tin kênh"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        className="studio-channel-modal"
        width={600}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateChannel}
          className="studio-channel-update-form"
        >
          <Form.Item
            name="name"
            label="Tên kênh"
            rules={[{ required: true, message: "Vui lòng nhập tên kênh!" }]}
          >
            <Input
              prefix={<InfoCircleOutlined />}
              placeholder="Tên kênh"
              className="studio-channel-input"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea
              placeholder="Mô tả kênh"
              className="studio-channel-input"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Email không hợp lệ!" }]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email liên hệ"
              className="studio-channel-input"
            />
          </Form.Item>

          <Form.Item
            name="website"
            label="Website"
            rules={[{ type: "url", message: "URL website không hợp lệ!" }]}
          >
            <Input
              prefix={<GlobalOutlined />}
              placeholder="Địa chỉ website"
              className="studio-channel-input"
            />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input
              prefix={<EnvironmentOutlined />}
              placeholder="Địa chỉ"
              className="studio-channel-input"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="studio-channel-update-btn"
            >
              Cập nhật thông tin
            </Button>
          </Form.Item>

          <div className="studio-channel-modal-footer-info">
            ℹ️ Cập nhật thông tin kênh giúp người dùng dễ dàng tìm thấy và tương
            tác với nội dung của bạn.
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default StudioChannel;
