import api from "./axios";

// ============ Authentication APIs (uses main backend) ============
export const authAPI = {
  // OTP-based authentication (phone)
  sendOTP: (phone) => api.post("/api/auth/send-otp/", { phone }),
  verifyOTP: (phone, code, role) => api.post("/api/auth/verify-otp/", { phone, code, role }),

  // Legacy login methods
  login: (credentials) => api.post("/api/super-admin/login/", credentials), // credentials include role if added
  register: (userData) => api.post("/api/auth/register", userData),
  logout: () => api.post("/api/auth/logout/"),
  refreshToken: () => api.post("/api/auth/refresh/"),
  getCurrentUser: () => api.get("/api/auth/user/"),
};

// ============ Product/Inventory APIs ============
export const productAPI = {
  // Product endpoints
  getAllProducts: (params = {}) => api.get("/api/product/products/", { params }),
  getProduct: (id) => api.get(`/api/product/products/${id}/`),
  createProduct: (productData) => api.post("/api/product/products/", productData),
  updateProduct: (id, productData) => api.put(`/api/product/products/${id}/`, productData),
  deleteProduct: (id) => api.delete(`/api/product/products/${id}/`),
  searchProducts: (query) => api.get(`/api/product/products/?search=${query}`),
  checkStockAlerts: () => api.post("/api/product/check-alerts/"),
};

// ============ Supplier APIs ============
export const supplierAPI = {
  getAllSuppliers: (params = {}) => api.get("/api/purchase/suppliers/", { params }),
  getSupplier: (id) => api.get(`/api/purchase/suppliers/${id}/`),
  createSupplier: (data) => api.post("/api/purchase/suppliers/", data),
  updateSupplier: (id, data) => api.put(`/api/purchase/suppliers/${id}/`, data),
  deleteSupplier: (id) => api.delete(`/api/purchase/suppliers/${id}/`),
};

