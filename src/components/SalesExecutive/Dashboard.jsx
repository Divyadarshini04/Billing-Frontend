import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, ShoppingCart, CreditCard } from "lucide-react";

export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">My Performance Today</h2>
        <p className="text-slate-400">Your sales overview for today</p>
      </div>

      {/* Daily Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Sales", value: "₹0", icon: TrendingUp, color: "purple" },
          { label: "Invoice Count", value: "0", icon: ShoppingCart, color: "blue" },
          { label: "Cash Collected", value: "₹0", icon: DollarSign, color: "green" },
          { label: "UPI/Card", value: "₹0", icon: CreditCard, color: "pink" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-purple-500/50 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-white text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon className="w-8 h-8 text-purple-400 opacity-50" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Today's Invoices */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Last 5 Invoices</h3>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-slate-300 font-medium">Invoice #</th>
                <th className="px-6 py-3 text-left text-slate-300 font-medium">Customer</th>
                <th className="px-6 py-3 text-left text-slate-300 font-medium">Time</th>
                <th className="px-6 py-3 text-left text-slate-300 font-medium">Amount</th>
                <th className="px-6 py-3 text-left text-slate-300 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                  No invoices yet today
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
