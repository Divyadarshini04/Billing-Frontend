import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Printer, Search, Trash2 } from "lucide-react";

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDeleteInvoice = (id) => {
    if (window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      setInvoices(invoices.filter((inv) => inv.id !== id));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">My Invoice History</h2>
        <p className="text-slate-400">View and reprint your invoices</p>
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
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <select className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500">
          <option>All Time</option>
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto bg-slate-800/50 rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/50 border-b border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Invoice #</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Customer</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Date & Time</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Amount</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Payment</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  No invoices yet
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
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                      {invoice.payment}
                    </span>
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-purple-400 transition">
                      <Printer className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-purple-400 transition">
                      <Download className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      className="p-2 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-slate-400 text-sm text-center">
        💡 You can only view and reprint invoices you created
      </p>
    </motion.div>
  );
}
