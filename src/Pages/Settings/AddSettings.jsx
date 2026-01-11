import { useFormik } from "formik";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import {
  getSettingsData,
  saveSettings,
} from "../../services/settingsApiService";
// import { getActiveCountries } from "../../services/configApiService";

export default function AddSettings() {
  const [settingData, setSettingsData] = useState({});
  const adminToken = localStorage.getItem("remilletAdminTkn");
  // const [countries, setCountries] = useState([]);

  // useEffect(() => {
  //   (async () => {
  //     const response = await getActiveCountries();
  //     if (response) {
  //       setCountries(response);
  //     }
  //   })();
  // }, []);

  useEffect(() => {
    getSettingsData(setSettingsData);
  }, []);

  const validationSchema = Yup.object().shape({
    companyName: Yup.string()
      .required("Company name is required")
      .min(2, "Company name must be at least 2 characters"),
    companyLocation: Yup.string()
      .required("Location is required")
      .min(2, "Location must be at least 2 characters"),
    companyEmail: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    supportEmail: Yup.string()
      .email("Invalid support email")
      .required("Support email is required"),
    address: Yup.string().required("Address is required"),
    phoneNumber: Yup.string()
      .matches(/^[0-9]{10,15}$/, "Phone number must be 10-15 digits")
      .required("Phone number is required"),
    // countryTags: Yup.object().shape({}),
  });

  // const initialCountryTags = Array.isArray(settingData?.tag)
  //   ? settingData.tag.reduce((acc, item) => {
  //       acc[item.country] = item.value;
  //       return acc;
  //     }, {})
  //   : {};

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    // setFieldValue,
  } = useFormik({
    initialValues: {
      companyName: settingData?.companyName || "",
      companyLocation: settingData?.companyLocation || "",
      companyEmail: settingData?.companyEmail || "",
      supportEmail: settingData?.companySupportEmail || "",
      address: settingData?.companyAddress || "",
      phoneNumber: settingData?.companyPhoneNumber || "",
      // countryTags: initialCountryTags,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) => {
      saveSettings(values, setSubmitting,adminToken);
    },
  });

  return (
    <div className="admin-add-category-main-container">
      <AdminHeader title="Add Settings" />
      <form onSubmit={handleSubmit} className="admin-add-category-form">
        {/* Normal fields */}
        <div className="admin-add-category-form-row">
          <label>Company Name</label>
          <input
            name="companyName"
            type="text"
            value={values.companyName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter Company Name"
          />
          {errors.companyName && touched.companyName && (
            <p className="error-message">{errors.companyName}</p>
          )}
        </div>

        <div className="admin-add-category-form-row">
          <label>Company Email</label>
          <input
            name="companyEmail"
            type="text"
            value={values.companyEmail}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter Email"
          />
          {errors.companyEmail && touched.companyEmail && (
            <p className="error-message">{errors.companyEmail}</p>
          )}
        </div>

        <div className="admin-add-category-form-row">
          <label>Support Email</label>
          <input
            name="supportEmail"
            type="text"
            value={values.supportEmail}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter Support Email"
          />
          {errors.supportEmail && touched.supportEmail && (
            <p className="error-message">{errors.supportEmail}</p>
          )}
        </div>

        <div className="admin-add-category-form-row">
          <label>Phone Number</label>
          <input
            name="phoneNumber"
            type="text"
            value={values.phoneNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter Phone Number"
          />
          {errors.phoneNumber && touched.phoneNumber && (
            <p className="error-message">{errors.phoneNumber}</p>
          )}
        </div>

        <div className="admin-add-category-form-row">
          <label>Address</label>
          <input
            name="address"
            type="text"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter Address"
          />
          {errors.address && touched.address && (
            <p className="error-message">{errors.address}</p>
          )}
        </div>

        <div className="admin-add-category-form-row">
          <label>Location</label>
          <input
            name="companyLocation"
            type="text"
            value={values.companyLocation}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter Location"
          />
          {errors.companyLocation && touched.companyLocation && (
            <p className="error-message">{errors.companyLocation}</p>
          )}
        </div>

        {/* Dynamic Country Tags */}
        {/* {countries.map((country) => (
          <div className="admin-add-category-form-row" key={country._id}>
            <label>{country.name} Tag</label>
            <input
              type="text"
              name={`countryTags.${country._id}`}
              value={values.countryTags[country._id] || ""}
              onChange={(e) =>
                setFieldValue(
                  "countryTags",
                  Object.assign({}, values.countryTags, {
                    [country._id]: e.target.value,
                  })
                )
              }
              onBlur={handleBlur}
              placeholder={`Enter tag for ${country.name}`}
            />
          </div>
        ))} */}

        {/* Submit */}
        <div className="admin-add-category-submit-btn-wrapper admin-add-settings-submit-btn-wrapper">
          <button type="submit" disabled={isSubmitting}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
