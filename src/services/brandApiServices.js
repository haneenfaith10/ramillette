import axios from "axios";
import {
  changeBrandStatusUrl,
  crateNewBrandUrl,
  deleteBrandUrl,
  getBrandsUrl,
  updateBrandDetailsUrl,
} from "../urls";
const token = localStorage.getItem("remilletAdminTkn");
import { successToast } from "../Components/Notification/NotificationMessage";

// function to upload new brand by admin
export async function createNewBrand(
  formData,
  setSubmitting,
  resetForm,
  setCroppedImg
) {
  try {
    const response = await axios.post(crateNewBrandUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response?.status === 200 && response?.data?.isSuccess) {
      successToast(response?.data?.message);
      resetForm();
      setCroppedImg(null);
    }
  } catch (error) {
    console.log("error", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to get all brands for admin
export async function getAllBrands(updateState) {
  try {
    const response = await axios.get(getBrandsUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response?.status === 200 && response?.data?.isSuccess) {
      updateState(response?.data?.brands);
    }
  } catch (error) {
    console.log("error", error);
    throw error;
  }
}

// function to change the status of the brand
export async function changeBrandStatus(brandId) {
  try {
    const response = await axios.put(
      changeBrandStatusUrl,
      {
        brandId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data.brand;
    }
  } catch (error) {
    console.log("error", error);
    throw error;
  }
}

// function to delete the brand
export async function deleteBrand(brandId) {
  try {
    const response = await axios.put(
      deleteBrandUrl,
      { brandId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response?.data?.isSuccess) {
      successToast(response?.data?.message);
      return response?.data?.brand;
    }
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}

// function to update brand details
export async function updateBrandDetails(brandId, formData, setSubmitting) {
  try {
    formData.append("brandId", brandId);
    const response = await axios.post(
      updateBrandDetailsUrl,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data.brand;
    }
  } catch (error) {
    console.log("Error", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}
