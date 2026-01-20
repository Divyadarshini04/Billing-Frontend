import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  X,
  ArrowRight,
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { PricingCard } from "./PricingCard";

/**
 * Dashboard Component
 * Main dashboard layout with statistics and pricing section
 */
export function Dashboard() {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("BASIC");

  // Statistics data
  const stats = [
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: "₹45,231",
      percentageChange: 12.5,
      trend: "up",
    },
    {
      icon: ShoppingCart,
      label: "Total Orders",
      value: "1,234",
      percentageChange: 8.3,
      trend: "up",
    },
    {
      icon: Users,
      label: "Total Customers",
      value: "856",
      percentageChange: 5.2,
      trend: "up",
    },
    {
      icon: Eye,
      label: "Page Views",
      value: "12,450",
      percentageChange: 3.1,
      trend: "up",
    },
  ];

  // Pricing plans data
  const plans = [
    {
      id: "FREE",
      planName: "Free Trial",
      price: 0,
      currency: "₹",
      duration: "3 months",
      description: "Perfect for getting started",
      features: [
        "100 Products",
        "50 Customers",
        "500 Invoices",
        "1 User Account",
        "1GB Storage",
        "Basic Reports",
      ],
      featured: false,
    },
    {
      id: "BASIC",
      planName: "Basic Plan",
      price: 999,
      currency: "₹",
      duration: "month",
      description: "For growing businesses",
      features: [
        "1,000 Products",
        "500 Customers",
        "10,000 Invoices",
        "10 User Accounts",
        "5GB Storage",
        "Advanced Reports",
        "Email Support",
      ],
      featured: true,
    },
    {
      id: "PREMIUM",
      planName: "Premium Plan",
      price: 2999,
      currency: "₹",
      duration: "month",
      description: "For enterprises",
      features: [
        "5,000 Products",
        "5,000 Customers",
        "100,000 Invoices",
        "100 User Accounts",
        "50GB Storage",
        "Advanced Reports",
        "Priority Support",
        "Advanced Analytics",
        "API Access",
      ],
      featured: false,
    },
  ];

  const handleUpgrade = (planId) => {
    setSelectedPlan(planId);
    setShowPricingModal(false);
    // You can add API call here to upgrade the plan
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your business overview</p>
      </div>

      {/* Statistics Cards Section */}
      <div className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, idx) => (
            <StatsCard key={idx} {...stat} />
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Choose Your Plan
            </h2>
            <p className="text-gray-600">
              Select the perfect plan for your business needs
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPricingModal(!showPricingModal)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View Plans
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              planName={plan.planName}
              price={plan.price}
              currency={plan.currency}
              duration={plan.duration}
              description={plan.description}
              features={plan.features}
              isCurrentPlan={selectedPlan === plan.id}
              featured={plan.featured}
              onUpgrade={() => handleUpgrade(plan.id)}
            />
          ))}
        </div>
      </motion.div>

      {/* Modal Overlay for Pricing */}
      {showPricingModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowPricingModal(false)}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-40"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">
                  Subscription Plans
                </h3>
                <p className="text-gray-600 mt-2">
                  Choose the plan that best fits your needs
                </p>
              </div>
              <motion.button
                whileHover={{ rotate: 90 }}
                onClick={() => setShowPricingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </motion.button>
            </div>

            {/* Modal Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  planName={plan.planName}
                  price={plan.price}
                  currency={plan.currency}
                  duration={plan.duration}
                  description={plan.description}
                  features={plan.features}
                  isCurrentPlan={selectedPlan === plan.id}
                  featured={plan.featured}
                  onUpgrade={() => handleUpgrade(plan.id)}
                />
              ))}
            </div>

            {/* Modal Footer */}
            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-4">
                All plans include a 30-day free trial. No credit card required.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPricingModal(false)}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Dashboard;
