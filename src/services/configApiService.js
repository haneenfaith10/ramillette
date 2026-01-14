import axios from "axios";
import { successToast } from "../Components/Notification/NotificationMessage";
import {
  createCountryUrl,
  deleteCountryUrl,
  getActiveCountriesUrl,
  getCountriesUrl,
  setPrimaryCountryUrl,
  toggleCountryStatusUrl,
  updateCountryUrl,
} from "../urls";
const adminToken = localStorage.getItem("remilletAdminTkn");

const API_URL = "/api/countries";

export async function getCountries(token) {
  try {
    // setLoading?.(true);
    const response = await axios.get(getCountriesUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response?.status === 200) {
      return response;
    }
  } catch (error) {
    console.error("Failed to fetch countries:", error);
  }
  //  finally {
  //   setLoading?.(false);
  // }
}

export async function addCountry(data, resetForm, fetchData, setSubmitting) {
  try {
    const response = await axios.post(createCountryUrl, data, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response?.status === 201 || response?.data?.isSuccess) {
      successToast("Country added successfully");
      resetForm?.();
      fetchData?.(); // refresh the list after adding
      return response.data;
    }
  } catch (error) {
    console.error("Error adding country:", error);
  } finally {
    setSubmitting?.(false);
  }
}

export async function updateCountry(id, data, fetchData, setSubmitting) {
  try {
    const response = await axios.put(`${updateCountryUrl}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response?.status === 200 || response?.data?.isSuccess) {
      successToast("Country updated successfully");
      fetchData?.();
      return response.data;
    }
  } catch (error) {
    console.error("Error updating country:", error);
  } finally {
    setSubmitting?.(false);
  }
}

export async function deleteCountry(id, fetchData, setDeleting) {
  try {
    const response = await axios.delete(`${deleteCountryUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response?.status === 200 || response?.data?.isSuccess) {
      successToast("Country deleted successfully");
      fetchData?.();
      return response.data;
    }
  } catch (error) {
    console.error("Error deleting country:", error);
  } finally {
    setDeleting?.(false);
  }
}

// function to toggle the country status
export async function toggleCountryStatus(id, isActive) {
  try {
    const response =await axios.put(
      `${toggleCountryStatusUrl}/${id}`,
      { isActive },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    if (response.status === 200) {
      return response?.data;
    }
  } catch (error) {
    console.error("Error deleting country:", error);
  }
}

export async function getActiveCountries() {
  try {
    const response = await axios.get(getActiveCountriesUrl);
    if (response.status === 200 && response?.data?.isSuccess) {
      return response.data.countries;
    } else {
      throw new Error("Failed to fetch active countries");
    }
  } catch (error) {
    console.error("Error fetching active countries:", error);
    throw error;
  }
}

// function to make the country as primary country
export const setPrimaryCountry = async (id) => {
  try {
    const response = await axios.put(
      `${setPrimaryCountryUrl}/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    if(response.status===200&&response?.data?.isSuccess){
      return response?.data
    }
  } catch (error) {
    console.error("Error while updating the primary country:", error);
    throw error;
  }
};
