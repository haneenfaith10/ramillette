import { useState, useEffect, useMemo } from "react";
import "./ProductInner.css";
import star from "../../assets/images/star.png";
import {
  addToCartWithQuantity,
  updateCartItemQuantity,
} from "../../services/userApiServices";
import { useDispatch, useSelector } from "react-redux";
import { updateCart, updateUserWishList } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import Rating from "@mui/material/Rating";
import { useFormik } from "formik";
import { postRating } from "../../services/ratingApiServices";
import * as Yup from "yup";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa6";
import { IoShareOutline } from "react-icons/io5";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../services/wishlistApiServices";

// Accordion component
const Accordion = ({ title, children, defaultOpen = false, isOpen, onToggle, id }) => {
  const handleToggle = () => {
    if (onToggle) {
      onToggle(id);
    }
  };

  const openState = isOpen !== undefined ? isOpen : defaultOpen;

  return (
    <div className={`accordion ${openState ? "open" : ""}`}>
      <div className="accordion-header" onClick={handleToggle}>
        <h4>{title}</h4>
        <span className="accordion-icon">{openState ? "−" : "+"}</span>
      </div>
      {openState && (
        <div className="accordion-body">
          {typeof children === "function"
            ? children(() => {
                if (onToggle) onToggle(null);
              })
            : children}
        </div>
      )}
    </div>
  );
};

