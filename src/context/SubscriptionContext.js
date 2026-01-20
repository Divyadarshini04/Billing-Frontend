import React, { createContext, useState, useContext, useEffect } from "react";

const SubscriptionContext = createContext();

// Subscription plans with pricing
const SUBSCRIPTION_PLANS = {
  FREE: {
    name: "Free Trial",
    price: 0,
    duration: 3, // months
    currency: "₹",
    features: {
      maxProducts: 100,
      maxCustomers: 50,
      maxInvoices: 500,
      maxUsers: 1,
      storageGB: 1,
      reportAccess: false,
      advancedAnalytics: false,
    },
    description: "3 months free trial for new users",
  },
  BASIC: {
    name: "Basic Plan",
    price: 999, // per month in rupees
    duration: 1, // month (recurring)
    currency: "₹",
    features: {
      maxProducts: 1000,
      maxCustomers: 500,
      maxInvoices: 10000,
      maxUsers: 10,
      storageGB: 5,
      reportAccess: true,
      advancedAnalytics: false,
    },
    description: "Perfect for small businesses",
  },
  PREMIUM: {
    name: "Premium Plan",
    price: 2999, // per month in rupees
    duration: 1, // month (recurring)
    currency: "₹",
    features: {
      maxProducts: 5000,
      maxCustomers: 5000,
      maxInvoices: 100000,
      maxUsers: 100,
      storageGB: 50,
      reportAccess: true,
      advancedAnalytics: true,
    },
    description: "For growing businesses with advanced needs",
  },
};

// Create DEFAULT_SUBSCRIPTIONS dynamically to avoid hardcoded dates
const createDefaultSubscriptions = () => ({
  ADMIN: {
    plan: null,
    active: false,
    startDate: null,
    endDate: null,
    trialEndsAt: null,
    isPaid: false,
    duration: 0,
    status: "NO_SUBSCRIPTION",
    lastPaymentDate: null,
    nextBillingDate: null,
    features: {},
  },
  SALES_EXECUTIVE: {
    plan: "FREE",
    active: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    trialEndsAt: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    isPaid: false,
    duration: 3,
    status: "ACTIVE",
    lastPaymentDate: null,
    nextBillingDate: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    features: SUBSCRIPTION_PLANS.FREE.features,
  },
});

const DEFAULT_SUBSCRIPTIONS = createDefaultSubscriptions();

