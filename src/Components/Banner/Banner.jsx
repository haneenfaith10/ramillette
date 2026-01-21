import React, { useEffect, useState } from "react";
import "./Banner.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getBannersForUser } from "../../services/bannerServices";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Banner = ({ bannersData }) => {
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const [internalBanners, setInternalBanners] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!bannersData && selectedCountry?._id) {
      getBannersForUser(selectedCountry._id, setInternalBanners);
    }
  }, [selectedCountry?._id, bannersData]);

  const banners = bannersData || internalBanners;

  const settings = {
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    dots: true,
    fade: true,
    cssEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    pauseOnHover: true,
    pauseOnFocus: true,
    pauseOnDotsHover: false,
    swipe: true,
    touchMove: true,
    draggable: true,
    adaptiveHeight: false,
  };

  if (banners.length === 0) return null;

  return (
    <div className="banner-sec">
      <Slider {...settings}>
        {banners.map((banner, index) => (
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
                  onClick={() =>
                    navigate(`/${selectedCountry?.code}/product-list`)
                  }
                >
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Banner;
