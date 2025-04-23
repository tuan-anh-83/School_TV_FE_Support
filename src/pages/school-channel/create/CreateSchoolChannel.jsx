import React from "react";
import "./CreateSchoolChannel.scss";
import { useSelector } from "react-redux";
import { Avatar, Button, Form, Input } from "antd";
import { toast } from "react-toastify";
import apiFetch from "../../../config/baseAPI";
import { useNavigate } from "react-router-dom";

function CreateSchoolChannel() {
  const user = useSelector((state) => state.userData.user);
  const [form] = Form.useForm();
  const [isSendingData, setIsSendingData] = React.useState(false);
  const navigate = useNavigate();

  const handleSubmitChannel = async (value) => {
    try {
      setIsSendingData(true);
      value.website = value.website || "";

      const response = await apiFetch("schoolchannels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(value),
      });

      if (!response.ok) {
        toast.error("Có lỗi xảy ra, vui lòng thử lại sau!");
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      form.resetFields();
      toast.success("Tạo kênh thành công, hãy trải nghiệm thôi nào!");
      navigate("/school-studio/statistics");
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau!");
    } finally {
      setIsSendingData(false);
    }
  };

  return (
    <div className="create-channel-container">
      <div className="create-channel-table">
        <div className="create-channel-marginBottom">
          <p style={{ fontWeight: 400 }}>{user?.email ?? "Not found email."}</p>
        </div>

        <div className="create-channel-marginBottom">
          <Avatar
            size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
            src={
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.fullname || "User"
                )}&background=random`}
              />
            }
          />
        </div>

        <div className="create-channel-marginBottom">
          <p style={{ fontWeight: 500 }}>
            Chào, {user.fullname || "Not found user."}!
          </p>
        </div>

        <div className="create-channel-back-btn create-channel-marginBottom">
          <a href="/">Trở về trang chủ</a>
        </div>

        <div className="create-channel-signup-range">
          <div className="create-channel-intro">
            <h1 className="create-channel-intro__title">
              Vui lòng tạo kênh của bạn
            </h1>
            <p className="create-channel-intro__description">
              Để sử dụng các chức năng dành riêng cho kênh
            </p>
          </div>

          <div className="create-channel">
            <Form
              className="create-channel__form"
              onFinish={handleSubmitChannel}
              form={form}
            >
              <div className="create-channel__form-row">
                <Form.Item
                  className="create-channel__form-item"
                  name="name"
                  label="Tên kênh"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên!" },
                    { max: 50, message: "Tên không được vượt quá 50 ký tự!" },
                  ]}
                >
                  <Input placeholder="Nhập tên hiển thị kênh" />
                </Form.Item>
              </div>

              <div className="create-channel__form-row">
                <Form.Item
                  className="create-channel__form-item"
                  name="description"
                  label="Mô tả"
                  rules={[
                    { required: true, message: "Vui lòng nhập mô tả!" },
                    {
                      max: 200,
                      message: "Mô tả không được vượt quá 200 ký tự!",
                    },
                  ]}
                >
                  <Input.TextArea
                    placeholder="Mô tả về kênh của bạn"
                    rows={4}
                  />
                </Form.Item>
              </div>

              <div className="create-channel__form-row create-channel__form-row--two-cols">
                <Form.Item
                  className="create-channel__form-item"
                  name="website"
                  label="Website"
                  rules={[
                    { type: "url", message: "Địa chỉ website không hợp lệ!" },
                  ]}
                >
                  <Input placeholder="Đường dẫn website" />
                </Form.Item>

                <Form.Item
                  className="create-channel__form-item"
                  name="email"
                  label="Email"
                  initialValue={user?.email}
                >
                  <Input placeholder="Email liên hệ" disabled />
                </Form.Item>
              </div>

              <div className="create-channel__form-row">
                <Form.Item
                  className="create-channel__form-item"
                  name="address"
                  label="Địa chỉ"
                  initialValue={user?.address}
                >
                  <Input placeholder="Địa chỉ chi tiết" />
                </Form.Item>
              </div>

              <div className="create-channel__form-actions">
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="create-channel__submit-btn"
                    loading={isSendingData}
                  >
                    Tạo kênh
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateSchoolChannel;