export function SubscriptionProvider({ children }) {
  const [subscriptions, setSubscriptions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setSubscriptions(DEFAULT_SUBSCRIPTIONS);
        return;
      }

      const response = await fetch('http://localhost:8000/api/subscription/my-subscription/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Transform backend data to frontend structure if needed
        // Backend returns UserSubscription model fields.
        // Frontend expects { OWNER: { ... }, SALES_EXECUTIVE: { ... } } structure?
        // The previous Code used `subscriptions[role]`

        // Assuming the API returns the subscription for the *current user*.
        // We need to map it to the role-based structure expected by the app.
        // For now, let's just mock the structure with the real data for the current user's role.

        // Actually, the app seems to expect a dictionary keyed by role.
        // We'll hydrate the 'OWNER' key with the fetched data if data exists.

        // Note: Backend might define plan details differently.
        // We will use defaults for now if structure mismatch is high, but try to use live status.

        setSubscriptions(prev => ({
          ...DEFAULT_SUBSCRIPTIONS,
          OWNER: {
            ...DEFAULT_SUBSCRIPTIONS.OWNER, // Fallback
            plan: data.plan?.code || data.plan_name || "FREE",
            active: data.status === 'ACTIVE',
            endDate: data.end_date,
            status: data.status,
            // ... map other fields
          }
        }));
      } else {
        setSubscriptions(DEFAULT_SUBSCRIPTIONS);
      }
    } catch (error) {
      console.error("Subscription fetch failed", error);
      setSubscriptions(DEFAULT_SUBSCRIPTIONS);
    } finally {
      setLoading(false);
    }
  };

  const getSubscription = (role) => {
    return subscriptions[role] || DEFAULT_SUBSCRIPTIONS[role];
  };

  const updateSubscription = (role, subscriptionData) => {
    // Local update only for UI responsiveness, ideally should POST to backend
    setSubscriptions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        ...subscriptionData,
      },
    }));
  };

  const isSubscriptionActive = (role) => {
    const subscription = getSubscription(role);
    if (!subscription.active) return false;

    const endDate = new Date(subscription.endDate);
    const now = new Date();
    return endDate > now;
  };

  const getRemainingDays = (role) => {
    const subscription = getSubscription(role);
    const endDate = new Date(subscription.endDate);
    const now = new Date();
    const remainingTime = endDate - now;
    const days = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const getSubscriptionStatus = (role) => {
    const subscription = getSubscription(role);
    const remainingDays = getRemainingDays(role);

    if (!subscription.active) {
      return { status: "INACTIVE", message: "Subscription is inactive", color: "gray" };
    }

    if (remainingDays <= 0) {
      return { status: "EXPIRED", message: "Subscription has expired", color: "red" };
    }

    if (remainingDays <= 7) {
      return { status: "EXPIRING_SOON", message: `Expires in ${remainingDays} days`, color: "orange" };
    }

    return { status: "ACTIVE", message: `Valid for ${remainingDays} more days`, color: "green" };
  };

  const extendSubscription = (role, additionalDays) => {
    const subscription = getSubscription(role);
    const currentEndDate = new Date(subscription.endDate);
    const newEndDate = new Date(currentEndDate.getTime() + additionalDays * 24 * 60 * 60 * 1000);

    updateSubscription(role, {
      endDate: newEndDate.toISOString(),
      duration: subscription.duration + additionalDays,
      status: "ACTIVE",
      active: true,
    });

    return newEndDate;
  };

  const resetSubscription = (role) => {
    updateSubscription(role, DEFAULT_SUBSCRIPTIONS[role]);
  };

  const updateFeatureLimit = (role, feature, value) => {
    setSubscriptions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        features: {
          ...prev[role].features,
          [feature]: value,
        },
      },
    }));
  };

  const checkFeatureLimit = (role, feature) => {
    if (!isSubscriptionActive(role)) {
      return {
        allowed: false,
        reason: "Subscription expired",
        limit: 0,
      };
    }
    const subscription = getSubscription(role);
    return {
      allowed: true,
      limit: subscription.features[feature],
    };
  };

  const upgradePlan = (role, newPlan) => {
    const plan = SUBSCRIPTION_PLANS[newPlan];
    if (!plan) {
      console.error("Invalid plan:", newPlan);
      return false;
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + plan.duration * 30 * 24 * 60 * 60 * 1000);

    updateSubscription(role, {
      plan: newPlan,
      isPaid: newPlan !== "FREE",
      features: plan.features,
      lastPaymentDate: newPlan !== "FREE" ? now.toISOString() : null,
      nextBillingDate: newPlan !== "FREE" ? endDate.toISOString() : null,
      endDate: endDate.toISOString(),
      status: "ACTIVE",
      active: true,
    });

    return true;
  };

  const getTrialRemainingDays = (role) => {
    const subscription = getSubscription(role);
    if (!subscription || subscription.plan !== "FREE") {
      return 0;
    }
    if (!subscription.trialEndsAt) {
      return 0;
    }
    const trialEnd = new Date(subscription.trialEndsAt);
    const now = new Date();
    const remainingTime = trialEnd - now;
    const days = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const isTrialExpired = (role) => {
    const subscription = getSubscription(role);
    if (!subscription || subscription.plan !== "FREE") {
      return true;
    }
    return getTrialRemainingDays(role) <= 0;
  };

  const getPlanDetails = (planName) => {
    return SUBSCRIPTION_PLANS[planName] || null;
  };

  const getAllPlans = () => {
    return SUBSCRIPTION_PLANS;
  };

  const value = {
    subscriptions,
    loading,
    getSubscription,
    updateSubscription,
    isSubscriptionActive,
    getRemainingDays,
    getSubscriptionStatus,
    extendSubscription,
    resetSubscription,
    updateFeatureLimit,
    checkFeatureLimit,
    upgradePlan,
    getTrialRemainingDays,
    isTrialExpired,
    getPlanDetails,
    getAllPlans,
    SUBSCRIPTION_PLANS,
    DEFAULT_SUBSCRIPTIONS,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return context;
}
