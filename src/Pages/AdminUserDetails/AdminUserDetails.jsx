import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSingleUser } from "../../services/adminApiServices";
import "./AdminUserDetails.css";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import UserProfile from "../../assets/images/userAvathar.jpg";

export default function AdminUserDetails() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState([]);

  useEffect(() => {
    if (userId) {
      (async () => {
        const data = await getSingleUser(userId);
        if (data) {
          setUserData(data);
        }
      })();
    }
  }, [userId]);

  const { user, orders } = userData || {};

  const toggleOrderCollapse = (orderId) => {
    setExpandedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  return (
    <div className="admin-user-detail-container">
      <AdminHeader title="User Profile Details" />
      {user ? (
        <>
          <div className="user-detail-card">
            <img
              src={`${import.meta.env.VITE_BASE_URL}/${user.userImage}`}
              alt="User"
              className="user-detail-img"
              onError={(e) => (e.currentTarget.src = UserProfile)}
            />
            <div className="user-info-grid">
              <div className="user-detail-row">
                <span className="label">Full Name</span>
                <span>
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <div className="user-detail-row">
                <span className="label">Email Address</span>
                <span>{user.email}</span>
              </div>
              <div className="user-detail-row">
                <span className="label">Phone Number</span>
                <span>{user.phone || "N/A"}</span>
              </div>
              <div className="user-detail-row">
                <span className="label">Account Status</span>
                <span className={`status-badge ${user.status ? "active" : "inactive"}`}>
                  {user.status ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="user-detail-row">
                <span className="label">Member Since</span>
                <span>{new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              </div>
              <div className="user-detail-row">
                <span className="label">Last Updated</span>
                <span>{new Date(user.updatedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              </div>
            </div>
          </div>

          <div className="user-orders-section">
            <h3>Recent Orders</h3>
            <h4>Total Orders Activity: {orders.length}</h4>
            {orders && orders.length > 0 ? (
              orders.map((order, index) => {
                const isExpanded = expandedOrderIds.includes(order._id);
                return (
                  <div key={order._id} className="user-order-card">
                    <div
                      className="order-header"
                      onClick={() => toggleOrderCollapse(order._id)}
                    >
                      <p>
                        <strong>Order #{index + 1}</strong> –{" "}
                        {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                      <button className="toggle-button">
                        {isExpanded ? "Hide Details" : "View Details"}
                      </button>
                    </div>
                    {isExpanded && (
                      <>
                        <div className="order-meta">
                          <div>
                            <strong>Order Status</strong>
                            <span className="price-tag">{order.status}</span>
                          </div>
                          <div>
                            <strong>Payment Status</strong>
                            <span>{order.isPaid ? "Paid" : "Pending"}</span>
                          </div>
                          <div>
                            <strong>Delivery</strong>
                            <span>{order.isDelivered ? "Delivered" : "In Transit"}</span>
                          </div>
                          <div>
                            <strong>Total Amount</strong>
                            <span className="price-tag">₹{order.totalPrice}</span>
                          </div>
                        </div>
                        {order.orderItems.map((item, i) => (
                          <div key={i} className="order-product-row">
                            <img
                              src={`${import.meta.env.VITE_BASE_URL}/${item.productId?.productImages?.[0].path
                                }`}
                              alt={item.productId?.productName}
                              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/80")}
                            />
                            <div className="product-info">
                              <p className="product-name">
                                {item.productId?.productName}
                              </p>
                              <p>Quantity: {item.qty} | Base Price: ₹{item.productPrice}</p>
                              <p>Discount: {item.productDiscount}% | <span className="price-tag">Final: ₹{item.finalPrice}</span></p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                );
              })
            ) : (
              <p>No orders placed yet.</p>
            )}
          </div>
        </>
      ) : (
        <p>Loading user details...</p>
      )}
    </div>
  );
}

