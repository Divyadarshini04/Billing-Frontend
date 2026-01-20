import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useSubscription } from "../context/SubscriptionContext";
import { useAuth } from "../context/AuthContext";

export function SubscriptionStatusWidget() {
  const { userRole } = useAuth();
  const { getSubscriptionStatus, getRemainingDays, getSubscription } = useSubscription();

  // Admin has unlimited subscription
  if (userRole === "ADMIN") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-bold text-gray-900">Admin Access</p>
              <p className="text-sm text-gray-600">Unlimited access to all features</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
            UNLIMITED
          </span>
        </div>
      </motion.div>
    );
  }

  const { status, message, color } = getSubscriptionStatus(userRole);
  const remainingDays = getRemainingDays(userRole);
  const subscription = getSubscription(userRole);

  const statusConfig = {
    ACTIVE: {
      icon: CheckCircle,
      bgColor: "from-green-50 to-green-100",
      borderColor: "border-green-200",
      iconColor: "text-green-600",
      badge: "bg-green-600",
    },
    EXPIRING_SOON: {
      icon: AlertCircle,
      bgColor: "from-orange-50 to-orange-100",
      borderColor: "border-orange-200",
      iconColor: "text-orange-600",
      badge: "bg-orange-600",
    },
    EXPIRED: {
      icon: AlertCircle,
      bgColor: "from-red-50 to-red-100",
      borderColor: "border-red-200",
      iconColor: "text-red-600",
      badge: "bg-red-600",
    },
    INACTIVE: {
      icon: AlertCircle,
      bgColor: "from-gray-50 to-gray-100",
      borderColor: "border-gray-200",
      iconColor: "text-gray-600",
      badge: "bg-gray-600",
    },
  };

  const config = statusConfig[status] || statusConfig.INACTIVE;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 bg-gradient-to-r ${config.bgColor} border ${config.borderColor} rounded-xl shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
          <div>
            <p className="font-bold text-gray-900">
              {status === "EXPIRED" ? "Subscription Expired" : "Subscription Status"}
            </p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 ${config.badge} text-white text-xs font-bold rounded-full block mb-2`}>
            {remainingDays} DAYS
          </span>
          <p className="text-xs text-gray-600">Expires {new Date(subscription.endDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, (remainingDays / subscription.duration) * 100)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`h-2 rounded-full ${
              status === "ACTIVE"
                ? "bg-green-600"
                : status === "EXPIRING_SOON"
                  ? "bg-orange-600"
                  : "bg-red-600"
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
}
