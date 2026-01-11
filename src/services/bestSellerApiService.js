import axios from "axios";
import {
  deleteBestSellerUrl,
  getAllBestSellerUrl,
  getBestSellerByIdUrl,
  getBestSellerForUserUrl,
  postBestSellerUrl,
  updateBestSellerUrl,
} from "../urls";
import {
  errorToast,
  successToast,
} from "../Components/Notification/NotificationMessage";
const adminToken = localStorage.getItem("remilletAdminTkn");

// function to post the best seller
export async function postBestSeller(formData) {
  try {
    const response = await axios.post(postBestSellerUrl, formData, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message);
    console.log("Error while posting best seller data", error);
    throw error;
  }
}

// function to fetch the best seller data for admin
export async function getAllBestSeller(updateState,token) {
  try {
    const response = await axios.get(getAllBestSellerUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response.data.bestSellers);
    }
  } catch (error) {
    errorToast(error.response.data.message);
    console.log("Error while getting best seller data for admin", error);
    throw error;
  }
}

// function to delete the best seller data
export async function deleteBestSeller(bestSellerId) {
  try {
    const response = await axios.delete(
      `${deleteBestSellerUrl}/${bestSellerId}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      return response.data.bestSellers;
    }
  } catch (error) {
    errorToast(error.response.data.message);
    console.log("Error while deleting best seller data for admin", error);
    throw error;
  }
}

// function to get the best seller data with id
export async function getBestSellerById(bestSellerId) {
  try {
    const response = await axios.get(
      `${getBestSellerByIdUrl}/${bestSellerId}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      return response.data.bestSeller;
    }
  } catch (error) {
    errorToast(error.response.data.message);
    console.log("Error while getting seller data for admin", error);
    throw error;
  }
}

// function to update best seller data
export async function updateBestSeller(bestSellerId, formData) {
  try {
    const response = await axios.post(
      `${updateBestSellerUrl}/${bestSellerId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data.bestSeller;
    }
  } catch (error) {
    errorToast(error.response.data.message);
    console.log("Error while updating seller data for admin", error);
    throw error;
  }
}

// function to the best seller data for using based on the selected country
export async function getBestSellerForUser(countryId, updateState) {
  try {
    const response = await axios.get(
      `${getBestSellerForUserUrl}?countryId=${countryId}`
    );
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response.data.bestSellers);
    }
  } catch (error) {
    errorToast(error.response.data.message);
    console.log("Error while getting best seller data for user", error);
    throw error;
  }
}
