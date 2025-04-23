import "./AdminList.scss";
import { Layout, Table, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import apiFetch from "../../config/baseAPI";
import AdminMenu from "./AdminMenu";

const { Sider, Content } = Layout;
const { Search } = Input;

const columns = [
  {
    title: "Name",
    dataIndex: "username",
    key: "username",
    render: (text, record) => (
      <span>
        {text} <br />
        <span style={{ fontSize: "12px", color: "gray" }}>{record.email}</span>
      </span>
    ),
  },
  {
    title: "Role",
    dataIndex: "roleName",
    key: "roleName",
    render: () => <span>Admin</span>,
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
    render: (status) => {
      let color = "";
      let displayStatus = "";

      if (status === "Active") {
        displayStatus = "Active";
        color = "green";
      }
      if (status === "Pending") {
        displayStatus = "Pending";
        color = "blue";
      }
      if (status === "InActive") {
        displayStatus = "InActive";
        color = "gray";
      }

      return <span style={{ color }}>{displayStatus}</span>;
    },
  },
];

function AdminList() {
  const [data, setData] = useState([]);
  const [initialData, setInitialData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          accept: "*/*",
        };

        const response = await apiFetch("accounts/admin/all", { headers });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const responseData = await response.json();
        const filteredData = responseData.$values.filter(
          (item) => item.roleID === 3
        );

        const fetchedData = filteredData.map((item) => ({
          key: item.accountID,
          username: item.username,
          email: item.email,
          fullname: item.fullname,
          address: item.address,
          phoneNumber: item.phoneNumber,
          status: item.status,
        }));

        setInitialData(fetchedData);
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.message.includes("Failed to fetch user data")) {
          localStorage.removeItem("authToken");
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [navigate]);

  const handleSearch = (value) => {
    if (value.trim() === "") {
      setData(initialData);
    } else {
      const filteredData = initialData.filter(
        (admin) =>
          admin.username.toLowerCase().includes(value.toLowerCase()) ||
          admin.email.toLowerCase().includes(value.toLowerCase()) ||
          admin.fullname.toLowerCase().includes(value.toLowerCase()) ||
          admin.address.toLowerCase().includes(value.toLowerCase()) ||
          admin.phoneNumber.toLowerCase().includes(value.toLowerCase())
      );
      setData(filteredData);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <div className="schoolowner-body">
      <Layout style={{ minHeight: "90vh" }}>
        <Sider width={225} className="site-layout-background">
          <AdminMenu onLogout={handleLogout} />
        </Sider>

        <Layout style={{ padding: "0 24px 24px" }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Search
              placeholder="Search name of admin"
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
    </div>
  );
}

export default AdminList;
