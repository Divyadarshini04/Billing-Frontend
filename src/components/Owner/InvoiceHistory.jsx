import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Printer, Trash2, Search } from "lucide-react";

export default function InvoiceHistory() {
  const [invoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Invoice History</h2>
        <p className="text-slate-400">View, print, and export invoices</p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <select className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500">
          <option>All Status</option>
          <option>Paid</option>
          <option>Pending</option>
          <option>Cancelled</option>
        </select>
        <select className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500">
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
          <option>Last Year</option>
          <option>All Time</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto bg-slate-800/50 rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/50 border-b border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Invoice #</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Customer</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Date</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Amount</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Status</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((invoice, idx) => (
                <tr key={idx} className="hover:bg-slate-700/30 transition">
                  <td className="px-6 py-3 text-white font-medium">INV-{invoice.id}</td>
                  <td className="px-6 py-3 text-slate-300">{invoice.customer}</td>
                  <td className="px-6 py-3 text-slate-400">{invoice.date}</td>
                  <td className="px-6 py-3 text-white font-medium">₹{invoice.amount}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      invoice.status === "Paid" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-cyan-400 transition">
                      <Printer className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-cyan-400 transition">
                      <Download className="w-4 h-4" />
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

      {/* Export Options */}
      <div className="flex gap-4 flex-wrap">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg hover:border-cyan-500 transition flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export as CSV
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg hover:border-cyan-500 transition flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export as PDF
        </motion.button>
      </div>
    </motion.div>
  );
}
