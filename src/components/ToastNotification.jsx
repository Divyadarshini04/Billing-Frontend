import React, { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, Bell, ShoppingCart, Package, Truck, DollarSign, User, CreditCard, Zap } from "lucide-react";
import { NotificationContext } from "../context/NotificationContext";

export default function ToastNotification() {
  const { notifications, clearNotification } = useContext(NotificationContext);
  const [displayedNotifications, setDisplayedNotifications] = useState([]);

  useEffect(() => {
    // Show only the last 3 notifications in toast
    setDisplayedNotifications(notifications.slice(0, 3));
  }, [notifications]);

  const getNotificationConfig = (type, title) => {
    // Determine config based on type and title
    let config = {
      icon: Bell,
      bgColor: "bg-gray-50 dark:bg-gray-900/30",
      borderColor: "border-gray-200 dark:border-gray-700",
      textColor: "text-gray-800 dark:text-gray-200",
      iconColor: "text-gray-500",
    };

    if (type === "sale" || title?.includes("Invoice") || title?.includes("Payment") || title?.includes("Cash") || title?.includes("Card") || title?.includes("UPI")) {
      config = {
        icon: ShoppingCart,
        bgColor: "bg-green-50 dark:bg-green-900/30",
        borderColor: "border-green-200 dark:border-green-700",
        textColor: "text-green-800 dark:text-green-200",
        iconColor: "text-green-500",
      };
    } else if (type === "product" || title?.includes("Product") || title?.includes("Stock") || title?.includes("Inventory")) {
      config = {
        icon: Package,
        bgColor: "bg-blue-50 dark:bg-blue-900/30",
        borderColor: "border-blue-200 dark:border-blue-700",
        textColor: "text-blue-800 dark:text-blue-200",
        iconColor: "text-blue-500",
      };
    } else if (type === "transit" || title?.includes("Shipment") || title?.includes("Transit") || title?.includes("Delivery")) {
      config = {
        icon: Truck,
        bgColor: "bg-indigo-50 dark:bg-indigo-900/30",
        borderColor: "border-indigo-200 dark:border-indigo-700",
        textColor: "text-indigo-800 dark:text-indigo-200",
        iconColor: "text-indigo-500",
      };
    } else if (title?.includes("Customer") || title?.includes("Due")) {
      config = {
        icon: User,
        bgColor: "bg-yellow-50 dark:bg-yellow-900/30",
        borderColor: "border-yellow-200 dark:border-yellow-700",
        textColor: "text-yellow-800 dark:text-yellow-200",
        iconColor: "text-yellow-500",
      };
    } else if (title?.includes("Success") || title?.includes("Saved") || title?.includes("Complete")) {
      config = {
        icon: CheckCircle2,
        bgColor: "bg-emerald-50 dark:bg-emerald-900/30",
        borderColor: "border-emerald-200 dark:border-emerald-700",
        textColor: "text-emerald-800 dark:text-emerald-200",
        iconColor: "text-emerald-500",
      };
    } else if (title?.includes("Error") || title?.includes("Failed") || title?.includes("Warning")) {
      config = {
        icon: AlertCircle,
        bgColor: "bg-red-50 dark:bg-red-900/30",
        borderColor: "border-red-200 dark:border-red-700",
        textColor: "text-red-800 dark:text-red-200",
        iconColor: "text-red-500",
      };
    }

    return config;
  };

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {displayedNotifications.map((notif, index) => {
          const config = getNotificationConfig(notif.type, notif.title);
          const Icon = config.icon;

          return (
            <motion.div
              key={notif.id}
              layout
              initial={{ opacity: 0, x: 100, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 100, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`pointer-events-auto mb-3 p-4 rounded-lg border ${config.bgColor} ${config.borderColor} shadow-lg max-w-sm`}
            >
              <div className="flex gap-3 items-start">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm ${config.textColor}`}>
                    {notif.title}
                  </h4>
                  <p className={`text-xs mt-1 ${config.textColor} opacity-90 line-clamp-2`}>
                    {notif.message}
                  </p>
                </div>
                <button
                  onClick={() => clearNotification(notif.id)}
                  className={`flex-shrink-0 ml-2 p-1 rounded hover:bg-black/10 transition-colors ${config.iconColor}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
