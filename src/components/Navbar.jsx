import React, { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Users,
  Box,
  BarChart3,
  Settings,
  Home,
  Menu,
  X,
  TrendingUp,
  Package,
  ChevronDown,
  Receipt,
  Bell,
  Trash2,
  CheckCheck,
  LogOut,
  Shield,
  Gift,
  CreditCard,
  Heart,
  Percent,
  Building,
  Truck,
  AlertTriangle,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NotificationContext } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import { useCompanySettings } from "../context/CompanySettingsContext";
import authAxios from "../api/authAxios";
import { SubscriptionCard } from "./SubscriptionCard";

// Helper Component for Submenu Items
function SubMenuItem({ label, icon: Icon, to, active, onClick }) {
  return (
    <Link to={to} onClick={onClick}>
      <motion.div
        whileHover={{ x: 5 }}
        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm ml-6 mb-1 transition-all duration-200 ${active
          ? "text-blue-400 bg-white/5"
          : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{label}</span>
      </motion.div>
    </Link>
  );
}

function IconBtn({ icon: Icon, label, active, to, hasSubmenu, isOpen, onClick, subItems }) {
  const content = (
    <motion.div
      whileHover={{ x: 5 }}
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active && !hasSubmenu
        ? "bg-white/15 text-white shadow-lg"
        : "text-white/70 hover:text-white/90 hover:bg-white/5"
        }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="truncate font-medium text-sm">{label}</span>
      </div>
      {hasSubmenu && (
        <ChevronDown
          className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""
            }`}
        />
      )}
    </motion.div>
  );

  if (hasSubmenu) {
    return (
      <div className="mb-1">
        <div onClick={onClick} className="cursor-pointer">
          {content}
        </div>
        <motion.div
          initial={false}
          animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          {subItems && subItems.map((sub, idx) => (
            <SubMenuItem
              key={sub.path || idx}
              label={sub.label}
              icon={sub.icon}
              to={sub.path}
              active={sub.active} // Handled by parent
              onClick={sub.onClick} // Handled by parent if needed
            />
          ))}
        </motion.div>
      </div>
    );
  }

  if (to && to !== "#") {
    return (
      <Link to={to} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className="cursor-pointer">
      {content}
    </div>
  );
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, userRole } = useAuth();
  const { hasPermission } = usePermissions();
  const { companySettings } = useCompanySettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead, clearNotification, clearAllNotifications, unreadCount } = useContext(NotificationContext);
  const [backendConnected, setBackendConnected] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState(null); // Track open submenu by label

  // Check backend health periodically
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await authAxios.get('/health/');
        setBackendConnected(true);
      } catch (err) {
        setBackendConnected(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => location.pathname === path;

  // Helper to check if any child is active
  const isParentActive = (item) => {
    if (item.path && isActive(item.path)) return true;
    if (item.subItems) {
      return item.subItems.some(sub => isActive(sub.path));
    }
    return false;
  };

  const toggleSubmenu = (label) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  // Auto-open submenu if path matches
  useEffect(() => {
    // Find nested item
    const findParent = (items) => {
      for (const item of items) {
        if (item.subItems) {
          if (item.subItems.some(sub => isActive(sub.path))) {
            return item.label;
          }
        }
      }
      return null;
    };
    // We'll define coreItems inside rendering or use a state-independent definition if possible.
    // However, coreItems depends on roles/permissions which are relatively static.
    // For now, let's keep it simple.
  }, [location.pathname]);


  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "sale": return "🛍️";
      case "product": return "📦";
      case "transit": return "🚚";
      default: return "📢";
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Core Features
  // Refactored to include submenus
  const coreItemsDefinition = [
    { label: "Dashboard", icon: Home, path: "/owner/dashboard", roles: ["OWNER"], permission: "view_dashboard" },
    { label: "Dashboard", icon: Home, path: "/", roles: ["SALES_EXECUTIVE"], permission: "view_dashboard" },
    { label: "POS Billing", icon: ShoppingCart, path: "/pos", roles: ["OWNER", "SALES_EXECUTIVE"], permission: "view_pos" },
    { label: "Invoice History", icon: Receipt, path: "/invoices", roles: ["OWNER", "SALES_EXECUTIVE"], permission: "view_invoices" },
    { label: "Reports", icon: BarChart3, path: "/reports", roles: ["OWNER", "SALES_EXECUTIVE"], permission: "view_reports" },

    // Inventory Group
    {
      label: "Inventory",
      icon: Box,
      roles: ["OWNER", "SALES_EXECUTIVE"],
      permission: "view_inventory",
      hasSubmenu: true,
      subItems: [
        { label: "All Products", icon: Box, path: "/inventory", roles: ["OWNER", "SALES_EXECUTIVE"], permission: "view_inventory" }, // Main Inventory Page
        { label: "Stock Inward", icon: Truck, path: "/stock-inward", roles: ["OWNER"], permission: "manage_inventory" },
        { label: "Suppliers", icon: Users, path: "/suppliers", roles: ["OWNER"], permission: "manage_inventory" },
        { label: "Categories", icon: Package, path: "/owner/categories", roles: ["OWNER"], permission: "manage_inventory" },

      ]
    },

    { label: "Customers", icon: Users, path: "/customers", roles: ["OWNER", "SALES_EXECUTIVE"], permission: "view_customers" },
  ];

  // Settings Items
  const settingsItems = [
    { label: "Settings", icon: Settings, path: "/settings", roles: ["SALES_EXECUTIVE", "OWNER"], permission: "manage_settings" },
    { label: "Roles & Permissions", icon: Shield, path: "/owner/roles-permissions", roles: ["OWNER"], permission: "manage_users" },
    { label: "Subscription", icon: CreditCard, path: "/owner/subscription-management", roles: ["OWNER"], permission: "manage_subscription" },
    { label: "Support", icon: Heart, path: "/owner/support", roles: ["OWNER"], permission: "view_support" },
  ];

  const visibleCoreItems = coreItemsDefinition.reduce((acc, item) => {
    // Check role and permission for the parent item
    const roleMatch = item.roles.includes(userRole);
    const permMatch = !item.permission || hasPermission(userRole, item.permission);

    // If parent is not accessible, skip it
    if (!roleMatch || !permMatch) return acc;

    // Handle subitems if they exist
    if (item.subItems) {
      // Filter subitems based on their own roles/permissions
      const filteredSubItems = item.subItems.filter(sub => {
        const subRoleMatch = sub.roles.includes(userRole);
        const subPermMatch = !sub.permission || hasPermission(userRole, sub.permission);
        return subRoleMatch && subPermMatch;
      });

      // If after filtering we still have subitems, add the parent with the filtered children
      // For items that act as groups (like Inventory), we only show them if they have accessible children.
      if (filteredSubItems.length > 0) {
        acc.push({ ...item, subItems: filteredSubItems });
      }
    } else {
      // If no subitems, just add the item as is
      acc.push(item);
    }

    return acc;
  }, []);

  const visibleSettingsItems = settingsItems.filter(item => {
    const roleMatch = item.roles.includes(userRole);
    const permMatch = !item.permission || hasPermission(userRole, item.permission);
    return roleMatch && permMatch;
  });

  // Auto-expand Inventory if on a sub-page
  useEffect(() => {
    visibleCoreItems.forEach(item => {
      if (item.hasSubmenu && item.subItems) {
        if (item.subItems.some(sub => isActive(sub.path))) {
          setOpenSubmenu(item.label);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);


  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-dark-sidebar to-dark-sidebar/95 text-white flex-col border-r border-white/5 z-50">
        {/* Logo Section - Fixed Top */}
        <div className="flex-shrink-0 p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg overflow-hidden bg-white p-1">
              <img src="/brand-logo.png" alt="Geo Billing Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Geo Billing</h1>
              <p className="text-xs text-white/60">Billing Suite</p>
            </div>
          </div>
        </div>

        {/* Notifications Panel - Fixed Top */}
        <div className="flex-shrink-0 relative border-b border-white/10 p-4">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notificationOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-4 right-4 top-full mt-2 bg-dark-sidebar border border-white/10 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50"
            >
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-white/60">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-white/5">
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 cursor-pointer transition-all duration-200 ${!notif.read
                          ? "bg-gradient-to-r from-white/10 to-white/5 hover:bg-gradient-to-r hover:from-white/15 hover:to-white/10"
                          : "bg-transparent hover:bg-white/3 opacity-60"
                          }`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="flex gap-3">
                          <span className={`text-xl flex-shrink-0 transition-opacity ${!notif.read ? "" : "opacity-50"
                            }`}>
                            {getNotificationIcon(notif.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate transition-colors ${!notif.read ? "text-white" : "text-white/60"
                              }`}>
                              {notif.title}
                            </p>
                            <p className={`text-xs line-clamp-2 mt-1 transition-colors ${!notif.read ? "text-white/60" : "text-white/40"
                              }`}>
                              {typeof notif.message === 'string' ? notif.message : 'Notification'}
                            </p>
                            <p className={`text-xs mt-2 transition-colors ${!notif.read ? "text-white/40" : "text-white/30"
                              }`}>
                              {formatTime(notif.timestamp)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notif.id);
                            }}
                            className={`transition-colors ${!notif.read
                              ? "text-white/40 hover:text-white/70"
                              : "text-white/20 hover:text-white/40"
                              }`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="border-t border-white/5 p-3 flex gap-2">
                    <button
                      onClick={() => markAllAsRead()}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Mark all read
                    </button>
                    <button
                      onClick={() => clearAllNotifications()}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear all
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Scrollable Navigation Area - Takes remaining height */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
          {/* Core Items */}
          {visibleCoreItems.map((item) => (
            <IconBtn
              key={item.label} // Use label as key for parent items
              {...item}
              active={isParentActive(item)}
              to={item.path}
              isOpen={openSubmenu === item.label}
              onClick={() => {
                if (item.hasSubmenu) {
                  toggleSubmenu(item.label);
                }
              }}
              // Map subItems to include active state
              subItems={item.subItems ? item.subItems.map(sub => ({
                ...sub,
                active: isActive(sub.path)
              })) : undefined}
            />
          ))}

          {/* Settings Section */}
          {visibleSettingsItems.length > 0 && (
            <div className="pt-2 border-t border-white/5 mt-2">
              {visibleSettingsItems.map((item) => (
                <IconBtn key={item.path} {...item} active={isActive(item.path)} to={item.path} />
              ))}
            </div>
          )}
        </nav>

        {/* Bottom Section - Fixed Bottom */}
        <div className="flex-shrink-0 p-4 border-t border-white/10 space-y-2 bg-dark-sidebar z-10">
          {/* {userRole === "OWNER" && <SubscriptionCard />} */}

          <div className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center font-bold overflow-hidden">
              {companySettings?.logo ? (
                <img src={companySettings.logo} alt="Company Logo" className="w-full h-full object-cover" />
              ) : (
                <span>{user?.role === "OWNER" ? "👨‍💼" : "💼"}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : (user?.name || "User")}</p>
              <p className="text-xs text-white/60 truncate">+91 {user?.phone || "N/A"}</p>
            </div>
          </div>

          {(user?.is_super_admin || userRole === "SUPERADMIN") && (
            <IconBtn
              icon={Shield}
              label="Super Admin Panel"
              active={isActive("/super-admin")}
              to="/super-admin"
            />
          )}

          {/* Hide logout button for OWNER role */}
          {/* Backend Status Indicator */}
          <div className="flex items-center justify-center gap-2 mb-3 px-4 py-2 bg-white/5 rounded-lg mx-4">
            <div className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className={`text-xs font-medium ${backendConnected ? 'text-green-400' : 'text-red-400'}`}>
              {backendConnected ? "System Online" : "System Offline"}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-xl font-medium transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside >

      {/* Mobile Header (Classic) */}
      < div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-dark-sidebar to-dark-sidebar/90 text-white flex items-center justify-between px-4 z-50 border-b border-white/5" >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center font-bold overflow-hidden">
            {companySettings.logo ? (
              <img src={companySettings.logo} alt="Company Logo" className="w-full h-full object-cover" />
            ) : (
              <span>💰</span>
            )}
          </div>
          <span className="font-bold">Geo Billing</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div >

      {/* Mobile Menu */}
      {
        mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden fixed top-16 left-0 right-0 bg-dark-sidebar text-white border-b border-white/5 p-4 space-y-2 z-40 max-h-96 overflow-y-auto"
          >
            {visibleCoreItems.map((item) => (
              <IconBtn
                key={item.label}
                {...item}
                active={isParentActive(item)}
                to={item.path}
                isOpen={openSubmenu === item.label}
                onClick={() => {
                  if (item.hasSubmenu) {
                    toggleSubmenu(item.label);
                  } else {
                    setMobileOpen(false);
                  }
                }}
                subItems={item.subItems ? item.subItems.map(sub => ({
                  ...sub,
                  active: isActive(sub.path),
                  onClick: () => setMobileOpen(false)
                })) : undefined}
              />
            ))}

            {/* Mobile Settings */}
            {visibleSettingsItems.length > 0 && (
              <div className="pt-2 border-t border-white/5 mt-2">
                {visibleSettingsItems.map((item) => (
                  <IconBtn key={item.path} {...item} active={isActive(item.path)} to={item.path} onClick={() => setMobileOpen(false)} />
                ))}
              </div>
            )}
          </motion.div>
        )
      }
    </>
  );
}
