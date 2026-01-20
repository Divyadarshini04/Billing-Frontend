import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Lock } from "lucide-react";
import { useSubscription } from "../context/SubscriptionContext";
import { useAuth } from "../context/AuthContext";

/**
 * Example component showing how to enforce subscription limits
 * This demonstrates how to use subscription checks in real features
 */
export function SubscriptionAwareComponent() {
  const { userRole } = useAuth();
  const { checkFeatureLimit, isSubscriptionActive, getSubscriptionStatus } = useSubscription();
  const [itemCount, setItemCount] = useState(0);

  // Check if subscription is active
  const { status } = getSubscriptionStatus(userRole);
  const isActive = isSubscriptionActive(userRole);

  // Check feature limit
  const maxProductsCheck = checkFeatureLimit(userRole, "maxProducts");

  // Handle creating new item
  const handleAddItem = () => {
    // Check subscription first
    if (!isActive) {
      alert("Your subscription has expired. Please renew to continue.");
      return;
    }

    // Check feature limit
    if (itemCount >= maxProductsCheck.limit) {
      alert(`You've reached the limit of ${maxProductsCheck.limit} products. Please upgrade your subscription.`);
      return;
    }

    setItemCount(itemCount + 1);
  };

  // Show warning if subscription is expiring
  if (status === "EXPIRING_SOON" && userRole !== "ADMIN") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <div>
            <h3 className="font-bold text-orange-900">Subscription Expiring Soon</h3>
            <p className="text-sm text-orange-800">Your subscription will expire soon. Please renew to maintain access.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show error if subscription has expired
  if (!isActive && userRole !== "ADMIN") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
      >
        <Lock className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <h3 className="font-bold text-red-900 mb-2">Subscription Expired</h3>
        <p className="text-red-700 mb-4">Your subscription has expired. Please renew to access this feature.</p>
        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg">
          Renew Subscription
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Feature Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-bold text-gray-900">Subscription Status</p>
            <p className="text-sm text-gray-600">
              {userRole === "ADMIN"
                ? "Unlimited access"
                : `${itemCount} / ${maxProductsCheck.limit} items`}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-800 font-bold rounded-full text-sm">
          ACTIVE
        </span>
      </motion.div>

      {/* Usage Progress */}
      {userRole !== "ADMIN" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">Usage Limit</p>
            <p className="text-sm text-gray-600">
              {itemCount} / {maxProductsCheck.limit}
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(itemCount / maxProductsCheck.limit) * 100}%` }}
              transition={{ duration: 0.3 }}
              className={`h-2 rounded-full ${
                itemCount / maxProductsCheck.limit > 0.9 ? "bg-red-500" : "bg-green-500"
              }`}
            />
          </div>
        </motion.div>
      )}

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddItem}
        disabled={!isActive || (itemCount >= maxProductsCheck.limit && userRole !== "ADMIN")}
        className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
          isActive && (itemCount < maxProductsCheck.limit || userRole === "ADMIN")
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Add Item
      </motion.button>

      {/* Warning Messages */}
      {itemCount >= maxProductsCheck.limit && userRole !== "ADMIN" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-orange-50 border border-orange-200 rounded-lg p-3"
        >
          <p className="text-sm text-orange-800">
            ⚠️ You've reached your limit of {maxProductsCheck.limit} items. Upgrade your subscription to add more.
          </p>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Example: Hook usage in functional components
 */
export function ExampleHookUsage() {
  const { userRole } = useAuth();
  const { checkFeatureLimit, isSubscriptionActive } = useSubscription();

  // Check if feature is available
  const reportAccessCheck = checkFeatureLimit(userRole, "reportAccess");

  if (!isSubscriptionActive(userRole)) {
    return <div>Subscription expired</div>;
  }

  if (!reportAccessCheck.allowed) {
    return <div>Report access is not enabled in your subscription</div>;
  }

  return <div>Report content here...</div>;
}
