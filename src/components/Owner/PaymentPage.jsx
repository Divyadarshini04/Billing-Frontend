import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    Lock,
    ArrowLeft,
    Loader,
    CheckCircle,
    Smartphone,
    Building,
    Wallet,
    QrCode,
    ChevronRight,
    ShieldCheck
} from 'lucide-react';
import api from '../../api/axios';
import { NotificationContext } from '../../context/NotificationContext';

// Brand Logos
const LOGOS = {
    GPAY: (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" fill="#4285F4" />
            <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.43 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.35 21.48 7.39 24 12 24z" fill="#34A853" />
            <path d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" fill="#FBBC05" />
            <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.35 2.52 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" fill="#EA4335" />
        </svg>
    ),
    PHONEPE: (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-1">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm0-8h-6V7h6v2z" fill="#5F259F" />
            <rect x="7" y="7" width="10" height="10" rx="2" fill="#5F259F" />
            <path d="M13 11h-2v5h2v-5z" fill="white" />
            <path d="M15 9H9v2h6V9z" fill="white" />
        </svg>
    ),
    PAYTM: (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path d="M2 10c0-2.2 1.8-4 4-4h12c2.2 0 4 1.8 4 4v4c0 2.2-1.8 4-4 4H6c-2.2 0-4-1.8-4-4v-4z" fill="#002E6E" />
            <path d="M6 10h12v4H6z" fill="#00B9F1" />
            <text x="6" y="13" fontSize="5" fill="white" fontWeight="bold">Pay</text>
        </svg>
    ),
    // Bank Logos
    HDFC: (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <rect width="24" height="24" fill="#004C8F" />
            <path d="M4 8h4v8H4zM16 8h4v8h-4zM8 10h8v4H8z" fill="#ED232A" />
            <rect x="2" y="2" width="20" height="20" stroke="white" strokeWidth="1" />
        </svg>
    ),
    SBI: (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <circle cx="12" cy="12" r="10" fill="#280071" />
            <circle cx="12" cy="12" r="4" fill="white" />
            <rect x="11" y="12" width="2" height="10" fill="#280071" />
            <rect x="11" y="12" width="2" height="6" fill="white" />
        </svg>
    ),
    ICICI: (
        <svg viewBox="0 0 100 24" fill="none" className="w-full h-full">
            <path d="M10 2h80v20H10z" fill="#F37E20" />
            <text x="50" y="17" textAnchor="middle" fill="white" fontWeight="bold" fontSize="16">ICICI</text>
            <path d="M10 20h80v2H10z" fill="#053c6d" />
        </svg>
    ),
    AXIS: (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path d="M12 2L2 22h20L12 2z" fill="#97144D" />
            <path d="M12 8L7 18h10L12 8z" fill="white" />
        </svg>
    ),
    KOTAK: (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <rect width="24" height="24" rx="2" fill="#ED1C24" />
            <path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8zm2 0c0 3.3 2.7 6 6 6s6-2.7 6-6-2.7-6-6-6-6 2.7-6 6z" fill="white" />
            <text x="8" y="14" fontSize="6" fill="#ED1C24" fontWeight="bold">K</text>
        </svg>
    ),
    PNB: (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <circle cx="12" cy="12" r="10" fill="#A2003D" />
            <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FFC20E">PNB</text>
        </svg>
    )
};

const ALL_BANKS = [
    "Allahabad Bank", "Andhra Bank", "Axis Bank", "Bank of Bahrain and Kuwait", "Bank of Baroda - Corporate Banking", "Bank of Baroda - Retail Banking",
    "Bank of India", "Bank of Maharashtra", "Canara Bank", "Central Bank of India", "City Union Bank", "Corporation Bank", "CSB Bank",
    "DCB Bank", "Deutsche Bank", "Dhanlaxmi Bank", "Federal Bank", "HDFC Bank", "ICICI Bank", "IDBI Bank", "IDFC First Bank", "Indian Bank",
    "Indian Overseas Bank", "IndusInd Bank", "Jammu and Kashmir Bank", "Karnataka Bank", "Karur Vysya Bank", "Kotak Mahindra Bank",
    "Lakshmi Vilas Bank", "Oriental Bank of Commerce", "Punjab and Sind Bank", "Punjab National Bank - Corporate Banking",
    "Punjab National Bank - Retail Banking", "RBL Bank", "Saraswat Bank", "South Indian Bank", "Standard Chartered Bank",
    "State Bank of India", "Syndicate Bank", "Tamilnad Mercantile Bank", "UCO Bank", "Union Bank of India", "United Bank of India",
    "Vijaya Bank", "Yes Bank"
];

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

