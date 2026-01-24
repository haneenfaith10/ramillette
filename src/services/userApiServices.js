import axios from "axios";

import {
  addAddressUrl,
  addToCartUrl,
  addToCartWithQuantityUrl,
  changeCartQuantityUrl,
  changePasswordUrl,
  deleteAddressUrl,
  editAddressUrl,
  getOtpForForgetPasswordUrl,
  getOtpUrl,
  getUserAddressesUrl,
  getUserCountrySpecificDataUrl,
  getUserDetailsUrl,
  getUserSubCartUrl,
  getUserWishlistDetailsUrl,
  isProductAvailableUrl,
  loginUserUrl,
  notifyMeUrl,
  permanentlyBlockUserUrl,
  registerUserUrl,
  removeCartItemUrl,
  toggleUserStatusUrl,
  updateCartItemQuantityUrl,
  updateUserProfileUrl,
  verifyOtpUrl,
} from "../urls";
import {
  errorToast,
  successToast,
} from "../Components/Notification/NotificationMessage";
const token = localStorage.getItem("remilletteTkn");
const adminToken = localStorage.getItem("remilletAdminTkn");

// function to register user
export async function registerUser(data, navigate) {
  try {
    const response = await axios.post(registerUserUrl, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response?.status === 200 && response?.data?.isSuccess) {
      navigate(`/login`);
    }
  } catch (error) {
    if (error.status === 400 && error.response?.data?.isSuccess === false) {
      errorToast(error?.response?.data?.message);
    }
    console.log(error);
    throw error;
  }
}

// function to login user
export async function loginUser(data, resetForm, setSubmitting) {
  try {
    const response = await axios.get(loginUserUrl, {
      headers: {
        "Content-Type": "application/json",
        ...data,
      },
    });
    if (response?.status === 200 && response?.data?.isSuccess) {
      localStorage.setItem("remilletteTkn", response?.data?.token);
      resetForm();
      successToast(response?.data?.message);
      return response?.data;
    }
  } catch (error) {
    if (error.status === 401 && error?.response?.data?.isSuccess === false) {
      errorToast(error?.response?.data?.message);
    }
    console.log(error);
  } finally {
    setSubmitting(false);
  }
}

// function to add product in cart
export async function addToCart(
  productId,
  quantity,
  countryId,
  isShow = true,
  userToken,
) {
  try {
    if (!countryId) {
      return console.log("country id is missing ");
    }
    const response = await axios.post(
      `${addToCartUrl}?countryId=${countryId}`,
      { productId, quantity },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("remilletteTkn")}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (response?.status === 200 && response?.data?.isSuccess) {
      if (isShow) {
        successToast(response?.data?.message);
      }
      return response?.data?.cart;
    }
  } catch (error) {
    console.log(error, "error");
    throw error;
  }
}

// function to remove product item form cart
export async function removeCartItem(id, countryId, isShow = true, token) {
  if (!countryId) {
    return console.log("countryId is missing");
  }
  try {
    const response = await axios.put(
      `${removeCartItemUrl}?countryId=${countryId}`,
      { productId: id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (response.status === 200 && response?.data?.isSuccess) {
      if (isShow) {
        successToast(response?.data?.message);
      }
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message);
    console.log(error, "error");
    throw error;
  }
}

// function to increase the cart item quantity
export async function updateCartItemQuantity(
  productId,
  action = "increment",
  countryId,
  selectedVariants = {},
) {
  try {
    const response = await axios.put(
      `${updateCartItemQuantityUrl}?countryId=${countryId}`,
      { productId, action, selectedVariants },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("remilletteTkn")}`,
        },
      },
    );

    if (response?.status === 200 && response?.data?.isSuccess) {
      return response?.data;
    }
  } catch (error) {
    errorToast(error.response.data.message);
    console.log(error, "error");
    throw error;
  }
}

// function to fetch the user profiles
export async function getUserDetails(userId, updateState) {
  try {
    const response = await axios.get(getUserDetailsUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        userId,
      },
    });
    if (response.status === 200 && response?.data?.isSuccess) {
      updateState(response?.data?.user);
    }
  } catch (error) {
    console.log(error, "error");
    throw error;
  }
}

// function to update user profile
export async function updateUserProfile(
  formData,
  userId,
  setUserData,
  setSubmitting,
) {
  try {
    const response = await axios.post(updateUserProfileUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        userId,
      },
    });
    if (response.status === 200 && response?.data?.isSuccess) {
      // successToast(response?.data?.message);
      setUserData(response?.data?.user);
      return response?.data?.user;
    }
  } catch (error) {
    console.log(error, "error");
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to get user wishlist details
export async function getUserWishlistDetails(userId, countryId, token) {
  try {
    const response = await axios.get(
      `${getUserWishlistDetailsUrl}?countryId=${countryId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          userId,
        },
      },
    );
    if (response.status === 200 && response?.data?.isSuccess) {
      return response?.data?.wishlist;
    }
  } catch (error) {
    console.log(error, "error");
    throw error;
  }
}

