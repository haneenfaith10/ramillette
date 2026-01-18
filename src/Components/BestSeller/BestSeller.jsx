import React, { useEffect, useState, useRef } from "react";
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
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [loadedVideos, setLoadedVideos] = useState(new Set());
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedCountry._id) {
      getBestSellerForUser(selectedCountry._id, setBestSellerData);
    }
  }, [selectedCountry._id]);

  // Handle slide change and load videos lazily
  const handleAfterChange = (current) => {
    if (!bestSellerData || bestSellerData.length === 0) return;
    
    setActiveSlideIndex(current);
    // Load current and adjacent videos
    const videosToLoad = [
      current,
      (current + 1) % bestSellerData.length,
      (current - 1 + bestSellerData.length) % bestSellerData.length,
    ];
    
    videosToLoad.forEach((index) => {
      if (!loadedVideos.has(index) && bestSellerData[index]) {
        setLoadedVideos((prev) => new Set([...prev, index]));
      }
    });
  };

  // Load first video immediately
  useEffect(() => {
    if (bestSellerData.length > 0 && loadedVideos.size === 0) {
      setLoadedVideos(new Set([0]));
    }
  }, [bestSellerData]);

  // Control video playback based on active slide
  useEffect(() => {
    const videoElements = document.querySelectorAll('.best-sell-card video');
    videoElements.forEach((video, index) => {
      if (index === activeSlideIndex && loadedVideos.has(index)) {
        video.play().catch(() => {
          // Auto-play was prevented, video will play on user interaction
        });
      } else {
        video.pause();
      }
    });
  }, [activeSlideIndex, loadedVideos]);

  const settings = {
    infinite: true,
    speed: 800,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    pauseOnFocus: true,
    cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easing: 'ease-in-out',
    afterChange: handleAfterChange,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          infinite: true,
          autoplay: true,
          afterChange: handleAfterChange,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2,
          infinite: true,
          autoplay: true,
          afterChange: handleAfterChange,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          infinite: true,
          autoplay: true,
          afterChange: handleAfterChange,
        },
      },
    ],
  };

  return (
    <div className="product-slider">
      {bestSellerData && bestSellerData.length > 0 && (
        <Slider {...settings} ref={sliderRef}>
          {bestSellerData.map((item, index) => {
            const shouldLoadVideo = loadedVideos.has(index);
            const isActiveSlide = activeSlideIndex === index;
            const posterImage = item.product?.productImages?.[0]?.path
              ? `${import.meta.env.VITE_BASE_URL}/${item.product.productImages[0].path}`
              : '';

            return (
              <div key={item._id}>
                <div className="best-sell-card">
                  <div className="video-container">
                    {shouldLoadVideo ? (
                      <video
                        width="100%"
                        height="450px"
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        poster={posterImage}
                        data-slide-index={index}
                        onLoadedData={() => {
                          // Video loaded successfully
                        }}
                      >
                        <source
                          src={`${import.meta.env.VITE_BASE_URL}/${item.video}`}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="video-placeholder">
                        <img
                          src={posterImage}
                          alt={item.product?.productName}
                          className="video-poster-image"
                        />
                        <div className="video-loading-overlay">
                          <div className="loading-spinner"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="video-content">
                    <div className="video-content-row">
                      <div className="video-cont-col1">
                        <img
                          src={`${import.meta.env.VITE_BASE_URL}/${
                            item.product?.productImages?.[0].path
                          }`}
                          alt={item.product?.productName}
                          loading="lazy"
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
            );
          })}
        </Slider>
      )}
    </div>
  );
};

export default Bestseller;
