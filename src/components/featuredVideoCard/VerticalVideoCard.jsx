import React from "react";
import "./VerticalVideoCard.scss";
import { Col, Flex, Image, Row } from "antd";
import { BsDot } from "react-icons/bs";

function VerticalVideoCard() {
  return (
    <div className="vertical-video-card-container">
      <Row gutter={[10, 0]} style={{ height: "100%", width: "100%" }}>
        <Col span={8} style={{ height: "100%" }}>
          <Image
            width={"100%"}
            height={"100%"}
            src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
            preview={false}
          />
        </Col>

        <Col span={16} className="vertical-video-card-info">
          <h2>Video title</h2>
          <p>Channel</p>
          <Flex
            align="center"
            className="vertical-video-card-info__interaction"
          >
            <p>1,5 triệu lượt xem</p>
            <BsDot style={{ fontSize: "20px" }} />
            <p>1 tháng trước</p>
          </Flex>
        </Col>
      </Row>
    </div>
  );
}

export default VerticalVideoCard;
