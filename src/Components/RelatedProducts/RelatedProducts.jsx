import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getDiscountedPrice } from "../../utils/calculation";
import { Link } from "react-router-dom";
import "./RelatedProducts.css";
import { useSelector } from "react-redux";

function CustomRelatedProductCard({ product }) {
  const selectedCountry = useSelector((state) => state.user.selectedCountry);

  const firstImage = product.productImages?.[0].path;
  const discount = product.productDiscount || 0;
  const countryId =
    product.countryVariants && Object.keys(product.countryVariants)[0];
  const firstVariant = product.countryVariants?.[countryId]?.[0];

  const basePrice = Number(firstVariant?.price || 0);
  const discountedPrice = getDiscountedPrice(basePrice, discount);

  return (
    <Link
      to={`/${selectedCountry.code}/product-inner/${product._id}`}
      className="related-product-card"
    >
      <div className="related-product-image-wrapper">
        <img
          src={`${import.meta.env.VITE_BASE_URL}/${firstImage}`}
          alt={product.productName}
        />
        {discount > 0 && (
          <span className="related-discount-badge">-{discount}%</span>
        )}
      </div>
      <div className="related-product-info">
        <h3 className="related-title">{product.productName}</h3>
        <div className="related-price">
          <span className="discounted-price">
            {selectedCountry?.priceLabel || "₹"}
            {discountedPrice.toFixed(2)}
          </span>
          {discount > 0 && (
            <span className="original-price">
              {selectedCountry?.priceLabel || "₹"}
              {basePrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function RelatedProducts({ relatedProducts }) {

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: false,
    centerPadding: "0px",
    arrows: false,
    swipe: true,
    touchMove: true,
    draggable: true,
    responsive: [
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          centerPadding: "0px",
          arrows: false,
          swipe: true,
          touchMove: true,
          draggable: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          centerPadding: "0px",
          arrows: false,
          swipe: true,
          touchMove: true,
          draggable: true,
        },
      },
    ],
  };

  if (!relatedProducts || relatedProducts.length === 0) return null;

  // Limit to 4 products for desktop
  const displayProducts = relatedProducts.slice(0, 4);

  return (
    <div className="related-products-slider">
      <div className="">
        <div className="related-product-wrap">
          <h2>
            Related Products
          </h2>
          {/* Grid layout for desktop */}
          <div className="related-products-grid">
            {displayProducts.map((product) => (
              <div key={product._id} className="grid-item">
                <CustomRelatedProductCard product={product} />
              </div>
            ))}
          </div>
          {/* Slider for mobile */}
          <div className="related-products-mobile-slider">
            <Slider {...settings}>
              {relatedProducts.map((product) => (
                <div key={product._id} className="slider-item">
                  <CustomRelatedProductCard product={product} />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
}
