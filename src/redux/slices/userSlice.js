import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    wishlist: [],
    cart: {
      items: [],
    },
  },
  token: null,
  checkout: {
    cart: [],
    address: {},
    note: "",
    totalAmount: "",
    promoCode: null,
    promoDiscount: 0,
  },
  orderCount: 0,
  selectedCountry: {},
  isAppLoading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      const { user, token, cart, wishlist } = action.payload;
      state.user = user;
      state.token = token;
      state.checkout = {};

      // Filter out items with null productId (deleted products)
      const filteredCart = cart
        ? {
            ...cart,
            items: (cart.items || []).filter((item) => item.productId),
          }
        : { items: [] };

      state.user.cart = filteredCart;

      // Filter out products with null product in wishlist
      state.user.wishlist = (wishlist?.products || []).filter(
        (item) => item.product,
      );
    },
    logout: (state) => {
      state.user = {};
      state.token = null;
    },
    updateUserWishList: (state, action) => {
      state.user.wishlist = (action.payload.user || []).filter(
        (item) => item.product,
      );
    },
    updateCart: (state, action) => {
      const cart = action.payload.cart;
      state.user.cart = cart
        ? {
            ...cart,
            items: (cart.items || []).filter((item) => item.productId),
          }
        : { items: [] };
    },
    updateUserProfileDetails: (state, action) => {
      state.user.id = action.payload.id;
      state.user.firstName = action.payload.firstName;
      state.user.lastName = action.payload.lastName;
      state.user.email = action.payload.email;
      state.user.userImage = action.payload.userImage;
      state.user.phone = action.payload.phone;
    },
    setCheckoutCart: (state, action) => {
      // state.checkout.cart = action.payload;
      state.checkout.cart = action.payload.items;
      state.checkout.subtotal = action.payload.subtotal;
      state.checkout.finalTotal = action.payload.finalTotal;
      state.checkout.newUserOffer = action.payload.newUserOffer;
      state.checkout.promoCode = action.payload.promoCode;
      state.checkout.promoDiscount = action.payload.promoDiscount;
    },
    setCheckoutAddress: (state, action) => {
      state.checkout.address = action.payload;
    },
    setCheckoutNote: (state, action) => {
      state.checkout.note = action.payload;
    },
    clearCheckoutData: (state) => {
      state.checkout = {
        cart: [],
        address: null,
        note: "",
        totalAmount: "",
      };
      state.checkout.note = "";
    },
    updateOrderCount: (state, action) => {
      state.orderCount = action.payload.orderCount;
    },
    setSelectedCountry: (state, action) => {
      state.selectedCountry = action.payload;
    },
    updateSubTotalAmount: (state, action) => {
      state.checkout.totalAmount = action.payload.totalAmount;
    },
    setCheckoutOffer: (state, action) => {
      const { productId, offer } = action.payload;
      const existingCart = state.checkout.cart || [];

      state.checkout.cart = existingCart.map((item) =>
        item.productId === productId ? { ...item, selectedOffer: offer } : item,
      );
    },
    clearCheckoutOffers: (state) => {
      if (state.checkout.cart?.length > 0) {
        state.checkout.cart = state.checkout.cart.map((item) => ({
          ...item,
          selectedOffer: null,
        }));
      }
    },
    setAppLoading: (state, action) => {
      state.isAppLoading = action.payload;
    },
  },
});

export const {
  login,
  logout,
  updateUserWishList,
  updateCart,
  updateUserProfileDetails,
  setCheckoutCart,
  setCheckoutAddress,
  clearCheckoutData,
  setCheckoutNote,
  updateOrderCount,
  setSelectedCountry,
  updateSubTotalAmount,
  setCheckoutOffer,
  clearCheckoutOffers,
  setAppLoading,
} = userSlice.actions;
export default userSlice.reducer;
