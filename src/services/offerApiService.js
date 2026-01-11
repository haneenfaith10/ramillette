import axios from "axios";
import {
  createBoGoOfferUrl,
  createCategoryOfferUrl,
  createCouponOfferUrl,
  createDiscountOfferUrl,
  createNewCustomerOfferUrl,
  createOfferUrl,
  deleteBogoOfferUrl,
  deleteCategoryOfferUrl,
  deleteCouponOfferUrl,
  deleteDiscountOfferUrl,
  deleteNewCustomerOfferUrl,
  deleteOfferUrl,
  editDiscountOfferUrl,
  editNewCustomerOfferUrl,
  editOfferUrl,
  fetchCommonOfferUrl,
  getAllBogoOffersUrl,
  getAllNewCustomerOffersUrl,
  getCategoryOffersUrl,
  getCheckoutProductOffersUrl,
  getCouponOffersUrl,
  getDiscountOffersUrl,
  toggleBogoOfferUrl,
  toggleCategoryOfferUrl,
  toggleChangeDiscountOfferUrl,
  toggleCouponOfferUrl,
  toggleNewCustomerOfferUrl,
  updateBogoOfferUrl,
  updateCategoryOfferUrl,
  updateCouponOfferUrl,
  verifyCouponUrl,
} from "../urls";
import {
  errorToast,
  successToast,
} from "../Components/Notification/NotificationMessage";
const adminToken = localStorage.getItem("remilletAdminTkn");

