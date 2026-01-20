import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Package,
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    Calendar,
    DollarSign,
    AlertCircle,
    BarChart3,
    Settings,
    CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OwnerSubscriptionManagement() {
    const { userRole } = useAuth();

    // State declarations - MUST be before any conditional returns
    const [activeTab, setActiveTab] = useState('overview');
    const [showAddPlanModal, setShowAddPlanModal] = useState(false);
    const [showEditPlanModal, setShowEditPlanModal] = useState(false);
    const [showEditTrialModal, setShowEditTrialModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    // Plans data
    const [plans, setPlans] = useState([
        {
            id: 1,
            name: 'Free',
            price: 0,
            billing: 'Monthly',
            description: 'Perfect for getting started',
            features: ['Up to 100 Products', '500 Customers', 'Basic Reports'],
            usersCount: 245,
            color: 'gray',
            status: 'Active',
        },
        {
            id: 2,
            name: 'Basic',
            price: 49,
            billing: 'Monthly',
            description: 'For growing businesses',
            features: ['Up to 500 Products', '5K Customers', 'Advanced Reports'],
            usersCount: 1230,
            color: 'blue',
            status: 'Active',
        },
        {
            id: 3,
            name: 'Pro',
            price: 149,
            billing: 'Monthly',
            description: 'For professional teams',
            features: ['Unlimited Products', '50K Customers', 'Full Analytics'],
            usersCount: 542,
            color: 'indigo',
            status: 'Active',
        },
        {
            id: 4,
            name: 'Enterprise',
            price: 0,
            billing: 'Custom',
            description: 'Custom enterprise solution',
            features: ['Everything in Pro', '24/7 Support', 'Custom Integration'],
            usersCount: 89,
            color: 'purple',
            status: 'Active',
        },
    ]);

    // Free trial settings
    const [trialSettings, setTrialSettings] = useState({
        freeTrialDays: 14,
        trialPlan: 'Pro',
        autoConvertPlan: 'Basic',
        trialEnabled: true,
    });

    // Users by plan
    const [usersByPlan] = useState([
        { id: 1, name: 'John Doe', email: 'john@example.com', plan: 'Pro', joinDate: '2025-01-15', status: 'Active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', plan: 'Basic', joinDate: '2024-12-20', status: 'Active' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', plan: 'Free', joinDate: '2024-11-10', status: 'Trial' },
        { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', plan: 'Enterprise', joinDate: '2025-02-01', status: 'Active' },
        { id: 5, name: 'Tom Davis', email: 'tom@example.com', plan: 'Basic', joinDate: '2024-10-05', status: 'Active' },
    ]);

    // New plan form
    const [newPlanForm, setNewPlanForm] = useState({
        name: '',
        price: '',
        billing: 'Monthly',
        description: '',
        features: '',
    });

    // Edit plan form
    const [editPlanForm, setEditPlanForm] = useState({
        name: '',
        price: '',
        billing: 'Monthly',
        description: '',
    });

    const handleAddPlan = () => {
        if (newPlanForm.name && newPlanForm.price !== '') {
            const newPlan = {
                id: plans.length + 1,
                name: newPlanForm.name,
                price: parseFloat(newPlanForm.price),
                billing: newPlanForm.billing,
                description: newPlanForm.description,
                features: newPlanForm.features.split(',').map(f => f.trim()),
                usersCount: 0,
                color: 'blue',
                status: 'Active',
            };
            setPlans([...plans, newPlan]);
            setNewPlanForm({ name: '', price: '', billing: 'Monthly', description: '', features: '' });
            setShowAddPlanModal(false);
        }
    };

    const handleEditPlan = () => {
        if (selectedPlan) {
            setPlans(
                plans.map(p =>
                    p.id === selectedPlan.id
                        ? { ...p, ...editPlanForm }
                        : p
                )
            );
            setShowEditPlanModal(false);
            setSelectedPlan(null);
        }
    };

    const handleDeletePlan = (id) => {
        setPlans(plans.filter(p => p.id !== id));
    };

    const totalRevenue = plans.reduce((sum, plan) => sum + (plan.price * plan.usersCount), 0);
    const totalUsers = usersByPlan.length;
    const totalPlans = plans.length;

    // Check if user is owner
    if (userRole !== 'OWNER') {
        return (
            <div className="min-h-screen bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 p-6 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
                    <p className="text-red-700">Only the owner can access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <h1 className="text-4xl font-bold text-gray-900">Subscription Management</h1>
                    <p className="text-gray-600">Manage plans, users, and free trial settings</p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid md:grid-cols-4 gap-6"
                >
                    <div className="bg-white rounded-lg shadow-md p-6 border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-600">Total Users</h3>
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{totalUsers || 0}</p>
                        <p className="text-xs text-gray-500 mt-2">Active subscriptions</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border border-indigo-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-600">Total Plans</h3>
                            <Package className="w-6 h-6 text-indigo-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{totalPlans || 0}</p>
                        <p className="text-xs text-gray-500 mt-2">Subscription plans</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border border-green-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-600">Total Revenue</h3>
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">${(totalRevenue || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-2">Monthly MRR</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border border-purple-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-600">Free Trial Days</h3>
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{trialSettings?.freeTrialDays || 0}</p>
                        <p className="text-xs text-gray-500 mt-2">Days available</p>
                    </div>
                </motion.div>

                {/* Tab Navigation */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 border-b border-blue-200 overflow-x-auto"
                >
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'plans', label: 'Manage Plans', icon: Package },
                        { id: 'trial', label: 'Free Trial Settings', icon: Calendar },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-3 font-medium flex items-center gap-2 whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </motion.div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Plans Summary */}
                            <div className="bg-white rounded-lg shadow-md p-6 border border-blue-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Plans Summary</h3>
                                <div className="space-y-3">
                                    {plans.map((plan) => (
                                        <div key={plan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-bold text-gray-900">{plan.name}</p>
                                                <p className="text-xs text-gray-600">${plan.price}/{plan.billing}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">{plan.usersCount}</p>
                                                <p className="text-xs text-gray-600">users</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Trial Settings Summary */}
                            <div className="bg-white rounded-lg shadow-md p-6 border border-purple-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Free Trial Settings</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                        <span className="text-gray-700">Trial Period</span>
                                        <span className="font-bold text-gray-900">{trialSettings.freeTrialDays} Days</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                        <span className="text-gray-700">Trial Plan</span>
                                        <span className="font-bold text-gray-900">{trialSettings.trialPlan}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                        <span className="text-gray-700">Auto Convert To</span>
                                        <span className="font-bold text-gray-900">{trialSettings.autoConvertPlan}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                        <span className="text-gray-700">Status</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${trialSettings.trialEnabled
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                            {trialSettings.trialEnabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Manage Plans Tab */}
                {activeTab === 'plans' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Subscription Plans</h3>
                            <button
                                onClick={() => setShowAddPlanModal(true)}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add New Plan
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {plans.map((plan) => (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold bg-${plan.color}-100 text-${plan.color}-700`}>
                                            {plan.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                                        <div>
                                            <p className="text-xs text-gray-600">Price</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                ${plan.price}
                                                <span className="text-sm text-gray-600">/{plan.billing}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Users</p>
                                            <p className="text-2xl font-bold text-gray-900">{plan.usersCount}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {plan.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm text-gray-700">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedPlan(plan);
                                                setEditPlanForm({ name: plan.name, price: plan.price, billing: plan.billing, description: plan.description });
                                                setShowEditPlanModal(true);
                                            }}
                                            className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded transition-all flex items-center justify-center gap-1"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeletePlan(plan.id)}
                                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Free Trial Settings Tab */}
                {activeTab === 'trial' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-lg shadow-md p-6 border border-purple-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Free Trial Configuration</h3>
                                <button
                                    onClick={() => setShowEditTrialModal(true)}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all flex items-center gap-2"
                                >
                                    <Settings className="w-5 h-5" />
                                    Configure
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                    <p className="text-sm text-gray-600 mb-2">Trial Period (Days)</p>
                                    <p className="text-3xl font-bold text-gray-900">{trialSettings.freeTrialDays}</p>
                                    <p className="text-xs text-gray-600 mt-2">Number of days new users can use free trial</p>
                                </div>

                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                    <p className="text-sm text-gray-600 mb-2">Trial Plan</p>
                                    <p className="text-lg font-bold text-gray-900">{trialSettings.trialPlan}</p>
                                    <p className="text-xs text-gray-600 mt-2">Plan users get access to during trial</p>
                                </div>

                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                    <p className="text-sm text-gray-600 mb-2">Auto-Convert Plan</p>
                                    <p className="text-lg font-bold text-gray-900">{trialSettings.autoConvertPlan}</p>
                                    <p className="text-xs text-gray-600 mt-2">Plan users convert to when trial ends</p>
                                </div>

                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Trial Status</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {trialSettings.trialEnabled ? '✓ Enabled' : '✗ Disabled'}
                                        </p>
                                    </div>
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${trialSettings.trialEnabled
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                        {trialSettings.trialEnabled ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Add Plan Modal */}
            {showAddPlanModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-lg shadow-lg p-8 max-w-2xl max-h-96 overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Add New Plan</h3>
                            <button
                                onClick={() => setShowAddPlanModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Plan Name</label>
                                <input
                                    type="text"
                                    value={newPlanForm.name}
                                    onChange={(e) => setNewPlanForm({ ...newPlanForm, name: e.target.value })}
                                    placeholder="e.g., Pro Max"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Price</label>
                                    <input
                                        type="number"
                                        value={newPlanForm.price}
                                        onChange={(e) => setNewPlanForm({ ...newPlanForm, price: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Billing Cycle</label>
                                    <select
                                        value={newPlanForm.billing}
                                        onChange={(e) => setNewPlanForm({ ...newPlanForm, billing: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="Monthly">Monthly</option>
                                        <option value="Yearly">Yearly</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                <input
                                    type="text"
                                    value={newPlanForm.description}
                                    onChange={(e) => setNewPlanForm({ ...newPlanForm, description: e.target.value })}
                                    placeholder="Brief description"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Features (comma separated)</label>
                                <textarea
                                    value={newPlanForm.features}
                                    onChange={(e) => setNewPlanForm({ ...newPlanForm, features: e.target.value })}
                                    placeholder="Feature 1, Feature 2, Feature 3"
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAddPlanModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddPlan}
                                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add Plan
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Edit Plan Modal */}
            {showEditPlanModal && selectedPlan && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-lg shadow-lg p-8 max-w-2xl max-h-96 overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Edit Plan</h3>
                            <button
                                onClick={() => setShowEditPlanModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Plan Name</label>
                                <input
                                    type="text"
                                    value={editPlanForm.name}
                                    onChange={(e) => setEditPlanForm({ ...editPlanForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Price</label>
                                    <input
                                        type="number"
                                        value={editPlanForm.price}
                                        onChange={(e) => setEditPlanForm({ ...editPlanForm, price: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Billing Cycle</label>
                                    <select
                                        value={editPlanForm.billing}
                                        onChange={(e) => setEditPlanForm({ ...editPlanForm, billing: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="Monthly">Monthly</option>
                                        <option value="Yearly">Yearly</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                <input
                                    type="text"
                                    value={editPlanForm.description}
                                    onChange={(e) => setEditPlanForm({ ...editPlanForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEditPlanModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditPlan}
                                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Edit Trial Settings Modal */}
            {showEditTrialModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-lg shadow-lg p-8 max-w-2xl max-h-96 overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Configure Free Trial</h3>
                            <button
                                onClick={() => setShowEditTrialModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Free Trial Days</label>
                                <input
                                    type="number"
                                    value={trialSettings.freeTrialDays}
                                    onChange={(e) => setTrialSettings({ ...trialSettings, freeTrialDays: parseInt(e.target.value) })}
                                    min="1"
                                    max="90"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                                <p className="text-xs text-gray-600 mt-1">Number of days for free trial (1-90)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Trial Plan</label>
                                <select
                                    value={trialSettings.trialPlan}
                                    onChange={(e) => setTrialSettings({ ...trialSettings, trialPlan: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                >
                                    {plans.map(plan => (
                                        <option key={plan.id} value={plan.name}>{plan.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-600 mt-1">Plan users get during trial period</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Auto-Convert Plan</label>
                                <select
                                    value={trialSettings.autoConvertPlan}
                                    onChange={(e) => setTrialSettings({ ...trialSettings, autoConvertPlan: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                >
                                    {plans.map(plan => (
                                        <option key={plan.id} value={plan.name}>{plan.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-600 mt-1">Plan users convert to when trial ends</p>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    checked={trialSettings.trialEnabled}
                                    onChange={(e) => setTrialSettings({ ...trialSettings, trialEnabled: e.target.checked })}
                                    className="w-5 h-5 rounded"
                                />
                                <label className="text-sm font-bold text-gray-700">Enable Free Trial</label>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEditTrialModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowEditTrialModal(false);
                                }}
                                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                Save Settings
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
