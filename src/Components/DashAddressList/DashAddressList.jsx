import { useEffect, useState } from "react";
import "./DashAddressList.css";
import { FiEdit2, FiTrash } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  addAddress,
  deleteAddress,
  editAddress,
  getAddresses,
} from "../../services/userApiServices";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import Checkbox from "@mui/material/Checkbox";
import { State, City } from "country-state-city";
import { getActiveCountries } from "../../services/configApiService";


function AddressModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isPrimaryAddress,
}) {
  const user = useSelector((state) => state.user.user);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    (async () => {
      const response = await getActiveCountries();
      if (response) {
        setCountries(response);
      }
    })();
  }, []);

  const AddressValidationSchema = Yup.object().shape({
    firstName: Yup.string()
      .required("First name is required")
      .min(2, "First name must be at least 2 characters")
      .matches(
        /^[A-Za-z\s]+$/,
        "First name can only contain letters and spaces"
      ),

    lastName: Yup.string()
      .nullable()
      .matches(
        /^[A-Za-z\s]+$/,
        "Last name can only contain letters and spaces"
      ),
    phone: Yup.string()
      .required("Phone number is required")
      .when("country", {
        is: (country) => country === "India" || country === "IN",
        then: (schema) =>
          schema.matches(
            /^[0-9]{10}$/,
            "Phone number must be 10 digits for India"
          ),
        otherwise: (schema) =>
          schema.matches(
            /^[0-9]{6,15}$/,
            "Phone number must be between 6 to 15 digits"
          ),
      }),
    address: Yup.string()
      .required("Address is required")
      .min(5, "Address must be at least 5 characters"),

    city: Yup.string()
      .required("City is required")
      .min(2, "City must be at least 2 characters"),

    zip: Yup.string()
      .required("Zip code is required")
      .matches(/^\d{6}$/, "Zip code must be 6 digits"),

    state: Yup.string()
      .required("State is required")
      .min(2, "State must be at least 2 characters"),

    country: Yup.string().required("Country is required"),

    isPrimary: Yup.boolean(),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    touched,
    setFieldValue,
    resetForm,
    isSubmitting,
  } = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      zip: "",
      state: "",
      country: "",
      isPrimary: false,
    },
    validationSchema: AddressValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      if (initialData && Object.keys(initialData).length > 0) {
        const response = await editAddress(
          values,
          user.id,
          initialData?._id,
          setSubmitting,
          resetForm
        );
        if (response) {
          onClose();
          onSave([...response]);
        }
      } else {
        const response = await addAddress(
          values,
          user.id,
          setSubmitting,
          resetForm
        );
        if (response) {
          onClose();
          onSave([...response]);
        }
      }
      setSelectedCountry("");
    },
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFieldValue("firstName", initialData?.firstName);
      setFieldValue("email", initialData?.email);
      setFieldValue("lastName", initialData?.lastName);
      setFieldValue("phone", initialData?.phone);
      setFieldValue("address", initialData?.streetAddress);
      setFieldValue("city", initialData?.city);
      setFieldValue("zip", initialData?.zip);
      setFieldValue("state", initialData?.state);
      setFieldValue("country", initialData?.country);
      setFieldValue("isPrimary", initialData.isPrimary);
      const countryObj = countries.find(
        (c) => c.name.toLowerCase() === initialData.country.toLowerCase()
      );
      if (countryObj) {
        setSelectedCountry(countryObj.code);
      }

      const matchedState = states.find(
        (s) => s.name.toLowerCase() === initialData.state.toLowerCase()
      );
      if (matchedState) {
        setSelectedState(matchedState.isoCode);

        const matchedCities = City.getCitiesOfState(
          countryObj?.code,
          matchedState.isoCode
        );
        setCities(matchedCities);
      }
    }
  }, [initialData, setFieldValue, countries, states]);

  useEffect(() => {
    if (selectedCountry) {
      setStates(State.getStatesOfCountry(selectedCountry.toUpperCase()));
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState && selectedCountry) {
      setCities(
        City.getCitiesOfState(
          selectedCountry.toUpperCase(),
          selectedState.toUpperCase()
        )
      );
    }
  }, [selectedState, selectedCountry]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>{initialData ? "Edit Address" : "Add New Address"}</h2>
        <form
          className="profile-address-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div>
            <input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="First Name"
              value={values.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors?.firstName && touched.firstName && (
              <p className="address-error-message">{errors?.firstName}</p>
            )}
          </div>
          <div>
            <input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Last Name"
              value={values.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors?.lastName && touched.lastName && (
              <p className="address-error-message">{errors?.lastName}</p>
            )}
          </div>
          <div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Your Email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors?.email && touched.email && (
              <p className="address-error-message">{errors?.email}</p>
            )}
          </div>
          <div>
            <input
              id="phone"
              name="phone"
              type="number"
              placeholder="Phone Number"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors?.phone && touched.phone && (
              <p className="address-error-message">{errors?.phone}</p>
            )}
          </div>
          <div>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="Street Address"
              value={values.address}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors?.address && touched.address && (
              <p className="address-error-message">{errors?.address}</p>
            )}
          </div>
          <div>
            <select
              id="country"
              name="country"
              type="text"
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setFieldValue(
                  "country",
                  countries.find((country) => country.code === e.target.value)
                    .name
                );
              }}
              onBlur={handleBlur}
            >
              <option hidden>Select Country</option>
              {countries &&
                countries.length > 0 &&
                countries.map((country, index) => (
                  <option value={country.code} key={index}>
                    {country.name}
                  </option>
                ))}
            </select>
            {errors?.country && touched.country && (
              <p className="address-error-message">{errors?.country}</p>
            )}
          </div>
          <div>
            <select
              id="state"
              name="state"
              type="text"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setFieldValue(
                  "state",
                  states.find((state) => state.isoCode === e.target.value)?.name
                );
              }}
              onBlur={handleBlur}
            >
              <option hidden>Select State</option>
              {states &&
                states.length > 0 &&
                states.map((state, index) => (
                  <option key={index} value={state.isoCode}>
                    {state.name}
                  </option>
                ))}
            </select>
            {errors?.state && touched.state && (
              <p className="address-error-message">{errors?.state}</p>
            )}
          </div>
          <div>
            <select
              id="city"
              name="city"
              type="text"
              value={values.city}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option hidden>Select City</option>
              {cities &&
                cities.length > 0 &&
                cities.map((city, index) => (
                  <option key={index} value={city.name}>
                    {city.name}
                  </option>
                ))}
            </select>
            {errors?.city && touched.city && (
              <p className="address-error-message">{errors?.city}</p>
            )}
          </div>
          <div>
            <input
              type="number"
              name="zip"
              placeholder="Zip Code"
              value={values.zip}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors?.zip && touched.zip && (
              <p className="address-error-message">{errors?.zip}</p>
            )}
          </div>

          {(!isPrimaryAddress ||
            initialData?._id === isPrimaryAddress?._id) && (
            <label className="checkbox-row">
              <Checkbox
                id="isPrimary"
                name="isPrimary"
                checked={values.isPrimary}
                onBlur={handleBlur}
                disabled={
                  isPrimaryAddress && initialData?._id !== isPrimaryAddress?._id
                }
                onChange={(e) => {
                  setFieldValue("isPrimary", e.target.checked);
                }}
                sx={{
                  color: "#edc862",
                  "&.Mui-checked": {
                    color: "#edc862",
                  },
                  "& .MuiSvgIcon-root": {
                    borderRadius: "4px",
                  },
                }}
              />
              Set as primary address
            </label>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="close-btn"
              disabled={isSubmitting}
              onClick={() => {
                onClose();
                resetForm();
              }}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddressList() {
  const user = useSelector((state) => state.user.user);
  const [addresses, setAddresses] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isPrimaryAddress, setIsPrimaryAddress] = useState({});

  const handleEdit = (address) => {
    setEditData(address);
    setShowModal(true);
  };

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const primaryAddress = addresses.find((addr) => addr.isPrimary);
      setIsPrimaryAddress(primaryAddress);
    }
  }, [addresses]);

  const handleDelete = async (id) => {
    if (user?.id && id) {
      Swal.fire({
        title: "Are you sure?",
        text: "You want to delete this address?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#edc862",
        cancelButtonColor: "#ccc",
        confirmButtonText: "Yes, delete it!",
        allowOutsideClick: false,
      }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await deleteAddress(user?.id, id);
          if (response) {
            Swal.fire({
              title: "Deleted!",
              text: "Your address has been deleted.",
              icon: "success",
            });
            handleSave(response);
          }
        }
      });
    }
  };

  const handleSave = (data) => {
    if (data.id) {
      // Update
      setAddresses((prev) =>
        prev.map((addr) => (addr.id === data.id ? data : addr))
      );
    } else {
      // Add
      setAddresses(data);
    }
  };

  useEffect(() => {
    if (user.id) {
      getAddresses(user?.id, setAddresses);
    }
  }, [user.id]);

  return (
    <div className="address-list-container" id="addresses-section">
      <table className="address-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {addresses.map((addr) => (
            <tr key={addr._id}>
              <td data-label="Name">
                {addr.firstName}
                {addr.lastName}
              </td>
              <td data-label="Address">{`${addr.streetAddress}, ${addr.city}, ${addr.state}, ${addr.country} - ${addr.zip}`}</td>
              <td data-label="Email">{addr.email}</td>
              <td data-label="Phone">{addr.phone}</td>
              <td data-label="Actions" className="address-actions">
                <FiEdit2
                  onClick={() => handleEdit(addr)}
                  title="Edit"
                  className="icon edit"
                />
                <FiTrash
                  onClick={() => handleDelete(addr._id)}
                  title="Delete"
                  className="icon delete"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="add-address-btn" onClick={() => handleEdit(null)}>
        Add new address
      </button>

      <AddressModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        initialData={editData}
        isPrimaryAddress={isPrimaryAddress}
      />
    </div>
  );
}
