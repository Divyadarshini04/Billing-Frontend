import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Settings,
  BarChart3,
  Activity,
  DollarSign,
  CreditCard,
  PieChart,
  CheckCircle,
  Plus,
  Trash2,
  Lock,
  HelpCircle,
  Database,
  TrendingUp,
  Bell,
  LogOut,
  Menu,
  AlertCircle,
  Server
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NotificationContext } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import authAxios from "../api/authAxios";
import DashboardStats from "../components/SuperAdmin/DashboardStats";
import UserManagement from "../components/SuperAdmin/UserManagement";
import SubscriptionManagement from "../components/SuperAdmin/SubscriptionManagement";
import GlobalReports from "../components/SuperAdmin/GlobalReports";
import SystemSettings from "../components/SuperAdmin/SystemSettings";
import SecurityLogs from "../components/SuperAdmin/SecurityLogs";
import SupportTickets from "../components/SuperAdmin/SupportTickets";
import DataControls from "../components/SuperAdmin/DataControls";


const TABS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "users", label: "User Management", icon: Users },
  { id: "subscriptions", label: "Subscriptions", icon: DollarSign },
  { id: "reports", label: "Reports", icon: TrendingUp },

  { id: "settings", label: "Settings", icon: Settings },
  { id: "support", label: "Support", icon: HelpCircle },
  { id: "data", label: "Data Controls", icon: Database },
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export default function SuperAdminPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addNotification } = useContext(NotificationContext);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Verify Super Admin access
  useEffect(() => {
    if (!user?.is_super_admin) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardStats />;
      case "users":
        return <UserManagement />;
      case "subscriptions":
        return <SubscriptionManagement />;
      case "reports":
        return <GlobalReports />;

      case "settings":
        return <SystemSettings />;
      case "support":
        return <SupportTickets />;
      case "data":
        return <DataControls />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header - Simplified */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Super Admin</h1>
                <p className="text-xs text-slate-400">System Master Control</p>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar Navigation - Full Height */}
        <div className={`fixed lg:static top-[73px] left-0 w-64 h-[calc(100vh-73px)] ${mobileMenuOpen ? "block" : "hidden"} lg:block z-30 bg-slate-800/95 backdrop-blur border-r border-slate-700 overflow-y-auto`}>
          <nav className="space-y-2 p-4">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-sm ${isActive
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                    }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            {/* User Info & Logout - At Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 to-transparent border-t border-slate-700">
              <div className="mb-3">
                <p className="text-sm font-medium text-white truncate">{user?.first_name || "Super Admin"}</p>
                <p className="text-xs text-slate-400 truncate">{user?.phone}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded-lg transition font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
