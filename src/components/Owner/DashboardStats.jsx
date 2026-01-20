import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Users, ShoppingCart, DollarSign, TrendingUp, Plus, AlertCircle } from "lucide-react";
import { NotificationContext } from "../../context/NotificationContext";
import authAxios from "../../api/authAxios";
import { useFeatureControls } from "../../hooks/useFeatureControls";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function StatCard({ title, value, icon: Icon, color, trend, isVisible }) {
  if (!isVisible) return null;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-xl backdrop-blur border transition-all ${color} bg-white dark:bg-slate-800 shadow-sm`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-gray-600 dark:text-slate-400 text-sm font-medium mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
          {trend && <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</p>}
        </div>
        <div className="p-3 rounded-lg bg-gray-100 dark:bg-white/10">
          <Icon className="w-6 h-6 text-gray-700 dark:text-white" />
        </div>
      </div>
    </motion.div>
  );
}

export default function OwnerDashboardStats() {
  const { addNotification } = useContext(NotificationContext);
  const { features, loading: controlsLoading } = useFeatureControls();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    activeCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);

  // Define fetchDashboardData before useEffect
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch Overview Stats
      const statsRes = await authAxios.get('/api/dashboard/overview/');
      if (statsRes.data) {
        setStats({
          totalCustomers: statsRes.data.total_customers || 0,
          totalProducts: statsRes.data.total_products || 0,
          totalRevenue: statsRes.data.total_revenue || 0,
          activeCustomers: statsRes.data.active_customers || 0,
        });
      }

      // Fetch Recent Orders
      if (features.dashboard_recent_orders_widget) {
        const ordersRes = await authAxios.get('/api/billing/invoices/?limit=5');
        if (ordersRes.data?.results) {
          setRecentOrders(ordersRes.data.results);
        }
      }

      // Fetch Sales Trend
      const salesRes = await authAxios.get('/api/dashboard/analytics/?period=week');
      if (salesRes.data && salesRes.data.daily_sales) {
        const mappedSales = salesRes.data.daily_sales.map(item => ({
          date: item.date,
          amount: item.total
        }));
        setSalesData(mappedSales);
      }
    } catch (error) {

      addNotification("Error loading dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Call hooks first (before any conditional returns)
  useEffect(() => {
    if (!controlsLoading && features.dashboard_data_calculation_enable) {
      fetchDashboardData();
    }
  }, [features.dashboard_data_calculation_enable, controlsLoading]);

  // Check if dashboard access is enabled - show loading first, then check
  if (controlsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!features.dashboard_access_enable) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Access Disabled</h2>
          <p className="text-gray-600 dark:text-slate-400">Your dashboard has been disabled by the administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Safe Mode Warning */}
      {!features.dashboard_data_calculation_enable && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
          <p className="text-yellow-800 dark:text-yellow-300 text-sm">Dashboard is in safe mode - data calculation is disabled</p>
        </div>
      )}

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="border-blue-200 dark:border-blue-500/20"
          trend={5}
          isVisible={features.dashboard_total_customers_card}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={ShoppingCart}
          color="border-cyan-200 dark:border-cyan-500/20"
          trend={3}
          isVisible={features.dashboard_total_products_card}
        />
        <StatCard
          title="Total Revenue"
          value={features.dashboard_revenue_visibility ? `₹${stats.totalRevenue.toLocaleString()}` : "***"}
          icon={DollarSign}
          color="border-green-200 dark:border-green-500/20"
          trend={8}
          isVisible={features.dashboard_total_revenue_card}
        />
        <StatCard
          title="Active Customers"
          value={stats.activeCustomers}
          icon={TrendingUp}
          color="border-purple-200 dark:border-purple-500/20"
          trend={12}
          isVisible={features.dashboard_active_customers_card}
        />
      </motion.div>

      {/* Sales Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Daily Sales Trend</h3>
        {salesData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#1e293b' }} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4, fill: '#06b6d4' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-slate-400 text-center py-8">No sales data available</p>
        )}
      </motion.div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        {(features.dashboard_create_invoice_button || features.dashboard_add_product_button || features.dashboard_add_customer_button) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {features.dashboard_create_invoice_button && (
                <button className="w-full flex items-center gap-2 py-2 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium">
                  <Plus className="w-4 h-4" />
                  Create Invoice
                </button>
              )}
              {features.dashboard_add_customer_button && (
                <button className="w-full flex items-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                  <Plus className="w-4 h-4" />
                  Add Customer
                </button>
              )}
              {features.dashboard_add_product_button && (
                <button className="w-full flex items-center gap-2 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Recent Orders */}
        {features.dashboard_recent_orders_widget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${(features.dashboard_create_invoice_button || features.dashboard_add_product_button || features.dashboard_add_customer_button) ? 'lg:col-span-2' : 'lg:col-span-3'} p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm`}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Orders</h3>
            {recentOrders.length > 0 ? (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-transparent">
                    <div>
                      {features.dashboard_invoice_number_visibility && (
                        <p className="text-gray-900 dark:text-white font-medium">Invoice #{order.id}</p>
                      )}
                      <p className="text-gray-500 dark:text-slate-400 text-sm">{order.customer_name || 'Walk-in'}</p>
                    </div>
                    {features.dashboard_order_amount_visibility && (
                      <p className="text-gray-900 dark:text-white font-bold">₹{order.total || 0}</p>
                    )}
                    {features.dashboard_order_status_visibility && (
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-600/30 text-green-700 dark:text-green-300 rounded-full">
                        {order.status || 'Completed'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-slate-400 text-center py-4">No recent orders</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
