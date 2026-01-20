import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Search, Trash2, Plus } from "lucide-react";

export default function POSBilling() {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMode, setPaymentMode] = useState("cash");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">POS Billing</h2>
        <p className="text-slate-400">Create invoices and process payments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Search */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <p className="col-span-full text-slate-400 text-center py-8">Products loading...</p>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 h-fit sticky top-4">
          <h3 className="text-lg font-bold text-white mb-4">Cart</h3>
          
          {/* Customer Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Customer</label>
            <input
              type="text"
              placeholder="Select customer"
              value={selectedCustomer || ""}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Cart Items */}
          <div className="mb-4 max-h-48 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Cart is empty</p>
            ) : (
              <div className="space-y-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                    <div>
                      <p className="text-white text-sm">{item.name}</p>
                      <p className="text-slate-400 text-xs">{item.qty} x ₹{item.price}</p>
                    </div>
                    <button className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Mode */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Payment Mode</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="credit">Credit</option>
            </select>
          </div>

          {/* Total */}
          <div className="border-t border-slate-700 pt-3 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-slate-400">Subtotal:</span>
              <span className="text-white font-medium">₹0</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-slate-400">Total:</span>
              <span className="text-white text-xl font-bold">₹0</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition"
          >
            Complete Sale & Print
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
