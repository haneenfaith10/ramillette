import { useEffect, useState } from "react";
import "./OrderStatusUpdate.css";
import { updateDeliveryStep } from "../../services/orderApiService";

const statusSteps = [
  "Order Placed",
  "Processing",
  "Packed",
  "Dispatched",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

export default function OrderStatusUpdate({
  currentStatus = "Processing",
  onClose,
  order,
  setUpdated,
}) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [deliverySteps, setDeliverySteps] = useState([]);
  const adminToken = localStorage.getItem("remilletAdminTkn");

  useEffect(() => {
    if (order && Object.keys(order).length > 0) {
      setDeliverySteps(order.deliverySteps);
    }
  }, [order]);

  const updateOrderStatus = async () => {
    if (selectedStatus) {
      const response = await updateDeliveryStep(order._id, selectedStatus,adminToken);
      if (response) {
        onClose();
        setUpdated((prev) => !prev);
      }
    }
  };

  return (
    <div className="status-modal-overlay">
      <div className="status-modal">
        <h2>Update Order Delivery Status</h2>
        <div className="status-steps">
          {statusSteps.map((step, index) => {
            const deliveryStep = deliverySteps.find((s) => s.status === step);
            const isCompleted = !!deliveryStep;
            const isSelected = selectedStatus === step;

            const stepIndex = statusSteps.indexOf(step);
            const currentIndex = statusSteps.indexOf(currentStatus);
            const isClickable = stepIndex <= currentIndex + 1; // Allow current and next only

            return (
              <div
                key={index}
                className={`step-item ${isSelected ? "selected" : ""} ${
                  isCompleted ? "completed" : ""
                } ${!isClickable ? "disabled" : ""}`}
                onClick={() => {
                  // if (isClickable) {

                    setSelectedStatus(step);
                  // }
                }}
              >
                <span className="step-dot" />
                <div className="step-info">
                  <span className="step-label">{step}</span>
                  {isCompleted && (
                    <span className="step-time">
                      {new Date(deliveryStep.updatedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="status-actions">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button onClick={() => updateOrderStatus()}>Update</button>
        </div>
      </div>
    </div>
  );
}
