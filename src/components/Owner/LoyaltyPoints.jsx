import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Zap, Crown, TrendingUp } from "lucide-react";

export default function LoyaltyPoints() {
  const [tiers] = useState([
    { name: "Bronze", minPoints: 0, discount: "5%" },
    { name: "Silver", minPoints: 500, discount: "10%" },
    { name: "Gold", minPoints: 1500, discount: "15%" }
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Loyalty Points Program</h2>
        <p className="text-slate-400">Manage customer loyalty tiers and rewards</p>
      </div>

      {/* Loyalty Settings */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Points per ₹1", value: "1", icon: Zap },
          { label: "Redemption Value", value: "₹0.5", icon: TrendingUp },
          { label: "Total Members", value: "0", icon: Heart },
          { label: "Active Points", value: "0", icon: Crown }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-white text-xl font-bold mt-1">{stat.value}</p>
                </div>
                <Icon className="w-6 h-6 text-cyan-500 opacity-50" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Loyalty Tiers */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Loyalty Tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((tier, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 hover:border-cyan-500 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-white">{tier.name}</h4>
                <Crown className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 text-sm">Min Points</p>
                  <p className="text-white font-medium">{tier.minPoints}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Discount</p>
                  <p className="text-white font-medium text-lg">{tier.discount}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-4 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                Edit
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Customer Loyalty History */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Top Loyal Customers</h3>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-slate-300 font-medium">Customer</th>
                <th className="px-6 py-3 text-left text-slate-300 font-medium">Current Points</th>
                <th className="px-6 py-3 text-left text-slate-300 font-medium">Tier</th>
                <th className="px-6 py-3 text-left text-slate-300 font-medium">Visits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              <tr className="hover:bg-slate-700/30 transition">
                <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                  No customer data yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
