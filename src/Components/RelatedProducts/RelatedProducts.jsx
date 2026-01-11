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
          <span className="discounted-price">₹{discountedPrice}</span>
          {discount > 0 && <span className="original-price">₹{basePrice}</span>}
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
    slidesToShow: 5,
    slidesToScroll: 1,
    centerMode: false,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1269,
        settings: {
          slidesToShow: 4,
          centerMode: false,
          centerPadding: "0px",
        },
      },
      {
        breakpoint: 890,
        settings: {
          slidesToShow:3,
          centerMode: false,
          centerPadding: "0px",
        },
      },
      {
        breakpoint: 679,
        settings: {
          slidesToShow: 2,
          centerMode: false,
          centerPadding: "0px",
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          centerPadding: "0px",
        },
      },
    ],
  };

  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <div className="related-products-slider">
      <div className="wrapper">
        <div className="related-product-wrap">
          <h2>
            Related Products
          </h2>
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
  );
}
