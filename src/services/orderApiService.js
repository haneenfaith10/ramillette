import axios from "axios";
import {
  bulkOrderStatusUpdateUrl,
  cancelOrderByAdminUrl,
  cancelOrderUrl,
  getAllOrdersUrl,
  getOrderDetailsUrl,
  getUserOrdersUrls,
  placeOrderUrl,
  placeSingleOrderUrl,
  updateDeliveryStepUrl,
  updateOrderStatusUrl,
  updateShippingDetailsUrl,
} from "../urls";
import {
  errorToast,
  successToast,
} from "../Components/Notification/NotificationMessage";
const token = localStorage.getItem("remilletteTkn");
const adminToken = localStorage.getItem("remilletAdminTkn");

// function to place the order
export async function placeOrder(data, countryId, tax) {
  try {
    const response = await axios.post(
      `${placeOrderUrl}?countryId=${countryId}`,
      { ...data, tax },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response?.data?.isSuccess) {
      return response.data;
    }
  } catch (error) {
    if (error.status === 400) {
      errorToast(error.response.data.message);
    }
    console.log("Error", error);
    throw error;
  }
}

// function to  get the user ordered products
export async function getUserOrders(token) {
  try {
    const response = await axios.get(getUserOrdersUrls, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response?.data?.isSuccess) {
      return response?.data?.orders;
    }
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}

// get all orders for admin
export async function getAllOrders(page, limit,token) {
  try {
    const response = await axios.get(
      `${getAllOrdersUrl}?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response?.data?.isSuccess) {
      return response.data;
    }
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}

// function to change the status of the order
export async function updateOrderStatus(orderId, status) {
  try {
    const response = await axios.put(
      updateOrderStatusUrl,
      { orderId, status },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    if (response.status === 200 && response.data?.isSuccess) {
      return response?.data?.order;
    }
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}

// function to get order details
export async function getOrderDetails(orderId) {
  try {
    const response = await axios.get(`${getOrderDetailsUrl}/${orderId}`);
    if (response.status === 200 && response?.data?.isSuccess) {
      return response?.data?.order;
    }
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}

// function to cancel the order
export async function cancelOrder(orderId, data) {
  try {
    const response = await axios.put(
      `${cancelOrderUrl}/${orderId}`,
      { reason: data },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data?.isSuccess) {
      successToast(response?.data?.message);
      return response.data;
    }
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}

// function to place single item order
export async function placeSingleOrder(
  product,
  address,
  countryId,
  paymentMethod,
  selectedVariant
) {
  try {
    const response = await axios.post(
      placeSingleOrderUrl,
      { product, address, countryId, paymentMethod, selectedVariant },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response?.data?.isSuccess) {
      return response.data;
    }
  } catch (error) {
    if (error.status === 400) {
      errorToast(error.response?.data?.message);
    }
    console.log("Error while placing order for single item", error);
    throw error;
  }
}

// function to update shipping details
export async function updateShippingDetails(orderId, data) {
  try {
    const response = await axios.post(
      `${updateShippingDetailsUrl}/${orderId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      console.log("updated shipping data");
    }
  } catch (error) {
    console.log("Error while updating shipping details", error);
    throw error;
  }
}

// function to cancel the order by admin
export async function cancelOrderByAdmin(orderId, reason) {
  try {
    const response = await axios.put(
      `${cancelOrderByAdminUrl}/${orderId}`,
      { reason },
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
    console.log("Error while cancelling order by admin", error);
    throw error;
  }
}

// function to update the order delivery step
export async function updateDeliveryStep(orderId, selectedStatus,token) {
  try {
    const response = await axios.put(
      `${updateDeliveryStepUrl}/${orderId}`,
      { status: selectedStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 && response.data.isSuccess) {
      successToast(response.data.message);
      return response.data;
    }
  } catch (error) {
    console.log("Error while updating order delivery status", error);
    throw error;
  }
}

// function to update bulk order status
export async function bulkOrderStatusUpdate(status, selectedOrders) {
  try {
    const response = await axios.put(
      bulkOrderStatusUpdateUrl,
      {status,selectedOrders},
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
    console.log("Error while updating bulk order status", error);
    throw error;
  }
}
