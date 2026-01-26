import { useEffect } from "react";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import "./AdminUsers.css";
import {
  filterOrderCancelledUser,
  getAllUsers,
} from "../../services/adminApiServices";
import { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import { useNavigate } from "react-router-dom";
import {
  permanentlyBlockUser,
  toggleUserStatus,
} from "../../services/userApiServices";
import Swal from "sweetalert2";
import TextField from "@mui/material/TextField";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { statusSteps } from "../../constants";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  const [changed, setChanged] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromStatus, setFromStatus] = useState("Order Placed");
  const [toStatus, setToStatus] = useState("Delivered");
  const [tableUsers, setTableUsers] = useState([]);
  // const [cancelledUsers,setCancelledUsers] = useState([])
  const adminToken = localStorage.getItem("remilletAdminTkn");

  useEffect(() => {
    getAllUsers(setUsers);
  }, [changed]);

  useEffect(() => {
    if (users) {
      setTableUsers(users);
    }
  }, [users]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // function to change the user status
  async function changeUserStatus(userId) {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to change the user status!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const response = toggleUserStatus(userId, adminToken);
        if (response) {
          setChanged((prev) => !prev);
          Swal.fire({
            title: "Changed!",
            text: "The user status has been changed.",
            icon: "success",
          });
        }
      }
    });
  }

  // function to filter the user details
  const handleFilterUsers = async () => {

    if (!fromStatus || !toStatus) {
      return;
    }
    const response = await filterOrderCancelledUser(
      fromStatus,
      toStatus,
      adminToken
    );
    if (response) {
      setTableUsers(response);
    }
  };

  // block user
  async function BlockUser(userId) {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to Block the user!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Block!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await permanentlyBlockUser(userId, setChanged, adminToken);
        if (response) {
          setChanged((prev) => !prev);
          Swal.fire({
            title: "Blocked!",
            text: "The user  has been Blocked.",
            icon: "success",
          });
        }
      }
    });
  }

  return (
    <div className="admin-users-list-main-container">
      <AdminHeader title="Users Management" />
      <div className="admin-users-list-table-section">
        <div className="admin-users-controls-wrapper">
          <div className="admin-users-filters">
            <FormControl size="small" style={{ minWidth: "150px" }}>
              <InputLabel>From Status</InputLabel>
              <Select
                value={fromStatus}
                onChange={(e) => setFromStatus(e.target.value)}
                label="From Status"
              >
                {statusSteps.slice(0, -1).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" style={{ minWidth: "150px" }}>
              <InputLabel>To Status</InputLabel>
              <Select
                value={toStatus}
                onChange={(e) => setToStatus(e.target.value)}
                label="To Status"
              >
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleFilterUsers}
              sx={{
                backgroundColor: "var(--admin-accent-color)",
                textTransform: 'none',
                borderRadius: '8px',
                px: 3,
                '&:hover': { backgroundColor: '#d4b458' }
              }}
            >
              Apply Filter
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                setTableUsers(users);
                setFromStatus("Order Placed");
              }}
              sx={{
                borderColor: "var(--admin-accent-color)",
                color: "var(--admin-accent-color)",
                textTransform: 'none',
                borderRadius: '8px',
                px: 3,
                '&:hover': { borderColor: 'var(--admin-accent-hover)', backgroundColor: 'var(--admin-accent-light)' }
              }}
            >
              Reset
            </Button>
          </div>

          <div className="admin-users-search">
            <TextField
              fullWidth
              placeholder="Search by name or email..."
              variant="outlined"
              size="small"
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              InputProps={{
                sx: {
                  borderRadius: '8px',
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--admin-accent-color)',
                  }
                }
              }}
            />
          </div>
        </div>

        <TableContainer
          className="admin-users-table-container"
          component={Paper}
          elevation={0}
        >
          <Table className="admin-users-table" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell width="80px" align="center">Sl No.</TableCell>
                <TableCell>User Details</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Blocking</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableUsers
                .filter(
                  (user) =>
                    user.firstName.toLowerCase().includes(searchTerm) ||
                    user.lastName.toLowerCase().includes(searchTerm) ||
                    user.email.toLowerCase().includes(searchTerm)
                )
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user, index) => (
                  <TableRow key={user._id}>
                    <TableCell align="center" style={{ color: 'var(--admin-text-secondary)' }}>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box sx={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>
                          {`${user?.firstName} ${user?.lastName}`}
                        </Box>
                        <Box sx={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)' }}>
                          {user?.email}
                        </Box>
                        {!user.status && (
                          <div className="inactive-notice">
                            User account is currently restricted
                          </div>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <button
                        className={`status-badge ${user?.status ? "active" : "inactive"}`}
                        onClick={() => changeUserStatus(user._id)}
                      >
                        {user?.status ? "Active" : "Inactive"}
                      </button>
                    </TableCell>
                    <TableCell align="center">
                      <button
                        className={`block-badge ${user?.isBlocked ? "blocked" : "not-blocked"}`}
                        onClick={() => BlockUser(user._id)}
                      >
                        {user?.isBlocked ? "Blocked" : "Clear"}
                      </button>
                    </TableCell>
                    <TableCell align="right">
                      <button
                        className="admin-view-btn"
                        onClick={() => navigate(`/admin/users/${user._id}`)}
                      >
                        View Profile
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={users.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            mt: 2,
            border: "1px solid var(--admin-accent-light)",
            borderRadius: "var(--admin-radius)",
            backgroundColor: "white",
            boxShadow: "var(--admin-shadow)",
            '& .MuiTablePagination-selectIcon': { color: 'var(--admin-accent-color)' }
          }}
        />
      </div>
    </div>
  );
}

