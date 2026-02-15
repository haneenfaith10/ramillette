import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Button,
  Divider,
} from "@mui/material";
import { IoClose } from "react-icons/io5";
import { RiCoupon2Line } from "react-icons/ri";
import "./CouponModal.css";

const CouponModal = ({ open, onClose, coupons, onApply, appliedCode }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "16px", padding: "8px" },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Available Coupons
        </Typography>
        <IconButton onClick={onClose} aria-label="close">
          <IoClose />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        {coupons.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography color="textSecondary">
              No coupons available at the moment.
            </Typography>
          </Box>
        ) : (
          <Box className="coupon-list">
            {coupons.map((coupon) => (
              <Box key={coupon._id} className="coupon-item">
                <Box className="coupon-details">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <RiCoupon2Line size={24} color="#edc862" />
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      className="coupon-code"
                    >
                      {coupon.code}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="600" color="#333">
                    {coupon.title}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {coupon.description}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, color: "#2e7d32", fontWeight: "600" }}
                  >
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% OFF`
                      : `FLAT ${coupon.discountValue} OFF`}
                    {coupon.maxDiscountAmount &&
                      ` up to ${coupon.maxDiscountAmount}`}
                  </Typography>
                </Box>
                <Box className="coupon-action">
                  <Button
                    variant="outlined"
                    disabled={appliedCode === coupon.code}
                    onClick={() => {
                      onApply(coupon.code);
                      onClose();
                    }}
                    sx={{
                      borderRadius: "8px",
                      borderColor: "#edc862",
                      color: "#b99a45",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "rgba(237, 200, 98, 0.1)",
                        borderColor: "#d4b458",
                      },
                      "&.Mui-disabled": {
                        backgroundColor: "#f5f5f5",
                        borderColor: "#e0e0e0",
                        color: "#999",
                      },
                    }}
                  >
                    {appliedCode === coupon.code ? "Applied" : "Apply"}
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CouponModal;
