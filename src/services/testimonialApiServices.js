import axios from "axios";
import { getTestimonialDataUrl, makeTestimonialUrl } from "../urls";
import {
  errorToast,
  successToast,
} from "../Components/Notification/NotificationMessage";

// function to promote the review to testimonials
export async function makeTestimonial(reviewId, token) {
  try {
    const response = await axios.put(
      `${makeTestimonialUrl}`,
      { reviewId },
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
    errorToast(error.response.data.message || "Something went wrong!");
    console.log("Error while promoting the review to testimonial", error);
  }
}

// function to fetch the complete testimonials
export async function getTestimonialData(updateState) {
  try {
    const response = await axios.get(getTestimonialDataUrl);
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response.data.testimonials);
    }
  } catch (error) {
    console.log("Error while fetching testimonial", error);
  }
}
