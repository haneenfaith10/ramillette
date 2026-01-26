import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import HomePage from "../Pages/HomePage/HomePage";
import Productlist from "../Pages/Productlist/Productlist";
import ProductInnerPage from "../Pages/ProductInnerpage/ProductInnerPage";
import LoginPage from "../Pages/LoginPage/LoginPage";
import RegisterPage from "../Pages/RegisterPage/RegisterPage";
import AboutPage from "../Pages/AboutPage/AboutPage";
import ContactPage from "../Pages/ContactPage/ContactPage";

import UserProfileWrapper from "../Pages/UserProfileWrapper/UserProfileWrapper";
import ProfileInfoSection from "../Components/ProfileInfoSection/ProfileInfoSection";
import WishlistSection from "../Components/WishlistSection/WishlistSection";
import DashAddressList from "../Components/DashAddressList/DashAddressList";
import OrdersTable from "../Components/OrdersTable/OrdersTable";

import UserAuthMiddleware from "../Middleware/UserAuthMiddleware";

import CheckoutPage from "../Pages/CheckoutPage/CheckoutPage";
import CheckoutAddress from "../Components/CheckoutAddress/CheckoutAddress";
import Checkout from "../Components/Checkout/Checkout";
import OrderOverview from "../Components/OrderOverView/OrderOverView";
import Payment from "../Components/Payement/Payment";
import OrderSuccess from "../Components/OrderSuccess/OrderSuccess";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import UserOrderDetails from "../Pages/UserOrderDetails/UserOrderDetails";
import ForgetPasswordPage from "../Pages/ForgetPasswordPage/ForgetPasswordPage";
import PurchaseSingleItem from "../Pages/PurchaseSingleItem/PurchaseSingleItem";
import PaymentSingleProduct from "../Pages/PaymentSingleProduct/PaymentSingleProduct";
import NotFoundPage from "../Pages/404Page/NotFoundPage";
import TermsAndPolicies from "../Pages/TermsAndPolicies/TermsAndPolicies";
import Logo from "../assets/images/logo.png";

export default function UserRoute() {
  const navigate = useNavigate();
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);
  const countryCode = pathParts[0];

  const isAuthRoute =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/forgetPassword");

  const shouldRedirect =
    selectedCountry?.code &&
    !isAuthRoute &&
    countryCode?.toLowerCase() !== selectedCountry.code.toLowerCase();

  useEffect(() => {
    if (shouldRedirect) {
      navigate(`/${selectedCountry.code}`, { replace: true });
    }
  }, [shouldRedirect, navigate, selectedCountry]);

  if (shouldRedirect) {
    // Block rendering while redirecting
    return null;
  }

  return (
    <Routes>
      {/* Global routes (not country-specific) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgetPassword" element={<ForgetPasswordPage />} />

      {/* Country-specific routes */}
      <Route path="/:countryCode">
        <Route index element={<HomePage />} />
        <Route path="product-list" element={<Productlist />} />
        <Route path="product-inner/:id" element={<ProductInnerPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="terms-and-policies" element={<TermsAndPolicies />} />

        <Route
          element={
            <UserAuthMiddleware>
              <UserProfileWrapper />
            </UserAuthMiddleware>
          }
        >
          <Route path="profile/details" element={<ProfileInfoSection />} />
          <Route path="profile/wishlist" element={<WishlistSection />} />
          <Route path="profile/addresses" element={<DashAddressList />} />
          <Route path="profile/orders" element={<OrdersTable />} />
        </Route>

        <Route
          element={
            <UserAuthMiddleware>
              <CheckoutPage />
            </UserAuthMiddleware>
          }
        >
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout/address" element={<CheckoutAddress />} />
          <Route path="checkout/payment" element={<Payment />} />
          <Route path="checkout/success" element={<OrderSuccess />} />
        </Route>

        <Route path="order/:orderId" element={<UserOrderDetails />} />
        <Route path="checkout-single" element={<PurchaseSingleItem />} />
        <Route
          path="payment-single-checkout"
          element={<PaymentSingleProduct />}
        />
      </Route>

      {/* {setTimeout(() => {
        <Route path="*" element={<NotFoundPage />} />;
      }, 1000)} */}
    </Routes>
  );
}
