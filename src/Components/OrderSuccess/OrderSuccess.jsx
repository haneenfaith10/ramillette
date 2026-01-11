import "./OrderSuccess.css";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import { useSelector } from "react-redux";

export default function OrderSuccess() {
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const navigate = useNavigate();


  return (
    <div className="checkout-order-success-main-container">
      <div className="order-success-card">
        <FiCheckCircle className="success-icon" />
        <h2 className="success-title">Order Placed Successfully!</h2>
        <p className="success-message">
          Thank you for your purchase. Your order has been placed and is being
          processed.
        </p>
        <p
          style={{ cursor: "pointer" }}
          onClick={() =>
            navigate(`/${selectedCountry.code}/profile/orders`, {
              replace: true,
            })
          }
          className="view-orders-btn"
        >
          View My Orders
        </p>
        <p
          style={{ cursor: "pointer" }}
          onClick={() =>
            navigate(`/${selectedCountry.code}`, { replace: true })
          }
          className="back-home-link"
        >
          ← Back to Home
        </p>
      </div>
    </div>
  );
}
