import React, { useEffect, useRef, useState } from "react";
import "./StudioPost.scss";
import { Button, Flex, Form, Input, Select, Switch } from "antd";
import { message, Upload } from "antd";
import { FaImage, FaUserFriends } from "react-icons/fa";
import { FaEarthAmericas } from "react-icons/fa6";
import { useSelector } from "react-redux";

import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  toolbarPlugin,
  thematicBreakPlugin,
  diffSourcePlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  InsertThematicBreak,
  CodeToggle,
  DiffSourceToggleWrapper,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

import StudioPostPreview from "./StudioPostPreview";
import removeMd from "remove-markdown";
import apiFetch from "../../../../config/baseAPI";
import { toast } from "react-toastify";
import { useOutletContext } from "react-router-dom";

const { Dragger } = Upload;

function StudioPost() {
  const { channel } = useOutletContext();
  const user = useSelector((state) => state.userData.user);

  const [postStatus, setPostStatus] = useState(null);
  const [form] = Form.useForm();
  const [fileUrlList, setFileUrlList] = useState([]);
  const [previewPostData, setPreviewPostData] = useState({
    owner: channel ? channel.$values[0] : "Not found channel",
    Title: "",
    Content: "",
    FollowerMode: null,
    ImageFiles: null,
  });
  const [isOpenPreview, setIsOpenPreview] = useState(false);
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 767px)").matches
  );

  const getStatus = (status) => {
    setPostStatus(status);
    form.setFieldsValue({ FollowerMode: status });
  };

  const handleBeforeUpload = (file) => {
    const isValidType = file.type === "image/jpeg" || file.type === "image/png";

    if (!isValidType) {
      message.error("Chỉ cho phép upload file JPG hoặc PNG!");
      return Upload.LIST_IGNORE;
    }

    return false;
  };

  const handleChangeImage = (info) => {
    form.setFieldsValue({ ImageFiles: info.fileList });

    //Tạo url xem trước
    const newFileList = info.fileList.map((file) => ({
      ...file,
      preview: URL.createObjectURL(file.originFileObj),
    }));

    setFileUrlList(newFileList);
  };

  const handleRemoveImage = (file) => {
    const updatedFileList = fileUrlList.filter((item) => item.uid !== file.uid);
    form.setFieldsValue({ ImageFiles: updatedFileList });

    const newPreviewList = updatedFileList.map((file) => ({
      ...file,
      preview: file.originFileObj
        ? URL.createObjectURL(file.originFileObj)
        : file.url,
    }));

    setFileUrlList(newPreviewList);
  };

  //handle rich text
  const handleChangeFormatText = (value) => {
    const text = removeMd(value);

    if (!text.trim()) {
      form.setFields([
        {
          name: "Content",
          errors: ["Vui lòng nhập nội dung!"],
        },
      ]);
    } else if (text.length < 1200) {
      form.setFieldsValue({ Content: value.toString() });
      form.setFields([{ name: "Content", errors: [] }]);
    } else {
      form.setFields([
        {
          name: "Content",
          errors: ["Nội dung không được vượt quá 1200 ký tự!"],
        },
      ]);
    }

    setPreviewPostData((prev) => ({
      ...prev,
      Content: value ? value : "",
    }));
  };

  //Cập nhật text xem trước
  const handleFormChange = (_, allValues) => {
    setPreviewPostData((prev) => ({
      ...prev,
      Title: allValues.Title || "",
    }));
  };

  //Cập nhật hình ảnh xem trước
  useEffect(() => {
    setPreviewPostData((prev) => ({
      ...prev,
      ImageFiles: fileUrlList,
    }));
  }, [fileUrlList]);

  //Câp nhật trạng thái hiển thị xem trước
  useEffect(() => {
    setPreviewPostData((prev) => ({
      ...prev,
      FollowerMode: postStatus,
    }));
  }, [postStatus]);

  //Gửi data hoàn chỉnh về API
  const [loadingUploadBtn, setLoadingUploadBtn] = useState(false);
  const onFinish = async (values) => {
    if (!values.ImageFiles || values.ImageFiles.length === 0) {
      values.ImageFiles = [];
    }

    try {
      setLoadingUploadBtn(true);
      const formData = new FormData();

      formData.append("Title", values.Title);
      formData.append("Content", values.Content);
      formData.append("FollowerMode", values.FollowerMode);
      formData.append("CategoryNewsID", selectedCategory);

      if (channel) {
        formData.append("SchoolChannelID", channel.$values[0].schoolChannelID);
      }

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
        toast.success("Tạo bài viết thành công!");
        form.resetFields();
        setFileUrlList([]);
        setPostStatus(null);
        setPreviewPostData({
          owner: channel ? channel.$values[0].name : "Not found channel",
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

  //Handle category bài viết
  const [category, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category.value);
  };

  const fetchCategory = async () => {
    try {
      const response = await apiFetch("CategoryNews", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Không lấy được dữ liệu cho danh mục!");
      }

      const data = await response.json();
      if (data) {
        let convertData = data.$values.map((item) => {
          return {
            value: item.categoryNewsID,
            label: (
              <span title={item.description || "No description"}>
                {item.categoryName}
              </span>
            ),
          };
        });
        setCategory(convertData);
      }
    } catch (error) {
      toast.error(error.message || "Có lỗi không mong muốn xảy ra!");
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

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
      <h1 className="studio-function-title">Tuỳ chỉnh bài viết của bạn</h1>
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
                name="Content"
                label={<h2 className="studio-post-des">Nội dung</h2>}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhâp nội dung bài viết!",
                  },
                ]}
              >
                <div style={{ border: "1px solid #777", borderRadius: 5 }}>
                  <MDXEditor
                    markdown=""
                    onChange={handleChangeFormatText}
                    plugins={[
                      toolbarPlugin({
                        toolbarClassName: "editor-toolbar",
                        toolbarContents: () => (
                          <>
                            {" "}
                            <UndoRedo />
                            <BoldItalicUnderlineToggles />
                            <BlockTypeSelect />
                            <ListsToggle />
                            <CreateLink />
                            <InsertThematicBreak />
                            <CodeToggle />
                            <DiffSourceToggleWrapper />
                          </>
                        ),
                      }),
                      headingsPlugin(),
                      listsPlugin(),
                      thematicBreakPlugin(),
                      diffSourcePlugin({
                        readOnlyDiff: true,
                      }),
                    ]}
                  />
                </div>
              </Form.Item>

              <Form.Item label={<h2 className="studio-post-des">Danh mục</h2>}>
                <Select
                  labelInValue
                  defaultValue={{
                    value: "none",
                    label: "Chọn danh mục",
                  }}
                  onChange={handleSelectCategory}
                  options={category}
                />
              </Form.Item>

              <Form.Item
                label={<h2 className="studio-post-des">Hình ảnh</h2>}
                name="ImageFiles"
              >
                <Dragger
                  className="studio-post-dragger"
                  beforeUpload={handleBeforeUpload}
                  onChange={handleChangeImage}
                  onRemove={handleRemoveImage}
                >
                  <p className="ant-upload-drag-icon">
                    <FaImage style={{ fontSize: 50 }} />
                  </p>
                  <p className="ant-upload-text">
                    Kéo thả hoặc click để tải ảnh lên
                  </p>
                  <p className="ant-upload-hint">
                    Hỗ trợ tải lên một tệp hoặc hàng loạt. Nghiêm cấm tải các
                    tệp vi phạm bản quyền hoặc không phù hợp.
                  </p>
                </Dragger>
              </Form.Item>

              <Form.Item
                label={<h2 className="studio-post-des">Trạng thái hiển thị</h2>}
                name="FollowerMode"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn trạng thái hiển thị!",
                  },
                ]}
              >
                <Flex justify="space-between">
                  <div
                    onClick={() => getStatus(false)}
                    className={`studio-post-status ${
                      postStatus === false ? "studio-post-status__active" : ""
                    }`}
                  >
                    <p>
                      <FaEarthAmericas />
                    </p>
                    <p style={{ fontWeight: "bold" }}>Công khai</p>
                    <p>Mọi người có thể xem</p>
                  </div>

                  <div
                    onClick={() => getStatus(true)}
                    className={`studio-post-status ${
                      postStatus ? "studio-post-status__active" : ""
                    }`}
                  >
                    <p>
                      <FaUserFriends />
                    </p>
                    <p style={{ fontWeight: "bold" }}>Người theo dõi</p>
                    <p>Chỉ người theo dõi mới xem được</p>
                  </div>
                </Flex>
              </Form.Item>

              <Flex align="center">
                <Button
                  loading={loadingUploadBtn}
                  className="studio-post-button"
                  htmlType="submit"
                >
                  Đăng
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
        <StudioPostPreview
          previewPostData={previewPostData}
          isMobile={isMobile}
        />
        <div id="modal-overlay" className="modal-overlay"></div>
      </div>
    </div>
  );
}

export default StudioPost;
