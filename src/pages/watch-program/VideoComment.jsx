import React from "react";
import "./VideoComment.scss";

function VideoComment() {
  const messages = [
    {
      user: {
        name: "Nguyễn Văn A",
        badge: "VIP",
      },
      time: "10:30 AM - 10/04/2025",
      text: "Bình luận đầu tiên, thật tuyệt vời!",
    },
    {
      user: {
        name: "Trần Thị B",
        badge: "Premium",
      },
      time: "11:15 AM - 10/04/2025",
      text: "Mình rất thích video này, cảm ơn nhé!",
    },
    {
      user: {
        name: "Lê Minh C",
        badge: "Standard",
      },
      time: "12:00 PM - 10/04/2025",
      text: "Video rất hay nhưng có thể cải thiện chút xíu.",
    },
  ];
  return (
    <div className="video-comment-container">
      <div className="video-comment-header">
        <h2 className="video-comment-title">
          <i className="fas fa-comments" /> Bình luận video
        </h2>
        <div className="video-comment-options">
          <button className="video-comment-option" title="Cài đặt bình luận">
            <i className="fas fa-cog" />
          </button>
          <button className="video-comment-option" title="Mở rộng">
            <i className="fas fa-expand" />
          </button>
        </div>
      </div>

      <div className="video-comment-messages">
        {/* Render các bình luận tại đây */}
        {messages.map((message, index) => (
          <div className="video-message" key={index}>
            <div className="video-message-header">
              <span className="video-username">
                {message.user.name}
                {message.user.badge && (
                  <span className="video-user-badge">{message.user.badge}</span>
                )}
              </span>
              <span className="video-message-time">{message.time}</span>
            </div>
            <div className="video-message-content">{message.text}</div>
          </div>
        ))}
      </div>

      <div className="video-comment-input">
        <div className="video-input-container">
          <input
            type="text"
            placeholder="Nhập bình luận..."
            // value và các handler cần thiết
          />
          <button className="emoji-trigger">
            <i className="far fa-smile" />
          </button>
          <button className="send-button">
            <i className="fas fa-paper-plane" /> Gửi
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoComment;
