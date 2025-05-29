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
  DatePicker,
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

const ScheduleListPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { channel } = useOutletContext();
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState([]);

  // Sample data for schedules
  const getSchedules = async (channelId) => {
    if (!channelId) {
      toast.error("ID kênh không hợp lệ!");
      return;
    }
    try {
      setIsLoading(true);
      const response = await apiFetch(`Schedule/by-channel/${channelId}`, {
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

      if (data.$values.length > 0) {
        setSchedules(data.$values);
      }
    } catch (error) {
      console.error("Error checking channel:", error);
      toast.error(
        error.message || "Có lỗi xảy ra khi lấy danh sách lịch chiếu!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (channel && channel.$values) {
      getSchedules(channel.$values[0].schoolChannelID);
    } else {
      setIsLoading(false);
    }
  }, [channel]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [form] = Form.useForm();

  // Handle edit schedule
  const handleEdit = (record) => {
    setEditingSchedule(record);

    // Helper function to safely parse dates
    const parseDate = (dateString) => {
      if (!dateString) return null;
      try {
        const parsed = dayjs(dateString);
        return parsed.isValid() ? parsed : null;
      } catch (error) {
        console.warn("Invalid date format:", dateString);
        return null;
      }
    };

    // Set form values with all 4 properties
    form.setFieldsValue({
      startTime: parseDate(record.startTime),
      endTime: parseDate(record.endTime),
      isReplay: record.isReplay || false,
    });

    // Handle thumbnail URL - create file list for display
    if (record.thumbnail) {
      setPreviewImage(record.thumbnail);
      setFileList([
        {
          uid: "-1",
          name: "current-thumbnail.jpg",
          status: "done",
          url: record.thumbnail,
        },
      ]);
    } else {
      setPreviewImage("");
      setFileList([]);
    }

    setIsModalVisible(true);
  };

  // Handle delete post
  const handleDelete = async (record) => {
    setIsLoading(true);
    const response = await apiFetch(`Schedule/${record.scheduleID}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      toast.error(data?.error || "Có lỗi xảy ra khi xóa!");
      throw new Error(data?.error || "Có lỗi xảy ra khi xóa!");
    }

    toast.success("Schedule deleted successfully!");

    setIsModalVisible(false);
    form.resetFields();
    setIsLoading(false);
  };

  // Handle modal OK
  const handleModalOk = async () => {
    try {
      setIsLoading(true);
      const formValues = await form.validateFields();

      // Create FormData to handle file upload
      const formData = new FormData();

      // Add DateTime fields
      formData.append(
        "StartTime",
        dayjs(formValues.startTime).format("YYYY-MM-DD HH:mm:ss")
      );
      formData.append(
        "EndTime",
        dayjs(formValues.endTime).format("YYYY-MM-DD HH:mm:ss")
      );
      formData.append("IsReplay", formValues.isReplay);

      // Add thumbnail file if uploaded
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("ThumbnailFile", fileList[0].originFileObj);
      }

      // Update existing post
      const response = await apiFetch(
        `Schedule/${editingSchedule.scheduleID}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error || "Có lỗi xảy ra khi cập nhật!");
        throw new Error(data?.error || "Có lỗi xảy ra khi cập nhật!");
      }

      toast.success("Schedule updated successfully!");

      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
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
    setEditingSchedule(null);
    setFileList([]);
    setPreviewImage("");
  };

  // Handle file upload
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      // Create preview for new upload
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(newFileList[0].originFileObj);
    } else if (newFileList.length === 0) {
      setPreviewImage("");
    }
  };

  // Upload props
  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Image must smaller than 2MB!");
        return false;
      }
      return false; // Prevent auto upload
    },
    onChange: handleUploadChange,
    fileList,
    maxCount: 1,
  };

  // Table columns configuration
  const columns = [
    {
      title: "Thumbnail",
      dataIndex: "thumbnail",
      key: "thumbnail",
      width: 80,
      render: (thumbnail) => <img width={80} height={80} src={thumbnail} alt="" style={{borderRadius: 10}} />,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 150,
      ellipsis: true,
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Start",
      dataIndex: "startTime",
      key: "startTime",
      width: 150,
      sorter: (a, b) => a.startTime.localeCompare(b.startTime),
      render: (startTime) => dayjs(startTime).format("DD-MM-YYYY HH:mm:ss"),
    },
    {
      title: "End",
      dataIndex: "endTime",
      key: "endTime",
      width: 150,
      sorter: (a, b) => a.endTime.localeCompare(b.endTime),
      render: (endTime) => dayjs(endTime).format("DD-MM-YYYY HH:mm:ss"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) =>
        record.status === "Pending" && (
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
            Danh sách lịch chiếu
          </Title>
        </div>

        <Table
          columns={columns}
          dataSource={schedules}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} schedules`,
          }}
          scroll={{ x: 800 }}
        />

        <Modal
          title={"Edit Schedule"}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          loading={isLoading}
          width={600}
          okText={"Update"}
        >
          <Form form={form} layout="vertical" name="schedule_form">
            {/* Start Time Field */}
            <Form.Item
              name="startTime"
              label="Start Time"
              rules={[
                {
                  required: true,
                  message: "Please select the start time!",
                },
              ]}
            >
              <DatePicker
                showTime
                format="DD-MM-YYYY HH:mm:ss"
                placeholder="Select start time"
                style={{ width: "100%" }}
              />
            </Form.Item>

            {/* End Time Field */}
            <Form.Item
              name="endTime"
              label="End Time"
              rules={[
                {
                  required: true,
                  message: "Please select the end time!",
                },
              ]}
            >
              <DatePicker
                showTime
                format="DD-MM-YYYY HH:mm:ss"
                placeholder="Select end time"
                style={{ width: "100%" }}
              />
            </Form.Item>

            {/* Is Replay Field */}
            <Form.Item
              name="isReplay"
              label="Is Replay"
              valuePropName="checked"
            >
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>

            {/* Thumbnail Upload Field */}
            <Form.Item
              name="thumbnailFile"
              label="Thumbnail"
              rules={[
                {
                  validator: () => {
                    if (fileList.length === 0 && !previewImage) {
                      return Promise.reject(
                        new Error("Please upload a thumbnail!")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Select Thumbnail</Button>
              </Upload>
              {previewImage && (
                <div style={{ marginTop: 8 }}>
                  <img
                    src={previewImage}
                    alt="thumbnail preview"
                    style={{
                      width: "100%",
                      maxWidth: 200,
                      height: "auto",
                      borderRadius: 4,
                      border: "1px solid #d9d9d9",
                    }}
                  />
                </div>
              )}
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default ScheduleListPage;
