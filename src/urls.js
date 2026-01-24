const serverUrl = import.meta.env.VITE_BASE_URL;

// user urls
export const registerUserUrl = serverUrl + "/api/user/register";
export const loginUserUrl = serverUrl + "/api/user/login";
export const getAllProductsForUserUrl =
  serverUrl + "/api/user/getUserBulkProduct";
export const getLatestProductUrl = serverUrl + "/api/user/getLatestProduct";
export const getUserDetailsUrl = serverUrl + "/api/user/getUserDetails";
export const updateUserProfileUrl = serverUrl + "/api/user/updateUserProfile";
export const addAddressUrl = serverUrl + "/api/user/addAddress";
export const getUserAddressesUrl = serverUrl + "/api/user/getAddresses";
export const editAddressUrl = serverUrl + "/api/user/editAddress";
export const deleteAddressUrl = serverUrl + "/api/user/deleteAddress";
export const getOtpUrl = serverUrl + "/api/user/getOtp";
export const getOtpForForgetPasswordUrl =
  serverUrl + "/api/user/getOtpForForgetPassword";
export const verifyOtpUrl = serverUrl + "/api/user/verifyOtp";
export const changePasswordUrl = serverUrl + "/api/user/changePassword";
export const isProductAvailableUrl = serverUrl + "/api/user/isProductAvailable";
export const getUserCountrySpecificDataUrl =
  serverUrl + "/api/user/getUserCountrySpecificData";
export const toggleUserStatusUrl = serverUrl + "/api/user/toggleUserStatus";
export const getRelatedProductUrl = serverUrl + "/api/user/getRelatedProduct";
export const permanentlyBlockUserUrl =
  serverUrl + "/api/user/permanentlyBlockUser";

// Admin urls
export const addProductUrl = serverUrl + "/api/admin/products/addProduct";
export const getAllProductsUrl =
  serverUrl + "/api/admin/products/getAllProducts";
export const getSingleProductUrl =
  serverUrl + "/api/admin/products/getSingleProduct";
export const deleteProductUrl = serverUrl + "/api/admin/products/deleteProduct";
export const updateProductUrl =
  serverUrl + "/api/admin/products/updateProductStatus";
export const adminRegisterUrl = serverUrl + "/api/admin/register";
export const adminLoginUrl = serverUrl + "/api/admin/login";
export const getAllUsersUrl = serverUrl + "/api/admin/getUsers";
export const dashboardOverviewUrl = serverUrl + "/api/admin/dashboardOverview";
export const getSalesChartUrl = serverUrl + "/api/admin/getSalesChart";
export const getSingleUserUsl = serverUrl + "/api/admin/getSingleUser";
export const getSingleProductDetailsUrl =
  serverUrl + "/api/admin/getSingleProductDetails";
export const changeProductDataUrl =
  serverUrl + "/api/admin/products/updateProduct";
export const getBestSellingProductsUrl =
  serverUrl + "/api/admin/products/getBestSellingProducts";

// wishlist urls
export const addToWishlistUrl = serverUrl + "/api/user/addToWishlist";
export const removeFromWishListUrl = serverUrl + "/api/user/removeFromWishlist";
export const getUserWishlistUrl = serverUrl + "/api/user/getUserWishlist";
export const getUserWishlistDetailsUrl =
  serverUrl + "/api/user/getUserWishlistDetails";
export const getUserWishlistDataUrl =
  serverUrl + "/api/user/getUserWishlistData";

// cart urls
export const addToCartUrl = serverUrl + "/api/user/addToCart";
export const removeCartItemUrl = serverUrl + "/api/user/removeCartItem";
export const updateCartItemQuantityUrl = serverUrl + "/api/user/updateQuantity";
export const addToCartWithQuantityUrl =
  serverUrl + "/api/user/addToCartWithQuantity";
export const changeCartQuantityUrl = serverUrl + "/api/user/changeCartQuantity";

// category urls
export const addCategoryUrl = serverUrl + "/api/category/addCategory";
export const getCategoriesUrl = serverUrl + "/api/category/getCategories";
export const getActiveCategoriesUrl =
  serverUrl + "/api/category/getActiveCategories";
export const getCategoryByIdUrl = serverUrl + "/api/category";
export const editCategoryUrl = serverUrl + "/api/category/editCategory";
export const deleteCategoryUrl = serverUrl + "/api/category/deleteCategory";
export const toggleCategoryStatusUrl =
  serverUrl + "/api/category/toggleCategoryStatus";

// brand urls
export const crateNewBrandUrl = serverUrl + "/api/brand/postBrand";
export const getBrandsUrl = serverUrl + "/api/brand/getBrands";
export const changeBrandStatusUrl = serverUrl + "/api/brand/changeBrandStatus";
export const deleteBrandUrl = serverUrl + "/api/brand/deleteBrand";
export const updateBrandDetailsUrl =
  serverUrl + "/api/brand/updateBrandDetails";

// settings  urls
export const saveSettingsUrl = serverUrl + "/api/settings/save";
export const getSettingsUrl = serverUrl + "/api/settings/get-data";
export const postContactFormDataUrl =
  serverUrl + "/api/settings/postContactFormData";

