import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
    Check,
    AlertTriangle,
    Loader
} from "lucide-react";
import api from "../../api/axios";
import { NotificationContext } from "../../context/NotificationContext";
import { useNavigate } from 'react-router-dom';


export default function SubscriptionPage() {
    const { addNotification } = useContext(NotificationContext);
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState(null);
    const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" or "yearly"
    const [processingId, setProcessingId] = useState(null);
    const [showAllPlans, setShowAllPlans] = useState(false);

    const [allPlans, setAllPlans] = useState([]);

    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    const navigate = useNavigate();

    const fetchSubscriptionData = async () => {
        try {
            setLoading(true);
            // We only need the user's current subscription from backend
            const [subRes, plansRes] = await Promise.all([
                api.get("/api/subscription/my-subscription/").catch(() => null),
                api.get("/api/subscription/plans/").catch(() => null)
            ]);
            setSubscription(subRes?.data || null);
            setAllPlans(plansRes?.data || []);
        } catch (error) {

            // addNotification("Failed to load subscription details", "error"); // Optional: suppress if just checking
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = (plan) => {
        navigate('/owner/payment', {
            state: {
                plan: {
                    id: plan.id,
                    name: plan.name,
                    price: plan.price,
                    duration_days: plan.duration_days
                }
            }
        });
    };

    const handleCancel = async () => {
        if (!window.confirm("Are you sure you want to cancel? This action cannot be undone.")) {
            return;
        }

        try {
            setProcessingId('cancel');
            await api.post("/api/subscription/cancel/");
            addNotification("Subscription cancelled successfully", "success");
            await fetchSubscriptionData();
            setShowAllPlans(true);
        } catch (error) {

            addNotification(error.response?.data?.message || "Failed to cancel subscription", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const currentPlanId = subscription?.plan_details?.id; // This might differ from our static IDs if backend isn't synced, but that's okay for now.

    // Filter plans based on billing cycle (exclude Free Trial from toggle unless selected explicitly or we want to show it)
    const displayPlans = allPlans.filter(plan => {
        if (!plan.is_active) return false; // Filter out inactive plans
        if (plan.code === 'FREE') return true; // Show new Trial plan
        if (plan.code === 'free_trial') return true; // Show old trial plan

        if (billingCycle === 'monthly') return plan.duration_days === 30;
        if (billingCycle === 'yearly') return plan.duration_days === 365;
        return false;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Subscription Plans</h2>
                    <p className="text-slate-500 dark:text-slate-400">Choose the plan that fits your business needs</p>
                </div>

                {/* Billing Cycle Toggle */}
                {(!subscription || showAllPlans) && (
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setBillingCycle("monthly")}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === "monthly"
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle("yearly")}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === "yearly"
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                }`}
                        >
                            Yearly <span className="text-green-500 text-xs ml-1">(Save ~17%)</span>
                        </button>
                    </div>
                )}
            </motion.div>

            {/* ACTIVE SUBSCRIPTION DASHBOARD */}
            {subscription && !showAllPlans ? (
                <div className="space-y-8">
                    {/* Current Plan Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Current plan</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-slate-200 dark:border-slate-700">
                            {/* Plan Details */}
                            <div className="p-6">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">PLAN</span>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2 mb-1">
                                    {subscription.plan_details?.name || "Unknown Plan"}
                                </h2>
                                <button
                                    onClick={() => setShowAllPlans(true)}
                                    className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                                >
                                    Upgrade or Change Plan
                                </button>
                            </div>

                            {/* Billing Cycle */}
                            <div className="p-6">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">BILLING CYCLE</span>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2 mb-1">
                                    {(subscription.plan_details?.duration_days || 0) >= 365 ? "Yearly" : "Monthly"}
                                </h2>
                                {(subscription.plan_details?.duration_days || 0) < 365 && (
                                    <span className="inline-block bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-0.5 rounded font-medium">
                                        Active
                                    </span>
                                )}
                            </div>

                            {/* Billing Date */}
                            <div className="p-6 border-t border-slate-200 dark:border-slate-700 md:border-t-0">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">BILLING DATE</span>
                                <div className="mt-4 flex items-center gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Last billing</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">{formatDate(subscription.start_date)}</p>
                                    </div>
                                    <div className="h-px w-8 bg-slate-300 dark:bg-slate-600"></div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Next billing</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">{formatDate(subscription.end_date)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Licenses */}
                            <div className="p-6 border-t border-slate-200 dark:border-slate-700 md:border-t-0">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">LICENSES</span>
                                <div className="mt-2">
                                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                        {subscription.staff_count || 0}
                                        <span className="text-slate-400 text-xl font-normal">
                                            /{subscription.plan_details?.max_staff_users === 0 ? "∞" : subscription.plan_details?.max_staff_users}
                                        </span>
                                    </span>
                                    <span className="text-sm text-slate-500 ml-2">allocated</span>
                                </div>
                                <a href="/owner/staff" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline block mt-1">
                                    Manage licenses
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Check for "No Active Plan" warning if needed */}
                    {subscription.status !== 'ACTIVE' && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                            <div>
                                <h3 className="text-red-900 font-bold">Subscription Inactive</h3>
                                <p className="text-red-700 text-sm mt-1">
                                    Your subscription is currently {subscription.status.toLowerCase()}. Please renew or upgrade to continue using premium features.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Cancel Subscription */}
                    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Cancel subscription</h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    Canceled subscription will remain active until the end of the current billing period.
                                </p>
                            </div>
                            <button
                                onClick={handleCancel}
                                disabled={processingId !== null}
                                className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {processingId === 'cancel' ? 'Cancelling...' : 'Cancel subscription'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* PLANS LIST */
                <div className="space-y-6">
                    {showAllPlans && (
                        <button
                            onClick={() => setShowAllPlans(false)}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                        >
                            ← Back to my plan
                        </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayPlans.map((plan, idx) => {
                            const isCurrent = currentPlanId === plan.id; // Note: IDs might not match exactly unless backend matches static file.

                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`relative bg-white dark:bg-slate-800 rounded-2xl p-6 border transition-all hover:shadow-xl flex flex-col ${isCurrent
                                        ? "border-blue-500 ring-4 ring-blue-500/10 z-10"
                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                        }`}
                                >
                                    <div className="mb-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className={`text-xl font-bold ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                                                {plan.name.replace(' (Monthly)', '').replace(' (Yearly)', '')}
                                            </h3>
                                            {plan.id === 'free_trial' && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-bold">New</span>}
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 min-h-[40px] leading-relaxed">
                                            {plan.description}
                                        </p>
                                    </div>

                                    <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-slate-900 dark:text-white">₹{plan.price}</span>
                                            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">/{plan.duration_days >= 365 ? 'year' : (plan.price === 0 ? '7 days' : 'mo')}</span>
                                        </div>
                                        <div className="text-xs text-slate-400 mt-2">
                                            + GST as applicable
                                        </div>
                                    </div>

                                    {/* Limits */}
                                    <div className="grid grid-cols-2 gap-2 mb-6 text-xs text-slate-600 dark:text-slate-300">
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                                            <span className="block text-slate-400 text-[10px] uppercase">Users</span>
                                            <span className="font-semibold">{plan.max_staff_users === 0 ? "Unlimited" : plan.max_staff_users} Staff</span>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                                            <span className="block text-slate-400 text-[10px] uppercase">Invoices</span>
                                            <span className="font-semibold">{plan.invoice_limit}</span>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                                            <span className="block text-slate-400 text-[10px] uppercase">Products</span>
                                            <span className="font-semibold">{plan.product_limit}</span>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                                            <span className="block text-slate-400 text-[10px] uppercase">Customers</span>
                                            <span className="font-semibold">{plan.customer_limit}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8 flex-1">
                                        {(Array.isArray(plan.features) ? plan.features : []).map((feature, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                                                    <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <span className="text-slate-600 dark:text-slate-300 text-xs font-medium leading-tight">
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => !isCurrent && handleUpgrade(plan)}
                                        disabled={isCurrent || processingId !== null}
                                        className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${isCurrent
                                            ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-default"
                                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:-translate-y-0.5"
                                            } ${processingId !== null && processingId !== plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {processingId === plan.id ? (
                                            <Loader className="w-4 h-4 animate-spin" />
                                        ) : isCurrent ? (
                                            <>
                                                <Check className="w-4 h-4" /> Current Plan
                                            </>
                                        ) : (
                                            <>
                                                Select Plan
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                    <p className="text-center text-slate-400 text-xs mt-8">
                        Prices are exclusive of GST. Plans can be upgraded anytime.
                    </p>
                </div>
            )}
        </div>
    );
}
