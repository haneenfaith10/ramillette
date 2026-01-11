import axios from "axios";
import IndianFlag from "../assets/images/india.png";
import AmericanFlag from "../assets/images/usd.png";
import SaudiArabia from "../assets/images/saudi.png";
// import UaeImage from "../assets/images/uae.png";

export const countryToCurrency = [
  {
    code: "IN",
    name: "India",
    currency: "INR",
    flag: IndianFlag,
  },
  {
    code: "US",
    name: "United States",
    currency: "USD",
    flag: AmericanFlag,
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    currency: "AED",
    flag: AmericanFlag,
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    currency: "SAR",
    flag: SaudiArabia,
  },
  {
    code: "QA",
    name: "Qatar",
    currency: "QAR",
    flag: AmericanFlag,
  },
  {
    code: "KW",
    name: "Kuwait",
    currency: "KWD",
    flag: AmericanFlag,
  },
  {
    code: "OM",
    name: "Oman",
    currency: "OMR",
    flag: AmericanFlag,
  },
  {
    code: "BH",
    name: "Bahrain",
    currency: "BHD",
    flag: AmericanFlag,
  },
  {
    code: "JO",
    name: "Jordan",
    currency: "JOD",
    flag: AmericanFlag,
  },
  {
    code: "LB",
    name: "Lebanon",
    currency: "LBP",
    flag: AmericanFlag,
  },
  {
    code: "IL",
    name: "Israel",
    currency: "ILS",
    flag: AmericanFlag,
  },
  {
    code: "PS",
    name: "Palestine",
    currency: "ILS",
    flag: AmericanFlag,
  },
  {
    code: "IQ",
    name: "Iraq",
    currency: "IQD",
    flag: AmericanFlag,
  },
  {
    code: "SY",
    name: "Syria",
    currency: "SYP",
    flag: AmericanFlag,
  },
  {
    code: "YE",
    name: "Yemen",
    currency: "YER",
    flag: AmericanFlag,
  },
  {
    code: "IR",
    name: "Iran",
    currency: "IRR",
    flag: AmericanFlag,
  },
];

// Fetch user country using geolocation API
export const getUserCountryCode = async () => {
  try {
    let country = localStorage.getItem("remilletteCountryCode");
    if (!country) {
      const res = await axios.get("https://ipwhois.app/json/");
      country = res.data.currency_code;
      localStorage.setItem("remilletteCountryCode", country);
    }
    return country;
  } catch (error) {
    console.error("Error fetching country code:", error);
    return "US";
  }
};

// Fetch exchange rate
export const getExchangeRate = async (fromCurrency, toCurrency) => {
  try {
    const res = await axios.get(
      `https://api.exchangerate.host/latest?base=${fromCurrency}&symbols=${toCurrency}`
    );
    return res.data.rates[toCurrency] || 1;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return 1;
  }
};
