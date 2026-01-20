import React, { useState, useEffect } from "react";
import { productAPI, supplierAPI, purchaseAPI } from "../api/apiService";
import { motion } from "framer-motion";
import { Save, Plus, Trash2, Package, Search, ArrowLeft, History, FileText, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";

export default function StockInwardPage() {
    const navigate = useNavigate();
    const { userRole } = useAuth();
    const { addNotification } = useContext(NotificationContext);

    // Tab State
    const [activeTab, setActiveTab] = useState("new"); // "new" or "history"

    // Data State
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [selectedSupplier, setSelectedSupplier] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [cart, setCart] = useState([]); // { product, quantity, purchasePrice, sellingPrice }
    const [productSearch, setProductSearch] = useState("");

    useEffect(() => {
        fetchInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch history when tab changes to history
    useEffect(() => {
        if (activeTab === "history") {
            fetchHistory();
        }
    }, [activeTab]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [suppRes, prodRes] = await Promise.all([
                supplierAPI.getAllSuppliers(),
                productAPI.getAllProducts()
            ]);

            const suppData = suppRes.data?.results || suppRes.data || [];
            const prodData = prodRes.data?.results || prodRes.data || [];

            setSuppliers(suppData);
            setProducts(prodData);
        } catch (error) {
            addNotification("error", "Error", "Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await purchaseAPI.getAllPurchases();
            const data = response.data?.results || response.data || [];
            // Filter only received/completed orders if needed, or show all
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch history:", error);
            addNotification("error", "Error", "Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        if (cart.find(item => item.product.id === product.id)) {
            addNotification("info", "Already Added", `${product.name} is already in the list.`);
            return;
        }

        const newItem = {
            product: product,
            quantity: 1,
            purchasePrice: product.cost_price || 0,
            sellingPrice: product.selling_price || product.unit_price || 0
        };
        setCart([...cart, newItem]);
        setProductSearch("");
    };

    const updateCartItem = (index, field, value) => {
        const newCart = [...cart];
        newCart[index][field] = value;
        setCart(newCart);
    };

    const removeCartItem = (index) => {
        const newCart = cart.filter((_, i) => i !== index);
        setCart(newCart);
    };

    const handleSubmit = async () => {
        if (!selectedSupplier) {
            alert("Please select a supplier");
            return;
        }
        if (!invoiceNumber) {
            alert("Please enter Purchase Invoice Number");
            return;
        }
        if (cart.length === 0) {
            alert("Please add at least one product");
            return;
        }

        const payload = {
            supplier_id: selectedSupplier,
            invoice_number: invoiceNumber,
            items: cart.map(item => ({
                product_id: item.product.id,
                quantity: parseInt(item.quantity) || 0,
                purchasePrice: parseFloat(item.purchasePrice) || 0,
                sellingPrice: parseFloat(item.sellingPrice) || 0
            }))
        };

        const invalidItem = payload.items.find(i => i.quantity <= 0);
        if (invalidItem) {
            alert("Quantity must be greater than 0 for all items");
            return;
        }

        setSubmitting(true);
        try {
            const response = await purchaseAPI.directStockInward(payload);
            if (response.status === 201 || response.data) {
                addNotification("success", "Stock Inward Successful", `Stock added. PO Number: ${response.data.po_number}`);
                if (window.confirm("Stock Inward Successful! Do you want to add another?")) {
                    setCart([]);
                    setInvoiceNumber("");
                    setSelectedSupplier("");
                } else {
                    setActiveTab("history"); // Switch to history view
                }
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.detail || "Failed to process stock inward";
            addNotification("error", "Error", msg);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProducts = productSearch
        ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || (p.product_code && p.product_code.toLowerCase().includes(productSearch.toLowerCase())))
        : [];

    if (userRole !== 'OWNER' && userRole !== 'SUPER_ADMIN') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500 font-bold">Access Denied. Only Owners can manage Stock Inward.</p>
            </div>
        )
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-bg p-4 md:p-8 transition-colors">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stock Inward</h1>
                            <p className="text-gray-600 dark:text-gray-400">Manage purchase entries and history</p>
                        </div>
                    </div>
                </div>

                {/* Tags/Tabs */}
                <div className="flex gap-4 border-b border-gray-200 dark:border-dark-border mb-6">
                    <button
                        onClick={() => setActiveTab("new")}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "new"
                            ? "border-blue-600 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                    >
                        <Plus className="w-4 h-4" />
                        New Entry
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "history"
                            ? "border-blue-600 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                    >
                        <History className="w-4 h-4" />
                        Inward History
                    </button>
                </div>

                {/* Content */}
                {activeTab === "new" ? (
                    /* New Entry Form */
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className={`px-6 py-3 rounded-lg font-bold text-white flex items-center gap-2 shadow-lg ${submitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                <Save className="w-5 h-5" />
                                {submitting ? "Saving..." : "Save Entry"}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left: Details */}
                            <div className="md:col-span-3 lg:col-span-1 space-y-6">
                                <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Invoice Details</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Supplier <span className="text-red-500">*</span></label>
                                            <select
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:ring-2 focus:ring-blue-500"
                                                value={selectedSupplier}
                                                onChange={e => setSelectedSupplier(e.target.value)}
                                            >
                                                <option value="">Select Supplier</option>
                                                {suppliers.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                                ))}
                                            </select>
                                            {suppliers.length === 0 && !loading && <button onClick={() => navigate('/suppliers')} className="text-xs text-blue-500 hover:underline mt-1">Add new supplier</button>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Purchase Invoice No <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g. INV-2024-001"
                                                value={invoiceNumber}
                                                onChange={e => setInvoiceNumber(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600 dark:text-gray-300">Total Items</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{cart.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xl font-bold">
                                        <span className="text-blue-900 dark:text-blue-300">Total Amount</span>
                                        <span className="text-blue-700 dark:text-blue-400">₹{totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Products */}
                            <div className="md:col-span-3 lg:col-span-2 space-y-6">
                                {/* Product Search */}
                                <div className="relative">
                                    <div className="flex items-center gap-2 bg-white dark:bg-dark-card rounded-lg px-4 py-3 border border-gray-200 dark:border-dark-border shadow-sm">
                                        <Search className="w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Type product name to add..."
                                            className="w-full bg-transparent outline-none dark:text-white"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                        />
                                    </div>
                                    {/* Search Results Dropdown */}
                                    {productSearch && filteredProducts.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                                            {filteredProducts.map(p => (
                                                <div
                                                    key={p.id}
                                                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex justify-between items-center border-b border-gray-100 dark:border-gray-800 last:border-0"
                                                    onClick={() => addToCart(p)}
                                                >
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white">{p.name}</div>
                                                        <div className="text-xs text-gray-500">{p.product_code} | Stock: {p.stock}</div>
                                                    </div>
                                                    <Plus className="w-5 h-5 text-blue-500" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Cart List */}
                                <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Product</th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase w-24">Qty</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase w-32">Purchase Price</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase w-32">Total</th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase w-16"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {cart.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                                        <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                                        No products added yet. Search above to add.
                                                    </td>
                                                </tr>
                                            ) : (
                                                cart.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-gray-900 dark:text-white">{item.product.name}</div>
                                                            <div className="text-xs text-gray-500">{item.product.product_code}</div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg dark:text-white text-center"
                                                                value={item.quantity}
                                                                onChange={(e) => updateCartItem(idx, 'quantity', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg dark:text-white text-right"
                                                                value={item.purchasePrice}
                                                                onChange={(e) => updateCartItem(idx, 'purchasePrice', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                                                            ₹{(item.quantity * item.purchasePrice).toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button onClick={() => removeCartItem(idx)} className="text-red-500 hover:text-red-700">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* History View */
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden">
                            {history.length === 0 ? (
                                <div className="p-12 text-center">
                                    <History className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">No stock inward history found</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">PO Number</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Supplier</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Items</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Total Amount</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {history.map((po) => (
                                            <tr key={po.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-blue-500" />
                                                        <span className="font-medium text-gray-900 dark:text-white">{po.po_number}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                    {new Date(po.order_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                    {po.supplier_name || "Unknown"}
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-gray-700 dark:text-gray-300">
                                                    {po.item_count || 0}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                                                    ₹{parseFloat(po.total_amount).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${po.status === 'received'
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                        : "bg-yellow-100 text-yellow-800"
                                                        }`}>
                                                        {po.status === 'received' && <CheckCircle className="w-3 h-3" />}
                                                        {po.status === 'draft' && <Clock className="w-3 h-3" />}
                                                        {po.status.toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
