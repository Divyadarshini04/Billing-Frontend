import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Search } from "lucide-react";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });

  const handleAddCustomer = () => {
    if (formData.name && formData.phone) {
      setCustomers([...customers, { id: Date.now(), ...formData, purchases: 0 }]);
      setFormData({ name: "", phone: "", email: "" });
      setShowAddForm(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Customers</h2>
          <p className="text-slate-400">Add and manage customer information</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </motion.button>
      </div>

      {/* Add Customer Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Customer name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
              <input
                type="tel"
                placeholder="Mobile number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Email (Optional)</label>
              <input
                type="email"
                placeholder="customer@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddCustomer}
              disabled={!formData.name || !formData.phone}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Customer
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Customers Table */}
      <div className="overflow-x-auto bg-slate-800/50 rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/50 border-b border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Name</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Phone</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Email</th>
              <th className="px-6 py-3 text-left text-slate-300 font-medium">Purchases</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {customers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  No customers yet
                </td>
              </tr>
            ) : (
              customers.map((customer, idx) => (
                <tr key={idx} className="hover:bg-slate-700/30 transition">
                  <td className="px-6 py-3 text-white font-medium">{customer.name}</td>
                  <td className="px-6 py-3 text-slate-300">{customer.phone}</td>
                  <td className="px-6 py-3 text-slate-300">{customer.email}</td>
                  <td className="px-6 py-3 text-slate-400">{customer.purchases}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-slate-400 text-sm text-center">
        ℹ️ You can add new customers and view their history, but cannot edit or delete
      </p>
    </motion.div>
  );
}
