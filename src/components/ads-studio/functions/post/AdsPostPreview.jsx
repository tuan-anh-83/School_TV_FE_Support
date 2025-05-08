import React from "react";
import "./AdsPostPreview.scss";
import { Avatar } from "antd";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

function AdsPostPreview(props) {
  const { previewPostData, isMobile } = props;

  return (
    <div className="post-preview-container" id="post-preview-container">
      <div className="post-preview-owner" style={{ gap: 15}}>
        <Avatar
          size={40}
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            previewPostData.owner
          )}&background=random`}
        />
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          <p>{previewPostData?.Title || ""}</p>
        </div>
      </div>

      <div className="post-preview-content">
        <div className="post-preview-images" style={{ height: "100%", paddingInline: "4%" }}>
          {previewPostData?.VideoUrl && (
            <iframe
              src={`${previewPostData?.VideoUrl}?autoplay=1&mute=0&controls=0&rel=0&playsinline=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                zIndex: 3,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdsPostPreview;
