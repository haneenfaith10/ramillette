import axios from "axios";
import {
  saveSettingsUrl,
  getSettingsUrl,
  postContactFormDataUrl,
} from "../urls";
import {
  successToast,
  errorToast,
} from "../Components/Notification/NotificationMessage";

const adminToken = localStorage.getItem("remilletAdminTkn");

export async function saveSettings(data, setSubmitting,token) {
  try {
    const response = await axios.post(saveSettingsUrl, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response?.data?.isSuccess) {
      successToast(response?.data?.message);
    } else {
      errorToast(response?.data?.message);
    }
  } catch (error) {
    console.log("error", error);
    errorToast("Failed!");
    throw error;
  } finally {
    setSubmitting(false);
  }
}

export async function getSettingsData(updateState, setSocialLinks = () => {}) {
  try {
    const response = await axios.get(getSettingsUrl);

    if (response.status === 200 && response?.data?.isSuccess) {
      updateState(response?.data?.data?.settings);
      setSocialLinks(response?.data?.data?.links);
    }
  } catch (error) {
    console.log("error", error);
    throw error;
  }
}

// function to send the contact form data to admin mail
export async function sendContactForm(formData, resetForm, setSubmitting) {
  try {
    const response = await axios.post(postContactFormDataUrl, formData);
    if (response.status === 200 && response.data.isSuccess) {
      resetForm();
      successToast(response.data.message);
    }
  } catch (error) {
    console.log("error", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}
