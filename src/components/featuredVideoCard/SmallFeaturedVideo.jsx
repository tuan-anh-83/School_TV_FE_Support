import React from "react";
import "./SmallFeaturedVideo.scss";
import VerticalVideoCard from "./VerticalVideoCard";

function SmallFeaturedVideo() {
  return (
    <div className="small-featured-video-container">
      <VerticalVideoCard />
      <VerticalVideoCard />
      <VerticalVideoCard />
      <VerticalVideoCard />
      <VerticalVideoCard />
      <VerticalVideoCard />
      <VerticalVideoCard />
      <VerticalVideoCard />
    </div>
  );
}

export default SmallFeaturedVideo;
