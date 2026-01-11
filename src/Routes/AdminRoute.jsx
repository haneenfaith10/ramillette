import { Routes, Route } from "react-router-dom";
import AdminAuthMiddleware from "../Middleware/AdminAuthMiddleware";
import AdminMainLayout from "../Pages/AdminLayout/AdminMainLayout";
import AdminDashboard from "../Pages/AdminDashboard/AdminDashboard";
import AdminUsers from "../Pages/AdminUsers/AdminUsers";
import AdminProductList from "../Pages/AdminProductList/AdminProductList";
import AddProduct from "../Pages/AddProduct/AddProduct";
import AddBrand from "../Pages/AddBrand/AddBrand";
import AdminProductEdit from "../Pages/AdminProductEdit/AdminProductEdit";
import AdminCategories from "../Pages/AdminCategories/AdminCategories";
import AddCategory from "../Pages/AddCategory/AddCategory";
import AdminLogin from "../Pages/AdminLogin/AdminLogin";
import BrandListPage from "../Pages/BrandListPage/BrandListPage";
import AddSettings from "../Pages/Settings/AddSettings";
import EditCategory from "../Pages/AdminCategoryEdit/EditCategory";
import AdminOrderPage from "../Pages/AdminOrderPage/AdminOrderPage";
import AdminConfigPage from "../Pages/AdminConfigPage/AdminConfigPage";
import CountryConfiguration from "../Components/Configuration/CountryConfiguration/CountryConfiguration";
import AdminProductPreview from "../Pages/AdminProductPreview/AdminProductPreview";
import AdminAddBanner from "../Pages/AdminAddBanner/AdminAddBanner";
import AdminBannerList from "../Pages/AdminBannerList/AdminBannerList";
import AddVideoBanners from "../Pages/Banners/AddVideoBanners";
import AdminVideoBanner from "../Pages/Banners/AdminVideoBanner";
import ManageTaxPage from "../Pages/ManageTaxPage/ManageTaxPage";
import OrderDetailsPage from "../Pages/OrderDetailsPage/OrderDetailsPage";
import AdminUserDetails from "../Pages/AdminUserDetails/AdminUserDetails";
import AdminEditBanner from "../Pages/AdminEditBanner/AdminEditBanner";
import EditVideoBanner from "../Pages/Banners/EditVideoBanner";
import AdminSalesPage from "../Pages/AdminSalesPage/AdminSalesPage";
import AdminSocialLinks from "../Pages/AdminSocialLinks/AdminSocialLinks";
import AdminBestSeller from "../Pages/AdminBestSeller/AdminBestSeller";
import AdminBestSellerList from "../Pages/AdminBestSellerList/AdminBestSellerList";
import AdminEditBestSeller from "../Pages/AdminEditBestSeller/AdminEditBestSeller";
import NotFoundPage from "../Pages/404Page/NotFoundPage";
import CreateProductBadge from "../Pages/CreateProductBadge/CreateProductBadge";
import AdminBadgeList from "../Pages/AdminBadgeList/AdminBadgeList";
import ReviewManagement from "../Pages/ReviewManagement/ReviewManagement";
import ShippingProviderPage from "../Pages/ShippingProviderPage/ShippingProviderPage";
import CollectionAlertsPage from "../Pages/CollectionAlertsPage/CollectionAlertsPage";
import DiscountOfferPage from "../Pages/DiscountOfferPage/DiscountOfferPage";
import BogoOfferPage from "../Pages/BogoOfferPage/BogoOfferPage";
import CategoryOfferPage from "../Pages/CategoryOfferPage/CategoryOfferPage";
import CouponOfferPage from "../Pages/CouponOfferPage/CouponOfferPage";
import NewCustomerOfferPage from "../Pages/NewCustomerOfferPage/NewCustomerOfferPage";

export default function AdminRoute() {
  return (
    <AdminAuthMiddleware>
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
          <Route path="/config/countries" element={<CountryConfiguration />} />
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
          <Route path="/edit-badge/:badgeId" element={<CreateProductBadge />} />
          <Route path="/badges" element={<AdminBadgeList />} />
          <Route path="/reviews" element={<ReviewManagement />} />
          <Route path="/bogo-offers" element={<BogoOfferPage />} />
          <Route path="/discount-offers" element={<DiscountOfferPage />} />
          <Route path="/category-offers" element={<CategoryOfferPage />} />
          <Route path="/coupon-offers" element={<CouponOfferPage />} />
          <Route path="/new-customer-offers" element={<NewCustomerOfferPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AdminAuthMiddleware>
  );
}
