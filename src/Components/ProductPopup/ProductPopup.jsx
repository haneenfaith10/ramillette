import { useState, useEffect } from "react";
import "./ProductPopup.css";
import ProductSlider from "../Productslider/Productslider";
import close from "../../assets/images/cancel.png";
import stararting from "../../assets/images/rating.png";
import {
  addToCart,
  notifyMeAboutProduct,
} from "../../services/userApiServices";
import { useDispatch, useSelector } from "react-redux";
import { updateCart } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { successToast } from "../Notification/NotificationMessage";

const Popup = ({ isOpen, onClose, product, productPrice }) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(null);
  const stock = 10;
  const token = localStorage.getItem("remilletteTkn");
  const navigate = useNavigate();
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const userCart = useSelector((state) => state.user.user?.cart?.items);

  const content = [
    {
      title: "Overview",
      text: product?.productDescription || "No description available.",
    },
    {
      title: "Features",
      text: "Explore our cutting-edge features that make your experience smooth and productive.",
    },
    {
      title: "Pricing",
      text: "We offer flexible pricing plans to suit your needs. Choose the best plan for you!",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const increment = () => {
    if (quantity < stock) setQuantity((prev) => prev + 1);
  };

  const decrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  async function addProductToCart() {
    const response = await addToCart(
      product?._id,
      1,
      selectedCountry._id,
      true,
    );
    if (response) {
      dispatch(updateCart({ cart: response }));
    }
  }

  const isOutOfStock = (() => {
    if (product?.status === false || product?.isDelete === true) return true;
    const variants = product?.countryVariants?.[selectedCountry?._id] || [];
    if (variants.length === 0) return true;
    return variants.every((v) => Number(v.stock || 0) <= 0);
  })();

  const userEmail = useSelector((state) => state.user.user?.email);

  async function handleNotifyMe() {
    if (!token) {
      navigate("/login");
      return;
    }

    const data = {
      productId: product?._id,
      userEmail: userEmail,
      countryId: selectedCountry?._id,
    };

    if (!data.userEmail) {
      navigate("/login");
      return;
    }

    await notifyMeAboutProduct(data);
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      {Object.keys(product).length > 0 && (
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>
            <img src={close} alt="Close" />
          </button>
          <div className="product-popup-sec">
            <div className="product-popup-row">
              <div className="product-popup-left">
                <ProductSlider images={product?.productImages} />
              </div>
              <div className="product-popup-right">
                <div className="product-des-sec">
                  <div className="product-head-sec">
                    <h2>{product?.productName ?? ""}</h2>
                    <div className="product-inner-star-rating">
                      <img src={stararting} alt="Rating" />
                    </div>
                    <div className="product-rate">
                      <p className="saveprice">
                        {selectedCountry?.name &&
                          selectedCountry?.name.toLowerCase() === "india" &&
                          "M.R.P:"}
                        <span>
                          {selectedCountry?.priceLabel}
                          {productPrice ?? 0}.00
                        </span>
                      </p>
                      <p>
                        {selectedCountry?.priceLabel}
                        {`${getDiscountedPrice(
                          productPrice,
                          product?.productDiscount,
                        )} `}
                      </p>
                    </div>
                    <div className="tax">
                      <p>Exclusive of all taxes</p>
                    </div>
                  </div>
                  {isInCart() && (
                    <div className="product-quantity">
                      <p>Quantity:</p>
                      <div className="quantity-controls">
                        <button
                          className="quantity-btn"
                          onClick={decrement}
                          disabled={quantity === 1}
                        >
                          -
                        </button>
                        <span className="quantity-value">{quantity}</span>
                        <button
                          className="quantity-btn"
                          onClick={increment}
                          disabled={quantity === stock}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="product-popup-btns">
                    <div className="add-btn">
                      <button
                        className="secondry-btn"
                        onClick={() => {
                          if (token) {
                            navigate(
                              `/${selectedCountry?.code}/checkout-single`,
                              {
                                state: { product: { ...product, quantity } },
                              },
                            );
                          } else {
                            navigate("/login");
                          }
                        }}
                      >
                        Go to Checkout
                      </button>
                    </div>
                    <div className="product-buy-btn">
                      {isInCart() ? (
                        <button
                          className="buy-btn"
                          onClick={() =>
                            navigate(`/${selectedCountry?.code}/checkout`)
                          }
                        >
                          Check out
                        </button>
                      ) : isOutOfStock ? (
                        <button className="buy-btn" onClick={handleNotifyMe}>
                          NOTIFY ME
                        </button>
                      ) : (
                        <button
                          className="buy-btn"
                          onClick={() => {
                            if (!token) {
                              navigate("/login");
                            } else {
                              addProductToCart();
                            }
                          }}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="product-popup-details">
                    <div className="accordion-tabs">
                      {content.map((item, index) => (
                        <div key={index} className="accordion-item">
                          <button
                            className={`accordion-header ${
                              activeTab === index ? "active" : ""
                            }`}
                            onClick={() =>
                              setActiveTab(activeTab === index ? null : index)
                            }
                          >
                            {item.title}

                            <span
                              className={`arrow ${
                                activeTab === index ? "up" : "down"
                              }`}
                            ></span>
                          </button>
                          {activeTab === index && (
                            <div className="accordion-body">
                              <p>{item.text}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup;
