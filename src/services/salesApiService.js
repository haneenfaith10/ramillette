import axios from "axios";
import { getSalesDataUrl } from "../urls";
const adminToken = localStorage.getItem("remilletAdminTkn");

export const getSalesData = async (startDate, endDate, interval,token) => {
  try {
    const response = await axios.get(
      `${getSalesDataUrl}?start=${startDate}&end=${endDate}&interval=${interval}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      return response;
    }
  } catch (error) {
    console.error("Failed to fetch sales data", error);
    return null;
  }
};
