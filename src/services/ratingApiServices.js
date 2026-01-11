import axios from "axios";
import {
  getAllReviewsForAdminUrl,
  getAllReviewsUrl,
  getProductReviewsUrl,
  postRatingsUrl,
  updateReviewStatusUrl,
} from "../urls";
import { successToast } from "../Components/Notification/NotificationMessage";
const token = localStorage.getItem("remilletteTkn");
const adminToken = localStorage.getItem("remilletAdminTkn");

// function to post new rating
export async function postRating(
  productId,
  data,
  countryId,
  setSubmitting,
  resetForm,
  setChanged
) {
  try {
    const response = await axios.post(
      `${postRatingsUrl}/${productId}`,
      { ...data, countryId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response?.data?.message);
      resetForm();
      setChanged((prev) => !prev);
    }
  } catch (error) {
    console.log("Error while posting the rating", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to fetch the reviews for products
export async function getProductReviews(productId, countryId,userId,updateState) {
  try {
    const response = await axios.get(
      `${getProductReviewsUrl}/${productId}?countryId=${countryId}&userId=${userId}`
    );
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response.data.reviews);
    }
  } catch (error) {
    console.log("Error while fetching the reviews for products", error);
    throw error;
  }
}

// function to fetch the all product review
export async function getAllReviews(countryId, userId, updateState) {
  try {
    const response = await axios.get(
      `${getAllReviewsUrl}?countryId=${countryId}&userId=${userId}`
    );
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response.data.reviews);
    }
  } catch (error) {
    console.log("Error while fetching the reviews ", error);
    throw error;
  }
}

// function to get all the reviews for admin
export async function getAllReviewsForAdmin(updateState,token) {
  try {
    const response = await axios.get(getAllReviewsForAdminUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response.data.reviews);
    }
  } catch (error) {
    console.log("Error while fetching the reviews ", error);
    throw error;
  }
}

// change review status by admin
export async function updateReviewStatus(reviewId, status) {
  try {
    const response = await axios.put(
      `${updateReviewStatusUrl}/${reviewId}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      return response.data.reviews;
    }
  } catch (error) {
    console.log("Error while changing status of  reviews ", error);
    throw error;
  }
}
