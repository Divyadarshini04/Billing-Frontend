import React from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

/**
 * StatsCard Component
 * Displays a single statistic with icon, value, and percentage increase
 */
export function StatsCard({ icon: Icon, label, value, percentageChange, trend = "up" }) {
  const isPositive = trend === "up" ? percentageChange >= 0 : percentageChange <= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="flex-1 min-w-xs p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      {/* Header with Icon and Label */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600">{label}</h3>
        <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* Main Value */}
      <div className="mb-4">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>

      {/* Percentage Change Indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            isPositive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          <TrendingUp
            className={`w-3 h-3 transition-transform ${
              isPositive ? "rotate-0" : "rotate-180"
            }`}
          />
          <span>{Math.abs(percentageChange)}%</span>
        </div>
        <span className="text-xs text-gray-500">vs last month</span>
      </div>
    </motion.div>
  );
}
