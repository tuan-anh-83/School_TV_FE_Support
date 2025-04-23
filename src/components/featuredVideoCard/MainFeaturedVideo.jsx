import React from "react";
import "./MainFeaturedVideo.scss";
import { Flex, Image } from "antd";
import { BsDot } from "react-icons/bs";

function MainFeaturedVideo() {
  return (
    <div className="main-featured-video-container">
      <video width={"100%"} height={"auto"} controls>
        <source
          src="https://www.w3schools.com/html/mov_bbb.mp4"
          type="video/mp4"
        />
        Trình duyệt của bạn không hỗ trợ video.
      </video>

      <div className="main-featured-video-info">
        <h1>Video title</h1>
        <Flex align="center" className="main-featured-video-info__interaction">
          <p>1,5 triệu lượt xem</p>
          <BsDot style={{ fontSize: "20px" }} />
          <p>1 tháng trước</p>
        </Flex>

        <div className="main-featured-video-info__channel">
          <Image
            width={50}
            height={50}
            src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
            preview={false}
          />

          <a href="">Channel</a>
        </div>
      </div>
    </div>
  );
}

export default MainFeaturedVideo;
