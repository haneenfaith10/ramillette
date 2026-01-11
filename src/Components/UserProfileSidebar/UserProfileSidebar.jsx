import "./UserProfileSidebar.css"; // Optional: for custom CSS styling
import {
  FaBoxOpen,
  FaHeart,
  FaTicketAlt,
  FaUser,
  FaMapMarkerAlt,
  FaCreditCard,
} from "react-icons/fa";
import { RiLogoutCircleLine } from "react-icons/ri";
import userAvatar from "../../assets/images/userAvathar.jpg";
import { useDispatch, useSelector } from "react-redux";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../redux/slices/userSlice";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "10px",
  p: 4,
};

export default function UserProfileSidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation().pathname.split(" ").pop();
  const userData = useSelector((state) => state.user.user);
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const orderCount = useSelector((state) => state.user.orderCount);
  const selectedCountry = useSelector((state) => state?.user?.selectedCountry);

  const handleLogout = () => {
    setOpenLogoutModal(false);
    dispatch(logout());
    localStorage.removeItem("remilletteTkn");
    navigate("/login");
  };

  return (
    <div className="user-profile-sidebar">
      <div className="profile-section">
        <div className="profile-image-wrapper">
          <img
            src={
              userData?.userImage
                ? `${import.meta.env.VITE_BASE_URL}/${userData.userImage}`
                : userAvatar
            }
            alt="User"
            className="profile-image"
          />
        </div>
        <div className="profile-info">
          <h3>
            {userData && userData.firstName
              ? `${userData.firstName} ${userData.lastName}`
              : ""}
          </h3>
          <p className="email">{userData.email ? userData?.email : ""}</p>
        </div>
      </div>

      <div className="menu-section">
        <p className="section-title">Dashboard</p>
        <ul className="Dash-menu-list">
          <li
            className={`Dash-menu-item ${
              location === `/${selectedCountry.code}/profile/orders`
                ? "active"
                : ""
            }`}
            onClick={() => {
              navigate(`/${selectedCountry.code}/profile/orders`);
              setTimeout(() => {
                const el = document.getElementById("orders-section");
                if (el) {
                  const headerOffset = 100; // <- adjust this value to move position down/up
                  const elementPosition =
                    el.getBoundingClientRect().top + window.pageYOffset;
                  const offsetPosition = elementPosition - headerOffset;

                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }, 200);
            }}
          >
            <FaBoxOpen className="icon" />
            <span>Orders</span>
            <span className="item-count">{orderCount ? orderCount : 0}</span>
          </li>
          <li
            className={`Dash-menu-item ${
              location === `/${selectedCountry.code}/profile/wishlist`
                ? "active"
                : ""
            }`}
            onClick={() => {
              navigate(`/${selectedCountry.code}/profile/wishlist`);
              setTimeout(() => {
                const el = document.getElementById("wishlist-section");
                if (el) {
                  const headerOffset = 100; // <- adjust this value to move position down/up
                  const elementPosition =
                    el.getBoundingClientRect().top + window.pageYOffset;
                  const offsetPosition = elementPosition - headerOffset;

                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }, 200);
            }}
          >
            <FaHeart className="icon" />
            <span>Wishlist</span>
            <span className="item-count">
              {userData.wishlist ? userData.wishlist.length : ""}
            </span>
          </li>
        </ul>
      </div>

      <div className="Dash-menu-section">
        <p className="section-title">Account settings</p>
        <ul className="Dash-menu-list">
          <li
            className={`Dash-menu-item  ${
              location === `/${selectedCountry.code}/profile/details`
                ? "active"
                : ""
            }`}
            onClick={() => {
              navigate(`/${selectedCountry.code}/profile/details`);
              setTimeout(() => {
                const el = document.getElementById("profile-section");
                if (el) {
                  const headerOffset = 100; // <- adjust this value to move position down/up
                  const elementPosition =
                    el.getBoundingClientRect().top + window.pageYOffset;
                  const offsetPosition = elementPosition - headerOffset;

                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }, 200);
            }}
          >
            <FaUser className="icon" />
            <span>Profile info</span>
          </li>
          <li
            className="Dash-menu-item"
            onClick={() => {
              navigate(`/${selectedCountry.code}/profile/addresses`);
              setTimeout(() => {
                const el = document.getElementById("addresses-section");
                if (el) {
                  const headerOffset = 100; // <- adjust this value to move position down/up
                  const elementPosition =
                    el.getBoundingClientRect().top + window.pageYOffset;
                  const offsetPosition = elementPosition - headerOffset;

                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }, 200);
            }}
          >
            <FaMapMarkerAlt className="icon" />
            <span>Addresses</span>
          </li>
          <li
            className="Dash-menu-item"
            onClick={() => navigate(`/${selectedCountry.code}/checkout`)}
          >
            <FaCreditCard className="icon" />
            <span>Checkout</span>
          </li>
          <li
            className="Dash-menu-item"
            onClick={() => setOpenLogoutModal(true)}
          >
            <RiLogoutCircleLine className="icon" />
            <span>Log out</span>
          </li>
          <Modal
            open={openLogoutModal}
            onClose={() => setOpenLogoutModal(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <h2 id="modal-modal-title">Confirm Logout</h2>
              <p id="modal-modal-description">
                Are you sure you want to log out?
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "2rem",
                  gap: "1rem",
                }}
              >
                <button
                  onClick={() => setOpenLogoutModal(false)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ccc",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#d32f2f",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Logout
                </button>
              </div>
            </Box>
          </Modal>
        </ul>
      </div>
    </div>
  );
}
