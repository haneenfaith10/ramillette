import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import AdminAuthMiddleware from "../Middleware/AdminAuthMiddleware";
import Logo from "../assets/images/logo.png";

// Lazy load components
const AdminMainLayout = lazy(
  () => import("../Pages/AdminLayout/AdminMainLayout"),
);
const AdminDashboard = lazy(
  () => import("../Pages/AdminDashboard/AdminDashboard"),
);
const AdminUsers = lazy(() => import("../Pages/AdminUsers/AdminUsers"));
const AdminProductList = lazy(
  () => import("../Pages/AdminProductList/AdminProductList"),
);
const AddProduct = lazy(() => import("../Pages/AddProduct/AddProduct"));
const AddBrand = lazy(() => import("../Pages/AddBrand/AddBrand"));
const AdminProductEdit = lazy(
  () => import("../Pages/AdminProductEdit/AdminProductEdit"),
);
const AdminCategories = lazy(
  () => import("../Pages/AdminCategories/AdminCategories"),
);
const AddCategory = lazy(() => import("../Pages/AddCategory/AddCategory"));
const AdminLogin = lazy(() => import("../Pages/AdminLogin/AdminLogin"));
const BrandListPage = lazy(
  () => import("../Pages/BrandListPage/BrandListPage"),
);
const AddSettings = lazy(() => import("../Pages/Settings/AddSettings"));
const EditCategory = lazy(
  () => import("../Pages/AdminCategoryEdit/EditCategory"),
);
const AdminOrderPage = lazy(
  () => import("../Pages/AdminOrderPage/AdminOrderPage"),
);
const AdminConfigPage = lazy(
  () => import("../Pages/AdminConfigPage/AdminConfigPage"),
);
const CountryConfiguration = lazy(
  () =>
    import("../Components/Configuration/CountryConfiguration/CountryConfiguration"),
);
const AdminProductPreview = lazy(
  () => import("../Pages/AdminProductPreview/AdminProductPreview"),
);
const AdminAddBanner = lazy(
  () => import("../Pages/AdminAddBanner/AdminAddBanner"),
);
const AdminBannerList = lazy(
  () => import("../Pages/AdminBannerList/AdminBannerList"),
);
const AddVideoBanners = lazy(() => import("../Pages/Banners/AddVideoBanners"));
const AdminVideoBanner = lazy(
  () => import("../Pages/Banners/AdminVideoBanner"),
);
const ManageTaxPage = lazy(
  () => import("../Pages/ManageTaxPage/ManageTaxPage"),
);
const OrderDetailsPage = lazy(
  () => import("../Pages/OrderDetailsPage/OrderDetailsPage"),
);
const AdminUserDetails = lazy(
  () => import("../Pages/AdminUserDetails/AdminUserDetails"),
);
const AdminEditBanner = lazy(
  () => import("../Pages/AdminEditBanner/AdminEditBanner"),
);
const EditVideoBanner = lazy(() => import("../Pages/Banners/EditVideoBanner"));
const AdminSalesPage = lazy(
  () => import("../Pages/AdminSalesPage/AdminSalesPage"),
);
const AdminSocialLinks = lazy(
  () => import("../Pages/AdminSocialLinks/AdminSocialLinks"),
);
const AdminBestSeller = lazy(
  () => import("../Pages/AdminBestSeller/AdminBestSeller"),
);
const AdminBestSellerList = lazy(
  () => import("../Pages/AdminBestSellerList/AdminBestSellerList"),
);
const AdminEditBestSeller = lazy(
  () => import("../Pages/AdminEditBestSeller/AdminEditBestSeller"),
);
const NotFoundPage = lazy(() => import("../Pages/404Page/NotFoundPage"));
const CreateProductBadge = lazy(
  () => import("../Pages/CreateProductBadge/CreateProductBadge"),
);
const AdminBadgeList = lazy(
  () => import("../Pages/AdminBadgeList/AdminBadgeList"),
);
const ReviewManagement = lazy(
  () => import("../Pages/ReviewManagement/ReviewManagement"),
);
const ShippingProviderPage = lazy(
  () => import("../Pages/ShippingProviderPage/ShippingProviderPage"),
);
const CollectionAlertsPage = lazy(
  () => import("../Pages/CollectionAlertsPage/CollectionAlertsPage"),
);
const DiscountOfferPage = lazy(
  () => import("../Pages/DiscountOfferPage/DiscountOfferPage"),
);
const BogoOfferPage = lazy(
  () => import("../Pages/BogoOfferPage/BogoOfferPage"),
);
const CategoryOfferPage = lazy(
  () => import("../Pages/CategoryOfferPage/CategoryOfferPage"),
);
const CouponOfferPage = lazy(
  () => import("../Pages/CouponOfferPage/CouponOfferPage"),
);
const NewCustomerOfferPage = lazy(
  () => import("../Pages/NewCustomerOfferPage/NewCustomerOfferPage"),
);
const AdminCoupons = lazy(() => import("../Pages/AdminCoupons/AdminCoupons"));
const AddCoupon = lazy(() => import("../Pages/AddCoupon/AddCoupon"));

