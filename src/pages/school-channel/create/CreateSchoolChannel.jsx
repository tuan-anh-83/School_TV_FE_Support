import React, { useState } from "react";
import "./CreateSchoolChannel.scss";
import { useSelector } from "react-redux";
import { Avatar, Button, Form, Input, Upload, message } from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import apiFetch from "../../../config/baseAPI";
import { useNavigate } from "react-router-dom";

function CreateSchoolChannel() {
  const user = useSelector((state) => state.userData.user);
  const [form] = Form.useForm();
  const [isSendingData, setIsSendingData] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const navigate = useNavigate();

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleLogoChange = async ({ fileList }) => {
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      
      // Validate file type and size
      const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 2;
      
      if (!isJpgOrPng) {
        message.error("Bạn chỉ có thể tải lên file JPG/PNG!");
        return;
      }
      
      if (!isLt2M) {
        message.error("Ảnh phải nhỏ hơn 2MB!");
        return;
      }
      
      // Set the file for form submission
      setLogoFile(file);
      
      // Generate preview
      try {
        const previewUrl = await getBase64(file);
        setLogoPreview(previewUrl);
      } catch (error) {
        console.error("Error generating preview:", error);
      }
    } else {
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  const handleCoverChange = ({ fileList }) => {
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      
      // Validate file type and size
      const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
      const isLt5M = file.size / 1024 / 1024 < 5;
      
      if (!isJpgOrPng) {
        message.error("Bạn chỉ có thể tải lên file JPG/PNG!");
        return;
      }
      
      if (!isLt5M) {
        message.error("Ảnh phải nhỏ hơn 5MB!");
        return;
      }
      
      // Set the file for form submission
      setCoverFile(file);
    } else {
      setCoverFile(null);
    }
  };

  const handleSubmitChannel = async (values) => {
    try {
      setIsSendingData(true);
      
      // Create FormData
      const formData = new FormData();
      
      // Add text fields to FormData
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("website", values.website || "");
      formData.append("email", values.email);
      formData.append("address", values.address || "");
      
      // Add image files to FormData
      if (logoFile) {
        formData.append("logoFile", logoFile);
      }

      const response = await apiFetch("schoolchannels", {
        method: "POST",
        // Don't set Content-Type header when using FormData
        // The browser will set it automatically with the correct boundary
        body: formData,
      });

      if (!response.ok) {
        toast.error("Có lỗi xảy ra, vui lòng thử lại sau!");
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      form.resetFields();
      setLogoFile(null);
      setLogoPreview(null);
      setCoverFile(null);
      toast.success("Tạo kênh thành công, hãy trải nghiệm thôi nào!");
      navigate("/school-studio/statistics");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau!");
    } finally {
      setIsSendingData(false);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải lên</div>
    </div>
  );

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
                  name="logo"
                  label="Logo kênh"
                  rules={[
                    { required: true, message: "Vui lòng tải lên logo kênh!" },
                  ]}
                >
                  <Upload
                    name="logo"
                    listType="picture-card"
                    className="avatar-uploader"
                    showUploadList={false}
                    onChange={handleLogoChange}
                    beforeUpload={() => false} // Prevent auto upload
                    maxCount={1}
                  >
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="avatar" 
                        style={{ width: "100%" }} 
                      />
                    ) : (
                      uploadButton
                    )}
                  </Upload>
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