export default function ProductInner(Props) {
  const { product = {}, setChanged = () => {}, reviews } = Props;
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.user?.user?.cart);
  const cartItems = useMemo(() => {
    return cart?.items || [];
  }, [cart]);
  const [quantity, setQuantity] = useState(0);
  const [readMore, setReadMore] = useState(false);
  const [openAccordion, setOpenAccordion] = useState("KEY BENEFITS"); // Default open accordion
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const token = localStorage.getItem("remilletteTkn");
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [validOffers, setValidOffers] = useState();

  useEffect(() => {
    const filterValidOffers = () => {
      const now = new Date();

      if (!product?.specialOffers) return;

      const validOffers = product.specialOffers.filter((offer) => {
        const validFrom = offer.validFrom ? new Date(offer.validFrom) : null;
        const validTo = offer.validTo ? new Date(offer.validTo) : null;

        return (
          offer.isActive &&
          (!validFrom || now >= validFrom) &&
          (!validTo || now <= validTo)
        );
      });
      setValidOffers(validOffers);
    };

    filterValidOffers();
  }, [product]);

  const bestOffer = useMemo(() => {
    if (!validOffers || validOffers.length === 0) return null;

    return validOffers.reduce((best, current) => {
      const bestValue =
        current.discountType === "percent"
          ? (current.discountValue / 100) * product.productPrice
          : current.discountValue;

      const currentBest =
        best?.discountType === "percent"
          ? (best.discountValue / 100) * product.productPrice
          : best?.discountValue || 0;

      return bestValue > currentBest ? current : best;
    }, null);
  }, [validOffers, product.productPrice]);

  useEffect(() => {
    if (cartItems.length > 0) {
      cartItems.forEach((item) => {
        if (product._id === item?.productId._id) {
          setQuantity(item.qty);
        }
      });
    }
  }, [cartItems, product._id]);

  // toggle to show and hide the complete description
  const toggleShowFull = () => setReadMore((prev) => !prev);

  // Handle accordion toggle - only one open at a time
  const handleAccordionToggle = (accordionId) => {
    setOpenAccordion((prev) => (prev === accordionId ? null : accordionId));
  };

  // function to add product in the cart
  async function addProductToCart() {
    if (!token) {
      navigate(`/login`);
    } else {
      const response = await addToCartWithQuantity(
        product?._id,
        1,
        selectedCountry._id,
        false
      );
      if (response) {
        dispatch(updateCart({ cart: response }));
      }
    }
  }

  // function to calculate the actual price
  function getDiscountedPrice(amount, discountPercent) {
    const discountAmount = (discountPercent / 100) * amount;
    const finalPrice = amount - discountAmount;
    return finalPrice;
  }

  const reviewValidationSchema = Yup.object().shape({
    content: Yup.string()
      .trim()
      .min(5, "Review must be at least 5 characters.")
      .max(1000, "Review can't be more than 1000 characters.")
      .required("Review content is required."),
    rating: Yup.number()
      .required("Rating is required.")
      .min(1, "Rating must be at least 1.")
      .max(5, "Rating can't be more than 5."),
  });

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setFieldValue,
    isSubmitting,
    touched,
  } = useFormik({
    initialValues: {
      content: "",
      rating: "",
    },
    validationSchema: reviewValidationSchema,
    onSubmit: (values, { setSubmitting, resetForm }) => {
      postRating(
        product._id,
        values,
        selectedCountry._id,
        setSubmitting,
        resetForm,
        setChanged
      );
    },
  });

  // function to decide the products are in wishlist or not
  function isWishListed() {
    return user?.wishlist?.some((item) => {
      return item.product._id === product._id;
    });
  }

  const isInCart =
    user?.cart?.items.length > 0
      ? user.cart.items.some((item) => item.productId._id === product._id)
      : false;

  // function to increment cart item quantity
  async function updateCartQuantity(productId, action, countryId) {
    const response = await updateCartItemQuantity(productId, action, countryId);
    if (response) {
      dispatch(updateCart({ cart: response?.cart }));
    }
  }

  // function to add product in the wishlist
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

  const galleryImages = product?.productImages || [];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Calculate average rating from reviews or use productRating
  const averageRating = useMemo(() => {
    if (reviews && reviews.length > 0) {
      const sum = reviews.reduce(
        (acc, review) => acc + (review.rating || 0),
        0
      );
      return parseFloat((sum / reviews.length).toFixed(1));
    }
    // Use productRating if available, otherwise default to 0
    const productRating = product?.productRating;
    if (
      productRating !== null &&
      productRating !== undefined &&
      productRating !== ""
    ) {
      return parseFloat(productRating) || 0;
    }
    return 0;
  }, [reviews, product?.productRating]);

  const ratingCount = reviews && reviews.length ? reviews.length : 0;

  // Calculate unit price and total price based on quantity
  const unitPrice = useMemo(() => {
    const basePrice = product?.productPrice || 0;
    const discount = product?.productDiscount || 0;
    return getDiscountedPrice(basePrice, discount);
  }, [product?.productPrice, product?.productDiscount]);

  const totalPrice = useMemo(() => {
    return quantity > 0 ? unitPrice * quantity : unitPrice;
  }, [unitPrice, quantity]);

  const unitMRP = useMemo(() => {
    return product?.productPrice || 0;
  }, [product?.productPrice]);

  const totalMRP = useMemo(() => {
    return quantity > 0 ? unitMRP * quantity : unitMRP;
  }, [unitMRP, quantity]);

  // Function to copy product link to clipboard
  const copyProductLink = async () => {
    const productLink = `${window.location.origin}${window.location.pathname}`;
    try {
      await navigator.clipboard.writeText(productLink);
      setLinkCopied(true);
      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const availableVariants = product?.variants?.filter((v) => v.stock > 0) || [];

  return (
    <div className="product-inner-page">
      <div className="">
        <div className="product-inner-page-wrap">
          <div className="product-inner-left">
            {galleryImages && galleryImages.length > 0 && (
              <div className="product-gallery">
                <div className="product-gallery-thumbs">
                  {galleryImages.map((img, index) => (
                    <button
                      type="button"
                      key={index}
                      className={`product-gallery-thumb ${
                        index === activeImageIndex ? "active" : ""
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}/${img.path}`}
                        alt=""
                      />
                    </button>
                  ))}
                </div>
                <div
                  className="product-gallery-main"
                  onMouseEnter={() => setIsZooming(true)}
                  onMouseLeave={() => setIsZooming(false)}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setZoomPosition({ x, y });
                  }}
                >
                  {/* Wishlist and Share Icons */}
                  <div className="product-gallery-actions">
                    <button
                      type="button"
                      className="product-gallery-action-btn"
                      onClick={() => {
                        if (isWishListed()) {
                          removeProductFromWishlist();
                        } else {
                          addPRoductToWishlist();
                        }
                      }}
                      title={
                        isWishListed()
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      {isWishListed() ? (
                        <FaHeart color="red" size={20} />
                      ) : (
                        <FaRegHeart size={20} />
                      )}
                    </button>
                    <button
                      type="button"
                      className="product-gallery-action-btn"
                      onClick={() => setShowShareModal(true)}
                      title="Share product"
                    >
                      <IoShareOutline size={20} />
                    </button>
                  </div>
                  <div className="product-gallery-main-wrapper">
                    <img
                      src={`${import.meta.env.VITE_BASE_URL}/${
                        galleryImages[activeImageIndex].path
                      }`}
                      alt=""
                      className="product-gallery-main-image"
                      style={{
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        transform: isZooming ? "scale(2.5)" : "scale(1)",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="product-inner-right">
            <div className="product-inner-content">
              <div className="product-head">
                <h2>{product?.productName || ""}</h2>
                <h4>{product?.productShortName || ""}</h4>
              </div>

              <div className="details-container">
                <div className="price-section">
                  <div className="price-section-inline">
                    <span className="price">
                      {selectedCountry.priceLabel}
                      {totalPrice.toFixed(2)}
                    </span>
                    {unitMRP > unitPrice && (
                      <span className="mrp">
                        {selectedCountry.priceLabel}
                        {totalMRP.toFixed(2)}
                      </span>
                    )}
                    {product?.productDiscount > 0 && (
                      <span className="discount">
                        {product?.productDiscount}% Off
                      </span>
                    )}

                    {averageRating > 0 && (
                      <div className="rating-badge">
                        <img src={star} alt="Rating Star" />
                        <span className="rating-value">{averageRating}</span>
                        {ratingCount > 0 && (
                          <>
                            <span className="rating-separator">|</span>
                            <span className="rating-count">{ratingCount}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="tax-info">Inclusive of all taxes</div>
                </div>
                {bestOffer && (
                  <div className="applied-offer-badge">
                    <span>
                      {bestOffer.discountType === "percent"
                        ? `${bestOffer.discountValue}% OFF`
                        : `${selectedCountry.priceLabel}${bestOffer.discountValue} OFF`}{" "}
                      Applicable
                    </span>
                  </div>
                )}
                {availableVariants.length > 0 && (
                  <div className="variant-section">
                    <p className="variant-note">
                      <strong>Note:</strong> You can select the variant during
                      checkout.
                    </p>

                    <div className="variant-list">
                      {availableVariants.map((variant, index) => (
                        <div key={index} className="variant-badge">
                          <span className="variant-name">
                            {variant.variantName}
                          </span>
                          <span className="variant-details">
                            Stock: {variant.stock} | Price:{" "}
                            {selectedCountry.priceLabel}
                            {variant.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="quantity-cart">
                  {isInCart ? (
                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          updateCartQuantity(
                            product._id,
                            "decrement",
                            selectedCountry?._id
                          )
                        }
                      >
                        –
                      </button>
                      <span>{quantity}</span>
                      <button
                        onClick={() =>
                          updateCartQuantity(
                            product._id,
                            "increment",
                            selectedCountry?._id
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    // <div className="quantity-controls"></div>
                    ""
                  )}
                  {!isInCart ? (
                    <button className="add-to-cart" onClick={addProductToCart}>
                      ADD TO CART
                    </button>
                  ) : (
                    <button
                      className="add-to-cart"
                      onClick={() =>
                        navigate(`/${selectedCountry.code}/checkout`)
                      }
                    >
                      Go to Checkout
                    </button>
                  )}
                </div>
                <div className="features">
                  {product &&
                  product.featureBadges &&
                  product.featureBadges.length > 0 ? (
                    product.featureBadges.map((badge, index) => (
                      <div className="feature-box" key={index}>
                        <img
                          src={`${import.meta.env.VITE_BASE_URL}${
                            badge?.iconUrl
                          }`}
                          alt=""
                        />
                        <span>{badge?.label}</span>
                      </div>
                    ))
                  ) : (
                    <></>
                  )}
                </div>

                {/* <p className="description">
                  {product?.productDescription ? (
                    <>
                      {readMore
                        ? product.productDescription
                        : product.productDescription.slice(0, 150)}

                      {!readMore &&
                        product.productDescription.length > 150 &&
                        "..."}

                      {product.productDescription.length > 150 && (
                        <span className="read-more" onClick={toggleShowFull}>
                          {readMore ? " Read less" : " Read more"}
                        </span>
                      )}
                    </>
                  ) : null}
                </p> */}

                {/* <div className="offers">
                  <h3>EXCLUSIVE OFFERS</h3>
                  <div className="offer-row">
                    <div className="offer-box">
                      🎁 <strong>2 FOR ₹949</strong>
                      <p>Get any 2 Perfumes for</p>
                    </div>
                    <div className="offer-box">
                      🎁 <strong>3 FOR ₹1298</strong>
                      <p>Get any 3 Perfumes for</p>
                    </div>
                    <div className="offer-box">
                      🎁 <strong>6 FOR ₹999</strong>
                      <p>Get any 100ml perfume</p>
                    </div>
                  </div>
                </div> */}
                {validOffers && validOffers.length > 0 && (
                  <div className="offers">
                    <h3>EXCLUSIVE OFFERS</h3>
                    <div className="offer-row">
                      {validOffers.map((offer, index) => (
                        <div key={offer._id || index} className="offer-box">
                          {["category", "discount", "coupon"].includes(
                            offer.offerType
                          ) ? (
                            <strong>
                              {offer.discountType === "percent"
                                ? `🎁 ${offer.discountValue}% OFF`
                                : `🎁 ₹${offer.discountValue} OFF`}
                            </strong>
                          ) : (
                            <strong></strong>
                          )}
                          <p>{offer.badge || offer.title}</p>
                          {/* BOGO Offer */}
                          {offer.offerType === "bogo" && (
                            <span>
                              Buy {offer.buyQuantity} Get {offer.getQuantity}{" "}
                              Free
                            </span>
                          )}
                          {/* Coupon Offer */}
                          {offer.offerType === "coupon" && (
                            <span>
                              {offer.couponCode && (
                                <p style={{ fontSize: "15px" }}>
                                  Use Code: <b>{offer.couponCode}</b>
                                  <br />
                                </p>
                              )}
                              <p style={{ fontSize: "12px" }}>
                                {offer.minOrderValue && (
                                  <>
                                    Min Order: {selectedCountry.priceLabel}
                                    {offer.minOrderValue}{" "}
                                  </>
                                )}
                                {offer.maxOrderValue && (
                                  <>
                                    | Max Order: {selectedCountry.priceLabel}
                                    {offer.maxOrderValue}{" "}
                                  </>
                                )}
                              </p>
                            </span>
                          )}
                          {/* Category Offer */}
                          {offer.offerType === "category" && (
                            <span>
                              <p style={{ fontSize: "12px" }}>
                                {offer.minOrderValue && (
                                  <>
                                    Min Order: {selectedCountry.priceLabel}
                                    {offer.minOrderValue}{" "}
                                  </>
                                )}
                                {offer.maxOrderValue && (
                                  <>
                                    | Max Order: {selectedCountry.priceLabel}
                                    {offer.maxOrderValue}{" "}
                                  </>
                                )}
                              </p>
                            </span>
                          )}
                          {/* Discount Offer */}
                          {offer.offerType === "discount" && (
                            <span>
                              <p style={{ fontSize: "12px" }}>
                                {offer.minOrderValue && (
                                  <>
                                    Min Order: {selectedCountry.priceLabel}
                                    {offer.minOrderValue}{" "}
                                  </>
                                )}
                                {offer.maxOrderValue && (
                                  <>
                                    | Max Order: {selectedCountry.priceLabel}
                                    {offer.maxOrderValue}{" "}
                                  </>
                                )}
                              </p>
                            </span>
                          )}
                          {/* Add more type-specific fields as needed */}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Accordion Section */}
        <div className="product-details-accordion">
          <Accordion 
            id="KEY BENEFITS"
            title="KEY BENEFITS" 
            isOpen={openAccordion === "KEY BENEFITS"}
            onToggle={handleAccordionToggle}
          >
            <ul>
              {product?.productBenefits &&
                product?.productBenefits.length > 0 &&
                product?.productBenefits.map((benefit, i) => (
                  <li key={i}>{benefit}</li>
                ))}
            </ul>
          </Accordion>

          <Accordion 
            id="HOW TO USE"
            title="HOW TO USE"
            isOpen={openAccordion === "HOW TO USE"}
            onToggle={handleAccordionToggle}
          >
            <ul>
              {product?.productUseCase &&
                product?.productUseCase.length > 0 &&
                product?.productUseCase.map((useCase, i) => (
                  <li key={i}>{useCase}</li>
                ))}
            </ul>
          </Accordion>

          <Accordion 
            id="FAQs"
            title="FAQs"
            isOpen={openAccordion === "FAQs"}
            onToggle={handleAccordionToggle}
          >
            {product &&
            product?.productFAQ &&
            product?.productFAQ.length > 0 ? (
              product?.productFAQ.map((faq, index) => (
                <p key={index}>
                  <strong>Q:</strong> {faq.question}
                  <br />
                  <strong>A:</strong> {faq.answer}
                </p>
              ))
            ) : (
              <p>
                <strong>Q:</strong> Are these perfumes unisex?
                <br />
                <strong>A:</strong> Yes, they are perfect for both men and
                women.
              </p>
            )}
          </Accordion>

          <Accordion 
            id="OTHER INFORMATION"
            title="OTHER INFORMATION"
            isOpen={openAccordion === "OTHER INFORMATION"}
            onToggle={handleAccordionToggle}
          >
            <p>{product?.productOtherInfo || "No other information"}</p>
          </Accordion>

          <Accordion 
            id="ALL INGREDIENTS"
            title="ALL INGREDIENTS"
            isOpen={openAccordion === "ALL INGREDIENTS"}
            onToggle={handleAccordionToggle}
          >
            <p>{product?.productIngredients || "Ingredients nor available"}</p>
          </Accordion>
          {/* <Accordion title="REVIEW">
            <div className="product-inner-review-form-section">
              <textarea
                name="content"
                id="content"
                onChange={handleChange}
                value={values.content}
                placeholder="How was your experience"
              />
              {errors.content && touched.content && (
                <span className="product-rating-error-message">
                  {errors.content}
                </span>
              )}

              <Rating
                name="half-rating"
                precision={0.5}
                value={values.rating}
                onChange={(_, newValue) => {
                  setFieldValue("rating", newValue);
                }}
              />
              {errors.rating && touched.rating && (
                <span className="product-rating-error-message">
                  {errors.rating}
                </span>
              )}

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                Post Review
              </button>
            </div>
          </Accordion> */}
          <Accordion 
            id="REVIEW"
            title="REVIEW"
            isOpen={openAccordion === "REVIEW"}
            onToggle={handleAccordionToggle}
          >
            {(closeAccordion) => (
              <div className="product-inner-review-form-section">
                <textarea
                  name="content"
                  id="content"
                  onChange={handleChange}
                  value={values.content}
                  placeholder="How was your experience"
                />
                {errors.content && touched.content && (
                  <span className="product-rating-error-message">
                    {errors.content}
                  </span>
                )}

                <Rating
                  name="half-rating"
                  precision={0.5}
                  value={values.rating}
                  onChange={(_, newValue) => setFieldValue("rating", newValue)}
                />
                {errors.rating && touched.rating && (
                  <span className="product-rating-error-message">
                    {errors.rating}
                  </span>
                )}

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async () => {
                    await handleSubmit(); // ✅ Submit review
                    closeAccordion(); // ✅ Close accordion after submit
                  }}
                >
                  Post Review
                </button>
              </div>
            )}
          </Accordion>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="share-modal-overlay"
          onClick={() => setShowShareModal(false)}
        >
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Copy link</h3>
              <button
                type="button"
                className="share-modal-close"
                onClick={() => setShowShareModal(false)}
              >
                ×
              </button>
            </div>
            <div className="share-modal-content">
              <div className="share-link-container">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}${window.location.pathname}`}
                  className="share-link-input"
                />
                <button
                  type="button"
                  className="share-copy-btn"
                  onClick={copyProductLink}
                >
                  {linkCopied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
