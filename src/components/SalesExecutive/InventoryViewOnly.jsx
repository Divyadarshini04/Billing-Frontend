import React, { useState } from "react";
import { motion } from "framer-motion";
import { Package, Search, AlertCircle } from "lucide-react";

export default function InventoryViewOnly() {
  const [products] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ⚠️ READ-ONLY COMPONENT
  // This component is intentionally read-only. All edit/add/delete operations are disabled.
  // Sales executives can only VIEW and SEARCH products. They cannot make ANY modifications.
  // All inventory changes must be made by the Owner/Manager through the Owner Dashboard.

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Inventory (View Only)</h2>
        <p className="text-slate-400">Check product availability and prices</p>
      </div>

      {/* Info Banner - CRITICAL WARNING */}
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-300 font-medium">⚠️ Read-Only Access - No Modifications Allowed</p>
          <p className="text-red-400 text-sm">You CANNOT add, edit, delete products or change prices. You can ONLY VIEW products and stock levels. All inventory changes must be made by your manager/owner through the Owner Dashboard.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto bg-slate-800/50 rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/50 border-b border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Product</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">SKU</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Selling Price</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Current Stock</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {products.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                  <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product, idx) => (
                <tr key={idx} className="hover:bg-slate-700/30 transition">
                  <td className="px-6 py-3 text-white font-medium">{product.name}</td>
                  <td className="px-6 py-3 text-slate-300">{product.sku}</td>
                  <td className="px-6 py-3 text-white font-medium">₹{product.price}</td>
                  <td className="px-6 py-3 text-white">{product.stock}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.stock > 10 ? "bg-green-500/20 text-green-400" : 
                      product.stock > 0 ? "bg-yellow-500/20 text-yellow-400" : 
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {product.stock > 10 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-slate-400 text-sm">
          ✅ You can view all products, their prices, and current stock levels to assist customers. Any stock or price changes must be made by the owner.
        </p>
      </div>
    </motion.div>
  );
}
