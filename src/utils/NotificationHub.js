import * as signalR from "@microsoft/signalr";

let connection = null;
let isStarted = false;

const baseUrl = import.meta.env.VITE_SERVER_API_PREFIX;

const startHub = (accountId, onReceive) => {
  // Kiểm tra nếu kết nối đã được tạo, không tái khởi tạo
  if (connection && isStarted) return;

  const hubUrl = `${baseUrl}/hubs/notification?accountId=${accountId}`;

  console.log("🔗 Connecting to SignalR hub:", hubUrl);

  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl)
    .withAutomaticReconnect([0, 2000, 10000])
    .configureLogging(signalR.LogLevel.Information)
    .build();

  // Đảm bảo không đăng ký lặp listener
  connection.off("ReceiveNotification");
  connection.on("ReceiveNotification", (data) => {
    console.log("📬 Notification:", data);
    if (onReceive) onReceive(data);
  });

  connection
    .start()
    .then(() => {
      isStarted = true; // Đánh dấu là kết nối đã được khởi tạo
      console.log("✅ SignalR hub connected");
    })
    .catch((err) => {
      console.error("❌ Error connecting to SignalR hub:", err);
    });
};

const stopHub = () => {
  if (connection) {
    connection.stop()
      .then(() => {
        connection = null;
        isStarted = false; // Đánh dấu kết nối đã ngừng
        console.log("🛑 SignalR hub stopped");
      })
      .catch((err) => {
        console.error("❌ Error stopping SignalR hub:", err);
      });
  }
};

export { startHub, stopHub };
