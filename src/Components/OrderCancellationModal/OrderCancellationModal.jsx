import { useState } from "react";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { cancelOrderByAdmin } from "../../services/orderApiService";
import Swal from "sweetalert2";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  bgcolor: "background.paper",
  borderRadius: "12px",
  boxShadow: 24,
  p: 4,
};

export default function OrderCancellationModal({
  open,
  handleClose,
  orderId,
  setUpdated,
}) {
  const [reason, setReason] = useState("");

  const handleCancelOrder = async () => {
    if (reason.trim().length === 0) return alert("Please provide a reason.");
    // onCancel(orderId, reason);
    const response = await cancelOrderByAdmin(orderId, reason);
    if (response) {
      setUpdated((prev) => !prev);
      Swal.fire({
        title: "Cancelled!",
        text: "The user order has been cancelled.",
        icon: "success",
      });
    }
    setReason("");
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="cancel-order-title"
      aria-describedby="cancel-order-description"
    >
      <Box sx={style}>
        <Typography id="cancel-order-title" variant="h6" gutterBottom>
          Cancel Order
        </Typography>
        <Typography id="cancel-order-description" sx={{ mb: 2, fontSize: 14 }}>
          Reason provided by the user for cancelling this order. This helps us
          understand customer concerns.
        </Typography>

        <TextField
          label="Cancellation Reason"
          multiline
          rows={4}
          fullWidth
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Type your reason here..."
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "black",
              },
              "&:hover fieldset": {
                borderColor: "black",
              },
              "&.Mui-focused fieldset": {
                borderColor: "black",
              },
            },
            "& .MuiInputLabel-root": {
              color: "black",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "black",
            },
          }}
        />

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}
        >
          <Button variant="outlined" onClick={handleClose}>
            Close
          </Button>
          <Button variant="contained" color="error" onClick={handleCancelOrder}>
            Cancel Order
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
