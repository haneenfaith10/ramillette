import axios from "axios";
import {
  errorToast,
  successToast,
} from "../Components/Notification/NotificationMessage";

const BASE_URL = (import.meta.env.VITE_BASE_URL || "") + "/api/coupon";
const getAdminToken = () => localStorage.getItem("remilletAdminTkn");

export const createCoupon = async (couponData) => {
  try {
    const response = await axios.post(`${BASE_URL}/admin/create`, couponData, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    if (response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response?.data?.message || "Failed to create coupon");
    throw error;
  }
};

export const updateCoupon = async (id, couponData) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/admin/update/${id}`,
      couponData,
      {
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      },
    );
    if (response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response?.data?.message || "Failed to update coupon");
    throw error;
  }
};

export const deleteCoupon = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/admin/delete/${id}`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    if (response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response?.data?.message || "Failed to delete coupon");
    throw error;
  }
};

export const getCoupons = async (params = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}/admin/list`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons", error);
    throw error;
  }
};

export const getCouponById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/admin/single/${id}`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching coupon details", error);
    throw error;
  }
};

export const validateCoupon = async (validationData) => {
  try {
    const response = await axios.post(`${BASE_URL}/validate`, validationData);
    return response.data;
  } catch (error) {
    return {
      isSuccess: false,
      message: error.response?.data?.message || "Invalid coupon",
    };
  }
};
export const getApplicableCoupons = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/get-applicable`, {
      params: { userId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching applicable coupons", error);
    return { isSuccess: false, coupons: [] };
  }
};
