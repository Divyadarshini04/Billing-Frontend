import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, TrendingUp, ShoppingCart, Package, Search, Filter } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";
import { useAuth } from "../context/AuthContext";
import { useExportSuccess } from "../context/ExportSuccessContext";
import { salesAPI, productAPI } from "../api/apiService";

export default function ItemwiseSalesReportPage() {
  const { userRole } = useAuth();
  const exportSuccess = useExportSuccess();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("revenue");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [itemSales, setItemSales] = useState([]);

  // Fetch data from API
  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesResponse, productsResponse] = await Promise.all([
        salesAPI.getAllSales(),
        productAPI.getAllProducts()
      ]);

      if (salesResponse.data && productsResponse.data) {
        const invoices = salesResponse.data;
        const products = productsResponse.data;
        const itemMap = {};

        invoices.forEach(inv => {
          const items = inv.items || [];
          items.forEach(item => {
            const key = item.productName || item.name;
            if (!itemMap[key]) {
              const product = products.find(p => p.name === key);
              itemMap[key] = {
                name: key,
                category: product?.category?.name || product?.category || "General",
                sku: product?.product_code || product?.sku || "N/A",
                qty: 0,
                unitPrice: item.price || item.sellingPrice || 0,
                totalRevenue: 0,
                avgPrice: 0,
                transactions: 0
              };
            }
            itemMap[key].qty += item.quantity || 1;
            itemMap[key].totalRevenue += (item.price || item.sellingPrice || 0) * (item.quantity || 1);
            itemMap[key].transactions += 1;
            itemMap[key].avgPrice = itemMap[key].totalRevenue / itemMap[key].qty;
          });
        });

        setItemSales(Object.values(itemMap));
      }
    } catch (error) {

    }
  };

  const categories = ["All", ...new Set(itemSales.map(item => item.category))];

  const filteredItems = itemSales
    .filter(item =>
      (categoryFilter === "All" || item.category === categoryFilter) &&
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "revenue") return b.totalRevenue - a.totalRevenue;
      if (sortBy === "quantity") return b.qty - a.qty;
      if (sortBy === "price") return b.avgPrice - a.avgPrice;
      if (sortBy === "transactions") return b.transactions - a.transactions;
      return 0;
    });

  const topItems = filteredItems.slice(0, 10);
  const totalRevenue = filteredItems.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalQuantity = filteredItems.reduce((sum, item) => sum + item.qty, 0);
  const totalTransactions = filteredItems.reduce((sum, item) => sum + item.transactions, 0);
  const avgPrice = filteredItems.length > 0 ? totalRevenue / totalQuantity : 0;

  // Export Item-wise Sales Report to Excel
  function handleExportReport() {
    try {
      const workbook = XLSX.utils.book_new();

      // Item-wise detailed data
      const itemData = filteredItems.map(item => ({
        "Product Name": item.name,
        Category: item.category,
        SKU: item.sku,
        "Quantity Sold": item.qty,
        "Unit Price": `₹${item.unitPrice}`,
        "Avg Price": `₹${item.avgPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
        "Total Revenue": `₹${item.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
        "Transactions": item.transactions
      }));
      const itemSheet = XLSX.utils.json_to_sheet(itemData);
      XLSX.utils.book_append_sheet(workbook, itemSheet, "Item-wise Sales");

      // Top 10 Items
      const topData = topItems.map(item => ({
        "Product Name": item.name,
        "Quantity Sold": item.qty,
        "Total Revenue": `₹${item.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
      }));
      const topSheet = XLSX.utils.json_to_sheet(topData);
      XLSX.utils.book_append_sheet(workbook, topSheet, "Top 10 Items");

      // Summary
      const summaryData = [{
        "Total Items Sold": totalQuantity,
        "Total Revenue": `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
        "Average Price": `₹${avgPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
        "Unique Items": filteredItems.length,
        "Total Transactions": totalTransactions,
        "Date Generated": new Date().toLocaleDateString()
      }];
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

      XLSX.writeFile(workbook, `itemwise_sales_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      exportSuccess.showExportSuccess("Item-wise sales report exported successfully!");
    } catch (error) {
      exportSuccess.showExportSuccess("Error exporting file: " + error.message);
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
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Item-wise Sales Report</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Detailed product performance and sales analysis</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportReport}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export
          </motion.button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-lg transition-all"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Revenue</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -4 }}
          className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-lg transition-all"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Quantity</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{totalQuantity}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -4 }}
          className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-lg transition-all"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Avg Price</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            ₹{avgPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -4 }}
          className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-lg transition-all"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Unique Items</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{filteredItems.length}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -4 }}
          className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-lg transition-all"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Transactions</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{totalTransactions}</h3>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top 10 Items Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Top 10 Products by Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topItems} margin={{ top: 5, right: 30, left: 0, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                angle={-45}
                textAnchor="end"
                height={120}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#6B7280" />
              <Tooltip contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E5E7EB", borderRadius: "8px" }} />
              <Bar dataKey="totalRevenue" fill="#10B981" name="Revenue (₹)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categories.map(cat => ({
                  name: cat,
                  value: cat === "All" ? 0 : itemSales.filter(i => i.category === cat).reduce((sum, i) => sum + i.totalRevenue, 0)
                })).filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ₹${(value / 1000).toFixed(0)}K`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'].map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm mb-8"
      >
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-64 bg-gray-100 dark:bg-dark-bg rounded-lg px-4 py-2">
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 w-full"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="revenue">Sort by Revenue</option>
            <option value="quantity">Sort by Quantity</option>
            <option value="price">Sort by Price</option>
            <option value="transactions">Sort by Transactions</option>
          </select>
        </div>
      </motion.div>

      {/* Item-wise Sales Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm"
      >
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Item-wise Sales Details ({filteredItems.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-bg border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Product Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Category</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">SKU</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">Qty Sold</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">Unit Price</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">Avg Price</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">Total Revenue</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">Transactions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item, idx) => (
                <motion.tr
                  key={item.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{item.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{item.sku}</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">{item.qty}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-gray-300">₹{item.unitPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-gray-300">₹{item.avgPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-green-600 dark:text-green-400">₹{item.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-300">{item.transactions}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No items found matching your filters
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
