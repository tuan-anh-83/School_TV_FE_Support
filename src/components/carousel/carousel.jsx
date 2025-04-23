import React, { useRef, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

import './carousel.scss';

// import required modules
import { Navigation } from 'swiper/modules';

export default function Carousel() {
  return (
    <>
      <Swiper navigation={true} modules={[Navigation]} className="carousel">
      <SwiperSlide>
          <div className="banner-container">
            <img src="https://th.bing.com/th/id/R.69d5030039448756d2f42e492eed6f69?rik=pb%2bcPexDVO8m9w&pid=ImgRaw&r=0" alt="" />
            <div className="banner-text">Lễ Tốt Nghiệp 2023 - ĐH Bách Khoa Hà Nội</div>
            <div className="sub-text">Trực tiếp từ Nhà hát lớn Hà Nội</div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="banner-container">
            <img src="https://th.bing.com/th/id/R.69d5030039448756d2f42e492eed6f69?rik=pb%2bcPexDVO8m9w&pid=ImgRaw&r=0" alt="" />
            <div className="banner-text">Lễ Tốt Nghiệp 2023 - ĐH Bách Khoa Hà Nội</div>
            <div className="sub-text">Trực tiếp từ Nhà hát lớn Hà Nội</div>
          </div>
        </SwiperSlide>
        
        <SwiperSlide>
          <div className="banner-container">
            <img src="https://th.bing.com/th/id/R.69d5030039448756d2f42e492eed6f69?rik=pb%2bcPexDVO8m9w&pid=ImgRaw&r=0" alt="" />
            <div className="banner-text">Lễ Tốt Nghiệp 2023 - ĐH Bách Khoa Hà Nội</div>
            <div className="sub-text">Trực tiếp từ Nhà hát lớn Hà Nội</div>
          </div>
        </SwiperSlide>
        
      </Swiper>
    </>
  );
}
