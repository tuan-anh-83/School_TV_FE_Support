import * as signalR from "@microsoft/signalr";
import { message } from "antd";

let connection = null;
let isStarted = false;
let connectionPromise = null;

// Định nghĩa baseUrl từ biến môi trường
const baseUrl = import.meta.env.VITE_SERVER_API_PREFIX;

// Add periodic connection check
function startPeriodicConnectionCheck() {
  setInterval(() => {
    if (connection) {
      console.log("AccountStatusHub: Connection state:", connection.state);
      console.log("AccountStatusHub: Is started:", isStarted);
    }
  }, 10000); // Check every 10 seconds
}

async function startConnection(accountId) {
  if (connection && isStarted) {
    console.log("AccountStatusHub: Already connected");
    return connection;
  }

  // If there's already a connection attempt in progress, wait for it
  if (connectionPromise) {
    console.log("AccountStatusHub: Connection attempt already in progress");
    return connectionPromise;
  }

  const hubUrl = `${baseUrl}/hubs/accountStatus`.replace(/([^:]\/)\/+/g, "$1");
  console.log("AccountStatusHub: Starting connection...", { hubUrl });

  connectionPromise = (async () => {
    try {
      connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => {
            const token = localStorage.getItem("authToken");
            if (!token) {
              console.error("AccountStatusHub: No auth token found");
              throw new Error("No authentication token available");
            }
            return token;
          },
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Debug)
        .build();

      // Add more detailed connection error logging
      connection.onreconnecting((error) => {
        console.log("AccountStatusHub: Reconnecting...", error);
        if (error) {
          console.error("AccountStatusHub: Reconnection error details:", {
            message: error.message,
            name: error.name,
            stack: error.stack,
          });
        }
        isStarted = false;
      });

      connection.onreconnected((connectionId) => {
        console.log(
          "AccountStatusHub: Reconnected. ConnectionId:",
          connectionId
        );
        isStarted = true;

        // Re-join group after reconnection
        connection
          .invoke("JoinAccountGroup", accountId.toString())
          .then(() =>
            console.log("AccountStatusHub: Rejoined group after reconnection")
          )
          .catch((err) =>
            console.error("AccountStatusHub: Failed to rejoin group:", err)
          );
      });

      connection.onclose((error) => {
        console.log("AccountStatusHub: Connection closed", error);
        isStarted = false;
        connection = null;
        connectionPromise = null;
      });

      // Register event handlers
      connection.on("AccountStatusChanged", (status) => {
        console.log("🔔 AccountStatusHub: Status changed event received");
        console.log("📊 AccountStatusHub: Full status data:", status);
        console.log("🔍 AccountStatusHub: Status type:", typeof status);

        if (!status) {
          console.error(
            "❌ AccountStatusHub: Received null or undefined status"
          );
          return;
        }

        // Log raw status before any processing
        if (typeof status === "object") {
          console.log("📦 AccountStatusHub: Status is an object:", {
            keys: Object.keys(status),
            values: Object.values(status),
          });
          // If status is an object, try to find the actual status value
          status =
            status.status || status.accountStatus || status.state || status;
        }

        const statusLower = String(status).toLowerCase();
        console.log("🎯 AccountStatusHub: Processed status value:", {
          original: status,
          lowercase: statusLower,
          comparison: statusLower !== "active",
        });

        if (statusLower !== "active") {
          console.log(
            "🚫 AccountStatusHub: Account is not active, logging out..."
          );
          message.error(
            "Your account has been deactivated. You will be logged out."
          );
          localStorage.clear();
          window.location.href = "/login";
        }
      });

      // Add handlers for all possible status events
      [
        "AccountDeactivated",
        "AccountInactive",
        "StatusUpdate",
        "AccountStateChanged",
      ].forEach((eventName) => {
        connection.on(eventName, (data) => {
          console.log(
            `🎭 AccountStatusHub: Received ${eventName} event:`,
            data
          );
          // Handle the event similar to AccountStatusChanged
          if (data && typeof data === "object") {
            console.log(`📦 AccountStatusHub: ${eventName} data structure:`, {
              keys: Object.keys(data),
              values: Object.values(data),
            });
          }
        });
      });

      // Add test event handler
      connection.on("TestEvent", (data) => {
        console.log("🧪 AccountStatusHub: Received test event:", data);
      });

      await connection.start();
      console.log("AccountStatusHub: Connected successfully");
      isStarted = true;

      console.log("AccountStatusHub: Joining group for account:", accountId);
      await connection.invoke("JoinAccountGroup", accountId.toString());
      console.log("AccountStatusHub: Joined group successfully");

      // Start periodic connection check
      startPeriodicConnectionCheck();

      return connection;
    } catch (error) {
      console.error("AccountStatusHub: Connection failed:", error);
      isStarted = false;
      connection = null;
      connectionPromise = null;
      throw error;
    }
  })();

  return connectionPromise;
}

async function stopConnection(accountId) {
  if (connection && isStarted) {
    try {
      console.log("AccountStatusHub: Leaving group for account:", accountId);
      await connection.invoke("LeaveAccountGroup", accountId.toString());
      console.log("AccountStatusHub: Left group successfully");

      await connection.stop();
      console.log("AccountStatusHub: Connection stopped");
      isStarted = false;
      connection = null;
      connectionPromise = null;
    } catch (error) {
      console.error("AccountStatusHub: Error during disconnect:", error);
      // Reset state even if there's an error
      isStarted = false;
      connection = null;
      connectionPromise = null;
    }
  }
}

async function testConnection() {
  if (!connection || !isStarted) {
    console.log("AccountStatusHub: No active connection");
    return false;
  }

  try {
    // Try to invoke a simple method to test connection
    console.log("🧪 AccountStatusHub: Testing connection...");

    // Try to invoke methods that might exist on the hub
    try {
      await connection.invoke("Ping");
      console.log("✅ AccountStatusHub: Ping successful");
    } catch (err) {
      console.log("ℹ️ AccountStatusHub: Ping not available", err);
    }

    try {
      await connection.invoke("TestConnection");
      console.log("✅ AccountStatusHub: TestConnection successful");
    } catch (err) {
      console.log("ℹ️ AccountStatusHub: TestConnection not available", err);
    }

    // Log current connection state
    console.log("📡 AccountStatusHub: Current connection state:", {
      state: connection.state,
      isStarted,
      connectionId: connection.connectionId,
      baseUrl,
    });

    return true;
  } catch (error) {
    console.error("❌ AccountStatusHub: Connection test failed:", error);
    return false;
  }
}

export const accountStatusHub = {
  startConnection,
  stopConnection,
  testConnection,
};
