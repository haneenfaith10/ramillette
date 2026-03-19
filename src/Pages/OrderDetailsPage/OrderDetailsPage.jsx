// src/pages/OrderDetailsPage/OrderDetailsPage.jsx
import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useParams } from "react-router-dom";
import { calculateTotalPriceWithTax } from "../../utils/calculation";
import "./OrderDetailsPage.css";
import { getOrderDetails } from "../../services/orderApiService";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import { statusColorsClass } from "../../constants";
import OrderCancellationModal from "../../Components/OrderCancellationModal/OrderCancellationModal";
import OrderStatusUpdate from "../../Components/OrderStatusUpdate/OrderStatusUpdate";

function getAppliedOfferFromItem(item) {
  // common names we've seen/used
  return (
    item.appliedOffer ||
    item.selectedOffer ||
    item.offer ||
    item.offerDetails ||
    item.appliedOfferDetails ||
    null
  );
}

function computeItemUnitFinalPrice(item) {
  // 1) saved finalPrice in order (highest trust)
  if (typeof item.finalPrice === "number" && !Number.isNaN(item.finalPrice)) {
    return item.finalPrice;
  }

  const basePrice =
    // if order item stores productPrice, use it; if productId object present try productId price...
    (typeof item.productPrice === "number" && item.productPrice) ||
    item.productId?.productPrice ||
    item.productId?.selectedVariant?.price ||
    item.selectedVariant?.price ||
    0;

  // 2) applied offer
  const offer = getAppliedOfferFromItem(item);
  if (offer) {
    // support different shapes: discountType/discountValue OR discountType/discountAmount
    const discountType = offer.discountType || offer.type || null;
    const discountValue =
      offer.discountValue ??
      offer.discountAmount ??
      offer.amount ??
      offer.value ??
      0;

    if (discountType === "percent") {
      return basePrice - (discountValue / 100) * basePrice;
    } else if (discountType === "flat") {
      return Math.max(basePrice - discountValue, 0);
    }
    // some special offers like BOGO might not change unit price — prefer offered discountedPrice if present
    if (typeof offer.discountedPrice === "number") {
      return offer.discountedPrice;
    }
  }

  // 3) product discount (percent)
  const productDiscount =
    item.productDiscount ??
    item.productId?.productDiscount ??
    0; /* percentage */

  if (productDiscount > 0) {
    return basePrice - (productDiscount / 100) * basePrice;
  }

  // 4) fallback
  return basePrice;
}

