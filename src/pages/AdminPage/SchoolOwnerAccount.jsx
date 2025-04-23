import "./SchoolOwnerAccount.scss";
import {
  Layout,
  Table,
  Input,
  Button,
  notification,
  Select,
  Modal,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import apiFetch from "../../config/baseAPI";
import AdminMenu from "./AdminMenu";

const { Sider, Content } = Layout;
const { Search } = Input;
const { Option } = Select;

function SchoolOwnerAccount() {
  const [data, setData] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteKey, setDeleteKey] = useState(null);
  const [initialData, setInitialData] = useState([]);
  const navigate = useNavigate();

  const showDeleteModal = (key) => {
    setDeleteKey(key);
    setIsModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      const response = await apiFetch(`accounts/admin/delete/${deleteKey}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete account: ${response.status}`);
      }

      // Refresh data after deletion
      const refreshResponse = await apiFetch("accounts/admin/all", {
        headers: {
          accept: "*/*",
        },
      });

      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh data");
      }

      const responseData = await refreshResponse.json();
      const filteredData = responseData.$values
        .filter((item) => item.roleID === 2)
        .map((item) => ({
          key: item.accountID,
          username: item.username,
          email: item.email,
          fullname: item.fullname,
          address: item.address,
          phoneNumber: item.phoneNumber,
          roleName: item.role?.roleName,
          status: item.status,
        }));

      setData(filteredData);
      setInitialData(filteredData);

      notification.success({
        message: "Tài khoản đã được xóa thành công",
        description: `Tài khoản có ID ${deleteKey} đã được xóa.`,
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      notification.error({
        message: "Xóa tài khoản thất bại",
        description: "Có lỗi xảy ra khi xóa tài khoản.",
      });
    }

    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiFetch("accounts/admin/all", {
          headers: {
            accept: "*/*",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const responseData = await response.json();
        const filteredData = responseData.$values
          .filter((item) => item.roleID === 2)
          .map((item) => ({
            key: item.accountID,
            username: item.username,
            email: item.email,
            fullname: item.fullname,
            address: item.address,
            phoneNumber: item.phoneNumber,
            roleName: item.role?.roleName,
            status: item.status,
          }));

        const initialStatusMap = filteredData.reduce((map, item) => {
          map[item.key] = item.status;
          return map;
        }, {});

        setInitialData(filteredData);
        setData(filteredData);
        setStatusMap(initialStatusMap);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.message.includes("Failed to fetch data")) {
          localStorage.removeItem("authToken");
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [navigate]);

  const handleStatusChange = (value, key) => {
    setStatusMap((prevState) => ({ ...prevState, [key]: value }));
  };

  const handleSaveStatus = async (key) => {
    const newStatus = statusMap[key];
    try {
      const response = await apiFetch(`accounts/admin/update-status/${key}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      notification.success({
        message: "Tài khoản đã được cập nhật trạng thái thành công",
        description: `Tài khoản có ID ${key} đã được thay đổi trạng thái thành ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      notification.error({
        message: "Cập nhật trạng thái thất bại",
        description: "Có lỗi xảy ra khi cập nhật trạng thái tài khoản.",
      });
    }
  };

  const handleSearch = (value) => {
    if (value.trim() === "") {
      setData(initialData);
    } else {
      const filteredData = initialData.filter(
        (owner) =>
          owner.fullname.toLowerCase().includes(value.toLowerCase()) ||
          owner.email.toLowerCase().includes(value.toLowerCase()) ||
          owner.address.toLowerCase().includes(value.toLowerCase()) ||
          owner.phoneNumber.toLowerCase().includes(value.toLowerCase())
      );
      setData(filteredData);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/login");
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "fullname",
      key: "fullname",
      render: (text, record) => (
        <span>
          {text} <br />
          <span style={{ fontSize: "12px", color: "gray" }}>
            {record.email}
          </span>
        </span>
      ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, record) => {
        return (
          <Select
            defaultValue={record.status}
            onChange={(value) => handleStatusChange(value, record.key)}
            style={{ width: 120 }}
          >
            <Option value="Active">Active</Option>
            <Option value="InActive">Inactive</Option>
          </Select>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <Button type="primary" onClick={() => handleSaveStatus(record.key)}>
            Save
          </Button>
          <Button
            type="primary"
            danger
            style={{ marginLeft: 10, width: "60px" }}
            onClick={() => showDeleteModal(record.key)}
          >
            Ban
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="schoolowneraccount-body">
      <Layout style={{ minHeight: "90vh" }}>
        <Sider width={225} className="site-layout-background">
          <AdminMenu onLogout={handleLogout} />
        </Sider>

        <Layout style={{ padding: "0 24px 24px" }}>
          <Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
            <Search
              placeholder="Search School Owner"
              allowClear
              enterButton="Search"
              size="large"
              onSearch={handleSearch}
              style={{ marginBottom: "20px", width: "300px" }}
            />
            <Table
              columns={columns}
              dataSource={data}
              pagination={{ pageSize: 8 }}
              rowKey="key"
            />
          </Content>
        </Layout>
      </Layout>

      <Modal
        title="Xác nhận xóa tài khoản"
        visible={isModalVisible}
        onOk={handleDelete}
        onCancel={handleCancel}
        okText="OK"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn cấm tài khoản này?</p>
      </Modal>
    </div>
  );
}

export default SchoolOwnerAccount;
