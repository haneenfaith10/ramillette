import React, { useEffect } from "react";
import "./Productcard.css";
import { useState } from "react";
import Popup from "../ProductPopup/ProductPopup";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Productcard(Props) {
  const { product, maxLength } = Props;
  const [isOpen, setIsOpen] = useState(false);
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const [productPrice, setProductPrice] = useState("");

  useEffect(() => {
    if (
      product &&
      product.countryVariants &&
      Object.keys(product.countryVariants).length > 0
    ) {
      const firstCountryId = Object.keys(product.countryVariants)[0];
      const firstVariant = product.countryVariants[firstCountryId]?.[0];
      setProductPrice(firstVariant?.price);
    }
  }, [product]);

  // function to calculate the actual price
  function getDiscountedPrice(amount, discountPercent) {
    const discountAmount = (discountPercent / 100) * amount;
    const finalPrice = amount - discountAmount;
    return finalPrice;
  }

  return (
    <div>
      <div className="product-card">
        <div className="product-card-image-sec">
          <Link to={`/${selectedCountry?.code}/product-inner/${product?._id}`}>
            <div className="product-image">
              <img
                src={`${import.meta.env.VITE_BASE_URL}/${
                  product?.productImages[0].path || product?.productImages[0]
                }`}
                alt="product-image-1"
              />
            </div>
            <div className="product-hover-image">
              <img
                src={`${import.meta.env.VITE_BASE_URL}/${
                  product?.productImages[1].path || product?.productImages[1]
                }`}
                alt="product-image-2"
              />
            </div>
            {/* <div className="product-new-label">
              <p>{product?.specialOffers[0]?.badge || "New"}</p>
            </div> */}
            {(product?.specialOffers?.length > 0 ||
              product?.productDiscount > 0) && (
              <div className="product-offer-label">
                <p>
                  {product?.specialOffers?.[0]?.discountValue ??
                    product?.productDiscount}
                  % OFF
                </p>
              </div>
            )}
          </Link>
        </div>
        <div className="product-content">
          <div className="product-info-section">
            <Link
              to={`/${selectedCountry?.code}/product-inner/${product?._id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <h3>{product?.productName}</h3>
            </Link>
            <p>
              {selectedCountry?.priceLabel}
              {getDiscountedPrice(productPrice, product?.productDiscount)}
              <span className="cutting-money">
                {selectedCountry?.priceLabel}
                {productPrice || 0}.00
              </span>
            </p>
          </div>
        </div>
      </div>
      <Popup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        product={product}
        productPrice={productPrice}
      ></Popup>
    </div>
  );
}