// order Urls
export const placeOrderUrl = serverUrl + "/api/order/placeOrder";
export const getUserOrdersUrls = serverUrl + "/api/order/getUserOrders";
export const getAllOrdersUrl = serverUrl + "/api/order/getAllOrders";
export const updateOrderStatusUrl = serverUrl + "/api/order/updateOrderStatus";
export const getOrderDetailsUrl = serverUrl + "/api/order/getOrderDetails";
export const cancelOrderUrl = serverUrl + "/api/order/cancelOrder";
export const placeSingleOrderUrl = serverUrl + "/api/order/placeSingleOrder";
export const updateShippingDetailsUrl =
  serverUrl + "/api/order/updateShippingDetails";
export const cancelOrderByAdminUrl =
  serverUrl + "/api/order/cancelOrderByAdmin";
export const updateDeliveryStepUrl =
  serverUrl + "/api/order/updateDeliveryStep";
export const bulkOrderStatusUpdateUrl =
  serverUrl + "/api/order/bulkOrderStatusUpdate";

// country urls
export const createCountryUrl = serverUrl + "/api/country/createCountry";
export const getCountriesUrl = serverUrl + "/api/country/getCommunities";
export const updateCountryUrl = serverUrl + "/api/country/updateCountry";
export const deleteCountryUrl = serverUrl + "/api/country/deleteCountry";
export const toggleCountryStatusUrl = serverUrl + "/api/country/toggleStatus";
export const getActiveCountriesUrl =
  serverUrl + "/api/country/getActiveCountries";
export const setPrimaryCountryUrl = serverUrl + "/api/country/setPrimary";
export const getCountryBasedProductsUrl =
  serverUrl + "/api/country/getCountryBasedProducts";

// banner urls
export const createBannerUrl = serverUrl + "/api/banner/crateBanner";
export const getAllBannersUrl = serverUrl + "/api/banner/getAllBanners";
export const getBannerForUserUrl = serverUrl + "/api/banner/getBannerForUser";
export const deleteBannerUrl = serverUrl + "/api/banner/deleteBanner";
export const getBannerByIdUrl = serverUrl + "/api/banner/getBannerById";
export const updateBannerDetailsUrl =
  serverUrl + "/api/banner/updateBannerDetails";
export const toggleBannerStatusUrl =
  serverUrl + "/api/banner/toggleBannerStatus";

// video banner urls
export const createVideoBannerUrl =
  serverUrl + "/api/videoBanner/addVideoBanner";
export const getVideoBannersUrl =
  serverUrl + "/api/videoBanner/getVideoBanners";
export const getVideoBannerForUserUrl =
  serverUrl + "/api/videoBanner/getVideoBannerForUser";
export const deleteVideoBannerUrl =
  serverUrl + "/api/videoBanner/deleteVideoBanner";
export const getVideoBannerByIdUrl =
  serverUrl + "/api/videoBanner/getVideoBannerById";
export const updateVideoBannerUrl =
  serverUrl + "/api/videoBanner/updateVideoBanner";
export const changeVideoBannerStatusUrl =
  serverUrl + "/api/videoBanner/changeVideoBannerStatus";

// tax urls
export const updateCountryTaxUrl = serverUrl + "/api/tax/updateCountryTax";
export const getTaxByCountryUrl = serverUrl + "/api/tax/getTaxByCountry";

// sales urls
export const getSalesDataUrl = serverUrl + "/api/admin/getSalesData";

// rating urls
export const postRatingsUrl = serverUrl + "/api/review/postReview";
export const getProductReviewsUrl = serverUrl + "/api/review/getProductReviews";
export const getAllReviewsUrl = serverUrl + "/api/review/getAllReviews";
export const getAllReviewsForAdminUrl =
  serverUrl + "/api/review/getAllReviewsForAdmin";
export const updateReviewStatusUrl =
  serverUrl + "/api/review/updateReviewStatus";

// social links url
export const postSocialLinksUrl =
  serverUrl + "/api/socialLinks/postSocialLinks";
export const getSocialMediaLinksUrl =
  serverUrl + "/api/socialLinks/getSocialMediaLinks";

// best seller urls
export const postBestSellerUrl = serverUrl + "/api/bestSeller/postBestSeller";
export const getAllBestSellerUrl =
  serverUrl + "/api/bestSeller/getAllBestSeller";
export const deleteBestSellerUrl =
  serverUrl + "/api/bestSeller/deleteBestSeller";
export const getBestSellerByIdUrl =
  serverUrl + "/api/bestSeller/getBestSellerById";
export const updateBestSellerUrl =
  serverUrl + "/api/bestSeller/updateBestSeller";
export const getBestSellerForUserUrl =
  serverUrl + "/api/bestSeller/getBestSellerForUser";

// sub cart Urls
export const getUserSubCartUrl = serverUrl + "/api/user/getUserSubCart";

// search url
export const searchProductUrl = serverUrl + "/api/admin/products/search";
export const getSearchResultUrl =
  serverUrl + "/api/admin/products/getSearchResult";

