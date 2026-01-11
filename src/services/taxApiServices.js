import axios from "axios";
import { getTaxByCountryUrl, updateCountryTaxUrl } from "../urls";
import { successToast } from "../Components/Notification/NotificationMessage";
const adminToken = localStorage.getItem("remilletAdminTkn");

// function to update the country tax
export async function updateCountryTax(countryId, taxPercentage,taxName) {
  try {
    const response = await axios.put(
      `${updateCountryTaxUrl}/${countryId}`,
      {
        taxPercentage,
        taxName
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    if (response?.status === 200 && response?.data?.isSuccess) {
      successToast(response?.data?.message);
      return response?.data?.tax;
    }
  } catch (error) {
    console.log("Error while updating the country tax!");
    throw error;
  }
}

// function to get the selected country tax
export async function getTaxByCountry(countryId) {
  try {
    const response = await axios.get(`${getTaxByCountryUrl}/${countryId}`);
    if (response.status === 200 && response?.data.isSuccess) {
      return response?.data?.tax;
    }
  } catch (error) {
    console.log("Error while getting the country tax!");
    throw error;
  }
}
