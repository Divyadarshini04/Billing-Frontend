import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Globe, TrendingUp, Download, Eye, EyeOff, Plus, Edit2, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { useExportSuccess } from "../context/ExportSuccessContext";
import { useAuth } from "../context/AuthContext";

const sellers = [
  { id: 1, name: "Fresh Spices Wholesale", contact: "+91-9876543210", email: "supplier@freshspices.com", gst: "27AABCV1234F1Z5", city: "Mumbai", rating: 4.8, totalOrders: 245, status: "Active", monthlyVolume: "₹15,45,000", website: "freshspices.com", paymentTerms: "Net 30", avgDeliveryDays: 3 },
  { id: 2, name: "Premium Food Ingredients", contact: "+91-9123456789", email: "sales@premiumfood.com", gst: "18AABCS5555G1Z0", city: "Delhi", rating: 4.6, totalOrders: 189, status: "Active", monthlyVolume: "₹12,34,000", website: "premiumfood.com", paymentTerms: "Net 45", avgDeliveryDays: 4 },
  { id: 3, name: "Organic Farm Exports", contact: "+91-8765432109", email: "info@organicfarm.com", gst: "33AABCO1111H2Z2", city: "Bangalore", rating: 4.9, totalOrders: 156, status: "Active", monthlyVolume: "₹8,90,000", website: "organicfarm.com", paymentTerms: "Net 60", avgDeliveryDays: 5 },
  { id: 4, name: "Spice Market Ltd", contact: "+91-9999999999", email: "bulk@spicemarket.com", gst: "29AABCO2222K1Z8", city: "Chennai", rating: 4.4, totalOrders: 98, status: "Inactive", monthlyVolume: "₹5,20,000", website: "spicemarket.com", paymentTerms: "Net 15", avgDeliveryDays: 2 },
];

