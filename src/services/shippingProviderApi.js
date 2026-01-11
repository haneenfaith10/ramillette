import axios from "axios";
import {
  createProviderUrl,
  deleteProviderUrl,
  getAllActiveProvidersUrl,
  getAllProvidersUrl,
  updateProviderUrl,
} from "../urls";
import {
  errorToast,
  successToast,
} from "../Components/Notification/NotificationMessage";
const adminToken = localStorage.getItem("remilletAdminTkn");

// function to add new shipping provider
export async function AddProvider(formData, setSubmitting) {
  try {
    const response = await axios.post(createProviderUrl, formData, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data.provider;
    }
  } catch (error) {
    console.log("Error while adding new shipping provider", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to fetch all the shipping providers
export async function getAllActiveProviders(setShippingMethods, token) {
  try {
    const response = await axios.get(getAllActiveProvidersUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      setShippingMethods(response.data.providers);
    }
  } catch (error) {
    console.log("Error while getting active providers", error);
    throw error;
  }
}

// function to fetch all the shipping providers
export async function getAllProviders(setProviders, token) {
  try {
    const response = await axios.get(getAllProvidersUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      setProviders(response.data.providers);
    }
  } catch (error) {
    console.log("Error while fetching the all shipping providers", error);
    throw error;
  }
}

// function to delete the shipping provider data
export async function deleteProvider(id) {
  try {
    const response = await axios.delete(deleteProviderUrl, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      params: {
        id,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong");
    console.log("Error while deleting the shipping providers", error);
    throw error;
  }
}

// function to update the provider details
export async function updateProvider(id, data) {
  try {
    const response = await axios.put(
      `${updateProviderUrl}/${id}`,
      { providerName: data },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      return response.data;
    }
  } catch (error) {
    errorToast(error.response.data.message || "Something went wrong");
    console.log("Error while deleting the shipping providers", error);
    throw error;
  }
}
