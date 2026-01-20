import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

/**
 * PricingCard Component
 * Displays a pricing plan with features and upgrade/current button
 */
export function PricingCard({
  planName,
  price,
  currency = "₹",
  duration = "month",
  description,
  features = [],
  isCurrentPlan = false,
  onUpgrade,
  featured = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: featured ? 1.05 : 1.02 }}
      className={`relative p-8 rounded-2xl transition-all duration-300 ${
        featured
          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl scale-105 ring-2 ring-blue-400"
          : "bg-white text-gray-900 shadow-lg hover:shadow-xl border border-gray-200"
      }`}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="px-4 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full">
            Most Popular
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="mb-6">
        <h3 className={`text-2xl font-bold mb-2 ${featured ? "text-white" : "text-gray-900"}`}>
          {planName}
        </h3>
        <p className={`text-sm ${featured ? "text-blue-100" : "text-gray-600"}`}>
          {description}
        </p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-bold ${featured ? "text-white" : "text-gray-900"}`}>
            {currency}{price}
          </span>
          <span className={`text-sm ${featured ? "text-blue-100" : "text-gray-600"}`}>
            /{duration}
          </span>
        </div>
      </div>

      {/* Features List */}
      <div className="mb-8 space-y-3">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-3"
          >
            <div
              className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                featured
                  ? "bg-blue-400/30 text-blue-100"
                  : "bg-green-100 text-green-600"
              }`}
            >
              <Check className="w-3 h-3" />
            </div>
            <span className={`text-sm ${featured ? "text-blue-50" : "text-gray-700"}`}>
              {feature}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onUpgrade}
        disabled={isCurrentPlan}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
          isCurrentPlan
            ? featured
              ? "bg-blue-400/30 text-white cursor-default"
              : "bg-gray-100 text-gray-600 cursor-default"
            : featured
            ? "bg-white text-blue-600 hover:bg-blue-50"
            : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg"
        }`}
      >
        {isCurrentPlan ? "✓ Current Plan" : "Upgrade Now"}
      </motion.button>

      {/* Divider */}
      <div className={`mt-8 pt-8 border-t ${featured ? "border-blue-400/30" : "border-gray-200"}`}>
        <p className={`text-xs ${featured ? "text-blue-100" : "text-gray-500"}`}>
          No credit card required • Cancel anytime
        </p>
      </div>
    </motion.div>
  );
}
