import React, { useEffect } from "react";
import "./Productcard.css";
import { useState } from "react";
import Popup from "../ProductPopup/ProductPopup";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../services/wishlistApiServices";
import { updateUserWishList } from "../../redux/slices/userSlice";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import RatingBadge from "../../icons/RatingBadge";

export default function Productcard(Props) {
  const { product, maxLength } = Props;
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSelector((state) => state.user);
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const [productPrice, setProductPrice] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Wishlist logic (Sync with Productolistproductcard)
  const wishlistProductIds = useMemo(() => {
    if (!user?.wishlist) return new Set();
    return new Set(
      user.wishlist.map((item) =>
        typeof item.product === "string" ? item.product : item.product?._id,
      ),
    );
  }, [user?.wishlist]);

  function isWishListed() {
    return wishlistProductIds.has(product?._id);
  }

  async function addPRoductToWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    if (product._id && user.id) {
      const response = await addToWishlist(
        product?._id,
        user.id,
        selectedCountry._id,
      );
      if (response) {
        dispatch(updateUserWishList({ user: response?.wishlist?.products }));
      }
    } else {
      navigate("/login");
    }
  }

  async function removeProductFromWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    if (product._id && user.id) {
      const response = await removeFromWishlist(
        product._id,
        user.id,
        selectedCountry._id,
      );
      if (response) {
        dispatch(updateUserWishList({ user: response?.wishlist?.products }));
      }
    } else {
      navigate("/login");
    }
  }

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
    <>
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
            {product?.productImages?.length > 1 && (
              <div className="product-hover-image">
                <img
                  src={`${import.meta.env.VITE_BASE_URL}/${
                    product?.productImages[1].path || product?.productImages[1]
                  }`}
                  alt="product-image-2"
                />
              </div>
            )}
            <button
              className="wishlist-btn"
              onClick={(e) =>
                isWishListed()
                  ? removeProductFromWishlist(e)
                  : addPRoductToWishlist(e)
              }
            >
              {isWishListed() ? (
                <FaHeart color="#f43f5e" />
              ) : (
                <FaRegHeart color="#a1a1aa" />
              )}
            </button>
          </Link>
        </div>
        <div className="product-content">
          <Link
            to={`/${selectedCountry?.code}/product-inner/${product?._id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <h3 className="product-name">{product?.productName}</h3>
          </Link>
          <div className="product-price-row">
            <div className="price-details">
              <p className="current-price">
                {selectedCountry?.priceLabel}
                {getDiscountedPrice(
                  productPrice,
                  product?.productDiscount,
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </p>
              {product?.productDiscount > 0 && (
                <p className="discount-tag">{product?.productDiscount}% Off</p>
              )}
            </div>
            <div className="rating-badge">
              <RatingBadge />
              <span>{product?.productRating || "4.9"}</span>
            </div>
          </div>
        </div>
      </div>
      <Popup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        product={product}
        productPrice={productPrice}
      ></Popup>
    </>
  );
}
