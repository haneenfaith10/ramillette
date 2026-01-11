import axios from "axios";
import {
  adminLoginUrl,
  adminRegisterUrl,
  dashboardOverviewUrl,
  filterOrderCancelledUserUrl,
  getAllUsersUrl,
  getBestSellingProductsUrl,
  getSalesChartUrl,
  getSingleProductDetailsUrl,
  getSingleUserUsl,
} from "../urls";
import { errorToast } from "../Components/Notification/NotificationMessage";
const adminToken = localStorage.getItem("remilletAdminTkn");

// function to register admin
export async function adminRegister(data) {
  try {
    const response = await axios.post(adminRegisterUrl, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response?.status === 200 && response?.data?.isSuccess) {
      console.log("Admin registered successfully:", response?.data);
    }
  } catch (error) {
    console.log("Error in adminRegister:", error);
  }
}

export async function adminLogin(data, resetForm, setSubmitting, navigate) {
  try {
    const response = await axios.get(adminLoginUrl, {
      headers: {
        "Content-Type": "application/json",
        ...data,
      },
    });
    if (response?.status === 200 && response?.data?.isSuccess) {
      localStorage.setItem("remilletAdminTkn", response?.data?.token);
      navigate("/admin/dashboard");
      resetForm();
    }
  } catch (error) {
    console.log("Error in adminLogin:", error);
    errorToast(error.response.data.message);
  } finally {
    setSubmitting(false);
  }
}

// function to fetch the users list
export async function getAllUsers(setUsers) {
  try {
    const response = await axios.get(getAllUsersUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response?.status === 200 && response?.data?.isSuccess) {
      setUsers(response?.data?.users);
    }
  } catch (error) {
    console.log("Error while getting user details", error);
  }
}

// function to get the admin dashboard details
export async function dashboardOverview(token) {
  try {
    const response = await axios.get(dashboardOverviewUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response?.data?.isSuccess) {
      return response?.data;
    }
  } catch (error) {
    console.log("Error while getting the admin dashboard details", error);
    throw error;
  }
}

// function to get the sales chart for admin dashboard
export async function getSalesChart(startDate, endDate, token) {
  try {
    const response = await axios.get(
      `${getSalesChartUrl}?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response?.data?.isSuccess) {
      return response?.data?.data;
    }
  } catch (error) {
    console.log("Error while getting the admin dashboard sales data", error);
    throw error;
  }
}

// function to get user details
export async function getSingleUser(userId) {
  try {
    const response = await axios.get(`${getSingleUserUsl}/${userId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response.status === 200 && response?.data?.isSuccess) {
      return response?.data;
    }
  } catch (error) {
    console.log("Error while getting user details for admin", error);
    throw error;
  }
}

// function to get product details for admin
export async function getSingleProductDetails(productId, updateState) {
  try {
    const response = await axios.get(
      `${getSingleProductDetailsUrl}/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    if (response.status === 200 && response?.data?.isSuccess) {
      updateState(response?.data?.product);
    }
  } catch (error) {
    console.log("Error while getting product details for admin", error);
    throw error;
  }
}

// function to get the best selling products
export async function getBestSellingProducts(updateState = () => {}) {
  try {
    const response = await axios.get(getBestSellingProductsUrl);
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response.data.products);
      return response.data.products;
    }
  } catch (error) {
    console.log("Error while getting best selling products", error);
    throw error;
  }
}

// function to filter the order cancelled user
export async function filterOrderCancelledUser(fromStatus, toStatus, token) {
  try {
    const response = await axios.get(
      `${filterOrderCancelledUserUrl}?fromStatus=${fromStatus}&toStatus=${toStatus}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      return response.data.users;
    }
  } catch (error) {
    console.log("Error while filtering the user with cancelled order", error);
    throw error;
  }
}
