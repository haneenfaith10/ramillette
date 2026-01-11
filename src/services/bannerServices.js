import axios from "axios";
import {
  createBannerUrl,
  deleteBannerUrl,
  getAllBannersUrl,
  getBannerByIdUrl,
  getBannerForUserUrl,
  toggleBannerStatusUrl,
  updateBannerDetailsUrl,
} from "../urls";
import { successToast } from "../Components/Notification/NotificationMessage";
const adminToken = localStorage.getItem("remilletAdminTkn");

// function to create banner
export async function createBanner(formData, setSubmitting) {
  try {
    const response = await axios.post(createBannerUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response.status == 200 && response?.data?.isSuccess) {
      successToast(response?.data?.message);
      return response.data;
    }
  } catch (error) {
    console.log("error while creating banner", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to get all active banners
export async function getAllBanners(setBannerData,token) {
  try {
    const response = await axios.get(getAllBannersUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response?.data?.isSuccess) {
      setBannerData(response?.data?.banners);
    }
  } catch (error) {
    console.log("error while getting banner", error);
    throw error;
  }
}

// function to get the banners for user
export async function getBannersForUser(countryCode, setBanners) {
  try {
    const response = await axios.get(
      `${getBannerForUserUrl}?countryCode=${countryCode}`
    );
    if (response.status === 200 && response.data?.isSuccess) {
      setBanners(response?.data?.banners);
    }
  } catch (error) {
    console.log("error while getting banner for home page", error);
    throw error;
  }
}

// function to delete the banner
export async function deleteBannerByAdmin(bannerId) {
  try {
    const response = await axios.delete(`${deleteBannerUrl}/${bannerId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response.status === 200 && response?.data?.isSuccess) {
      successToast(response?.data?.message);
      return response?.data?.banners;
    }
  } catch (error) {
    console.log("error while deleting banner by admin", error);
    throw error;
  }
}

// function to get the banner details by id
export async function getBannerById(bannerId) {
  try {
    const response = await axios.get(`${getBannerByIdUrl}/${bannerId}`);
    if (response.status === 200 && response.data.isSuccess) {
      return response?.data?.banner;
    }
  } catch (error) {
    console.log("error while getting single  banner by admin", error);
    throw error;
  }
}

// function to update the banner details
export async function updateBannerDetails(bannerId, formData) {
  try {
    const response = await axios.post(
      `${updateBannerDetailsUrl}/${bannerId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (response.status === 200 && response?.data?.isSuccess) {
      successToast(response?.data?.message);
      return response.data;
    }
  } catch (error) {
    console.log("error", error);
    throw error;
  }
}

// function to change the status of the banner
export async function toggleBannerStatus(bannerId){
  try {
    const  response = await axios.put(`${toggleBannerStatusUrl}/${bannerId}`,{},{headers:{
       Authorization: `Bearer ${adminToken}`,
    }})
    if(response.status===200&&response?.data?.isSuccess){
      successToast(response.data.message)
      return response.data.banners
    }
  } catch (error) {
    console.log("error", error);
    throw error;
  }
}
