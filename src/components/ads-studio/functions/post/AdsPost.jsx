import React, { useEffect, useState } from "react";
import "./AdsPost.scss";
import { Button, DatePicker, Flex, Form, Input, Switch } from "antd";
import { useSelector } from "react-redux";
import "@mdxeditor/editor/style.css";

import AdsPostPreview from "./AdsPostPreview";
import apiFetch from "../../../../config/baseAPI";
import { toast } from "react-toastify";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;

function AdsPost() {
  const user = useSelector((state) => state.userData.user);
  const [postStatus, setPostStatus] = useState(null);
  const [form] = Form.useForm();
  const [previewPostData, setPreviewPostData] = useState({
    owner: user?.fullname ?? "Not found advertiser",
    Title: "",
    VideoUrl: "",
    SelectedDate: null,
  });
  const [isOpenPreview, setIsOpenPreview] = useState(false);
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 767px)").matches
  );

  const disabledDate = (current) => {
    // Không cho phép chọn ngày trước ngày hiện tại
    return current && current < dayjs().startOf("day");
  };

  const disabledTime = (current) => {
    if (!current) {
      return {
        disabledHours: () => [],
        disabledMinutes: () => [],
        disabledSeconds: () => [],
      };
    }

    const now = dayjs();
    const currentDateTime = dayjs(current);

    //không cần đợi
    if (currentDateTime.isSame(now, "day")) {
      const currentHour = now.hour();
      const currentMinute = now.minute();

      return {
        disabledHours: () => {
          const hours = [];
          for (let i = 0; i < currentHour; i++) {
            hours.push(i);
          }
          return hours;
        },
        disabledMinutes: (selectedHour) => {
          if (selectedHour === currentHour) {
            const minutes = [];
            for (let i = 0; i <= currentMinute; i++) {
              minutes.push(i);
            }
            return minutes;
          }
          return [];
        },
        disabledSeconds: () => [],
      };
    }

    return {
      disabledHours: () => [],
      disabledMinutes: () => [],
      disabledSeconds: () => [],
    };
  };

  //Cập nhật text xem trước
  const handleFormChange = (_, allValues) => {
    setPreviewPostData((prev) => ({
      ...prev,
      Title: allValues.Title || "",
      VideoUrl: allValues.VideoUrl || "",
    }));
  };

  //Gửi data hoàn chỉnh về API
  const [loadingUploadBtn, setLoadingUploadBtn] = useState(false);
  const onFinish = async (values) => {
    try {
      setLoadingUploadBtn(true);
      const formData = new FormData();

      formData.append("Title", values.Title);
      formData.append("Content", values.Content);
      formData.append("FollowerMode", values.FollowerMode);
      formData.append("CategoryNewsID", selectedCategory);

      if (values.ImageFiles && values.ImageFiles.length > 0) {
        values.ImageFiles.forEach((file) => {
          formData.append("ImageFiles", file.originFileObj || file);
        });
      }

      const response = await apiFetch("News/CreateNews", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(data.message || "Có lỗi xảy ra!");
      }
      const data = await response.json();

      if (data) {
        toast.success("Tạo quảng cáo thành công!");
        form.resetFields();
        setPostStatus(null);
        setPreviewPostData({
          owner: user?.fullname ?? "Not found advertiser",
          Title: "",
          Content: "",
          FollowerMode: null,
          ImageFiles: null,
        });
        setIsOpenPreview(false);
      }
    } catch (error) {
      console.error("Error creating news:", error);
    } finally {
      setLoadingUploadBtn(false);
    }

    // console.log(values);
  };

  //Handle menu xem trước bài viết
  const onChangePreviewPost = (checked) => {
    setIsOpenPreview(checked);
    if (checked) {
      if (!isMobile) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }
  };

  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleResize = () => setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleResize);

    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  useEffect(() => {
    const postPreviewContainer = document.getElementById(
      "post-preview-container"
    );
    const studioPostLayout = document.getElementById("studio-post-layout");
    const studioPostContainer = document.getElementById(
      "studio-post-container"
    );
    const modalOverlay = document.getElementById("modal-overlay");
    const previewSwitch = document.getElementById("preview-switch");

    if (
      !postPreviewContainer ||
      !studioPostLayout ||
      !studioPostContainer ||
      !modalOverlay ||
      !previewSwitch
    )
      return;

    let closeElement = postPreviewContainer.querySelector(
      ".post-preview-close-btn"
    );
    if (!closeElement) {
      closeElement = document.createElement("div");
      closeElement.innerHTML = "&times;";
      closeElement.className = "post-preview-close-btn";
      closeElement.style.position = "absolute";
      closeElement.style.top = "5px";
      closeElement.style.right = "10px";
      closeElement.style.cursor = "pointer";
      closeElement.style.fontSize = "30px";

      closeElement.addEventListener("click", () => {
        postPreviewContainer.style.display = "none";
        modalOverlay.style.display = "none";
        setIsOpenPreview(false);
      });

      postPreviewContainer.appendChild(closeElement);
    }

    if (isOpenPreview) {
      postPreviewContainer.style.display = "block";
      modalOverlay.style.display = isMobile ? "block" : "none";

      if (isMobile) {
        studioPostLayout.style.display = "block";
        studioPostContainer.style.width = "100%";
        postPreviewContainer.style.position = "fixed";
        postPreviewContainer.style.top = "50%";
        postPreviewContainer.style.left = "50%";
        postPreviewContainer.style.transform = "translate(-50%, -50%)";
        postPreviewContainer.style.zIndex = 1001;
        postPreviewContainer.style.width = "80%";
        postPreviewContainer.style.borderRadius = "10px";
        postPreviewContainer.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
        modalOverlay.style.display = "block";
      } else {
        postPreviewContainer.style.display = "block";
        studioPostLayout.style.display = "flex";
        studioPostContainer.style.width = "49%";
        modalOverlay.style.display = "none";
        postPreviewContainer.style.position = "";
        postPreviewContainer.style.top = "";
        postPreviewContainer.style.left = "";
        postPreviewContainer.style.transform = "";
        postPreviewContainer.style.zIndex = "";
        postPreviewContainer.style.width = "";
        postPreviewContainer.style.borderRadius = "";
        postPreviewContainer.style.boxShadow = "";
      }
    } else {
      postPreviewContainer.style.display = "none";
      studioPostContainer.style.width = "100%";
    }

    return () => {
      if (closeElement) {
        closeElement.remove();
      }
    };
  }, [isOpenPreview, isMobile]);

  return (
    <div style={{ marginTop: "50px" }}>
      {/* Class applied from main title of SChoolChannelStudio.scss */}
      <h1 className="studio-function-title">Tuỳ chỉnh quảng cáo của bạn</h1>
      <div className="studio-post-layout" id="studio-post-layout">
        <div className="studio-post-container" id="studio-post-container">
          <div className="studio-post-content">
            <Form
              layout="vertical"
              form={form}
              onFinish={onFinish}
              onValuesChange={handleFormChange}
            >
              <Form.Item
                label={<h2 className="studio-post-des">Tiêu đề</h2>}
                name="Title"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tiêu đề bài viết!",
                  },
                  { min: 10, message: "Tiêu đề phải có ít nhất 10 ký tự!" },
                  { max: 50, message: "Tiêu đề không được quá 50 ký tự!" },
                ]}
              >
                <Input
                  className="studio-post-input"
                  placeholder="Nhập tiêu đề bài viết"
                />
              </Form.Item>

              <Form.Item
                name="VideoUrl"
                label={<h2 className="studio-post-des">Video liên kết</h2>}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhâp video liên kết!",
                  },
                ]}
              >
                <Input
                  className="studio-post-input"
                  placeholder="Nhập video liên kết"
                />
              </Form.Item>

              <Form.Item
                label={<h2 className="studio-post-des">Thời gian phát sóng</h2>}
                name="SelectedDate"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn thời gian phát sóng!",
                  },
                ]}
              >
                <RangePicker
                  placeholder={["Thời gian bắt đầu", "Thời gian kết thúc"]}
                  value={previewPostData.SelectedDate ?? null}
                  format="YYYY-MM-DD HH:mm:ss"
                  onChange={handleFormChange}
                  showTime={{
                    format: "HH:mm:ss",
                  }}
                  disabledDate={disabledDate}
                  disabledTime={disabledTime}
                />
              </Form.Item>

              <Flex align="center">
                <Button
                  loading={loadingUploadBtn}
                  className="studio-post-button"
                  htmlType="submit"
                >
                  Đăng quảng cáo
                </Button>

                <Switch
                  className="preview-switch"
                  checkedChildren="Đang mở"
                  unCheckedChildren="Xem trước"
                  onChange={onChangePreviewPost}
                  id="preview-switch"
                  checked={isOpenPreview}
                />
              </Flex>
            </Form>
          </div>
        </div>
        <AdsPostPreview previewPostData={previewPostData} isMobile={isMobile} />
        <div id="modal-overlay" className="modal-overlay"></div>
      </div>
    </div>
  );
}

export default AdsPost;
