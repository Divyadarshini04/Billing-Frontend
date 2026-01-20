import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, TrendingUp, DollarSign, Calendar, Filter, Search } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";
import { useAuth } from "../context/AuthContext";
import { useExportSuccess } from "../context/ExportSuccessContext";
import { salesAPI } from "../api/apiService";

export default function SalesReportPage() {
  const { userRole } = useAuth();
  const exportSuccess = useExportSuccess();
  const [dateRange, setDateRange] = useState("month");
  const [chartType, setChartType] = useState("line");
  const [searchTerm, setSearchTerm] = useState("");
  const [salesData, setSalesData] = useState([]);
  const [invoiceSales, setInvoiceSales] = useState([]);

  // Fetch sales data from API
  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await salesAPI.getAllSales();
      if (response.data) {
        const invoices = response.data;

        // Process daily sales
        const daily = {};
        invoices.forEach(inv => {
          const date = inv.invoiceDate || new Date().toISOString().split('T')[0];
          if (!daily[date]) daily[date] = { date, sales: 0, transactions: 0, amount: 0 };
          daily[date].sales += inv.items?.length || 1;
          daily[date].transactions += 1;
          daily[date].amount += inv.total || 0;
        });
        setSalesData(Object.values(daily).slice(-30));

        // Process invoice sales
        const processedInvoices = invoices.map((inv, idx) => ({
          invoiceNo: inv.invoiceNo || `INV-${idx + 1}`,
          date: inv.invoiceDate || new Date().toISOString().split('T')[0],
          customerName: inv.customerName || "Walk-in Customer",
          totalItems: inv.items?.length || 0,
          amount: inv.total || 0,
          paymentMethod: inv.paymentMethod || "Cash",
          status: inv.paymentStatus || "Completed"
        })).sort((a, b) => new Date(b.date) - new Date(a.date));
        setInvoiceSales(processedInvoices);
      }
    } catch (error) {

    }
  };

  const filteredSales = invoiceSales.filter(sale =>
    sale.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = invoiceSales.reduce((sum, s) => sum + s.amount, 0);
  const totalTransactions = invoiceSales.length;
  const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const totalItems = invoiceSales.reduce((sum, s) => sum + s.totalItems, 0);

  // Export Sales Report to Excel
  function handleExportSalesReport() {
    try {
      const workbook = XLSX.utils.book_new();

      // Daily Sales Data
      const dailyData = salesData.map(d => ({
        Date: d.date,
        "Total Sales (₹)": d.amount,
        Transactions: d.transactions,
        "Items Sold": d.sales
      }));
      const dailySheet = XLSX.utils.json_to_sheet(dailyData);
      XLSX.utils.book_append_sheet(workbook, dailySheet, "Daily Sales");

      // Invoice-wise Sales
      const invoiceData = invoiceSales.map(s => ({
        "Invoice No": s.invoiceNo,
        Date: s.date,
        "Customer Name": s.customerName,
        "Total Items": s.totalItems,
        "Amount (₹)": s.amount,
        "Payment Method": s.paymentMethod,
        Status: s.status
      }));
      const invoiceSheet = XLSX.utils.json_to_sheet(invoiceData);
      XLSX.utils.book_append_sheet(workbook, invoiceSheet, "Invoice Sales");

      // Summary
      const summaryData = [{
        "Total Revenue": `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
        "Total Transactions": totalTransactions,
        "Average Order Value": `₹${avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
        "Total Items Sold": totalItems,
        "Date Generated": new Date().toLocaleDateString()
      }];
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

      XLSX.writeFile(workbook, `sales_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      exportSuccess.showExportSuccess("Sales report exported successfully!");
    } catch (error) {
      exportSuccess.showExportSuccess("Error exporting file: " + error.message);
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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Sales Report</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Comprehensive sales analysis and transaction details</p>
          </div>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-card dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportSalesReport}
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-lg transition-all"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Revenue</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </h3>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">From {totalTransactions} transactions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -4 }}
          className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-lg transition-all"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Transactions</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalTransactions}</h3>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">Completed orders</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -4 }}
          className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-lg transition-all"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Avg Order Value</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            ₹{avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </h3>
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">Average per transaction</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -4 }}
          className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-lg transition-all"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Items Sold</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalItems}</h3>
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">Products sold</p>
        </motion.div>
      </motion.div>

      {/* Sales Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Trend</h3>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setChartType("line")}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${chartType === "line"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-white hover:bg-gray-200"
                }`}
            >
              Line
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setChartType("bar")}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${chartType === "bar"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-white hover:bg-gray-200"
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
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E5E7EB", borderRadius: "8px" }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", r: 6 }}
                name="Revenue (₹)"
              />
            </LineChart>
          ) : (
            <BarChart data={salesData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E5E7EB", borderRadius: "8px" }} />
              <Legend />
              <Bar dataKey="amount" fill="#3B82F6" name="Revenue (₹)" radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </motion.div>

      {/* Sales Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Transactions</h3>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-bg rounded-lg px-4 py-2">
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-bg border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Invoice No</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Date</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Customer</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">Items</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">Amount</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">Payment</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSales.map((sale, idx) => (
                <motion.tr
                  key={sale.invoiceNo}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-bold text-blue-600 dark:text-blue-400">{sale.invoiceNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{sale.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{sale.customerName}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-300">{sale.totalItems}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-green-600 dark:text-green-400">₹{sale.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center text-sm">{sale.paymentMethod}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400">
                      {sale.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No sales transactions found
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
