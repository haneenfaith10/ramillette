import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  dashboardOverview,
  getSalesChart,
} from "../../services/adminApiServices";
import "./AdminDashboard.css";
import UserImage from "../../assets/images/userAvathar.jpg";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const token = localStorage.getItem("remilletAdminTkn");

  useEffect(() => {
    if (token) {
      (async () => {
        const response = await dashboardOverview(token);
        if (response) setStats(response);
      })();
    }
  }, [token]);

  useEffect(() => {
    (async () => {
      const response = await getSalesChart(dateRange.from, dateRange.to, token);
      if (response) {
        const formattedData = response.map((item) => ({
          date: item._id,
          sales: item.totalSales,
        }));
        setChartData(formattedData);
      }
    })();
  }, [dateRange.from, dateRange.to, token]);

  const deliveredOrders =
    stats?.orderStatusCounts?.find((item) => item._id === "Delivered")?.count ||
    0;
  const pendingOrders =
    stats?.orderStatusCounts?.find((item) => item._id === "Processing")
      ?.count || 0;
  const cancelledOrders =
    stats?.orderStatusCounts?.find((item) => item._id === "Cancelled")?.count ||
    0;

  return (
    <div className="dashboard-container">
      <h1> Admin Dashboard Overview</h1>

      <div className="overview-grid">
        {[
          { label: "Total Orders", value: stats?.totalOrders },
          { label: "Users", value: stats?.totalUsers },
          { label: "Products", value: stats?.totalProducts },
          {
            label: "Sales",
            value: stats ? `${stats.sales?.toFixed(2)}` : null,
          },
          {
            label: "Pending Payment",
            value: stats ? `${stats.pendingAmount?.toFixed(2)}` : null,
          },
          { label: "Pending Orders", value: pendingOrders },
          { label: "Delivered Orders", value: deliveredOrders },
          { label: "Cancelled Orders", value: cancelledOrders },
        ].map(({ label, value }) => (
          <div key={label} className="overview-card">
            <p>{label}</p>
            <h3>{value ?? "-"}</h3>
          </div>
        ))}
      </div>

      <div className="sales-chart-section">
        <div className="sales-chart-header">
          <h2> Sales Overview</h2>
          <div className="date-filters">
            <label>
              From:{" "}
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, from: e.target.value }))
                }
              />
            </label>
            <label>
              To:{" "}
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, to: e.target.value }))
                }
              />
            </label>
            <button
              className="clear-button"
              onClick={() => setDateRange({ from: "", to: "" })}
            >
              Clear Filter
            </button>
          </div>
        </div>

        <div className="chart-container">
          {chartData.length === 0 ? (
            <div className="no-data">
              No sales data available for the selected date range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barCategoryGap="30%"
                barGap={4}
              >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="sales"
                  fill="#edc862"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="top_listcontainer">
        {stats?.mostOrderedUsers?.length > 0 && (
          <div className="top-customers">
            <h2> Top Customers</h2>
            <div className="user-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.mostOrderedUsers.map((user, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="user-info">
                          <img
                            src={`${import.meta.env.VITE_BASE_URL}/${
                              user.userImage
                            }`}
                            alt={`${user.firstName} ${user.lastName}`}
                            onError={(e) => (e.currentTarget.src = UserImage)}
                          />
                          <span>
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {stats?.mostSoldProducts?.length > 0 && (
          <div className="top-products">
            <h2> Most Sold Products</h2>
            <div className="product-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Total Sold</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.mostSoldProducts.map((product, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="product-info">
                          <img
                            src={`${import.meta.env.VITE_BASE_URL}/${
                              product.productImage.path || product.productImage
                            }`}
                            alt={product.name}
                          />
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td>{product.totalSold}</td>
                      {/* <td>₹{product.price.toFixed(2)}</td> */}
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
