// utils/adsHub.js
import * as signalR from "@microsoft/signalr";

let connection = null;
let isStarted = false;

const baseUrl = import.meta.env.VITE_SERVER_API_PREFIX;
const hubUrl = `${baseUrl}/hubs/livestream`;

/**
 * Bắt đầu kết nối SignalR đến LiveStreamHub và xử lý quảng cáo realtime.
 * @param {string} accountId - ID tài khoản.
 * @param {function} onAdsReceived - Hàm callback để xử lý danh sách ads khi server gửi về.
 */
const startAdsHub = (accountId, onAdsReceived) => {
  if (connection && isStarted) return;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${hubUrl}?accountId=${accountId}`)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.on("Ads", (adsData) => {
    console.log("🎯 Ads received:", adsData);
    if (onAdsReceived) onAdsReceived(adsData);
  });

  connection
    .start()
    .then(() => {
      isStarted = true;
      console.log("✅ Connected to LiveStreamHub for Ads");

      // Gọi hàm bên server để lấy quảng cáo ban đầu
      connection.invoke("ReceiveAdsVideos").catch((err) => {
        console.error("❌ Failed to invoke ReceiveAdsVideos:", err);
      });
    })
    .catch((err) => {
      console.error("❌ Failed to connect to LiveStreamHub:", err);
    });
};

/**
 * Ngắt kết nối SignalR nếu có.
 */
const stopAdsHub = () => {
  if (connection) {
    connection.stop();
    connection = null;
    isStarted = false;
    console.log("🛑 AdsHub connection stopped.");
  }
};

export { startAdsHub, stopAdsHub };
