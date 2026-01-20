import React, { useState } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { 
  Clock, 
  CreditCard, 
  AlertCircle, 
  ChevronRight,
  Check 
} from "lucide-react";
import { useSubscription } from "../context/SubscriptionContext";
import { useAuth } from "../context/AuthContext";

/**
 * Sidebar subscription card component
 * Shows current subscription status and allows upgrade
 */
export function SubscriptionCard() {
  const { userRole } = useAuth();
  const { 
    getSubscription, 
    getTrialRemainingDays, 
    isTrialExpired,
    upgradePlan,
    getAllPlans 
  } = useSubscription();
  
  const [showUpgradePlans, setShowUpgradePlans] = useState(false);
  const subscription = getSubscription(userRole);
  const allPlans = getAllPlans();
  
  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (showUpgradePlans) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showUpgradePlans]);
  
  // Handle undefined subscription with defensive defaults
  if (!subscription || !allPlans) {
    return null;
  }
  
  // Ensure subscription has plan field, default to FREE
  const normalizedSubscription = subscription && subscription.plan 
    ? subscription 
    : { ...subscription, plan: "FREE" };
    
  const planDetails = normalizedSubscription && allPlans[normalizedSubscription.plan] 
    ? allPlans[normalizedSubscription.plan] 
    : (allPlans && allPlans.FREE ? allPlans.FREE : null);
  
  const trialDaysLeft = getTrialRemainingDays(userRole);

  if (userRole === "ADMIN") {
    return null; // Admin doesn't need subscription
  }

  const handleUpgrade = (planName) => {
    upgradePlan(userRole, planName);
    setShowUpgradePlans(false);
    // You can add a success notification here
  };

  return (
    <>
      {/* Subscription Card - Compact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-2 mb-2 p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm"
      >
        {/* Plan Status */}
        <div className="mb-2">
          <div className="flex items-center justify-between gap-1">
            <h3 className="font-bold text-xs text-gray-900">
              {planDetails?.name || normalizedSubscription.plan}
            </h3>
            {normalizedSubscription.plan === "FREE" && (
              <span className="px-1.5 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-full whitespace-nowrap">
                FREE
              </span>
            )}
            {normalizedSubscription.plan === "BASIC" && (
              <span className="px-1.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
                ACTIVE
              </span>
            )}
            {normalizedSubscription.plan === "PREMIUM" && (
              <span className="px-1.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-700 rounded-full whitespace-nowrap">
                ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 line-clamp-1">{planDetails?.description}</p>
        </div>

        {/* Trial Status */}
        {normalizedSubscription.plan === "FREE" && !isTrialExpired(userRole) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-2 p-1.5 bg-orange-50 border border-orange-200 rounded-lg"
          >
            <div className="flex items-center gap-1 mb-0.5">
              <Clock className="w-3 h-3 text-orange-600" />
              <span className="text-xs font-bold text-orange-700">
                Trial: {trialDaysLeft}d left
              </span>
            </div>
            <p className="text-xs text-orange-600 font-semibold line-clamp-1">
              {trialDaysLeft} days remaining
            </p>
            {trialDaysLeft <= 7 && trialDaysLeft > 0 && (
              <p className="text-xs text-orange-700 mt-0.5">
                ⚠️ Expiring soon!
              </p>
            )}
          </motion.div>
        )}

        {/* Trial Expired */}
        {normalizedSubscription.plan === "FREE" && isTrialExpired(userRole) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-2 p-1.5 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-red-600" />
              <span className="text-xs font-bold text-red-700">
                Trial ended
              </span>
            </div>
          </motion.div>
        )}

        {/* Pricing for Free Plan */}
        {normalizedSubscription.plan === "FREE" && (
          <div className="mb-2 p-1.5 bg-white rounded-lg text-center">
            <span className="text-sm font-bold text-green-600">FREE</span>
          </div>
        )}

        {/* Pricing for Paid Plans */}
        {normalizedSubscription.plan !== "FREE" && (
          <div className="mb-2 p-1.5 bg-white rounded-lg">
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-bold text-gray-900">
                {planDetails?.currency}{planDetails?.price}
              </span>
              <span className="text-xs text-gray-600">/mo</span>
            </div>
          </div>
        )}

        {/* Upgrade Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowUpgradePlans(!showUpgradePlans)}
          className={`w-full py-1.5 px-2 rounded-lg font-bold text-xs transition-all flex items-center justify-between ${
            normalizedSubscription.plan === "FREE"
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <span className="flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            {normalizedSubscription.plan === "FREE" ? "Upgrade" : "Change"}
          </span>
          <ChevronRight className="w-3 h-3" />
        </motion.button>
      </motion.div>

      {/* Full Page Plans Modal */}
      {showUpgradePlans && ReactDOM.createPortal(
        <>
          {/* Full Screen Overlay - Blocks ALL content behind */}
          <div 
            className="fixed inset-0 z-[999998]" 
            style={{ 
              backgroundColor: '#ffffff',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          />
          
          {/* Subscription Plans Page - Clean, No Dashboard Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[999999] overflow-y-auto"
            style={{ backgroundColor: 'transparent' }}
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowUpgradePlans(false)}
              className="fixed top-6 right-6 w-12 h-12 bg-white hover:bg-gray-100 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all z-[1000000]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen relative z-[999999]" style={{ backgroundColor: 'rgb(249, 250, 251)' }}>
              {/* Header Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
                  Choose Your Perfect Plan
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Select the plan that fits your business needs. Upgrade or downgrade anytime.
                </p>
              </motion.div>

              {/* Plans Grid - ONLY PLAN CARDS, NO DASHBOARD */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {Object.entries(allPlans).map(([planKey, plan], index) => {
                  const isCurrentPlan = normalizedSubscription.plan === planKey;
                  const isPremium = planKey === "PREMIUM";
                  
                  return (
                    <motion.div
                      key={planKey}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className={`relative p-8 rounded-3xl transition-all ${
                        isPremium
                          ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-2xl border-4 border-purple-400"
                          : isCurrentPlan
                            ? "bg-white border-4 border-blue-500 shadow-2xl"
                            : "bg-white border-2 border-gray-200 shadow-lg hover:border-blue-300 hover:shadow-xl"
                      }`}
                    >
                      {/* Popular Badge */}
                      {isPremium && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <span className="px-6 py-2 bg-yellow-400 text-gray-900 text-sm font-bold rounded-full shadow-lg">
                            ⭐ MOST POPULAR
                          </span>
                        </div>
                      )}

                      {/* Current Plan Badge */}
                      {isCurrentPlan && !isPremium && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <span className="px-6 py-2 bg-blue-500 text-white text-sm font-bold rounded-full shadow-lg">
                            ✓ CURRENT PLAN
                          </span>
                        </div>
                      )}

                      {/* Plan Name */}
                      <div className="mb-6 text-center">
                        <h3 className={`text-3xl font-extrabold mb-2 ${isPremium ? "text-white" : "text-gray-900"}`}>
                          {plan.name}
                        </h3>
                        <p className={`text-sm ${isPremium ? "text-purple-100" : "text-gray-600"}`}>
                          {plan.description}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="mb-8 text-center">
                        {plan.price === 0 ? (
                          <div className={`text-5xl font-extrabold ${isPremium ? "text-white" : "text-green-600"}`}>
                            FREE
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-baseline justify-center gap-2">
                              <span className={`text-2xl ${isPremium ? "text-purple-200" : "text-gray-500"}`}>
                                {plan.currency}
                              </span>
                              <span className={`text-6xl font-extrabold ${isPremium ? "text-white" : "text-gray-900"}`}>
                                {plan.price}
                              </span>
                              <span className={`text-xl ${isPremium ? "text-purple-200" : "text-gray-500"}`}>
                                /month
                              </span>
                            </div>
                            {planKey === "BASIC" && (
                              <p className="text-sm text-gray-500 mt-2">Billed monthly</p>
                            )}
                            {planKey === "PREMIUM" && (
                              <p className="text-sm text-purple-200 mt-2">Best value for growing businesses</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Features List */}
                      <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                            isPremium ? "bg-white/20" : "bg-green-100"
                          }`}>
                            <Check className={`w-4 h-4 ${isPremium ? "text-white" : "text-green-600"}`} />
                          </div>
                          <span className={`text-base ${isPremium ? "text-white" : "text-gray-700"}`}>
                            <strong>{plan.features.maxProducts}</strong> products
                          </span>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                            isPremium ? "bg-white/20" : "bg-green-100"
                          }`}>
                            <Check className={`w-4 h-4 ${isPremium ? "text-white" : "text-green-600"}`} />
                          </div>
                          <span className={`text-base ${isPremium ? "text-white" : "text-gray-700"}`}>
                            <strong>{plan.features.maxCustomers}</strong> customers
                          </span>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                            isPremium ? "bg-white/20" : "bg-green-100"
                          }`}>
                            <Check className={`w-4 h-4 ${isPremium ? "text-white" : "text-green-600"}`} />
                          </div>
                          <span className={`text-base ${isPremium ? "text-white" : "text-gray-700"}`}>
                            <strong>{plan.features.maxUsers}</strong> users
                          </span>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                            isPremium ? "bg-white/20" : "bg-green-100"
                          }`}>
                            <Check className={`w-4 h-4 ${isPremium ? "text-white" : "text-green-600"}`} />
                          </div>
                          <span className={`text-base ${isPremium ? "text-white" : "text-gray-700"}`}>
                            <strong>{plan.features.storageGB}GB</strong> storage
                          </span>
                        </div>
                        
                        {plan.features.reportAccess && (
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                              isPremium ? "bg-white/20" : "bg-green-100"
                            }`}>
                              <Check className={`w-4 h-4 ${isPremium ? "text-white" : "text-green-600"}`} />
                            </div>
                            <span className={`text-base ${isPremium ? "text-white" : "text-gray-700"}`}>
                              <strong>Basic Reports</strong>
                            </span>
                          </div>
                        )}
                        
                        {plan.features.advancedAnalytics && (
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                              isPremium ? "bg-white/20" : "bg-green-100"
                            }`}>
                              <Check className={`w-4 h-4 ${isPremium ? "text-white" : "text-green-600"}`} />
                            </div>
                            <span className={`text-base ${isPremium ? "text-white" : "text-gray-700"}`}>
                              <strong>Advanced Analytics</strong>
                            </span>
                          </div>
                        )}

                        {plan.features.prioritySupport && (
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                              isPremium ? "bg-white/20" : "bg-green-100"
                            }`}>
                              <Check className={`w-4 h-4 ${isPremium ? "text-white" : "text-green-600"}`} />
                            </div>
                            <span className={`text-base ${isPremium ? "text-white" : "text-gray-700"}`}>
                              <strong>Priority Support</strong>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {isCurrentPlan ? (
                        <button className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg ${
                          isPremium
                            ? "bg-white text-purple-600"
                            : "bg-blue-600 text-white"
                        }`}>
                          ✓ Current Plan
                        </button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUpgrade(planKey)}
                          className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all ${
                            isPremium
                              ? "bg-white text-purple-600 hover:bg-gray-100"
                              : planKey === "FREE"
                                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                          }`}
                        >
                          {planKey === "FREE" ? "Start Free Trial" : `Upgrade to ${plan.name}`}
                        </motion.button>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center space-y-4"
              >
                <p className="text-gray-600 text-lg">
                  All plans include 24/7 customer support and regular updates
                </p>
                <p className="text-sm text-gray-500">
                  No credit card required for FREE plan • Cancel anytime • Secure payments
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>,
        document.body
      )}
    </>
  );
}
