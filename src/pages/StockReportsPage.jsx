import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown, Package, Warehouse, Download, Edit2, Trash2, Plus } from "lucide-react";
import * as XLSX from "xlsx";
import { useExportSuccess } from "../context/ExportSuccessContext";
import { useAuth } from "../context/AuthContext";

// Load from actual data

import { productAPI } from "../api/apiService";

export default function StockReportsPage() {
  const exportSuccess = useExportSuccess();
  const { userRole } = useAuth();
  const [stockDetails, setStockDetails] = useState([]);

  // Load products from API
  React.useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      const response = await productAPI.getAllProducts();
      if (response.data) {
        const products = response.data;
        const details = products.map((p, idx) => ({
          id: p.id || idx + 1,
          product: p.name,
          sku: p.product_code || `SKU-${idx + 1}`,
          warehouse: 'Main Warehouse',
          currentStock: p.stock || 0,
          minLevel: 10,
          maxLevel: p.stock ? p.stock * 2 : 100,
          status: p.stock === 0 ? 'Critical' : p.stock <= 10 ? 'Low Stock' : 'In Stock',
          location: 'Rack-' + String.fromCharCode(65 + (idx % 4)) + '-' + (idx % 10),
          lastUpdated: 'Just now',
          turnoverRate: '0/month',
          unitPrice: p.price || p.sellingPrice || 0,
          totalValue: (p.stock || 0) * (p.price || p.sellingPrice || 0)
        }));
        setStockDetails(details);
      }
    } catch (error) {

    }
  };

  const [expandedStock, setExpandedStock] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("value");
  const [editing, setEditing] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredStock = stockDetails
    .filter((stock) => filterStatus === "all" || stock.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === "value") return b.totalValue - a.totalValue;
      if (sortBy === "stock") return b.currentStock - a.currentStock;
      if (sortBy === "turnover") return parseFloat(b.turnoverRate) - parseFloat(a.turnoverRate);
      return 0;
    });

  const totalInventoryValue = stockDetails.reduce((acc, s) => acc + s.totalValue, 0);
  const lowStockCount = stockDetails.filter(s => s.status === "Low Stock" || s.status === "Critical").length;
  const totalUnits = stockDetails.reduce((acc, s) => acc + s.currentStock, 0);

  function deleteStock(id) {
    setStockDetails(stockDetails.filter(s => s.id !== id));
  }

  function saveStock(updated) {
    setStockDetails(stockDetails.map(s => (s.id === updated.id ? updated : s)));
    setEditing(null);
  }

  // Export Stock Report to Excel
  function handleExportStock() {
    try {
      const exportData = stockDetails.map(s => ({
        Product: s.product,
        SKU: s.sku,
        Warehouse: s.warehouse,
        "Current Stock": s.currentStock,
        "Min Level": s.minLevel,
        "Max Level": s.maxLevel,
        Status: s.status,
        Location: s.location,
        "Last Updated": s.lastUpdated,
        "Turnover Rate": s.turnoverRate,
        "Unit Price": s.unitPrice,
        "Total Value": s.totalValue
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Report");

      // Add summary sheet
      const summaryData = [{
        "Total Units in Stock": totalUnits,
        "Total Inventory Value": `₹${totalInventoryValue.toLocaleString()}`,
        "Low Stock Items": lowStockCount,
        "Date Exported": new Date().toLocaleDateString()
      }];
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

      XLSX.writeFile(workbook, `stock_reports_${new Date().toISOString().split('T')[0]}.xlsx`);
      exportSuccess.showExportSuccess("Warehouse & Stock reports exported successfully!");
    } catch (error) {
      exportSuccess.showExportSuccess("Error exporting file: " + error.message);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Warehouse & Stock Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Real-time inventory tracking and warehouse management</p>
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
          className="p-6 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-300 dark:border-green-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Units in Stock</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{totalUnits}</p>
            </div>
            <Package className="w-10 h-10 text-green-600 dark:text-green-400 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-300 dark:border-blue-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Inventory Value</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">₹{(totalInventoryValue / 100000).toFixed(2)}L</p>
            </div>
            <Warehouse className="w-10 h-10 text-blue-600 dark:text-blue-400 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border border-red-300 dark:border-red-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Low Stock Alerts</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{lowStockCount}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border border-orange-300 dark:border-orange-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Avg Turnover Rate</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">18.3</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">units/month</p>
            </div>
            <TrendingDown className="w-10 h-10 text-orange-600 dark:text-orange-400 opacity-20" />
          </div>
        </motion.div>
      </motion.div>

      {/* Filters & Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8 flex-wrap"
      >
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-card dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
          >
            <option value="all">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Critical">Critical</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-card dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
          >
            <option value="value">Sort by Value</option>
            <option value="stock">Sort by Stock</option>
            <option value="turnover">Sort by Turnover</option>
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExportStock}
          className="ml-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export Report
        </motion.button>
        {(userRole === "OWNER") && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Stock
          </motion.button>
        )}
      </motion.div>

      {/* Stock Details Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm"
      >
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Inventory Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-b-2 border-green-200 dark:border-green-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Product</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">SKU</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Warehouse</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">Stock</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">Min/Max</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">Unit Price</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">Total Value</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">Status</th>
                {(userRole === "OWNER") && (
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
              {filteredStock.map((stock, idx) => {
                const statusColors = {
                  "In Stock": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                  "Low Stock": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
                  "Critical": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
                };
                return (
                  <motion.tr
                    key={stock.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 + idx * 0.05 }}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    className="hover:bg-gray-50 dark:hover:bg-dark-border transition-colors cursor-pointer"
                    onClick={() => setExpandedStock(expandedStock === stock.id ? null : stock.id)}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{stock.product}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-mono text-xs">{stock.sku}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{stock.warehouse}</td>
                    <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">{stock.currentStock}</td>
                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400 text-xs">{stock.minLevel}/{stock.maxLevel}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">₹{stock.unitPrice}</td>
                    <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">₹{stock.totalValue.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusColors[stock.status]}`}>
                        {stock.status}
                      </span>
                    </td>
                    {(userRole === "OWNER") && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditing(stock);
                            }}
                            className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteStock(stock.id);
                            }}
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Warehouse Locations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Main Warehouse</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Units</span>
              <span className="font-bold text-gray-900">671</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Warehouse Value</span>
              <span className="font-bold text-green-600">₹1,83,400</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Utilization</span>
              <span className="font-bold text-blue-600">67.1%</span>
            </div>
            <div className="mt-4 bg-gray-100 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: "67.1%" }}></div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Cold Storage</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Units</span>
              <span className="font-bold text-gray-900">28</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Warehouse Value</span>
              <span className="font-bold text-green-600">₹3,360</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Utilization</span>
              <span className="font-bold text-orange-600">9.3%</span>
            </div>
            <div className="mt-4 bg-gray-100 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: "9.3%" }}></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Stock Modal */}
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
            className="bg-white dark:bg-dark-card rounded-2xl p-8 max-w-md w-full shadow-xl max-h-96 overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Stock</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={editing.product}
                  onChange={(e) => setEditing({ ...editing, product: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">SKU</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={editing.sku}
                  onChange={(e) => setEditing({ ...editing, sku: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Current Stock</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={editing.currentStock}
                  onChange={(e) => setEditing({ ...editing, currentStock: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Unit Price</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={editing.unitPrice}
                  onChange={(e) => setEditing({ ...editing, unitPrice: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => saveStock(editing)}
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
