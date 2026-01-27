import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  IconButton,
  InputLabel,
  FormControl,
  Box,
  Tooltip,
  TableSortLabel,
  Switch,
} from "@mui/material";
import { MdOutlineEdit } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";
import DiscountOffers from "../../Components/DiscountOffers/DiscountOffers";
import "./DiscountOfferPage.css";
import {
  deleteDiscountOffer,
  getDiscountOffers,
  toggleChangeDiscountOffer,
} from "../../services/offerApiService";
import dayjs from "dayjs";
import Swal from "sweetalert2";

export default function DiscountOfferPage() {
  const adminToken = localStorage.getItem("remilletAdminTkn");

  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [changed, setChanged] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    getDiscountOffers(adminToken, setOffers);
  }, [adminToken, changed]);

  // Handle sorting column and order
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Filtering + searching + sorting
  const filteredOffers = offers
    .filter((offer) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        offer.title.toLowerCase().includes(term) ||
        offer.badge.toLowerCase().includes(term) ||
        offer.discountValue.toString().toLowerCase().includes(term) ||
        offer.maxOrderValue.toString().toLowerCase().includes(term) ||
        offer.minOrderValue.toString().toLowerCase().includes(term);

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

      // Handle dates
      if (sortBy === "validFrom" || sortBy === "validTo") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      // Strings
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Numbers & Dates
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

  const paginatedOffers = filteredOffers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value));
    setPage(0);
  };

  const handleDelete = (id) => {
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
        const response = await deleteDiscountOffer(id, adminToken);

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
  };

  const handleToggleStatus = async (id) => {
    const response = await toggleChangeDiscountOffer(id, adminToken);
    if (response) {
      setChanged((prev) => !prev);
    }
  };

  return (
    <div className="discount-page-container">
      <DiscountOffers
        setChanged={setChanged}
        setShowForm={setShowForm}
        showForm={showForm}
        editData={editData}
        cancelEdit={() => setEditData(null)}
      />

      {/* Controls */}
      <Box className="discount-page-controls" sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 3 }}>
        <TextField
          label="Search Offers"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ backgroundColor: "white" }}
        />

        <FormControl size="small" sx={{ minWidth: 120, backgroundColor: "white" }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          mt: 3,
          overflowX: "auto",
          width: "100%",
        }}
      >
        <Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                {[
                  { key: "title", label: "Title" },
                  { key: "badge", label: "Badge" },
                  { key: "discountValue", label: "Discount" },
                  { key: "minOrderValue", label: "Min Order", width: 100 },
                  { key: "maxOrderValue", label: "Max Order", width: 100 },
                  { key: "validFrom", label: "Valid From" },
                  { key: "validTo", label: "Valid To" },
                ].map((col) => (
                  <TableCell
                    key={col.key}
                    sx={col.width ? { width: col.width } : undefined}
                  >
                    <TableSortLabel
                      active={sortBy === col.key}
                      direction={sortBy === col.key ? sortOrder : "asc"}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedOffers.map((offer) => (
                <TableRow key={offer._id} sx={{ "& td": { fontSize: "13px" } }}>
                  <TableCell>{offer.title}</TableCell>
                  <TableCell>{offer.badge}</TableCell>
                  <TableCell>
                    {offer.discountType === "flat"
                      ? `₹${offer.discountValue}`
                      : `${offer.discountValue}%`}
                  </TableCell>
                  <TableCell>{offer.minOrderValue}</TableCell>
                  <TableCell>{offer.maxOrderValue}</TableCell>
                  <TableCell sx={{ fontSize: "10px" }}>
                    {offer.validFrom
                      ? dayjs(offer.validFrom).format("DD MMM YYYY, hh:mm A")
                      : "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "10px" }}>
                    {offer.validTo
                      ? dayjs(offer.validTo).format("DD MMM YYYY, hh:mm A")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={offer.isActive ? "Active" : "Inactive"}
                      sx={{
                        backgroundColor: offer.isActive
                          ? "#edc862" // Gold
                          : "#d63031", // Danger red for inactive
                        color: "white",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ width: 150 }}>
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
              {paginatedOffers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No offers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
        {/* Pagination */}
        {paginatedOffers.length > 10 && (
          <TablePagination
            component="div"
            count={filteredOffers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        )}
      </TableContainer>
    </div>
  );
}
