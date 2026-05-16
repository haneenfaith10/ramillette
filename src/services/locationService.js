import axios from "axios";

/**
 * Fetches the user's location based on their IP address.
 * Uses ipinfo.io as the primary provider.
 * 
 * @returns {Promise<string|null>} - Country code (e.g., 'QA') or null on failure
 */
export const fetchUserCountryCode = async () => {
  const token = import.meta.env.VITE_LOCATION_KEY;
  if (!token) {
    console.warn("VITE_LOCATION_KEY is missing in environment variables.");
    return null;
  }

  try {
    const response = await axios.get(`https://ipinfo.io/json?token=${token}`, {
      timeout: 5000, // 5 seconds timeout
    });
    
    if (response.data && response.data.country) {
      return response.data.country;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user location:", error.message);
    return null;
  }
};
