// import { useEffect, useState } from "react";
import "./WishlistSection.css";
import { FaTrashAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
// import { getUserWishlistDetails } from "../../services/userApiServices";
import EmptyData from "../../assets/svg/empty-data.svg";
import {
  getUserWishlistData,
  removeFromWishlist,
} from "../../services/wishlistApiServices";
import { updateUserWishList } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function WishlistSection() {
  const user = useSelector((state) => state.user.user);
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const dispatch = useDispatch();
  // const userWishlist = useSelector((state) => state.user.user.wishlist);
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);

  // function to calculate the actual price
  function getDiscountedPrice(amount, discountPercent) {
    const discountAmount = (discountPercent / 100) * amount;
    const finalPrice = amount - discountAmount;
    return finalPrice;
  }

  // function to remove the product from wishlist
  async function removeProductFromWishlist(product) {
    if (product._id && user.id && selectedCountry._id) {
      const response = await removeFromWishlist(
        product._id,
        user.id,
        selectedCountry._id
      );
      if (response) {
        dispatch(updateUserWishList({ user: response?.wishlist?.products }));
        setWishlist(response?.wishlist?.products);
      }
    }
  }

  useEffect(() => {
    (async () => {
      const wishlistData = await getUserWishlistData(
        user.id,
        selectedCountry._id
      );
      const filteredProducts = wishlistData.filter((item) => {
        return item.product.status;
      });
      setWishlist(filteredProducts);
    })();
  }, [user.id]);

  return (
    <div className="wishlist-section" id="wishlist-section">
      <h3 className="wishlist-section-header">My Wishlist</h3>
      {wishlist.length > 0 ? (
        <div className="wishlist-grid">
          {wishlist.map((product, index) => (
            <div className="wishlist-item" key={index}>
              <div className="wishlist-left">
                {product.product &&
                  product.product.productImages &&
                  Array.isArray(product.product.productImages) &&
                  product.product.productImages.length > 0 && (
                    <img
                      src={`${import.meta.env.VITE_BASE_URL}/${
                        product.product.productImages[0].path
                      }`}
                      alt={product.product.productName}
                      className="wishlist-img"
                      onClick={() =>
                        navigate(
                          `/${selectedCountry.code}/product-inner/${product.product._id}`
                        )
                      }
                    />
                  )}

                <div className="wishlist-details">
                  <h4
                    onClick={() =>
                      navigate(
                        `/${selectedCountry.code}/product-inner/${product.product._id}`
                      )
                    }
                  >
                    {product.product.productName}
                  </h4>
                  <p>
                    {product.product.productDescription
                      ? product.product.productDescription.length > 150
                        ? `${product.product.productDescription.slice(0, 150)}...`
                        : product.product.productDescription
                      : "No description available"}
                  </p>
                  <div className="wishlist-product-price-wrapper">
                    <p className="wishlist-discount-price">
                      {selectedCountry.priceLabel}
                      {(() => {
                        const variantList =
                          product.product.countryVariants?.[
                            selectedCountry._id
                          ] || [];
                        const basePrice =
                          variantList.length > 0 ? variantList[0].price : 0;
                        const finalPrice = getDiscountedPrice(
                          basePrice,
                          product.product.productDiscount
                        );
                        return finalPrice.toFixed(2);
                      })()}
                    </p>
                  </div>
                </div>
              </div>
              <button
                className="remove-btn"
                onClick={() => removeProductFromWishlist(product.product)}
              >
                <FaTrashAlt />
                <span>Remove from Wishlist</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="wishlist-empty-data-wrapper">
          <img src={EmptyData} alt="empty data" />
          <p>Your wishlist is empty</p>
          <p style={{ fontSize: "14px", marginTop: "8px", fontWeight: "400" }}>
            Start adding products you love!
          </p>
        </div>
      )}
    </div>
  );
}
