import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Percent, Tag, Clock, Plus, Trash2, Edit2,
    Search, Filter, CheckCircle, AlertCircle, Calendar,
    TrendingUp, DollarSign, List, Shield, X, Settings, Lock
} from "lucide-react";
import { discountAPI, superAdminAPI } from "../api/apiService";
import { useAuth } from "../context/AuthContext";

// --- Components ---

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            {trend && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{value}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
    </div>
);

const RuleForm = ({ onSubmit, onCancel, initialData = null }) => {
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        discount_type: "percentage",
        value: "",
        applies_to: "bill",
        min_order_value: "0",
        max_discount_value: "",
        valid_from: new Date().toISOString().slice(0, 16),
        valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        is_active: true,
        requires_approval: false,
        ...initialData,
        // Format dates for input if editing
        valid_from: initialData?.valid_from ? new Date(initialData.valid_from).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        valid_to: initialData?.valid_to ? new Date(initialData.valid_to).toISOString().slice(0, 16) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {initialData ? 'Edit Discount Rule' : 'Create New Discount Rule'}
                    </h2>
                    <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Rule Name</label>
                            <input
                                required
                                className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Summer Sale"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Promo Code</label>
                            <input
                                required
                                className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 font-mono uppercase"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="SUMMER2025"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Discount Type</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                                value={formData.discount_type}
                                onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="flat">Flat Amount (₹)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Value</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                                value={formData.value}
                                onChange={e => setFormData({ ...formData, value: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Min Order Value</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                                value={formData.min_order_value}
                                onChange={e => setFormData({ ...formData, min_order_value: e.target.value })}
                            />
                        </div>
                        {formData.discount_type === 'percentage' && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Max Discount Limit</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                                    value={formData.max_discount_value}
                                    onChange={e => setFormData({ ...formData, max_discount_value: e.target.value })}
                                    placeholder="Leave empty for no limit"
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Valid From</label>
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                                value={formData.valid_from}
                                onChange={e => setFormData({ ...formData, valid_from: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Valid To</label>
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                                value={formData.valid_to}
                                onChange={e => setFormData({ ...formData, valid_to: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-6 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="font-medium text-gray-900 dark:text-white">Active Status</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.requires_approval}
                                onChange={e => setFormData({ ...formData, requires_approval: e.target.checked })}
                                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="font-medium text-gray-900 dark:text-white">Requires Approval</span>
                        </label>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
                        >
                            {initialData ? 'Update Rule' : 'Create Rule'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// --- Super Admin Settings Component ---
const SuperAdminSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await superAdminAPI.getSettings();
            setSettings(res.data);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await superAdminAPI.updateSettings(settings);
            setSettings(res.data);
            alert("Settings updated successfully");
        } catch (error) {
            alert("Failed to update settings");
        }
    };

    if (loading) return <div className="p-12 text-center">Loading settings...</div>;
    if (!settings) return null;

    return (
        <form onSubmit={handleUpdate} className="space-y-6 animate-in fade-in">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <Lock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Global Discount Controls</h3>
                        <p className="text-gray-500 text-sm">Set platform-wide limits and rules.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Access Control */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-gray-700 dark:text-gray-300 border-b pb-2">Access Control</h4>
                        <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                            <span className="font-medium text-gray-900 dark:text-white">Enable Discounts Globally</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.enable_discounts}
                                    onChange={e => setSettings({ ...settings, enable_discounts: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </div>
                        </label>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Allowed Discount Levels</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700"
                                value={settings.allowed_discount_level}
                                onChange={e => setSettings({ ...settings, allowed_discount_level: e.target.value })}
                            >
                                <option value="ITEM_ONLY">Item Level Only</option>
                                <option value="BILL_ONLY">Bill Level Only (Total)</option>
                                <option value="BOTH">Both Item & Bill Level</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tax Application Order</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700"
                                value={settings.discount_tax_config}
                                onChange={e => setSettings({ ...settings, discount_tax_config: e.target.value })}
                            >
                                <option value="BEFORE_TAX">Before Tax (Standard)</option>
                                <option value="AFTER_TAX">After Tax</option>
                            </select>
                        </div>
                    </div>

                    {/* Limits */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-gray-700 dark:text-gray-300 border-b pb-2">Global Limits</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Max Percentage (%)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700"
                                    value={settings.max_discount_percentage}
                                    onChange={e => setSettings({ ...settings, max_discount_percentage: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="checkbox"
                                        checked={settings.allow_percent_discount}
                                        onChange={e => setSettings({ ...settings, allow_percent_discount: e.target.checked })}
                                        className="rounded text-blue-600"
                                    />
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Allow %</label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Max Flat Amount (₹)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700"
                                    value={settings.max_discount_amount}
                                    onChange={e => setSettings({ ...settings, max_discount_amount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="checkbox"
                                        checked={settings.allow_flat_discount}
                                        onChange={e => setSettings({ ...settings, allow_flat_discount: e.target.checked })}
                                        className="rounded text-blue-600"
                                    />
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Allow Flat</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                    <button
                        type="submit"
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
                    >
                        Save Global Settings
                    </button>
                </div>
            </div>
        </form>
    );
};

export default function DiscountPage() {
    const { user } = useAuth();
    const isSuperAdmin = user?.is_super_admin;
    const [activeTab, setActiveTab] = useState("overview");

    // Owner State
    const [rules, setRules] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingRule, setEditingRule] = useState(null);

    useEffect(() => {
        if (!isSuperAdmin) {
            fetchData();
        } else {
            // Super Admin defaults to settings tab
            if (activeTab === 'overview') setActiveTab('settings');
        }
    }, [activeTab, isSuperAdmin]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'rules' || activeTab === 'overview') {
                const res = await discountAPI.getAllRules();
                setRules(res.data);
            }
            if (activeTab === 'logs' || activeTab === 'overview') {
                const res = await discountAPI.getLogs();
                setLogs(res.data);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRule = async (data) => {
        try {
            await discountAPI.createRule(data);
            setShowForm(false);
            fetchData();
        } catch (error) {
            alert("Failed to create rule: " + (error.response?.data?.detail || error.message));
        }
    };

    const handleUpdateRule = async (data) => {
        try {
            await discountAPI.updateRule(editingRule.id, data);
            setEditingRule(null);
            fetchData();
        } catch (error) {
            alert("Failed to update rule");
        }
    };

    const handleDeleteRule = async (id) => {
        if (window.confirm("Are you sure you want to delete this rule?")) {
            try {
                await discountAPI.deleteRule(id);
                fetchData();
            } catch (error) {
                alert("Failed to delete rule");
            }
        }
    };

    const renderOverview = () => {
        const activeRules = rules.filter(r => r.is_active).length;
        const totalDiscountsGiven = logs.reduce((sum, log) => sum + parseFloat(log.discount_amount), 0);
        const todayDiscounts = logs
            .filter(log => new Date(log.timestamp).toDateString() === new Date().toDateString())
            .reduce((sum, log) => sum + parseFloat(log.discount_amount), 0);

        return (
            <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Active Rules" value={activeRules} icon={CheckCircle} color="bg-blue-500" />
                    <StatCard title="Total Discounts" value={`₹${totalDiscountsGiven.toFixed(2)}`} icon={TrendingUp} color="bg-purple-500" />
                    <StatCard title="Today's Savings" value={`₹${todayDiscounts.toFixed(2)}`} icon={DollarSign} color="bg-green-500" trend={12} />
                    <StatCard title="Audit Logs" value={logs.length} icon={List} color="bg-orange-500" />
                </div>

                {/* Recent Activity Table for Owner */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Discount Activity</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4 rounded-l-xl">Time</th>
                                    <th className="px-6 py-4">Rule Code</th>
                                    <th className="px-6 py-4">Invoice</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4 text-right rounded-r-xl">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {logs.slice(0, 5).map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                        <td className="px-6 py-4 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4 font-mono font-bold text-blue-600">{log.rule_code || 'MANUAL'}</td>
                                        <td className="px-6 py-4">{log.invoice_number}</td>
                                        <td className="px-6 py-4">{log.user_name}</td>
                                        <td className="px-6 py-4 text-right font-bold text-green-600">-₹{log.discount_amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderRules = () => (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white pl-2">Manage Rules</h3>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all"
                >
                    <Plus className="w-5 h-5" /> Create Rule
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {rules.map(rule => (
                    <div key={rule.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 group hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                            <Tag className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="font-mono text-sm font-bold px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-300">
                                    {rule.code}
                                </span>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{rule.name}</h3>
                                {!rule.is_active && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-bold">Inactive</span>}
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                                {rule.discount_type === 'percentage' ? `${rule.value}% Off` : `₹${rule.value} Flat Off`} • Min Order: ₹{rule.min_order_value}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setEditingRule(rule)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg"
                            >
                                <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleDeleteRule(rule.id)}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-lg"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
                {rules.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-300 dark:border-slate-700">
                        <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No discount rules found. Create one to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderLogs = () => (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm animate-in fade-in">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">Full Audit Trail</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-6 py-4 rounded-l-xl">Timestamp</th>
                            <th className="px-6 py-4">Rule Code</th>
                            <th className="px-6 py-4">Invoice #</th>
                            <th className="px-6 py-4">Applied By</th>
                            <th className="px-6 py-4 text-right rounded-r-xl">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                <td className="px-6 py-4 text-gray-600 font-medium">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4">{log.rule_code || 'MANUAL'}</td>
                                <td className="px-6 py-4">{log.invoice_number}</td>
                                <td className="px-6 py-4">{log.user_name}</td>
                                <td className="px-6 py-4 text-right font-bold text-green-600">-₹{log.discount_amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 md:left-72 bg-gray-50/50 dark:bg-black/20 z-0 flex overflow-hidden">
            <div className="flex-1 min-w-0 overflow-y-auto bg-gray-50/50 dark:bg-black/20 p-6 scroll-smooth">
                <div className="max-w-7xl mx-auto pb-20">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-500/30">
                                <Percent className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                                    {isSuperAdmin ? 'Global Discount Settings' : 'Discounts & Offers'}
                                </h1>
                                <p className="text-gray-500 font-medium">
                                    {isSuperAdmin ? 'Manage platform-wide discount rules and limits.' : 'Create and manage discount rules for your business.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-gray-200 dark:border-slate-800 mb-8 w-fit shadow-sm">
                        {isSuperAdmin ? (
                            <>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold text-sm transition-all ${activeTab === 'settings' ? 'bg-gray-900 text-white shadow-lg dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <Settings className="w-4 h-4" /> Global Settings
                                </button>
                                {/* Super Admin can view logs? Maybe global logs if needed, but for now stick to settings as primary */}
                            </>
                        ) : (
                            <>
                                <button onClick={() => setActiveTab('overview')} className={`px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold text-sm transition-all ${activeTab === 'overview' ? 'bg-gray-900 text-white shadow-lg dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-100'}`}><TrendingUp className="w-4 h-4" /> Overview</button>
                                <button onClick={() => setActiveTab('rules')} className={`px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold text-sm transition-all ${activeTab === 'rules' ? 'bg-gray-900 text-white shadow-lg dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-100'}`}><List className="w-4 h-4" /> Rules</button>
                                <button onClick={() => setActiveTab('logs')} className={`px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold text-sm transition-all ${activeTab === 'logs' ? 'bg-gray-900 text-white shadow-lg dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-100'}`}><Shield className="w-4 h-4" /> Audit Logs</button>
                            </>
                        )}
                    </div>

                    <div className="min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {isSuperAdmin && activeTab === 'settings' && (
                                <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <SuperAdminSettings />
                                </motion.div>
                            )}

                            {!isSuperAdmin && activeTab === 'overview' && <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>{renderOverview()}</motion.div>}
                            {!isSuperAdmin && activeTab === 'rules' && <motion.div key="rules" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>{renderRules()}</motion.div>}
                            {!isSuperAdmin && activeTab === 'logs' && <motion.div key="logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>{renderLogs()}</motion.div>}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {(showForm || editingRule) && !isSuperAdmin && (
                <RuleForm
                    initialData={editingRule}
                    onCancel={() => { setShowForm(false); setEditingRule(null); }}
                    onSubmit={editingRule ? handleUpdateRule : handleCreateRule}
                />
            )}
        </div>
    );
}
