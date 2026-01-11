import { useEffect, useState } from "react";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import "./AdminCategories.css";
import {
  deleteCategory,
  getCategories,
  toggleCategoryStatus,
} from "../../services/categoryApiServices";
import { MdOutlineEdit } from "react-icons/md";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import { Link } from "react-router-dom";
import { IoTrashOutline } from "react-icons/io5";
import Swal from "sweetalert2";

export default function AdminCategories() {
  const [categoryData, setCategoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [changed, setChanged] = useState(false);
  useEffect(() => {
    getCategories(setCategoryData);
  }, [changed]);

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtered and paginated data
  const filteredData = categoryData.filter((item) =>
    item.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // function to delete the deleteCategoryItem
  function deleteCategoryItem(categoryId) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't to delete the category!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = deleteCategory(categoryId, setChanged);
        if (response) {
          Swal.fire({
            title: "Deleted!",
            text: "Category has been deleted.",
            icon: "success",
          });
        }
      }
    });
  }

  // function to change category status
  function changeStatus(catId) {
    toggleCategoryStatus(catId, setChanged);
  }

  return (
    <div className="admin-categories-main-container">
      <AdminHeader title="Product Categories" />

      {/* Search Bar */}
      <div className="admin-category-search-wrapper">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-category-search-input"
        />
      </div>

      {/* Table */}
      <div className="admin-category-list-section">
        <TableContainer component={Paper}>
          <Table
            sx={{ minWidth: 650, border: "1px solid #ccc" }}
            aria-label="category table"
          >
            <TableHead>
              <TableRow>
                <TableCell align="center">SI No.</TableCell>
                <TableCell align="center">Category</TableCell>
                <TableCell align="center">Image</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center" sx={{ maxWidth: "50px" }}>
                  Change Status
                </TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow key={row._id}>
                  <TableCell align="center" sx={{ padding: "0px" }}>
                    {page * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell sx={{ padding: "0px" }} align="center">
                    {row.categoryName}
                  </TableCell>
                  <TableCell sx={{ padding: "0px" }} align="center">
                    <div className="admin-category-list-image">
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}/${
                          row.categoryImage
                        }`}
                        alt=""
                        style={{ height: "50px", objectFit: "contain" }}
                      />
                    </div>
                  </TableCell>
                  <TableCell sx={{ padding: "0px" }} align="center">
                    {row.status ? "Active" : "Inactive"}
                  </TableCell>
                  <TableCell sx={{ padding: "0px" }} align="center">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={row.status}
                        onChange={() => {
                          changeStatus(row._id);
                        }}
                      />{" "}
                      <span className="slider round"></span>
                    </label>
                  </TableCell>
                  <TableCell
                    sx={{
                      padding: "16px 0",
                      display: "flex",
                      gap: "1rem",
                      justifyContent: "center",
                    }}
                    align="center"
                  >
                    <Link to={`/admin/edit-category/${row._id}`}>
                      <MdOutlineEdit size={18} color="blue" />
                    </Link>
                    <IoTrashOutline
                      size={18}
                      style={{ cursor: "pointer", color: "red" }}
                      onClick={() => deleteCategoryItem(row._id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination */}
          {categoryData.length > 5 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </TableContainer>
      </div>
    </div>
  );
}