// function to add user delivery address
export async function addAddress(data, userId, setSubmitting, resetForm) {
  try {
    const response = await axios.post(
      addAddressUrl,
      {
        ...data,
        userId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("remilletteTkn")}`,
        },
      },
    );
    if (response.status === 200 && response?.data?.isSuccess) {
      resetForm();
      successToast(response?.data?.message);
      return response?.data?.address;
    }
  } catch (error) {
    console.log(error, "error");
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to get user addresses
export async function getAddresses(userId, updateState) {
  try {
    const response = await axios.get(getUserAddressesUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("remilletteTkn")}`,
        userId,
      },
    });
    if (response.status === 200 && response?.data?.isSuccess) {
      updateState(response?.data?.addresses);
    }
  } catch (error) {
    console.log(error, "error");
    throw error;
  }
}

// function to edit user address
export async function editAddress(
  values,
  userId,
  addressId,
  setSubmitting,
  resetForm,
) {
  try {
    const response = await axios.put(
      editAddressUrl,
      { ...values, userId, addressId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("remilletteTkn")}`,
        },
      },
    );
    if (response?.status === 200 && response?.data?.isSuccess) {
      resetForm();
      return response?.data?.addresses;
    }
  } catch (error) {
    console.log(error, "error");
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to delete the address
export async function deleteAddress(userId, addressId) {
  try {
    const response = await axios.delete(deleteAddressUrl, {
      headers: {
        // "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        userId,
        addressId,
      },
    });
    if (response.status === 200 && response?.data?.isSuccess) {
      return response?.data?.addresses;
    }
  } catch (error) {
    console.log(error, "error");
    throw error;
  }
}

// function to add product in cart with quantity
export async function addToCartWithQuantity(
  productId,
  quantity,
  countryId,
  isShowMessage = true,
) {
  try {
    if (!countryId) {
      return console.log("Country is required!");
    }
    const response = await axios.post(
      `${addToCartWithQuantityUrl}?countryId=${countryId}`,
      {
        productId,
        quantity,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (response?.status === 200 && response?.data?.isSuccess) {
      if (isShowMessage) {
        successToast(response?.data?.message);
      }
      return response?.data?.cart;
    }
  } catch (error) {
    console.log(error, "error");
    throw error;
  }
}

export async function changeCartQuantity(productId, quantity, countryId) {
  try {
    const response = await axios.put(
      `${changeCartQuantityUrl}?countryId=${countryId}`,
      { productId, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.status === 200 && response?.data?.isSuccess) {
      return response.data.cart;
    } else if (response.status === 200 && response?.data?.isSuccess == false) {
      throw new Error(response?.data?.message);
    }
  } catch (error) {
    console.log(error, "error");

    throw error;
  }
}

// function to get otp for registration
export async function getOtp(email, setChanged, resetForm, setSubmitting) {
  try {
    const response = await axios.post(getOtpUrl, {
      email,
    });
    if (response.status === 200 && response?.data?.isSuccess) {
      successToast(response?.data?.message);
      setChanged((prev) => !prev);
      resetForm();
    }
  } catch (error) {
    if (error.response.status === 404) {
      errorToast(error?.response?.data?.message);
    }
    console.log(error, "error");
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to get the otp for password change
export async function getOtpForForgetPassword(email, setState) {
  try {
    const response = await axios.post(getOtpForForgetPasswordUrl, {
      email,
    });
    if (response.status === 200 && response?.data?.isSuccess) {
      successToast(response?.data?.message);
      setState("otp");
    }
  } catch (error) {
    console.log(error, "error");
    throw error;
  }
}

// function to veritfy the otp
export async function verifyOtp(data, setState, setSubmitting) {
  try {
    const response = await axios.post(verifyOtpUrl, { ...data });

    if (response.status === 200 && response?.data?.isSuccess) {
      setState("change");
    }
  } catch (error) {
    console.log(error, "error");
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to change password
export async function changePassword(data, navigate, setSubmitting) {
  try {
    const response = await axios.post(changePasswordUrl, { data });
    if (response.status === 200 && response?.data?.isSuccess) {
      navigate("/login");
      successToast(response?.data?.message);
    }
  } catch (error) {
    console.log(error, "error");
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to check the product is in stock
export async function isProductAvailable(
  productId,
  quantity,
  variantId,
  setProductAvailableError,
) {
  try {
    const response = await axios.get(isProductAvailableUrl, {
      headers: {
        productId: productId,
        quantity: quantity,
        Authorization: `Bearer ${token}`,
        variantId: variantId,
      },
    });
    if (
      response.status === 200 &&
      response.data?.isSuccess &&
      !response?.data?.isAvailable
    ) {
      setProductAvailableError(true);
    }
    if (
      response.status === 200 &&
      response.data?.isSuccess &&
      response?.data?.isAvailable
    ) {
      setProductAvailableError(false);
    }
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}

// function to fetch the user sub cart data
export async function getUserSubCart(countryId, userId) {
  try {
    const response = await axios.get(
      `${getUserSubCartUrl}?countryId=${countryId}&userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status === 200 && response.data.isSuccess) {
      return response.data.data;
    }
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}

export async function resendOtp(email, setIsSubmitting) {
  try {
    const response = await axios.post(getOtpUrl, {
      email,
    });
    if (response.status === 200 && response?.data?.isSuccess) {
      successToast(response?.data?.message);
      return response.data;
    }
  } catch (error) {
    if (error.response.status === 404) {
      errorToast(error?.response?.data?.message);
    }
    console.log(error, "error");
    throw error;
  } finally {
    setIsSubmitting(false);
  }
}

// function to fetch the user wishlist order and cart when user changes the country
export async function getUserCountrySpecificData(countryId, token) {
  try {
    if (!token) {
      throw new Error("Missing authentication token");
    }
    const response = await axios.get(
      `${getUserCountrySpecificDataUrl}?countryId=${countryId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (response.status === 200 && response.data.isSuccess) {
      return response.data;
    }
  } catch (error) {
    console.log(
      error,
      "error while getting user cart, wishlist and order details based on country",
    );
    throw error;
  }
}

// function to change the status of the user
export async function toggleUserStatus(userId, token) {
  try {
    const response = await axios.put(
      toggleUserStatusUrl,
      { userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status === 200 && response.data.isSuccess) {
      return response.data;
    }
  } catch (error) {
    console.log("Error while changing the user status", error);
    throw error;
  }
}

// function to completely blocking the user
export async function permanentlyBlockUser(id, setChanged, token) {
  try {
    const response = await axios.put(
      `${permanentlyBlockUserUrl}/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status === 200 && response.data.isSuccess) {
      setChanged((prev) => !prev);
      return response.data;
    }
  } catch (error) {
    console.log("Error while blocking user", error);
    throw error;
  }
}

// function to get the cart data
export async function getCartData(countryId, userId) {
  try {
    const response = await axios.get(
      `${getCartDataUrl}?countryId=${countryId}&userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  } catch (error) {
    console.log("Error while getting cart data", error);
    throw error;
  }
}

// function to request notification for out of stock product
export async function notifyMeAboutProduct(data) {
  try {
    const response = await axios.post(notifyMeUrl, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response?.status === 200 || response?.status === 201) {
      if (response?.data?.isSuccess) {
        successToast(response?.data?.message);
        return response?.data;
      }
    }
  } catch (error) {
    console.log("Error in notifyMeAboutProduct:", error);
    errorToast(error?.response?.data?.message || "Something went wrong!");
    throw error;
  }
}
