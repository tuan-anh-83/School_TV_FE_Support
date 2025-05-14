import { Badge } from "antd";
import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "./NotificationItem.scss";
dayjs.extend(utc);
dayjs.extend(timezone);

function NotificationItem(props) {
  const {
    title,
    message,
    createdAt,
    isRead,
    onClick,
    handlePageNoti,
    length,
    pageSize,
    pageNoti,
  } = props;

  // Convert to UTC+7
  const createdTime = dayjs(createdAt).tz("Asia/Ho_Chi_Minh");
  const now = dayjs().tz("Asia/Ho_Chi_Minh");

  const diffMinutes = now.diff(createdTime, "minute");
  const diffHours = now.diff(createdTime, "hour");
  const diffDays = now.diff(createdTime, "day");

  let displayTime = "";
  if (diffMinutes < 60) {
    displayTime = `${diffMinutes} phút trước`;
  } else if (diffHours < 24) {
    displayTime = `${diffHours} giờ trước`;
  } else {
    displayTime = createdTime.format("DD/MM/YYYY");
  }

  return (
    <>
      <div
        className={`user-notification-item ${!isRead ? "unread" : ""}`}
        onClick={onClick}
      >
        <div className="user-notification-item-content">
          <div className="user-notification-item-icon">
            <i className="fas fa-bell notification-type-icon" />
            {!isRead && (
              <Badge status="processing" className="user-notification-badge" />
            )}
          </div>
          <div className="user-notification-item-text">
            <h4 className="user-notification-item-title">{title}</h4>
            <p className="user-notification-item-message">{message}</p>
            <span className="user-notification-item-time">{displayTime}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotificationItem;
