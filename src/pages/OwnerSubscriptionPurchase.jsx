import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Check,
    CreditCard,
    Lock,
    Smartphone,
    Building,
    FileText,
    ChevronRight,
    QrCode,
    Copy,
    ShieldCheck
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';

// Payment Method Components
const PaymentSidebarItem = ({ icon: Icon, label, subLabel, active, onClick }) => (
    <div
        onClick={onClick}
        className={`w-full p-4 flex items-center justify-between cursor-pointer border rounded-xl transition-all mb-3 ${active
            ? 'border-blue-600 bg-blue-50 shadow-sm'
            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="text-left">
                <p className={`font-semibold ${active ? 'text-blue-900' : 'text-gray-900'}`}>{label}</p>
                {subLabel && <p className="text-xs text-gray-500">{subLabel}</p>}
            </div>
        </div>
        <ChevronRight className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
    </div>
);

export default function OwnerSubscriptionPurchase() {
    const navigate = useNavigate();
    const { userRole } = useAuth();
    const { getSubscription, upgradePlan, getAllPlans } = useSubscription();
    const { enableAllPermissionsForSubscribedRole } = usePermissions();

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [activeMethod, setActiveMethod] = useState('upi'); // upi, card, netbanking, bank_transfer
    const [processingState, setProcessingState] = useState('idle'); // idle, processing, success, failed

    // Data
    const allPlans = getAllPlans() || {};
    const plans = Object.values(allPlans).length > 0 ? allPlans : {
        BASIC: { name: "Basic Plan", price: 999, currency: "₹", description: "Perfect for small businesses", features: {} },
        PREMIUM: { name: "Premium Plan", price: 2999, currency: "₹", description: "For growing businesses", features: {} }
    };
    const availablePlans = Object.entries(plans)
        .filter(([key]) => key !== 'FREE')
        .map(([key, plan]) => ({ key, ...plan }));

    const selectedPlanDetails = availablePlans.find(p => p.key === selectedPlan);

    const handlePurchase = (planKey) => {
        setSelectedPlan(planKey);
        setShowPaymentModal(true);
        setProcessingState('idle');
    };

    const confirmPayment = async () => {
        setProcessingState('processing');
        try {
            // Simulator API call delay
            await new Promise(resolve => setTimeout(resolve, 3000));

            const success = upgradePlan(userRole, selectedPlan);
            if (success) {
                enableAllPermissionsForSubscribedRole(userRole);
                setProcessingState('success');
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 2500);
            } else {
                setProcessingState('failed');
            }
        } catch (error) {
            setProcessingState('failed');
        }
    };

    // Render Content for each Payment Method
    const renderPaymentContent = () => {
        switch (activeMethod) {
            case 'upi':
                return (
                    <div className="space-y-6">
                        <div className="text-center p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <p className="text-sm text-gray-500 mb-4">Scan & Pay via any UPI App</p>
                            <div className="w-48 h-48 mx-auto bg-gray-900 rounded-xl p-2 flex items-center justify-center relative overflow-hidden group">
                                <QrCode className="w-40 h-40 text-white" />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white font-bold">Generate QR</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-4 mt-6">
                                {/* Mock UPI Icons */}
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-800">GPay</div>
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-800">PhonePe</div>
                                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-[10px] font-bold text-cyan-800">Paytm</div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">OR</span></div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pay via UPI ID</label>
                            <div className="flex gap-2">
                                <input type="text" placeholder="username@upi" className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Verify</button>
                            </div>
                        </div>
                    </div>
                );
            case 'card':
                return (
                    <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl text-white mb-6">
                            <div className="flex justify-between items-start mb-8">
                                <CreditCard className="w-8 h-8 opacity-80" />
                                <span className="font-mono text-lg">**** **** **** 4242</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs opacity-60 uppercase mb-1">Card Holder</p>
                                    <p className="font-medium">JOHN DOE</p>
                                </div>
                                <div>
                                    <p className="text-xs opacity-60 uppercase mb-1">Expires</p>
                                    <p className="font-medium">12/26</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input type="text" placeholder="MM / YY" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                    <input type="password" placeholder="123" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Holder Name</label>
                                <input type="text" placeholder="Name on card" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                    </div>
                );
            case 'netbanking':
                return (
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-4">Popular Banks</p>
                            <div className="grid grid-cols-3 gap-3">
                                {['HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak', 'PNB'].map(bank => (
                                    <button key={bank} className="p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                            {bank[0]}
                                        </div>
                                        <span className="text-xs font-medium text-gray-600">{bank}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">All Banks</p>
                            <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                <option>Select your bank</option>
                                <option>Bank of Baroda</option>
                                <option>Canara Bank</option>
                                <option>Union Bank</option>
                            </select>
                        </div>
                    </div>
                );
            case 'bank_transfer':
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                            <div className="flex-shrink-0"><FileText className="w-5 h-5 text-yellow-600" /></div>
                            <p className="text-sm text-yellow-800">Transfer the amount to the following account. Your subscription will be active once payment is verified (approx 2-4 hours).</p>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 border rounded-lg bg-gray-50 space-y-3 relative group">
                                <button className="absolute top-4 right-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium flex items-center gap-1">
                                    <Copy className="w-3 h-3" /> Copy
                                </button>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <span className="text-gray-500">Account Name</span>
                                    <span className="col-span-2 font-medium text-gray-900">Billing App Pvt Ltd</span>

                                    <span className="text-gray-500">Account No.</span>
                                    <span className="col-span-2 font-medium text-gray-900">0001 2345 6789 0000</span>

                                    <span className="text-gray-500">IFSC Code</span>
                                    <span className="col-span-2 font-medium text-gray-900">HDFC0001234</span>

                                    <span className="text-gray-500">Bank Name</span>
                                    <span className="col-span-2 font-medium text-gray-900">HDFC Bank, Mumbai</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="w-full min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3 mt-8">
                    <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
                    <p className="text-lg text-gray-600">Unlock the full power of your POS system.</p>
                </motion.div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {availablePlans.map((plan, idx) => (
                        <motion.div
                            key={plan.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative"
                        >
                            <div className={`h-full p-8 rounded-2xl border transition-all ${selectedPlan === plan.key ? 'border-blue-600 shadow-xl bg-white' : 'border-gray-200 bg-white hover:shadow-lg'}`}>
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-gray-900">{plan.currency}{plan.price}</span>
                                        <span className="text-gray-600">/month</span>
                                    </div>
                                    <p className="text-gray-600 mt-4 h-12">{plan.description}</p>
                                </div>
                                <button
                                    onClick={() => handlePurchase(plan.key)}
                                    className={`w-full py-3 rounded-lg font-bold transition-all ${plan.key === 'PREMIUM' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                                >
                                    Choose Plan
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
                        onClick={() => processingState !== 'processing' && processingState !== 'success' && setShowPaymentModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Left Side: Summary & Methods */}
                            <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-bold text-gray-900 mb-1">Payment Details</h2>
                                    <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                        <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                                        <p className="text-3xl font-bold text-gray-900">{selectedPlanDetails?.currency}{selectedPlanDetails?.price}</p>
                                        <p className="text-xs text-blue-600 font-medium mt-1">{selectedPlanDetails?.name} Subscription</p>
                                    </div>
                                </div>
                                <div className="p-4 overflow-y-auto flex-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Payment Methods</p>
                                    <PaymentSidebarItem
                                        icon={Smartphone}
                                        label="Scan & Pay via UPI"
                                        subLabel="GPay, PhonePe, Paytm"
                                        active={activeMethod === 'upi'}
                                        onClick={() => setActiveMethod('upi')}
                                    />
                                    <PaymentSidebarItem
                                        icon={CreditCard}
                                        label="Credit / Debit Cards"
                                        subLabel="Visa, Mastercard, RuPay"
                                        active={activeMethod === 'card'}
                                        onClick={() => setActiveMethod('card')}
                                    />
                                    <PaymentSidebarItem
                                        icon={Building}
                                        label="Net Banking"
                                        subLabel="All Indian Banks"
                                        active={activeMethod === 'netbanking'}
                                        onClick={() => setActiveMethod('netbanking')}
                                    />
                                    <PaymentSidebarItem
                                        icon={FileText}
                                        label="Bank Transfer"
                                        subLabel="NEFT / IMPS / RTGS"
                                        active={activeMethod === 'bank_transfer'}
                                        onClick={() => setActiveMethod('bank_transfer')}
                                    />
                                </div>
                            </div>

                            {/* Right Side: Content & Action */}
                            <div className="w-full md:w-2/3 flex flex-col relative">
                                {/* Success Overlay */}
                                {processingState === 'success' && (
                                    <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center text-center p-8">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
                                        >
                                            <ShieldCheck className="w-10 h-10 text-green-600" />
                                        </motion.div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                                        <p className="text-gray-600 text-lg mb-8">Your {selectedPlanDetails?.name} is now active.</p>
                                        <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 2.5 }}
                                                className="h-full bg-green-500"
                                            />
                                        </div>
                                        <p className="text-sm text-gray-400 mt-4">Redirecting to Dashboard...</p>
                                    </div>
                                )}

                                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {activeMethod === 'upi' && 'Scan & Pay via UPI'}
                                        {activeMethod === 'card' && 'Enter Card Details'}
                                        {activeMethod === 'netbanking' && 'Choose Your Bank'}
                                        {activeMethod === 'bank_transfer' && 'Bank Transfer Details'}
                                    </h3>
                                    <button
                                        onClick={() => setShowPaymentModal(false)}
                                        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                                    >
                                        <div className="sr-only">Close</div>
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="p-8 flex-1 overflow-y-auto bg-white">
                                    {renderPaymentContent()}
                                </div>

                                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 px-8">
                                    <button
                                        onClick={() => setShowPaymentModal(false)}
                                        className="px-6 py-3 font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmPayment}
                                        disabled={processingState === 'processing'}
                                        className="px-8 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {processingState === 'processing' ? (
                                            <>
                                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-4 h-4" />
                                                Pay {selectedPlanDetails?.currency}{selectedPlanDetails?.price}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
