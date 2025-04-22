import React from "react";
import { Flex, Image } from "antd";
import "./AllVideoCard.scss";
import { useNavigate } from "react-router-dom";

function AllVideoCard() {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate("/play-featured-video")} className="allVideo-card-container">
      <Image
        width={"100%"}
        height={200}
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        style={{
          borderTopLeftRadius: "10px",
          borderTopRightRadius: "10px",
          objectFit: "cover",
          overflow: "hidden",
        }}
        preview={false}
      />

      <div className="allVideo-card-detail">
        <h2>Title1</h2>
        <p style={{color: "#1E90FF"}}>Channel 1</p>
        <Flex justify="space-between" className="allVideo-card-detail__stats">
          <p>1,5 triệu lượt xem</p>
          <p>1 ngày trước</p>
        </Flex>
      </div>
    </div>
  );
}

export default AllVideoCard;
