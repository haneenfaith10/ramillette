import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Topheader from "../../Components/TopHeader/TopHeader";
import NavBar from "../../Components/NavBar/NavBar";
import "./PaymentSingleProduct.css";
import { placeSingleOrder } from "../../services/orderApiService";
import { useSelector } from "react-redux";
// import { successToast } from "../../Components/Notification/NotificationMessage";
import OrderSuccess from "../../Components/OrderSuccess/OrderSuccess";
import { IoChevronBackOutline } from "react-icons/io5";
import { getUserDetails } from "../../services/userApiServices";

export default function PaymentSingleProduct() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("");
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const userId = useSelector((state) => state.user.user.id) || "";
  const [userDetails, setUserDetails] = useState({});


  const { product, address, selectedVariant } = location.state;

  useEffect(() => {
    if (userId.length > 0) {
      getUserDetails(userId, setUserDetails);
    }
  }, [userId]);

  async function placeOrder() {
    const response = await placeSingleOrder(
      product,
      address,
      selectedCountry._id,
      "cash on delivery",
      selectedVariant
    );
    if (response) {
      // successToast(response.message);
      setOrderSuccess(true);
    }
  }

  useEffect(() => {
    if (orderSuccess) {
      setTimeout(() => {
        navigate(`/${selectedCountry.code}/profile/orders`, { replace: true });
      }, 5000);
    }
  }, [orderSuccess, navigate, selectedCountry.code]);

  return (
    <div className="payment-checkout-single-main-container">
      <Topheader />
      <NavBar />
      {!orderSuccess ? (
        <div className="payment-checkout-single-content-section">
          <div className="payment-checkout-single-left-section">
            <ul>
              {userDetails.status && (
                <li onClick={() => setPaymentMethod("cashOnDelivery")}>
                  Cash on Delivery
                </li>
              )}
              <li>Online Payment</li>
            </ul>
          </div>
          <div className="payment-checkout-single-right-section">
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
                    type="button "
                    className="cancel-btn"
                    onClick={() => navigate(-1)}
                  >
                    <IoChevronBackOutline
                      size={18}
                      style={{ fontWeight: 700 }}
                    />
                    Go Back
                  </button>
                  <button type="button" onClick={placeOrder}>
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
