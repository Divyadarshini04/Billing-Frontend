import React, { useState, useEffect, useContext } from "react";
import { customerAPI } from "../api/apiService";
import { motion } from "framer-motion";
import { Gift, TrendingUp, Users, Award, Plus, Minus, Settings, Trash2, Search } from "lucide-react";
import { NotificationContext } from "../context/NotificationContext";

export default function LoyaltyManagementPage() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [pointsToRemove, setPointsToRemove] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [loyaltyConfig, setLoyaltyConfig] = useState({
    pointsPerRupee: 1,
    bronzeThreshold: 0,
    silverThreshold: 500,
    goldThreshold: 2000,
    platinumThreshold: 5000,
    redeemValue: 100, // 100 points = ₹100 discount
  });
  const [showConfig, setShowConfig] = useState(false);
  const { addNotification } = useContext(NotificationContext);

  // Load customers from localStorage
  // Load customers from API
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getAllCustomers();
      if (response.data) {
        const normalized = response.data.map(c => ({
          ...c,
          loyaltyPoints: c.loyaltyPoints || 0,
          loyaltyTier: c.loyaltyTier || "Bronze",
        }));
        setCustomers(normalized);
        setFilteredCustomers(normalized);
      }
    } catch (error) {

    }
  };

  // Search filter
  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredCustomers(
        customers.filter(c =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery)
        )
      );
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchQuery, customers]);

  // Fetch config from backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await fetch("http://localhost:8000/api/customer/loyalty/settings/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          // Map backend fields to frontend state shape if different
          // Backend: points_per_rupee, redeem_value, bronze_threshold...
          // Frontend: pointsPerRupee, redeemValue, bronzeThreshold...
          setLoyaltyConfig({
            pointsPerRupee: data.points_per_rupee,
            redeemValue: data.redeem_value,
            bronzeThreshold: data.bronze_threshold,
            silverThreshold: data.silver_threshold,
            goldThreshold: data.gold_threshold,
            platinumThreshold: data.platinum_threshold
          });
        }
      } catch (error) {

      }
    };
    fetchConfig();
  }, []);

  function updateLoyaltyTier(points) {
    if (points >= loyaltyConfig.platinumThreshold) return "Platinum";
    if (points >= loyaltyConfig.goldThreshold) return "Gold";
    if (points >= loyaltyConfig.silverThreshold) return "Silver";
    return "Bronze";
  }

  async function addPointsToCustomer() {
    if (!selectedCustomer || !pointsToAdd || pointsToAdd <= 0) {
      addNotification("error", "Invalid Input", "Please enter valid points amount");
      return;
    }

    const pointsNum = parseInt(pointsToAdd);
    const newPoints = (selectedCustomer.loyaltyPoints || 0) + pointsNum;

    try {
      const updatedData = {
        ...selectedCustomer,
        loyaltyPoints: newPoints,
        loyaltyTier: updateLoyaltyTier(newPoints)
      };

      const response = await customerAPI.updateCustomer(selectedCustomer.id, updatedData);

      if (response.data) {
        const updatedCustomer = response.data;
        setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
        setSelectedCustomer(updatedCustomer);
        setPointsToAdd("");
        addNotification("success", "Points Added", `+${pointsNum} loyalty points added to ${selectedCustomer.name}`);
      }
    } catch (error) {

      addNotification("error", "Error", "Failed to update loyalty points");
    }
  }

  async function removePointsFromCustomer() {
    if (!selectedCustomer || !pointsToRemove || pointsToRemove <= 0) {
      addNotification("error", "Invalid Input", "Please enter valid points amount");
      return;
    }

    const pointsNum = parseInt(pointsToRemove);
    if ((selectedCustomer.loyaltyPoints || 0) < pointsNum) {
      addNotification("error", "Insufficient Points", "Customer doesn't have enough points");
      return;
    }

    const newPoints = (selectedCustomer.loyaltyPoints || 0) - pointsNum;

    try {
      const updatedData = {
        ...selectedCustomer,
        loyaltyPoints: newPoints,
        loyaltyTier: updateLoyaltyTier(newPoints)
      };

      const response = await customerAPI.updateCustomer(selectedCustomer.id, updatedData);

      if (response.data) {
        const updatedCustomer = response.data;
        setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
        setSelectedCustomer(updatedCustomer);
        setPointsToRemove("");
        addNotification("success", "Points Removed", `-${pointsNum} loyalty points removed from ${selectedCustomer.name}`);
      }
    } catch (error) {

      addNotification("error", "Error", "Failed to update loyalty points");
    }
  }

  async function resetCustomerPoints() {
    if (!selectedCustomer || !window.confirm("Reset all loyalty points for this customer?")) return;

    try {
      const updatedData = {
        ...selectedCustomer,
        loyaltyPoints: 0,
        loyaltyTier: "Bronze"
      };

      const response = await customerAPI.updateCustomer(selectedCustomer.id, updatedData);

      if (response.data) {
        const updatedCustomer = response.data;
        setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
        setSelectedCustomer(updatedCustomer);
        addNotification("success", "Reset Complete", `Loyalty points reset for ${selectedCustomer.name}`);
      }
    } catch (error) {

      addNotification("error", "Error", "Failed to reset loyalty points");
    }
  }

  function getTierBadgeColor(tier) {
    switch (tier) {
      case "Platinum":
        return "bg-purple-200 text-purple-700";
      case "Gold":
        return "bg-yellow-200 text-yellow-700";
      case "Silver":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-orange-200 text-orange-700";
    }
  }

  const totalPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
  const avgPoints = customers.length > 0 ? Math.round(totalPoints / customers.length) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 md:p-8">
      <style>{`
        /* Custom scrollbar styling */
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: rgba(200, 200, 200, 0.4);
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(150, 150, 150, 0.6);
        }
      `}</style>
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-300 to-indigo-400 mb-4 shadow-md">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-2">Loyalty Points</h1>
          <p className="text-indigo-600 text-lg">Manage and reward your most valued customers</p>
        </motion.div>

        {/* Stats Cards - Enhanced Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10 w-full"
        >
          <motion.div
            whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15)" }}
            className="relative overflow-hidden rounded-xl bg-blue-50 border border-blue-200 p-6 group shadow-md"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 opacity-30 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300" />
            <TrendingUp className="w-8 h-8 mb-2 text-blue-600" />
            <p className="text-blue-600 text-sm font-semibold mb-2">Total Points</p>
            <p className="text-4xl font-bold text-gray-800">{totalPoints.toLocaleString()}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(34, 197, 94, 0.15)" }}
            className="relative overflow-hidden rounded-xl bg-green-50 border border-green-200 p-6 group shadow-md"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 opacity-30 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300" />
            <Users className="w-8 h-8 mb-2 text-green-600" />
            <p className="text-green-600 text-sm font-semibold mb-2">Customers</p>
            <p className="text-4xl font-bold text-gray-800">{customers.length}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.15)" }}
            className="relative overflow-hidden rounded-xl bg-purple-50 border border-purple-200 p-6 group shadow-md"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 opacity-30 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300" />
            <Award className="w-8 h-8 mb-2 text-purple-600" />
            <p className="text-purple-600 text-sm font-semibold mb-2">Avg Points</p>
            <p className="text-4xl font-bold text-gray-800">{avgPoints}</p>
          </motion.div>

        </motion.div>

        {/* Config Section */}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          {/* Customers List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Users className="w-8 h-8 text-gray-700" />
              Customers
            </h2>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-blue-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-3">
              {filteredCustomers.map((customer) => (
                <motion.div
                  key={customer.id}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${selectedCustomer?.id === customer.id
                    ? "bg-blue-100 border-blue-400 shadow-md shadow-blue-200"
                    : "bg-white border-blue-200 hover:border-blue-300 shadow-sm"
                    }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {customer.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{customer.name}</p>
                      <p className="text-xs text-gray-600">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500">Points:</span>
                      <span className="text-lg font-bold text-gray-800">{customer.loyaltyPoints || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500">Tier:</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${customer.loyaltyTier === "Platinum" ? "bg-indigo-200 text-indigo-800" :
                        customer.loyaltyTier === "Gold" ? "bg-yellow-200 text-yellow-800" :
                          customer.loyaltyTier === "Silver" ? "bg-slate-200 text-slate-800" :
                            "bg-orange-200 text-orange-800"
                        }`}>
                        {customer.loyaltyTier || "Bronze"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Customer Details & Actions */}
          {selectedCustomer && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 h-fit"
            >
              {/* Header Card */}
              <motion.div
                whileHover={{ y: -5 }}
                className="relative overflow-hidden rounded-xl bg-indigo-50 border-2 border-indigo-300 p-8 text-gray-800 mb-6 shadow-md"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 opacity-20 rounded-full -mr-16 -mt-16" />
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-2">{selectedCustomer.name}</h2>
                  <p className="text-gray-600 mb-4">{selectedCustomer.phone}</p>
                  <div className="flex items-end gap-4">
                    <div>
                      <p className="text-gray-600 text-sm font-bold mb-1">Loyalty Points</p>
                      <p className="text-5xl font-bold text-gray-800">{selectedCustomer.loyaltyPoints || 0}</p>
                    </div>
                    <div className="flex-1">
                      <span className={`inline-block px-4 py-2 rounded-lg font-bold text-sm text-white ${selectedCustomer.loyaltyTier === "Platinum" ? "bg-indigo-600" :
                        selectedCustomer.loyaltyTier === "Gold" ? "bg-yellow-500" :
                          selectedCustomer.loyaltyTier === "Silver" ? "bg-slate-500" :
                            "bg-orange-500"
                        }`}>
                        {selectedCustomer.loyaltyTier || "Bronze"} Member
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Actions Grid */}
              <div className="space-y-4 mb-6">
                {/* Add Points Card */}
                <motion.div
                  whileHover={{ y: -3 }}
                  className="rounded-xl bg-blue-50 border border-blue-200 p-4 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-400 flex items-center justify-center flex-shrink-0">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <label className="text-sm font-bold text-blue-800">Add Points</label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="1"
                      value={pointsToAdd}
                      onChange={(e) => setPointsToAdd(e.target.value)}
                      placeholder="Amount"
                      className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addPointsToCustomer}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600 transition-all flex-shrink-0 w-16"
                    >
                      Add
                    </motion.button>
                  </div>
                </motion.div>

                {/* Remove Points Card */}
                <motion.div
                  whileHover={{ y: -3 }}
                  className="rounded-xl bg-red-50 border border-red-200 p-4 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-red-400 flex items-center justify-center flex-shrink-0">
                      <Minus className="w-5 h-5 text-white" />
                    </div>
                    <label className="text-sm font-bold text-red-800">Remove Points</label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="1"
                      value={pointsToRemove}
                      onChange={(e) => setPointsToRemove(e.target.value)}
                      placeholder="Amount"
                      className="flex-1 px-3 py-2 bg-white border border-red-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={removePointsFromCustomer}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-sm hover:bg-red-600 transition-all flex-shrink-0 w-20"
                    >
                      Remove
                    </motion.button>
                  </div>
                </motion.div>
              </div>

              {/* Reset & Info */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetCustomerPoints}
                  className="w-full px-4 py-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Reset All Points
                </motion.button>

                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 shadow-sm">
                  <p className="text-xs text-gray-700 mb-2 font-bold">Points Value:</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ₹{Math.floor(selectedCustomer.loyaltyPoints / loyaltyConfig.redeemValue * 100)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedCustomer.loyaltyPoints} pts ÷ {loyaltyConfig.redeemValue}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div >
  );
}
