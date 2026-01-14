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
import {
  addToWishlist,
  removeFromWishlist,
} from "../../services/wishlistApiServices";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

// Accordion component
const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`accordion ${isOpen ? "open" : ""}`}>
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <h4>{title}</h4>
        <span>{isOpen ? "−" : "+"}</span>
      </div>
      {isOpen && (
        <div className="accordion-body">
          {typeof children === "function"
            ? children(() => setIsOpen(false))
            : children}
        </div>
      )}
    </div>
  );
};

export default function ProductInner(Props) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [landscapeThumbs, setLandscapeThumbs] = useState(null);
  const { product = {}, setChanged = () => {}, reviews } = Props;
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.user?.user?.cart);
  const cartItems = useMemo(() => {
    return cart?.items || [];
  }, [cart]);
  const [quantity, setQuantity] = useState(0);
  const [readMore, setReadMore] = useState(false);
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const token = localStorage.getItem("remilletteTkn");
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [validOffers, setValidOffers] = useState();

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 767 : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    function handleResize() {
      setIsMobile(window.innerWidth <= 767);
    }

    window.addEventListener("resize", handleResize);

    // cleanup on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const portraitImages =
    product?.productImages?.filter((img) => img.orientation === "portrait") ||
    [];
  const landscapeImages =
    product?.productImages?.filter((img) => img.orientation === "landscape") ||
    [];

  const availableVariants = product?.variants?.filter((v) => v.stock > 0) || [];

  return (
    <div className="product-inner-page">
      <div className="wrapper">
        <div className="product-inner-page-wrap">
          <div className="product-inner-left">
            {/* LANDSCAPE SLIDER */}
            {landscapeImages.length > 1 ? (
              <div className="landscape-slider">
                <Swiper
                  style={{
                    "--swiper-navigation-color": "#fff",
                    "--swiper-pagination-color": "#fff",
                  }}
                  loop={true}
                  spaceBetween={10}
                  navigation={true}
                  thumbs={{
                    swiper:
                      landscapeThumbs && !landscapeThumbs.destroyed
                        ? landscapeThumbs
                        : null,
                  }}
                  modules={[FreeMode, Navigation, Thumbs]}
                  className="main-image-slider"
                >
                  {landscapeImages.map((img, i) => (
                    <SwiperSlide key={i}>
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}/${img.path}`}
                        alt=""
                        className="product-inner-slider-main-image"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Thumbnail Swiper */}
                <Swiper
                  onSwiper={setLandscapeThumbs}
                  loop={true}
                  spaceBetween={10}
                  slidesPerView={4}
                  freeMode={true}
                  watchSlidesProgress={true}
                  modules={[FreeMode, Navigation, Thumbs]}
                  className="main-thumb-slider"
                >
                  {landscapeImages.map((img, i) => (
                    <SwiperSlide key={i}>
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}/${img.path}`}
                        alt=""
                        className="product-inner-slider-image"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ) : landscapeImages.length === 1 ? (
              <div className="single-image-wrapper">
                <img
                  src={`${import.meta.env.VITE_BASE_URL}/${
                    landscapeImages[0].path
                  }`}
                  alt=""
                  className="product-inner-slider-main-image"
                />
              </div>
            ) : null}
            {portraitImages.length > 1 ? (
              <div className="portrait-slider">
                <Swiper
                  style={{
                    "--swiper-navigation-color": "#fff",
                    "--swiper-pagination-color": "#fff",
                  }}
                  loop={true}
                  spaceBetween={10}
                  navigation={true}
                  thumbs={{
                    swiper:
                      thumbsSwiper && !thumbsSwiper.destroyed
                        ? thumbsSwiper
                        : null,
                  }}
                  modules={[FreeMode, Navigation, Thumbs]}
                  className="main-portrait-image-slider"
                >
                  {portraitImages.map((img, i) => (
                    <SwiperSlide key={i}>
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}/${img.path}`}
                        alt=""
                        className="product-inner-slider-main-image"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                <Swiper
                  onSwiper={setThumbsSwiper}
                  loop={true}
                  spaceBetween={10}
                  slidesPerView={4}
                  freeMode={true}
                  watchSlidesProgress={true}
                  direction={isMobile ? "horizontal" : "vertical"}
                  modules={[FreeMode, Navigation, Thumbs]}
                  className="main-portrait-thumb-slider"
                >
                  {portraitImages.map((img, i) => (
                    <SwiperSlide key={i}>
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}/${img.path}`}
                        alt=""
                        className="product-inner-slider-image"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ) : !isMobile && portraitImages.length === 1 ? (
              <div className="single-image-wrapper">
                <img
                  src={`${import.meta.env.VITE_BASE_URL}/${
                    portraitImages[0].path
                  }`}
                  alt=""
                  className="product-inner-slider-main-image"
                />
              </div>
            ) : null}
          </div>

          <div className="product-inner-right">
            <div className="product-inner-content">
              <div className="product-head">
                <h2>{product?.productName || ""}</h2>
                <h4>{product?.productShortName || ""}</h4>
              </div>

              <div className="product-star-rating">
                <div className="star-rating">
                  <img src={star} alt="Rating Star" />
                  <p>{product?.productRating || 3}</p>
                  <p
                    style={{
                      padding: "0 .5rem ",
                      borderLeft: "2px solid gray",
                      color: "gray",
                    }}
                  >
                    {reviews && reviews.length ? reviews.length : 0} Ratings
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="product-inner-wishlist-btn-wrapper"
              >
                {isWishListed() && "In "}
                Wishlist&nbsp;
                {isWishListed() ? (
                  <FaHeart
                    color="red"
                    size={20}
                    style={{ cursor: "pointer" }}
                    onClick={removeProductFromWishlist}
                  />
                ) : (
                  <FaRegHeart
                    size={20}
                    style={{ cursor: "pointer" }}
                    onClick={addPRoductToWishlist}
                  />
                )}
              </button>

              <div className="details-container">
                <div className="price-section">
                  <span className="discount">
                    –{product?.productDiscount || 0}%
                  </span>
                  <span className="price">
                    {selectedCountry.priceLabel}
                    {getDiscountedPrice(
                      product?.productPrice,
                      product?.productDiscount
                    )}
                  </span>
                  <div className="mrp">
                    MRP:{" "}
                    <del>
                      {selectedCountry.priceLabel}
                      {product?.productPrice || 0}.00
                    </del>
                  </div>
                  <div className="tax-info">Inclusive of all taxes</div>
                </div>
                {bestOffer ? (
                  <>
                    <div className="applied-offer">
                      {bestOffer.discountType === "percent"
                        ? `${bestOffer.discountValue}% OFF`
                        : `₹${bestOffer.discountValue} OFF`}{" "}
                      Applicable
                    </div>
                  </>
                ) : (
                  <></>
                )}
                {availableVariants.length > 0 && (
                  <div className="variant-section">
                    <p className="variant-note">
                      <strong>Note:</strong> You can select the variant during
                      checkout.
                    </p>

                    <ul className="variant-list">
                      {availableVariants.map((variant, index) => (
                        <li key={index} className="variant-item">
                          <strong>{variant.variantName}</strong>
                          {` | Stock: ${variant.stock}`}
                          {` | Price: ${selectedCountry.priceLabel}${variant.price}`}
                        </li>
                      ))}
                    </ul>
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
                      BUY NOW
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

                <p className="description">
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
                </p>

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
          <Accordion title="KEY BENEFITS" defaultOpen={true}>
            <ul>
              {product?.productBenefits &&
                product?.productBenefits.length > 0 &&
                product?.productBenefits.map((benefit, i) => (
                  <li key={i}>{benefit}</li>
                ))}
            </ul>
          </Accordion>

          <Accordion title="HOW TO USE">
            <ul>
              {product?.productUseCase &&
                product?.productUseCase.length > 0 &&
                product?.productUseCase.map((useCase, i) => (
                  <li key={i}>{useCase}</li>
                ))}
            </ul>
          </Accordion>

          <Accordion title="FAQs">
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

          <Accordion title="OTHER INFORMATION">
            <p>{product?.productOtherInfo || "No other information"}</p>
          </Accordion>

          <Accordion title="ALL INGREDIENTS">
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
          <Accordion title="REVIEW" defaultOpen={false}>
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
    </div>
  );
}
