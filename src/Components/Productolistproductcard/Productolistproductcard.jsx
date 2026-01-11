import Slider from "react-slick";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "./Productolistproductcard.css";
import { Link, useNavigate } from "react-router-dom";

import {
  addToWishlist,
  removeFromWishlist,
} from "../../services/wishlistApiServices";
import { useDispatch, useSelector } from "react-redux";
import { updateCart, updateUserWishList } from "../../redux/slices/userSlice";
import { addToCart } from "../../services/userApiServices";
import { useState, useEffect, useMemo } from "react";
import { getDiscountedPrice } from "../../utils/calculation";

export default function Productolistproductcard(Props) {
  const { product } = Props;
  const { user } = useSelector((state) => state.user);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const selectedCountry = useSelector((state) => state.user.selectedCountry);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("remilletteTkn");
    if (token) {
      setIsUserLoggedIn(true);
    }
  }, []);
  const userCart = useSelector((state) => state.user.user?.cart?.items);

  const settings = {
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  // function to add item in wishlist
  async function addPRoductToWishlist() {
    if (product._id && user.id) {
      const response = await addToWishlist(
        product?._id,
        user.id,
        selectedCountry._id
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
        selectedCountry._id
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
        typeof item.product === "string" ? item.product : item.product?._id
      )
    );
  }, [user?.wishlist]);

  function isWishListed() {
    return wishlistProductIds.has(product?._id);
  }

  // function to add the product to cart
  async function addProductToCart() {
    if (!isUserLoggedIn) {
      navigate("/login");
      return;
    }
    const response = await addToCart(product?._id, 1, selectedCountry._id);
    if (response) {
      dispatch(updateCart({ cart: response }));
    }
  }

  function isInCart() {
    return userCart?.some((item) => {
      const idInCart =
        typeof item.productId === "object"
          ? item.productId._id
          : item.productId;
      return idInCart === product._id;
    });
  }

  const variants =
    product.filteredVariants?.length > 0
      ? product.filteredVariants
      : product.countryVariants?.[selectedCountry._id] || [];

  if (variants.length === 0) return null;

  const basePrice = Math.min(...variants.map((v) => Number(v.price)));
  const discountPercent = Number(product.productDiscount || 0);
  const discountedPrice = getDiscountedPrice(basePrice, discountPercent);

  return (
    <div className="product-list-card">
      <div className="image-wrapper">
        <Link to={`/${selectedCountry.code}/product-inner/${product._id}`}>
          <Slider {...settings}>
            {product &&
              Object.keys(product).length > 0 &&
              product?.productImages.map((img, i) => (
                <img
                  key={i}
                  src={`${import.meta.env.VITE_BASE_URL}/${img.path || img}`}
                  alt={`product-${i}`}
                  className="product-image"
                />
              ))}
          </Slider>
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
          {isWishListed() ? <FaHeart color="red" /> : <FaRegHeart />}
        </button>
      </div>

      <div className="product-details">
        <p className="product-name">{product?.productName || ""}</p>
        <div className="product-price">
          <span className="price">
            {selectedCountry.priceLabel}
            {discountedPrice}
          </span>
          <span className="original-price">
            {selectedCountry.priceLabel}
            {basePrice}
          </span>
          <span className="discount">({discountPercent}% OFF)</span>
        </div>
        <div>
          {isInCart() ? (
            <button
              className="secondry-btn buy-now-btn"
              onClick={() => navigate(`/${selectedCountry.code}/checkout`)}
            >
              BUY NOW
            </button>
          ) : (
            <button className="secondry-btn" onClick={addProductToCart}>
              ADD TO CART
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
