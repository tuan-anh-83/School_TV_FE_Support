import React, { useEffect, useState, useRef } from "react";
import { Modal, Form, Row, Col, Input, Button, notification, Spin } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  LockOutlined,
  EditOutlined,
  KeyOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
  BookOutlined,
  CalendarOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import "./UserProfile.css";
import apiFetch from "../../config/baseAPI";
import { useOutletContext } from "react-router";
import { formatMinutesAndSeconds } from "../../utils/text";

const UserProfile = () => {
  // Add these to your existing state declarations
  const [orderDetailModalVisible, setOrderDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const initialValuesRef = useRef({});
  const [orders, setOrders] = useState({ $values: [] });
  const [errorOrders, setErrorOrders] = useState(null);
  const params = useOutletContext();

  useEffect(() => {
    if (params && params.user) {
      setUser(params.user);
    }
  }, [params]);

  const fetchOrderDetails = async () => {
    // Check if user is not SchoolOwner, skip the API call
    if (
      user?.roleName?.toLowerCase() !== "schoolowner" &&
      user?.roleName?.toLowerCase() !== "advertiser"
    ) {
      setOrders({ $values: [] });
      setLoading(false);
      return;
    }

    try {
      const response = await apiFetch(`orders/history`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Lỗi khi lấy thông tin đơn hàng: ${response.status}`);
      }

      // Add validation for the response structure
      if (!data || !data.$values) {
        throw new Error("Dữ liệu đơn hàng không hợp lệ");
      }

      setOrders(data);
    } catch (err) {
      setErrorOrders(err.message);
      notification.error({
        message: "Lỗi",
        description: err.message,
      });
      setOrders({ $values: [] }); // Set empty array if error occurs
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch orders if user data is available
    fetchOrderDetails();
  }, [user?.roleName]); // Add user as dependency

  const handleUpdateInfo = async (values) => {
    try {
      if (!initialValuesRef.current) {
        notification.error({
          message: "Lỗi hệ thống!",
          description: "Không thể xác định dữ liệu gốc",
          placement: "topRight",
        });
        return;
      }

      const changedFields = Object.keys(values).reduce((acc, key) => {
        const currentValue = values[key];
        const initialValue = initialValuesRef.current[key];

        if (String(currentValue).trim() !== String(initialValue).trim()) {
          acc[key] = currentValue;
        }
        return acc;
      }, {});

      if (Object.keys(changedFields).length === 0) {
        notification.info({
          message: "Thông báo",
          description: "Không có thông tin nào được thay đổi",
          placement: "topRight",
          duration: 3,
        });
        return;
      }

      const fieldMapping = {
        profile_username: "username",
        profile_fullname: "fullname",
        profile_phone: "phoneNumber",
        profile_address: "address",
      };

      const payload = Object.entries(changedFields).reduce(
        (acc, [formField, value]) => {
          const apiField = fieldMapping[formField];
          if (apiField) {
            acc[apiField] = value.trim();
          }
          return acc;
        },
        {}
      );

      const response = await apiFetch("accounts/update", {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Cập nhật thất bại");
      }

      const updatedUser = await response.json();
      const updatedUserWithRole = {
        ...updatedUser.account,
        roleName: user.roleName,
      };

      setUser(updatedUserWithRole);
      localStorage.setItem("userData", JSON.stringify(updatedUserWithRole));

      notification.success({
        message: "Cập nhật thành công!",
        description: "Thông tin đã được lưu",
        placement: "topRight",
        duration: 3,
      });

      setEditModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Update error:", error);

      const errorMessage = error.message.includes("unique constraint")
        ? "Email hoặc tên đăng nhập đã tồn tại"
        : error.message || "Lỗi không xác định";

      notification.error({
        message: "Cập nhật thất bại!",
        description: errorMessage,
        placement: "topRight",
        duration: 4,
      });
    }
  };

  const handlePasswordChange = async (values) => {
    if (values.newPassword !== values.confirmNewPassword) {
      notification.error({
        message: "Lỗi!",
        description: "Mật khẩu mới không khớp.",
        placement: "topRight",
      });
      return;
    }

    try {
      const response = await apiFetch("accounts/change-password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmNewPassword: values.confirmNewPassword,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.text();
      if (!response.ok) {
        try {
          const errorData = JSON.parse(data);
          throw new Error(errorData.message || "Password change failed");
        } catch {
          throw new Error(data || "Password change failed");
        }
      }

      notification.success({
        message: "Thành công!",
        description: "Mật khẩu của bạn đã được cập nhật.",
        placement: "topRight",
        duration: 3,
      });

      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      console.error("Password change error:", error);
      let errorDescription =
        error.message || "Đã có lỗi xảy ra khi cập nhật mật khẩu.";

      if (error.message.includes("Current password is incorrect")) {
        errorDescription = "Mật khẩu hiện tại đã nhập không chính xác.";
      }

      notification.error({
        message: "Cập nhật mật khẩu thất bại!",
        description: errorDescription,
        placement: "topRight",
        duration: 4,
      });
    }
  };
  // Add this function
  const handleOrderDetailClick = (order) => {
    setSelectedOrder(order);
    setOrderDetailModalVisible(true);
  };

  const passwordValidationRules = {
    pattern:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message:
      "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt. Không bao gồm dấu chấm.",
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-container">
        <h2>Không tìm thấy thông tin người dùng</h2>
        <p>Vui lòng đăng nhập lại để tiếp tục.</p>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="user-profile-header">
        <div className="user-profile-header-content">
          <div className="user-profile-avatar-wrapper">
            <div className="user-profile-avatar">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.fullname
                )}&size=200&background=random`}
                alt={user.fullname}
              />
              <div className="user-profile-avatar-edit">
                <EditOutlined />
              </div>
            </div>
          </div>
          <div className="user-profile-main-info">
            <h1>{user.fullname}</h1>
            {user.roleName.toLowerCase() !== "schoolowner" && (
              <p className="user-profile-username">@{user.username}</p>
            )}
            <div className="user-profile-actions">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  const initialValues = {
                    profile_username: user.username,
                    profile_email: user.email,
                    profile_fullname: user.fullname,
                    profile_phone: user.phoneNumber || "",
                    profile_address: user.address || "",
                  };
                  form.setFieldsValue(initialValues);
                  initialValuesRef.current = initialValues;
                  setEditModalVisible(true);
                }}
                className="user-profile-edit-btn"
              >
                Chỉnh Sửa Hồ Sơ
              </Button>

              <Button
                icon={<KeyOutlined />}
                onClick={() => {
                  passwordForm.resetFields();
                  setPasswordModalVisible(true);
                }}
                className="user-profile-password-btn"
              >
                Đổi Mật Khẩu
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="user-profile-content">
        <div className="user-profile-info-card contact-info">
          <h2>Thông Tin Liên Hệ</h2>
          <div className="user-profile-info-list">
            <div className="user-profile-info-item">
              <div className="info-icon">
                <MailOutlined />
              </div>
              <div>
                <label>Email</label>
                <span>{user.email}</span>
              </div>
            </div>
            <div className="user-profile-info-item">
              <div className="info-icon">
                <PhoneOutlined />
              </div>
              <div>
                <label>Số điện thoại</label>
                <span>{user.phoneNumber || "Chưa cập nhật"}</span>
              </div>
            </div>
            <div className="user-profile-info-item">
              <div className="info-icon">
                <EnvironmentOutlined />
              </div>
              <div>
                <label>Địa chỉ</label>
                <span>{user.address || "Chưa cập nhật"}</span>
              </div>
            </div>
            <div className="user-profile-info-item">
              <div className="info-icon">
                <ClockCircleOutlined />
              </div>
              <div>
                <label>Thời gian còn lại</label>
                <span>
                  {user.accountPackage
                    ? formatMinutesAndSeconds(
                        user.accountPackage.remainingMinutes
                      )
                    : 0 + " phút"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="user-profile-info-card connected-accounts">
          <h2>Tài Khoản Liên Kết</h2>
          <div className="user-profile-account-item">
            <div className="user-profile-account-icon">
              <GoogleOutlined />
            </div>
            <div className="user-profile-account-info">
              <span>Google Account</span>
              <p>{user.email}</p>
            </div>
            <div className="user-profile-account-status connected">
              Đã liên kết
            </div>
          </div>
        </div>
      </div>
      {(user?.roleName?.toLowerCase() === "schoolowner" ||
        user?.roleName?.toLowerCase() === "advertiser") && (
        <div className="user-profile-info-card order-history">
          <div className="order-background"></div>
          <h2>Lịch Sử Đơn Hàng</h2>
          <div className="user-profile-order-list">
            {orders?.$values?.length > 0 ? (
              orders.$values
                .sort(function (o) {
                  return o.createdAt;
                })
                .reverse()
                .map((order) => (
                  <div key={order.orderID} className="user-profile-order-item">
                    <div
                      className={`order-status ${
                        order.status?.toLowerCase() || "pending"
                      }`}
                    >
                      <span className="status-dot"></span>
                      {order.status === "Pending"
                        ? "Đang xử lý"
                        : order.status === "Completed"
                        ? "Hoàn thành"
                        : "Đã hủy"}
                    </div>
                    <div className="order-details">
                      <div className="order-header">
                        <h3>Đơn hàng #{order.orderCode || "N/A"}</h3>
                        <span className="order-date">
                          {order.createdAt
                            ? new Date(order.createdAt)?.toLocaleDateString(
                                "vi-VN"
                              )
                            : "Không xác định"}
                        </span>
                      </div>
                      <div className="order-products">
                        {order.orderDetails?.$values?.map((detail) => (
                          <p key={detail.orderDetailID}>
                            {detail.package?.name || "Không xác định"} x 1
                          </p>
                        ))}
                      </div>
                      <div className="order-footer">
                        <span className="order-amount">
                          {order.totalPrice
                            ? order.totalPrice.toLocaleString()
                            : "0"}{" "}
                          ₫
                        </span>
                        <button
                          className="order-detail-btn"
                          onClick={() => handleOrderDetailClick(order)}
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p>Không có đơn hàng nào.</p>
            )}
          </div>
        </div>
      )}

      <Modal
        title="Cập nhật thông tin"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        className="user-profile-modal"
        width={800}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateInfo}
          className="user-profile-update-form"
        >
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="profile_username"
                label="Tên người dùng"
                rules={[
                  { required: true, message: "Vui lòng nhập tên người dùng!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập tên người dùng"
                  className="user-profile-input"
                />
              </Form.Item>

              <Form.Item
                name="profile_fullname"
                label="Họ và tên"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập họ và tên đầy đủ"
                  className="user-profile-input"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="profile_phone" label="Số điện thoại">
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Nhập số điện thoại"
                  className="user-profile-input"
                />
              </Form.Item>

              <Form.Item name="profile_address" label="Địa chỉ">
                <Input
                  prefix={<HomeOutlined />}
                  placeholder="Nhập địa chỉ"
                  className="user-profile-input"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Cập nhật thông tin
            </Button>
          </Form.Item>

          <div className="user-profile-modal-footer-info">
            ℹ️ Cập nhật thông tin của bạn sẽ giúp chúng tôi phục vụ bạn tốt hơn.
          </div>
        </Form>
      </Modal>

      <Modal
        title="Đổi mật khẩu"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
        className="user-profile-modal"
        width={600}
        centered
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
          className="user-profile-password-form"
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu hiện tại!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="user-profile-input"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                  { ...passwordValidationRules },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu mới"
                  className="user-profile-input"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="confirmNewPassword"
                label="Xác nhận mật khẩu mới"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng xác nhận mật khẩu mới!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Mật khẩu xác nhận không khớp!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khẩu mới"
                  className="user-profile-input"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đổi mật khẩu
            </Button>
          </Form.Item>

          <div className="user-profile-modal-footer-info">
            🔒 Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ
            thường, số và ký tự đặc biệt. Không bao gồm dấu chấm.
          </div>
        </Form>
      </Modal>

      {/* Modal của order history */}

      {/* Add this at the bottom of your component, before the final closing tag */}
      <Modal
        title="Chi Tiết Đơn Hàng"
        open={orderDetailModalVisible}
        onCancel={() => setOrderDetailModalVisible(false)}
        footer={null}
        className="user-profile-modal order-detail-modal"
        width={800}
        centered
      >
        {selectedOrder && (
          <div className="order-detail-content">
            {/* Header */}
            <div className="order-detail-header">
              <div className="order-detail-id">
                <h3>Đơn hàng #{selectedOrder.orderCode || "N/A"}</h3>
                <span
                  className={`order-detail-status ${
                    selectedOrder.status?.toLowerCase() || "pending"
                  }`}
                >
                  <span className="status-dot"></span>
                  {selectedOrder.status === "Pending"
                    ? "Đang xử lý"
                    : selectedOrder.status === "Completed"
                    ? "Hoàn thành"
                    : "Đã hủy"}
                </span>
              </div>
              <div className="order-detail-date">
                <ClockCircleOutlined />
                <span>
                  {selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt)?.toLocaleDateString(
                        "vi-VN",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "Không xác định"}
                </span>
              </div>
            </div>

            {/* Thông tin khách hàng */}
            <div className="order-detail-info">
              <div className="info-section">
                <h4>Thông Tin Khách Hàng</h4>
                <div className="info-content">
                  <p>
                    <UserOutlined /> {selectedOrder.fullName || user.fullname}
                  </p>
                  <p>
                    <MailOutlined /> {selectedOrder.email || user.email}
                  </p>
                  <p>
                    <PhoneOutlined />{" "}
                    {selectedOrder.phoneNumber ||
                      user.phoneNumber ||
                      "Chưa cập nhật"}
                  </p>
                  <p>
                    <HomeOutlined />{" "}
                    {selectedOrder.address || user.address || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              {/* Chi tiết sản phẩm */}
              <div className="info-section">
                <h4>Chi Tiết Sản Phẩm</h4>
                <div className="order-products-list">
                  {selectedOrder.orderDetails.$values.map((detail) => (
                    <div key={detail.orderDetailID} className="product-item">
                      <div className="product-info">
                        <span className="product-name">
                          {detail.package.name}
                        </span>
                        <span className="product-duration">
                          {detail.package.timeDuration} phút
                        </span>
                        <span className="product-duration">
                          {detail.package.duration} tháng
                        </span>
                      </div>
                      <div className="product-price">
                        {detail.price.toLocaleString()} ₫
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng kết đơn hàng */}
              <div className="order-summary">
                <div className="summary-item">
                  <span>Tổng tiền sản phẩm:</span>
                  <span>{selectedOrder.totalPrice.toLocaleString()} ₫</span>
                </div>
                <div className="summary-item discount">
                  <span>Giảm giá:</span>
                  <span>0 ₫</span>
                </div>
                <div className="summary-item total">
                  <span>Tổng thanh toán:</span>
                  <span>{selectedOrder.totalPrice.toLocaleString()} ₫</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="order-detail-footer">
              <div className="payment-info">
                <div className="payment-method">
                  <span>Phương thức thanh toán:</span>
                  <strong>PAYOS</strong>
                </div>
                <div
                  className={`payment-status ${
                    selectedOrder.status === "Completed" ? "success" : "pending"
                  }`}
                >
                  <span>Trạng thái thanh toán:</span>
                  <strong>
                    {selectedOrder.status === "Completed"
                      ? "Đã thanh toán"
                      : "Chưa thanh toán"}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserProfile;