export const categoryAPI = {
  getAllCategories: () => api.get("/api/product/categories/"),
  createCategory: (data) => api.post("/api/product/categories/", data),
  updateCategory: (id, data) => api.put(`/api/product/categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`/api/product/categories/${id}/`),
};

// ============ Inventory/Stock APIs ============
export const inventoryAPI = {
  // Batch endpoints
  getBatches: (params = {}) => api.get("/api/inventory/batches/", { params }),
  getBatch: (id) => api.get(`/api/inventory/batches/${id}/`),
  createBatch: (batchData) => api.post("/api/inventory/batches/", batchData),
  updateBatch: (id, batchData) => api.put(`/api/inventory/batches/${id}/`, batchData),
  deleteBatch: (id) => api.delete(`/api/inventory/batches/${id}/`),

  // Movement endpoints (stock in/out)
  getMovements: (params = {}) => api.get("/api/inventory/movements/", { params }),
  createMovement: (movementData) => api.post("/api/inventory/movements/", movementData),

  // Stock adjustment
  adjustStock: (adjustmentData) => api.post("/api/inventory/adjust-stock/", adjustmentData),

  // Stock sync and audit
  syncStock: () => api.post("/api/inventory/sync-stock/"),
  getAuditLogs: (params = {}) => api.get("/api/inventory/audit-logs/", { params }),

  // Expired batches
  getExpiredBatches: () => api.get("/api/inventory/expired-batches/"),

  // Low stock alerts
  getLowStockItems: () => api.get("/api/inventory/low-stock/"),
};

// ============ Customer APIs ============
export const customerAPI = {
  getAllCustomers: () => api.get("/api/customers/"),
  getCustomer: (id) => api.get(`/api/customers/${id}/`),
  createCustomer: (customerData) => api.post("/api/customers/", customerData),
  updateCustomer: (id, customerData) => api.put(`/api/customers/${id}/`, customerData),
  deleteCustomer: (id) => api.delete(`/api/customers/${id}/`),
  searchCustomers: (query) => api.get(`/api/customers/search/?q=${query}`),
};

// ============ Sales/Invoice APIs ============
export const salesAPI = {
  getAllSales: () => api.get("/api/billing/invoices/"),
  getSale: (id) => api.get(`/api/billing/invoices/${id}/`),
  createSale: (saleData) => api.post("/api/billing/invoices/", saleData),
  updateSale: (id, saleData) => api.put(`/api/billing/invoices/${id}/`, saleData),
  deleteSale: (id) => api.delete(`/api/billing/invoices/${id}/`),
  getSalesByDate: (startDate, endDate) =>
    api.get(`/api/billing/invoices/?start=${startDate}&end=${endDate}`),
  getSalesByDateRange: (startDate, endDate) =>
    api.get(`/api/billing/invoices/?start=${startDate}&end=${endDate}`),
};

export const invoiceAPI = salesAPI; // Alias for Django naming

// ============ Purchase APIs ============
export const purchaseAPI = {
  getAllPurchases: () => api.get("/api/purchase/orders/"),
  getPurchase: (id) => api.get(`/api/purchase/orders/${id}/`),
  createPurchase: (purchaseData) => api.post("/api/purchase/orders/", purchaseData),
  updatePurchase: (id, purchaseData) => api.put(`/api/purchase/orders/${id}/`, purchaseData),
  deletePurchase: (id) => api.delete(`/api/purchase/orders/${id}/`),
  // Direct Stock Inward
  directStockInward: (data) => api.post("/api/purchase/direct-inward/", data),
};

// ============ Reports APIs ============
export const reportAPI = {
  getSalesReport: (period) => api.get(`/api/reports/sales/?period=${period || 'month'}`),
  getInventoryReport: () => api.get("/api/reports/inventory/"),
  getCustomerReport: () => api.get("/api/reports/customers/"),
  getProfitLossReport: (period) => api.get(`/api/reports/profit-loss/?period=${period || 'month'}`),
  getTaxReport: () => api.get("/api/reports/tax/"),
  exportReport: (type, format) =>
    api.get(`/api/reports/${type}/export/?format=${format}`, { responseType: "blob" }),
};

// ============ Payments API ============
export const paymentAPI = {
  getAllPayments: () => api.get("/api/payments/"),
  getPayment: (id) => api.get(`/api/payments/${id}/`),
  createPayment: (paymentData) => api.post("/api/payments/", paymentData),
  updatePayment: (id, paymentData) => api.put(`/api/payments/${id}/`, paymentData),
  deletePayment: (id) => api.delete(`/api/payments/${id}/`),
};

// ============ Dashboard/Analytics APIs ============
export const dashboardAPI = {
  getOverview: () => api.get("/api/dashboard/overview/"),
  getAnalytics: (period) => api.get(`/api/dashboard/analytics/${period ? `?period=${period}` : ''}`),
  getSalesAnalytics: (period) => api.get(`/api/dashboard/sales/?period=${period}`),
  getTopProducts: (limit = 10) => api.get(`/api/dashboard/top-products/?limit=${limit}`),
  getRecentTransactions: (limit = 10) => api.get(`/api/dashboard/recent/?limit=${limit}`),
};

// ============ User/Settings APIs ============
export const userAPI = {
  getProfile: () => api.get("/api/users/profile"),
  updateProfile: (profileData) => api.put("/api/users/profile", profileData),
  changePassword: (passwordData) => api.put("/api/users/change-password", passwordData),
  getSettings: () => api.get("/api/users/settings"),
  updateSettings: (settings) => api.put("/api/users/settings", settings),
};

export const staffAPI = {
  getAllStaff: () => api.get("/api/users/staff/"),
  getStaff: (id) => api.get(`/api/users/staff/${id}/`),
  createStaff: (staffData) => api.post("/api/users/staff/", staffData),
  updateStaff: (id, staffData) => api.patch(`/api/users/staff/${id}/`, staffData),
  deleteStaff: (id) => api.delete(`/api/users/staff/${id}/`),
};

// ============ Warehouse/Stock APIs ============
export const warehouseAPI = {
  getStockLevels: () => api.get("/warehouse/stock"),
  getAllStock: () => api.get("/warehouse/stock"),
  getStockByWarehouse: (warehouseId) => api.get(`/warehouse/${warehouseId}/stock`),
  updateStock: (id, stockData) => api.put(`/warehouse/stock/${id}`, stockData),
  getLowStockAlerts: () => api.get("/warehouse/low-stock"),
  getLowStockItems: () => api.get("/warehouse/stock/low"),
  getStockMovements: (params) => api.get("/warehouse/movements", { params }),
};

// ============ Audit/Logs APIs ============
export const auditAPI = {
  getAuditLogs: () => api.get("/audit/logs"),
  getUserActivity: (userId) => api.get(`/audit/activity/${userId}`),
  getActivityLog: (userId) => api.get(`/audit/activity/${userId}`),
};

// ============ Super Admin APIs ============
export const superAdminAPI = {
  // User Management
  getAllUsers: (params = {}) => api.get("/api/super-admin/users/", { params }),
  getUser: (id) => api.get(`/api/super-admin/users/${id}/`),
  createUser: (userData) => api.post("/api/super-admin/users/", userData),
  updateUser: (id, userData) => api.put(`/api/super-admin/users/${id}/`, userData),
  deleteUser: (id) => api.delete(`/api/super-admin/users/${id}/`),

  // User Status Management
  suspendUser: (id) => api.post(`/api/super-admin/users/${id}/suspend/`),
  activateUser: (id) => api.post(`/api/super-admin/users/${id}/activate/`),
  makeSuperAdmin: (id) => api.post(`/api/super-admin/users/${id}/make_super_admin/`),
  revokeSuperAdmin: (id) => api.post(`/api/super-admin/users/${id}/revoke_super_admin/`),

  // System Settings
  getSettings: () => api.get("/api/super-admin/settings/"),
  updateSettings: (settingsData) => api.put("/api/super-admin/settings/", settingsData),
  updateGstTax: (gstTaxData) => api.post("/api/super-admin/settings/update_gst_tax/", gstTaxData),

  // Activity Logs
  getActivityLogs: (params = {}) => api.get("/api/super-admin/logs/", { params }),

  // Units Management
  getAllUnits: () => api.get("/api/super-admin/units/"),
  getUnit: (id) => api.get(`/api/super-admin/units/${id}/`),
  createUnit: (unitData) => api.post("/api/super-admin/units/", unitData),
  updateUnit: (id, unitData) => api.put(`/api/super-admin/units/${id}/`, unitData),
  deleteUnit: (id) => api.delete(`/api/super-admin/units/${id}/`),

};

// ============ Support APIs ============
export const supportAPI = {
  getAllTickets: () => api.get("/api/support/tickets/"),
  getTicket: (id) => api.get(`/api/support/tickets/${id}/`),
  createTicket: (data) => api.post("/api/support/tickets/", data),
  deleteTicket: (id) => api.delete(`/api/support/tickets/${id}/`),
  replyToTicket: (id, data) => api.post(`/api/support/tickets/${id}/reply/`, data),
  updateStatus: (id, data) => api.post(`/api/support/tickets/${id}/update_status/`, data),
  escalateTicket: (id) => api.post(`/api/support/tickets/${id}/escalate/`),
  // Notifications
  getNotifications: () => api.get("/api/support/notifications/"),
  markRead: (id) => api.post(`/api/support/notifications/${id}/mark_read/`),
  markAllRead: () => api.post("/api/support/notifications/mark_all_read/"),
};

// ============ Discount APIs ============
export const discountAPI = {
  // Rules
  getAllRules: () => api.get("/api/billing/discount-rules/"),
  getRule: (id) => api.get(`/api/billing/discount-rules/${id}/`),
  createRule: (data) => api.post("/api/billing/discount-rules/", data),
  updateRule: (id, data) => api.put(`/api/billing/discount-rules/${id}/`, data),
  deleteRule: (id) => api.delete(`/api/billing/discount-rules/${id}/`),

  // Logs
  getLogs: (params = {}) => api.get("/api/billing/discount-logs/", { params }),
};

// Export default api instance as well
export default api;
