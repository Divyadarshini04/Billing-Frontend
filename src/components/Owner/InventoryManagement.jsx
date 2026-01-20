import React, { useState } from "react";
import { motion } from "framer-motion";
import { Package, Plus, AlertTriangle, Upload, Search } from "lucide-react";

export default function InventoryManagement() {
  const [products] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Inventory Management</h2>
        <p className="text-slate-400">Manage products and stock levels</p>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: "0", color: "cyan" },
          { label: "Low Stock", value: "0", color: "yellow" },
          { label: "Out of Stock", value: "0", color: "red" },
          { label: "Total Value", value: "₹0", color: "green" }
        ].map((stat, idx) => (
          <motion.div key={idx} className={`p-4 bg-slate-800/50 rounded-lg border border-slate-700`}>
            <p className="text-slate-400 text-sm">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 text-${stat.color}-400`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search and Actions */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg hover:border-cyan-500 transition flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Bulk Upload
        </motion.button>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto bg-slate-800/50 rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/50 border-b border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Product</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">SKU</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Current Stock</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Min. Stock</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Unit Price</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Status</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            <tr>
              <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                No products found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Low Stock Alerts */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          Stock Alerts
        </h3>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-300 text-sm">No low stock items at the moment</p>
        </div>
      </div>
    </motion.div>
  );
}
