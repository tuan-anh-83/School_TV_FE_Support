import { Layout, Table, Tag, Typography, Tooltip, Input } from "antd";
import Sider from "antd/es/layout/Sider";
import AdminMenu from "./AdminMenu";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiFetch from "../../config/baseAPI";
import "./AdminPaymentManagement.scss";

const { Title } = Typography;
const { Search } = Input;

function AdminPaymentManagement() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    apiFetch("/api/PaymentHistory/admin", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const paymentList = data.$values || [];
        setPayments(paymentList);
        setFilteredPayments(paymentList);
      })
      .catch((err) => console.error("Failed to fetch payment history:", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/login");
    window.dispatchEvent(new Event("storage"));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setFilteredPayments(payments);
    } else {
      const filtered = payments.filter(
        (item) =>
          item.paymentID.toString().includes(value) ||
          item.status.toLowerCase().includes(value.toLowerCase()) ||
          item.user?.username?.toLowerCase().includes(value.toLowerCase()) ||
          item.user?.fullname?.toLowerCase().includes(value.toLowerCase()) ||
          item.user?.roleName?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPayments(filtered);
    }
  };

  const formatDateTime = (text) => {
    const date = new Date(text);
    return (
      <Tooltip title={date?.toLocaleString("vi-VN")}>
        <div style={{ lineHeight: 1.5 }}>
          <div>
            <strong>Day:</strong> {date?.toLocaleDateString("en-GB")}
          </div>
          <div>
            <strong>Time:</strong> {date?.toLocaleTimeString("en-GB")}
          </div>
        </div>
      </Tooltip>
    );
  };

  const columns = [
    {
      title: "Payment ID",
      dataIndex: "paymentID",
      key: "paymentID",
      render: (text) => <strong style={{ fontSize: "15px" }}>{text}</strong>,
    },
    {
      title: "Package",
      dataIndex: "package",
      key: "package",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `${amount.toLocaleString()} đ`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Completed" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      render: formatDateTime,
    },
    {
      title: "User Info",
      key: "userInfo",
      render: (_, record) => (
        <div>
          <div>
            <strong>Username:</strong> {record.user?.username}
          </div>
          <div>
            <strong>Fullname:</strong> {record.user?.fullname}
          </div>
          <div>
            <strong>Role:</strong> {record.user?.roleName}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-payment-body">
      <Layout style={{ minHeight: "90vh" }}>
        <Sider>
          <AdminMenu onLogout={handleLogout} />
        </Sider>
        <Layout.Content style={{ padding: "20px" }}>
          <Title level={2}>Admin Payment Management</Title>

          <Search
            placeholder="Search by Payment ID, Status, Username, Fullname, or Role"
            onChange={handleSearchChange}
            value={searchTerm}
            style={{ width: 300, marginBottom: 20 }}
          />

          <Table
            dataSource={filteredPayments}
            columns={columns}
            rowKey="paymentHistoryID"
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
    </div>
  );
}

export default AdminPaymentManagement;
