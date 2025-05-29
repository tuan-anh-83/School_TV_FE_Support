import React, { useEffect, useState } from "react";
import "./AdsPost.scss";
import {
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Switch,
  Upload,
} from "antd";
import { useSelector } from "react-redux";
import "@mdxeditor/editor/style.css";
import { InboxOutlined } from "@ant-design/icons";

import AdsPostPreview from "./AdsPostPreview";
import apiFetch from "../../../../config/baseAPI";
import { toast } from "react-toastify";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;

function AdsPost() {
  const user = useSelector((state) => state.userData.user);
  const [form] = Form.useForm();
  const [previewPostData, setPreviewPostData] = useState({
    owner: user?.fullname ?? "Not found advertiser",
    Title: "",
    VideoFile: null,
    VideoPreviewUrl: "",
    DurationSeconds: 0,
  });
  const [isOpenPreview, setIsOpenPreview] = useState(false);
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 767px)").matches
  );
  const [videoFile, setVideoFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState(null);

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

    const isLt200M = fileSizeMB < 200;
    if (!isLt200M) {
      message.error("Video must be smaller than 200MB!");
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

      // Tạo video element để lấy duration
      const videoElement = document.createElement("video");
      videoElement.preload = "metadata";
      videoElement.src = videoPreviewUrl;

      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src);
        const duration = Math.floor(videoElement.duration); // thời lượng tính bằng giây

        setVideoDuration(duration);
        form.setFieldsValue({
          DurationSeconds: duration, // Optionally set default value
        });
      };

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

  //Gửi data hoàn chỉnh về API
  const [loadingUploadBtn, setLoadingUploadBtn] = useState(false);
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
        setIsOpenPreview(false);
      }
    } catch (error) {
      console.error("Error creating news:", error);
    } finally {
      setLoadingUploadBtn(false);
    }
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

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewPostData.VideoPreviewUrl) {
        URL.revokeObjectURL(previewPostData.VideoPreviewUrl);
      }
    };
  }, []);

  const uploadButton = (
    <div className="upload-button-container">
      <InboxOutlined style={{ fontSize: "32px", color: "#1890ff" }} />
      <div style={{ marginTop: 8 }}>Nhấp hoặc kéo tệp để tải lên video</div>
    </div>
  );

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
                <Upload.Dragger
                  name="videoFile"
                  className="video-uploader"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    console.log("beforeUpload called with file:", file);
                    return false; // Prevent auto upload
                  }}
                  onChange={(info) => {
                    console.log("Upload onChange event:", info);
                    if (info.file.originFileObj) {
                      handleVideoUpload(info.file.originFileObj);
                    } else {
                      handleVideoUpload(info.file);
                    }
                  }}
                  accept="video/*"
                >
                  {previewPostData.VideoFile ? (
                    <div style={{ marginBottom: 16 }}>
                      <p>File: {previewPostData.VideoFile.name}</p>
                      <p>
                        Size:{" "}
                        {(
                          previewPostData.VideoFile.size /
                          (1024 * 1024)
                        ).toFixed(2)}{" "}
                        MB
                      </p>
                    </div>
                  ) : (
                    uploadButton
                  )}
                </Upload.Dragger>
              </Form.Item>

              <Form.Item
                label={
                  <h2 className="studio-post-des">
                    Thời lượng phát sóng (giây)
                  </h2>
                }
                name="DurationSeconds"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn thời lượng phát sóng!",
                  },
                  {
                    type: "number",
                    max: videoDuration || 9999,
                    message: "Không được quá thời lượng của video!",
                  },
                ]}
              >
                <InputNumber
                  className="studio-post-input w-100"
                  style={{ width: "100%" }}
                  placeholder="Nhập thời lượng phát sóng"
                  disabled={!videoDuration}
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
