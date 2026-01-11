import axios from "axios";
import {
  createBadgeUrl,
  deleteBadgeUrl,
  getAllBadgesUrl,
  getBadgeDetailsUrl,
  updateBadgeUrl,
} from "../urls";
import {
  errorToast,
  successToast,
} from "../Components/Notification/NotificationMessage";
const adminToken = localStorage.getItem("remilletAdminTkn");

export async function crateBadge(formData, setSubmitting) {
  try {
    const response = await axios.post(createBadgeUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    console.log("Error while creating new badge", error);
    errorToast(error.response.data.message);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// functions to get the badges for admin
export async function getAllBadges(updateState,token) {
  try {
    const response = await axios.get(getAllBadgesUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response.data.badges);
    }
  } catch (error) {
    console.log("Error while getting the badges for admin ", error);
    throw error;
  }
}

// function to get the badge details
export async function getBadgeDetails(badgeId) {
  try {
    const response = await axios.get(`${getBadgeDetailsUrl}/${badgeId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      return response.data.badge;
    }
  } catch (error) {
    console.log("Error while getting badge details by admin ", error);
    throw error;
  }
}

// function to update the badge by admin
export async function updateBadge(badgeId, formData, setSubmitting) {
  try {
    const response = await axios.put(`${updateBadgeUrl}/${badgeId}`, formData, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    console.log("Error while updating the badge details by admin ", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to delete the badge
export async function deleteBadge(badgeId, setSubmitting) {
  try {
    const response = await axios.delete(`${deleteBadgeUrl}/${badgeId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    console.log("Error while deleting the badge by admin ", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}
