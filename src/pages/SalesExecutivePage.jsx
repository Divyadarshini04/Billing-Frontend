import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, ShoppingCart, FileText, Users, Package, Settings, LogOut, Menu
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NotificationContext } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import authAxios from "../api/authAxios";

// Import Sales Executive modules
import SalesExecutiveDashboard from "../components/SalesExecutive/Dashboard";
import POSBillingExecutive from "../components/SalesExecutive/POSBilling";
import InvoiceHistoryExecutive from "../components/SalesExecutive/InvoiceHistory";
import CustomersExecutive from "../components/SalesExecutive/Customers";
import InventoryViewOnly from "../components/SalesExecutive/InventoryViewOnly";
import SettingsExecutive from "../components/SalesExecutive/Settings";

const SALES_EXEC_TABS = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "pos", label: "POS Billing", icon: ShoppingCart },
  { id: "invoices", label: "Invoice History", icon: FileText },
  { id: "customers", label: "Customers", icon: Users },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "settings", label: "Settings", icon: Settings },
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export default function SalesExecutivePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addNotification } = useContext(NotificationContext);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verify Sales Executive access
  useEffect(() => {
    if (!user || (user?.role !== "SALES_EXECUTIVE" && !user?.is_super_admin)) {
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
        return <SalesExecutiveDashboard />;
      case "pos":
        return <POSBillingExecutive />;
      case "invoices":
        return <InvoiceHistoryExecutive />;
      case "customers":
        return <CustomersExecutive />;
      case "inventory":
        return <InventoryViewOnly />;
      case "settings":
        return <SettingsExecutive />;
      default:
        return <SalesExecutiveDashboard />;
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Sales Executive</h1>
              <p className="text-xs text-slate-400">Point of Sale Terminal</p>
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
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar Navigation */}
        <div className={`fixed lg:static top-[73px] left-0 w-64 h-[calc(100vh-73px)] ${mobileMenuOpen ? "block" : "hidden"} lg:block z-30 bg-slate-800/95 backdrop-blur border-r border-slate-700 overflow-y-auto`}>
          <nav className="space-y-2 p-4">
            {SALES_EXEC_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-sm ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900/50 border-t border-slate-700 space-y-3">
            <div className="px-3 py-2 bg-slate-700/50 rounded-lg">
              <p className="text-sm font-medium text-white truncate">{user?.first_name || "Sales Staff"}</p>
              <p className="text-xs text-slate-400 truncate">Sales Exec • {user?.phone}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded-lg transition font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
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