export default function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { addNotification } = useContext(NotificationContext);
    const plan = location.state?.plan;

    const [loading, setLoading] = useState(false);
    const [processingState, setProcessingState] = useState('idle'); // idle, processing, success, failed
    const [selectedMethod, setSelectedMethod] = useState('upi');

    // Form States
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [upiId, setUpiId] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Filter banks based on input
    const filteredBanks = selectedBank
        ? ALL_BANKS.filter(bank => bank.toLowerCase().startsWith(selectedBank.toLowerCase()))
        : [];


    if (!plan) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Plan Selected</h2>
                <button
                    onClick={() => navigate('/owner/subscription-management')}
                    className="text-blue-600 font-medium hover:underline"
                >
                    Return to Plans
                </button>
            </div>
        );
    }

    const handlePayment = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setProcessingState('processing');

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
            let paymentDetails = {};
            if (selectedMethod === 'card') {
                paymentDetails = { last4: cardNumber.slice(-4), name: cardName };
            } else if (selectedMethod === 'upi') {
                paymentDetails = { upi_id: upiId || 'qr_scan' };
            } else if (selectedMethod === 'netbanking') {
                paymentDetails = { bank: selectedBank };

            }

            // Using the existing upgrade endpoint
            await api.post("/api/subscription/upgrade/", {
                plan_id: plan.id,
                payment_method: selectedMethod.toUpperCase(),
                payment_details: paymentDetails
            });

            setProcessingState('success');
            setTimeout(() => {
                navigate('/owner/subscription-management');
                addNotification("Payment successful! Plan upgraded.", "success");
            }, 2500);

        } catch (error) {
            setProcessingState('failed');
            addNotification(error.response?.data?.message || "Payment failed", "error");
        } finally {
            setLoading(false);
            if (processingState !== 'success') {
                setProcessingState('idle');
            }
        }
    };

    const renderPaymentContent = () => {
        switch (selectedMethod) {
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
                            <div className="flex items-center justify-center gap-6 mt-6">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 p-2 flex items-center justify-center">
                                        {LOGOS.GPAY}
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-medium">Google Pay</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 p-2 flex items-center justify-center">
                                        {LOGOS.PHONEPE}
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-medium">PhonePe</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 p-2 flex items-center justify-center">
                                        {LOGOS.PAYTM}
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-medium">Paytm</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">OR</span></div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pay via UPI ID</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    placeholder="username@upi"
                                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button type="button" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Verify</button>
                            </div>
                        </div>
                    </div>
                );
            case 'card':
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl text-white mb-6 shadow-lg">
                            <div className="flex justify-between items-start mb-8">
                                <CreditCard className="w-8 h-8 opacity-80" />
                                <span className="font-mono text-lg tracking-wider">{cardNumber || '**** **** **** ****'}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs opacity-60 uppercase mb-1">Card Holder</p>
                                    <p className="font-medium tracking-wide">{cardName || 'YOUR NAME'}</p>
                                </div>
                                <div>
                                    <p className="text-xs opacity-60 uppercase mb-1">Expires</p>
                                    <p className="font-medium tracking-wide">{expiry || 'MM/YY'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Card Number</label>
                                <input
                                    type="text"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                                    maxLength="19"
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                                    <input
                                        type="text"
                                        value={expiry}
                                        onChange={(e) => setExpiry(e.target.value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2'))}
                                        maxLength="5"
                                        placeholder="MM/YY"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">CVV</label>
                                    <input
                                        type="password"
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                                        maxLength="3"
                                        placeholder="123"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Card Holder Name</label>
                                <input
                                    type="text"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value)}
                                    placeholder="Name on card"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
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
                                    <button
                                        key={bank}
                                        type="button"
                                        onClick={() => setSelectedBank(bank)}
                                        className={`p-3 border rounded-xl transition-all flex flex-col items-center gap-2 ${selectedBank === bank ? 'border-blue-500 bg-blue-50/50' : 'hover:border-blue-300 hover:bg-gray-50'}`}
                                    >
                                        <div className="w-10 h-10 flex items-center justify-center">
                                            {LOGOS[bank.toUpperCase()]}
                                        </div>
                                        <span className={`text-xs font-semibold ${selectedBank === bank ? 'text-blue-700' : 'text-gray-600'}`}>{bank}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <p className="text-sm font-medium text-gray-700 mb-2">Bank Name</p>
                            <input
                                type="text"
                                value={selectedBank}
                                onChange={(e) => {
                                    setSelectedBank(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                placeholder="Search or type your bank name"
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-slate-700"
                            />

                            {/* Autocomplete Suggestions */}
                            {showSuggestions && filteredBanks.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {filteredBanks.map((bank, index) => (
                                        <div
                                            key={index}
                                            onMouseDown={(e) => {
                                                e.preventDefault(); // Prevent input blur
                                                setSelectedBank(bank);
                                                setShowSuggestions(false);
                                            }}
                                            className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                                        >
                                            {bank}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-xs text-slate-400 mt-2 ml-1">
                                * You can select from popular banks above or type your bank name manually
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Plans
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-100">
                    {/* Sidebar */}
                    <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col">
                        <div className="p-6 border-b border-gray-200 bg-white">
                            <h2 className="text-lg font-bold text-gray-900 mb-1">Order Summary</h2>
                            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{plan.name}</p>
                                        <p className="text-xs text-gray-500">{(plan.duration_days || 0) >= 365 ? 'Yearly' : 'Monthly'} Subscription</p>
                                    </div>
                                    <p className="text-xl font-bold text-blue-600">₹{plan.price}</p>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-blue-600/80 font-medium">
                                    <ShieldCheck className="w-3 h-3" /> Secure SSL Encryption
                                </div>
                            </div>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Select Payment Method</p>
                            <PaymentSidebarItem
                                icon={Smartphone}
                                label="Scan & Pay via UPI"
                                subLabel="GPay, PhonePe, Paytm"
                                active={selectedMethod === 'upi'}
                                onClick={() => setSelectedMethod('upi')}
                            />
                            <PaymentSidebarItem
                                icon={CreditCard}
                                label="Credit / Debit Cards"
                                subLabel="Visa, Mastercard, RuPay"
                                active={selectedMethod === 'card'}
                                onClick={() => setSelectedMethod('card')}
                            />
                            <PaymentSidebarItem
                                icon={Building}
                                label="Net Banking"
                                subLabel="All Indian Banks"
                                active={selectedMethod === 'netbanking'}
                                onClick={() => setSelectedMethod('netbanking')}
                            />

                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="w-full md:w-2/3 flex flex-col relative">
                        {/* Success Overlay */}
                        <AnimatePresence>
                            {processingState === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center text-center p-8"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                                    >
                                        <CheckCircle className="w-12 h-12 text-green-600" />
                                    </motion.div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                                    <p className="text-gray-600 text-lg mb-8">Your {plan.name} plan is now active.</p>
                                    <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 2.5 }}
                                            className="h-full bg-green-500"
                                        />
                                    </div>
                                    <p className="text-sm text-gray-400 mt-4">Redirecting to Dashboard...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-8 border-b border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {selectedMethod === 'upi' && 'Scan & Pay via UPI'}
                                {selectedMethod === 'card' && 'Enter Card Details'}
                                {selectedMethod === 'netbanking' && 'Choose Your Bank'}

                            </h3>
                        </div>

                        <div className="p-8 flex-1 overflow-y-auto bg-white">
                            {renderPaymentContent()}
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 px-8">
                            <button
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePayment}
                                disabled={loading || processingState === 'processing'}
                                className="px-8 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[180px] justify-center"
                            >
                                {processingState === 'processing' ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" />
                                        Pay ₹{plan.price}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
