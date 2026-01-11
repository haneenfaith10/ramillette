import React, { useEffect, useState } from "react";
import "./Banner.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getBannersForUser } from "../../services/bannerServices";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Banner1 from "../../assets/images/banner1.jpg"

const Banner = () => {
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const [banners, setBanners] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedCountry?._id) {
      getBannersForUser(selectedCountry._id, setBanners);
    }
  }, [selectedCountry?._id]);

  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  return (
    <div className="banner-sec">
      <Slider {...settings}>
        {banners.length > 0 ? (
          banners.map((banner, index) => (
            <div key={index}>
              <div className="banner-image">
                <img
                  src={`${import.meta.env.VITE_BASE_URL}/${banner.imageUrl}`}
                  alt="banner"
                />
                <div className="banner-content">
                  <h1>{banner.content || "Experience Luxurious Perfume"}</h1>
                  <button
                    className="secondry-btn"
                    onClick={() => navigate(`/${selectedCountry?.code}/product-list`)}
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>
            <div className="banner-image">
              <img
                src={Banner1}
                alt="Default Banner"
              />
              <div className="banner-content">
                <h1>Experience Luxurious Perfume</h1>
                <button
                  className="secondry-btn"
                  onClick={() => navigate(`/${selectedCountry?.code}/product-list`)}
                >
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        )}
      </Slider>
    </div>
  );
};

export default Banner;
