import axios from "axios";
import {
  addToWishlistUrl,
  getUserWishlistDataUrl,
  getUserWishlistUrl,
  removeFromWishListUrl,
} from "../urls";
import { errorToast } from "../Components/Notification/NotificationMessage";

export async function addToWishlist(id, userId, countryId) {
  try {
    const response = await axios.put(
      `${addToWishlistUrl}?countryId=${countryId}`,
      {
        productId: id,
        userId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response?.status === 200 && response?.data?.isSuccess) {
      return response?.data?.user;
    }
  } catch (error) {
    errorToast(error.response.data.message);
    console.log(error);
  }
}

// function to remove the product from user wishlist
export async function removeFromWishlist(id, userId, countryId) {
  try {
    const response = await axios.put(
      `${removeFromWishListUrl}?countryId=${countryId}`,
      {
        productId: id,
        userId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response?.status && response?.data?.isSuccess) {
      return response?.data?.user;
    }
  } catch (error) {
    errorToast(error.response.data.message);
    console.log(error);
  }
}

// function to get user wishlist details
export async function getUserWishlist(id) {
  try {
    const response = await axios.get(getUserWishlistUrl, {
      headers: {
        "Content-Type": "application/json",
        userId: id,
      },
    });
    if (response?.status === 200 && response?.data.isSuccess) {
      return response?.data?.user;
    }
  } catch (error) {
    errorToast(error.response.data.message);
    console.log(error);
  }
}

// function to get user wishlist data
export async function getUserWishlistData(userId, countryId) {
  try {
    const response = await axios.get(`${getUserWishlistDataUrl}`, {
      headers: {
        userId,
        countryId,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      return response.data.wishlist;
    }
  } catch (error) {
    errorToast(error.response.data.message);
    console.log(error, "Error while getting user wishlist details.");
  }
}
