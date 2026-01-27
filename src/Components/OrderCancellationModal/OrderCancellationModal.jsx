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
  maxWidth: "600px",
  bgcolor: "background.paper",
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  p: 4,
  border: "2px solid rgba(239, 68, 68, 0.2)",
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
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              "& fieldset": {
                borderColor: "#f5e6c8",
                borderWidth: 2,
              },
              "&:hover fieldset": {
                borderColor: "#edc862",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#edc862",
                boxShadow: "0 0 0 4px rgba(237, 200, 98, 0.1)",
              },
            },
            "& .MuiInputLabel-root": {
              color: "#64748b",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#edc862",
            },
          }}
        />

        <Box
          sx={{ 
            display: "flex", 
            justifyContent: "flex-end", 
            mt: 3, 
            gap: 2,
            pt: 3,
            borderTop: "2px solid #f1f5f9",
          }}
        >
          <Button 
            variant="outlined" 
            onClick={handleClose}
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
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCancelOrder}
            sx={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              borderRadius: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontWeight: 600,
              padding: "10px 24px",
              boxShadow: "0 4px 15px rgba(245, 87, 108, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(245, 87, 108, 0.4)",
              },
            }}
          >
            Cancel Order
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
