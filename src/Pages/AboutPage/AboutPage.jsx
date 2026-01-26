import React, { useEffect, useRef, useState } from "react";
import TopHeader from "../../Components/TopHeader/TopHeader";
import NavBar from "../../Components/NavBar/NavBar";
import Footer from "../../Components/Footer/Footer";
import Shipping from "../../Components/Shipping/Shipping";
import aboutImage from "../../assets/images/banner-2.jpg";
import manufacturingVideo from "../../assets/images/secondry-banner.mp4";
// import manufacturingVideo from "../../Assets/images/secondry-banner.mp4";
import "./AboutPage.css";
import { useDispatch } from "react-redux";
import { setAppLoading } from "../../redux/slices/userSlice";

export default function AboutPage() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setAppLoading(false));
  }, [dispatch]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      <div className="about-wrapper">
        <TopHeader />
        <NavBar />
        <div className="about-page">
          <div className="container">
            <div className="about-page-content">
              <div className="about-row">
                <div className="about-col1">
                  <div className="about-image">
                    <img src={aboutImage} alt="About" />
                  </div>
                </div>
                <div className="about-col2">
                  <h1>About Us</h1>
                  <p>
                    Welcome to our online store! We are a team of passionate
                    individuals dedicated to providing you with the best
                    shopping experience possible. Our mission is to offer
                    high-quality products at affordable prices, while ensuring
                    exceptional customer service.
                  </p>
                  <p>
                    We believe that shopping should be enjoyable and convenient,
                    which is why we have curated a wide range of products to
                    suit your needs. Whether you're looking for the latest
                    fashion trends, electronics, or home essentials, we've got
                    you covered.
                  </p>
                  <p>
                    Thank you for choosing us as your go-to online store. We
                    look forward to serving you!
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="shippping-sec">
            <div className="container">
              <Shipping />
            </div>
          </div>
          <div className="container">
            <div className="manufacturing-sec">
              <div className="manufactring-row">
                <div className="manufacturing-col1">
                  <h1>Manufacturing</h1>
                </div>
                <div className="manufacturing-col2">
                  <p>
                    At our company, we take pride in our manufacturing process.
                    We believe that quality starts from the ground up, and
                    that's why we pay close attention to every detail. Our team
                    of skilled artisans and craftsmen work tirelessly to create
                    products that are not only functional but also aesthetically
                    pleasing.
                  </p>
                </div>
              </div>

              {/* Your manufacturing video section */}
              <div className="manufacturing-video">
                <div className="video-container">
                  <video
                    ref={videoRef}
                    src={manufacturingVideo}
                    className="manufacturing-video-player"
                    loop
                    muted
                  />
                  <button className="play-pause-btn" onClick={handlePlayPause}>
                    {isPlaying ? "❚❚" : "▶"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
