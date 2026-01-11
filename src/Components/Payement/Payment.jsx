import { useEffect, useState } from "react";
import "./Payment.css";
import { useDispatch, useSelector } from "react-redux";
import { placeOrder } from "../../services/orderApiService";
import { useNavigate } from "react-router-dom";
import { clearCheckoutData, updateCart } from "../../redux/slices/userSlice";
import { getTaxByCountry } from "../../services/taxApiServices";
import { IoChevronBackOutline } from "react-icons/io5";
import { getUserDetails } from "../../services/userApiServices";
import OrderSuccess from "../OrderSuccess/OrderSuccess";

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

  return (
    <div className="checkout-payment-main-container">
      {!orderSuccess ? (
        <div className="checkout-payment-content-section">
          <div className="checkout-payment-left-section">
            <ul>
              {userDetails.status && (
                <li onClick={() => setPaymentMethod("cashOnDelivery")}>
                  Cash on Delivery
                </li>
              )}
              <li>Online Payment</li>
            </ul>
          </div>
          <div className="checkout-payment-right-section">
            {paymentMethod === "cashOnDelivery" && (
              <div>
                <div className="cash-on-delivery-info">
                  <h3>Cash on Delivery</h3>
                  <p>
                    You have selected <strong>Cash on Delivery</strong>. Please
                    ensure you have the exact amount ready when your order
                    arrives.
                  </p>
                  <p>
                    No advance payment is required. Our delivery agent will
                    collect the payment at your doorstep.
                  </p>
                </div>
                <div className="cash-on-delivery-button-wrapper">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => navigate(-1)}
                  >
                    <IoChevronBackOutline
                      size={18}
                      style={{ fontWeight: 700 }}
                    />
                    Go Back
                  </button>
                  <button type="button" onClick={placeItemOrder}>
                    Place Order
                  </button>
                </div>
              </div>
            )}
            {!paymentMethod && (
              <div className="checkout-payment-empty-section">
                <h3>Please select a payment method</h3>
                <p>
                  Choose a payment option from the left to proceed with your
                  order.
                </p>
                {!userDetails.status && (
                  <p
                    style={{
                      color: "red",
                      fontWeight: "500",
                      fontSize: "15px",
                      marginTop: "1rem",
                    }}
                  >
                    Your account is inactive. Cash on Delivery is not available.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <OrderSuccess />
      )}
    </div>
  );
}
