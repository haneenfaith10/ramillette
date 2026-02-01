import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useSelector } from "react-redux";
import UserAuthMiddleware from "../Middleware/UserAuthMiddleware";
import Logo from "../assets/images/logo.png";

// Lazy load components
const HomePage = lazy(() => import("../Pages/HomePage/HomePage"));
const Productlist = lazy(() => import("../Pages/Productlist/Productlist"));
const ProductInnerPage = lazy(
  () => import("../Pages/ProductInnerpage/ProductInnerPage"),
);
const LoginPage = lazy(() => import("../Pages/LoginPage/LoginPage"));
const RegisterPage = lazy(() => import("../Pages/RegisterPage/RegisterPage"));
const AboutPage = lazy(() => import("../Pages/AboutPage/AboutPage"));
const ContactPage = lazy(() => import("../Pages/ContactPage/ContactPage"));
const UserProfileWrapper = lazy(
  () => import("../Pages/UserProfileWrapper/UserProfileWrapper"),
);
const ProfileInfoSection = lazy(
  () => import("../Components/ProfileInfoSection/ProfileInfoSection"),
);
const WishlistSection = lazy(
  () => import("../Components/WishlistSection/WishlistSection"),
);
const DashAddressList = lazy(
  () => import("../Components/DashAddressList/DashAddressList"),
);
const OrdersTable = lazy(() => import("../Components/OrdersTable/OrdersTable"));
const CheckoutPage = lazy(() => import("../Pages/CheckoutPage/CheckoutPage"));
const CheckoutAddress = lazy(
  () => import("../Components/CheckoutAddress/CheckoutAddress"),
);
const Checkout = lazy(() => import("../Components/Checkout/Checkout"));
const OrderOverview = lazy(
  () => import("../Components/OrderOverView/OrderOverView"),
);
const Payment = lazy(() => import("../Components/Payement/Payment"));
const OrderSuccess = lazy(
  () => import("../Components/OrderSuccess/OrderSuccess"),
);
const UserOrderDetails = lazy(
  () => import("../Pages/UserOrderDetails/UserOrderDetails"),
);
const ForgetPasswordPage = lazy(
  () => import("../Pages/ForgetPasswordPage/ForgetPasswordPage"),
);
const PurchaseSingleItem = lazy(
  () => import("../Pages/PurchaseSingleItem/PurchaseSingleItem"),
);
const PaymentSingleProduct = lazy(
  () => import("../Pages/PaymentSingleProduct/PaymentSingleProduct"),
);
const NotFoundPage = lazy(() => import("../Pages/404Page/NotFoundPage"));
const TermsAndPolicies = lazy(
  () => import("../Pages/TermsAndPolicies/TermsAndPolicies"),
);

// Loading fallback component
const PageLoader = () => (
  <div className="app-loader">
    <img src={Logo} alt="Logo" />
  </div>
);

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
    <Suspense fallback={<PageLoader />}>
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
          <Route path="order/:orderId" element={<UserOrderDetails />} />
        </Route>

        {/* {setTimeout(() => {
          <Route path="*" element={<NotFoundPage />} />;
        }, 1000)} */}
      </Routes>
    </Suspense>
  );
}
