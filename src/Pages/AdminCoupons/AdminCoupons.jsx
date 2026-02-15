import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Typography,
  Box,
  Chip,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import {
  getCoupons,
  deleteCoupon,
  updateCoupon,
} from "../../services/couponService";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import "./AdminCoupons.css";
import { MdOutlineEdit } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";
import { useNavigate, Link } from "react-router-dom";
import Switch from "@mui/material/Switch";
import Swal from "sweetalert2";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();

  const fetchCouponsList = async () => {
    try {
      const response = await getCoupons();
      if (response.isSuccess) {
        setCoupons(response.coupons);
      }
    } catch (error) {
      console.error("Error fetching coupons", error);
    }
  };

  useEffect(() => {
    fetchCouponsList();
  }, []);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredCoupons = coupons.filter((coupon) => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Active") return coupon.isActive;
    if (statusFilter === "Inactive") return !coupon.isActive;
    if (statusFilter === "Expired")
      return new Date(coupon.endDate) < new Date();
    return true;
  });

  const paginatedData = filteredCoupons.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteCoupon(id);
          if (response.isSuccess) {
            fetchCouponsList();
            Swal.fire("Deleted!", "Coupon has been deleted.", "success");
          }
        } catch (error) {
          console.error("Delete error", error);
        }
      }
    });
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await updateCoupon(id, { isActive: !currentStatus });
      if (response.isSuccess) {
        fetchCouponsList();
      }
    } catch (error) {
      console.error("Toggle status error", error);
    }
  };

  return (
    <Box className="admin-coupons-container">
      <AdminHeader title="Dynamic Coupons" />

      <Box
        className="admin-coupons-filters"
        sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}
      >
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ borderRadius: "10px", backgroundColor: "white" }}
          >
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
            <MenuItem value="Expired">Expired</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        <Link
          to="/admin/add-dynamic-coupon"
          className="admin-add-category-submit-btn-wrapper"
          style={{ textDecoration: "none", width: "auto", margin: 0 }}
        >
          <Box
            component="span"
            sx={{
              px: 3,
              py: 1.5,
              backgroundColor: "#edc862",
              borderRadius: "10px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "white",
            }}
          >
            Create New Coupon
          </Box>
        </Link>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Code</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Discount</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Usage</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Expiry</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Status
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((coupon) => (
              <TableRow key={coupon._id} hover>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "bold",
                      color: "#333",
                      backgroundColor: "#f0f0f0",
                      px: 1,
                      py: 0.5,
                      borderRadius: "4px",
                      display: "inline-block",
                    }}
                  >
                    {coupon.code}
                  </Typography>
                </TableCell>
                <TableCell>{coupon.title}</TableCell>
                <TableCell>
                  <Chip
                    label={coupon.discountType.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor:
                        coupon.discountType === "flat" ? "#e3f2fd" : "#f3e5f5",
                      color:
                        coupon.discountType === "flat" ? "#1976d2" : "#7b1fa2",
                      fontWeight: "bold",
                      fontSize: "10px",
                    }}
                  />
                </TableCell>
                <TableCell>
                  {coupon.discountValue}
                  {coupon.discountType === "percentage" ? "%" : "₹"}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography variant="caption" color="textSecondary">
                      {coupon.usedCount} / {coupon.usageLimit || "∞"}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: "9px" }}>
                      Per User: {coupon.usagePerUser}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography variant="caption">
                      Start: {new Date(coupon.startDate).toLocaleDateString()}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color:
                          new Date(coupon.endDate) < new Date()
                            ? "red"
                            : "inherit",
                      }}
                    >
                      End: {new Date(coupon.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Chip
                      label={coupon.isActive ? "Active" : "Inactive"}
                      size="small"
                      sx={{
                        backgroundColor: coupon.isActive
                          ? "#e8f5e9"
                          : "#ffebee",
                        color: coupon.isActive ? "#2e7d32" : "#c62828",
                        fontWeight: "bold",
                        fontSize: "10px",
                        mb: 0.5,
                      }}
                    />
                    <Switch
                      size="small"
                      checked={coupon.isActive}
                      onChange={() =>
                        handleToggleStatus(coupon._id, coupon.isActive)
                      }
                      color="warning"
                    />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{ display: "flex", gap: 1, justifyContent: "center" }}
                  >
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() =>
                          navigate(`/admin/edit-dynamic-coupon/${coupon._id}`)
                        }
                        sx={{
                          backgroundColor: "#f5f5f5",
                          "&:hover": { backgroundColor: "#fffde7" },
                        }}
                        size="small"
                      >
                        <MdOutlineEdit size={18} color="#fbc02d" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleDelete(coupon._id)}
                        sx={{
                          backgroundColor: "#f5f5f5",
                          "&:hover": { backgroundColor: "#ffebee" },
                        }}
                        size="small"
                      >
                        <IoTrashOutline size={18} color="#d32f2f" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography variant="h6" color="textSecondary">
                    No coupons found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredCoupons.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </Box>
  );
}
