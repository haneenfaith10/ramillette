import axios from "axios";
import { getSocialMediaLinksUrl, postSocialLinksUrl } from "../urls";
import { successToast } from "../Components/Notification/NotificationMessage";
const adminToken = localStorage.getItem("remilletAdminTkn");

// function to post the social links by admin
export async function postSocialLinks(data, updateState, setSubmitting) {
  try {
    const response = await axios.post(postSocialLinksUrl, data, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response.data.links);
      successToast(response.data.message);
    }
  } catch (error) {
    console.log("Error while posting social links", error);
    throw error;
  } finally {
    setSubmitting(false);
  }
}

//function to fetch the social media links
export async function getSocialMediaLinks(updateState) {
  try {
    const response = await axios.get(getSocialMediaLinksUrl);
    if (response.status === 200 && response.data.isSuccess) {
      updateState(response.data.links);
    }
  } catch (error) {
    console.log("Error while fetching the social media links", error);
    throw error;
  }
}
