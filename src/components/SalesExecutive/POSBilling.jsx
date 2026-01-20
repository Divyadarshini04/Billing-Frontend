import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Search, Trash2, Plus, X } from "lucide-react";

export default function POSBilling() {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [discountPercent, setDiscountPercent] = useState(0);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = (cartTotal * discountPercent) / 100;
  const finalTotal = cartTotal - discountAmount;

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
              placeholder="Search products or scan barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Products Grid (Placeholder) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700 min-h-48">
            <p className="col-span-full text-slate-400 text-center py-12">Products loading...</p>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 h-fit sticky top-4 space-y-4">
          <h3 className="text-lg font-bold text-white">Invoice</h3>
          
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Customer</label>
            <input
              type="text"
              placeholder="Select customer"
              value={selectedCustomer || ""}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Cart Items */}
          <div className="mb-4 max-h-48 overflow-y-auto bg-slate-900/30 rounded-lg p-3">
            {cart.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Cart is empty</p>
            ) : (
              <div className="space-y-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                    <div className="flex-1">
                      <p className="text-white text-sm">{item.name}</p>
                      <p className="text-slate-400 text-xs">{item.qty} x ₹{item.price}</p>
                    </div>
                    <button 
                      onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Payment Mode</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
            </select>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Discount %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Totals */}
          <div className="border-t border-slate-700 pt-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Subtotal:</span>
              <span className="text-white font-medium">₹{cartTotal.toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-red-400">
                <span>Discount:</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-700 pt-2">
              <span className="text-white font-bold">Total:</span>
              <span className="text-white text-xl font-bold">₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition"
          >
            Complete Sale & Print
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
