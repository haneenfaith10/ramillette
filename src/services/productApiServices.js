import axios from "axios";

import {
  addProductUrl,
  changeProductDataUrl,
  deleteProductUrl,
  getAllProductsForAdminUrl,
  getAllProductsForUserUrl,
  getAllProductsUrl,
  getCheckoutProductDetails,
  getCountryBasedProductsUrl,
  getLatestProductUrl,
  getRelatedProductUrl,
  getSearchResultUrl,
  getSingleProductUrl,
  searchProductUrl,
  updateProductUrl,
} from "../urls";
import { successToast } from "../Components/Notification/NotificationMessage";
const adminToken = localStorage.getItem("remilletAdminTkn");

// function to create new product
export async function addProduct(
  data,
  navigate,
  resetForm,
  setSubmitting,
  imageRef,
) {
  try {
    const formData = new FormData();

    // Append fields with special handling
    for (const key in data) {
      if (
        key === "productFAQ" ||
        key === "selectedCountries" ||
        key === "countryPrices" ||
        key === "badges" ||
        key === "productCategory" ||
        key === "countryVariants" ||
        key === "imageOrientations" ||
        key === "productBenefits" ||
        key === "productUseCase"
      ) {
        formData.append(key, JSON.stringify(data[key]));
      } else if (key !== "productImages") {
        formData.append(key, data[key]);
      }
    }

    // Append images (File[] array)
    for (const file of data.productImages) {
      formData.append("productImages", file);
    }

    const response = await axios.post(addProductUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 201 && response.data.isSuccess) {
      resetForm();
      navigate("/admin/products");
      imageRef.current.value = null;
      successToast(response.data.message);
      localStorage.removeItem("unsavedOffers");
    }
  } catch (error) {
    console.error(error);
  } finally {
    setSubmitting(false);
  }
}

