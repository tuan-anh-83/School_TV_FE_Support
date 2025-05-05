import "./UserList.scss";
import {
  Layout,
  Table,
  Input,
  Button,
  notification,
  Select,
  Modal,
  Form,
  Segmented,
  DatePicker,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import apiFetch from "../../config/baseAPI";
import AdminMenu from "./AdminMenu";
import dayjs from "dayjs";
import { PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
const { RangePicker } = DatePicker;

const { Sider, Content } = Layout;
const { Search } = Input;
const { Option } = Select;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

function AdsList() {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [deleteKey, setDeleteKey] = useState(null);
  const [initialData, setInitialData] = useState([]);
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);
  const navigate = useNavigate();

  const [form] = Form.useForm();

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

  const handleCreateAd = async (values) => {
    const requestBody = {
      title: values.title,
      startTime: selectedRange[0],
      endTime: selectedRange[1],
      videoUrl: values.videoUrl,
    };

    try {
      setIsBtnLoading(true);
      const response = await apiFetch("AdSchedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = new Error("Request failed");
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      if (data) {
        form.resetFields();
        toast.success("Khởi tạo quảng cáo thành công!");
        await fetchData();
      }
    } catch (error) {
      console.log("Lỗi khi khởi tạo chương trình: ", error);
    } finally {
      setIsBtnLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const response = await apiFetch("adSchedule", {
        headers: {
          accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const responseData = await response.json();

      if (
        responseData?.data &&
        responseData?.data?.$values &&
        responseData?.data?.$values.length > 0
      ) {
        setData(responseData.data.$values);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.message.includes("Failed to fetch data")) {
        localStorage.removeItem("authToken");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleChangeTime = (dates) => {
    if (dates && dates.length === 2) {
      const startDate = dayjs(dates[0]).format("YYYY-MM-DD HH:mm:ss");
      const endDate = dayjs(dates[1]).format("YYYY-MM-DD HH:mm:ss");

      setSelectedRange([startDate, endDate]);
    }
  };

  const disabledDate = (current) => {
    // Không cho phép chọn ngày trước ngày hiện tại
    return current && current < dayjs().startOf("day");
  };

  const disabledTime = (current) => {
    if (!current) {
      return {
        disabledHours: () => [],
        disabledMinutes: () => [],
        disabledSeconds: () => [],
      };
    }

    const now = dayjs();
    const currentDateTime = dayjs(current);

    // Nếu là ngày hôm nay
    //đợi 10p
    // if (currentDateTime.isSame(now, "day")) {
    //   const currentHour = now.hour();
    //   const currentMinute = now.minute();

    //   return {
    //     disabledHours: () => {
    //       const hours = [];
    //       for (let i = 0; i < currentHour; i++) {
    //         hours.push(i);
    //       }
    //       return hours;
    //     },
    //     disabledMinutes: (selectedHour) => {
    //       if (selectedHour === currentHour) {
    //         const minutes = [];
    //         for (let i = 0; i <= currentMinute + 10; i++) {
    //           minutes.push(i);
    //         }
    //         return minutes;
    //       }
    //       return [];
    //     },
    //     disabledSeconds: () => [],
    //   };
    // }

    //không cần đợi
    if (currentDateTime.isSame(now, "day")) {
      const currentHour = now.hour();
      const currentMinute = now.minute();

      return {
        disabledHours: () => {
          const hours = [];
          for (let i = 0; i < currentHour; i++) {
            hours.push(i);
          }
          return hours;
        },
        disabledMinutes: (selectedHour) => {
          if (selectedHour === currentHour) {
            const minutes = [];
            for (let i = 0; i <= currentMinute; i++) {
              minutes.push(i);
            }
            return minutes;
          }
          return [];
        },
        disabledSeconds: () => [],
      };
    }

    return {
      disabledHours: () => [],
      disabledMinutes: () => [],
      disabledSeconds: () => [],
    };
  };

  const handleSearch = (value) => {
    if (value.trim() === "") {
      setData(initialData);
    } else {
      const filteredData = initialData.filter(
        (user) =>
          user.username.toLowerCase().startsWith(value.toLowerCase()) ||
          user.email.toLowerCase().startsWith(value.toLowerCase())
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
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <span>
          {text} <br />
        </span>
      ),
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      key: "startTime",
      render: (value) =>
        value ? dayjs(value).format("DD/MM/YYYY HH:mm:ss") : "-",
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      key: "endTime",
      render: (value) =>
        value ? dayjs(value).format("DD/MM/YYYY HH:mm:ss") : "-",
    },
    {
      title: "Video Url",
      dataIndex: "videoUrl",
      key: "videoUrl",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <Button type="primary" onClick={() => handleDelete()}>
            Edit
          </Button>
          <Button
            type="primary"
            danger
            style={{ marginLeft: 10, width: "60px" }}
            onClick={() => showDeleteModal(record.key)}
          >
            Delete
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Search
                placeholder="Search Ads"
                allowClear
                enterButton="Search"
                size="large"
                onSearch={handleSearch}
                style={{ marginBottom: "20px", width: "300px" }}
              />
              <Button
                size="large"
                onClick={() => setIsCreateModalVisible(true)}
              >
                <PlusOutlined />
              </Button>
            </div>
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
        title="Xác nhận xóa quảng cáo"
        visible={isModalVisible}
        onOk={handleDelete}
        onCancel={handleCancel}
        okText="OK"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa quảng cáo này?</p>
      </Modal>

      <Modal
        title="Tạo quảng cáo mới"
        visible={isCreateModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsCreateModalVisible(false)}
        okText="OK"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        loading={isBtnLoading}
      >
        <Form
          {...formItemLayout}
          form={form}
          variant={"outlined"}
          style={{ maxWidth: 600, marginTop: "2rem" }}
          initialValues={{ variant: "outlined" }}
          onFinish={handleCreateAd}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please input title!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Duration"
            name="duration"
            rules={[{ required: true, message: "Please choose duration!" }]}
          >
            <RangePicker
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
              value={selectedRange ?? null}
              format="YYYY-MM-DD HH:mm:ss"
              onChange={handleChangeTime}
              showTime={{
                format: "HH:mm:ss",
              }}
              disabledDate={disabledDate}
              disabledTime={disabledTime}
            />
          </Form.Item>

          <Form.Item
            label="Video Url"
            name="videoUrl"
            rules={[{ required: true, message: "Please input video url!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdsList;
