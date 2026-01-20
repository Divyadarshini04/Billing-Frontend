import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Download, TrendingUp, DollarSign, ShoppingCart, Users, Zap, Target } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import { useExportSuccess } from "../context/ExportSuccessContext";
import { reportAPI, dashboardAPI } from "../api/apiService";

const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Initial empty data
const initialSalesData = [];
const initialCategoryData = [];
const initialTopProducts = [];

export default function ReportsPage() {
  const { userRole } = useAuth();
  const { hasPermission } = usePermissions();
  const [dateRange, setDateRange] = useState("month");
  const [chartType, setChartType] = useState("line");
  const exportSuccess = useExportSuccess();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [salesData, setSalesData] = useState(initialSalesData);
  const [categoryData, setCategoryData] = useState(initialCategoryData);
  const [topProducts, setTopProducts] = useState(initialTopProducts);
  const [reports, setReports] = useState([
    { id: 1, title: "Total Revenue", icon: DollarSign, color: "bg-gradient-primary", value: "₹0", change: "+0%", trend: "up" },
    { id: 2, title: "Total Orders", icon: ShoppingCart, color: "bg-secondary", value: "0", change: "+0%", trend: "up" },
    { id: 3, title: "Total Customers", icon: Users, color: "bg-accent", value: "0", change: "+0%", trend: "up" },
    { id: 4, title: "Avg Order Value", icon: Target, color: "bg-purple-500", value: "₹0", change: "+0%", trend: "up" },
  ]);

  // Fetch reports from backend
  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  async function fetchReportData() {
    setLoading(true);
    try {
      // Fetch from backend
      const [salesResponse, analyticsResponse] = await Promise.all([
        reportAPI.getSalesReport(dateRange),
        dashboardAPI.getAnalytics(dateRange)
      ]);

      const salesAggr = salesResponse?.data?.aggregates || {};
      const analytics = analyticsResponse?.data || {};
      const revAnalytics = analytics.revenue_analytics || {};
      const custAnalytics = analytics.customer_analytics || {};

      const totalRevenue = revAnalytics.total || 0;
      const totalOrders = revAnalytics.invoices || 0;
      const totalCustomers = custAnalytics.total_active || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Update reports with real data
      setReports([
        { id: 1, title: "Total Revenue", icon: DollarSign, color: "bg-gradient-primary", value: `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, change: "+0%", trend: "up" },
        { id: 2, title: "Total Orders", icon: ShoppingCart, color: "bg-secondary", value: totalOrders.toString(), change: "+0%", trend: "up" },
        { id: 3, title: "Total Customers", icon: Users, color: "bg-accent", value: totalCustomers.toString(), change: "+0%", trend: "up" },
        { id: 4, title: "Avg Order Value", icon: Target, color: "bg-purple-500", value: `₹${avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, change: "+0%", trend: "up" },
      ]);

      // Set trend data
      const trendData = analytics.daily_sales?.map(d => ({
        month: d.date,
        sales: d.invoices,
        revenue: d.total
      })) || [];
      setSalesData(trendData);

      // Set top products
      const products = salesResponse?.data?.top_products?.map(p => ({
        id: p.product_name,
        name: p.product_name,
        units: p.qty,
        revenue: p.total,
        growth: "+0%" // Backend doesn't provide growth yet
      })) || [];
      setTopProducts(products);

      // Mock Category Data (Backend doesn't provide this yet in this view)
      setCategoryData([
        { name: 'Products', value: 100 }
      ]);

      setReportData({
        sales: salesResponse?.data,
        analytics: analyticsResponse?.data
      });
      setBackendConnected(true);

    } catch (error) {
      console.error("Fetch report error:", error);
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  }

  const quickStats = [
    { label: "Conversion Rate", value: "0%", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/30" },
    { label: "Customer Retention", value: "0%", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30" },
    { label: "Growth Rate", value: "0%", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/30" },
    { label: "Market Share", value: "0%", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/30" },
  ];

  // Export Reports to Excel
  function handleExportReports() {
    try {
      const workbook = XLSX.utils.book_new();

      // Sales Data sheet
      const salesSheet = XLSX.utils.json_to_sheet(salesData);
      XLSX.utils.book_append_sheet(workbook, salesSheet, "Sales Data");

      // Category Data sheet
      const categorySheet = XLSX.utils.json_to_sheet(categoryData);
      XLSX.utils.book_append_sheet(workbook, categorySheet, "Category Data");

      // Top Products sheet
      const productsSheet = XLSX.utils.json_to_sheet(topProducts);
      XLSX.utils.book_append_sheet(workbook, productsSheet, "Top Products");

      // Reports Summary
      const reportsSummary = reports.map(r => ({
        Title: r.title,
        Value: r.value,
        Change: r.change,
        Trend: r.trend
      }));
      const summarySheet = XLSX.utils.json_to_sheet(reportsSummary);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Reports Summary");

      XLSX.writeFile(workbook, `reports_${new Date().toISOString().split('T')[0]}.xlsx`);
      try { exportSuccess.showExportSuccess("Reports exported successfully"); } catch (e) { }
    } catch (error) {
      alert("⚠️ Error exporting file: " + error.message);
    }
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark-bg p-4 md:p-8 transition-colors">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Comprehensive business insights and performance metrics</p>
          </div>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-card dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportReports}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {reports.map((report, idx) => {
          const Icon = report.icon;
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4, shadow: "0 20px 40px rgba(0,0,0,0.1)" }}
              className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:border-green-500 dark:hover:border-green-400 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{report.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{report.value}</h3>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`p-3 rounded-lg ${report.color} shadow-lg`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="text-sm font-bold text-green-600">{report.change} from last month</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales & Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Sales & Revenue Trend</h3>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setChartType("line")}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${chartType === "line"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                Line
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setChartType("bar")}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${chartType === "bar"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                Bar
              </motion.button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            {chartType === "line" ? (
              <LineChart data={salesData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  cursor={{ stroke: "#10B981", strokeWidth: 2 }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981", r: 6 }}
                  activeDot={{ r: 8 }}
                  name="Sales (₹)"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", r: 6 }}
                  activeDot={{ r: 8 }}
                  name="Revenue (₹)"
                />
              </LineChart>
            ) : (
              <BarChart data={salesData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Bar dataKey="sales" fill="#10B981" name="Sales (₹)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue (₹)" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Category Mix</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Quick Stats & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + idx * 0.05 }}
            className={`p-6 rounded-lg border border-gray-200 dark:border-dark-border ${stat.bg}`}
          >
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">{stat.label}</p>
            <p className={`${stat.color} text-3xl font-bold`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Top Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm"
      >
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Product Name</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">Units Sold</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">Revenue</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
              {topProducts.map((product, idx) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + idx * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{product.name}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-gray-400">{product.units}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-green-600 dark:text-green-400">₹{product.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400">
                      {product.growth}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
