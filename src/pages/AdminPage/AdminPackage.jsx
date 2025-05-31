import {
  Layout,
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Modal,
  Tag,
  Space,
  Typography,
  Tooltip,
} from "antd";
import Sider from "antd/es/layout/Sider";
import AdminMenu from "./AdminMenu";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./AdminPackage.scss";
import apiFetch from "../../config/baseAPI";
import { toast } from "react-toastify";

const { Search } = Input;
const { Title } = Typography;

function AdminPackage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);

  // ✅ CHỈNH SỬA: Thêm form instance
  const [form] = Form.useForm();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    apiFetch("/api/Package", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setPackages(data.$values);
        setFilteredPackages(data.$values);
      })
      .catch((error) => console.error("Error fetching packages:", error));
  }, []);

  // ✅ CHỈNH SỬA: Cập nhật giá trị form khi chọn gói
  useEffect(() => {
    if (selectedPackage) {
      form.setFieldsValue({
        name: selectedPackage.name,
        description: selectedPackage.description,
        price: selectedPackage.price,
        duration: selectedPackage.duration,
        timeduration: selectedPackage.timeDuration,
        status: selectedPackage.status,
        forType: selectedPackage.forType,
      });
    }
  }, [selectedPackage, form]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/login");
  };

  const handleEditClick = (packageData) => {
    setSelectedPackage(packageData);
    setIsModalVisible(true);
  };

  const handleDeleteClick = (packageData) => {
    setPackageToDelete(packageData);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    const token = localStorage.getItem("authToken");

    apiFetch(`/api/Package/${packageToDelete.packageID}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          setIsDeleteModalVisible(false);
          setPackageToDelete(null);
          return apiFetch("/api/Package", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        }
        throw new Error("Delete failed");
      })
      .then((response) => response.json())
      .then((data) => {
        setPackages(data.$values);
        setFilteredPackages(data.$values);
      })
      .catch((error) => console.error("Error deleting package:", error));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (value.trim() === "") {
      setFilteredPackages(packages);
    } else {
      const filtered = packages.filter((pkg) =>
        pkg.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPackages(filtered);
    }
  };

  const handleUpdate = (values) => {
    const token = localStorage.getItem("authToken");

    apiFetch(`/api/Package/${selectedPackage.packageID}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: values.name,
        description: values.description,
        price: values.price,
        duration: values.duration,
        timeduration: values.timeduration,
        status: values.status,
        forType: values.forType,
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Update failed");
        return apiFetch("/api/Package", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      })
      .then((response) => response.json())
      .then((data) => {
        setPackages(data.$values);
        setFilteredPackages(data.$values);
        setIsModalVisible(false);
        toast.success(`Cập nhật thành công cho gói: ${values.name}`);
        form.resetFields(); // ✅ CHỈNH SỬA: reset form khi đóng modal
      })
      .catch((error) => console.error("Error updating package:", error));
  };

  const formatDateTime = (text) => {
    const date = new Date(text);
    return (
      <Tooltip
        title={date.toLocaleString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      >
        <div style={{ lineHeight: 1.5 }}>
          <div>
            <strong>Day:</strong>{" "}
            {date.toLocaleDateString("en-GB", { timeZone: "Asia/Ho_Chi_Minh" })}
          </div>
          <div>
            <strong>Time:</strong>{" "}
            {date.toLocaleTimeString("en-GB", { timeZone: "Asia/Ho_Chi_Minh" })}
          </div>
        </div>
      </Tooltip>
    );
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong style={{ fontSize: "16px" }}>{text}</strong>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <div style={{ whiteSpace: "pre-wrap" }}>{text}</div>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price.toLocaleString()} VNĐ`,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (d) => `${d} day(s)`,
    },
    {
      title: "TimeDuration",
      dataIndex: "timeDuration",
      key: "timeduration",
      render: (d) => `${d} minute(s)`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "gray"}>
          {status === "Active" ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: formatDateTime,
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: formatDateTime,
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEditClick(record)}>
            Edit
          </Button>
          <Button danger onClick={() => handleDeleteClick(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="adminpackage_body">
      <Layout style={{ minHeight: "90vh" }}>
        <Sider>
          <AdminMenu onLogout={handleLogout} />
        </Sider>
        <Layout.Content style={{ padding: "20px" }}>
          <Title level={2}>Admin Package Management</Title>
          <Search
            placeholder="Search by Name"
            onChange={handleSearchChange}
            style={{ width: 300, marginBottom: 20 }}
          />

          <Table
            dataSource={filteredPackages}
            columns={columns}
            rowKey="packageID"
            bordered
            pagination={{ pageSize: 5 }}
            style={{
              backgroundColor: "#fff",
              borderRadius: "10px",
              padding: "15px",
            }}
          />
        </Layout.Content>
      </Layout>

      {/* ✅ CHỈNH SỬA: Form Edit sử dụng Form instance */}
      <Modal
        title="Edit Package"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        {selectedPackage && (
          <Form form={form} onFinish={handleUpdate} layout="vertical">
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item name="price" label="Price" rules={[{ required: true }]}>
              <InputNumber min={0.01} step={0.01} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="duration"
              label="Duration"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="timeduration"
              label="TimeDuration"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="Active">Active</Select.Option>
                <Select.Option value="Inactive">Inactive</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="forType"
              label="For Type"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="SchoolOwner">SchoolOwner</Select.Option>
                <Select.Option value="Advertiser">Advertiser</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Update
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title="Confirm Delete"
        open={isDeleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Yes"
        cancelText="No"
      >
        <p>Bạn có chắc muốn xóa gói này?</p>
      </Modal>
    </div>
  );
}

export default AdminPackage;
