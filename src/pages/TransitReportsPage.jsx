import React, { useState } from "react";
import { motion } from "framer-motion";
// eslint-disable-next-line no-unused-vars
import { Truck, Clock, MapPin, Package, CheckCircle, AlertCircle, Download, Map } from "lucide-react";
import * as XLSX from "xlsx";

// Load from actual data

export default function TransitReportsPage() {
  const [transitDetails] = useState([]);
  const [expandedShipment, setExpandedShipment] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("eta");

  const filteredTransit = transitDetails
    .filter((transit) => filterStatus === "all" || transit.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === "eta") return new Date(a.expectedDelivery) - new Date(b.expectedDelivery);
      if (sortBy === "distance") return b.distanceCovered - a.distanceCovered;
      return 0;
    });

  const getStatusColor = (status) => {
    const colors = {
      "In Transit": "from-blue-50 to-blue-100 border-blue-300",
      "Delivered": "from-green-50 to-green-100 border-green-300",
      "Pending": "from-yellow-50 to-yellow-100 border-yellow-300",
    };
    return colors[status] || "from-gray-50 to-gray-100 border-gray-300";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "In Transit":
        return <Truck className="w-6 h-6 text-blue-600" />;
      case "Pending":
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      default:
        return <Package className="w-6 h-6 text-gray-600" />;
    }
  };

  const deliveredCount = transitDetails.filter(t => t.status === "Delivered").length;
  const inTransitCount = transitDetails.filter(t => t.status === "In Transit").length;
  const pendingCount = transitDetails.filter(t => t.status === "Pending").length;
  const totalWeight = transitDetails.reduce((acc, t) => {
    const weight = parseFloat(t.products.match(/\((\d+)kg\)/)[1]);
    return acc + weight;
  }, 0);

  // Export Transit Report to Excel
  function handleExportTransit() {
    try {
      const exportData = transitDetails.map(t => ({
        "Shipment ID": t.shipmentId,
        Supplier: t.supplier,
        Products: t.products,
        Origin: t.origin,
        Destination: t.destination,
        Status: t.status,
        "Expected Delivery": t.expectedDelivery,
        "Current Location": t.currentLocation,
        "Days in Transit": t.daysInTransit,
        "Total Distance (km)": t.totalDistance,
        "Distance Covered (km)": t.distanceCovered,
        "Progress %": Math.round((t.distanceCovered / t.totalDistance) * 100)
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transit Report");
      
      // Add summary sheet
      const summaryData = [{
        "Total Shipments": transitDetails.length,
        "Delivered": deliveredCount,
        "In Transit": inTransitCount,
        "Pending": pendingCount,
        "Total Weight (kg)": totalWeight,
        "Date Exported": new Date().toLocaleDateString()
      }];
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
      
      XLSX.writeFile(workbook, `transit_reports_${new Date().toISOString().split('T')[0]}.xlsx`);
      alert("✅ Transit & Shipment reports exported successfully!");
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
        <h1 className="text-4xl font-bold text-gray-900">Transit & Shipment Reports</h1>
        <p className="text-gray-600 mt-2">Track all shipments and monitor logistics in real-time</p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">In Transit</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">{inTransitCount}</p>
            </div>
            <Truck className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Delivered</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{deliveredCount}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-4xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-yellow-600 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Weight</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{totalWeight}kg</p>
            </div>
            <Package className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </motion.div>
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
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
          >
            <option value="eta">Sort by ETA</option>
            <option value="distance">Sort by Progress</option>
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExportTransit}
          className="ml-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export Report
        </motion.button>
      </motion.div>

      {/* Shipments */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="space-y-4"
      >
        {filteredTransit.map((transit, idx) => (
          <motion.div
            key={transit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-6 rounded-lg border-2 bg-gradient-to-br ${getStatusColor(transit.status)} hover:shadow-lg transition-all cursor-pointer`}
            onClick={() => setExpandedShipment(expandedShipment === transit.id ? null : transit.id)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {getStatusIcon(transit.status)}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{transit.shipmentId}</h3>
                  <p className="text-sm text-gray-600">{transit.supplier}</p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                    transit.status === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : transit.status === "In Transit"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {transit.status}
                </span>
              </div>
            </div>

            {/* Main Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-600 font-medium">Products</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{transit.products}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Route</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{transit.origin} → {transit.destination}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Current Location</p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-bold text-blue-600">{transit.currentLocation}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">ETA</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{transit.expectedDelivery}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4 pb-4 border-b border-gray-300/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600">Transit Progress</p>
                <p className="text-sm font-bold text-gray-900">
                  {Math.round((transit.distanceCovered / transit.totalDistance) * 100)}%
                </p>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(transit.distanceCovered / transit.totalDistance) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`h-3 rounded-full ${
                    transit.status === "Delivered"
                      ? "bg-green-500"
                      : transit.status === "In Transit"
                      ? "bg-blue-500"
                      : "bg-yellow-500"
                  }`}
                />
              </div>
            </div>

            {/* Timeline Info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-600 font-medium">Days in Transit</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{transit.daysInTransit}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 font-medium">Distance Covered</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {transit.distanceCovered}/{transit.totalDistance} km
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="col-span-3 md:col-span-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Map className="w-4 h-4" />
                Track Live
              </motion.button>
            </div>

            {/* Expanded Details */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: expandedShipment === transit.id ? 1 : 0,
                height: expandedShipment === transit.id ? "auto" : 0,
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-4 pt-4 border-t border-gray-300/30"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Origin Address</p>
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {transit.origin}, India
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Destination Address</p>
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {transit.destination}, India
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Tracking URL</p>
                  <p className="text-sm text-blue-600 font-mono mt-2">{transit.trackingUrl}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Expected in</p>
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {Math.ceil((new Date(transit.expectedDelivery) - new Date()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Shipment Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">On-Time Delivery Rate</h3>
          <div className="text-center">
            <p className="text-5xl font-bold text-green-600">96.5%</p>
            <p className="text-sm text-gray-600 mt-2">Last 30 days</p>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Avg Delivery Time</h3>
          <div className="text-center">
            <p className="text-5xl font-bold text-blue-600">3.2</p>
            <p className="text-sm text-gray-600 mt-2">Days</p>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Total Shipments</h3>
          <div className="text-center">
            <p className="text-5xl font-bold text-orange-600">{transitDetails.length}</p>
            <p className="text-sm text-gray-600 mt-2">This month</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