function fmtPrice(val) {
  const n = Number(val || 0);
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const modalRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await getOrderDetails(orderId);
        if (response) {
          setOrder(response);
        }
      } catch (err) {
        console.error("Failed to fetch order", err);
      }
    })();
  }, [orderId, updated]);

  async function generatePDF() {
    if (!modalRef.current) return;
    setIsDownloading(true);
    try {
      const input = modalRef.current;
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const padding = 10; // mm
      const contentWidth = pdfWidth - padding * 2;
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = padding;

      pdf.addImage(imgData, "PNG", padding, position, contentWidth, imgHeight);
      heightLeft -= pdfHeight - padding * 2;

      while (heightLeft > 0) {
        position = padding - heightLeft;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          padding,
          position,
          contentWidth,
          imgHeight
        );
        heightLeft -= pdfHeight - padding * 2;
      }

      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(
        now.getHours()
      ).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;

      const customerName = order?.user?.firstName || "customer";
      pdf.save(`invoice-${customerName}-${timestamp}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  }

  if (!order) return <div>Loading...</div>;

  // compute derived values for display
  const currency = order.currency || "";
  // compute per-item derived info: unitFinalPrice, lineOriginal, lineFinal, lineSavings, appliedOffer
  const lineItems = (order.orderItems || []).map((item) => {
    // item may store productPrice/productDiscount/finalPrice already
    const productPrice =
      typeof item.productPrice === "number"
        ? item.productPrice
        : item.productId?.productPrice ?? 0;
    const productDiscount =
      typeof item.productDiscount === "number"
        ? item.productDiscount
        : item.productId?.productDiscount ?? 0;
    const qty = item.qty || 1;

    const appliedOffer = getAppliedOfferFromItem(item);

    // prioritized final unit price calculation
    const unitFinalPrice = computeItemUnitFinalPrice({
      ...item,
      productPrice,
      productDiscount,
    });

    const lineOriginal = productPrice * qty;
    const lineFinal = unitFinalPrice * qty;
    const lineSavings = Math.max(lineOriginal - lineFinal, 0);

    return {
      ...item,
      productPrice,
      productDiscount,
      qty,
      appliedOffer,
      unitFinalPrice,
      lineOriginal,
      lineFinal,
      lineSavings,
    };
  });

  // totals (we trust backend 'totalPrice' and 'subTotalPrice' but also compute for display)
  const computedSubTotal = lineItems.reduce((s, it) => s + it.lineFinal, 0);
  const backendSubTotalPrice = order.totalPrice ?? computedSubTotal;

  // tax info
  const taxPercent = order.tax ?? 0;
  const taxCalc = calculateTotalPriceWithTax(computedSubTotal, taxPercent);
  const taxAmount = taxCalc.taxAmount ?? 0;
  const totalWithTax = taxCalc.totalPrice ?? computedSubTotal + taxAmount;

  return (
    <div className="order-details-page-container">
      <AdminHeader title="Order details" />

      <div className="order-additional-details">
        <p className={`badge ${statusColorsClass[order.status] || ""}`}>
          {" "}
          {order.status}
        </p>

        {(order.status === "Cancelled" ||
          order.status === "Cancellation In Progress") && (
          <div className="cancellation-reason">
            <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
              Cancellation Reason
            </p>
            <p style={{ color: "var(--secondary-color)" }}>
              {order.cancellationReason || "No reason provided"}
            </p>
          </div>
        )}

        <div className="action-buttons">
          <button
            onClick={() => setShowCancellationModal(true)}
            className="cancel-order-btn"
            disabled={["Delivered", "Cancelled"].includes(order.status)}
          >
            Cancel Order
          </button>

          <button
            onClick={() => setShowStatusModal(true)}
            className="update-status-btn"
            disabled={["Cancelled"].includes(order.status)}
          >
            Update Status
          </button>
        </div>

        <OrderCancellationModal
          open={showCancellationModal}
          handleClose={() => setShowCancellationModal(false)}
          orderId={order._id}
          setUpdated={setUpdated}
        />

        {showStatusModal && (
          <OrderStatusUpdate
            onClose={() => setShowStatusModal(false)}
            order={order}
            setUpdated={setUpdated}
            currentStatus={order.status}
          />
        )}
      </div>

      {/* Invoice area (used for view + pdf) */}
      <div ref={modalRef} className="order-modal-wrapper">
        <div className="invoice-header" style={{ textAlign: "center" }}>
          <h1>Invoice</h1>
          <p>Thank you for your purchase!</p>
        </div>

        <h2>Order Summary</h2>

        <div className="order-info">
          <p>
            <strong>Order ID:</strong> {order._id}
          </p>
          <p>
            <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={`badge ${statusColorsClass[order.status] || ""}`}>
              {order.status}
            </span>
          </p>

          <p>
            <strong>Subtotal :</strong>{" "}
            {`${
              backendSubTotalPrice ? fmtPrice(backendSubTotalPrice) : "0.00"
            } ${currency}`}
          </p>

          <p>
            <strong>Note:</strong> {order.note || "None"}
          </p>
          <p>
            <strong>Payment:</strong> {order.isPaid ? "Paid" : "Unpaid"}
          </p>
          <p>
            <strong>Delivery:</strong>{" "}
            {order.isDelivered ? "Delivered" : "Not Delivered"}
          </p>
        </div>

        <div className="order-user-info">
          <h3>Delivery Address</h3>
          <p>
            <strong>Name:</strong> {order.deliveryAddress?.firstName}{" "}
            {order.deliveryAddress?.lastName}
          </p>
          <p>
            <strong>Email:</strong> {order.deliveryAddress?.email}
          </p>
          <p>
            <strong>Phone:</strong> {order.deliveryAddress?.phoneNumber}
          </p>
          <p>
            <strong>Address:</strong> {order.deliveryAddress?.address},{" "}
            {order.deliveryAddress?.city}, {order.deliveryAddress?.state} -{" "}
            {order.deliveryAddress?.zipCode}
          </p>
        </div>

        <div className="order-items">
          <h3>Items</h3>

          {lineItems.map((item, idx) => (
            <div className="item" key={idx}>
              <div className="item-left">
                <div className="item-qty">{item.qty}x</div>

                <div
                  style={{
                    width: "260px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>
                    {item.productId?.productName ||
                      item.productName ||
                      "Unnamed"}
                  </div>
                  <div style={{ fontSize: 13, color: "#444" }}>
                    Variant:{" "}
                    {item.variantName ||
                      item.selectedVariant?.variantName ||
                      "-"}
                  </div>

                  {/* Applied offer info */}
                  {item.appliedOffer ? (
                    <div style={{ fontSize: 13, color: "#065f46" }}>
                      <strong>Offer:</strong>{" "}
                      {item.appliedOffer.title ||
                        item.appliedOffer.name ||
                        "Offer"}
                      {" · "}
                      {/* 🔍 BOGO OFFER HANDLING */}
                      {item.appliedOffer.offerType === "bogo" ? (
                        <em style={{ color: "#065f46" }}>
                          Buy {item.appliedOffer.offerId.buyQuantity} Get{" "}
                          {/* {item.appliedOffer.offerId.getQuantity}{" "} */}
                          {/** SAME PRODUCT or DIFFERENT PRODUCT? */}
                          {/* {item.appliedOffer.offerId.getProductId._id &&
                          item.appliedOffer.offerId.getProductId._id !==
                            item.appliedOffer.offerId.buyProductId ? (
                            <>
                              {item.appliedOffer.offerId.getProductId
                                .productName
                                ? ` ${item.appliedOffer.offerId.getProductId.productName}`
                                : " Item"}
                              {" Free"}
                            </>
                          ) : (
                            // SAME PRODUCT BOGO
                            " Free"
                          )} */}
                          {item.appliedOffer.offerId.discountValue}% OFF
                        </em>
                      ) : (
                        /* 🎁 DISCOUNT / COUPON OFFER */
                        <em style={{ color: "#065f46" }}>
                          {item.appliedOffer.offerType ||
                            item.appliedOffer.type ||
                            ""}
                          {item.appliedOffer.discountType === "percent"
                            ? ` · ${
                                item.appliedOffer.discountValue ??
                                item.appliedOffer.discountAmount ??
                                0
                              }% OFF`
                            : item.appliedOffer.discountType === "flat"
                            ? ` · ${currency}${
                                item.appliedOffer.discountValue ??
                                item.appliedOffer.discountAmount ??
                                0
                              } OFF`
                            : ""}
                        </em>
                      )}
                    </div>
                  ) : item.productDiscount > 0 ? (
                    <div style={{ fontSize: 13, color: "#b91c1c" }}>
                      Product Discount:{" "}
                      {item.productDiscount ??
                        item.productId?.productDiscount ??
                        0}
                      % OFF
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="item-thumb">
                <img
                  src={
                    item.productId?.productImages
                      ? `${import.meta.env.VITE_BASE_URL}/${
                          item.productId.productImages[0]?.path ||
                          item.productId.productImages[0]
                        }`
                      : item.productImages?.[0]?.path
                      ? `${import.meta.env.VITE_BASE_URL}/${
                          item.productImages[0].path
                        }`
                      : ""
                  }
                  alt="product"
                />
              </div>

              <div className="item-pricing" style={{ textAlign: "right" }}>
                <div>
                  <strong>
                    {currency} {fmtPrice(item.unitFinalPrice)}
                  </strong>{" "}
                  <small style={{ color: "#666" }}>× {item.qty}</small>
                </div>

                <div style={{ marginTop: 6 }}>
                  <span style={{ color: "#666", fontSize: 13 }}>
                    Original: {currency} {fmtPrice(item.productPrice)}
                  </span>
                </div>

                <div style={{ fontWeight: 700, marginTop: 6 }}>
                  Total: {currency} {fmtPrice(item.lineFinal)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* New clear pricing block for admin */}
        <div className="order-modal-totals" style={{ marginTop: 18 }}>
          <h4>Pricing breakdown</h4>

          <div className="order-modal-total-row">
            <span>Subtotal:</span>
            <strong>
              {currency}{" "}
              {fmtPrice(order.discountedPrice ?? backendSubTotalPrice)}
            </strong>
          </div>

          <div className="order-modal-total-row">
            <span>Tax ({taxPercent}%)</span>
            <strong>
              {currency} {fmtPrice(taxAmount)}
            </strong>
          </div>

          <div className="order-modal-total-row">
            <span>Total (computed):</span>
            <strong>
              {currency} {order.totalPrice.toLocaleString(undefined, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </strong>
          </div>
        </div>
      </div>

      <div className="order-modal-print-btn" style={{ marginTop: 18 }}>
        <button type="button" disabled={isDownloading} onClick={generatePDF}>
          {!isDownloading ? "Download Invoice" : "Downloading..."}
        </button>
      </div>
    </div>
  );
}
