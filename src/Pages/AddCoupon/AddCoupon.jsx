import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import {
  createCoupon,
  updateCoupon,
  getCouponById,
} from "../../services/couponService";
import { getAllProductsForAdmin } from "../../services/productApiServices";
import { getActiveCategories } from "../../services/categoryApiServices";
import { getAllUsers } from "../../services/adminApiServices";
import Select from "react-select";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
} from "@mui/material";
import "./AddCoupon.css";

export default function AddCoupon() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const adminToken = localStorage.getItem("remilletAdminTkn");

  useEffect(() => {
    getAllProductsForAdmin(setProducts, adminToken);
    getActiveCategories(setCategories);
    getAllUsers(setUsers);

    if (isEdit) {
      getCouponById(id).then((res) => {
        if (res.isSuccess) {
          const coupon = res.coupon;
          setValues({
            ...coupon,
            startDate: coupon.startDate.split("T")[0],
            endDate: coupon.endDate.split("T")[0],
            applicableProducts: coupon.applicableProducts || [],
            applicableCategories: coupon.applicableCategories || [],
            excludedProducts: coupon.excludedProducts || [],
            specificUsers: coupon.specificUsers || [],
          });
        }
      });
    }
  }, [id, isEdit, adminToken]);

  const validationSchema = Yup.object({
    code: Yup.string()
      .required("Required")
      .matches(/^[A-Z0-9_-]+$/, "Uppercase, numbers, - and _ only"),
    title: Yup.string().required("Required"),
    discountType: Yup.string()
      .oneOf(["flat", "percentage"])
      .required("Required"),
    discountValue: Yup.number()
      .positive("Must be positive")
      .required("Required"),
    startDate: Yup.date().required("Required"),
    endDate: Yup.date()
      .min(Yup.ref("startDate"), "End date must be after start date")
      .required("Required"),
    minPurchaseAmount: Yup.number().min(0),
    maxDiscountAmount: Yup.number().min(0),
    usageLimit: Yup.number().min(1).nullable(),
    usagePerUser: Yup.number().min(1).required("Required"),
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setValues,
    isSubmitting,
  } = useFormik({
    initialValues: {
      code: "",
      title: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minPurchaseAmount: 0,
      maxDiscountAmount: "",
      usageLimit: null,
      usagePerUser: 1,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      isActive: true,
      applicableProducts: [],
      applicableCategories: [],
      excludedProducts: [],
      customerEligibility: "all",
      specificUsers: [],
      isStackable: false,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        let response;
        if (isEdit) {
          response = await updateCoupon(id, values);
        } else {
          response = await createCoupon(values);
        }

        if (response.isSuccess) {
          toast.success(response.message || "Coupon saved successfully");
          resetForm();
          navigate("/admin/dynamic-coupons");
        } else {
          toast.error(response.message || "Failed to save coupon");
        }
      } catch (error) {
        console.error("Form submit error", error);
        toast.error("An error occurred while saving the coupon");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const productOptions = Array.isArray(products)
    ? products.map((p) => ({
        value: p._id,
        label: p.productName,
      }))
    : [];
  const categoryOptions = Array.isArray(categories)
    ? categories.map((c) => ({
        value: c._id,
        label: c.categoryName,
      }))
    : [];
  const userOptions = Array.isArray(users)
    ? users.map((u) => ({
        value: u._id,
        label: `${u.userName} (${u.userContactEmail})`,
      }))
    : [];

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "8px",
      borderColor: "#e0e0e0",
      boxShadow: "none",
      "&:hover": { borderColor: "#edc862" },
    }),
  };

  return (
    <Box className="add-coupon-container" sx={{ p: 4 }}>
      <AdminHeader title={isEdit ? "Edit Coupon" : "Create Coupon"} />

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {/* Main Info */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{ p: 3, borderRadius: "12px", border: "1px solid #eee" }}
            >
              <Typography variant="h6" gutterBottom color="#333">
                Basic Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Coupon Code"
                    name="code"
                    value={values.code}
                    onChange={(e) =>
                      setFieldValue("code", e.target.value.toUpperCase())
                    }
                    onBlur={handleBlur}
                    error={touched.code && Boolean(errors.code)}
                    helperText={touched.code && errors.code}
                    placeholder="E.g. SUMMER50"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Coupon Title"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.title && Boolean(errors.title)}
                    helperText={touched.title && errors.title}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Description"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }} color="#333">
                Discount Rules
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Discount Type"
                    name="discountType"
                    value={values.discountType}
                    onChange={handleChange}
                  >
                    <MenuItem value="percentage">Percentage (%)</MenuItem>
                    <MenuItem value="flat">Flat Amount (Fixed)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={
                      values.discountType === "percentage"
                        ? "Discount Percentage (%)"
                        : "Discount Amount"
                    }
                    name="discountValue"
                    value={values.discountValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.discountValue && Boolean(errors.discountValue)
                    }
                    helperText={touched.discountValue && errors.discountValue}
                  />
                </Grid>
                {values.discountType === "percentage" && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max Discount Amount (Optional)"
                      name="maxDiscountAmount"
                      value={values.maxDiscountAmount}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.maxDiscountAmount &&
                        Boolean(errors.maxDiscountAmount)
                      }
                      helperText={
                        touched.maxDiscountAmount && errors.maxDiscountAmount
                      }
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Min Purchase Amount"
                    name="minPurchaseAmount"
                    value={values.minPurchaseAmount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.minPurchaseAmount &&
                      Boolean(errors.minPurchaseAmount)
                    }
                    helperText={
                      touched.minPurchaseAmount && errors.minPurchaseAmount
                    }
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }} color="#333">
                Usage Limits
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Total Usage Limit (Optional)"
                    name="usageLimit"
                    value={values.usageLimit || ""}
                    onChange={(e) =>
                      setFieldValue(
                        "usageLimit",
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    onBlur={handleBlur}
                    error={touched.usageLimit && Boolean(errors.usageLimit)}
                    helperText={touched.usageLimit && errors.usageLimit}
                    placeholder="Leave empty for unlimited"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Usage Per User"
                    name="usagePerUser"
                    value={values.usagePerUser}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.usagePerUser && Boolean(errors.usagePerUser)}
                    helperText={touched.usagePerUser && errors.usagePerUser}
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }} color="#333">
                Validity Period
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Start Date"
                    name="startDate"
                    value={values.startDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputLabelProps={{ shrink: true }}
                    error={touched.startDate && Boolean(errors.startDate)}
                    helperText={touched.startDate && errors.startDate}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="End Date"
                    name="endDate"
                    value={values.endDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    error={touched.endDate && Boolean(errors.endDate)}
                    helperText={touched.endDate && errors.endDate}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Rules & Eligibility */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Paper
                elevation={0}
                sx={{ p: 3, borderRadius: "12px", border: "1px solid #eee" }}
              >
                <Typography variant="h6" gutterBottom color="#333">
                  Configuration
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.isActive}
                      onChange={(e) =>
                        setFieldValue("isActive", e.target.checked)
                      }
                      color="warning"
                    />
                  }
                  label="Active Status"
                  sx={{ width: "100%", mb: 1 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.isStackable}
                      onChange={(e) =>
                        setFieldValue("isStackable", e.target.checked)
                      }
                      color="warning"
                    />
                  }
                  label="Stackable with other offers"
                  sx={{ width: "100%" }}
                />
              </Paper>

              <Paper
                elevation={0}
                sx={{ p: 3, borderRadius: "12px", border: "1px solid #eee" }}
              >
                <Typography variant="h6" gutterBottom color="#333">
                  Restrictions
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Applicable Categories
                  </Typography>
                  <Select
                    isMulti
                    options={categoryOptions}
                    value={categoryOptions.filter((opt) =>
                      values.applicableCategories.includes(opt.value),
                    )}
                    onChange={(selected) =>
                      setFieldValue(
                        "applicableCategories",
                        selected.map((s) => s.value),
                      )
                    }
                    styles={customSelectStyles}
                    placeholder="Select categories..."
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Applicable Products
                  </Typography>
                  <Select
                    isMulti
                    options={productOptions}
                    value={productOptions.filter((opt) =>
                      values.applicableProducts.includes(opt.value),
                    )}
                    onChange={(selected) =>
                      setFieldValue(
                        "applicableProducts",
                        selected.map((s) => s.value),
                      )
                    }
                    styles={customSelectStyles}
                    placeholder="Select products..."
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Excluded Products
                  </Typography>
                  <Select
                    isMulti
                    options={productOptions}
                    value={productOptions.filter((opt) =>
                      values.excludedProducts.includes(opt.value),
                    )}
                    onChange={(selected) =>
                      setFieldValue(
                        "excludedProducts",
                        selected.map((s) => s.value),
                      )
                    }
                    styles={customSelectStyles}
                    placeholder="Exclude products..."
                  />
                </Box>
              </Paper>

              <Paper
                elevation={0}
                sx={{ p: 3, borderRadius: "12px", border: "1px solid #eee" }}
              >
                <Typography variant="h6" gutterBottom color="#333">
                  Customer Eligibility
                </Typography>
                <TextField
                  select
                  fullWidth
                  name="customerEligibility"
                  value={values.customerEligibility}
                  onChange={handleChange}
                  size="small"
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="all">Everyone</MenuItem>
                  <MenuItem value="first-time">
                    First-time Customers Only
                  </MenuItem>
                  <MenuItem value="specific">Specific Customers</MenuItem>
                </TextField>

                {values.customerEligibility === "specific" && (
                  <Select
                    isMulti
                    options={userOptions}
                    value={userOptions.filter((opt) =>
                      values.specificUsers.includes(opt.value),
                    )}
                    onChange={(selected) =>
                      setFieldValue(
                        "specificUsers",
                        selected.map((s) => s.value),
                      )
                    }
                    styles={customSelectStyles}
                    placeholder="Select specific users..."
                  />
                )}
              </Paper>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
                sx={{
                  backgroundColor: "#edc862",
                  color: "#fff",
                  py: 1.5,
                  borderRadius: "10px",
                  fontWeight: "bold",
                  "&:hover": { backgroundColor: "#d4b458" },
                  boxShadow: "0 4px 15px rgba(237, 200, 98, 0.3)",
                }}
              >
                {isEdit ? "Update Coupon" : "Create Coupon"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
