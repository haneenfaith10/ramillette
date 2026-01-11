import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { getSalesData } from "../../services/salesApiService";
import "./AdminSalesPage.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminSalesPage() {
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [tab, setTab] = useState("daily");

  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
  });
  const adminToken = localStorage.getItem("remilletAdminTkn");

  // Fetch data function accepts date range and interval
  const fetchSalesData = async () => {
    try {
      const res = await getSalesData(startDate, endDate, tab, adminToken);
      if (res.data?.isSuccess) {
        setSummary({
          totalSales: res.data.data.totalSales,
          totalOrders: res.data.data.totalOrders,
          totalProducts: res.data.data.totalProducts,
        });
        // Adjust this depending on your API response structure for sales by interval
        const chart = res.data.data.chartData.map((item) => ({
          date: item.date, // expect formatted date from backend
          sales: item.sales,
          orders: item.orders,
        }));

        setChartData(chart);
        setTopProducts(res.data.data.topSelling);
      }
    } catch (err) {
      console.error("Failed to fetch sales data", err);
    }
  };

  // Fetch initial data once
  useEffect(() => {
    fetchSalesData();
  }, []);

  // Filter button triggers fetch with current filters
  const onFilterClick = () => {
    fetchSalesData();
  };

  const downloadExcel = () => {
    const worksheetData = [
      ["Sales Report"],
      [], // Blank row
      ["#", "Date", "Total Sales (₹)", "Total Orders"],
      ...chartData.map((entry, index) => [
        index + 1,
        entry.date,
        entry.sales,
        entry.orders,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet["!merges"] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: 3 },
      },
    ];

    worksheet["!cols"] = [{ wch: 5 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];

    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellRef]) continue;
        if (!worksheet[cellRef].s) worksheet[cellRef].s = {};
        worksheet[cellRef].s.alignment = {
          vertical: "center",
          horizontal: "center",
        };
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SalesReport");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });

    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(data, `SalesReport_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // PDF Export
  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4", // standard page size
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Top Title
    const title = "Sales Report";
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth / 2, 20, { align: "center" }); // top margin = 20mm

    const tableColumn = ["#", "Date", "Total Sales (₹)", "Total Orders"];
    const tableRows = chartData.map((entry, index) => [
      index + 1,
      entry.date,
      entry.sales,
      entry.orders,
    ]);

    // Table with margins
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30, // Table starts after the title (20mm + 10mm gap)
      margin: { top: 30, left: 15, right: 15, bottom: 20 }, // page margins
      styles: {
        fontSize: 10,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      bodyStyles: {
        halign: "center",
        valign: "middle",
      },
      theme: "grid",
    });

    doc.save(`SalesReport_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="sales-dashboard">
      <h1 className="sales-dashboard-title">Admin Sales Dashboard</h1>

      <div className="summary-cards">
        {[
          {
            title: "Total Sales",
            value: `${summary.totalSales.toLocaleString()}`,
          },
          { title: "Orders", value: summary.totalOrders },
          { title: "Products", value: summary.totalProducts },
        ].map(({ title, value }, i) => (
          <div className="card" key={i}>
            <h3>{title}</h3>
            <p>{value}</p>
          </div>
        ))}
      </div>

      <div className="filters">
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <button onClick={onFilterClick}>Filter</button>
      </div>

      <div className="tabs">
        {["daily", "weekly", "monthly", "3month"].map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={tab === key ? "active" : ""}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="download-buttons">
        <button onClick={downloadExcel}>Download Excel</button>
        <button onClick={downloadPDF}>Download PDF</button>
      </div>

      <div className="chart-container">
        <h3>Sales Chart ({tab.toUpperCase()})</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barSize={30}>
              {" "}
              {/* <-- Set bar size here */}
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#667eea" name="Sales ₹" />
              <Bar dataKey="orders" fill="#764ba2" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="sales-dashboard-empty-sales-chart-section">
            <p>No sales Completed</p>
          </div>
        )}
      </div>

      <div className="table-container">
        <h3>Top 10 Selling Products</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Units Sold</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, index) => (
              <tr key={product.productId}>
                <td>{index + 1}</td>
                <td>
                  <div className="product-cell">
                    <img
                      src={`${import.meta.env.VITE_BASE_URL}/${
                        product.productImage.path || product.productImage
                      }`}
                      alt={product.productName}
                    />
                    {product.productName}
                  </div>
                </td>
                <td>{product.totalQty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
