import React from "react";
import "./AllFeaturedVideo.scss";
import { Button, Col, Flex, Row } from "antd";
import AllVideoCard from "../../components/featuredVideoCard/AllVideoCard";

function DisplayAllVideo() {
  return (
    <div className="featured-video-container">
      <h1>Video nổi bật</h1>

      <div className="featured-video-list">
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col
            style={{ marginBottom: 20 }}
            className="gutter-row"
            span={6}
            xs={24}
            sm={12}
            md={8}
            lg={6}
          >
            <AllVideoCard />
          </Col>

          <Col
            style={{ marginBottom: 20 }}
            className="gutter-row"
            span={6}
            xs={24}
            sm={12}
            md={8}
            lg={6}
          >
            <AllVideoCard />
          </Col>

          <Col
            style={{ marginBottom: 20 }}
            className="gutter-row"
            span={6}
            xs={24}
            sm={12}
            md={8}
            lg={6}
          >
            <AllVideoCard />
          </Col>

          <Col
            style={{ marginBottom: 20 }}
            className="gutter-row"
            span={6}
            xs={24}
            sm={12}
            md={8}
            lg={6}
          >
            <AllVideoCard />
          </Col>

          <Col
            style={{ marginBottom: 20 }}
            className="gutter-row"
            span={6}
            xs={24}
            sm={12}
            md={8}
            lg={6}
          >
            <AllVideoCard />
          </Col>

          <Col
            style={{ marginBottom: 20 }}
            className="gutter-row"
            span={6}
            xs={24}
            sm={12}
            md={8}
            lg={6}
          >
            <AllVideoCard />
          </Col>

          <Col
            style={{ marginBottom: 20 }}
            className="gutter-row"
            span={6}
            xs={24}
            sm={12}
            md={8}
            lg={6}
          >
            <AllVideoCard />
          </Col>

          <Col
            style={{ marginBottom: 20 }}
            className="gutter-row"
            span={6}
            xs={24}
            sm={12}
            md={8}
            lg={6}
          >
            <AllVideoCard />
          </Col>
        </Row>
      </div>

      <Flex className="featured-video__viewMore" justify="center">
        <Button color="primary" variant="solid">
          Xem thêm
        </Button>
      </Flex>
    </div>
  );
}

export default DisplayAllVideo;
