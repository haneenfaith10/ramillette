import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  FormHelperText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import "./ManageTaxPage.css";
import { getActiveCountries } from "../../services/configApiService";
import {
  getTaxByCountry,
  updateCountryTax,
} from "../../services/taxApiServices";

export default function ManageTaxPage() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countryTaxes, setCountryTaxes] = useState([]);

  const fetchCountriesAndTaxes = async () => {
    const countryList = await getActiveCountries();
    if (countryList) {
      setCountries(countryList);

      const taxes = await Promise.all(
        countryList.map(async (country) => {
          const taxRes = await getTaxByCountry(country._id);
          return {
            country: country.name,
            tax: taxRes?.taxPercentage ?? 0,
            taxName: taxRes?.taxName ?? "",
          };
        })
      );

      setCountryTaxes(taxes);
    }
  };

  useEffect(() => {
    fetchCountriesAndTaxes();
  }, []);

  const formik = useFormik({
    initialValues: {
      countryId: "",
      taxPercentage: "",
      taxName: "",
    },
    validationSchema: Yup.object({
      countryId: Yup.string().required("Country is required"),
      taxName: Yup.string().required("Tax Name is required"),
      taxPercentage: Yup.number()
        .typeError("Tax must be a number")
        .min(0, "Tax cannot be negative")
        .required("Tax is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      Swal.fire({
        title: "Are you sure?",
        text: `You want to change the tax!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, change it!",
        allowOutsideClick: false,
      }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await updateCountryTax(
            values.countryId,
            values.taxPercentage,
            values.taxName
          );
          if (response) {
            Swal.fire({
              title: "Changed!",
              text: "Country tax has been changed.",
              icon: "success",
            });
            resetForm();
            setSelectedCountry("");
            fetchCountriesAndTaxes();
          }
        }
      });
    },
  });

  useEffect(() => {
    if (selectedCountry) {
      (async () => {
        const response = await getTaxByCountry(selectedCountry);
        if (response) {
          formik.setFieldValue("taxPercentage", response.taxPercentage ?? "");
          formik.setFieldValue("taxName", response.taxName ?? "");
        } else {
          formik.setFieldValue("taxName", "");
          formik.setFieldValue("taxPercentage", "");
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

  return (
    <div className="manage-tax-page">
      <AdminHeader title="Manage Tax" />
      <div className="manage-tax-content">
        <Paper elevation={0} className="manage-tax-form-card">
          <h3 className="manage-tax-form-title">Update Country Tax</h3>
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            className="manage-tax-form"
          >
            <FormControl
              fullWidth
              size="small"
              error={Boolean(
                formik.touched.countryId && formik.errors.countryId
              )}
              className="manage-tax-field"
            >
              <InputLabel>Select Country</InputLabel>
              <Select
                name="countryId"
                value={formik.values.countryId}
                onChange={(e) => {
                  formik.handleChange(e);
                  setSelectedCountry(e.target.value);
                }}
                onBlur={formik.handleBlur}
                label="Select Country"
              >
                {countries.map((country) => (
                  <MenuItem key={country._id} value={country._id}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {formik.touched.countryId && formik.errors.countryId}
              </FormHelperText>
            </FormControl>
            <TextField
              name="taxName"
              label="Tax Name (e.g. VAT, GST)"
              type="text"
              size="small"
              inputProps={{ min: 0, step: 0.01 }}
              value={formik.values.taxName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.taxName && Boolean(formik.errors.taxName)}
              helperText={formik.touched.taxName && formik.errors.taxName}
              fullWidth
              className="manage-tax-field"
            />
            <TextField
              name="taxPercentage"
              label="Tax (%)"
              type="number"
              size="small"
              inputProps={{ min: 0, step: 0.01 }}
              value={formik.values.taxPercentage}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.taxPercentage &&
                Boolean(formik.errors.taxPercentage)
              }
              helperText={
                formik.touched.taxPercentage && formik.errors.taxPercentage
              }
              fullWidth
              className="manage-tax-field"
            />
            <Button
              type="submit"
              variant="contained"
              className="manage-tax-submit-btn"
            >
              Update Tax
            </Button>
          </Box>
        </Paper>

        <Paper elevation={0} className="manage-tax-table-card">
          <h3 className="manage-tax-table-title">Current Country Taxes</h3>
          <TableContainer>
            <Table size="small" className="manage-tax-table">
              <TableHead>
                <TableRow>
                  <TableCell>Country</TableCell>
                  <TableCell>Tax Name</TableCell>
                  <TableCell>Tax (%)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {countryTaxes.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.country}</TableCell>
                    <TableCell>{item.taxName}</TableCell>
                    <TableCell>{item.tax}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>
    </div>
  );
}
