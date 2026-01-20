import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, ShoppingCart, DollarSign, ArrowUpRight, Eye, TrendingUp, Calendar, Clock, Award, BarChart3, PieChart, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import { dashboardAPI } from "../api/apiService";
import Layout from "../components/Layout";

const StatCard = ({ icon: Icon, title, value, change, color }) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="relative overflow-hidden rounded-xl p-6 h-40 flex flex-col group cursor-pointer"
  >
    {/* Color Background - Solid Bottom Section */}
    <div className={`absolute bottom-0 left-0 right-0 h-1 ${color}`} />
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-full blur-2xl`} />

    {/* Card Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700" />

    {/* Content */}
    <div className="relative z-10 flex items-start justify-between h-full flex-col">
      <div className="w-full flex items-start justify-between">
        <p className="text-base font-bold text-gray-900 dark:text-white">{title}</p>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 10 }}
          className={`p-2.5 rounded-lg ${color} shadow-md`}
        >
          <Icon className="w-5 h-5 text-white" />
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col justify-end w-full">
        <h3 className="text-3xl font-bold text-black dark:text-white mb-2">
          {value}
        </h3>
        <div className="flex items-center gap-1">
          <ArrowUpRight className={`w-4 h-4 font-bold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`text-xs font-semibold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(change)}%
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function OwnerDashboardPage() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { hasPermission } = usePermissions();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [stats, setStats] = useState([
    { title: "Total Customers", value: "0", change: 0, icon: Users, color: "bg-accent" },
    { title: "Total Products", value: "0", change: 0, icon: ShoppingCart, color: "bg-secondary" },
    { title: "Total Revenue", value: "₹0", change: 0, icon: DollarSign, color: "bg-gradient-primary" },
    { title: "Active Customers", value: "0", change: 0, icon: Eye, color: "bg-purple-500" },
  ]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [todayStats, setTodayStats] = useState({ invoices: 0, revenue: 0, transactions: 0 });

  // Fetch dashboard data from backend and localStorage
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const calculateTotalRevenue = (customersData) => {
    const total = customersData.reduce((sum, customer) => {
      const spent = customer.spent || "₹0";
      const amount = parseInt(spent.replace(/[^0-9]/g, "")) || 0;
      return sum + amount;
    }, 0);

    if (total >= 10000000) {
      return `₹${(total / 10000000).toFixed(1)}Cr`;
    } else if (total >= 100000) {
      return `₹${(total / 100000).toFixed(1)}L`;
    }
    return `₹${total.toLocaleString()}`;
  };

  async function fetchDashboardData() {
    setLoading(true);
    try {
      setBackendConnected(false);

      // Fetch Overview and Recent Transactions
      const [overviewRes, recentRes, analyticsRes] = await Promise.all([
        dashboardAPI.getOverview(),
        dashboardAPI.getRecentTransactions(5),
        dashboardAPI.getAnalytics()
      ]);

      if (overviewRes.data) {
        setDashboardData(overviewRes.data);
        setBackendConnected(true);

        // Extract data
        const data = overviewRes.data;

        setStats([
          {
            title: "Total Customers",
            value: String(data.total_customers || 0),
            change: 12,
            icon: Users,
            color: "bg-accent"
          },
          {
            title: "Total Products",
            value: String(data.total_products || 0),
            change: 0,
            icon: ShoppingCart,
            color: "bg-secondary"
          },
          {
            title: "Total Revenue",
            value: `₹${(data.total_revenue || 0).toLocaleString()}`,
            change: 8,
            icon: DollarSign,
            color: "bg-gradient-primary"
          },
          {
            title: "Active Customers",
            value: String(data.active_customers || 0),
            change: 5,
            icon: Eye,
            color: "bg-purple-500"
          },
        ]);
      }

      if (recentRes.data) {
        // Transform backend data to match UI expected format
        const orders = recentRes.data.map(order => ({
          id: order.invoice_number,
          customer: order.customer__name || `Customer #${order.id}`,
          amount: `₹${order.total_amount}`,
          status: order.payment_status === 'paid' ? 'Completed' : 'Pending'
        }));
        setRecentOrders(orders);
      }

      setLoading(false);
    } catch (error) {
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  }
  const handleCreateInvoice = () => {
    navigate("/pos-billing");
  };

  const handleAddProduct = () => {
    navigate("/inventory");
  };

  const handleNewCustomer = () => {
    navigate("/customers");
  };

  const handleViewReports = () => {
    navigate("/reports");
  };

  const handleViewInvoices = () => {
    navigate("/invoices");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50 to-slate-100 dark:from-dark-bg dark:via-dark-bg dark:to-dark-bg p-4 md:p-8 transition-colors">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-300 to-blue-300 flex items-center justify-center shadow-lg">
              <span className="text-2xl">💼</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Billing & Sales Overview</p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Welcome back! Here's your business overview</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          {stats.map((stat, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <StatCard {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Orders & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:col-span-2 p-8 rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border shadow-lg dark:shadow-card-dark hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Orders</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleViewInvoices}
                  className="text-sm text-primary font-bold hover:text-primary/80 hover:bg-primary/5 dark:hover:bg-primary/10 px-4 py-2 rounded-lg transition-all"
                >
                  View All →
                </motion.button>
              </div>

            </div>
            <div className="space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + idx * 0.1 }}
                    whileHover={{ backgroundColor: "rgba(16, 185, 129, 0.02)" }}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-dark-border bg-gradient-to-r from-gray-50/50 to-transparent dark:from-white/5 dark:to-transparent hover:border-primary/20 transition-all"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white">{order.customer}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{order.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">{order.amount}</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${order.status === "Completed"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : order.status === "Pending"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                          }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">No recent orders</p>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border shadow-lg dark:shadow-card-dark hover:shadow-xl transition-shadow h-fit"
          >
            <div className="flex items-center gap-3 mb-4">
              <ShoppingCart className="w-5 h-5 text-accent" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h3>
              </div>
            </div>
            <div className="space-y-2">
              <motion.button
                onClick={handleCreateInvoice}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.15)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white font-bold hover:shadow-xl transition-all text-base"
              >
                Create Invoice
              </motion.button>
              <motion.button
                onClick={handleAddProduct}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 px-4 rounded-xl bg-secondary text-white font-bold hover:shadow-xl transition-all text-base"
              >
                Add Product
              </motion.button>
              <motion.button
                onClick={handleNewCustomer}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(245, 158, 11, 0.15)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 px-4 rounded-xl bg-accent text-white font-bold hover:shadow-xl transition-all text-base"
              >
                New Customer
              </motion.button>
            </div>
          </motion.div>
        </div>

      </div>
    </Layout>
  );
}
