import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Edit2, Trash2, Plus, Lock } from "lucide-react";

export default function RolesPermissions() {
  const [roles] = useState([
    { id: 1, name: "Cashier", permissions: 8 },
    { id: 2, name: "Inventory Manager", permissions: 6 },
    { id: 3, name: "Manager", permissions: 12 }
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Roles & Permissions</h2>
          <p className="text-slate-400">Manage staff access and permissions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Staff User
        </motion.button>
      </div>

      {/* Roles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => (
          <motion.div
            key={role.id}
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-cyan-500 transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{role.name}</h3>
                <p className="text-slate-400 text-sm mt-1">{role.permissions} permissions</p>
              </div>
              <Shield className="w-6 h-6 text-cyan-400 opacity-50" />
            </div>
            <div className="flex gap-2 pt-4 border-t border-slate-700">
              <motion.button whileHover={{ scale: 1.1 }} className="flex-1 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition flex items-center justify-center gap-1">
                <Edit2 className="w-4 h-4" />
                Edit
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} className="flex-1 py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded transition flex items-center justify-center gap-1">
                <Trash2 className="w-4 h-4" />
                Delete
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Staff Members */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Staff Members
        </h3>

        <div className="overflow-x-auto bg-slate-800/50 rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-slate-300 font-medium">Name</th>
                <th className="px-6 py-3 text-left text-slate-300 font-medium">Email</th>
                <th className="px-6 py-3 text-left text-slate-300 font-medium">Role</th>
                <th className="px-6 py-3 text-left text-slate-300 font-medium">Status</th>
                <th className="px-6 py-3 text-left text-slate-300 font-medium">Last Login</th>
                <th className="px-6 py-3 text-left text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  No staff members yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Reference */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-cyan-400" />
          Available Permissions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "View Dashboard",
            "Manage Products",
            "Manage Categories",
            "Create Invoices",
            "View Reports",
            "Manage Customers",
            "Manage Inventory",
            "Manage Staff",
            "View Transactions",
            "Export Reports",
            "Manage Settings",
            "View Audit Logs"
          ].map((perm, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-white text-sm">{perm}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
