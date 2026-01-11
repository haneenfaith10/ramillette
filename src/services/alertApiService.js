import axios from "axios";
import {
  createAlertUrl,
  deleteCollectionAlertUrl,
  getCountryAlertsUrl,
  updateCollectionAlertUrl,
} from "../urls";
import {
  errorToast,
  successToast,
} from "../Components/Notification/NotificationMessage";
const adminToken = localStorage.getItem("remilletAdminTkn");

// function to create new collection alert
export async function addCollectionAlert(
  data,
  setAlerts,
  resetForm,
  setSubmitting,
  token
) {
  try {
    const response = await axios.post(createAlertUrl, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      setAlerts((prev) => [response.data.alert, ...prev]);
      resetForm();
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something Went wrong");
    console.log("Error while creating new collection alert", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to get the alert by country basis
export async function CountryAlerts(countryId, setAlerts,token) {
  try {
    const response = await axios.get(`${getCountryAlertsUrl}/${countryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      setAlerts(response.data.alerts);
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong");
    console.log("Error while getting country alerts", error);
    throw error;
  }
}

// function to update the edit the collection alert
export async function updateCollectionAlert(data,token) {
  try {
    const response = await axios.put(updateCollectionAlertUrl, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data.alert;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong");
    console.log("Error while updating collection alert", error);
    throw error;
  }
}

// function to delete the collection alert
export async function deleteCollectionAlert(id) {
  try {
    const response = await axios.delete(`${deleteCollectionAlertUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong");
    console.log("Error while updating collection alert", error);
    throw error;
  }
}
