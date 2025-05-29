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

const ProgramListPage = () => {
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { channel } = useOutletContext();

  // Sample data for programs
  const getPrograms = async (channelId) => {
    if (!channelId) {
      toast.error("ID kênh không hợp lệ!");
      return;
    }
    try {
      setIsLoading(true);
      const response = await apiFetch(`Program/by-channel/${channelId}`, {
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
        setPrograms(data.$values);
      }
    } catch (error) {
      console.error("Error checking channel:", error);
      toast.error(
        error.message || "Có lỗi xảy ra khi lấy danh sách chương trình!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (channel && channel.$values) {
      getPrograms(channel.$values[0].schoolChannelID);
    } else {
      setIsLoading(false);
    }
  }, [channel]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [form] = Form.useForm();

  // Handle edit program
  const handleEdit = (record) => {
    setEditingProgram(record);
    form.setFieldsValue({
      programName: record.programName,
      title: record.title,
    });
    setIsModalVisible(true);
  };

  // Handle delete post
  const handleDelete = async (record) => {
    setIsLoading(true);
    const response = await apiFetch(`Program/${record.programID}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      toast.error(data?.error || "Có lỗi xảy ra khi xóa!");
      throw new Error(data?.error || "Có lỗi xảy ra khi xóa!");
    }

    toast.success("Program deleted successfully!");

    setIsModalVisible(false);
    form.resetFields();
    setIsLoading(false);
  };

  // Handle modal OK
  const handleModalOk = async () => {
    try {
      setIsLoading(true);
      const formValues = await form.validateFields();

      // Update existing post
      const response = await apiFetch(`Program/${editingProgram.programID}`, {
        method: "PUT",
        body: JSON.stringify(formValues),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error || "Có lỗi xảy ra khi cập nhật!");
        throw new Error(data?.error || "Có lỗi xảy ra khi cập nhật!");
      }

      toast.success("Program updated successfully!");

      setIsModalVisible(false);
      form.resetFields();
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
    setEditingProgram(null);
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
      title: "Program",
      dataIndex: "programName",
      key: "programName",
      width: 150,
      sorter: (a, b) => a.programName.localeCompare(b.programName),
    },
    {
      title: "Followers",
      dataIndex: "programFollows",
      key: "followers",
      width: 120,
      render: (programFollows) => (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>
          {programFollows ? programFollows.$values.length : 0} follower
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
            color: status === "Active" ? "#52c41a" : "#faad14",
            fontWeight: "bold",
          }}
        >
          {status === "Active" ? "Đang hoạt động" : "Đã bị xóa"}
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
            Danh sách chương trình
          </Title>
        </div>

        <Table
          columns={columns}
          dataSource={programs}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} programs`,
          }}
          scroll={{ x: 800 }}
        />

        <Modal
          title={"Edit Program"}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          loading={isLoading}
          width={600}
          okText={"Update"}
        >
          <Form form={form} layout="vertical" name="post_form">
            <Form.Item
              name="programName"
              label="Tên chương trình"
              rules={[
                {
                  required: false,
                  message: "Please input the program name!",
                },
              ]}
            >
              <Input placeholder="Enter program name" />
            </Form.Item>

            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[
                { required: true, message: "Please input the program title!" },
                {
                  min: 3,
                  message: "Title must be at least 3 characters long!",
                },
              ]}
            >
              <Input placeholder="Enter program title" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default ProgramListPage;