// Loading fallback component
const PageLoader = () => (
  <div className="app-loader">
    <img src={Logo} alt="Logo" />
  </div>
);

export default function AdminRoute() {
  return (
    <AdminAuthMiddleware>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route element={<AdminMainLayout />}>
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/users/:userId" element={<AdminUserDetails />} />
            <Route path="/products" element={<AdminProductList />} />
            <Route path="/add-new-product" element={<AddProduct />} />
            <Route
              path="/product-preview/:id"
              element={<AdminProductPreview />}
            />
            <Route path="/add-brand" element={<AddBrand />} />
            <Route path="/edit-product/:id" element={<AdminProductEdit />} />
            <Route path="/categories" element={<AdminCategories />} />
            <Route path="/add-category" element={<AddCategory />} />
            <Route path="/edit-category/:id" element={<EditCategory />} />
            <Route path="/brands" element={<BrandListPage />} />
            <Route path="/settings" element={<AddSettings />} />
            <Route path="/orders" element={<AdminOrderPage />} />
            <Route path="/config" element={<AdminConfigPage />} />
            <Route
              path="/config/countries"
              element={<CountryConfiguration />}
            />
            <Route path="/config/tax" element={<ManageTaxPage />} />
            <Route path="/config/social-links" element={<AdminSocialLinks />} />
            <Route
              path="/config/collection-alerts"
              element={<CollectionAlertsPage />}
            />

            <Route
              path="/config/shipping-provider"
              element={<ShippingProviderPage />}
            />

            <Route path="/addBanner" element={<AdminAddBanner />} />
            <Route path="/editBanner/:bannerId" element={<AdminEditBanner />} />
            <Route path="/banners" element={<AdminBannerList />} />
            <Route path="/add-video-banners" element={<AddVideoBanners />} />
            <Route path="/video-banners" element={<AdminVideoBanner />} />
            <Route
              path="/editVideoBanner/:bannerId"
              element={<EditVideoBanner />}
            />
            <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
            <Route path="/sales" element={<AdminSalesPage />} />
            <Route path="/create-best-seller" element={<AdminBestSeller />} />
            <Route path="/best-seller" element={<AdminBestSellerList />} />
            <Route
              path="/edit-best-seller/:id"
              element={<AdminEditBestSeller />}
            />
            <Route path="/create-badges" element={<CreateProductBadge />} />
            <Route
              path="/edit-badge/:badgeId"
              element={<CreateProductBadge />}
            />
            <Route path="/badges" element={<AdminBadgeList />} />
            <Route path="/reviews" element={<ReviewManagement />} />
            <Route path="/bogo-offers" element={<BogoOfferPage />} />
            <Route path="/discount-offers" element={<DiscountOfferPage />} />
            <Route path="/category-offers" element={<CategoryOfferPage />} />
            {/* <Route path="/coupon-offers" element={<CouponOfferPage />} /> */}
            <Route
              path="/new-customer-offers"
              element={<NewCustomerOfferPage />}
            />
            <Route path="/dynamic-coupons" element={<AdminCoupons />} />
            <Route path="/add-dynamic-coupon" element={<AddCoupon />} />
            <Route path="/edit-dynamic-coupon/:id" element={<AddCoupon />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AdminAuthMiddleware>
  );
}
