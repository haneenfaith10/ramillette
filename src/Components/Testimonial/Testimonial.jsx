import React, { useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Testimonial.css";
import Rating from "@mui/material/Rating";
import UserAvatar from "../../assets/images/userAvathar.jpg";

const TestimonialSlider = (Props) => {
  const { reviews } = Props;
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const settings = {
    infinite: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "0px", // Keeps slides centered
    arrows: reviews.length > 1,
    loop: true,
    focusOnSelect: true,
    beforeChange: (_, newIndex) => setCurrentSlide(newIndex),
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 5, centerPadding: "30px" },
      },
      { breakpoint: 768, settings: { slidesToShow: 5, centerPadding: "20px" } },
      { breakpoint: 600, settings: { slidesToShow: 3, centerPadding: "0px" } },
    ],
  };

  return (
    <div className="testimonial-container">
      {reviews && reviews.length > 0 && (
        <>
          <h2>
            What Our <span>Customers</span> Have To Say
          </h2>
          <Slider {...settings} className="testimonial-slider" ref={sliderRef}>
            {reviews.map((testimonial, index) => {
              let slideClass = "testimonial-card";

              const totalSlides = reviews.length;
              const leftIndex = (currentSlide - 1 + totalSlides) % totalSlides;
              const rightIndex = (currentSlide + 1) % totalSlides;
              const leftOuterIndex =
                (currentSlide - 2 + totalSlides) % totalSlides;
              const rightOuterIndex = (currentSlide + 2) % totalSlides;

              if (index === currentSlide) {
                slideClass += " active";
              } else if (index === leftIndex || index === rightIndex) {
                slideClass += " adjacent";
              } else if (
                index === leftOuterIndex ||
                index === rightOuterIndex
              ) {
                slideClass += " outer";
              }

              return (
                <div key={index} className={slideClass}>
                  <img
                    src={`${import.meta.env.VITE_BASE_URL}/${
                      testimonial?.user?.userImage
                    }`}
                    alt={testimonial?.user?.userImage || "review"}
                    className="testimonial-img"
                    onError={(e) => {
                      e.currentTarget.src = UserAvatar;
                    }}
                  />
                </div>
              );
            })}
          </Slider>
          {/* Dynamic Review Content */}
          <div className="testimonial-content">
            <p className="stars">
              <Rating
                name="read-only"
                value={
                  reviews &&
                  reviews[currentSlide] &&
                  reviews[currentSlide]?.rating
                    ? reviews[currentSlide]?.rating
                    : 0
                }
                sx={{ fontSize: "40px" }}
                precision={0.5}
                readOnly
              />
            </p>
            <p className="review-text">
              {reviews &&
                reviews[currentSlide] &&
                reviews[currentSlide].content &&
                reviews[currentSlide]?.content}
            </p>
            <p className="author">
              —{" "}
              {reviews &&
                reviews[currentSlide] &&
                // reviews[currentSlide].firstName &&
                reviews[currentSlide]?.user.firstName}{" "}
              {reviews &&
                reviews[currentSlide] &&
                // reviews[currentSlide].lastName &&
                reviews[currentSlide]?.user.lastName}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default TestimonialSlider;
