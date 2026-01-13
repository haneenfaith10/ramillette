import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IoCloseCircleOutline, IoChevronDown, IoChevronUp } from "react-icons/io5";
import { MdLocalOffer } from "react-icons/md";
import "./Checkout.css";
import discountIcon from "../../assets/svg/discount.svg";
import {
  updateCartItemQuantity,
  removeCartItem,
  addToCartWithQuantity,
} from "../../services/userApiServices";
import { getCheckoutDetailsWithOffers } from "../../services/productApiServices";
import {
  updateCart,
  setCheckoutCart,
  setCheckoutNote,
  setCheckoutOffer,
  clearCheckoutOffers,
} from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { verifyCouponCode } from "../../services/offerApiService";

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const reduxCart = useSelector((state) => state.user.user?.cart?.items ?? []);
  const note = useSelector((state) => state.user.checkout.note);
  const token = localStorage.getItem("remilletteTkn");
  const [cartItems, setCartItems] = useState([]);
  const [selectedOffers, setSelectedOffers] = useState({});
  const [couponInputs, setCouponInputs] = useState({});
  const [selectedVariants, setSelectedVariants] = useState({});
  const [subtotal, setSubtotal] = useState(0);
  const [originalSubtotal, setOriginalSubtotal] = useState(0);
  const [newUserOffer, setNewUserOffer] = useState(null);
  const [finalTotal, setFinalTotal] = useState(0);
  const prevCartLengthRef = useRef(reduxCart?.length || 0);
  
  // Mobile-specific states
  const [showPriceDetails, setShowPriceDetails] = useState(false);
  const [expandedOffers, setExpandedOffers] = useState({});

  useEffect(() => {
    async function loadCheckoutData() {
      if (selectedCountry?._id) {
        const res = await getCheckoutDetailsWithOffers(
          selectedCountry._id,
          token
        );
        if (res?.isSuccess) {
          setCartItems(res.cartItems);
          setNewUserOffer(res.newUserOffer);
        }
      }
    }
    loadCheckoutData();
  }, [selectedCountry._id, token]);

  // Separate effect to reload when cart items are added/removed (not on quantity updates)
  useEffect(() => {
    const currentCartLength = reduxCart?.length || 0;
    if (prevCartLengthRef.current !== currentCartLength) {
      prevCartLengthRef.current = currentCartLength;
      async function reloadCheckoutData() {
        if (selectedCountry?._id) {
          const res = await getCheckoutDetailsWithOffers(
            selectedCountry._id,
            token
          );
          if (res?.isSuccess) {
            setCartItems(res.cartItems);
            setNewUserOffer(res.newUserOffer);
          }
        }
      }
      reloadCheckoutData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxCart?.length]);

  useEffect(() => {
    const initialVariants = {};
    cartItems.forEach((item) => {
      const variants = item.productVariants || [];
      if (variants.length > 0) {
        initialVariants[item.productId] =
          selectedVariants[item.productId] || variants[0];
      }
    });
    setSelectedVariants(initialVariants);
  }, [cartItems]);

  useEffect(() => {
    let originalTotal = 0;
    let discountedTotal = 0;

    cartItems.forEach((item) => {
      const variant = selectedVariants[item.productId];
      const basePrice = variant?.price || item.basePrice;
      const productDiscount = item.productDiscount || 0;
      const offer = selectedOffers[item.productId];

      // Calculate original total (without any discounts)
      originalTotal += basePrice * item.qty;

      // Calculate discounted price
      let finalPrice = basePrice;

      if (offer) {
        if (offer.offerType === "bogo") {
          finalPrice = basePrice - (offer.discountValue / 100) * basePrice;
        } else if (offer.discountType === "percent") {
          finalPrice = basePrice - (offer.discountValue / 100) * basePrice;
        } else if (offer.discountType === "flat") {
          finalPrice = Math.max(basePrice - offer.discountValue, 0);
        }
      } else if (productDiscount > 0) {
        // Product discount calculation: basePrice - (discount% / 100) * basePrice
        // Example: ₹150 with 20% discount = 150 - (20/100) * 150 = 150 - 30 = ₹120
        finalPrice = basePrice - (productDiscount / 100) * basePrice;
      }

      discountedTotal += finalPrice * item.qty;
    });

    setOriginalSubtotal(originalTotal);
    setSubtotal(discountedTotal);

    let totalAfterOffer = discountedTotal;

    // ⭐ APPLY NEW USER OFFER ON TOTAL
    if (newUserOffer) {
      const min = newUserOffer.minOrderValue || 0;
      const max = newUserOffer.maxOrderValue || Infinity;

      if (discountedTotal >= min && discountedTotal <= max) {
        if (newUserOffer.discountType === "percent") {
          totalAfterOffer = discountedTotal - (newUserOffer.discountValue / 100) * discountedTotal;
        } else if (newUserOffer.discountType === "flat") {
          totalAfterOffer = Math.max(discountedTotal - newUserOffer.discountValue, 0);
        }
      }
    }

    setFinalTotal(totalAfterOffer);
  }, [cartItems, selectedOffers, selectedVariants, newUserOffer]);

  async function handleQuantityChange(cartItem, action) {
    try {
      const res = await updateCartItemQuantity(
        cartItem.productId,
        action,
        selectedCountry._id
      );
      if (res?.cart) {
        dispatch(updateCart({ cart: res.cart }));

        // Reload checkout data to get updated quantities and offers
        const checkoutRes = await getCheckoutDetailsWithOffers(
          selectedCountry._id,
          token
        );
        if (checkoutRes?.isSuccess) {
          setCartItems(checkoutRes.cartItems);
          setNewUserOffer(checkoutRes.newUserOffer);

          // Validate offers after quantity change
          const updatedCartItems = checkoutRes.cartItems.map((c) => ({
            ...c,
            productId: c.productId?._id || c.productId,
          }));
          validateSelectedOffers(updatedCartItems, selectedVariants);
        }
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  }

  function validateSelectedOffers(updatedCartItems, updatedVariants) {
    const newSelectedOffers = { ...selectedOffers };

    updatedCartItems.forEach((item) => {
      const variant = updatedVariants[item.productId];
      const price = variant?.price || item.basePrice;
      const qty = item.qty;
      const total = price * qty;

      const offer = newSelectedOffers[item.productId];
      if (!offer) return;

      // ⭐ 1. Handle BOGO
      // if (offer.offerType === "bogo") {
      //   if (!offer.buyQuantity || qty < offer.buyQuantity) {
      //     // ❌ Quantity no longer satisfies BOGO requirement → remove offer
      //     delete newSelectedOffers[item.productId];
      //     dispatch(
      //       setCheckoutOffer({ productId: item.productId, offer: null })
      //     );
      //   }
      //   return; // stop here, do NOT check min/max
      // }
      if (offer.offerType === "bogo") {
        if (!offer.buyQuantity || qty < offer.buyQuantity) {
          delete newSelectedOffers[item.productId];
          dispatch(
            setCheckoutOffer({ productId: item.productId, offer: null })
          );
        }
        return;
      }

      // ⭐ 2. Handle normal discount/coupon/common/category
      const min = offer.minOrderValue || 0;
      const max = offer.maxOrderValue || Infinity;

      if (total < min || total > max) {
        delete newSelectedOffers[item.productId];
        dispatch(setCheckoutOffer({ productId: item.productId, offer: null }));
      }
    });

    setSelectedOffers(newSelectedOffers);
  }

  async function handleRemove(productId) {
    try {
      const res = await removeCartItem(
        productId,
        selectedCountry._id,
        false,
        token
      );
      if (res?.cart) dispatch(updateCart({ cart: res.cart }));
    } catch (err) {
      console.error("Error removing item:", err);
    }
  }

  async function handleVariantSelect(productId, variant) {
    try {
      setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
      const response = await addToCartWithQuantity(
        productId,
        1,
        selectedCountry._id,
        false
      );
      if (response) dispatch(updateCart({ cart: response.cart }));
    } catch (err) {
      console.error("Error selecting variant:", err);
    }
  }

  function handleSelectOffer(productId, offer) {
    // Check if this offer is already selected
    const isCurrentlySelected = selectedOffers[productId]?.offerId === offer.offerId;

    if (isCurrentlySelected) {
      // Deselect the offer
      setSelectedOffers((prev) => {
        const newOffers = { ...prev };
        delete newOffers[productId];
        return newOffers;
      });

      //  Sync with Redux checkout cart - remove offer
      dispatch(setCheckoutOffer({ productId, offer: null }));
    } else {
      // Select the offer
      const updatedOffer = {
        ...offer,
        appliedAt: new Date().toISOString(),
      };

      setSelectedOffers((prev) => ({ ...prev, [productId]: updatedOffer }));

      //  Sync with Redux checkout cart
      dispatch(setCheckoutOffer({ productId, offer: updatedOffer }));
    }
  }

  // Apply Coupon Code
  async function handleApplyCoupon(productId, offer) {
    const code = couponInputs[productId];
    if (!code) return alert("Please enter a coupon code");

    try {
      const res = await verifyCouponCode(
        productId,
        code,
        selectedCountry._id,
        token
      );

      if (res?.isSuccess) {
        alert(" Coupon applied successfully!");

        const updatedOffer = {
          ...offer,
          verified: true,
          couponCode: code,
          discountType: res.discountType,
          discountValue: res.discountValue,
          appliedAt: new Date().toISOString(),
        };

        setSelectedOffers((prev) => ({
          ...prev,
          [productId]: updatedOffer,
        }));

        //  Sync with Redux checkout cart
        dispatch(setCheckoutOffer({ productId, offer: updatedOffer }));
      } else {
        alert(`❌ ${res?.message || "Invalid or expired coupon code"}`);
      }
    } catch (err) {
      console.error("Error verifying coupon:", err);
      alert("Something went wrong while verifying the coupon.");
    }
  }

  useEffect(() => {
    dispatch(clearCheckoutOffers());
  }, []);

  function getValidOffers(item) {
    const variant = selectedVariants[item.productId];
    const price = variant?.price || item.basePrice;
    const qty = item.qty;
    const total = price * qty;

    return item.offers.filter((offer) => {
      const min = offer.minOrderValue || 0;
      const max = offer.maxOrderValue || Infinity;

      // ---------- 🔥 HANDLE BOGO OFFER ----------
      if (offer.offerType === "bogo") {
        // User must buy at least "buyQuantity"
        if (!offer.buyQuantity || offer.buyQuantity <= 0) return false;
        if (qty < offer.buyQuantity) return false;
        return true;
      }

      // ---------- 💥 DISCOUNT / COUPON OFFERS ----------
      return total >= min && total <= max;
    });
  }

  //  Proceed to address
  function handleProceedToAddress() {
    if (cartItems.length > 0) {
      const cartWithOffers = cartItems.map((item) => {
        const variant = selectedVariants[item.productId];
        const basePrice = variant?.price || item.basePrice;
        const productDiscount = item.productDiscount || 0;
        const offer = selectedOffers[item.productId];

        let discountedPrice = basePrice;

        // ✅ Apply offer discount first (highest priority)
        if (offer) {
          if (offer.discountType === "percent") {
            discountedPrice =
              basePrice - (offer.discountValue / 100) * basePrice;
          } else if (offer.discountType === "flat") {
            discountedPrice = Math.max(basePrice - offer.discountValue, 0);
          }
        }
        // ✅ Otherwise apply product-level discount
        else if (productDiscount > 0) {
          discountedPrice = basePrice - (productDiscount / 100) * basePrice;
        }

        return {
          ...item,
          selectedVariant: variant || null,
          selectedOffer: offer || null,
          discountedPrice,
        };
      });

      // ✅ Update Redux with computed prices
      // dispatch(setCheckoutCart(cartWithOffers));
      dispatch(
        setCheckoutCart({
          items: cartWithOffers,
          subtotal,
          finalTotal,
          newUserOffer,
        })
      );
    }

    dispatch(setCheckoutNote(note));

    navigate(`/${selectedCountry.code}/checkout/address`);
  }

  return (
    <div className="checkout-cart-content">
      {/* 🔥 MOBILE VERSION - Only visible on mobile */}
      <div className="mobile-checkout-wrapper">
        <div className="container">
        {/* Sticky Price Summary */}
        <div className="checkout-sticky-summary">
          <button
            className="summary-toggle"
            onClick={() => setShowPriceDetails(!showPriceDetails)}
            type="button"
          >
            <div className="summary-header-content">
              <span className="summary-label">Order Total</span>
              <span className="summary-amount">
                {selectedCountry.priceLabel}{finalTotal.toFixed(2)}
              </span>
            </div>
            {showPriceDetails ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
          </button>

          {showPriceDetails && (
            <div className="price-details-dropdown">
              <div className="price-row">
                <span>Subtotal</span>
                <span>{selectedCountry.priceLabel}{originalSubtotal.toFixed(2)}</span>
              </div>

              {originalSubtotal > finalTotal && (
                <div className="price-row discount-row">
                  <span>Discount</span>
                  <span className="discount-amount">
                    -{selectedCountry.priceLabel}{(originalSubtotal - finalTotal).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="price-divider"></div>

              <div className="price-row total-row">
                <span>Total</span>
                <span>{selectedCountry.priceLabel}{finalTotal.toFixed(2)}</span>
              </div>

              {originalSubtotal > finalTotal && (
                <div className="savings-badge">
                  <img src={discountIcon} alt="discount" className="savings-icon" />
                  <span>You're saving {selectedCountry.priceLabel}{(originalSubtotal - finalTotal).toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Items - Mobile */}
        <div className="checkout-cart-items-wrapper">
          {cartItems.length > 0 ? (
            cartItems.map((item) => {
              const variants = item.productVariants || [];
              const selectedVariant = selectedVariants[item.productId];
              const basePrice = selectedVariant?.price || item.basePrice;
              const productDiscount = item.productDiscount || 0;
              const offer = selectedOffers[item.productId];

              let discountedPrice = basePrice;

              if (offer) {
                if (offer.discountType === "percent") {
                  discountedPrice = basePrice - (offer.discountValue / 100) * basePrice;
                } else if (offer.discountType === "flat") {
                  discountedPrice = Math.max(basePrice - offer.discountValue, 0);
                }
              } else if (productDiscount > 0) {
                discountedPrice = basePrice - (productDiscount / 100) * basePrice;
              }

              const totalPrice = discountedPrice * item.qty;
              const validOffers = getValidOffers(item);
              const hasOffers = validOffers.length > 0;

              return (
                <div className="checkout-cart-item-card" key={item.productId}>
                  <div className="cart-item-main">
                    <img
                      src={`${import.meta.env.VITE_BASE_URL}/${item.productImages?.[0]?.path}`}
                      alt={item.productName}
                      className="cart-item-image"
                    />

                    <div className="cart-item-details">
                      <h3 className="cart-item-title">{item.productName}</h3>
                      <p className="cart-item-description">{item.productDescription}</p>

                      {variants.length > 0 && (
                        <div className="variant-selector">
                          {variants.map((variant, idx) => (
                            <button
                              key={idx}
                              className={`variant-chip ${
                                selectedVariant?._id === variant._id ? "active" : ""
                              }`}
                              onClick={() => handleVariantSelect(item.productId, variant)}
                              type="button"
                            >
                              {variant.variantName}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="cart-item-price-section">
                        <span className="current-price">
                          {selectedCountry.priceLabel}{totalPrice.toFixed(2)}
                        </span>

                        {(productDiscount > 0 || offer) && (
                          <span className="original-price-mobile">
                            {selectedCountry.priceLabel}{(basePrice * item.qty).toFixed(2)}
                          </span>
                        )}
                      </div>

                      {offer ? (
                        <div className="discount-badge-mobile">
                          <span>
                            {offer.offerType === "bogo" ? `BOGO: Buy ${offer.buyQuantity} Get ${offer.getQuantity > 0 ? `${offer.getQuantity} Free` : `${offer.discountValue}%`}` : 
                             offer.offerType === "coupon" ? `Coupon: ${offer.discountType === "percent" ? `${offer.discountValue}% OFF` : `${selectedCountry.priceLabel}${offer.discountValue} OFF`}` : 
                             `Offer: ${offer.discountType === "percent" ? `${offer.discountValue}% OFF` : `${selectedCountry.priceLabel}${offer.discountValue} OFF`}`}
                          </span>
                        </div>
                      ) : productDiscount > 0 ? (
                        <div className="discount-badge-mobile">
                          <span>{productDiscount}% OFF</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <div className="quantity-control-mobile">
                      <button
                        onClick={() => handleQuantityChange(item, "decrement")}
                        className="qty-btn"
                        type="button"
                      >
                        -
                      </button>
                      <span className="qty-display">{item.qty}</span>
                      <button
                        onClick={() => handleQuantityChange(item, "increment")}
                        className="qty-btn"
                        type="button"
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove-btn-mobile"
                      onClick={() => handleRemove(item.productId)}
                      type="button"
                    >
                      <IoCloseCircleOutline size={18} />
                      Remove
                    </button>
                  </div>

                  {hasOffers && (
                    <div className="offers-section-mobile">
                      <button
                        className="offers-toggle-btn"
                        onClick={() =>
                          setExpandedOffers((prev) => ({
                            ...prev,
                            [item.productId]: !prev[item.productId],
                          }))
                        }
                        type="button"
                      >
                        <MdLocalOffer size={18} />
                        <span>{validOffers.length} Offer{validOffers.length > 1 ? 's' : ''} Available</span>
                        {expandedOffers[item.productId] ? <IoChevronUp size={18} /> : <IoChevronDown size={18} />}
                      </button>

                      {expandedOffers[item.productId] && (
                        <div className="offers-list-mobile">
                          {validOffers.map((offer) => (
                            <div key={offer.offerId} className="offer-card-mobile">
                              <div className="offer-card-header">
                                <h5>{offer.title}</h5>
                                <span className={`offer-badge ${offer.offerType}`}>
                                  {offer.offerType.toUpperCase()}
                                </span>
                              </div>

                              <p className="offer-description-mobile">{offer.description}</p>

                              {offer.discountType && offer.discountValue && (
                                <p className="offer-discount-value">
                                  {offer.discountType === "percent"
                                    ? `${offer.discountValue}% OFF`
                                    : `${selectedCountry.priceLabel}${offer.discountValue} OFF`}
                                </p>
                              )}

                              {offer.offerType === "bogo" ? (
                                <p className="offer-min-order">
                                  Buy {offer.buyQuantity} Get {offer.getQuantity > 0 ? `${offer.getQuantity} Free` : `${offer.discountValue}% OFF`}
                                  {offer.getProductId && (
                                    <span
                                      className="offer-product-link"
                                      onClick={() =>
                                        navigate(
                                          `/${selectedCountry.code}/product-inner/${offer.getProductId._id}`
                                        )
                                      }
                                    >
                                      {offer.getProductId.productName}
                                    </span>
                                  )}
                                </p>
                              ) : (
                                <p className="offer-min-order">
                                  Min: {selectedCountry.priceLabel}{offer.minOrderValue}
                                  {offer.maxOrderValue && ` | Max: ${selectedCountry.priceLabel}${offer.maxOrderValue}`}
                                </p>
                              )}

                              {offer.offerType === "coupon" ? (
                                <div className="coupon-input-mobile">
                                  <input
                                    type="text"
                                    placeholder="Enter code"
                                    value={couponInputs[item.productId] || ""}
                                    onChange={(e) =>
                                      setCouponInputs((prev) => ({
                                        ...prev,
                                        [item.productId]: e.target.value,
                                      }))
                                    }
                                    disabled={selectedOffers[item.productId]?.offerId === offer.offerId}
                                  />

                                  {selectedOffers[item.productId]?.offerId === offer.offerId &&
                                  selectedOffers[item.productId]?.verified ? (
                                    <button
                                      onClick={() => {
                                        setSelectedOffers((prev) => {
                                          const newOffers = { ...prev };
                                          delete newOffers[item.productId];
                                          return newOffers;
                                        });
                                        dispatch(setCheckoutOffer({ productId: item.productId, offer: null }));
                                        setCouponInputs((prev) => {
                                          const newInputs = { ...prev };
                                          delete newInputs[item.productId];
                                          return newInputs;
                                        });
                                      }}
                                      className="offer-btn-mobile applied"
                                      type="button"
                                    >
                                      Remove
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleApplyCoupon(item.productId, offer)}
                                      className="offer-btn-mobile"
                                      type="button"
                                    >
                                      Apply
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleSelectOffer(item.productId, offer)}
                                  className={
                                    selectedOffers[item.productId]?.offerId === offer.offerId
                                      ? "offer-btn-mobile applied"
                                      : "offer-btn-mobile"
                                  }
                                  type="button"
                                >
                                  {selectedOffers[item.productId]?.offerId === offer.offerId
                                    ? "✓ Applied"
                                    : "Apply Offer"}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="checkout-cart-empty">
              <p>Your cart is empty</p>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="checkout-footer-section">
            {/* Price Details at Bottom */}
            <div className="price-details-bottom-mobile">
              <div className="price-row">
                <span>Subtotal</span>
                <span>{selectedCountry.priceLabel}{originalSubtotal.toFixed(2)}</span>
              </div>

              {originalSubtotal > finalTotal && (
                <div className="price-row discount-row">
                  <span>Discount</span>
                  <span className="discount-amount">
                    -{selectedCountry.priceLabel}{(originalSubtotal - finalTotal).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="price-divider"></div>

              <div className="price-row total-row">
                <span>Total</span>
                <span>{selectedCountry.priceLabel}{finalTotal.toFixed(2)}</span>
              </div>

              {originalSubtotal > finalTotal && (
                <div className="savings-badge">
                  <img src={discountIcon} alt="discount" className="savings-icon" />
                  <span>You're saving {selectedCountry.priceLabel}{(originalSubtotal - finalTotal).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="note-section-mobile">
              <label htmlFor="checkout-note">Add a note (optional)</label>
              <textarea
                id="checkout-note"
                value={note || ""}
                onChange={(e) => dispatch(setCheckoutNote(e.target.value))}
                placeholder="Special instructions, delivery notes..."
                rows={3}
              />
            </div>

            <button
              className="checkout-btn-mobile"
              onClick={handleProceedToAddress}
              disabled={cartItems.length === 0}
              type="button"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
        </div>
      </div>

      {/* 💻 DESKTOP VERSION - Only visible on desktop (992px+) */}
      <div className="desktop-checkout-wrapper">
        <div className="container">
          <div className="checkout-cart-items-container">
      {cartItems.length > 0 ? (
        cartItems.map((item) => {
          const variants = item.productVariants || [];
          const selectedVariant = selectedVariants[item.productId];
          const basePrice = selectedVariant?.price || item.basePrice;
          const productDiscount = item.productDiscount || 0;
          const offer = selectedOffers[item.productId];

          //  Calculate the final effective price
          let discountedPrice = basePrice;

          //  Offer overrides product discount
          if (offer) {
            if (offer.discountType === "percent") {
              discountedPrice =
                basePrice - (offer.discountValue / 100) * basePrice;
            } else if (offer.discountType === "flat") {
              discountedPrice = Math.max(basePrice - offer.discountValue, 0);
            }
          } else if (productDiscount > 0) {
            discountedPrice = basePrice - (productDiscount / 100) * basePrice;
          }

          const totalPrice = discountedPrice * item.qty;
          return (
            <div className="checkout-cart-inner" key={item.productId}>
              <div className="checkout-cart-item">
                {/* Top Row: Image + Details + Quantity */}
                <div className="checkout-cart-item-top-row">
                  <img
                    src={`${import.meta.env.VITE_BASE_URL}/${
                      item.productImages?.[0]?.path
                    }`}
                    alt={item.productName}
                  />
                  <div className="checkout-cart-item-details">
                    <p className="product-title">{item.productName}</p>
                    <p>{item.productDescription}</p>

                    {/*  Variant selection */}
                    {variants.length > 0 && (
                      <div className="variant-selection">
                        <p>Select Variant:</p>
                        <ul className="variant-list">
                          {variants.map((variant, idx) => (
                            <li
                              key={idx}
                              className={`variant-item ${
                                selectedVariant?._id === variant._id
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                handleVariantSelect(item.productId, variant)
                              }
                            >
                              <strong>{variant.variantName}</strong> —{" "}
                              {selectedCountry.priceLabel}
                              {variant.price.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="price-section">
                      <p className="total-price-checkout">
                        Price: {selectedCountry.priceLabel}
                        {totalPrice.toFixed(2)}
                      </p>

                      {/* Show old (original) price only if discounted */}
                      {(productDiscount > 0 || offer) && (
                        <p className="original-price">
                          <strike>
                            {selectedCountry.priceLabel}
                            {(basePrice * item.qty).toFixed(2)}
                          </strike>
                        </p>
                      )}

                      {/* Optional: Show applied discount label */}
                      {offer ? (
                        <p className="discount-label">
                          {offer.offerType === "bogo" ? (
                            <>
                              <strong>BOGO Applied:</strong> Buy{" "}
                              {offer.buyQuantity} Get{" "}
                              {offer.getQuantity && offer.getQuantity > 0
                                ? `${offer.getQuantity} Free`
                                : `${offer.discountValue}%`}
                            </>
                          ) : offer.offerType === "coupon" ? (
                            <>
                              <strong>Coupon Applied:</strong>{" "}
                              {offer.discountType === "percent"
                                ? `${offer.discountValue}% OFF`
                                : `${selectedCountry.priceLabel}${offer.discountValue} OFF`}{" "}
                              (Code: {offer.couponCode})
                            </>
                          ) : (
                            <>
                              <strong>Offer Applied:</strong>{" "}
                              {offer.discountType === "percent"
                                ? `${offer.discountValue}% OFF`
                                : `${selectedCountry.priceLabel}${offer.discountValue} OFF`}
                            </>
                          )}
                        </p>
                      ) : productDiscount > 0 ? (
                        <p className="discount-label">
                          Product Discount: {productDiscount}% OFF
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/*  Quantity Section */}
                  <div className="checkout-quantity-section">
                    <p>Quantity</p>
                    <div className="checkout-quantity-input-wrapper">
                      <button
                        onClick={() => handleQuantityChange(item, "decrement")}
                      >
                        -
                      </button>
                      <input type="number" readOnly value={item.qty} />
                      <button
                        onClick={() => handleQuantityChange(item, "increment")}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemove(item.productId)}
                    >
                      <IoCloseCircleOutline size={18} /> remove
                    </button>
                  </div>
                </div>

                {/*  Offers Section - Full width at bottom */}
                {getValidOffers(item).length > 0 && (
                  <div className="checkout-offers-section">
                      <h4 className="offers-heading">Available Offers</h4>
                      <div className="offers-container">
                        {getValidOffers(item).map((offer) => (
                          <div key={offer.offerId} className="offer-card">
                            <div className="offer-header">
                              <h5 className="offer-title">{offer.title}</h5>
                              <span className={`offer-type ${offer.offerType}`}>
                                {offer && offer?.offerType.toUpperCase()}
                              </span>
                            </div>

                            <p className="offer-description">
                              {offer.description}
                            </p>

                            {/*  Show Discount Value */}
                            {offer.discountType && offer.discountValue && (
                              <p className="discount-info">
                                Discount:{" "}
                                {offer.discountType === "percent"
                                  ? `${offer.discountValue}% OFF`
                                  : `${selectedCountry.priceLabel}${offer.discountValue} OFF`}
                              </p>
                            )}

                            {/*  Show Min/Max Order Values */}
                            {offer?.offerType === "bogo" ? (
                              <p className="min-order">
                                {offer.buyQuantity} Get{" "}
                                {offer.getQuantity && offer.getQuantity > 0
                                  ? `${offer.getQuantity} Free`
                                  : `${offer.discountValue}% OFF`}
                                <p
                                  style={{
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    navigate(
                                      `/${selectedCountry.code}/product-inner/${offer.getProductId._id}`
                                    )
                                  }
                                >
                                  {offer?.getProductId?.productName}
                                </p>
                              </p>
                            ) : (
                              <p className="min-order">
                                Min Order: {selectedCountry.priceLabel}
                                {offer.minOrderValue}
                                {offer.maxOrderValue
                                  ? ` | Max: ${selectedCountry.priceLabel}${offer.maxOrderValue}`
                                  : ""}
                              </p>
                            )}

                            {/*  Coupon / Normal Offer Buttons */}
                            {offer.offerType === "coupon" ? (
                              <div className="coupon-input-wrapper">
                                <input
                                  type="text"
                                  placeholder="Enter coupon code"
                                  value={couponInputs[item.productId] || ""}
                                  onChange={(e) =>
                                    setCouponInputs((prev) => ({
                                      ...prev,
                                      [item.productId]: e.target.value,
                                    }))
                                  }
                                  disabled={
                                    selectedOffers[item.productId]?.offerId ===
                                    offer.offerId
                                  }
                                />

                                {selectedOffers[item.productId]?.offerId ===
                                  offer.offerId &&
                                selectedOffers[item.productId]?.verified ? (
                                  <button
                                    onClick={() => {
                                      // Deselect the coupon
                                      setSelectedOffers((prev) => {
                                        const newOffers = { ...prev };
                                        delete newOffers[item.productId];
                                        return newOffers;
                                      });
                                      dispatch(setCheckoutOffer({ productId: item.productId, offer: null }));
                                      // Clear coupon input
                                      setCouponInputs((prev) => {
                                        const newInputs = { ...prev };
                                        delete newInputs[item.productId];
                                        return newInputs;
                                      });
                                    }}
                                    className="offer-select-btn selected"
                                  >
                                    Deselect
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleApplyCoupon(item.productId, offer)
                                    }
                                    className="offer-select-btn"
                                  >
                                    Apply Coupon
                                  </button>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  handleSelectOffer(item.productId, offer)
                                }
                                className={
                                  selectedOffers[item.productId]?.offerId ===
                                  offer.offerId
                                    ? "offer-select-btn selected"
                                    : "offer-select-btn"
                                }
                              >
                                {selectedOffers[item.productId]?.offerId ===
                                offer.offerId
                                  ? "Deselect"
                                  : "Apply Offer"}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="checkout-cart-empty">
          <p>No cart items available</p>
        </div>
      )}
          </div>

          {/*  Subtotal & Note Section */}
          <div className="checkout-cart-summary">
        <div className="checkout-price-details-card">
          <div className="checkout-price-details-section">
            <div className="price-details-header">
              <h3>Price details</h3>
            </div>
            
            <div className="price-details-list">
              <div className="price-detail-item">
                <span>Subtotal</span>
                <span>
                  {selectedCountry.priceLabel}
                  {originalSubtotal.toFixed(2)}
                </span>
              </div>
              
              {originalSubtotal > finalTotal && (
                <div className="price-detail-item">
                  <span>Discount</span>
                  <span className="discount-amount">
                    -{selectedCountry.priceLabel}
                    {(originalSubtotal - finalTotal).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="price-details-divider"></div>
            
            <div className="price-detail-total">
              <span>Grand Total</span>
              <span>
                {selectedCountry.priceLabel}
                {finalTotal.toFixed(2)}
              </span>
            </div>
            
            {originalSubtotal > finalTotal && (
              <div className="savings-message">
                <img 
                  src={discountIcon} 
                  alt="discount" 
                  className="discount-icon"
                />
                <span>
                  <strong>{selectedCountry.priceLabel}{(originalSubtotal - finalTotal).toFixed(2)}</strong> saved so far on this order
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="checkout-cart-note-section">
          <div className="checkout-cart-note">
            <p>Note</p>
            <p>Additional Note</p>
          </div>

          <textarea
            name="note"
            id="note"
            value={note || ""}
            onChange={(e) => dispatch(setCheckoutNote(e.target.value))}
          />

          {cartItems.length > 0 && (
            <button
              onClick={handleProceedToAddress}
              disabled={cartItems.length === 0}
            >
              Proceed to Checkout
            </button>
          )}
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}
