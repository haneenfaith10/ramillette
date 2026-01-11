import Footer from "../../Components/Footer/Footer";
import NavBar from "../../Components/NavBar/NavBar";
import Topheader from "../../Components/TopHeader/TopHeader";
import "./Checkout.css";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get all path segments
  const pathSegments = location.pathname.split("/").filter((x) => x);
  
  // Extract country code (first segment) and remaining path
  const countryCode = pathSegments[0];
  const pathnames = pathSegments.slice(1); // Remove country code from pathnames

  const breadcrumbs = pathnames.map((value, index) => {
    // Reconstruct path with country code
    const to = `/${countryCode}/${pathnames.slice(0, index + 1).join("/")}`;
    const isLast = index === pathnames.length - 1;
    const formatted =
      value.charAt(0).toUpperCase() + value.slice(1).replace("-", " ");

    return isLast ? (
      <span key={to} style={{ fontWeight: 600 }}>
        {formatted}
      </span>
    ) : (
      <Link
        key={to}
        underline="hover"
        color="inherit"
        onClick={() => navigate(to)}
        style={{ cursor: "pointer" }}
      >
        {formatted}
      </Link>
    );
  });

  // Dynamic page title based on the last path segment
  const pageTitle =
    pathnames.length > 0
      ? pathnames[pathnames.length - 1]
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())
      : "Checkout";

  return (
    <div className="checkout-page-container">
      <Topheader />
      <NavBar />
      <div className="checkout-cart-header">
        <div className="checkout-cart-header-top">
          <Breadcrumbs
            separator="›"
            aria-label="breadcrumb"
            sx={{ color: "#fff", fontWeight: 500, cursor: "default" }}
          >
            <Link
              underline="hover"
              color="inherit"
              onClick={() => navigate(`/${countryCode}`)}
              style={{ cursor: "pointer" }}
            >
              Home
            </Link>
            {breadcrumbs}
          </Breadcrumbs>
          <h1 className="checkout-page-title">{pageTitle}</h1>
        </div>
      </div>
      <Outlet />
      <Footer/>
    </div>
  );
}
