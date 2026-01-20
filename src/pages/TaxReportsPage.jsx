import React, { useState } from "react";
import { motion } from "framer-motion";
// eslint-disable-next-line no-unused-vars
import { FileText, Download, TrendingUp, DollarSign, AlertCircle, CheckCircle, Edit2, Trash2, Plus } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import * as XLSX from "xlsx";
import { useAuth } from "../context/AuthContext";
import { useExportSuccess } from "../context/ExportSuccessContext";
import { salesAPI } from "../api/apiService";

// eslint-disable-next-line no-unused-vars
const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Load from actual data
const initialTaxData = [];
const initialTaxBreakdown = [];

// eslint-disable-next-line no-unused-vars
// Load from actual invoice data

export default function TaxReportsPage() {
  const { userRole } = useAuth();
  const exportSuccess = useExportSuccess();
  const [dateRange, setDateRange] = useState("month");
  const [chartType, setChartType] = useState("line");
  const [invoiceWiseTax, setInvoiceWiseTax] = useState([]);

  // Fetch invoices from API
  React.useEffect(() => {
    fetchInvoiceData();
  }, []);

  const fetchInvoiceData = async () => {
    try {
      const response = await salesAPI.getAllSales();
      if (response.data) {
        const invoices = response.data;
        const taxDetails = invoices.map((inv, idx) => ({
          invoiceNo: inv.invoiceNo || `INV-${idx + 1}`,
          date: inv.invoiceDate || new Date().toISOString().split('T')[0],
          amount: inv.total || 0,
          cgst: 0, // Should calculate from items if available or backend
          sgst: 0,
          total: 0,
          status: inv.paymentStatus || 'Paid'
        }));
        setInvoiceWiseTax(taxDetails);
      }
    } catch (error) {

    }
  };

  const [editing, setEditing] = useState(null);
  const [taxData, setTaxData] = useState([]);
  const [taxBreakdown, setTaxBreakdown] = useState([]);

  const totalInvoiceAmount = invoiceWiseTax.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCGST = invoiceWiseTax.reduce((sum, inv) => sum + inv.cgst, 0);
  const totalSGST = invoiceWiseTax.reduce((sum, inv) => sum + inv.sgst, 0);
  const totalTax = totalCGST + totalSGST;
  const paidTax = invoiceWiseTax.filter(inv => inv.status === "Paid").reduce((sum, inv) => sum + inv.total, 0);
  const pendingTax = invoiceWiseTax.filter(inv => inv.status === "Pending").reduce((sum, inv) => sum + inv.total, 0);

  function deleteInvoice(invoiceNo) {
    setInvoiceWiseTax(invoiceWiseTax.filter(inv => inv.invoiceNo !== invoiceNo));
  }

  function saveInvoice(updated) {
    setInvoiceWiseTax(invoiceWiseTax.map(inv => (inv.invoiceNo === updated.invoiceNo ? updated : inv)));
    setEditing(null);
  }

  // Export Tax Report to Excel
  function handleExportTax() {
    try {
      // Invoice-wise tax data
      const invoiceData = invoiceWiseTax.map(inv => ({
        "Invoice No": inv.invoiceNo,
        Date: inv.date,
        "Amount": inv.amount,
        "CGST (9%)": inv.cgst,
        "SGST (9%)": inv.sgst,
        "Total Tax": inv.total,
        Status: inv.status
      }));

      // Monthly tax summary (only if taxData exists)
      const monthlyData = taxData && taxData.length > 0 ? taxData.map(t => ({
        Month: t.month,
        "CGST": t.cgst,
        "SGST": t.sgst,
        "IGST": t.igst,
        "Total Tax": t.totalTax
      })) : [];

      // Overall summary
      const summaryData = [{
        "Total Invoice Amount": totalInvoiceAmount,
        "Total CGST": totalCGST,
        "Total SGST": totalSGST,
        "Total Tax": totalTax,
        "Paid Tax": paidTax,
        "Pending Tax": pendingTax,
        "Date Exported": new Date().toLocaleDateString()
      }];

      const workbook = XLSX.utils.book_new();

      // Add invoice data sheet
      const invoiceSheet = XLSX.utils.json_to_sheet(invoiceData);
      XLSX.utils.book_append_sheet(workbook, invoiceSheet, "Invoice Wise Tax");

      // Add monthly data sheet
      const monthlySheet = XLSX.utils.json_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(workbook, monthlySheet, "Monthly Summary");

      // Add overall summary
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

      XLSX.writeFile(workbook, `tax_reports_${new Date().toISOString().split('T')[0]}.xlsx`);
      try { exportSuccess.showExportSuccess("Tax reports exported successfully!"); } catch (e) { }
    } catch (error) {
      try { exportSuccess.showExportSuccess("Error exporting file: " + error.message); } catch (e) { }
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Tax Reports & Compliance</h1>
            <p className="text-gray-600 mt-2">Track CGST, SGST, and IGST across all invoices</p>
          </div>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportTax}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export Excel
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Tax Collected</p>
              <h3 className="text-3xl font-bold text-green-600 mt-2">₹{totalTax.toLocaleString()}</h3>
            </div>
            <FileText className="w-12 h-12 text-green-600 opacity-20" />
          </div>
          <p className="text-xs text-gray-600">From {invoiceWiseTax.length} invoices</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">CGST (9%)</p>
              <h3 className="text-3xl font-bold text-blue-600 mt-2">₹{totalCGST.toLocaleString()}</h3>
            </div>
            <DollarSign className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
          <p className="text-xs text-gray-600">Central GST</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">SGST (9%)</p>
              <h3 className="text-3xl font-bold text-orange-600 mt-2">₹{totalSGST.toLocaleString()}</h3>
            </div>
            <TrendingUp className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
          <p className="text-xs text-gray-600">State GST</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Tax Status</p>
              <h3 className="text-3xl font-bold text-red-600 mt-2">₹{pendingTax.toLocaleString()}</h3>
            </div>
            <AlertCircle className="w-12 h-12 text-red-600 opacity-20" />
          </div>
          <p className="text-xs text-gray-600">Pending Collection</p>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tax Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Tax Collection Trend</h3>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setChartType("line")}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${chartType === "line"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
              >
                Line
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setChartType("bar")}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${chartType === "bar"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
              >
                Bar
              </motion.button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            {chartType === "line" ? (
              <LineChart data={taxData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                  dataKey="cgst"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981", r: 6 }}
                  activeDot={{ r: 8 }}
                  name="CGST (₹)"
                />
                <Line
                  type="monotone"
                  dataKey="sgst"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", r: 6 }}
                  activeDot={{ r: 8 }}
                  name="SGST (₹)"
                />
                <Line
                  type="monotone"
                  dataKey="igst"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ fill: "#F59E0B", r: 6 }}
                  activeDot={{ r: 8 }}
                  name="IGST (₹)"
                />
              </LineChart>
            ) : (
              <BarChart data={taxData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                <Bar dataKey="cgst" fill="#10B981" name="CGST (₹)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="sgst" fill="#3B82F6" name="SGST (₹)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="igst" fill="#F59E0B" name="IGST (₹)" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Tax Breakdown Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Tax Type Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taxBreakdown && taxBreakdown.length > 0 ? taxBreakdown : []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}\n₹${value.toLocaleString()}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {taxBreakdown && taxBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Tax Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm"
        >
          <p className="text-gray-600 text-sm font-medium mb-2">Gross Revenue</p>
          <p className="text-3xl font-bold text-gray-900">₹{totalInvoiceAmount.toLocaleString()}</p>
          <p className="text-xs text-gray-600 mt-2">Before tax</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm"
        >
          <p className="text-gray-600 text-sm font-medium mb-2">Effective Tax Rate</p>
          <p className="text-3xl font-bold text-blue-600">
            {((totalTax / totalInvoiceAmount) * 100).toFixed(2)}%
          </p>
          <p className="text-xs text-gray-600 mt-2">Average</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-lg bg-green-50 border border-green-300 shadow-sm"
        >
          <p className="text-gray-600 text-sm font-medium mb-2">Tax Collected</p>
          <p className="text-3xl font-bold text-green-600">₹{paidTax.toLocaleString()}</p>
          <p className="text-xs text-gray-600 mt-2">Received</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-lg bg-red-50 border border-red-300 shadow-sm"
        >
          <p className="text-gray-600 text-sm font-medium mb-2">Compliance Status</p>
          <p className="text-3xl font-bold text-red-600">
            {Math.round((paidTax / totalTax) * 100)}%
          </p>
          <p className="text-xs text-gray-600 mt-2">Collected</p>
        </motion.div>
      </div>

      {/* Invoice-wise Tax Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Invoice-wise Tax Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-50 to-blue-50 border-b-2 border-green-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Invoice #</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Date</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">CGST (9%)</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">SGST (9%)</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">Total Tax</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Status</th>
                {(userRole === "OWNER") && (
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoiceWiseTax.map((invoice, idx) => (
                <motion.tr
                  key={invoice.invoiceNo}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{invoice.invoiceNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{invoice.date}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">₹{invoice.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-green-600">₹{invoice.cgst.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-blue-600">₹{invoice.sgst.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">₹{invoice.total.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${invoice.status === "Paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                      {invoice.status === "Paid" ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Paid
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Pending
                        </>
                      )}
                    </span>
                  </td>
                  {(userRole === "OWNER") && (
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setEditing(invoice)}
                          className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => deleteInvoice(invoice.invoiceNo)}
                          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan="2" className="px-6 py-4 text-sm font-bold text-gray-900">
                  Total
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                  ₹{totalInvoiceAmount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-green-600">
                  ₹{totalCGST.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-blue-600">
                  ₹{totalSGST.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                  ₹{totalTax.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>

      {/* Edit Invoice Modal */}
      {editing && (userRole === "OWNER") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setEditing(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl max-h-96 overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Invoice Tax</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Invoice Number</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={editing.invoiceNo}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={editing.amount}
                  onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">CGST (9%)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={editing.cgst}
                  onChange={(e) => setEditing({ ...editing, cgst: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">SGST (9%)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={editing.sgst}
                  onChange={(e) => setEditing({ ...editing, sgst: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => saveInvoice(editing)}
                className="flex-1 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold transition-colors"
              >
                Save Changes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEditing(null)}
                className="flex-1 py-3 rounded-lg border-2 border-gray-300 text-gray-900 font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
