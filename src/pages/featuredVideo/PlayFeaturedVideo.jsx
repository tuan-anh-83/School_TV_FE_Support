import React, { useEffect } from 'react'
import "./PlayFeaturedVideo.scss"
import { Col, Row } from 'antd'
import MainFeaturedVideo from '../../components/featuredVideoCard/MainFeaturedVideo'
import SmallFeaturedVideo from '../../components/featuredVideoCard/SmallFeaturedVideo'

function PlayFeaturedVideo() {
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className='play-featured-video-container'>
      <Row gutter={[24, 24]}>
        <Col span={16} lg={16} md={24} sm={24} xs={24}>
            <MainFeaturedVideo />
        </Col>

        <Col span={8} lg={8} md={24} sm={24} xs={24}>
            <SmallFeaturedVideo />
        </Col>
      </Row>
    </div>
  )
}

export default PlayFeaturedVideo
