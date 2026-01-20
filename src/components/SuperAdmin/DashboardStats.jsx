import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  Users, CheckCircle, CreditCard, DollarSign, TrendingUp,
  AlertCircle, Building2, Activity
} from "lucide-react";
import { NotificationContext } from "../../context/NotificationContext";
import authAxios from "../../api/authAxios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function StatCard({ title, value, icon: Icon, color, trend }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-xl backdrop-blur border transition-all ${color}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-white/10">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardStats() {
  const { addNotification } = useContext(NotificationContext);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeOwners: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    newSignups: 0,
    failedPayments: 0,
    expiredSubscriptions: 0,
    systemHealth: "Healthy"
  });
  const [revenueData, setRevenueData] = useState([]);
  const [topBusinesses, setTopBusinesses] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch main stats
      const statsRes = await authAxios.get('/api/super-admin/dashboard-stats/');
      if (statsRes.data) {
        setStats({
          totalUsers: statsRes.data.total_users || 0,
          activeOwners: statsRes.data.active_owners || 0,
          activeSubscriptions: statsRes.data.active_subscriptions || 0,
          totalRevenue: statsRes.data.total_revenue || 0,
          newSignups: statsRes.data.new_signups || 0,
          failedPayments: statsRes.data.failed_payments || 0,
          expiredSubscriptions: statsRes.data.expired_subscriptions || 0,
          systemHealth: "Healthy"
        });
      }

      // Fetch revenue trend
      const revRes = await authAxios.get('/api/super-admin/reports/?type=revenue');
      if (revRes.data?.data) {
        setRevenueData(revRes.data.data);
      }

      // Fetch plan distribution
      const planRes = await authAxios.get('/api/super-admin/reports/?type=plans');
      if (planRes.data?.data) {
        setSubscriptionData(planRes.data.data);
      }

      // Fetch top businesses
      const bizRes = await authAxios.get('/api/super-admin/reports/?type=businesses');
      if (bizRes.data?.data) {
        setTopBusinesses(bizRes.data.data);
      } else {
        setTopBusinesses([]);
      }

    } catch (error) {

      addNotification("Error loading dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/20"
          trend={5}
        />
        <StatCard
          title="Active Owners"
          value={stats.activeOwners}
          icon={Building2}
          color="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-cyan-500/20"
          trend={3}
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={CreditCard}
          color="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/20"
          trend={8}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/20"
          trend={12}
        />
      </motion.div>

      {/* Secondary Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <p className="text-slate-400 text-sm">New Signups</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.newSignups}</p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-slate-400 text-sm">Failed Payments</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.failedPayments}</p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <p className="text-slate-400 text-sm">Expired Subs</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.expiredSubscriptions}</p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-4 h-4 text-green-400" />
            <p className="text-slate-400 text-sm">System Health</p>
          </div>
          <p className="text-xl font-bold text-green-400">{stats.systemHealth}</p>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-slate-800/50 rounded-xl border border-slate-700"
        >
          <h3 className="text-lg font-bold text-white mb-4">Revenue Trend</h3>
          {revenueData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4, fill: '#8b5cf6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No data available</p>
          )}
        </motion.div>

        {/* Subscription Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-slate-800/50 rounded-xl border border-slate-700"
        >
          <h3 className="text-lg font-bold text-white mb-4">Subscription Plans</h3>
          {subscriptionData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie data={subscriptionData} cx="50%" cy="50%" labelLine={false} label={{ fill: '#fff' }} outerRadius={80} fill="#8884d8" paddingAngle={2} dataKey="value">
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff' }} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No data available</p>
          )}
        </motion.div>
      </div>

      {/* Top Performing Businesses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 bg-slate-800/50 rounded-xl border border-slate-700"
      >
        <h3 className="text-lg font-bold text-white mb-4">Top Performing Businesses</h3>
        {topBusinesses.length > 0 ? (
          <div className="space-y-3">
            {topBusinesses.map((business, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{business.name}</p>
                  <p className="text-slate-400 text-sm">{business.subscriptions} active subscriptions</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">₹{business.revenue.toLocaleString()}</p>
                  <p className="text-green-400 text-sm">Monthly</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">No businesses with revenue yet</p>
        )}
      </motion.div>
    </div>
  );
}
