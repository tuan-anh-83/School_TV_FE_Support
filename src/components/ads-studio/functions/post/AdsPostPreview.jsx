import React from "react";
import "./AdsPostPreview.scss";
import { Avatar } from "antd";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

function AdsPostPreview(props) {
  const { previewPostData, isMobile } = props;

  console.log("previewPostData", previewPostData);

  const formatDate = (date) => {
    if (!date || !date[0] || !date[1]) return "Chưa chọn thời gian";
    return `${date[0]} - ${date[1]}`;
  };

  return (
    <div className="post-preview-container" id="post-preview-container">
      <div
        className="post-preview-owner"
        style={{ gap: 15, alignItems: "center" }}
      >
        <Avatar
          size={40}
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            previewPostData.owner
          )}&background=random`}
        />
        <div style={{ fontWeight: 600 }}>
          <p style={{ margin: 0 }}>{previewPostData?.Title || ""}</p>
          <span className="preview-post-time-content" style={{ fontSize: 12 }}>
            Thời lượng: {previewPostData?.DurationSeconds || 0} giây
          </span>
        </div>
      </div>

      <div className="post-preview-content">
        <div
          className="post-preview-images"
          style={{ height: "100%", paddingInline: "4%" }}
        >
          {previewPostData.VideoPreviewUrl ? (
            <video
              src={previewPostData.VideoPreviewUrl}
              controls
              autoPlay
              style={{ width: "100%", maxHeight: "300px" }}
            />
          ) : (
            <div className="post-preview-box-content-body-image-placeholder">
              Chưa có video
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdsPostPreview;
