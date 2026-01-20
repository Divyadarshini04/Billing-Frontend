import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import { useExportSuccess } from "../context/ExportSuccessContext";
import { customerAPI, invoiceAPI } from "../api/apiService";
// eslint-disable-next-line no-unused-vars
import { Plus, Edit2, Trash2, Search, Mail, Phone, CheckCircle, Clock, AlertCircle, Download, Upload, Calendar } from "lucide-react";

export default function CustomersPage() {
  const { userRole } = useAuth();
  const { hasPermission } = usePermissions();
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]); // For creating financial summaries
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateFilterActive, setDateFilterActive] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState(null);
  const exportSuccess = useExportSuccess();
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true); // Assume true initially

  // Fetch customers and invoices from backend on mount
  useEffect(() => {
    fetchData();

    // Listen for customer added event from POS Billing page
    const handleCustomerAdded = (event) => {
      fetchData(); // Refresh customer list
    };

    window.addEventListener("customerAdded", handleCustomerAdded);

    return () => {
      window.removeEventListener("customerAdded", handleCustomerAdded);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchCustomers(), fetchInvoices()]);
    setLoading(false);
  };

  async function fetchCustomers() {
    try {
      const response = await customerAPI.getAllCustomers();

      // Django Rest Framework Pagination returns { results: [], count: ... }
      // Or standard list [ ... ]
      // Or { data: ... } wrapper
      let customersData = response.data?.results || response.data?.data || response.data;

      // If it's nested like {customers: [...]}, extract the array
      if (customersData && !Array.isArray(customersData) && customersData.customers) {
        customersData = customersData.customers;
      }

      if (Array.isArray(customersData)) {
        // Map backend fields to frontend expected fields
        const mappedCustomers = customersData.map(c => {
          // Parse joined_date properly - handle both ISO strings and date strings
          let joinedDate = '';
          if (c.joined_date) {
            joinedDate = typeof c.joined_date === 'string' ? c.joined_date.split('T')[0] : new Date(c.joined_date).toISOString().split('T')[0];
          } else if (c.created_at) {
            joinedDate = typeof c.created_at === 'string' ? c.created_at.split('T')[0] : new Date(c.created_at).toISOString().split('T')[0];
          } else {
            joinedDate = new Date().toISOString().split('T')[0];
          }

          return {
            ...c,
            joined: joinedDate,
            isActive: c.status === 'active'
          };
        });
        setCustomers(mappedCustomers);
        setBackendConnected(true);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      setBackendConnected(false);
      showNotification("Failed to load customers from server", "error");
    }
  }

  async function fetchInvoices() {
    try {
      const response = await invoiceAPI.getAllSales();
      // Handle pagination or wrapper
      let salesData = response.data?.results || response.data?.data || response.data;
      if (Array.isArray(salesData)) {
        setInvoices(salesData);
      }
    } catch (error) {
    }
  }

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    joined: new Date().toISOString().split("T")[0],
    spent: "",
    totalBills: "",
    pendingAmount: "",
    billStatus: "Pending",
    isActive: true,
  });

  // Show notification for a few seconds
  const showNotification = (message, type = "success") => {
    // Ensure message is always a string
    const messageStr = typeof message === 'string' ? message : String(message);
    setNotification({ message: messageStr, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Get customer financial data - use entered data if available, otherwise calculate from invoices
  function enrichCustomerWithInvoiceData(customer) {
    try {
      // First, always try to calculate from invoices (most accurate)
      // Match by ID (preferred) or Name (fallback)
      // Convert both to strings for comparison to handle ID type mismatches
      const customerInvoices = invoices.filter(inv => {
        const invCustomerId = String(inv.customer || inv.customer_id || '').toLowerCase().trim();
        const custId = String(customer.id || '').toLowerCase().trim();
        const custName = (customer.name || '').toLowerCase().trim();
        const invCustomerName = (inv.customer_name || inv.customer?.name || '').toLowerCase().trim();

        // Match by ID first (most reliable)
        if (invCustomerId && custId && invCustomerId === custId) {
          return true;
        }
        // Then try name matching
        if (custName && invCustomerName && invCustomerName === custName) {
          return true;
        }
        return false;
      });

      // Calculate totals from actual invoices using correct API fields
      // Use total_amount for total, paid_amount for paid
      const totalSpent = customerInvoices.reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0);
      const paidAmount = customerInvoices.reduce((sum, inv) => sum + (parseFloat(inv.paid_amount) || 0), 0);
      const pendingAmount = totalSpent - paidAmount;

      // Determine status based on pending amount
      let derivedStatus = "Paid";
      if (pendingAmount > 0) {
        derivedStatus = "Pending";
      }

      // If we have calculated invoice data, use it
      if (customerInvoices.length > 0) {
        const formattedTotal = `₹${Math.max(0, totalSpent).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
        const formattedPending = `₹${Math.max(0, pendingAmount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
        const formattedPaid = `₹${Math.max(0, paidAmount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

        return {
          ...customer,
          spent: formattedTotal,
          totalBills: formattedTotal,
          paidAmount: formattedPaid,
          pendingAmount: formattedPending,
          billStatus: derivedStatus,
          invoiceCount: customerInvoices.length
        };
      }

      // Fallback: If customer has manually entered financial data and NO invoices found
      if (customer.totalBills && customer.totalBills !== "" && customer.totalBills !== "₹0") {

        return {
          ...customer,
          spent: customer.spent || customer.totalBills,
          totalBills: customer.totalBills,
          paidAmount: customer.paidAmount || "₹0",
          pendingAmount: customer.pendingAmount || "₹0",
          billStatus: customer.billStatus || "Pending"
        };
      }

      // No invoices and no entered data

      return {
        ...customer,
        spent: "₹0", // Clean default instead of text
        totalBills: "₹0",
        paidAmount: "₹0",
        pendingAmount: "₹0",
        billStatus: "Paid", // Default to good standing
        invoiceCount: 0
      };
    } catch (e) {
      return {
        ...customer,
        spent: customer.spent || "₹0",
        totalBills: customer.totalBills || "₹0",
        paidAmount: customer.paidAmount || "₹0",
        pendingAmount: customer.pendingAmount || "₹0",
        billStatus: customer.billStatus || "Paid",
        invoiceCount: 0
      };
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case "Paid":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          icon: CheckCircle,
          label: "Paid",
        };
      case "Pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          icon: Clock,
          label: "Pending",
        };
      case "Due":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          icon: AlertCircle,
          label: "Due",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          icon: Clock,
          label: "Unknown",
        };
    }
  }

  const filtered = Array.isArray(customers) ? customers.filter((c) => {
    const matchesSearch = (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));

    // Only apply date filtering if it's active
    let matchesDate = true;
    if (dateFilterActive && c.joined) {
      const customerDate = new Date(c.joined);
      matchesDate =
        customerDate.getDate() === selectedDate.getDate() &&
        customerDate.getMonth() === selectedDate.getMonth() &&
        customerDate.getFullYear() === selectedDate.getFullYear();
    }

    return matchesSearch && matchesDate;
  }) : [];

  async function saveCustomer(updated) {
    try {
      // Find the original customer to check if status changed
      const originalCustomer = customers.find(c => c.id === updated.id);
      const originalStatus = originalCustomer?.isActive;
      const newStatus = updated.isActive;

      // Check if ONLY status is changing (not name, email, phone)
      const isStatusOnlyChange =
        originalCustomer &&
        originalCustomer.name === updated.name &&
        originalCustomer.email === updated.email &&
        originalCustomer.phone === updated.phone &&
        originalStatus !== newStatus;

      // Prepared payload
      const payload = {
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        status: updated.isActive ? 'active' : 'inactive',
        // Preserve other fields if needed, but remove UI-only ones like spent/totalBills if they are not in model
      };

      const response = await customerAPI.updateCustomer(updated.id, payload);
      const data = response.data?.data || response.data;
      if (data) {
        // Parse joined_date properly
        let joinedDate = '';
        if (data.joined_date) {
          joinedDate = typeof data.joined_date === 'string' ? data.joined_date.split('T')[0] : new Date(data.joined_date).toISOString().split('T')[0];
        } else if (data.created_at) {
          joinedDate = typeof data.created_at === 'string' ? data.created_at.split('T')[0] : new Date(data.created_at).toISOString().split('T')[0];
        }

        // Map back
        const mappedData = {
          ...data,
          isActive: data.status === 'active',
          joined: joinedDate || updated.joined
        };
        const updatedCustomers = customers.map((it) => (it.id === updated.id ? mappedData : it));
        setCustomers(updatedCustomers);

        // Show context-specific notification
        if (isStatusOnlyChange) {
          if (newStatus) {
            showNotification(`✅ Successfully activated`);
          } else {
            showNotification(`⚠️ Successfully deactivated`);
          }
        } else {
          showNotification(`✅ Updated successfully`);
        }
      }
      setEditing(null);
    } catch (error) {
      showNotification("Failed to update customer", "error");
    }
  }

  function deleteCustomer(id) {
    const customer = customers.find(c => c.id === id);
    setDeleteConfirm({ id, name: customer?.name });
  }

  async function confirmDelete(id) {
    const customer = customers.find(c => c.id === id);
    const customerName = customer?.name;

    try {
      const response = await customerAPI.deleteCustomer(id);

      const updatedCustomers = customers.filter((it) => it.id !== id);
      setCustomers(updatedCustomers);
      showNotification(`${customerName} deleted successfully`, "success");
    } catch (error) {

      let errorMessage = "Failed to delete customer";

      if (error.response?.status === 403) {
        errorMessage = "You don't have permission to delete this customer";
      } else if (error.response?.status === 404) {
        errorMessage = "Customer not found";
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showNotification(errorMessage, "error");
    }
    setDeleteConfirm(null);
  }

  async function addNewCustomer() {
    const phoneVal = newCustomer.phone.trim();
    const nameVal = newCustomer.name.trim();
    const emailVal = newCustomer.email.trim();

    if (!nameVal || !phoneVal) {
      showNotification("⚠️ Please fill in required fields (Name and Phone)", "error");
      return;
    }

    const payload = {
      name: nameVal,
      phone: phoneVal,
      customer_type: 'retail', // Default
    };

    // Add optional fields only if provided
    if (emailVal) {
      payload.email = emailVal;
    }

    try {
      const response = await customerAPI.createCustomer(payload);

      const data = response.data?.data || response.data;
      if (data) {
        // Parse joined_date properly
        let joinedDate = '';
        if (data.joined_date) {
          joinedDate = typeof data.joined_date === 'string' ? data.joined_date.split('T')[0] : new Date(data.joined_date).toISOString().split('T')[0];
        } else {
          joinedDate = new Date().toISOString().split('T')[0];
        }

        const mappedData = {
          ...data,
          joined: joinedDate,
          isActive: data.status === 'active'
        };
        const updatedCustomers = [mappedData, ...customers]; // Add to top
        setCustomers(updatedCustomers);
        showNotification(`✅ Customer "${data.name}" added successfully!`, "success");

        // Reset form
        setNewCustomer({
          name: "",
          email: "",
          phone: "",
          joined: new Date().toISOString().split("T")[0],
          spent: "",
          totalBills: "",
          pendingAmount: "",
          billStatus: "Pending",
          isActive: true,
        });
        setShowAddModal(false);

        // Dispatch event for POS Billing page to update
        window.dispatchEvent(new CustomEvent("customerAdded", {
          detail: { customer: mappedData }
        }));
      }
    } catch (error) {
      let errorMessage = "Failed to create customer";

      // Helper function to extract error message from field
      const extractFieldError = (fieldErrors) => {
        if (!fieldErrors) return null;
        if (Array.isArray(fieldErrors)) {
          return fieldErrors.map(e => {
            // If it's an object, get the message property
            if (typeof e === 'object' && e.message) return e.message;
            if (typeof e === 'object' && e.detail) return e.detail;
            // Otherwise just convert to string
            return String(e);
          }).join(", ");
        }
        // If it's an object, try to get message
        if (typeof fieldErrors === 'object') {
          if (fieldErrors.message) return fieldErrors.message;
          if (fieldErrors.detail) return fieldErrors.detail;
          return JSON.stringify(fieldErrors);
        }
        return String(fieldErrors);
      };

      // Check for field-specific errors in response data
      const errorData = error.response?.data;

      if (errorData?.phone) {
        errorMessage = `Phone: ${extractFieldError(errorData.phone)}`;
      } else if (errorData?.gstin) {
        errorMessage = `GSTIN: ${extractFieldError(errorData.gstin)}`;
      } else if (errorData?.email) {
        errorMessage = `Email: ${extractFieldError(errorData.email)}`;
      } else if (errorData?.name) {
        errorMessage = `Name: ${extractFieldError(errorData.name)}`;
      } else if (errorData?.customer_type) {
        errorMessage = `Customer Type: ${extractFieldError(errorData.customer_type)}`;
      } else if (errorData?.detail) {
        // General detail error (could be string or object)
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map(e => {
            return typeof e === 'object' ? JSON.stringify(e) : String(e);
          }).join("; ");
        } else if (typeof errorData.detail === 'object') {
          errorMessage = JSON.stringify(errorData.detail);
        } else {
          errorMessage = String(errorData.detail);
        }
      } else if (errorData?.non_field_errors) {
        errorMessage = extractFieldError(errorData.non_field_errors);
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof errorData === 'object') {
        // Fallback: try to extract any error from the data object
        const firstErrorKey = Object.keys(errorData).find(key =>
          errorData[key] && (typeof errorData[key] === 'string' || Array.isArray(errorData[key]))
        );
        if (firstErrorKey) {
          errorMessage = `${firstErrorKey}: ${extractFieldError(errorData[firstErrorKey])}`;
        }
      }

      showNotification(`Failed to add customer: ${errorMessage}`, "error");
    }
  }

  const exportCustomersToCSV = () => {
    try {
      const data = customers.map(c => ({
        ID: c.id,
        Name: c.name,
        Email: c.email,
        Phone: c.phone,
        Spent: c.spent,
        "Joined Date": c.joined,
        "Bill Status": c.billStatus,
        "Total Bills": c.totalBills,
        "Pending Amount": c.pendingAmount,
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

      // Set column widths
      worksheet["!cols"] = [
        { wch: 12 },
        { wch: 20 },
        { wch: 25 },
        { wch: 18 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];

      const timestamp = new Date().toISOString().split("T")[0];
      XLSX.writeFile(workbook, `customers_${timestamp}.xlsx`);
      try { exportSuccess.showExportSuccess(`${customers.length} customers exported`); } catch (e) { }
    } catch (error) {
      showNotification("❌ Error exporting customers to CSV", "error");
    }
  };

  const importCustomersFromCSV = (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          showNotification("⚠️ CSV file is empty", "error");
          return;
        }

        const importedCustomers = jsonData.map(row => ({
          id: row.ID || `c${Date.now()}_${Math.random()}`,
          name: row.Name || "",
          email: row.Email || "",
          phone: row.Phone || "",
          spent: row.Spent || "₹0",
          joined: row["Joined Date"] || new Date().toISOString().split("T")[0],
          billStatus: row["Bill Status"] || "Pending",
          totalBills: row["Total Bills"] || "₹0",
          pendingAmount: row["Pending Amount"] || "₹0",
        }));

        // Filter out invalid entries
        const validCustomers = importedCustomers.filter(c => c.name && c.email && c.phone);

        if (validCustomers.length === 0) {
          showNotification("⚠️ No valid customers found in CSV file", "error");
          return;
        }

        // Merge with existing (avoid duplicates by ID)
        const existingIds = new Set(customers.map(c => c.id));
        const newCustomers = validCustomers.filter(c => !existingIds.has(c.id));

        setCustomers([...customers, ...newCustomers]);
        try { exportSuccess.showExportSuccess(`${newCustomers.length} customers imported`); } catch (e) { }
      };

      reader.readAsArrayBuffer(file);
      event.target.value = "";
    } catch (error) {
      showNotification("❌ Error importing customers from CSV", "error");
    }
  };

  // Check if user has permission to view customers
  if (!hasPermission(userRole, 'view_customers')) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark-bg p-4 md:p-8 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2">Access Denied</h2>
          <p className="text-red-700 dark:text-red-300">You don't have permission to view customers. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark-bg p-4 md:p-8 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Customers</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your customer relationships</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {userRole !== "SALES_EXECUTIVE" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-xl font-bold hover:shadow-lg transition-shadow"
              >
                <Plus className="w-5 h-5" />
                Add Customer
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportCustomersToCSV}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-shadow hover:shadow-lg"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-shadow hover:shadow-lg cursor-pointer"
              onClick={() => document.getElementById("csv-import-input").click()}
            >
              <Upload className="w-5 h-5" />
              Import CSV
            </motion.button>
            <input
              id="csv-import-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={importCustomersFromCSV}
              className="hidden"
            />
          </div>
        </div>
      </motion.div>

      {/* Search Bar with Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Date Selector */}
        <div className="flex gap-2 items-center flex-shrink-0">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={String(selectedDate.getDate())}
            onChange={(e) => {
              const newDate = new Date(selectedDate);
              newDate.setDate(parseInt(e.target.value));
              setSelectedDate(newDate);
              setDateFilterActive(true);
            }}
            className="px-2 py-3 rounded-lg border border-blue-200 dark:border-dark-border bg-white dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium w-16"
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
              <option key={day} value={String(day)}>{day}</option>
            ))}
          </select>
          <select
            value={String(selectedDate.getMonth())}
            onChange={(e) => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(parseInt(e.target.value));
              setSelectedDate(newDate);
              setDateFilterActive(true);
            }}
            className="px-2 py-3 rounded-lg border border-blue-200 dark:border-dark-border bg-white dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium w-20"
          >
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => (
              <option key={idx} value={String(idx)}>{month}</option>
            ))}
          </select>
          <select
            value={String(selectedDate.getFullYear())}
            onChange={(e) => {
              const newDate = new Date(selectedDate);
              newDate.setFullYear(parseInt(e.target.value));
              setSelectedDate(newDate);
              setDateFilterActive(true);
            }}
            className="px-2 py-3 rounded-lg border border-blue-200 dark:border-dark-border bg-white dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium w-20"
          >
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
              <option key={year} value={String(year)}>{year}</option>
            ))}
          </select>
          <button
            onClick={() => setDateFilterActive(false)}
            className="px-3 py-3 rounded-lg bg-blue-200 hover:bg-blue-300 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200 text-sm font-medium transition-colors"
          >
            Clear
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(filtered) ? filtered.map((customer, idx) => {
          // Skip if customer is not a valid object with required properties
          if (!customer || typeof customer !== 'object' || !customer.id) {
            return null;
          }
          // Enrich customer with real invoice data
          const enrichedCustomer = enrichCustomerWithInvoiceData(customer);
          return (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -8 }}
              className="bg-white dark:bg-dark-card rounded-2xl border border-blue-200 dark:border-dark-border shadow-md hover:shadow-xl p-6 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{enrichedCustomer.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{enrichedCustomer.joined}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {(() => {
                    const statusInfo = getStatusBadge(enrichedCustomer.billStatus);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.bg} ${statusInfo.text}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {statusInfo.label}
                      </motion.div>
                    );
                  })()}
                  {userRole !== "SALES_EXECUTIVE" && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditing(customer)}
                        className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => deleteCustomer(customer.id)}
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{enrichedCustomer.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{enrichedCustomer.phone}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-dark-border space-y-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total Spent</p>
                  <p className="text-2xl font-bold text-primary mt-1">{enrichedCustomer.spent}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-gray-50 dark:bg-dark-bg p-2 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400">Paid</p>
                    <p className="font-bold text-green-700 dark:text-green-400 mt-1">{enrichedCustomer.paidAmount || "₹0"}</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg border border-orange-200 dark:border-orange-700">
                    <p className="text-orange-700 dark:text-orange-400">Pending</p>
                    <p className="font-bold text-orange-900 dark:text-orange-300 mt-1">{enrichedCustomer.pendingAmount || "₹0"}</p>
                  </div>
                  <div className={`p-2 rounded-lg border-2 ${enrichedCustomer.billStatus === "Paid" ? "bg-green-50 dark:bg-green-900/20 border-green-300" : "bg-blue-50 dark:bg-blue-900/20 border-blue-300"}`}>
                    <p className={`font-semibold text-xs ${enrichedCustomer.billStatus === "Paid" ? "text-green-700 dark:text-green-400" : "text-blue-700 dark:text-blue-400"}`}>
                      Status
                    </p>
                    <p className={`font-bold text-xs mt-1 ${enrichedCustomer.billStatus === "Paid" ? "text-green-900 dark:text-green-300" : "text-blue-900 dark:text-blue-300"}`}>
                      {enrichedCustomer.billStatus === "Paid" ? "✓ Clear" : "⚠️ Due"}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-dark-border">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      // Optimistic update
                      const updatedCustomer = { ...enrichedCustomer, isActive: !enrichedCustomer.isActive };
                      saveCustomer(updatedCustomer);
                    }}
                    className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${enrichedCustomer.isActive
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50"
                      : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                  >
                    {enrichedCustomer.isActive ? "✓ Active" : "Inactive"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        }) : null}
      </div>

      {/* Edit Modal */}
      {editing && userRole !== "SALES_EXECUTIVE" && (
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
            className="bg-white dark:bg-dark-card rounded-2xl p-8 max-w-md w-full shadow-xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Customer</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Customer Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editing.phone}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bill Status</label>
                <select
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editing.billStatus}
                  onChange={(e) => setEditing({ ...editing, billStatus: e.target.value })}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Due">Due</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Total Bills</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg dark:text-gray-500 focus:outline-none cursor-not-allowed opacity-60"
                  value={editing.totalBills}
                  disabled
                  placeholder="Auto-calculated from invoices"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Pending Amount</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg dark:text-gray-500 focus:outline-none cursor-not-allowed opacity-60"
                  value={editing.pendingAmount}
                  disabled
                  placeholder="Auto-calculated from invoices"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => saveCustomer(editing)}
                className="flex-1 py-3 rounded-xl bg-gradient-primary text-white font-bold hover:shadow-lg transition-shadow"
              >
                Save Changes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEditing(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-dark-border text-gray-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && userRole !== "SALES_EXECUTIVE" && (
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
            className="bg-white dark:bg-dark-card rounded-2xl p-8 max-w-md w-full shadow-xl max-h-96 overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Customer</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Customer Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="e.g., ABC Restaurant"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email (Optional)</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="e.g., customer@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Joined Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newCustomer.joined}
                  onChange={(e) => setNewCustomer({ ...newCustomer, joined: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone *</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="e.g., +91 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bill Status</label>
                <select
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newCustomer.billStatus}
                  onChange={(e) => setNewCustomer({ ...newCustomer, billStatus: e.target.value })}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Due">Due</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Total Bills</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg dark:text-gray-500 focus:outline-none cursor-not-allowed opacity-60"
                  value={newCustomer.totalBills}
                  disabled
                  placeholder="Auto-calculated from invoices"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Pending Amount</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg dark:text-gray-500 focus:outline-none cursor-not-allowed opacity-60"
                  value={newCustomer.pendingAmount}
                  disabled
                  placeholder="Auto-calculated from invoices"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addNewCustomer}
                className="flex-1 py-3 rounded-xl bg-gradient-primary text-white font-bold hover:shadow-lg transition-shadow"
              >
                Add Customer
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-dark-border text-gray-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-dark-card rounded-2xl p-8 max-w-md w-full shadow-xl"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">Delete Customer?</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              Are you sure you want to delete <span className="font-bold">{deleteConfirm.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => confirmDelete(deleteConfirm.id)}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
              >
                Yes, Delete
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-dark-border text-gray-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Notification Toast */}
      {notification && notification.type === "success" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="bg-white dark:bg-dark-card rounded-3xl p-12 shadow-2xl text-center max-w-sm w-full mx-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-16 h-16 text-blue-600" strokeWidth={1.5} />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
            >
              Success
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600 dark:text-gray-300 text-lg"
            >
              {notification.message}
            </motion.p>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Success Notification */}
      {notification && notification.type === "delete" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="bg-white dark:bg-dark-card rounded-3xl p-12 shadow-2xl text-center max-w-sm w-full mx-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6"
            >
              <Trash2 className="w-16 h-16 text-red-600" strokeWidth={1.5} />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
            >
              Customer Deleted
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600 dark:text-gray-300 text-lg"
            >
              The customer has been permanently removed
            </motion.p>
          </motion.div>
        </motion.div>
      )}

      {notification && (notification.type === "error" || (notification.type !== "success" && notification.type !== "delete")) && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 z-50 bg-white dark:bg-dark-card border border-red-200 dark:border-red-800 rounded-xl shadow-2xl p-4 flex items-center gap-3 max-w-md"
        >
          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Action Failed</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{notification.message}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
