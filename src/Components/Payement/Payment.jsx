import { useEffect, useState } from "react";
import "./Payment.css";
import { useDispatch, useSelector } from "react-redux";
import { placeOrder } from "../../services/orderApiService";
import { useNavigate } from "react-router-dom";
import { clearCheckoutData, updateCart } from "../../redux/slices/userSlice";
import { getTaxByCountry } from "../../services/taxApiServices";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { getUserDetails } from "../../services/userApiServices";
import OrderSuccess from "../OrderSuccess/OrderSuccess";
import { CheckoutSummeryCard } from "../CheckoutAddress/CheckoutAddress";
import { calculateTotalPriceWithTax } from "../../utils/calculation";

export default function Payment() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState();
  const dispatch = useDispatch();
  const checkoutData = useSelector((state) => state.user.checkout);
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const [userDetails, setUserDetails] = useState({});
  const [tax, setTax] = useState("");
  const userId = useSelector((state) => state.user.user.id) || "";
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (!orderSuccess && checkoutData.cart.length <= 0) {
      navigate(`/${selectedCountry.code}/`);
    }
  }, [orderSuccess, checkoutData.cart.length, navigate, selectedCountry.code]);

  useEffect(() => {
    if (userId.length > 0) {
      getUserDetails(userId, setUserDetails);
    }
  }, [userId]);

  useEffect(() => {
    if (selectedCountry._id) {
      (async () => {
        const response = await getTaxByCountry(selectedCountry._id);
        if (response) {
          setTax(response?.taxPercentage);
        }
      })();
    }
  }, [selectedCountry._id]);

  async function placeItemOrder() {
    const response = await placeOrder(checkoutData, selectedCountry._id, tax);
    if (response) {
      dispatch(updateCart({ cart: { items: [] } }));
      dispatch(clearCheckoutData());
      setOrderSuccess(true);
    }
  }

  // Calculate order total
  const subtotal = checkoutData?.cart?.reduce((acc, item) => {
    const effectivePrice =
      item.discountedPrice ?? item.selectedVariant?.price ?? 0;
    return acc + effectivePrice * item.qty;
  }, 0) || 0;

  const { totalPrice } = calculateTotalPriceWithTax(subtotal, tax);

  return (
    <div className="checkout-payment-main-container">
      {!orderSuccess ? (
        <div className="container">
          <div className="checkout-payment-content-section">
            <div className="checkout-payment-main-content">
              <h2 className="checkout-payment-title">Payment</h2>

              <div className="checkout-payment-methods-section">
                <h3 className="checkout-payment-section-title">
                  Select Payment Method
                </h3>
                <div className="checkout-payment-methods-list">
                  {userDetails.status && (
                    <div
                      className={`checkout-payment-method-card ${
                        paymentMethod === "cashOnDelivery" ? "selected" : ""
                      }`}
                      onClick={() => setPaymentMethod("cashOnDelivery")}
                    >
                      <div className="payment-method-details">
                        <h4>Cash on Delivery</h4>
                        <p>Pay when your order arrives</p>
                      </div>
                      <div className="payment-method-radio">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === "cashOnDelivery"}
                          readOnly
                        />
                      </div>
                    </div>
                  )}

                  <div
                    className={`checkout-payment-method-card ${
                      paymentMethod === "online" ? "selected" : ""
                    }`}
                    onClick={() => setPaymentMethod("online")}
                  >
                    <div className="payment-method-details">
                      <h4>Online Payment</h4>
                      <p>Pay securely with card or digital wallet</p>
                    </div>
                    <div className="payment-method-radio">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "online"}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {paymentMethod === "cashOnDelivery" && (
                <div className="checkout-payment-details-section">
                  <div className="cash-on-delivery-info">
                    <h3>Cash on Delivery</h3>
                    <p>
                      You have selected <strong>Cash on Delivery</strong>.
                      Please ensure you have the exact amount ready when your
                      order arrives.
                    </p>
                    <p>
                      No advance payment is required. Our delivery agent will
                      collect the payment at your doorstep.
                    </p>
                  </div>

                  <div className="cash-on-delivery-button-wrapper">
                    <button
                      type="button"
                      className="payment-back-btn"
                      onClick={() =>
                        navigate(`/${selectedCountry.code}/checkout/address`)
                      }
                    >
                      <MdKeyboardArrowLeft />
                      BACK TO ADDRESS
                    </button>
                    <button
                      type="button"
                      className="payment-place-order-btn"
                      onClick={placeItemOrder}
                    >
                      PROCEED TO PAYMENT
                    </button>
                  </div>
                </div>
              )}

              {paymentMethod === "online" && (
                <div className="checkout-payment-details-section">
                  <div className="online-payment-info">
                    <h3>Online Payment</h3>
                    <p>
                      You will be redirected to a secure payment gateway to
                      complete your transaction.
                    </p>
                    <p>
                      We accept all major credit cards, debit cards, and digital
                      wallets.
                    </p>
                  </div>

                  <div className="cash-on-delivery-button-wrapper">
                    <button
                      type="button"
                      className="payment-back-btn"
                      onClick={() =>
                        navigate(`/${selectedCountry.code}/checkout/address`)
                      }
                    >
                      <MdKeyboardArrowLeft />
                      Back to Address
                    </button>
                    <button
                      type="button"
                      className="payment-place-order-btn"
                      onClick={placeItemOrder}
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </div>
              )}

              {!paymentMethod && (
                <div className="checkout-payment-empty-section">
                  <h3>Please select a payment method</h3>
                  <p>
                    Choose a payment option above to proceed with your order.
                  </p>
                  {!userDetails.status && (
                    <div className="payment-error-message">
                      Your account is inactive. Cash on Delivery is not
                      available.
                    </div>
                  )}
                </div>
              )}
            </div>

            <CheckoutSummeryCard cartItem={checkoutData} />
          </div>
        </div>
      ) : (
        <OrderSuccess />
      )}
    </div>
  );
}