// function to get all products
export async function getAllProducts(
  page,
  limit,
  search,
  setProducts,
  setTotalProducts,
  token,
) {
  try {
    const response = await axios.get(
      `${getAllProductsUrl}?page=${page}&limit=${limit}&search=${search}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    // console.log(response, "response from get all products api");
    if (response.status === 200 && response.data.isSuccess) {
      setProducts(response.data.products);
      setTotalProducts(response.data.total);
    }
  } catch (error) {
    console.log(error);
  }
}

// function to get a single product details
export async function getSingleProduct(id, setProduct, countryCode) {
  try {
    const response = await axios.get(
      `${getSingleProductUrl}/${id}/?countryCode=${countryCode}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (response.status === 200 && response.data.isSuccess) {
      setProduct(response.data.product);
    }
  } catch (error) {
    console.log(error);
  }
}

// function to delete a product permanently
export async function deleteProduct(id, setChanged) {
  try {
    const response = await axios.put(`${deleteProductUrl}/${id}`, {
      headers: {
        "Content-Type": "application/json",
        // "Authorization":""
      },
    });
    if (response?.status && response?.data?.isSuccess) {
      console.log("delete success");
      setChanged((prev) => !prev);
      return response?.data.isSuccess;
    }
  } catch (error) {
    console.log(error);
  }
}

// function to get all product for user
export async function getAllProductsForUser(
  setProducts,
  // setPriceRange,
  countryCode,
  // setActualPriceRange
) {
  try {
    const response = await axios.get(
      `${getAllProductsForUserUrl}?countryCode=${countryCode}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status === 200 && response.data.isSuccess) {
      setProducts(response.data.products);
      // setPriceRange([
      //   response.data?.priceRange?.min,
      //   response.data?.priceRange?.max,
      // ]);
      // setActualPriceRange([
      //   response.data?.priceRange?.min,
      //   response.data?.priceRange?.max,
      // ]);
    }
  } catch (error) {
    console.log(error);
  }
}

// function to change the status of the product
export async function changeProductStatus(id, setChanged) {
  try {
    const response = await axios.put(`${updateProductUrl}/${id}`, {
      headers: {
        "Content-Type": "application/json",
        // "Authorization":""
      },
    });
    if (response?.status && response?.data?.isSuccess) {
      setChanged((prev) => !prev);
      return response?.data.isSuccess;
    }
  } catch (error) {
    console.log(error);
  }
}

// function to get latest products for user
export async function getLatestProductsForUser(
  limit,
  setProducts,
  countryCode,
) {
  try {
    const response = await axios.get(
      `${getLatestProductUrl}?countryCode=${countryCode}`,
      {
        headers: {
          "Content-Type": "application/json",
          limit,
        },
      },
    );
    if (response.status === 200 && response.data.isSuccess) {
      setProducts(response.data.products);
    }
  } catch (error) {
    console.log(error);
  }
}

// function to change the product details
export async function updateProduct(
  productId,
  formData,
  setSubmitting,
  setProductImages,
  navigate,
) {
  try {
    const response = await axios.post(
      `${changeProductDataUrl}/${productId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${adminToken}`,
        },
      },
    );

    if (response.status === 200 && response.data?.isSuccess) {
      localStorage.removeItem("unsavedOffers");
      navigate("/admin/products");
      successToast(response?.data?.message);
      setProductImages([]);
    }
  } catch (error) {
    console.log("error", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

// function to search the product  in user side nav bar
export async function fetchSuggestions(query, countryId) {
  try {
    const response = await axios.get(
      `${searchProductUrl}?query=${encodeURIComponent(
        query,
      )}&countryId=${countryId}`,
    );
    if (response.status === 200 && response.data.isSuccess) {
      return response.data.suggestions;
    }
  } catch (error) {
    console.log("error while fetching suggestion", error);
    throw error;
  }
}

// function to get the searched product
export async function getSearchResult(
  query,
  countryId,
  setProducts,
  // setPriceRange,
  // setActualPriceRange
) {
  try {
    const response = await axios.get(getSearchResultUrl, {
      params: {
        query,
        countryId,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      setProducts(response.data.products);
      // setPriceRange([
      //   response.data?.priceRange?.min,
      //   response.data?.priceRange?.max,
      // ]);
      // setActualPriceRange([
      //   response.data?.priceRange?.min,
      //   response.data?.priceRange?.max,
      // ]);
    }
  } catch (error) {
    console.log("error while fetching searched result!", error);
    throw error;
  }
}

// function to fetch the related product for user
export async function getRelatedProduct(
  productId,
  setRelatedProducts,
  countryCode,
) {
  try {
    const response = await axios.get(`${getRelatedProductUrl}/${productId}`, {
      params: { countryId: countryCode },
    });
    if (response.status === 200 && response.data.isSuccess) {
      setRelatedProducts(response.data.relatedProducts);
    }
  } catch (error) {
    console.log("error while fetching related products!", error);
    throw error;
  }
}

// function to get the country based product
export async function getCountryBasedProducts(selectedCountries, updateState) {
  try {
    const response = await axios.get(`${getCountryBasedProductsUrl}`, {
      headers: {
        selectedCountries: JSON.stringify(selectedCountries),
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response.data.products);
    }
  } catch (error) {
    console.log("error while fetching country related products!", error);
    throw error;
  }
}

// function to get all products for admin
export async function getAllProductsForAdmin(updateState, token) {
  try {
    const response = await axios.get(getAllProductsForAdminUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response.data.products);
    }
  } catch (error) {
    console.log("error while fetching all products for admin!", error);
    throw error;
  }
}

export async function getCheckoutDetailsWithOffers(countryId, token) {
  try {
    const res = await axios.get(getCheckoutProductDetails, {
      headers: { Authorization: `Bearer ${token}` },
      params: { countryId },
    });

    return res.data;
  } catch (err) {
    console.error("Error fetching checkout details:", err);
    return null;
  }
}
