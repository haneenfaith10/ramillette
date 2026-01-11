import React, { useEffect, useState } from "react";
// import secondryvideo from "../../assets/images/secondry-banner.mp4";
import "./SecondryBanner.css";
import { getAllVideoBanners } from "../../services/bannerVideoApiServices";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function SecondryBanner() {
  const [bannerData, setBannerData] = useState({});
  const navigate = useNavigate();
  const selectedCountry = useSelector((state) => state.user.selectedCountry);

  useEffect(() => {
    getAllVideoBanners(setBannerData);
  }, []);

  return (
    <>
      <div className="secondry-banner">
        {bannerData[0] && Object.keys(bannerData[0]).length > 0 ? (
          <>
            <div className="secondry-banner-video">
              <video autoPlay loop muted playsInline>
                <source
                  src={`${import.meta.env.VITE_BASE_URL}/${
                    bannerData[0]?.videoUrl
                  }`}
                  type="video/mp4"
                />
              </video>
            </div>
            <div className="secondry-banner-content">
              <h2>{bannerData[0]?.content}</h2>
              <button
                className="secondry-btn"
                onClick={() =>
                  navigate(`/${selectedCountry.code}/product-list`)
                }
              >
                Shop Now
              </button>
            </div>
          </>
        ) : (
          <>
            {/* <div className="secondry-banner-video">
              <video autoPlay loop muted playsInline>
                <source src={secondryvideo} type="video/mp4" />
              </video>
            </div>
            <div className="secondry-banner-content">
              <h2>Get the best deals on your favorite products</h2>
              <button
                className="secondry-btn"
                onClick={() =>
                  navigate(`/${selectedCountry.code}/product-list`)
                }
              >
                Shop Now
              </button>
            </div> */}
          </>
        )}
      </div>
    </>
  );
}
