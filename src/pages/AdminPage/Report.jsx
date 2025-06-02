import "./UserList.scss";
import {
  Layout,
  Table,
  Input,
  Button,
  Modal,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import apiFetch from "../../config/baseAPI";
import AdminMenu from "./AdminMenu";
import { extractVideoId, getThumbnailUrl } from "../../utils/image";

const { Sider, Content } = Layout;
const { Search } = Input;

function Report() {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteKey, setDeleteKey] = useState(null);
  const [initialData, setInitialData] = useState([]);
  const navigate = useNavigate();

  const showDeleteModal = (key) => {
    setDeleteKey(key);
    setIsModalVisible(true);
  };

  const handleDelete = async () => {
    // try {
    //   const response = await apiFetch(`accounts/admin/delete/${deleteKey}`, {
    //     method: "DELETE",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   });

    //   if (!response.ok) {
    //     throw new Error(`Failed to delete account: ${response.status}`);
    //   }

    //   const updatedData = data.filter((item) => item.key !== deleteKey);
    //   setData(updatedData);

    //   notification.success({
    //     message: "Tài khoản đã được xóa thành công",
    //     description: `Tài khoản có ID ${deleteKey} đã được xóa.`,
    //   });
    // } catch (error) {
    //   console.error("Error deleting account:", error);
    //   notification.error({
    //     message: "Xóa tài khoản thất bại",
    //     description: "Có lỗi xảy ra khi xóa tài khoản.",
    //   });
    // }

    // setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiFetch("report", {
          headers: {
            accept: "*/*",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const responseData = await response.json();

        if (responseData && responseData?.$values.length > 0) {
          setData(responseData.$values);
          setInitialData(responseData.$values);
        }
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

  const handleSearch = (value) => {
    if (value.trim() === "") {
      setData(initialData);
    } else {
      const filteredData = initialData.filter((report) =>
        report.reason.toLowerCase().startsWith(value.toLowerCase())
      );
      setData(filteredData);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/login");
    window.dispatchEvent(new Event("storage"));
  };

  const columns = [
    {
      title: "Account",
      dataIndex: "account",
      key: "account",
      render: (_, record) => (
        <span>
          {record.account.username} <br />
          <span style={{ fontSize: "12px", color: "gray" }}>
            {record.account.email}
          </span>
        </span>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Video",
      dataIndex: "videoHistory",
      key: "thumbnail",
      render: (_, record) => (
        <img
          width={80}
          height={80}
          src={getThumbnailUrl(extractVideoId(record.videoHistory.mP4Url))}
          alt=""
          style={{ borderRadius: 10 }}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
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
    <div className="userlist-body">
      <Layout style={{ minHeight: "90vh" }}>
        <Sider width={225} className="site-layout-background">
          <AdminMenu onLogout={handleLogout} />
        </Sider>

        <Layout style={{ padding: "0 24px 24px" }}>
          <Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
            <Search
              placeholder="Search Report"
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
        title="Xác nhận khóa tài khoản"
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

export default Report;
