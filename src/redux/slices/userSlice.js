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
  },
  orderCount: 0,
  selectedCountry: {},
  isAppLoading: true,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.checkout = {};
      state.user.cart = action.payload.cart ?? { items: [] };
      state.user.wishlist = action.payload.wishlist?.products ?? [];
    },
    logout: (state) => {
      state.user = {};
      state.token = null;
    },
    updateUserWishList: (state, action) => {
      state.user.wishlist = action.payload.user;
    },
    updateCart: (state, action) => {
      state.user.cart = action.payload.cart;
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
      state.checkout.finalTotal = action.payload.finalTotal; // ⭐
      state.checkout.newUserOffer = action.payload.newUserOffer; // ⭐
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
