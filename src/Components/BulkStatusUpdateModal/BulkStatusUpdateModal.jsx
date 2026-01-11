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
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
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
        <Typography variant="h6" gutterBottom>
          Bulk Status Update
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          You're updating status for <strong>{selectedCount}</strong> selected
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

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button onClick={onClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!status}
          >
            Update All
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
