import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cancelOrder, getOrderDetails } from "../../services/orderApiService";
import "./UserOrderDetails.css";
import Topheader from "../../Components/TopHeader/TopHeader";
import NavBar from "../../Components/NavBar/NavBar";
import { useSelector } from "react-redux";
import Footer from "../../Components/Footer/Footer";
import { useFormik } from "formik";
import * as Yup from "yup";
import { statusSteps } from "../../constants";

export default function UserOrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const countryList = useSelector((state) => state.countries.list);
  const [showCancelReason, setShowCancelReason] = useState(false);

  const validationSchema = Yup.object().shape({
    reason: Yup.string()
      .required("Reason is required")
      .min(10, "Reason must be at least 10 characters"),
  });

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useFormik({
      initialValues: { reason: "" },
      validationSchema,
      onSubmit: async (values) => {
        const res = await cancelOrder(order._id, values.reason);
        if (res) navigate(`/${selectedCountry.code}/profile/orders`);
      },
    });

  const statusColors = {
    Processing: "blue",
    Cancelled: "red",
    Returned: "orange",
    Delivered: "green",
    Packed: "green",
    Shipped: "green",
    "Out for delivery": "green",
    "Cancellation In Progress": "orange",
  };

  useEffect(() => {
    (async () => {
      const response = await getOrderDetails(orderId);
      if (response) setOrder(response);
    })();
  }, [orderId]);

  if (!order) return <div className="loading">Loading order details...</div>;

  function getCurrency() {
    return (
      countryList.find((c) => c.currency === order.currency) || {
        priceLabel: "₹",
      }
    );
  }

  const getImage = (item) => {
    const base = import.meta.env.VITE_BASE_URL;
    if (item.productId?.productImages?.length > 0) {
      const img = item.productId.productImages[0];
      return `${base}/${img.path || img}`;
    }
    return "";
  };

  return (
    <div className="order-details-main-container">
      <Topheader />
      <NavBar />

      <div className="user-order-details">
        {/* HEADER */}
        <div className="header">
          <button onClick={() => navigate(-1)} className="back-btn">
            {"< Back"}
          </button>
          <h2>🧾 Order Summary</h2>
          <span className={`status-badge ${statusColors[order.status]}`}>
            {order.status}
          </span>
        </div>

        {/* ORDER META */}
        <div className="order-meta">
          <p>
            <strong>Order ID:</strong> #{order._id.toUpperCase()}
          </p>
          <p>
            <strong>Ordered On:</strong>{" "}
            {new Date(order.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Payment:</strong> {order.isPaid ? "Paid" : "Unpaid"}
          </p>
          <p>
            <strong>Delivery:</strong>{" "}
            {order.isDelivered ? "Delivered" : "Pending"}
          </p>
          <p>
            <strong>Payment Method:</strong>{" "}
            {order.paymentMethod
              .split(" ")
              .map((w) => w[0].toUpperCase() + w.slice(1))
              .join(" ")}
          </p>
        </div>

        {/* DELIVERY ADDRESS */}
        <div className="delivery-info">
          <h3>📦 Delivery Address</h3>
          <p>
            {order.deliveryAddress.firstName} {order.deliveryAddress.lastName}
          </p>
          <p>{order.deliveryAddress.address}</p>
          <p>
            {order.deliveryAddress.city}, {order.deliveryAddress.state} -{" "}
            {order.deliveryAddress.zipCode}
          </p>
          <p>Email: {order.deliveryAddress.email}</p>
          <p>Phone: {order.deliveryAddress.phoneNumber}</p>
        </div>

        {/* ORDER ITEMS */}
        <div className="items-list">
          <h3>🛒 Ordered Items</h3>

          {order.orderItems.map((item, index) => {
            const currency = getCurrency().priceLabel;
            const qty = item.qty;
            const originalPrice = item.productPrice;
            const productDiscount = item.productDiscount || 0;
            const finalPrice = item.finalPrice;
            const offer = item.offer;

            console.log(offer, "offer");

            const isOfferApplied = Boolean(offer);

            return (
              <div className="item" key={index}>
                <img src={getImage(item)} alt="" className="order-item-image" />
                <div>
                  <h4
                    onClick={() => {
                      if (
                        selectedCountry.currency.toUpperCase() ===
                        order.currency.toUpperCase()
                      ) {
                        navigate(
                          `/${selectedCountry.code}/product-inner/${item.productId._id}`
                        );
                      }
                    }}
                  >
                    {item.productId.productName}
                  </h4>

                  <p>Variant: {item.variantName}</p>

                  {/* OFFER DETAILS */}
                  {isOfferApplied ? (
                    <div className="offer-box">
                      <p className="offer-applied">
                        <strong>Offer Applied:</strong> {offer.title}
                      </p>

                      {/* ⭐ Offer Type */}
                      <p>
                        <strong>Type:</strong> {offer.offerType?.toUpperCase()}
                      </p>

                      {/* ⭐ BOGO UI */}
                      {offer.offerType === "bogo" &&
                      offer?.offerId?.buyQuantity ? (
                        <div className="bogo-details">
                          <p>
                            <strong>Buy:</strong> {offer?.offerId?.buyQuantity}
                          </p>
                          <p>
                            <strong>Get:</strong>{" "}
                            {offer?.offerType === "bogo" &&
                            offer?.getQuantity > 0 ? (
                              <>{offer.getQuantity} Free</>
                            ) : offer?.offerType === "bogo" ? (
                              <>{offer.discountValue}% OFF</>
                            ) : null}
                          </p>
                        </div>
                      ) : (
                        /* ⭐ Discount / Coupon UI */
                        <p>
                          <strong>Discount:</strong>{" "}
                          {offer.discountType === "percent"
                            ? `${offer.discountValue}% OFF`
                            : `${currency}${offer.discountValue} OFF`}
                        </p>
                      )}
                    </div>
                  ) : productDiscount > 0 ? (
                    <p className="product-discount">
                      Product Discount: {productDiscount}% OFF
                    </p>
                  ) : (
                    <p className="no-discount">No Discounts Applied</p>
                  )}

                  {/* ORIGINAL PRICE */}

                  {(isOfferApplied || productDiscount > 0) &&
                    offer?.offerType !== "bogo" && (
                      <p className="original-price">
                        <strike>
                          {qty} × {currency}
                          {originalPrice} = {currency}
                          {(originalPrice * qty).toLocaleString(undefined, {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                          })}
                        </strike>
                      </p>
                    )}

                  {/* FINAL PRICE */}
                  <p className="price-line">
                    {qty} × {currency}
                    {finalPrice} = {currency}
                    {(finalPrice * qty).toLocaleString(undefined, {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* TOTALS */}
        <div className="totals">
          <p>
            <strong>Total (before tax):</strong>{" "}
            {order.discountedPrice.toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })} {order.currency}
          </p>
          <p>
            <strong>Tax:</strong> {order.tax}%
          </p>
          <p>
            <strong>Final Amount:</strong>{" "}
            {order.totalPrice.toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{" "}
            {order.currency}
          </p>
        </div>

        {/* TRACKING */}
        {order.deliverySteps?.length > 0 && (
          <div className="order-tracking-section">
            <h3>Delivery Progress</h3>

            <div className="delivery-status-tracker">
              {statusSteps.map((step) => {
                const completed = order.deliverySteps.find(
                  (s) => s.status === step
                );

                return (
                  <div
                    key={step}
                    className={`tracker-step ${completed ? "completed" : ""}`}
                  >
                    <div className="tracker-dot"></div>
                    <div className="tracker-info">
                      <span className="tracker-label">{step}</span>

                      {completed && (
                        <span className="tracker-time">
                          {new Date(completed.updatedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CANCELLATION MESSAGE */}
        {order.status === "Cancelled" && order.cancellationReason && (
          <div className="order-cancellation-content-wrapper">
            <h2>Cancellation Reason</h2>
            <p>{order.cancellationReason}</p>
          </div>
        )}

        {/* CANCEL BUTTON */}
        {!order.isDelivered &&
          !order.isPaid &&
          !showCancelReason &&
          order.status !== "Cancelled" && (
            <div className="order-details-cancel-section">
              <button onClick={() => setShowCancelReason(true)}>
                Cancel Order
              </button>
            </div>
          )}

        {/* CANCEL FORM */}
        {showCancelReason && (
          <form
            className="order-details-cancel-reason-wrapper"
            onSubmit={handleSubmit}
          >
            <h2>Order cancellation confirmation</h2>

            <div className="input-wrapper">
              <textarea
                id="reason"
                name="reason"
                placeholder="Reason for order cancellation"
                value={values.reason}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.reason && touched.reason && <p>{errors.reason}</p>}
            </div>

            <div className="order-details-cancel-reason-button-wrapper">
              <button type="submit">Confirm Cancel Order</button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
}