export default function SellerReportsPage() {
  const exportSuccess = useExportSuccess();
  const { userRole } = useAuth();
  const [sellers, setSellers] = useState([
    { id: 1, name: "Fresh Spices Wholesale", contact: "+91-9876543210", email: "supplier@freshspices.com", gst: "27AABCV1234F1Z5", city: "Mumbai", rating: 4.8, totalOrders: 245, status: "Active", monthlyVolume: "₹15,45,000", website: "freshspices.com", paymentTerms: "Net 30", avgDeliveryDays: 3 },
    { id: 2, name: "Premium Food Ingredients", contact: "+91-9123456789", email: "sales@premiumfood.com", gst: "18AABCS5555G1Z0", city: "Delhi", rating: 4.6, totalOrders: 189, status: "Active", monthlyVolume: "₹12,34,000", website: "premiumfood.com", paymentTerms: "Net 45", avgDeliveryDays: 4 },
    { id: 3, name: "Organic Farm Exports", contact: "+91-8765432109", email: "info@organicfarm.com", gst: "33AABCO1111H2Z2", city: "Bangalore", rating: 4.9, totalOrders: 156, status: "Active", monthlyVolume: "₹8,90,000", website: "organicfarm.com", paymentTerms: "Net 60", avgDeliveryDays: 5 },
    { id: 4, name: "Spice Market Ltd", contact: "+91-9999999999", email: "bulk@spicemarket.com", gst: "29AABCO2222K1Z8", city: "Chennai", rating: 4.4, totalOrders: 98, status: "Inactive", monthlyVolume: "₹5,20,000", website: "spicemarket.com", paymentTerms: "Net 15", avgDeliveryDays: 2 },
  ]);
  const [expandedSeller, setExpandedSeller] = useState(null);
  const [sortBy, setSortBy] = useState("rating");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editing, setEditing] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredSellers = sellers
    .filter((seller) => filterStatus === "all" || seller.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "orders") return b.totalOrders - a.totalOrders;
      if (sortBy === "volume") return parseFloat(b.monthlyVolume.replace(/[₹,]/g, "")) - parseFloat(a.monthlyVolume.replace(/[₹,]/g, ""));
      return 0;
    });

  function deleteSeller(id) {
    setSellers(sellers.filter(s => s.id !== id));
  }

  function saveSeller(updated) {
    setSellers(sellers.map(s => (s.id === updated.id ? updated : s)));
    setEditing(null);
  }

  // Export Sellers Report to Excel
  function handleExportSellers() {
    try {
      const exportData = sellers.map(s => ({
        Name: s.name,
        Contact: s.contact,
        Email: s.email,
        GST: s.gst,
        City: s.city,
        Rating: s.rating,
        "Total Orders": s.totalOrders,
        "Monthly Volume": s.monthlyVolume,
        Status: s.status,
        Website: s.website,
        "Payment Terms": s.paymentTerms,
        "Avg Delivery Days": s.avgDeliveryDays
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sellers & Suppliers");
      XLSX.writeFile(workbook, `seller_reports_${new Date().toISOString().split('T')[0]}.xlsx`);
      try { exportSuccess.showExportSuccess("Seller & Supplier reports exported successfully"); } catch (e) { }
    } catch (error) {
      alert("⚠️ Error exporting file: " + error.message);
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900">Seller & Supplier Reports</h1>
        <p className="text-gray-600 mt-2">Manage and track all your suppliers and vendors</p>
      </motion.div>

      {/* Filters & Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8 flex-wrap"
      >
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
          >
            <option value="rating">Sort by Rating</option>
            <option value="orders">Sort by Orders</option>
            <option value="volume">Sort by Volume</option>
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExportSellers}
          className="ml-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export Report
        </motion.button>
        {(userRole === "OWNER") && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Seller
          </motion.button>
        )}
      </motion.div>

      {/* Sellers Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {filteredSellers.map((seller, idx) => (
          <motion.div
            key={seller.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-lg border-2 shadow-sm hover:shadow-lg transition-all ${seller.status === "Active"
                ? "bg-gradient-to-br from-white to-green-50 border-green-300"
                : "bg-gradient-to-br from-white to-gray-50 border-gray-300"
              }`}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{seller.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{seller.city}</p>
                </div>
                <div className="flex items-center gap-2 bg-yellow-100 px-3 py-2 rounded-lg">
                  <span className="text-xl">⭐</span>
                  <span className="font-bold text-yellow-800">{seller.rating}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${seller.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {seller.status}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900 font-semibold">{seller.contact}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-red-600" />
                  <span className="text-blue-600 text-sm truncate">{seller.email}</span>
                </div>
                {seller.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-900 font-semibold">{seller.website}</span>
                  </div>
                )}
              </div>

              {/* GST & Details */}
              <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-medium">GST</p>
                  <p className="text-sm font-mono font-bold text-gray-900 mt-1">{seller.gst}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-medium">Payment Terms</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{seller.paymentTerms}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center">
                  <p className="text-xs text-gray-600 font-medium">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{seller.totalOrders}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 font-medium">Monthly Volume</p>
                  <p className="text-lg font-bold text-green-600 mt-1">{seller.monthlyVolume}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 font-medium">Avg Delivery</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{seller.avgDeliveryDays}d</p>
                </div>
              </div>

              {/* Expand Button & Actions */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setExpandedSeller(expandedSeller === seller.id ? null : seller.id)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {expandedSeller === seller.id ? (
                    <>
                      <EyeOff className="w-5 h-5" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5" />
                      View Details
                    </>
                  )}
                </motion.button>
                {(userRole === "OWNER") && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditing(seller)}
                      className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg font-bold transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteSeller(seller.id)}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-bold transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </>
                )}
              </div>

              {/* Expanded Details */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: expandedSeller === seller.id ? 1 : 0,
                  height: expandedSeller === seller.id ? "auto" : 0,
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-4 pt-4 border-t border-gray-200"
              >
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Total Transaction Value</span>
                    <span className="font-bold text-gray-900">
                      ₹{(parseFloat(seller.monthlyVolume.replace(/[₹,]/g, "")) * 12).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Avg Order Value</span>
                    <span className="font-bold text-gray-900">
                      ₹{Math.round(parseFloat(seller.monthlyVolume.replace(/[₹,]/g, "")) * 12 / seller.totalOrders).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Last Order Date</span>
                    <span className="font-bold text-gray-900">2024-11-10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">On-Time Delivery Rate</span>
                    <span className="font-bold text-green-600">98%</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="p-6 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-gray-600 text-sm font-medium">Total Sellers</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">{sellers.length}</p>
          <p className="text-xs text-gray-600 mt-2">{sellers.filter(s => s.status === "Active").length} active</p>
        </div>

        <div className="p-6 rounded-lg bg-green-50 border border-green-200">
          <p className="text-gray-600 text-sm font-medium">Avg Rating</p>
          <p className="text-4xl font-bold text-green-600 mt-2">
            {(sellers.reduce((acc, s) => acc + s.rating, 0) / sellers.length).toFixed(1)}
          </p>
          <p className="text-xs text-gray-600 mt-2">Out of 5.0 stars</p>
        </div>

        <div className="p-6 rounded-lg bg-orange-50 border border-orange-200">
          <p className="text-gray-600 text-sm font-medium">Total Orders</p>
          <p className="text-4xl font-bold text-orange-600 mt-2">
            {sellers.reduce((acc, s) => acc + s.totalOrders, 0)}
          </p>
          <p className="text-xs text-gray-600 mt-2">All time</p>
        </div>

        <div className="p-6 rounded-lg bg-purple-50 border border-purple-200">
          <p className="text-gray-600 text-sm font-medium">Monthly Volume</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            ₹{(sellers.reduce((acc, s) => acc + parseFloat(s.monthlyVolume.replace(/[₹,]/g, "")), 0) / 100000).toFixed(2)}Cr
          </p>
          <p className="text-xs text-gray-600 mt-2">Combined</p>
        </div>
      </motion.div>

      {/* Edit Seller Modal */}
      {editing && (userRole === "OWNER") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setEditing(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl max-h-96 overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Seller</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contact</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editing.contact}
                  onChange={(e) => setEditing({ ...editing, contact: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editing.city}
                  onChange={(e) => setEditing({ ...editing, city: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => saveSeller(editing)}
                className="flex-1 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors"
              >
                Save Changes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEditing(null)}
                className="flex-1 py-3 rounded-lg border-2 border-gray-300 text-gray-900 font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
