import { toast } from "react-toastify";
import apiFetch from "../config/baseAPI";

export async function getMyNotifications(page, pageSize) {
  try {
    const response = await apiFetch(
      `notifications/my?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Có lỗi khi hiển thị thông báo!");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    toast.error("Có lỗi khi hiển thị thông báo!");
  }
}

export async function markNotificationAsRead(notificationId) {
  try {
    const response = await apiFetch(
      `notifications/mark-read/${notificationId}`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("Có lỗi khi đánh dấu thông báo đã đọc!");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    toast.error("Có lỗi khi đánh dấu thông báo đã đọc!");
  }
}

export async function getNotificationByAccount(accountId) {
  try {
    const response = await apiFetch(`notifications/account/${accountId}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Có lỗi khi hiển thị thông báo!");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    toast.error("Có lỗi khi hiển thị thông báo!");
  }
}

export async function broadcastNotification(content) {
  try {
    const response = await apiFetch("notifications/broadcast", {
      method: "POST",
      body: JSON.stringify(content),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Có lỗi khi gửi thông báo!");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    toast.error("Có lỗi khi gửi thông báo!");
  }
}