// function to create new offer for product
export async function createOffer(formData, setSubmitting, isShow = false) {
  try {
    const response = await axios.post(createOfferUrl, formData, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      if (isShow) {
        successToast(response.data.message);
      }
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "something went wrong!!");
    console.log("Error while creating the offer!", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// delete offer
export async function deleteOffer(offerId) {
  try {
    const response = await axios.delete(`${deleteOfferUrl}/${offerId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "something went wrong!!");
    console.log("Error while deleting  the offer!", error);
    throw error;
  }
}

// function to fetch the common offers
export async function fetchCommonOffers(setOffers, token) {
  try {
    const response = await axios.get(fetchCommonOfferUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      setOffers(response.data.offers);
    }
  } catch (error) {
    console.log("Error while fetching common offers!", error);
    throw error;
  }
}

// function to edit offers
export async function editOffer(offerId, values) {
  try {
    const response = await axios.put(
      `${editOfferUrl}/${offerId}`,
      { ...values },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    console.log("Error while editing  offers!", error);
    throw error;
  }
}

// function to create discount offer
export async function createDiscountOffer(formData, token) {
  try {
    const response = await axios.post(createDiscountOfferUrl, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while creating discount offers!", error);
    throw error;
  }
}

// function to create category offers
export async function createCategoryOffer(formData, token, setSubmitting) {
  try {
    const response = await axios.post(createCategoryOfferUrl, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while creating category offers!", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to create coupon offers
export async function createCouponOffer(formData, token, setSubmitting) {
  try {
    const response = await axios.post(createCouponOfferUrl, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while creating coupon offers!", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to create new customer offer
export async function createNewCustomerOffer(formData, token, setSubmitting) {
  try {
    const response = await axios.post(createNewCustomerOfferUrl, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while creating new customer offers!", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to create bogo offers
export async function createBoGoOffer(formData, token) {
  try {
    const response = await axios.post(createBoGoOfferUrl, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while creating bogo offers!", error);
    throw error;
  }
}

// function to get discount offers
export async function getDiscountOffers(token, updateState) {
  try {
    const response = await axios.get(getDiscountOffersUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        offerType: "discount",
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response.data.offers);
    }
  } catch (error) {
    console.log("Error while getting discount offers!", error);
    throw error;
  }
}

// function to delete the discount offer
export async function deleteDiscountOffer(offerId, token) {
  try {
    const response = await axios.delete(
      `${deleteDiscountOfferUrl}/${offerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while deleting discount offers!", error);
    throw error;
  }
}

// function to change the status of  the discount offer

export async function toggleChangeDiscountOffer(offerId, token) {
  try {
    const response = await axios.put(
      `${toggleChangeDiscountOfferUrl}/${offerId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while toggling  discount offers status!", error);
    throw error;
  }
}

// function to edit the discount offer section
export async function editDiscountOffer(offerId, formData, token) {
  try {
    const response = await axios.put(
      `${editDiscountOfferUrl}/${offerId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while editing  discount offer!", error);
    throw error;
  }
}

// function to get all the bogo offers
export async function getAllBogoOffers(token, updateState) {
  try {
    const response = await axios.get(getAllBogoOffersUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        offerType: "bogo",
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response.data.offers);
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while getting bogo offers!", error);
    throw error;
  }
}

// function to delete the gobo offer
export async function deleteBogoOffer(offerId, token) {
  try {
    const response = await axios.delete(`${deleteBogoOfferUrl}/${offerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while deleting bogo offers!", error);
    throw error;
  }
}

// function to toggle the status of the bogo offer
export async function toggleBogoOffer(offerId, token) {
  try {
    const response = await axios.put(
      `${toggleBogoOfferUrl}/${offerId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while toggling bogo offers status!", error);
    throw error;
  }
}

// function to edit the bogo offer details
export async function updateBogoOffer(offerId, formData, token) {
  try {
    const response = await axios.put(
      `${updateBogoOfferUrl}/${offerId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while updating bogo offer!", error);
    throw error;
  }
}

// function to fetch the category offers
export async function getCategoryOffers(token, updateState) {
  try {
    const response = await axios.get(getCategoryOffersUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        offerType: "category",
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response.data.offers);
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while fetching category offer!", error);
    throw error;
  }
}

// function to toggle the status of the category offer
export async function toggleCategoryOffer(offerId, token) {
  try {
    const response = await axios.put(
      `${toggleCategoryOfferUrl}/${offerId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while toggling bogo offers status!", error);
    throw error;
  }
}

// function to edit the category offer details
export async function updateCategoryOffer(
  offerId,
  formData,
  token,
  setSubmitting
) {
  try {
    const response = await axios.put(
      `${updateCategoryOfferUrl}/${offerId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while updating bogo offer!", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to delete the gobo offer
export async function deleteCategoryOffer(offerId, token) {
  try {
    const response = await axios.delete(
      `${deleteCategoryOfferUrl}/${offerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while deleting bogo offers!", error);
    throw error;
  }
}

// function to get the coupon offers
export async function getCouponOffers(token, updateState) {
  try {
    const response = await axios.get(getCouponOffersUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        offerType: "coupon",
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response.data.offers);
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while getting coupon offers!", error);
    throw error;
  }
}

// function to toggle the status of the category offer
export async function toggleCouponOffer(offerId, token) {
  try {
    const response = await axios.put(
      `${toggleCouponOfferUrl}/${offerId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while toggling bogo offers status!", error);
    throw error;
  }
}

// function to edit the category offer details
export async function updateCouponOffer(
  offerId,
  formData,
  token,
  setSubmitting
) {
  try {
    const response = await axios.put(
      `${updateCouponOfferUrl}/${offerId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while updating bogo offer!", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to delete the coupon offer
export async function deleteCouponOffer(offerId, token) {
  try {
    const response = await axios.delete(`${deleteCouponOfferUrl}/${offerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while deleting bogo offers!", error);
    throw error;
  }
}

// function to get all the new customer offers
export async function getAllNewCustomerOffers(token, updateState) {
  try {
    const response = await axios.get(getAllNewCustomerOffersUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        offerType: "new-customer",
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response.data.offers);
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while getting coupon offers!", error);
    throw error;
  }
}

// function to toggle the status of the new customer offer
export async function toggleNewCustomerOffer(offerId, token) {
  try {
    const response = await axios.put(
      `${toggleNewCustomerOfferUrl}/${offerId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while toggling bogo offers status!", error);
    throw error;
  }
}

// function to edit the new customer offer section
export async function updateNewCustomerOffer(
  offerId,
  formData,
  token,
  setSubmitting
) {
  try {
    const response = await axios.put(
      `${editNewCustomerOfferUrl}/${offerId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while editing  discount offer!", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to delete the new customer offer
export async function deleteNewCustomerOffer(offerId, token) {
  try {
    const response = await axios.delete(
      `${deleteNewCustomerOfferUrl}/${offerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while deleting discount offers!", error);
    throw error;
  }
}

// function to get the offers for the checkout product
export async function getCheckoutProductOffers(productIds, countryId, token) {
  try {
    const response = await axios.post(
      getCheckoutProductOffersUrl,
      { productIds, countryId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      return response.data.offers;
    }
  } catch (error) {
    console.log(
      "Error while getting the product offer for checkout page",
      error
    );
  }
}

export const verifyCouponCode = async (
  productId,
  couponCode,
  countryId,
  token
) => {
  try {
    const res = await axios.post(
      verifyCouponUrl,
      { productId, couponCode, countryId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error verifying coupon:", error);
    return { isSuccess: false, message: "Server error" };
  }
};
