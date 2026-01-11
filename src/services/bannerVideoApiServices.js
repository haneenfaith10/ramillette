import axios from "axios";
import {
  changeVideoBannerStatusUrl,
  createVideoBannerUrl,
  deleteVideoBannerUrl,
  getVideoBannerByIdUrl,
  getVideoBannerForUserUrl,
  getVideoBannersUrl,
  updateVideoBannerUrl,
} from "../urls";
import { successToast } from "../Components/Notification/NotificationMessage";
const adminToken = localStorage.getItem("remilletAdminTkn");

// function to upload new video banner
export async function createVideoBanner(formData, setSubmitting) {
  try {
    const response = await axios.post(createVideoBannerUrl, formData, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.status === 200 && response?.data?.isSuccess) {
      successToast(response?.data?.message);
      return response?.data;
    }
  } catch (error) {
    console.error("Error while creating new video banner:", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to get the video banners for admin
export async function getAllVideoBanners(updateState) {
  try {
    const response = await axios.get(getVideoBannersUrl, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response?.data?.banners);
    }
  } catch (error) {
    console.error("Error while fetching video banner:", error);
    throw error;
  }
}

// function to get the banner for user
export async function getBannerForUser(updateState) {
  try {
    const response = await axios.get(getVideoBannerForUserUrl);
    if (response.status === 200 && response?.data?.isSuccess) {
      updateState(response?.data?.banner);
    }
  } catch (error) {
    console.error("Error while fetching video banner for user:", error);
    throw error;
  }
}

// function to delete the video banner
export async function deleteVideoBanner(bannerId) {
  try {
    const response = await axios.delete(`${deleteVideoBannerUrl}/${bannerId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response?.data?.message);
      return response?.data?.banners;
    }
  } catch (error) {
    console.error("Error while deleting video banner by admin:", error);
    throw error;
  }
}

// function to get the video banner to edit
export async function getVideoBannerById(bannerId) {
  try {
    const response = await axios.get(`${getVideoBannerByIdUrl}/${bannerId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response.status === 200 && response.data?.isSuccess) {
      return response.data.banner;
    }
  } catch (error) {
    console.error("Error while getting video banner for banner edit:", error);
    throw error;
  }
}

// function to update the video banner
export const updateVideoBanner = async (bannerId, formData, setSubmitting) => {
  try {
    const response = await axios.put(
      `${updateVideoBannerUrl}/${bannerId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    if (response.status === 200 && response.data.isSuccess) {
      successToast(response?.data?.message);
      return true;
    }
  } catch (error) {
    console.error("Failed to update video banner:", error);
    return false;
  } finally {
    setSubmitting(false);
  }
};

// function to change the banner status
export async function changeVideoBannerStatus(
  bannerId,
  adminToken,
  setVideoBanners
) {
  try {
    const response = await axios.put(
      `${changeVideoBannerStatusUrl}/${bannerId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      const updatedBanner = response.data.updatedBanner;

      setVideoBanners((prevBanners) =>
        prevBanners.map((banner) =>
          banner._id === bannerId ? updatedBanner : banner
        )
      );
    }
  } catch (error) {
    console.error("Failed to update status of video banner:", error);
    return error;
  }
}
