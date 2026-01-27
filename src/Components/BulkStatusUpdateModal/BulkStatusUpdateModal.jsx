import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 450,
  maxWidth: "90%",
  bgcolor: "background.paper",
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  p: 4,
  border: "2px solid rgba(237, 200, 98, 0.2)",
  animation: "slideUp 0.3s ease-out",
  "@keyframes slideUp": {
    from: {
      transform: "translate(-50%, -45%)",
      opacity: 0,
    },
    to: {
      transform: "translate(-50%, -50%)",
      opacity: 1,
    },
  },
};

export default function BulkStatusUpdateModal({
  open,
  onClose,
  onSubmit,
  selectedCount,
}) {
  const [status, setStatus] = useState("");

  const handleSubmit = () => {
    if (status) {
      onSubmit(status);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{
            fontWeight: 700,
            fontSize: "1.5rem",
            background: "linear-gradient(135deg, #edc862 0%, #d4b050 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            mb: 2,
          }}
        >
           Bulk Status Update
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 3,
            color: "#64748b",
            fontSize: "0.95rem",
            lineHeight: 1.6,
          }}
        >
          You're updating status for <strong style={{ color: "#edc862" }}>{selectedCount}</strong> selected
          orders.
        </Typography>

        <FormControl fullWidth>
          <InputLabel id="bulk-status-select-label">Select Status</InputLabel>
          <Select
            labelId="bulk-status-select-label"
            value={status}
            label="Select Status"
            onChange={(e) => setStatus(e.target.value)}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 200,
                  overflowY: "auto",
                },
              },
            }}
          >
            <MenuItem value="Processing">Processing</MenuItem>
            <MenuItem value="Packed">Packed</MenuItem>
            <MenuItem value="Shipped">Shipped</MenuItem>
            <MenuItem value="Out for delivery">Out for delivery</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
            <MenuItem value="Delayed">Delayed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
            <MenuItem value="Returned">Returned</MenuItem>
            <MenuItem value="Refund processing">Refund processing</MenuItem>
            <MenuItem value="Refunded">Refunded</MenuItem>
          </Select>
        </FormControl>

        <Box 
          mt={3} 
          display="flex" 
          justifyContent="flex-end" 
          gap={2}
          sx={{
            pt: 3,
            borderTop: "2px solid #f1f5f9",
          }}
        >
          <Button 
            onClick={onClose} 
            variant="outlined"
            sx={{
              borderRadius: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontWeight: 600,
              padding: "10px 24px",
              borderColor: "#e5e7eb",
              color: "#475569",
              "&:hover": {
                borderColor: "#d1d5db",
                background: "#f9fafb",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!status}
            sx={{
              background: status 
                ? "linear-gradient(135deg, #edc862 0%, #d4b050 100%)"
                : "#d1d5db",
              color: status ? "#1a1a1a" : "#9ca3af",
              borderRadius: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontWeight: 600,
              padding: "10px 24px",
              boxShadow: status ? "0 4px 15px rgba(237, 200, 98, 0.3)" : "none",
              "&:hover": {
                background: status 
                  ? "linear-gradient(135deg, #d4b050 0%, #edc862 100%)"
                  : "#d1d5db",
                transform: status ? "translateY(-2px)" : "none",
                boxShadow: status ? "0 6px 20px rgba(237, 200, 98, 0.4)" : "none",
              },
              "&.Mui-disabled": {
                background: "#d1d5db",
                color: "#9ca3af",
              },
            }}
          >
            Update All
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
