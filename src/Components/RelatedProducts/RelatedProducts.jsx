import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./RelatedProducts.css";
import Productcard from "../ProductCard/Productcard";

export default function RelatedProducts({ relatedProducts }) {
  const settings = {
    infinite: false,
    speed: 800,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    arrows: true,
    cssEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    easing: "ease-in-out",
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          infinite: false,
          autoplay: false,
          arrows: true,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2,
          infinite: false,
          autoplay: false,
          arrows: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1.6,
          infinite: false,
          autoplay: false,
          arrows: false,
          centerMode: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1.6,
          infinite: false,
          autoplay: false,
          arrows: false,
          centerMode: false,
        },
      },
    ],
  };

  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <div className="related-products-section">
      <div className="related-product-wrap">
        <h2 className="related-title-main">Related Products</h2>
        <div className="related-products-slider-outer">
          <Slider {...settings}>
            {relatedProducts.slice(0, 4).map((product) => (
              <div key={product._id}>
                <Productcard product={product} maxLength={27} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
}
