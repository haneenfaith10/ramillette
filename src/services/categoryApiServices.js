import axios from "axios";
import {
  addCategoryUrl,
  getActiveCategoriesUrl,
  getCategoriesUrl,
  getCategoryByIdUrl,
  editCategoryUrl,
  deleteCategoryUrl,
  toggleCategoryStatusUrl,
} from "../urls";
import { successToast } from "../Components/Notification/NotificationMessage";
const adminToken = localStorage.getItem("remilletAdminTkn");

export async function addProductCategory(
  data,
  setSubmitting,
  resetForm,
  imageRef,
  setImagePreview
) {
  try {
    const response = await axios.post(addCategoryUrl, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.status === 200 && response?.data?.isSuccess) {
      if (imageRef?.current) {
        imageRef.current.value = null;
      }
      resetForm();
      setImagePreview(null);
      successToast(response?.data?.message);
      return response.data;
    }
  } catch (error) {
    console.log("error", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

export async function editProductCategory(
  data,
  setSubmitting,
  resetForm,
  imageRef,
  setImagePreview,
  categoryId
) {
  try {
    const response = await axios.post(
      `${editCategoryUrl}/${categoryId}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (response.status === 200 && response?.data?.isSuccess) {
      if (imageRef?.current) {
        imageRef.current.value = null;
      }
      resetForm();
      setImagePreview(null);
      successToast(response?.data?.message);
      return response.data;
    }
  } catch (error) {
    console.log("error", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to fetch  the categories in the admin side
export async function getCategories(updateState) {
  try {
    const response = await axios.get(getCategoriesUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200 && response?.data?.isSuccess) {
      updateState(response?.data?.categories);
    }
  } catch (error) {
    console.log("error", error);
    throw error;
  }
}

// function get active categories
export async function getActiveCategories(updateState) {
  try {
    const response = await axios.get(getActiveCategoriesUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response?.data?.categories);
    }
  } catch (error) {
    console.log("error", error);
    throw error;
  }
}

// function get active categories
export async function getCategoryById(updateState, categoryId) {
  try {
    const response = await axios.get(`${getCategoryByIdUrl}/${categoryId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response?.data?.category);
    }
  } catch (error) {
    console.log("error", error);
    throw error;
  }
}

// function to delete the category by admin
export async function deleteCategory(categoryId, setChanged) {
  try {
    const response = await axios.delete(`${deleteCategoryUrl}/${categoryId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response.status === 200 && response?.data?.isSuccess) {
      setChanged((prev) => !prev);
      successToast(response?.data?.message);
      return response?.data;
    }
  } catch (error) {
    console.log("error", error);
    throw error;
  }
}

// function to toggle the status of category
export async function toggleCategoryStatus(id, setChanged) {
  try {
    const response = await axios.put(`${toggleCategoryStatusUrl}/${id}`);
    if (response.status === 200 && response.data.isSuccess) {
      setChanged((prev) => !prev);
    }
  } catch (error) {
    console.log("error", error);
    throw error;
  }
}