// badge routes
export const createBadgeUrl = serverUrl + "/api/badge/createBadge";
export const getAllBadgesUrl = serverUrl + "/api/badge/getAllBadges";
export const getBadgeDetailsUrl = serverUrl + "/api/badge/getBadgeDetails";
export const updateBadgeUrl = serverUrl + "/api/badge/updateBadge";
export const deleteBadgeUrl = serverUrl + "/api/badge/deleteBadge";

// shipping provider urls
export const createProviderUrl = serverUrl + "/api/providers/createProvider";
export const getAllActiveProvidersUrl =
  serverUrl + "/api/providers/getAllActiveProviders";
export const getAllProvidersUrl = serverUrl + "/api/providers/getAllProviders";
export const deleteProviderUrl = serverUrl + "/api/providers/deleteProvider";
export const updateProviderUrl = serverUrl + "/api/providers/updateProvider";

// alert urls
export const createAlertUrl = serverUrl + "/api/alerts/createAlert";
export const getCountryAlertsUrl = serverUrl + "/api/alerts/getCountryAlert";
export const updateCollectionAlertUrl =
  serverUrl + "/api/alerts/updateCollectionAlert";
export const deleteCollectionAlertUrl =
  serverUrl + "/api/alerts/deleteCollectionAlert";

// offers urls
export const createOfferUrl = serverUrl + "/api/offers/createOffer";
export const deleteOfferUrl = serverUrl + "/api/offers/deleteOffer";
export const fetchCommonOfferUrl = serverUrl + "/api/offers/fetchCommonOffer";
export const editOfferUrl = serverUrl + "/api/offers/editOffer";
// filter url
export const filterOrderCancelledUserUrl =
  serverUrl + "/api/admin/filterOrderCancelledUser";
export const createDiscountOfferUrl =
  serverUrl + "/api/offers/createDiscountOffer";
export const createCategoryOfferUrl =
  serverUrl + "/api/offers/createCategoryOffer";
export const createCouponOfferUrl = serverUrl + "/api/offers/createCouponOffer";
export const createNewCustomerOfferUrl =
  serverUrl + "/api/offers/createNewCustomerOffer";
export const createBoGoOfferUrl = serverUrl + "/api/offers/createBoGoOffer";
export const getDiscountOffersUrl = serverUrl + "/api/offers/getDiscountOffers";
export const deleteDiscountOfferUrl =
  serverUrl + "/api/offers/deleteDiscountOffer";
export const toggleChangeDiscountOfferUrl =
  serverUrl + "/api/offers/toggleChangeDiscountOffer";
export const editDiscountOfferUrl = serverUrl + "/api/offers/editDiscountOffer";
export const getAllBogoOffersUrl = serverUrl + "/api/offers/getAllBogoOffers";
export const deleteBogoOfferUrl = serverUrl + "/api/offers/deleteBogoOffer";
export const toggleBogoOfferUrl = serverUrl + "/api/offers/toggleBogoOffer";
export const updateBogoOfferUrl = serverUrl + "/api/offers/updateBogoOffer";
export const getCategoryOffersUrl = serverUrl + "/api/offers/getCategoryOffers";
export const toggleCategoryOfferUrl =
  serverUrl + "/api/offers/toggleCategoryOffer";
export const updateCategoryOfferUrl =
  serverUrl + "/api/offers/updateCategoryOffer";
export const deleteCategoryOfferUrl =
  serverUrl + "/api/offers/deleteCategoryOffer";
export const getCouponOffersUrl = serverUrl + "/api/offers/getCouponOffers";
export const toggleCouponOfferUrl = serverUrl + "/api/offers/toggleCouponOffer";
export const updateCouponOfferUrl = serverUrl + "/api/offers/updateCouponOffer";
export const deleteCouponOfferUrl = serverUrl + "/api/offers/deleteCouponOffer";
export const getAllNewCustomerOffersUrl =
  serverUrl + "/api/offers/getAllNewCustomerOffers";
export const toggleNewCustomerOfferUrl =
  serverUrl + "/api/offers/toggleNewCustomerOffer";
export const editNewCustomerOfferUrl =
  serverUrl + "/api/offers/updateNewCustomerOffer";
export const deleteNewCustomerOfferUrl =
  serverUrl + "/api/offers/deleteNewCustomerOffer";
export const getCheckoutProductOffersUrl =
  serverUrl + "/api/offers/getCheckoutProductOffers";

// testimonial urls
export const makeTestimonialUrl =
  serverUrl + "/api/testimonial/promoteToTestimonials";
export const getTestimonialDataUrl =
  serverUrl + "/api/testimonial/getTestimonialData";
export const getAllProductsForAdminUrl =
  serverUrl + "/api/admin/products/getAllProductsForAdmin";
export const getCheckoutProductDetails =
  serverUrl + "/api/admin/products/getCheckoutDetails";
export const verifyCouponUrl = serverUrl + "/api/offers/verify-coupon";
export const notifyMeUrl = serverUrl + "/api/user/notify-me";
