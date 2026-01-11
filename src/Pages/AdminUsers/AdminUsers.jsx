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
    }).then(async(result) => {
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
      <AdminHeader title="users" />
      <div className="admin-users-list-table-section">
        <div>
          <FormControl
            size="small"
            style={{ width: "180px", marginRight: "16px" }}
          >
            <InputLabel>From</InputLabel>
            <Select
              value={fromStatus}
              onChange={(e) => setFromStatus(e.target.value)}
              label="From"
            >
              {statusSteps.slice(0, -1).map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            style={{ width: "180px", marginRight: "16px" }}
          >
            <InputLabel>To</InputLabel>
            <Select
              value={"Cancelled"}
              onChange={(e) => setToStatus(e.target.value)}
              label="To"
            >
              <MenuItem value="Cancelled" defaultChecked>
                Cancelled
              </MenuItem>
            </Select>
          </FormControl>
          <FormControl
            size="small"
            style={{ width: "180px", marginRight: "16px" }}
          >
            <Button
              variant="contained"
              className="filter-btn"
              onClick={handleFilterUsers}
              sx={{ backgroundColor: "var(--secondary-color)" }}
            >
              Filter
            </Button>
          </FormControl>
          <FormControl
            size="small"
            style={{ width: "180px", marginRight: "16px" }}
          >
            <Button
              variant="contained"
              className="filter-btn"
              onClick={() => {
                setTableUsers(users);
              }}
              sx={{ backgroundColor: "#ccc", width: "fit-content" }}
            >
              Clear
            </Button>
          </FormControl>
        </div>
        <div style={{ marginBottom: "16px", textAlign: "right" }}>
          <TextField
            label="Search users"
            variant="outlined"
            size="small"
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            style={{ width: "250px" }}
          />
        </div>

        <TableContainer
          component={Paper}
          sx={{ boxShadow: "0px 2px 10px #E0E0E0" }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Sl No.</TableCell>
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">Email</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Blocked</TableCell>
                <TableCell align="center">Actions</TableCell>
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
                  <TableRow
                    key={user._id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell align="center">
                      {`${user?.firstName} ${user?.lastName}`}
                    </TableCell>
                    <TableCell align="center">
                      <Box>
                        {" "}
                        {user?.email}
                        {!user.status && (
                          <p
                            style={{
                              color: "red",
                              fontWeight: "bold",
                              fontSize: "10px",
                            }}
                          >
                            The user is inactive, so some functionalities are
                            limited.
                          </p>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <button
                        className={`admin-table-user-status ${
                          user?.status ? "active" : "inactive"
                        }`}
                        onClick={() => changeUserStatus(user._id)}
                      >
                        {user?.status ? "Active" : "Inactive"}
                      </button>
                    </TableCell>
                    <TableCell align="center">
                      <button
                        className={`admin-table-user-status ${
                          !user?.isBlocked ? "active" : "inactive"
                        }`}
                        onClick={() => BlockUser(user._id)}
                      >
                        {user?.isBlocked ? "Blocked" : "Not Blocked"}
                      </button>
                    </TableCell>
                    <TableCell align="center">
                      <button
                        className="admin-table-user-view-btn"
                        onClick={() => navigate(`/admin/users/${user._id}`)}
                      >
                        View
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
          sx={{
            border: "1px solid #E0E0E0",
            background: "white",
            boxShadow: "0px 2px 10px #E0E0E0",
          }}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
    </div>
  );
}
