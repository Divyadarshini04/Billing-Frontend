import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Search, Download, Upload, Edit2, Trash2 } from "lucide-react";

export default function CustomersModule() {
  const [customers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Customers</h2>
          <p className="text-slate-400">Manage customer information and history</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: "0" },
          { label: "Active Customers", value: "0" },
          { label: "New This Month", value: "0" },
          { label: "Total Purchases", value: "₹0" }
        ].map((stat, idx) => (
          <motion.div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-sm">{stat.label}</p>
            <p className="text-white text-xl font-bold mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search and Import/Export */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg hover:border-cyan-500 transition flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Import
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg hover:border-cyan-500 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </motion.button>
      </div>

      {/* Customers Table */}
      <div className="overflow-x-auto bg-slate-800/50 rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/50 border-b border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Name</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Phone</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Email</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Total Spent</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Loyalty Points</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Purchases</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {customers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer, idx) => (
                <tr key={idx} className="hover:bg-slate-700/30 transition">
                  <td className="px-6 py-3 text-white font-medium">{customer.name}</td>
                  <td className="px-6 py-3 text-slate-300">{customer.phone}</td>
                  <td className="px-6 py-3 text-slate-300">{customer.email}</td>
                  <td className="px-6 py-3 text-white font-medium">₹{customer.spent}</td>
                  <td className="px-6 py-3 text-white">{customer.points}</td>
                  <td className="px-6 py-3 text-slate-300">{customer.purchases}</td>
                  <td className="px-6 py-3 flex gap-2">
                    <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-cyan-400 transition">
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition">
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
