import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tag, Plus, Edit2, Trash2 } from "lucide-react";

export default function CategoriesModule() {
  const [categories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Product Categories</h2>
          <p className="text-slate-400">Organize products into categories</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </motion.button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category Name</label>
              <input
                type="text"
                placeholder="Enter category name"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Display Color</label>
              <input
                type="color"
                defaultValue="#06b6d4"
                className="w-full h-10 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              placeholder="Enter category description"
              rows="3"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
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
              className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition"
            >
              Create Category
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <div className="col-span-full p-12 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed text-center">
            <Tag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-3">No categories yet</p>
            <p className="text-slate-500 text-sm">Create your first category to organize products</p>
          </div>
        ) : (
          categories.map((category, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-cyan-500 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                  <Tag className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex gap-2">
                  <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-cyan-400 transition">
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition">
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              <h3 className="text-white font-bold mb-1">Electronics</h3>
              <p className="text-slate-400 text-sm">12 products</p>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
