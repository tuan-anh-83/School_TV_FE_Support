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
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useOutletContext } from "react-router";
import apiFetch from "../../config/baseAPI";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const { Title } = Typography;
const { TextArea } = Input;

const PostsListPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { channel } = useOutletContext();
  const [fileList, setFileList] = useState([]);

  // Sample data for posts
  const getPosts = async (channelId) => {
    if (!channelId) {
      toast.error("ID kênh không hợp lệ!");
      return;
    }
    try {
      setIsLoading(true);
      const response = await apiFetch(`News/school-channel/${channelId}`, {
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

      console.log(data.$values);

      if (data.$values.length > 0) {
        setPosts(data.$values);
      }
    } catch (error) {
      console.error("Error checking channel:", error);
      toast.error(error.message || "Có lỗi xảy ra khi lấy danh sách bài viết!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (channel && channel.$values) {
      getPosts(channel.$values[0].schoolChannelID);
    } else {
      setIsLoading(false);
    }
  }, [channel]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form] = Form.useForm();

  // Handle edit post
  const handleEdit = (record) => {
    setEditingPost(record);
    form.setFieldsValue({
      categoryNewsID: record.categoryNewsID,
      title: record.title,
      content: record.content,
      followerMode: record.followerMode,
    });

    // Convert existing image files to file list format for display
    const existingFiles = record.newsPictures.$values.map((file, index) => ({
      uid: `-${file?.pictureID}`,
      name: file?.fileName,
      status: "done",
      url: `data:${file?.contentType};base64,${file?.fileData}`,
      isExisting: true, // Mark as existing file
      pictureID: file?.pictureID, // Keep reference to original
    }));

    setFileList(existingFiles);
    setIsModalVisible(true);
  };

  // Handle delete post
  const handleDelete = async (record) => {
    const response = await apiFetch(`News/${record.newsID}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      toast.error(data?.error || "Có lỗi xảy ra khi xóa!");
      throw new Error(data?.error || "Có lỗi xảy ra khi xóa!");
    }

    toast.success("Post deleted successfully!");

    setIsModalVisible(false);
    form.resetFields();
    setFileList([]);
  };

  // Handle modal OK
  const handleModalOk = async () => {
    try {
      const formValues = await form.validateFields();

      // Create FormData object
      const formData = new FormData();

      // Append form fields
      if (formValues.categoryNewsID) {
        formData.append("CategoryNewsID", formValues.categoryNewsID.toString());
      }
      formData.append("Title", formValues.title);
      formData.append("Content", formValues.content);
      formData.append(
        "FollowerMode",
        formValues.followerMode ? "true" : "false"
      );

      // Append image files
      fileList.forEach((file, index) => {
        if (file.originFileObj) {
          // New file upload
          formData.append("ImageFiles", file.originFileObj);
        } else if (file.isExisting) {
          // Existing file - you might want to send just the pictureID
          // or handle it differently based on your backend requirements
          formData.append("ExistingImageIDs", file.pictureID);
        }
      });

      // Update existing post
      const response = await apiFetch(`News/UpdateNews/${editingPost.newsID}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error || "Có lỗi xảy ra khi cập nhật!");
        throw new Error(data?.error || "Có lỗi xảy ra khi cập nhật!");
      }

      toast.success("Post updated successfully!");

      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Custom upload request (prevent automatic upload)
  const customUploadRequest = ({ file, onSuccess }) => {
    // Prevent automatic upload, we'll handle files in form submission
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setFileList([]);
    setEditingPost(null);
  };

  // Table columns configuration
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 150,
      ellipsis: true,
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      width: 150,
      sorter: (a, b) => a.content.localeCompare(b.content),
    },
    {
      title: "Category",
      dataIndex: "categoryNewsID",
      key: "categoryNewsID",
      width: 120,
    },
    {
      title: "Images",
      dataIndex: "newsPictures",
      key: "newsPictures",
      width: 100,
      render: (newsPictures) => (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>
          {newsPictures ? newsPictures.$values.length : 0} files
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <span
          style={{
            color: status ? "#52c41a" : "#faad14",
            fontWeight: "bold",
          }}
        >
          {status ? "Đang hoạt động" : "Bị khóa"}
        </span>
      ),
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
            Danh sách bài viết
          </Title>
        </div>

        <Table
          columns={columns}
          dataSource={posts}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} posts`,
          }}
          scroll={{ x: 800 }}
        />

        <Modal
          title={editingPost ? "Edit Post" : "Add New Post"}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={600}
          okText={editingPost ? "Update" : "Create"}
        >
          <Form form={form} layout="vertical" name="post_form">
            <Form.Item
              name="categoryNewsID"
              label="Category News ID"
              rules={[
                {
                  required: false,
                  message: "Please input the category news ID!",
                },
                {
                  type: "number",
                  min: 1,
                  message: "Category ID must be a positive number!",
                },
              ]}
            >
              <InputNumber
                placeholder="Enter category news ID"
                style={{ width: "100%" }}
                min={1}
              />
            </Form.Item>

            <Form.Item
              name="title"
              label="Title"
              rules={[
                { required: true, message: "Please input the post title!" },
                {
                  min: 3,
                  message: "Title must be at least 3 characters long!",
                },
              ]}
            >
              <Input placeholder="Enter post title" />
            </Form.Item>

            <Form.Item
              name="content"
              label="Content"
              rules={[
                { required: true, message: "Please input the post content!" },
              ]}
            >
              <TextArea rows={4} placeholder="Enter post content" />
            </Form.Item>

            <Form.Item
              name="followerMode"
              label="Follower Mode"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
            </Form.Item>

            <Form.Item name="imageFiles" label="Image Files">
              <Upload
                fileList={fileList}
                onChange={handleUploadChange}
                customRequest={customUploadRequest}
                multiple={true}
                accept="image/*"
                listType="text"
              >
                <Button icon={<UploadOutlined />}>Select Images</Button>
              </Upload>
              <div
                style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}
              >
                You can upload multiple image files
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default PostsListPage;
