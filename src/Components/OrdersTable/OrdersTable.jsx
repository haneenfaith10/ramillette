import React, { useEffect, useState } from "react";
import "./OrdersTable.css";
import { getUserOrders } from "../../services/orderApiService";
import { useDispatch, useSelector } from "react-redux";
import { updateOrderCount } from "../../redux/slices/userSlice";
import EmptyData from "../../assets/svg/empty-data.svg";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { useNavigate } from "react-router-dom";
import { statusColorsClass } from "../../constants";

const ORDERS_PER_PAGE = 10;

export default function OrdersTable() {
  const [ordersList, setOrdersList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currencyFilter, setCurrencyFilter] = useState("All");

  const dispatch = useDispatch();
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const countries = useSelector((state) => state.countries.list);
  const navigate = useNavigate();
  const token = localStorage.getItem("remilletteTkn");

  useEffect(() => {
    (async () => {
      const response = await getUserOrders(token);
      if (response) {
        setOrdersList(response);
        dispatch(updateOrderCount({ orderCount: response.length }));
      }
    })();
  }, [dispatch, token]);

  const handlePageChange = (_, value) => {
    setCurrentPage(value);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleCurrencyFilterChange = (e) => {
    setCurrencyFilter(e.target.value);
    setCurrentPage(1);
  };

  // Filter by both status and currency
  const filteredOrders = ordersList.filter((order) => {
    const statusMatches =
      statusFilter === "All" || order.status === statusFilter;
    const currencyMatches =
      currencyFilter === "All" || order.currency === currencyFilter;
    return statusMatches && currencyMatches;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const totalPages = Math.ceil(sortedOrders.length / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const paginatedOrders = sortedOrders.slice(
    startIndex,
    startIndex + ORDERS_PER_PAGE
  );

  const showEmptyData = ordersList.length > 0 && filteredOrders.length === 0;

  const clearFilters = () => {
    setStatusFilter("All");
    setCurrencyFilter("All");
    setCurrentPage(1);
  };

  return (
    <div className="orders-table-wrapper" id="orders-section">
      {ordersList.length === 0 ? (
        <div className="no-orders">
          <img src={EmptyData} alt="No Orders" />
          <h3>No orders yet</h3>
          <p>Looks like you haven't purchased anything yet.</p>
        </div>
      ) : (
        <>
          <div className="orders-header">
            <h2>My Orders</h2>
          </div>

          <div className="orders-filters">
            {/* Filter by Status */}
            <div className="filter-sort-controls">
              <div className="filter-dropdown">
                <label htmlFor="statusFilter">Status</label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="All">All Status</option>
                  <option value="Processing">Processing</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned">Returned</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for delivery">Out for delivery</option>
                </select>
              </div>
            </div>

            {/* Filter by Currency */}
            <div className="filter-sort-controls">
              <div className="filter-dropdown">
                <label htmlFor="currencyFilter">Currency</label>
                <select
                  id="currencyFilter"
                  value={currencyFilter}
                  onChange={handleCurrencyFilterChange}
                >
                  <option value="All">All Currencies</option>
                  {countries &&
                    countries.map((country) => (
                      <option key={country._id} value={country.currency}>
                        {country.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {(statusFilter !== "All" || currencyFilter !== "All") && (
              <button
                className="order-table-clear-filters-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>

          {showEmptyData ? (
            <div className="no-orders">
              <img src={EmptyData} alt="No Matching Orders" />
              <h3>No matching orders found</h3>
              <p>Try changing your filter or sorting options.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="orders-table-container">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th
                        onClick={toggleSortOrder}
                        style={{ cursor: "pointer", userSelect: "none" }}
                      >
                        Date {sortOrder === "asc" ? "↑" : "↓"}
                      </th>
                      <th>Status</th>
                      <th style={{ width: "120px" }}>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedOrders.map((order) => {
                      const firstItem = order.orderItems[0];
                      const product = firstItem?.productId;
                      const moreItemsCount = order.orderItems.length - 1;

                      return (
                        <tr key={order._id}>
                          <td>
                            <div className="order-product-info">
                              <img
                                src={`${import.meta.env.VITE_BASE_URL}/${
                                  product?.productImages?.[0].path
                                }`}
                                alt={product?.productName}
                                className="order-product-image"
                              />
                              <div className="order-product-details">
                                <div
                                  className="product-name"
                                  onClick={() => {
                                    if (
                                      selectedCountry.currency.toUpperCase() ===
                                      order.currency.toUpperCase()
                                    ) {
                                      navigate(
                                        `/${selectedCountry.code}/product-inner/${order.orderItems[0].productId._id}`
                                      );
                                    }
                                  }}
                                >
                                  {product?.productName}
                                </div>
                                {moreItemsCount > 0 && (
                                  <div className="more-items">
                                    + {moreItemsCount} more item
                                    {moreItemsCount > 1 ? "s" : ""}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleString()}</td>
                          <td>
                            <span
                              className={`order-table-status-badge ${
                                statusColorsClass[order.status]
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td>{`${order.totalPrice.toFixed(2)} ${
                            order.currency
                          }`}</td>
                          <td>
                            <button
                              className="view-order-btn"
                              onClick={() =>
                                navigate(
                                  `/${selectedCountry?.code}/order/${order._id}`
                                )
                              }
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="orders-mobile-cards">
                {paginatedOrders.map((order) => {
                  const firstItem = order.orderItems[0];
                  const product = firstItem?.productId;
                  const moreItemsCount = order.orderItems.length - 1;

                  return (
                    <div key={order._id} className="order-card">
                      <div className="order-card-header">
                        <div className="order-card-product">
                          <img
                            src={`${import.meta.env.VITE_BASE_URL}/${
                              product?.productImages?.[0].path
                            }`}
                            alt={product?.productName}
                            className="order-card-image"
                          />
                          <div className="order-card-details">
                            <div
                              className="order-card-product-name"
                              onClick={() => {
                                if (
                                  selectedCountry.currency.toUpperCase() ===
                                  order.currency.toUpperCase()
                                ) {
                                  navigate(
                                    `/${selectedCountry.code}/product-inner/${order.orderItems[0].productId._id}`
                                  );
                                }
                              }}
                            >
                              {product?.productName}
                            </div>
                            {moreItemsCount > 0 && (
                              <div className="order-card-more-items">
                                + {moreItemsCount} more item
                                {moreItemsCount > 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="order-card-status">
                          <span
                            className={`order-table-status-badge ${
                              statusColorsClass[order.status]
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="order-card-info">
                        <div className="order-card-info-row">
                          <span className="order-card-info-label">Date</span>
                          <span className="order-card-info-value">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="order-card-info-row">
                          <span className="order-card-info-label">Total</span>
                          <span className="order-card-info-value">
                            {`${order.totalPrice.toFixed(2)} ${order.currency}`}
                          </span>
                        </div>
                      </div>

                      <div className="order-card-actions">
                        <button
                          className="order-card-view-btn"
                          onClick={() =>
                            navigate(
                              `/${selectedCountry?.code}/order/${order._id}`
                            )
                          }
                        >
                          View Order Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredOrders.length > ORDERS_PER_PAGE && (
                <div className="mui-pagination">
                  <Stack spacing={2} alignItems="center" marginTop={3}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      size="medium"
                      color="primary"
                    />
                  </Stack>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
