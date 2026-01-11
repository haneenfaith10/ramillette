import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  MenuItem,
  Divider,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateShippingDetails } from "../../services/orderApiService";
import {
  AddProvider,
  getAllActiveProviders,
} from "../../services/shippingProviderApi";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
  maxHeight: "90vh",
  overflowY: "auto",
};

export default function ShippingDetailsModal({
  open,
  handleClose,
  order,
  refreshOrder,
}) {
  const [addProvider, setAddProvider] = useState(false);
  const [shippingMethods, setShippingMethods] = useState([]);
    const adminToken = localStorage.getItem("remilletAdminTkn");


  useEffect(() => {
    getAllActiveProviders(setShippingMethods,adminToken);
  }, [adminToken]);

  const formik = useFormik({
    initialValues: {
      shippingMethodName: "",
      courierPartner: "",
      trackingId: "",
      estimatedDeliveryDate: "",
      status: order?.status || "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      shippingMethodName: Yup.string().required("Shipping method is required"),
      courierPartner: Yup.string().required("Courier partner is required"),
      trackingId: Yup.string().required("Tracking ID is required"),
      estimatedDeliveryDate: Yup.string().required("Delivery date is required"),
      status: Yup.string().required("Order status is required"),
    }),
    onSubmit: async (values) => {
      const payload = {
        shippingMethod: {
          name: values.shippingMethodName,
          courierPartner: values.courierPartner,
          trackingId: values.trackingId,
          estimatedDeliveryDate: values.estimatedDeliveryDate,
        },
        status: values.status,
      };
      await updateShippingDetails(order._id, payload);
      refreshOrder?.();
      handleClose();
    },
  });

  const handleSelectMethod = (e) => {
    const methodName = e.target.value;
    formik.setFieldValue("shippingMethodName", methodName);
    formik.setFieldValue("courierPartner", methodName || "");
    formik.setFieldValue("trackingId", "");
  };

  const providerFormik = useFormik({
    initialValues: {
      providerName: "",
    },
    validationSchema: Yup.object({
      providerName: Yup.string().required("Provider name is required"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const response = await AddProvider(values, setSubmitting);
      if (response) {
        resetForm(resetForm);
        setAddProvider(false);
        setShippingMethods((prev) => [response, ...prev]);
      }
    },
  });

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style} onSubmit={formik.handleSubmit}>
        <Typography variant="h6">Update Shipping Details</Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="contained"
            size="small"
            sx={{ textTransform: "none" }}
            onClick={() => setAddProvider(true)}
          >
            Add Provider
          </Button>
        </Box>

        {addProvider && (
          <Box component="form" onSubmit={providerFormik.handleSubmit} mb={2}>
            <Divider sx={{ my: 1 }} />
            <TextField
              fullWidth
              label="Provider Name"
              name="providerName"
              value={providerFormik.values.providerName}
              onChange={providerFormik.handleChange}
              error={
                providerFormik.touched.providerName &&
                Boolean(providerFormik.errors.providerName)
              }
              helperText={
                providerFormik.touched.providerName &&
                providerFormik.errors.providerName
              }
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                type="button"
                onClick={() => setAddProvider(false)}
                variant="outlined"
                fullWidth
                sx={{
                  textTransform: "none",
                  color: "gray",
                  borderColor: "gray",
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="contained"
                fullWidth
                sx={{ textTransform: "none" }}
                onClick={providerFormik.handleSubmit}
                disabled={providerFormik.isSubmitting}
              >
                Save Provider
              </Button>
            </Box>
          </Box>
        )}
        <Box component="form">
          <TextField
            fullWidth
            select
            label="Shipping Method"
            name="shippingMethodName"
            value={formik.values.shippingMethodName}
            onChange={handleSelectMethod}
            error={
              formik.touched.shippingMethodName &&
              formik.errors.shippingMethodName &&
              Boolean(formik.errors.shippingMethodName)
            }
            helperText={
              formik.touched.shippingMethodName &&
              formik.errors.shippingMethodName
            }
            sx={{ mb: 2 }}
          >
            {shippingMethods.map((method) => (
              <MenuItem key={method.providerName} value={method.providerName}>
                {method.providerName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Courier Partner"
            name="courierPartner"
            value={formik.values.courierPartner}
            onChange={formik.handleChange}
            error={
              formik.touched.courierPartner &&
              formik.errors.courierPartner &&
              Boolean(formik.errors.courierPartner)
            }
            helperText={
              formik.touched.courierPartner && formik.errors.courierPartner
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Tracking ID"
            name="trackingId"
            value={formik.values.trackingId}
            onChange={formik.handleChange}
            error={
              formik.touched.trackingId &&
              formik.errors.trackingId &&
              Boolean(formik.errors.trackingId)
            }
            helperText={formik.touched.trackingId && formik.errors.trackingId}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Estimated Delivery Date"
            type="date"
            name="estimatedDeliveryDate"
            value={formik.values.estimatedDeliveryDate}
            onChange={formik.handleChange}
            InputLabelProps={{ shrink: true }}
            error={
              formik.touched.estimatedDeliveryDate &&
              formik.errors.estimatedDeliveryDate &&
              Boolean(formik.errors.estimatedDeliveryDate)
            }
            helperText={
              formik.touched.estimatedDeliveryDate &&
              formik.errors.estimatedDeliveryDate
            }
            sx={{ mb: 2 }}
          />

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Save Shipping Details
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
