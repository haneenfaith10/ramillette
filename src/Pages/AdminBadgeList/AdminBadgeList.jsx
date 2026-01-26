import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  TextField,
  Tooltip,
} from "@mui/material";
import { deleteBadge, getAllBadges } from "../../services/badgeApiServices";
import "./AdminBadgeList.css";
import { MdOutlineEdit } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";

export default function AdminBadgeList() {
  const [badges, setBadges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isSubmitting, setSubmitting] = useState(false);
  const adminToken = localStorage.getItem("remilletAdminTkn");

  useEffect(() => {
    getAllBadges(setBadges, adminToken);
  }, [adminToken]);

  const handleEdit = (badgeId) => {
    navigate(`/admin/edit-badge/${badgeId}`);
  };

  const handleDelete = (badgeId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete the badge!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await deleteBadge(badgeId, setSubmitting);
        if (response) {
          Swal.fire({
            title: "Deleted!",
            text: "The Badge has been deleted.",
            icon: "success",
          });
          setBadges(response.badges);
        }
      }
    });
  };

  const filteredBadges = badges.filter((badge) =>
    badge.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box className="admin-badge-wrapper">
      <AdminHeader title="Feature Badges" />

      {/* Filters & Actions Row */}
      <Box className="admin-banner-list-filters">
        <TextField
          label="Search by badge label"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ backgroundColor: "white", borderRadius: "10px", minWidth: 300, "& fieldset": { borderRadius: "10px" } }}
        />

        <Box sx={{ flexGrow: 1 }} />

        <button
          className="admin-add-category-submit-btn-wrapper"
          style={{ width: "auto", margin: 0, border: "none" }}
          onClick={() => navigate("/admin/create-badge")}
        >
          <Box component="span" sx={{ px: 2, py: 1.2, backgroundColor: "#edc862", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: 1, color: "#333", boxShadow: "0 4px 12px rgba(237, 200, 98, 0.3)" }}>
            Add New Badge
          </Box>
        </button>
      </Box>

      <div className="admin-banner-list-section">
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Icon</TableCell>
                <TableCell>Label</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBadges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                    <Typography variant="h6" color="textSecondary">
                      No badges found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBadges.map((badge) => (
                  <TableRow hover key={badge._id}>
                    <TableCell>
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}${badge.iconUrl}`}
                        alt={badge.label}
                        className="badge-icon-cell"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: "#444" }}>
                        {badge.label}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                        <div
                          className="admin-banner-action-btn edit-btn"
                          onClick={() => handleEdit(badge._id)}
                        >
                          <MdOutlineEdit size={20} color="white" />
                        </div>
                        <div
                          className="admin-banner-action-btn delete-btn"
                          onClick={() => !isSubmitting && handleDelete(badge._id)}
                          style={{ opacity: isSubmitting ? 0.5 : 1 }}
                        >
                          <IoTrashOutline size={20} color="white" />
                        </div>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Box>
  );
}
