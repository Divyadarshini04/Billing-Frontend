import React, { useState, useEffect } from "react";
import { categoryAPI } from "../api/apiService";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Search, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";

export default function CategoryManagementPage() {
  const { userRole } = useAuth();
  const { addNotification } = useContext(NotificationContext);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editing, setEditing] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#3B82F6"
  });

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories();
      const categoriesData = response.data?.results || response.data || [];
      setCategories(categoriesData);
    } catch (error) {
      // Fallback empty or error notification could be added here
      addNotification("error", "Error", "Failed to load categories");
    }
  };

  const filtered = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function addCategory() {
    if (!newCategory.name.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      const response = await categoryAPI.createCategory(newCategory);
      if (response.data) {
        setCategories([...categories, response.data]);
        addNotification("product", "Category Added", `${newCategory.name} category added successfully`);
        setNewCategory({ name: "", description: "", color: "#3B82F6" });
        setShowAddModal(false);
      }
    } catch (error) {
      addNotification("error", "Error", "Failed to add category");
    }
  }

  async function updateCategory(updated) {
    try {
      const response = await categoryAPI.updateCategory(updated.id, updated);
      if (response.data) {
        setCategories(categories.map(cat => cat.id === updated.id ? response.data : cat));
        addNotification("product", "Category Updated", `${updated.name} category updated successfully`);
        setEditing(null);
      }
    } catch (error) {
      addNotification("error", "Error", "Failed to update category");
    }
  }

  async function deleteCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!window.confirm(`Delete "${category?.name}" category? This cannot be undone.`)) {
      return;
    }

    try {
      await categoryAPI.deleteCategory(id);
      setCategories(categories.filter(cat => cat.id !== id));
      addNotification("product", "Category Deleted", `${category?.name} category has been removed`);
    } catch (error) {
      addNotification("error", "Error", "Failed to delete category");
    }
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark-bg p-4 md:p-8 transition-colors">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Product Categories</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your product categories</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </motion.button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 bg-white dark:bg-dark-card rounded-lg px-4 py-3 border border-gray-200 dark:border-dark-border shadow-sm">
          <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 flex-1"
          />
        </div>
      </motion.div>

      {/* Categories Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filtered.map((category, idx) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: category.color + "20" }}
                >
                  <Package className="w-6 h-6" style={{ color: category.color }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{category.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditing(category)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => deleteCategory(category.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: category.color }}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{category.color}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No categories found</p>
        </motion.div>
      )}

      {/* Edit Modal */}
      {editing && (
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
            className="bg-white dark:bg-dark-card rounded-lg p-8 max-w-md w-full shadow-xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Category</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    className="w-16 h-10 rounded-lg border-2 border-gray-300 dark:border-dark-border cursor-pointer"
                    value={editing.color}
                    onChange={(e) => setEditing({ ...editing, color: e.target.value })}
                  />
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editing.color}
                    onChange={(e) => setEditing({ ...editing, color: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateCategory(editing)}
                className="flex-1 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors"
              >
                Save Changes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditing(null)}
                className="flex-1 py-3 rounded-lg border-2 border-gray-300 dark:border-dark-border text-gray-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-dark-card rounded-lg p-8 max-w-md w-full shadow-xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Category</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g., Main Course"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="e.g., Main dishes and curries"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    className="w-16 h-10 rounded-lg border-2 border-gray-300 dark:border-dark-border cursor-pointer"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  />
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addCategory}
                className="flex-1 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors"
              >
                Add Category
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-lg border-2 border-gray-300 dark:border-dark-border text-gray-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
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
