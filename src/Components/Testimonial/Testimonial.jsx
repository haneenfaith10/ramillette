import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Testimonial.css";
import Rating from "@mui/material/Rating";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import UserAvatar from "../../assets/images/userAvathar.jpg";

const TestimonialSlider = (Props) => {
  const { reviews } = Props;

  // Slider settings with autoplay
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: false,
    swipe: true,
    touchMove: true,
    swipeToSlide: true,
    useCSS: true,
    useTransform: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          swipe: true,
          touchMove: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          swipe: true,
          touchMove: true,
        },
      },
    ],
  };

  return (
    <div className="testimonial-container">
      {reviews && reviews.length > 0 && (
        <>
          {/* <div className="testimonial-badge">TESTIMONIALS</div> */}
          <h2>
            Our trusted <span>Clients</span>
          </h2>
          <Slider {...settings} className="testimonial-slider">
            {reviews.map((testimonial, index) => (
              <div key={index} className="testimonial-slide">
                <div className="testimonial-card">
                  <FormatQuoteIcon className="quote-icon" />
                  <div className="review-content">
                    <p className="review-text">
                      {testimonial?.content ||
                        "Great product and excellent service!"}
                    </p>
                  </div>
                  <div className="testimonial-separator"></div>
                  <div className="testimonial-author-info">
                  <img
                    src={`${import.meta.env.VITE_BASE_URL}/${
                      testimonial?.user?.userImage
                    }`}
                      alt={testimonial?.user?.firstName || "user"}
                      className="testimonial-avatar"
                    onError={(e) => {
                      e.currentTarget.src = UserAvatar;
                    }}
                  />
                    <div className="author-details">
                      <p className="author-name">
                        {testimonial?.user?.firstName || ""}{" "}
                        {testimonial?.user?.lastName || ""}
            </p>
          </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </>
      )}
    </div>
  );
};

export default TestimonialSlider;
