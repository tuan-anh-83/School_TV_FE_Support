import "./CreatePackage.scss";
import apiFetch from "../../config/baseAPI";
import {
  Layout,
  Form,
  Input,
  Button,
  message,
  InputNumber,
  Typography,
  Row,
  Col,
  Card,
} from "antd";
import Sider from "antd/es/layout/Sider";
import AdminMenu from "./AdminMenu";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

function CreatePackage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/login");
  };

  const handleCreate = async (values) => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await apiFetch("/api/Package", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success("Package created successfully!");
        form.resetFields();
      } else {
        throw new Error("Error creating package");
      }
    } catch (error) {
      message.error("Failed to create package: " + error.message);
    }
  };

  return (
    <div className="create-package-body">
      <Layout style={{ minHeight: "100vh" }}>
        <Sider width={225}>
          <AdminMenu onLogout={handleLogout} />
        </Sider>
        <Layout.Content style={{ padding: "40px" }}>
          <Row justify="center">
            <Col span={24}>
              <Card
                style={{
                  maxWidth: "1000px",
                  margin: "0 auto",
                  borderRadius: "16px",
                  padding: "40px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                }}
              >
                <Title
                  level={2}
                  style={{ textAlign: "center", marginBottom: 30 }}
                >
                  Create Package
                </Title>
                <Form
                  form={form}
                  onFinish={handleCreate}
                  layout="vertical"
                  initialValues={{
                    name: "",
                    description: "",
                    price: 0.01,
                    duration: 1,
                    status: true,
                  }}
                >
                  <Form.Item
                    label="Name"
                    name="name"
                    rules={[
                      { required: true, message: "Please input package name!" },
                    ]}
                  >
                    <Input placeholder="Enter package name" />
                  </Form.Item>

                  <Form.Item
                    label="Description"
                    name="description"
                    rules={[
                      {
                        required: true,
                        message: "Please input package description!",
                      },
                    ]}
                  >
                    <Input.TextArea
                      placeholder="Enter package description"
                      rows={3}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Price"
                    name="price"
                    rules={[
                      {
                        required: true,
                        message: "Please input package price!",
                      },
                    ]}
                  >
                    <InputNumber
                      min={0.01}
                      step={0.01}
                      style={{ width: "100%" }}
                      placeholder="Enter price in VNĐ"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Duration (days)"
                    name="duration"
                    rules={[
                      {
                        required: true,
                        message: "Please input package duration!",
                      },
                      {
                        type: "number",
                        min: 1,
                        message: "Duration must be greater than 0",
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: "100%" }}
                      placeholder="Enter duration in minutes"
                    />
                  </Form.Item>

                  <Form.Item
                    label="TimeDuration (minutes)"
                    name="timeduration"
                    rules={[
                      {
                        required: true,
                        message: "Please input package TimeDuration!",
                      },
                      {
                        type: "number",
                        min: 1,
                        message: "TimeDuration must be greater than 0",
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: "100%" }}
                      placeholder="Enter duration in mintues"
                    />
                  </Form.Item>

                  <Form.Item style={{ marginTop: 20 }}>
                    <Button type="primary" htmlType="submit" block>
                      Create Package
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </Layout.Content>
      </Layout>
    </div>
  );
}

export default CreatePackage;
