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
  Chip,
  TextField,
  MenuItem,
  TableSortLabel,
  IconButton,
  Tooltip,
} from "@mui/material";
import CategoryOffers from "../../Components/CategoryOffers/CategoryOffers";
import {
  deleteCategoryOffer,
  getCategoryOffers,
  toggleCategoryOffer,
} from "../../services/offerApiService";
import "./CategoryOfferPage.css";
import { MdOutlineEdit } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";
import Swal from "sweetalert2";

export default function CategoryOfferPage() {
  const [showForm, setShowForm] = useState(false);
  const [changed, setChanged] = useState(false);
  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [editData, setEditData] = useState(null);

  const adminToken = localStorage.getItem("remilletAdminTkn");

  useEffect(() => {
    getCategoryOffers(adminToken, setOffers);
  }, [adminToken, changed]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const filteredOffers = offers
    .filter((offer) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        offer.title?.toLowerCase().includes(term) ||
        offer.badge?.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? offer.isActive
          : !offer.isActive;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortBy) return 0;
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (typeof aVal === "string")
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      if (typeof aVal === "number" || aVal instanceof Date)
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      return 0;
    });

  // to change the status of the offer
  async function handleToggleStatus(offerId) {
    const response = await toggleCategoryOffer(offerId, adminToken);
    if (response) {
      setChanged((prev) => !prev);
    }
  }

  async function handleDelete(offerId) {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this offer!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await deleteCategoryOffer(offerId, adminToken);
        if (response) {
          setChanged((prev) => !prev);
          Swal.fire({
            title: "Deleted!",
            text: "This offer has been deleted.",
            icon: "success",
          });
        }
      }
    });
  }

  return (
    <div className="category-offer-page-container">
      <CategoryOffers
        setShowForm={setShowForm}
        showForm={showForm}
        setChanged={setChanged}
        editData={editData}
        cancelEdit={() => setEditData(null)}
      />

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Category Offers
        </Typography>

        {/* Search and Filter Controls */}
        <Box display="flex" gap={2} mb={2}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <TextField
            label="Status"
            select
            variant="outlined"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  { label: "Title", key: "title" },
                  { label: "Badge", key: "badge" },
                  { label: "Discount", key: "discountValue" },
                  { label: "Min Order", key: "minOrderValue" },
                  { label: "Max Order", key: "maxOrderValue" },
                  { label: "From", key: "validFrom" },
                  { label: "To", key: "validTo" },
                  { label: "Status", key: "isActive" },
                  { label: "Actions", key: "Actions" },
                ].map((col) => (
                  <TableCell key={col.key}>
                    <TableSortLabel
                      active={sortBy === col.key}
                      direction={sortBy === col.key ? sortOrder : "asc"}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOffers.map((offer) => (
                <TableRow key={offer._id}>
                  <TableCell>{offer.title}</TableCell>
                  <TableCell>{offer.badge}</TableCell>
                  <TableCell>
                    {offer.discountValue}{" "}
                    {offer.discountType === "percent" ? "%" : "₹"}
                  </TableCell>
                  <TableCell>{offer.minOrderValue}</TableCell>
                  <TableCell>{offer.maxOrderValue}</TableCell>
                  <TableCell>
                    {new Date(offer.validFrom).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(offer.validTo).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={offer.isActive ? "Active" : "Inactive"}
                      color={offer.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Toggle Status">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={offer.isActive}
                          onChange={() => handleToggleStatus(offer._id)}
                        />{" "}
                        <span className="slider round"></span>
                      </label>
                    </Tooltip>

                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() => {
                          setEditData(offer);
                          setShowForm(true);
                        }}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <MdOutlineEdit size={18} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleDelete(offer._id)}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <IoTrashOutline size={18} color="red" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  );
}
