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
      <AdminHeader title="User Details" />
      {user ? (
        <>
          <div className="user-detail-card">
            <img
              src={`${import.meta.env.VITE_BASE_URL}/${user.userImage}`}
              alt="User"
              className="user-detail-img"
              onError={(e)=>e.currentTarget.src=UserProfile}
            />
            <div className="user-detail-row">
              <span className="label">Name:</span>
              <span>
                {user.firstName} {user.lastName}
              </span>
            </div>
            <div className="user-detail-row">
              <span className="label">Email:</span>
              <span>{user.email}</span>
            </div>
            <div className="user-detail-row">
              <span className="label">Phone:</span>
              <span>{user.phone}</span>
            </div>
            <div className="user-detail-row">
              <span className="label">Status:</span>
              <span
                className={user.status ? "status-active" : "status-inactive"}
              >
                {user.status ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="user-detail-row">
              <span className="label">Joined:</span>
              <span>{new Date(user.createdAt).toLocaleString()}</span>
            </div>
            <div className="user-detail-row">
              <span className="label">Updated:</span>
              <span>{new Date(user.updatedAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="user-orders-section">
            <h3>Ordered Products</h3>
            <h4 style={{marginBottom:"1rem"}}>Total Orders : {orders.length}</h4>
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
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <button className="toggle-button">
                        {isExpanded ? "Collapse" : "Expand"}
                      </button>
                    </div>
                    {isExpanded && (
                      <>
                        <div className="order-meta">
                          <span>
                            <strong>Status:</strong> {order.status}
                          </span>
                          <span>
                            <strong>Paid:</strong> {order.isPaid ? "Yes" : "No"}
                          </span>
                          <span>
                            <strong>Delivered:</strong>{" "}
                            {order.isDelivered ? "Yes" : "No"}
                          </span>
                          <span>
                            <strong>Total:</strong> ₹{order.totalPrice}
                          </span>
                        </div>
                        {order.orderItems.map((item, i) => (
                          <div key={i} className="order-product-row">
                            <img
                              src={`${import.meta.env.VITE_BASE_URL}/${
                                item.productId?.productImages?.[0].path
                              }`}
                              alt={item.productId?.productName}
                            />
                            <div>
                              <p>
                                <strong>{item.productId?.productName}</strong>
                              </p>
                              <p>Qty: {item.qty}</p>
                              <p>Price: ₹{item.productPrice}</p>
                              <p>Discount: {item.productDiscount}%</p>
                              <p>Final Price: ₹{item.finalPrice}</p>
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
