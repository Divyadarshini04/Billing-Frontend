import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Check, Eye } from "lucide-react";
import { NotificationContext } from "../../context/NotificationContext";
import api from "../../api/axios";

export default function SubscriptionManagement() {
  const { addNotification } = useContext(NotificationContext);
  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState("monthly"); // Added state for filter
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    duration_days: "",
    max_staff_users: "",
    invoice_limit: "",
    product_limit: "",
    customer_limit: "",
    description: "",
  });
  const [createForm, setCreateForm] = useState({
    name: "",
    price: "",
    duration_days: "",
    max_staff_users: "",
    invoice_limit: "",
    product_limit: "",
    customer_limit: "",
    description: "",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      console.log('Fetching plans from API...');
      const response = await api.get("/api/subscription/plans/");
      console.log('API Response Plans:', response.data);
      setPlans(response.data);
    } catch (error) {
      console.error('Fetch Plans Error:', error);
      addNotification("Failed to fetch plans", "error");
    }
  };

  // ... (handlers remain the same) ...
  const handleEdit = (plan) => {
    console.log('Editing Plan:', plan);
    setEditingPlan(plan);
    setEditForm({
      name: plan.name,
      price: plan.price,
      duration_days: plan.duration_days,
      max_staff_users: plan.max_staff_users,
      invoice_limit: plan.invoice_limit,
      product_limit: plan.product_limit || "Unlimited",
      customer_limit: plan.customer_limit || "Unlimited",
      description: plan.description,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    handleUpdatePlan();
  };

  const handleUpdatePlan = async () => {
    try {
      const payload = {
        name: editForm.name.trim(),
        price: parseFloat(editForm.price) || 0,
        duration_days: parseInt(editForm.duration_days) || 0,
        max_staff_users: parseInt(editForm.max_staff_users) || 0,
        invoice_limit: editForm.invoice_limit.toString(),
        product_limit: editForm.product_limit.toString(),
        customer_limit: editForm.customer_limit.toString(),
        description: editForm.description.trim(),
        // Backend expects 'code' but we might not allow editing it easily, or it's part of 'p'.
        // For simplicity, we send fields available.
      };

      await api.patch(`/api/subscription/plans/${editingPlan.id}/`, payload);

      addNotification("Plan updated successfully!", "success");
      setShowEditModal(false);
      setEditingPlan(null);
      fetchPlans(); // Refresh list
    } catch (error) {
      addNotification("Error updating plan: " + (error.response?.data?.error || error.message), "error");
    }
  };

  const handleCreate = () => {

    setCreateForm({
      name: "",
      price: "",
      duration_days: "30",
      max_staff_users: "",
      invoice_limit: "",
      product_limit: "",
      customer_limit: "",
      description: "",
    });
    setShowCreateModal(true);
  };

  const handleSaveCreate = () => {
    handleCreatePlan();
  };

  const handleCreatePlan = async () => {
    try {
      // Generate a basic code from name if backend requires it and we don't have a field
      const generatedCode = createForm.name.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);

      const payload = {
        code: generatedCode,
        name: createForm.name.trim(),
        price: parseFloat(createForm.price) || 0,
        duration_days: parseInt(createForm.duration_days) || 0,
        max_staff_users: parseInt(createForm.max_staff_users) || 0,
        invoice_limit: createForm.invoice_limit.toString(),
        product_limit: createForm.product_limit.toString(),
        customer_limit: createForm.customer_limit.toString(),
        description: createForm.description.trim(),
        business_limit: "1",
        branch_limit: "1",
        features: ["Basic Feature"] // distinct from UI but req for model
      };

      await api.post("/api/subscription/plans/", payload);

      addNotification("New plan created successfully!", "success");
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        price: "",
        duration_days: "",
        max_staff_users: "",
        invoice_limit: "",
        product_limit: "",
        customer_limit: "",
        description: "",
      });
      fetchPlans();
    } catch (error) {
      addNotification("Error creating plan: " + (error.response?.data?.error || error.message), "error");
    }
  };

  // Filter plans based on cycle and active status
  const displayedPlans = plans.filter(plan => {
    // Hide inactive or old free trial plans
    if (plan.is_active === false) return false;

    // Explicitly hide legacy 'free_trial' if it comes through as active but we want 'FREE'
    // if (plan.code === 'free_trial') return false;

    if (billingCycle === 'monthly') {
      // Show plans <= 90 days as monthly/short-term (includes 7, 30, 90) or the new FREE trial
      return plan.duration_days < 365;
    } else {
      // Show plans >= 365 days as yearly
      return plan.duration_days >= 365;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Subscription Plans</h2>
          <p className="text-slate-400">View current subscription tiers and pricing</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Toggle */}
          <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${billingCycle === "monthly"
                ? "bg-purple-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${billingCycle === "yearly"
                ? "bg-purple-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
                }`}
            >
              Yearly
            </button>
          </div>

          <motion.button
            type="button"
            onClick={handleCreate}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            Create Plan
          </motion.button>
        </div>
      </motion.div>

      {/* Plans List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {displayedPlans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.02 }}
            className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl hover:border-slate-600 transition flex flex-col"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{plan.code}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-300`}>
                Active
              </span>
            </div>

            <div className="mb-4 pb-4 border-b border-slate-700/50">
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-white">₹{plan.price}</span>
                <span className="text-slate-400 text-sm">/{plan.duration_days >= 365 ? 'year' : (plan.price === 0 ? '7 days' : 'mo')}</span>
              </div>
              <div className="text-xs text-slate-500">
                + GST Configured
              </div>
            </div>

            {/* Limits Summary */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
              <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                <span className="block text-slate-500 mb-0.5">Staff</span>
                <span className="text-slate-300 font-medium">{plan.max_staff_users === 0 ? "Unlimited" : plan.max_staff_users}</span>
              </div>
              <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                <span className="block text-slate-500 mb-0.5">Invoices</span>
                <span className="text-slate-300 font-medium">{plan.invoice_limit}</span>
              </div>
              <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                <span className="block text-slate-500 mb-0.5">Products</span>
                <span className="text-slate-300 font-medium">{plan.product_limit}</span>
              </div>
              <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                <span className="block text-slate-500 mb-0.5">Customers</span>
                <span className="text-slate-300 font-medium">{plan.customer_limit}</span>
              </div>
            </div>

            {plan.description && (
              <p className="text-slate-400 text-xs mb-4 italic min-h-[32px]">{plan.description}</p>
            )}

            <div className="flex-1 space-y-2 mb-6">
              {(Array.isArray(plan.features) ? plan.features : []).slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-400 leading-tight">{f}</span>
                </div>
              ))}
              {(Array.isArray(plan.features) ? plan.features : []).length > 4 && (
                <p className="text-xs text-slate-600 pl-5">+{(Array.isArray(plan.features) ? plan.features : []).length - 4} more features</p>
              )}
            </div>

            <div className="flex gap-2">
              <motion.button
                type="button"
                onClick={() => setSelectedPlanDetails(plan)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                View
              </motion.button>
              <button
                type="button"
                onClick={() => {

                  handleEdit(plan);
                }}
                className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg border border-purple-700/50 transition"
                title="Edit plan"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* View Details Modal */}
      {selectedPlanDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedPlanDetails(null)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-700 bg-slate-900/50">
              <h3 className="text-xl font-bold text-white mb-1">{selectedPlanDetails.name}</h3>
              <p className="text-slate-400 text-sm">{selectedPlanDetails.description}</p>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Included Features</h4>
              <div className="space-y-3">
                {selectedPlanDetails.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30 border border-slate-700/50">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setSelectedPlanDetails(null)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {showEditModal && editingPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-slate-700 bg-slate-900/50">
              <h3 className="text-xl font-bold text-white">Edit Plan: {editingPlan.name}</h3>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Plan Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Price (₹)</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Duration (days)</label>
                  <input
                    type="number"
                    value={editForm.duration_days}
                    onChange={(e) => setEditForm({ ...editForm, duration_days: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Max Staff Users</label>
                  <input
                    type="number"
                    value={editForm.max_staff_users}
                    onChange={(e) => setEditForm({ ...editForm, max_staff_users: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Invoice Limit</label>
                  <input
                    type="text"
                    value={editForm.invoice_limit}
                    onChange={(e) => setEditForm({ ...editForm, invoice_limit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Product Limit</label>
                  <input
                    type="text"
                    value={editForm.product_limit}
                    onChange={(e) => setEditForm({ ...editForm, product_limit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Customer Limit</label>
                  <input
                    type="text"
                    value={editForm.customer_limit}
                    onChange={(e) => setEditForm({ ...editForm, customer_limit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none resize-none"
                  rows="3"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex gap-3 justify-end">
              <button
                onClick={() => {

                  setShowEditModal(false);
                }}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {

                  handleSaveEdit();
                }}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-slate-700 bg-slate-900/50">
              <h3 className="text-xl font-bold text-white">Create New Plan</h3>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Plan Name *</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                    placeholder="e.g., Premium Plan"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={createForm.price}
                    onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Duration (days) *</label>
                  <input
                    type="number"
                    value={createForm.duration_days}
                    onChange={(e) => setCreateForm({ ...createForm, duration_days: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Max Staff Users</label>
                  <input
                    type="number"
                    value={createForm.max_staff_users}
                    onChange={(e) => setCreateForm({ ...createForm, max_staff_users: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                    placeholder="3"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Invoice Limit</label>
                  <input
                    type="text"
                    value={createForm.invoice_limit}
                    onChange={(e) => setCreateForm({ ...createForm, invoice_limit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Product Limit</label>
                  <input
                    type="text"
                    value={createForm.product_limit}
                    onChange={(e) => setCreateForm({ ...createForm, product_limit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                    placeholder="e.g. 200 or Unlimited"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Customer Limit</label>
                  <input
                    type="text"
                    value={createForm.customer_limit}
                    onChange={(e) => setCreateForm({ ...createForm, customer_limit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                    placeholder="e.g. 20 or Unlimited"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none resize-none"
                  rows="3"
                  placeholder="Best for..."
                />
              </div>
            </div>

            <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex gap-3 justify-end">
              <button
                onClick={() => {

                  setShowCreateModal(false);
                }}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {

                  handleSaveCreate();
                }}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium"
              >
                Create Plan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
