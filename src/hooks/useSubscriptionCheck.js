import { useEffect } from "react";
import { useSubscription } from "../context/SubscriptionContext";
import { useAuth } from "../context/AuthContext";

/**
 * Hook to check subscription status and handle expiration
 * Shows warnings when subscription is about to expire
 */
export function useSubscriptionCheck() {
  const { userRole } = useAuth();
  const { isSubscriptionActive, getRemainingDays, getSubscriptionStatus } = useSubscription();

  useEffect(() => {
    // Skip check for ADMIN users (they have unlimited access)
    if (userRole === "ADMIN") return;

    const checkSubscription = () => {
      const isActive = isSubscriptionActive(userRole);
      const remainingDays = getRemainingDays(userRole);
      const { status } = getSubscriptionStatus(userRole);

      // Log subscription warning in console (can be extended to show notifications)
      if (!isActive) {
        console.warn(`⚠️ ${userRole} subscription has expired`);
      } else if (remainingDays <= 7 && remainingDays > 0) {
        console.warn(`⚠️ ${userRole} subscription expiring in ${remainingDays} days`);
      }
    };

    // Check on mount and every hour
    checkSubscription();
    const interval = setInterval(checkSubscription, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userRole, isSubscriptionActive, getRemainingDays, getSubscriptionStatus]);

  return {
    isActive: isSubscriptionActive(userRole),
    remainingDays: getRemainingDays(userRole),
    status: getSubscriptionStatus(userRole),
  };
}

/**
 * Hook to check if a feature is available based on subscription
 */
export function useFeatureLimit(feature) {
  const { userRole } = useAuth();
  const { checkFeatureLimit, isSubscriptionActive } = useSubscription();

  if (userRole === "ADMIN") {
    return { allowed: true, limit: Infinity };
  }

  return checkFeatureLimit(userRole, feature);
}
