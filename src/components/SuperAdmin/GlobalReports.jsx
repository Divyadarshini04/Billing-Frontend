import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, DollarSign, Users, ShoppingCart, Calendar, Download } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import authAxios from "../../api/authAxios";

export default function GlobalReports() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month");
  const [revenueData, setRevenueData] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Fetch subscription data
      const subscriptionRes = await authAxios.get('/api/subscription/plans/');
      const usersRes = await authAxios.get('/api/super-admin/users/?limit=1000');
      
      const plans = Array.isArray(subscriptionRes.data) ? subscriptionRes.data : subscriptionRes.data?.results || [];
      const users = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.results || [];

      // Calculate stats
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.is_active).length;
      const totalRevenue = plans.reduce((sum, plan) => sum + (plan.price || 0), 0);

      // Create revenue chart data (mock for now)
      const mockRevenueData = [
        { name: "Week 1", revenue: Math.random() * 5000 },
        { name: "Week 2", revenue: Math.random() * 5000 },
        { name: "Week 3", revenue: Math.random() * 5000 },
        { name: "Week 4", revenue: Math.random() * 5000 },
      ];

      // Create subscription chart data
      const subscriptionChartData = plans.map(plan => ({
        name: plan.code,
        price: plan.price,
        staff: plan.max_staff_users
      }));

      setStats({
        totalRevenue: totalRevenue,
        totalUsers: totalUsers,
        totalSubscriptions: plans.length,
        activeSubscriptions: activeUsers
      });

      setRevenueData(mockRevenueData);
      setSubscriptionData(subscriptionChartData);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Global Reports</h2>
          <p className="text-slate-400">Platform-wide analytics and insights</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-700/30 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-700/30 rounded-xl"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-sm mb-1">Total Revenue</p>
              <p className="text-lg md:text-xl font-bold text-white truncate">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400 flex-shrink-0" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-700/30 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Subscription Plans</p>
              <p className="text-2xl font-bold text-white">{stats.totalSubscriptions}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-gradient-to-br from-orange-900/30 to-orange-800/30 border border-orange-700/30 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Active Users</p>
              <p className="text-2xl font-bold text-white">{stats.activeSubscriptions}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-slate-800/50 rounded-xl border border-slate-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Revenue Trend</h3>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400">Loading...</div>
          ) : revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-center py-8">No revenue data available</p>
          )}
        </motion.div>

        {/* Subscription Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-slate-800/50 rounded-xl border border-slate-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-bold text-white">Plan Pricing Overview</h3>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400">Loading...</div>
          ) : subscriptionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subscriptionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="price" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-center py-8">No subscription data available</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
