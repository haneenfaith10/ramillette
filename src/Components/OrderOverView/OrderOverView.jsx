import { useDispatch, useSelector } from "react-redux";
import "./OrderOverView.css";
import {
  calculateCartSubtotal,
  calculateTotalPrice,
  calculateTotalPriceWithTax,
} from "../../utils/calculation";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { IoCloseCircleOutline } from "react-icons/io5";
import {
  changeCartQuantity,
  removeCartItem,
} from "../../services/userApiServices";
import {
  setCheckoutCart,
  updateCart,
  updateSubTotalAmount,
} from "../../redux/slices/userSlice";
import EmptyCart from "../../assets/svg/empty-cart.svg";
import { useEffect, useState } from "react";
import { getTaxByCountry } from "../../services/taxApiServices";

export default function OrderOverView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.user.checkout.cart);
  const deliveryAddress = useSelector((state) => state.user.checkout.address);
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const [stockErrorMessage, setStockErrorMessage] = useState({});
  const [tax, setTax] = useState("");

  //   function to remove cart item
  async function removeItem(productId) {
    const response = await removeCartItem(productId, selectedCountry._id);
    if (response) {
      dispatch(updateCart({ cart: response.cart }));
      dispatch(setCheckoutCart(response.cart.items));
    }
  }

  // function to get the tax in the country
  useEffect(() => {
    if (selectedCountry._id) {
      (async () => {
        const response = await getTaxByCountry(selectedCountry._id);
        if (response) {
          setTax(response?.taxPercentage);
        }
      })();
    }
  }, [selectedCountry?._id]);

  //   function to change the quantity of the cart item
  async function handleQtyChange(productId, newQty, variant) {
    try {
      const response = await changeCartQuantity(
        productId,
        newQty,
        selectedCountry?._id,
        variant,
      );
      if (response) {
        dispatch(updateCart({ cart: response }));
        dispatch(setCheckoutCart([...response.items]));
        setStockErrorMessage((prev) => ({ ...prev, [productId]: "" }));
      }
    } catch (error) {
      setStockErrorMessage((prev) => ({
        ...prev,
        [productId]: error?.message || "Failed to update quantity",
      }));
    }
  }

  // function to the payment page
  function handlePayment(payableAmount) {
    dispatch(updateSubTotalAmount({ totalAmount: payableAmount }));
    navigate(`/${selectedCountry.code}/checkout/payment`);
  }

  return (
    <div className="checkout-order-overview-container">
      <div className="checkout-order-overview-content">
        <h2 className="checkout-order-overview-title">Order overview</h2>
        <hr />
        {cartItems.length > 0 ? (
          cartItems.map((cart) => (
            <div className="checkout-order-overview-cart-item">
              <img
                src={`${import.meta.env.VITE_BASE_URL}/${
                  cart?.productId?.productImages[0]
                }`}
                alt=""
              />

              <div className="checkout-order-overview-cart-item-details">
                {/* product details */}
                <p className="product-title">{cart?.productId?.productName}</p>
                <p>
                  {" "}
                  {cart?.productId?.productDescription.length > 100
                    ? `${cart?.productId?.productDescription.slice(0, 100)}...`
                    : cart?.productId?.productDescription}
                </p>
                <p>
                  {" "}
                  Price : {selectedCountry.priceLabel}
                  {calculateTotalPrice(
                    cart.productId.countryPrices.find(
                      (cp) => cp.country._id === selectedCountry._id,
                    )?.price,
                    cart?.productId?.productDiscount,
                    cart?.qty,
                  )}
                  <strike style={{ color: "red", marginLeft: ".5rem" }}>
                    {selectedCountry.priceLabel}
                    {
                      cart.productId.countryPrices.find(
                        (cp) => cp.country._id === selectedCountry._id,
                      )?.price
                    }
                  </strike>
                </p>
                <div style={{ display: "flex", gap: ".5rem" }}>
                  {/* <p>
                    {selectedCountry.priceLabel}
                    {getDiscountedPrice(
                      cart.productId.countryPrices.find(
                        (cp) => cp.country._id === selectedCountry._id
                      )?.price,
                      cart.productId?.productDiscount
                    )}
                  </p> */}
                </div>
              </div>
              <div className="checkout-order-overview-cart-details">
                <p>Quantity</p>
                <input
                  type="number"
                  min="1"
                  value={cart?.qty}
                  onChange={(e) =>
                    handleQtyChange(
                      cart?.productId?._id,
                      e.target.value,
                      cart?.selectedVariant,
                    )
                  }
                  onWheel={(e) => {
                    e.target.blur();
                  }}
                />
                {stockErrorMessage[cart?.productId?._id] && (
                  <p className="stock-error">
                    {stockErrorMessage[cart?.productId?._id]}
                  </p>
                )}
                <button onClick={() => removeItem(cart?.productId?._id)}>
                  <IoCloseCircleOutline size={18} />
                  remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="checkout-order-overview-empty-cart">
            <p>Your cart is empty</p>
            <img src={EmptyCart} alt="Empty cart" />
          </div>
        )}
        <div className="checkout-order-overview-address">
          <h3>Delivery Address</h3>
          <p>
            {deliveryAddress?.firstName} {deliveryAddress?.lastName}
          </p>
          <p>{deliveryAddress?.address}</p>
          <p>
            {deliveryAddress?.city} {deliveryAddress?.state}{" "}
            {deliveryAddress?.country}
          </p>
          <p>{deliveryAddress?.zipCode}</p>
          <p>{deliveryAddress?.phoneNumber}</p>
          <p>{deliveryAddress?.email}</p>
        </div>
        <div className="checkout-order-overview-button-wrapper">
          <button onClick={() => navigate(-1)}>
            <MdKeyboardArrowLeft size={25} />
            Back
          </button>
          <button
            className={`${cartItems.length === 0 && "disableBtn"}`}
            disabled={cartItems.length === 0}
            onClick={() =>
              handlePayment(
                calculateTotalPriceWithTax(
                  calculateCartSubtotal(cartItems, selectedCountry?._id),
                  tax,
                ).totalPrice,
              )
            }
          >
            Place Order
            <MdKeyboardArrowRight size={25} />
          </button>
        </div>
        {/* sub total cart  */}
        <div className="checkout-order-overview-cart-summery">
          <p className="checkout-order-overview-subtotal-header">Sub Total</p>
          <div className="checkout-order-summery-space-between">
            <p>Total :</p>
            <p>
              {selectedCountry.priceLabel}
              {calculateCartSubtotal(cartItems, selectedCountry?._id).toFixed(
                2,
              )}
            </p>
          </div>
          <div className="checkout-order-summery-space-between">
            <p>Tax in percentage :</p>
            <p> {tax}%</p>
          </div>
          <div className="checkout-order-summery-space-between">
            <p>Tax Amount :</p>
            <p>
              {selectedCountry.priceLabel}
              {
                calculateTotalPriceWithTax(
                  calculateCartSubtotal(cartItems, selectedCountry?._id),
                  tax,
                ).taxAmount
              }
            </p>
          </div>
          <div className="checkout-order-summery-space-between ">
            <p>Payable Amount : </p>
            <p>
              {selectedCountry.priceLabel}
              {
                calculateTotalPriceWithTax(
                  calculateCartSubtotal(cartItems, selectedCountry?._id),
                  tax,
                ).totalPrice
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
