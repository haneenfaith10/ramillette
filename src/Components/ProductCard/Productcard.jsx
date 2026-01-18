import React, { useEffect } from "react";
import Perfumimg from "../../assets/images/perfume.png";
import Perfumhoverimg from "../../assets/images/perfume-hover.png";
import "./Productcard.css";
import { useState } from "react";
import quickview from "../../assets/images/search.png";
import Tooltip from "../Tooltip/Tooltip";
import Popup from "../ProductPopup/ProductPopup";
import { Link, useNavigate } from "react-router-dom";
import { addToCart } from "../../services/userApiServices";
import { useDispatch, useSelector } from "react-redux";
import { updateCart } from "../../redux/slices/userSlice";

export default function Productcard(Props) {
  const { product, maxLength } = Props;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const userCart = useSelector((state) => state.user.user?.cart?.items);
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

  const token = localStorage.getItem("remilletteTkn");
  useEffect(() => {
    if (token) {
      setIsUserLoggedIn(true);
    }
  }, [token]);
  async function addProductToCart() {
    if (!isUserLoggedIn) {
      navigate("/login");
      return;
    }
    const response = await addToCart(
      product?._id,
      1,
      selectedCountry?._id,
      false,
      token
    );
    if (response) {
      dispatch(updateCart({ cart: response }));
    }
  }

  // function to calculate the actual price
  function getDiscountedPrice(amount, discountPercent) {
    const discountAmount = (discountPercent / 100) * amount;
    const finalPrice = amount - discountAmount;
    return finalPrice;
  }

  // function to check is the product in the cart or not
  function isInCart() {
    if (userCart && userCart.length > 0) {
      return userCart.some((item) => {
        const idInCart =
          typeof item.productId === "object"
            ? item.productId._id
            : item.productId;
        return idInCart === product._id;
      });
    }
  }


  function truncateProductName(name) {
    if (!name) return "";
    const maxLength = 22;
    if (name.length > maxLength) {
      return `${name.substring(0, maxLength)}...`;
    }
    return name;
  }

  return (
    <div>
      <div className="product-card">
        <div className="product-card-image-sec">
          <Link to={`/${selectedCountry.code}/product-inner/${product?._id}`}>
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
            <h3>
              {truncateProductName(product?.productName)}
            </h3>
          <p>
            {selectedCountry.priceLabel}
            {getDiscountedPrice(productPrice, product?.productDiscount)}
            <span className="cutting-money">
              {selectedCountry.priceLabel}
              {productPrice || 0}.00
            </span>
          </p>
          </div>
          <div className="quick-btn">
            <Tooltip text="Quick View">
              <button
                onClick={() => setIsOpen(true)}
                className="quick-view-div"
              >
                <img src={quickview} alt="" />
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="product-button-section">
        {isInCart() ? (
          <button
            className="secondry-btn buy-now"
            onClick={() => navigate(`/${selectedCountry.code}/checkout`)}
          >
            Buy Now
          </button>
        ) : (
          <button className="secondry-btn" onClick={addProductToCart}>
            ADD TO CART
          </button>
        )}
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
