import { useState, useEffect } from "react";
import "./AdminPage.scss";
import { Layout, Card, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import apiFetch from "../../config/baseAPI";
import AdminMenu from "./AdminMenu";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const { Sider, Content } = Layout;

function AdminPage() {
  const [schoolOwnerCount, setSchoolOwnerCount] = useState(0);
  const [registeredUsersCount, setRegisteredUsersCount] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [revenueHistory, setRevenueHistory] = useState([]);
  const [userHistory, setUserHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const headers = {
          accept: "*/*",
        };

        const response = await apiFetch(
          "accounts/admin/statistics/signup-count",
          { headers }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch statistics: ${response.status}`);
        }

        const data = await response.json();
        setRegisteredUsersCount(data.userCount);
        setSchoolOwnerCount(data.schoolOwnerCount);
      } catch (error) {
        console.error("Error fetching statistics: ", error);
        if (error.message.includes("Failed to fetch statistics")) {
          localStorage.removeItem("authToken");
          navigate("/login");
        }
      }
    };

    const fetchPaymentHistory = async () => {
      try {
        const response = await apiFetch("PaymentHistory/admin", {
          headers: {
            accept: "*/*",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch payment history: ${response.status}`
          );
        }

        const data = await response.json();
        const totalRevenue = data.$values.reduce(
          (total, payment) => total + payment.amount,
          0
        );
        setMonthlyRevenue(totalRevenue);
        setRevenueHistory(data.$values.map((payment) => payment.amount));
      } catch (error) {
        console.error("Error fetching payment history: ", error);
      }
    };

    const fetchUserHistory = async () => {
      try {
        const response = await apiFetch(
          "accounts/admin/statistics/user-history",
          {
            headers: {
              accept: "*/*",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch user history: ${response.status}`);
        }

        const data = await response.json();
        setUserHistory(data.history);
      } catch (error) {
        console.error("Error fetching user history: ", error);
      }
    };

    fetchStatistics();
    fetchPaymentHistory();
    fetchUserHistory();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/login");
  };

  const chartData = {
    labels: revenueHistory.map((_, index) => `Week ${index + 1}`),
    datasets: [
      {
        label: "Monthly Revenue",
        data: revenueHistory,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.1,
        yAxisID: "y1", // Trục y cho doanh thu
      },
      {
        label: "Registered Users",
        data: userHistory,
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        fill: true,
        tension: 0.1,
        yAxisID: "y2", // Trục y cho người dùng
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Giúp biểu đồ có thể thay đổi kích thước linh hoạt
    scales: {
      y1: {
        type: "linear",
        position: "left",
      },
      y2: {
        type: "linear",
        position: "right",
        grid: {
          drawOnChartArea: false, // Không vẽ lưới trên trục y2
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <div className="admin_body">
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
            <Row gutter={16} justify="space-between">
              <Col span={7}>
                <Card title="Monthly Revenue" bordered={false}>
                  <div>${monthlyRevenue.toLocaleString()}</div>
                  <div>Increased by 60%</div>
                </Card>
              </Col>
              <Col span={7}>
                <Card title="Number of Registered Users" bordered={false}>
                  <div>{registeredUsersCount}</div>
                  <div>Increased by 0.5%</div>
                </Card>
              </Col>
              <Col span={7}>
                <Card title="School Owners Active" bordered={false}>
                  <div>{schoolOwnerCount}</div>
                  <div>Increased 0.002%</div>
                </Card>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Card
                  title="Revenue and User Growth Chart"
                  bordered={false}
                  style={{ marginTop: "50px" }}
                >
                  <div style={{ height: "500px", position: "relative" }}>
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </Card>
              </Col>
            </Row>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}

export default AdminPage;
