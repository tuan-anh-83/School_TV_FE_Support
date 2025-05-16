// utils/adsHub.js
import * as signalR from "@microsoft/signalr";

let connection = null;
let isStarted = false;

const baseUrl = import.meta.env.VITE_SERVER_API_PREFIX;
const hubUrl = `${baseUrl}/hubs`;

/**
 * Bắt đầu kết nối SignalR đến LiveStreamHub và xử lý quảng cáo realtime.
 * @param {string} accountId - ID tài khoản.
 * @param {function} onAdReceived - Hàm callback để xử lý danh sách ads khi server gửi về.
 */
const startAdsHub = async (accountId, onAdReceived) => {
  if (connection && isStarted) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${hubUrl}/notification?accountId=${accountId}`)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.on("Ad", (adData) => {
    console.log("🎯 Ad received:", adData);
    if (onAdReceived) onAdReceived(adData);
  });

  try {
    await connection.start();
    isStarted = true;
    console.log("✅ Connection established successfully");
    return connection;
  } catch (err) {
    console.error("❌ Failed to connect to NotificationHub:", err);
    throw err;
  }
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

const joinScheduleGroup = async (scheduleId) => {
  console.log("Attempting to join group with scheduleId:", scheduleId);

  // Validate scheduleId before sending to server
  if (!scheduleId) {
    return;
  }

  // Wait for connection if not connected yet
  if (connection.state !== signalR.HubConnectionState.Connected) {
    return;
  }

  try {
    await connection.invoke("JoinNotiGroup", scheduleId.toString());
    console.log(`Successfully joined group ${scheduleId}`);
  } catch (error) {
    console.error(`Failed to join group ${scheduleId}:`, error);
  }
};

const leaveScheduleGroup = async (scheduleId) => {
  console.log("Attempting to leave group with scheduleId:", scheduleId);

  // Validate scheduleId before sending to server
  if (!scheduleId) {
    return;
  }

  // Wait for connection if not connected yet
  if (connection.state !== signalR.HubConnectionState.Connected) {
    return;
  }

  try {
    await connection.invoke("LeaveNotiGroup", scheduleId.toString());
    console.log(`Successfully leaved group ${scheduleId}`);
  } catch (error) {
    console.error(`Failed to leave group ${scheduleId}:`, error);
  }
};

export { startAdsHub, stopAdsHub, joinScheduleGroup, leaveScheduleGroup, connection };
