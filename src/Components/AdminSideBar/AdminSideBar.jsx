import { useLocation, useNavigate } from "react-router-dom";
import "./AdminSideBar.css";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import {
  MdOutlineKeyboardArrowRight,
  MdKeyboardArrowDown,
} from "react-icons/md";

const navLinks = [
  {
    name: "Dashboard",
    link: "/admin/dashboard",
  },
  {
    name: "Users",
    link: "/admin/users",
  },
  {
    name: "Products",
    subLinks: [
      { name: "All Products", link: "/admin/products" },
      { name: "Add New Product", link: "/admin/add-new-product" },
    ],
  },
  {
    name: "Categories",
    subLinks: [
      { name: "All Categories", link: "/admin/categories" },
      { name: "Add Category", link: "/admin/add-category" },
    ],
  },
  {
    name: "Banners",
    subLinks: [
      { name: "All Banners", link: "/admin/banners" },
      { name: "Add Banner", link: "/admin/addBanner" },
    ],
  },
  {
    name: "Video Banners",
    subLinks: [
      { name: "All Banners", link: "/admin/video-banners" },
      { name: "Create Banner", link: "/admin/add-video-banners" },
    ],
  },
  {
    name: "Best Seller videos",
    subLinks: [
      { name: "All ", link: "/admin/best-seller" },
      { name: "Create Best seller", link: "/admin/create-best-seller" },
    ],
  },
  {
    name: "Feature Badges",
    subLinks: [
      {
        name: "All Badges",
        link: "/admin/badges",
      },
      { name: "Create Badges", link: "/admin/create-badges" },
    ],
  },
  {
    name: "Offers",
    subLinks: [
      {
        name: "Common Discount Offers",
        link: "/admin/discount-offers",
      },
      {
        name: "Buy One Get One",
        link: "/admin/bogo-offers",
      },
      {
        name: "Category Offers",
        link: "/admin/category-offers",
      },
      {
        name: "New Customer Offers",
        link: "/admin/new-customer-offers",
      },
    ],
  },
  {
    name: "Reviews",
    link: "/admin/reviews",
  },
  {
    name: "Orders",
    link: "/admin/orders",
  },
  {
    name: "sales",
    link: "/admin/sales",
  },
  {
    name: "Settings",
    link: "/admin/settings",
  },
  {
    name: "Configuration",
    link: "/admin/config",
  },
  {
    name: "Dynamic Coupons",
    subLinks: [
      { name: "Manage Coupons", link: "/admin/dynamic-coupons" },
      { name: "Create Coupon", link: "/admin/add-dynamic-coupon" },
    ],
  },
  {
    name: "Logout",
  },
];

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#ffffff",
  borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
  p: 4,
  outline: "none",
  border: "1px solid rgba(237, 200, 98, 0.3)", // Gold tint border
};

export default function AdminSideBar() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openTabs, setOpenTabs] = useState({});
  const location = useLocation().pathname;

  function handleClose() {
    setShowLogoutModal(false);
  }

  useEffect(() => {
    navLinks.forEach((item) => {
      if (item.subLinks?.some((sub) => sub.link === location)) {
        setOpenTabs({ [item.name]: true }); // ensures only 1 opens on load
      }
    });
  }, [location]);

  function LogoutModal() {
    function handleLogout() {
      localStorage.removeItem("remilletAdminTkn");
      navigate("/admin/login");
    }

    return (
      <Modal
        open={showLogoutModal}
        onClose={handleClose}
        aria-labelledby="logout-modal-title"
        aria-describedby="logout-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="logout-modal-title"
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 700,
              color: "#3d3d3d",
              textAlign: "center",
              mb: 1,
            }}
          >
            Confirm Logout
          </Typography>
          <Typography
            id="logout-modal-description"
            sx={{
              textAlign: "center",
              color: "#7a7a7a",
              mb: 4,
              fontSize: "0.95rem",
            }}
          >
            Are you sure you want to log out of the admin panel?
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Button
              onClick={handleClose}
              sx={{
                color: "#7a7a7a",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: "8px 24px",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                  borderColor: "#d5d5d5",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              sx={{
                backgroundColor: "#edc862", // Gold
                color: "#fff",
                borderRadius: "8px",
                padding: "8px 24px",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 4px 10px rgba(237, 200, 98, 0.3)",
                "&:hover": {
                  backgroundColor: "#d4b458",
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Modal>
    );
  }

  // Toggle submenu open/close
  const toggleSubmenu = (name) => {
    setOpenTabs((prev) => {
      if (prev[name]) {
        return {}; // close if already open
      }
      return { [name]: true }; // open only this sub menu
    });
  };
  return (
    <div className="admin-side-bar-container">
      <div className="dashboard-title-container">
        <p className="dashboard-title">Admin Dashboard</p>
      </div>
      <LogoutModal showLogoutModal={showLogoutModal} />
      <div className="admin-side-bar-nav-container">
        <div className="admin-side-bar-nav">
          {navLinks.map((item, index) => {
            const hasSubLinks = Array.isArray(item.subLinks);
            const isActiveParent = item.link === location;
            const isActiveSub =
              hasSubLinks && item.subLinks.some((sub) => sub.link === location);

            return (
              <div
                key={index}
                className={`admin-side-bar-nav-item ${
                  isActiveParent ? "active" : isActiveSub ? "active-parent" : ""
                }`}
              >
                <p
                  className={`admin-side-bar-nav-link ${
                    isActiveParent
                      ? "active"
                      : isActiveSub
                        ? "active-parent"
                        : ""
                  }`}
                  onClick={() => {
                    if (item.name === "Logout") {
                      setShowLogoutModal(true);
                    } else if (hasSubLinks) {
                      toggleSubmenu(item.name);
                    } else if (item.link) {
                      navigate(item.link);
                    }
                  }}
                >
                  {item.name}
                  {hasSubLinks && (
                    <span style={{ marginLeft: 8 }}>
                      {openTabs[item.name] ? (
                        <MdKeyboardArrowDown />
                      ) : (
                        <MdOutlineKeyboardArrowRight />
                      )}
                    </span>
                  )}
                </p>

                {hasSubLinks && openTabs[item.name] && (
                  <div className="admin-side-bar-subnav">
                    {item.subLinks.map((sub, subIndex) => (
                      <p
                        key={subIndex}
                        className={`admin-side-bar-subnav-link ${
                          sub.link === location ? "active" : ""
                        }`}
                        onClick={() => navigate(sub.link)}
                      >
                        {sub.name}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
