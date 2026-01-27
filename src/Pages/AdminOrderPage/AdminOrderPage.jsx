import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import "./AdminOrderPage.css";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import { useEffect, useState } from "react";
import {
  bulkOrderStatusUpdate,
  getAllOrders,
} from "../../services/orderApiService";
import { MdOutlineMoreVert } from "react-icons/md";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { IoDocumentText } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import EmptyData from "../../assets/svg/empty-data.svg";
import ShippingDetailsModal from "../../Components/ShippingDetailsModal/ShippingDetailsModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import OrderStatusUpdate from "../../Components/OrderStatusUpdate/OrderStatusUpdate";
import { statusColors } from "../../constants";
import OrderCancellationModal from "../../Components/OrderCancellationModal/OrderCancellationModal";
import { Box, Checkbox, Tooltip } from "@mui/material";
import BulkStatusUpdateModal from "../../Components/BulkStatusUpdateModal/BulkStatusUpdateModal";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa6";
import { TableSortLabel } from "@mui/material";

export default function AdminOrderPage() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusData, setStatusData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  // const [sortKey, setSortKey] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingModalData, setShippingModalData] = useState({});
  const [updated, setUpdated] = useState(false);
  const [showStatusModal, setShowShowModal] = useState(false);
  const [showCancellationReason, setShowCancellationReason] = useState(false);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const adminToken = localStorage.getItem("remilletAdminTkn");
  const [orderBy, setOrderBy] = useState("date");
  const [orderDirection, setOrderDirection] = useState("desc");

  const handleMenuOpen = (event, order) => {
    setAnchorEl(event.currentTarget);
    setStatusData(order);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setStatusData({});
  };
  const handleSort = (key) => {
    if (orderBy === key) {
      // toggle direction
      setOrderDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setOrderBy(key);
      setOrderDirection("asc");
    }
  };

  useEffect(() => {
    (async () => {
      const response = await getAllOrders(page + 1, rowsPerPage, adminToken);
      if (response) {
        setOrders(response.orders);
        setTotalOrders(response.totalOrders);
      }
    })();
  }, [page, rowsPerPage, updated, adminToken]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const clearFilters = () => {
    setSearchQuery("");
    // setSortKey("");
    setStatusFilter("");
  };

  const filteredOrders = orders.filter((order) => {
    const name =
      `${order?.user?.firstName} ${order?.user?.lastName}`.toLowerCase();
    const email = order?.user?.email?.toLowerCase();
    const id = order?._id?.toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      name.includes(q) || email.includes(q) || id.includes(q);
    const matchesStatus = !statusFilter || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let compare = 0;

    if (orderBy === "customerName") {
      const nameA = `${a?.user?.firstName} ${a?.user?.lastName}`.toLowerCase();
      const nameB = `${b?.user?.firstName} ${b?.user?.lastName}`.toLowerCase();
      compare = nameA.localeCompare(nameB);
    } else if (orderBy === "products") {
      const productA = a?.orderItems?.[0]?.productId?.productName || "";
      const productB = b?.orderItems?.[0]?.productId?.productName || "";
      compare = productA.localeCompare(productB);
    } else if (orderBy === "date") {
      compare = new Date(a.createdAt) - new Date(b.createdAt);
    } else if (orderBy === "totalPrice") {
      compare = a.subTotalPrice - b.subTotalPrice;
    }

    return orderDirection === "asc" ? compare : -compare;
  });

  const style = {
    borderRadius: 1,
    fontSize: "14px",
  };

  function closeShippingModal() {
    setShowShippingModal(false);
  }

  // function to refresh and get the order data
  function refreshOrder() {
    setUpdated((prev) => !prev);
  }

  const downloadExcel = () => {
    const title = [["User Orders Report"]];
    const headers = [
      [
        "Sl No.",
        "Name",
        "Email",
        "Order ID",
        "Total Price",
        "Status",
        "Created At",
        "Order Items",
      ],
    ];

    const data = sortedOrders.map((order, index) => {
      const itemString = order.orderItems
        ?.map(
          (item, i) =>
            `#${i + 1}: ${item?.productId?.productName || ""}( ${
              item.variantName
            }) (${item?.qty}) @ ${item?.finalPrice}`
        )
        .join("; ");

      return [
        index + 1,
        `${order?.user?.firstName} ${order?.user?.lastName}`,
        order?.user?.email,
        order?._id,
        `${order?.subTotalPrice} ${order?.currency}`,
        order?.status,
        new Date(order?.createdAt).toLocaleString(),
        itemString,
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([...title, ...headers, ...data]);

    worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];

    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 20 },
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
      { wch: 25 },
      { wch: 50 }, // Order Items
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(blob, `Orders_${new Date().toISOString()}.xlsx`);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("User Orders Report", 14, 20);

    const headers = [
      [
        "Sl No.",
        "Name",
        "Email",
        "Order ID",
        "Total Price",
        "Status",
        "Created At",
        "Order Items",
      ],
    ];

    const data = sortedOrders.map((order, index) => {
      const itemString = order.orderItems
        ?.map(
          (item, i) =>
            `#${i + 1}: ${item?.productId?.productName || ""}( ${
              item.variantName
            }) (${item?.qty}) @ ${item?.finalPrice}`
        )
        .join("; ");

      return [
        index + 1,
        `${order?.user?.firstName} ${order?.user?.lastName}`,
        order?.user?.email,
        order?._id,
        `${order?.subTotalPrice} ${order?.currency}`,
        order?.status,
        new Date(order?.createdAt).toLocaleString(),
        itemString,
      ];
    });

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 30,
      styles: {
        fontSize: 8,
        overflow: "linebreak",
        cellPadding: 2,
      },
      headStyles: { fillColor: [22, 160, 133] },
      columnStyles: {
        8: { cellWidth: 70 },
      },
    });

    doc.save(`Orders_${new Date().toISOString()}.pdf`);
  };

  // function to cancel the order by admin
  function cancelOrder() {
    setAnchorEl(false);
    setShowCancellationReason(true);
  }

  // to close the update state modal
  function handleCloseStatusModal() {
    setShowShowModal(false);
  }

  // function to update the status of bulk orders
  async function updateBulkOrder(newStatus, selectedOrders) {
    const response = await bulkOrderStatusUpdate(newStatus, selectedOrders);
    if (response) {
      setUpdated((prev) => !prev);
      setSelectedOrders([]);
      Swal.fire({
        title: "Updated!",
        text: "The selected order status are changed successfully!.",
        icon: "success",
      });
    }
  }

  return (
    <div className="admin-orders-main-container">
      <AdminHeader title="User Orders" />
      <ShippingDetailsModal
        open={showShippingModal}
        handleClose={closeShippingModal}
        order={shippingModalData}
        refreshOrder={refreshOrder}
      />
      <OrderCancellationModal
        open={showCancellationReason}
        handleClose={() => setShowCancellationReason(false)}
        orderId={statusData._id}
        setUpdated={setUpdated}
      />
      <BulkStatusUpdateModal
        open={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        selectedCount={selectedOrders.length}
        onSubmit={(newStatus) => {
          updateBulkOrder(newStatus, selectedOrders);
        }}
      />
      <div className="admin-order-filters">
        <input
          type="text"
          placeholder=" Search by name, email, or ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-order-search-input"
        />

        <select
          className="admin-order-filter-select"
          value={statusFilter}
          onChange={(e) => {
            setRowsPerPage(100);
            setStatusFilter(e.target.value);
          }}
        >
          <option value="">All Statuses</option>
          <option value="Processing">Processing</option>
          <option value="Out for delivery">Out for delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Returned">Returned</option>
          <option value="Packed">Packed</option>
          <option value="Shipped">Shipped</option>
          <option value="Refund processing">Refund processing</option>
          <option value="Refunded">Refunded</option>
        </select>

        <button onClick={clearFilters} className="clear-filter-btn">
          Clear Filters
        </button>
        <button
          onClick={downloadExcel}
          className="download-excel-btn"
          disabled={!sortedOrders.length}
        >
           Download Excel
        </button>

        <button
          onClick={downloadPDF}
          className="download-pdf-btn"
          disabled={!sortedOrders.length}
        >
           Download PDF
        </button>
      </div>
      {selectedOrders.length > 0 && (
        <div className="bulk-update-btn-wrapper">
          <button
            onClick={() => setShowBulkModal(true)}
            className="bulk-update-status-btn"
          >
            Update Status for {selectedOrders.length} Selected Orders
          </button>
        </div>
      )}

      <div className="admin-orders-table-container">
        <TableContainer
          component={Paper}
          sx={{ 
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            borderRadius: "16px",
            overflow: "hidden"
          }}
        >
          <Table
            sx={{
              minWidth: 650,
              "& td, & th": {
                fontSize: "13px",
              },
            }}
            aria-label="orders table"
          >
            <TableHead>
              <TableRow>
                <TableCell>Sl No.</TableCell>
                <TableCell padding="checkbox">
                  <input
                    type="checkbox"
                    ref={(el) => {
                      if (el) {
                        el.indeterminate =
                          selectedOrders.length > 0 &&
                          selectedOrders.length < sortedOrders.length;
                      }
                    }}
                    checked={
                      sortedOrders.length > 0 &&
                      selectedOrders.length === sortedOrders.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders(
                          sortedOrders.map((order) => order._id)
                        );
                      } else {
                        setSelectedOrders([]);
                      }
                    }}
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={orderBy === "customerName"}
                    direction={
                      orderBy === "customerName" ? orderDirection : "asc"
                    }
                    onClick={() => handleSort("customerName")}
                  >
                    Customer Name
                  </TableSortLabel>
                </TableCell>

                <TableCell align="center">
                  <TableSortLabel
                    active={orderBy === "products"}
                    direction={orderBy === "products" ? orderDirection : "asc"}
                    onClick={() => handleSort("products")}
                  >
                    Products
                  </TableSortLabel>
                </TableCell>

                <TableCell align="center">
                  <TableSortLabel
                    active={orderBy === "date"}
                    direction={orderBy === "date" ? orderDirection : "asc"}
                    onClick={() => handleSort("date")}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>

                <TableCell align="center">
                  <TableSortLabel
                    active={orderBy === "totalPrice"}
                    direction={
                      orderBy === "totalPrice" ? orderDirection : "asc"
                    }
                    onClick={() => handleSort("totalPrice")}
                  >
                    Total Price
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center" sx={{ width: 200 }}>
                  Status
                </TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <div style={{ textAlign: "center", color: "#64748b" }}>
                      <img
                        src={EmptyData}
                        alt="No Orders"
                        style={{ 
                          width: 120, 
                          marginBottom: 20,
                          opacity: 0.8,
                          filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))"
                        }}
                      />
                      <div style={{ 
                        fontSize: 20, 
                        fontWeight: 600,
                        marginBottom: 8,
                        color: "#334155"
                      }}>
                        No orders found
                      </div>
                      <div style={{ 
                        fontSize: 14, 
                        color: "#94a3b8"
                      }}>
                        {searchQuery || statusFilter 
                          ? "Try adjusting your filters" 
                          : "No orders available at the moment"}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedOrders.map((order, index) => (
                  <TableRow key={order._id}>
                    <TableCell align="center">
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell padding="checkbox" sx={{ width: "48px" }}>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders((prev) => [...prev, order._id]);
                          } else {
                            setSelectedOrders((prev) =>
                              prev.filter((id) => id !== order._id)
                            );
                          }
                        }}
                        style={{
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {`${order?.user?.firstName} ${order?.user?.lastName}`}
                    </TableCell>
                    <TableCell align="center">
                      {order?.orderItems?.length > 0 ? (
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <span
                            style={{
                              maxWidth: "150px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "inline-block",
                            }}
                          >
                            {order.orderItems[0]?.productId?.productName}
                          </span>
                          {order.orderItems.length > 1 && (
                            <Tooltip
                              title={`${
                                order.orderItems.length - 1
                              } more product(s)`}
                            >
                              <Box
                                display="flex"
                                alignItems="center"
                                gap=".2rem"
                                sx={{ cursor: "pointer" }}
                              >
                                <FaPlus style={{ marginLeft: 4 }} />
                                <p>{order.orderItems.length - 1} more</p>
                              </Box>
                            </Tooltip>
                          )}
                        </Box>
                      ) : (
                        <span>—</span>
                      )}
                    </TableCell>
                    {/* <TableCell align="center">{order?.user?.email}</TableCell> */}

                    <TableCell align="center">
                      {new Date(order.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      {order?.totalPrice.toFixed(2)} {order?.currency}
                    </TableCell>
                    <TableCell
                      align="center"
                      className="admin-table-order-status-change"
                    >
                      <button
                        className="admin-table-order-status"
                        style={{
                          backgroundColor: statusColors[order.status] || "#94a3b8",
                          color: "#fff",
                          padding: "6px 14px",
                          borderRadius: "12px",
                          border: "none",
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                          boxShadow: `0 2px 8px ${statusColors[order.status] ? `${statusColors[order.status]}40` : "rgba(148, 163, 184, 0.4)"}`,
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = `0 4px 12px ${statusColors[order.status] ? `${statusColors[order.status]}60` : "rgba(148, 163, 184, 0.6)"}`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = `0 2px 8px ${statusColors[order.status] ? `${statusColors[order.status]}40` : "rgba(148, 163, 184, 0.4)"}`;
                        }}
                      >
                        {order.status === "Cancellation In Progress"
                          ? "Cancellation Request"
                          : order?.status}
                      </button>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Order Details">
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            padding: "8px",
                            borderRadius: "8px",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              backgroundColor: "rgba(237, 200, 98, 0.1)",
                              transform: "scale(1.1)",
                            },
                          }}
                        >
                          <IoDocumentText
                            size={20}
                            onClick={() => {
                              navigate(`/admin/orders/${order._id}`);
                            }}
                            style={{ color: "#edc862" }}
                          />
                        </Box>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalOrders}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: "2px solid #f1f5f9",
            background: "white",
            borderRadius: "0 0 16px 16px",
          }}
        />

        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleCloseMenu}
          MenuListProps={{
            "aria-labelledby": "basic-button",
            // disableAutoFocusItem: true,
          }}
        >
          {["Shipped", "Out for delivery"].includes(statusData?.status) && (
            <MenuItem
              sx={style}
              onClick={() => {
                setShowShippingModal(true);
              }}
            >
              Update Shipping details
            </MenuItem>
          )}
          <MenuItem
            sx={style}
            onClick={() => {
              setShowShowModal(true);
              setAnchorEl(false);
            }}
          >
            Update Delivery Steps
          </MenuItem>
          {/* <MenuItem
            sx={style}
            onClick={() => {
              handleStatusChange("Delivered")
            }}
          >
            Mark As Delivered
          </MenuItem> */}
          <MenuItem
            sx={{
              ...style,
              color: "rgba(255, 0, 0, 0.638)",
              backgroundColor: "rgba(255, 0, 0, 0.093)",
            }}
            onClick={() => cancelOrder()}
          >
            Cancel Order
          </MenuItem>
        </Menu>
      </div>
      {showStatusModal && (
        <OrderStatusUpdate
          onClose={handleCloseStatusModal}
          order={shippingModalData}
          setUpdated={setUpdated}
          currentStatus={shippingModalData.status}
        />
      )}
    </div>
  );
}
