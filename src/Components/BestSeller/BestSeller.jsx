import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "./BestSeller.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getBestSellerForUser } from "../../services/bestSellerApiService";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Bestseller = () => {
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const [bestSellerData, setBestSellerData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedCountry._id) {
      getBestSellerForUser(selectedCountry._id, setBestSellerData);
    }
  }, [selectedCountry._id]);

  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    loop: true,
    autoplaySpeed: 2000,
    responsive: [
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="product-slider">
      {bestSellerData && bestSellerData.length > 0 && (
        <Slider {...settings}>
          {bestSellerData.map((item) => (
            <div key={item._id}>
              <div className="best-sell-card">
                <div className="video-container">
                  <video
                    width="100%"
                    height="450px"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source
                      src={`${import.meta.env.VITE_BASE_URL}/${item.video}`}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="video-content">
                  <div className="video-content-row">
                    <div className="video-cont-col1">
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}/${
                          item.product?.productImages?.[0].path
                        }`}
                        alt={item.product?.productName}
                        onClick={() =>
                          navigate(
                            `/${selectedCountry.code}/product-inner/${item.product?._id}`
                          )
                        }
                      />
                    </div>
                    <div className="video-cont-col2">
                      <h4
                        onClick={() =>
                          navigate(
                            `/${selectedCountry.code}/product-inner/${item.product?._id}`
                          )
                        }
                      >
                        {item.product?.productName}
                      </h4>
                      <p>{item?.product?.productDescription}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
};

export default Bestseller;
