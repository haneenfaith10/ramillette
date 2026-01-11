import  { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Productslider.css"

const ProductSlider = ({ images }) => {
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);

  const slider1 = useRef(null);
  const slider2 = useRef(null);

  useEffect(() => {
    setNav1(slider1.current);
    setNav2(slider2.current);
  }, []);

  return (
    <div className="slider-container">
      {/* Main Slider */}
      <Slider className="main-image-slider" asNavFor={nav2} ref={slider1} arrows={false} fade>
        {images.map((img, index) => (
          <div className="main-slider-sec" key={index}>
            <img src={`${import.meta.env.VITE_BASE_URL}/${img.path||img}`} alt={`Product ${index}`} className="main-slide" />
          </div>
        ))}
      </Slider>

      {/* Thumbnail Slider */}
      <Slider
        className="thumb-image-slider"
        asNavFor={nav1}
        ref={slider2}
        slidesToShow={images.length < 4 ? images.length : 4} // Adjust dynamically
        swipeToSlide
        focusOnSelect
        centerMode={images.length > 4} // Disable for small image counts
        infinite={false} // Prevent infinite loop
      >
        {images.map((img, index) => (
          <div className="thumb-slide-sec" key={index} style={{ margin: "0 5px" }}>
            <img src={`${import.meta.env.VITE_BASE_URL}/${img.path||img}`} alt={`Thumbnail ${index}`} className="thumb-slide" />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ProductSlider;
