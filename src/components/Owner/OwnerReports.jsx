import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, LineChart, PieChart as PieChartIcon, Filter } from "lucide-react";
import { BarChart, Bar, LineChart as LineChartComponent, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const chartData = [
  { name: "Jan", sales: 4000, items: 2400 },
  { name: "Feb", sales: 3000, items: 1398 },
  { name: "Mar", sales: 2000, items: 9800 },
  { name: "Apr", sales: 2780, items: 3908 }
];

const pieSalesData = [
  { name: "Electronics", value: 400 },
  { name: "Clothing", value: 300 },
  { name: "Food", value: 200 }
];

const COLORS = ["#06b6d4", "#0ea5e9", "#3b82f6"];

export default function OwnerReports() {
  const [selectedReport, setSelectedReport] = useState("sales");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Reports</h2>
          <p className="text-slate-400">View sales, inventory, and financial reports</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg hover:border-cyan-500 transition flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filter
        </motion.button>
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-4 flex-wrap">
        {[
          { id: "sales", label: "Sales Report", icon: BarChart3 },
          { id: "itemwise", label: "Item-wise Sales", icon: LineChart },
          { id: "stock", label: "Stock Report", icon: PieChartIcon },
          { id: "tax", label: "GST/Tax Report", icon: BarChart3 }
        ].map((report) => {
          const Icon = report.icon;
          return (
            <motion.button
              key={report.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedReport(report.id)}
              className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                selectedReport === report.id
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                  : "bg-slate-800 border border-slate-700 text-slate-300 hover:border-cyan-500"
              }`}
            >
              <Icon className="w-4 h-4" />
              {report.label}
            </motion.button>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChartComponent data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#06b6d4" strokeWidth={2} />
            </LineChartComponent>
          </ResponsiveContainer>
        </div>

        {/* Item-wise Sales */}
        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieSalesData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value">
                {pieSalesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Revenue */}
        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#06b6d4" />
              <Bar dataKey="items" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics */}
        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Key Metrics</h3>
          {[
            { label: "Total Revenue", value: "₹0", change: "+0%" },
            { label: "Avg Transaction", value: "₹0", change: "+0%" },
            { label: "Total Transactions", value: "0", change: "+0%" },
            { label: "Profit Margin", value: "0%", change: "+0%" }
          ].map((metric, idx) => (
            <div key={idx} className="flex justify-between items-start p-3 bg-slate-900/30 rounded-lg border border-slate-700/50">
              <div>
                <p className="text-slate-400 text-sm">{metric.label}</p>
                <p className="text-white font-bold text-lg mt-1">{metric.value}</p>
              </div>
              <span className="text-green-400 text-sm font-medium">{metric.change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Export Report */}
      <div className="flex gap-4 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg hover:border-cyan-500 transition"
        >
          Download as PDF
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg hover:border-cyan-500 transition"
        >
          Download as CSV
        </motion.button>
      </div>
    </motion.div>
  );
}
