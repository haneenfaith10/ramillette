import { FaStar } from "react-icons/fa";
import "./Productolistproductcard.css";
import { Link, useNavigate } from "react-router-dom";

import {
  addToWishlist,
  removeFromWishlist,
} from "../../services/wishlistApiServices";
import { useDispatch, useSelector } from "react-redux";
import { updateUserWishList } from "../../redux/slices/userSlice";
import { useMemo } from "react";
import { getDiscountedPrice } from "../../utils/calculation";
import Fav from "../../icons/Fav";
import Heart from "../../icons/Heart";
import RatingBadge from "../../icons/RatingBadge";

export default function Productolistproductcard(Props) {
  const { product } = Props;
  const { user } = useSelector((state) => state.user);
  const selectedCountry = useSelector((state) => state.user.selectedCountry);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // function to add item in wishlist
  async function addPRoductToWishlist() {
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

  // function to remove item from wishlist
  async function removeProductFromWishlist() {
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

  const variants =
    product.filteredVariants?.length > 0
      ? product.filteredVariants
      : product.countryVariants?.[selectedCountry?._id] || [];

  const basePrice =
    variants.length > 0 ? Math.min(...variants.map((v) => Number(v.price))) : 0;
  const discountPercent = Number(product.productDiscount || 0);
  const discountedPrice = getDiscountedPrice(basePrice, discountPercent);

  // Check if product is bestseller (you can adjust this logic based on your data)
  const isBestseller = product?.isBestseller || product?.bestseller || false;

  return (
    <div className="product-list-card">
      <div className="image-wrapper">
        {isBestseller && <div className="bestseller-badge">Bestseller</div>}
        <Link to={`/${selectedCountry?.code}/product-inner/${product._id}`}>
          {product?.productImages && product.productImages.length > 0 && (
            <img
              src={`${import.meta.env.VITE_BASE_URL}/${product.productImages[0]?.path || product.productImages[0]}`}
              alt={product?.productName || "Product"}
              className="product-image"
            />
          )}
        </Link>
        <button
          className="wishlist-btn"
          type="button"
          aria-label="Toggle wishlist"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            isWishListed()
              ? removeProductFromWishlist()
              : addPRoductToWishlist();
          }}
        >
          {isWishListed() ? <Heart /> : <Fav />}
        </button>
      </div>

      <div className="product-details">
        <Link
          to={`/${selectedCountry?.code}/product-inner/${product._id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <h3 className="product-name">{product?.productName || ""}</h3>
        </Link>
        <div className="product-price-row">
          <div className="price-details">
            <p className="current-price">
              {selectedCountry?.priceLabel}
              {discountedPrice.toLocaleString(undefined, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </p>
            {discountPercent > 0 && (
              <p className="discount-tag">{discountPercent}% Off</p>
            )}
          </div>
          <div className="rating-badge">
            <RatingBadge />
            <span>{product?.productRating || "4.9"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
