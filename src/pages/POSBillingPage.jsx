import React, { useState, useMemo, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import { useCompanySettings } from "../context/CompanySettingsContext";
import { NotificationContext } from "../context/NotificationContext";
import { useTaxConfiguration } from "../hooks/useTaxConfiguration";
import * as XLSX from "xlsx";
import { useExportSuccess } from "../context/ExportSuccessContext";
import { productAPI, customerAPI, salesAPI } from "../api/apiService";
import authAxios from "../api/authAxios";
import { numberToWords } from "../utils/numberToWords";
// eslint-disable-next-line no-unused-vars
import { Search, Barcode, Plus, Minus, Trash2, Phone, Mail, FileText, Printer, Save, Send, MessageSquare, X, CheckCircle2, Download, Share2, Upload, Camera } from "lucide-react";

// Mock data removed

export default function POSBillingPage() {
  const { userRole, user } = useAuth();
  const { hasPermission } = usePermissions();
  const { companySettings } = useCompanySettings();
  const { taxSettings, loading: taxLoading } = useTaxConfiguration();
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannerType, setScannerType] = useState("code"); // 'code' or 'barcode'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [systemSettings, setSystemSettings] = useState(null);

  // Initialize invoice number - will be updated by useEffect after systemSettings loads
  const [invoiceNo, setInvoiceNo] = useState(() => {
    // Initial value - will be replaced once systemSettings is fetched
    return `INV-${Date.now()}`;
  });
  const [paymentMode, setPaymentMode] = useState("cash");
  const [taxType, setTaxType] = useState("CGST_SGST");
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", sku: "", stock: "" });
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "", gst: "" });
  const [notification, setNotification] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashAmount, setCashAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState(0); // Track actual amount paid
  const [cardNumber, setCardNumber] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [upiId, setUpiId] = useState("");
  const { addNotification } = useContext(NotificationContext);
  const exportSuccess = useExportSuccess();
  const [backendConnected, setBackendConnected] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);

  // Fetch products and customers from backend on mount
  useEffect(() => {
    fetchProductsAndCustomers();
    fetchSystemSettings();

    // Poll for system settings changes every 5 seconds (to pick up Super Admin prefix changes)
    const interval = setInterval(fetchSystemSettings, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch system settings to get invoice prefix
  const fetchSystemSettings = async () => {
    try {
      const response = await authAxios.get('/api/super-admin/settings-api/');
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      setSystemSettings(data);
    } catch (error) {
      console.log('System settings error:', error.message);
    }
  };

  // Fetch the next invoice number from backend
  const fetchNextInvoiceNumber = async () => {
    try {
      const response = await authAxios.get('/api/billing/invoices/next-number/');
      if (response.data && response.data.next_invoice_number) {
        setInvoiceNo(response.data.next_invoice_number);
      }
    } catch (error) {
      console.error("Failed to fetch next invoice number:", error);
      // Fallback if API fails
      setInvoiceNo(`INV-${Date.now()}`);
    }
  };



  // Use this to refresh after invoice save
  useEffect(() => {
    // Re-fetch when system settings change (just in case prefix changed)
    if (systemSettings) {
      fetchNextInvoiceNumber();
    }
  }, [systemSettings]);

  // Helper function to normalize products
  function normalizeProducts(productsArray) {
    return productsArray.map(p => {
      // Extract category name
      let categoryName = "";
      if (typeof p.category === 'object' && p.category?.name) {
        categoryName = p.category.name;
      } else if (typeof p.category === 'string') {
        categoryName = p.category;
      }

      return {
        ...p,
        // Map backend fields to frontend fields
        id: p.id,
        name: p.name || "Unnamed Product",
        sku: p.product_code || p.sku || "",
        barcode: p.barcode || "",
        stock: Number(p.stock) || 0,
        price: Number(p.unit_price || p.selling_price || p.price || 0),
        // Keep original fields
        product_code: p.product_code,
        category: categoryName
      };
    });
  }

  async function fetchProductsAndCustomers() {
    setLoading(true);
    try {
      const [productsRes, customersRes] = await Promise.all([
        productAPI.getAllProducts(),
        customerAPI.getAllCustomers()
      ]);

      // Handle nested response formats for products
      let productsData = productsRes.data?.data?.products || productsRes.data?.products || productsRes.data;
      // Handle pagination/search result format
      if (!Array.isArray(productsData) && productsData?.results) {
        productsData = productsData.results;
      }

      if (productsData && Array.isArray(productsData)) {
        const normalized = normalizeProducts(productsData);
        setProducts(normalized);
        setBackendConnected(true);
      } else {
        setProducts([]);
      }

      // Handle nested response formats for customers
      let customersData = null;
      if (customersRes.data?.data?.customers && Array.isArray(customersRes.data.data.customers)) {
        customersData = customersRes.data.data.customers;
      } else if (customersRes.data?.data && Array.isArray(customersRes.data.data)) {
        customersData = customersRes.data.data;
      } else if (customersRes.data && Array.isArray(customersRes.data)) {
        customersData = customersRes.data;
      } else if (customersRes.data?.results && Array.isArray(customersRes.data.results)) {
        customersData = customersRes.data.results;
      }

      if (customersData && Array.isArray(customersData)) {
        const normalized = normalizeCustomers(customersData);
        setCustomers(normalized);
      } else {
        setCustomers([]);
      }

    } catch (error) {
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  }

  // Initialize selected customer on first load
  useEffect(() => {
    if (!selectedCustomer && customers.length > 0) {
      setSelectedCustomer(customers[0]);
    }
  }, [customers, selectedCustomer]);

  const filtered = useMemo(() => {
    if (!searchQuery) return products;

    const matches = products.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return matches;
  }, [searchQuery, products]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery.trim()) return customers;

    const query = customerSearchQuery.toLowerCase();
    const results = customers.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(query)) ||
        (c.phone && c.phone.includes(customerSearchQuery)) ||
        (c.email && c.email.toLowerCase().includes(query))
    );

    // Sort results: exact name match first, then partial matches
    return results.sort((a, b) => {
      const aNameMatch = a.name && a.name.toLowerCase() === query ? 0 : 1;
      const bNameMatch = b.name && b.name.toLowerCase() === query ? 0 : 1;
      return aNameMatch - bNameMatch;
    });
  }, [customerSearchQuery, customers]);

  async function addProduct() {
    if (newProduct.name.trim() && newProduct.price && newProduct.sku.trim()) {
      try {
        const productData = {
          name: newProduct.name.trim(),
          product_code: newProduct.sku.trim(),
          stock: parseInt(newProduct.stock) || 0,
          unit_price: parseFloat(newProduct.price),
          category: "Uncategorized", // Default
          is_active: true
        };

        const response = await productAPI.createProduct(productData);
        // Normalize the response (it might differ)
        const savedProduct = response.data;
        const normalized = {
          id: savedProduct.id,
          name: savedProduct.name,
          sku: savedProduct.product_code || savedProduct.sku,
          price: parseFloat(savedProduct.unit_price || savedProduct.price),
          stock: parseInt(savedProduct.stock),
          category: savedProduct.category
        };

        setProducts([...products, normalized]);
        setNewProduct({ name: "", price: "", sku: "", stock: "" });
        setShowAddProductModal(false);

        // Show success
        addNotification("success", "Invoice Saved", `Product ${normalized.name} added successfully`);
        setNotification({ type: "success", message: `Product ${normalized.name} added!` });
        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        alert("Failed to add product: " + (error.response?.data?.detail || error.message));
      }
    } else {
      alert("⚠️ Please fill Name, SKU, and Price");
    }
  }

  async function addCustomer() {
    const nameVal = newCustomer.name.trim();
    const phoneVal = newCustomer.phone.trim();

    if (!nameVal || !phoneVal) {
      addNotification("error", "Missing Required Fields", "Please fill in Name and Phone");
      alert("⚠️ Please fill all required fields (Name, Phone)");
      return;
    }

    try {
      const customerData = {
        name: nameVal,
        phone: phoneVal,
        customer_type: 'retail' // Default to retail
      };

      // Only add optional fields if they have values
      if (newCustomer.email.trim()) {
        const emailTrimmed = newCustomer.email.trim();
        // Basic email validation before sending
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(emailTrimmed)) {
          customerData.email = emailTrimmed;
        }
      }
      if (newCustomer.gst.trim()) {
        customerData.gstin = newCustomer.gst.trim();
      }

      const response = await customerAPI.createCustomer(customerData);
      const savedCustomer = response.data;

      // Normalize the new customer with loyalty fields
      const normalizedCustomer = {
        ...savedCustomer,
        loyaltyPoints: savedCustomer.loyalty_points || 0,
        loyaltyTier: savedCustomer.loyalty_tier || 'bronze'
      };

      // Add to customers list
      setCustomers([...customers, normalizedCustomer]);

      // Auto-select the new customer
      setSelectedCustomer(normalizedCustomer);

      // Clear the form
      setNewCustomer({ name: "", phone: "", email: "", gst: "" });

      // Close the modal
      setShowAddCustomerModal(false);

      // Clear the search query so it doesn't interfere with selection
      setCustomerSearchQuery("");
      setShowCustomerSearch(false);

      addNotification("success", "Customer Added", `${normalizedCustomer.name} has been added successfully`);
      setNotification({ type: "customer", message: `✅ ${normalizedCustomer.name} added` });

      // Broadcast to other pages that a customer was added
      const event = new CustomEvent("customerAdded", { detail: normalizedCustomer });
      window.dispatchEvent(event);

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      let msg = "Failed to add customer";
      const data = error.response?.data;

      // Try to extract a meaningful error message
      if (!data) {
        // No response data - network error
        msg = error.message || "Network error or server unavailable";
      }
      // Check for detail field (usually contains the actual error message)
      else if (data?.detail) {
        if (typeof data.detail === 'string') {
          msg = data.detail;
        } else if (typeof data.detail === 'object' && !Array.isArray(data.detail)) {
          // Object with field errors
          const detailKeys = Object.keys(data.detail).filter(k => data.detail[k]);
          if (detailKeys.length > 0) {
            msg = detailKeys.map(field => {
              const fieldError = data.detail[field];
              if (Array.isArray(fieldError)) {
                return `${field}: ${fieldError.join(", ")}`;
              } else if (typeof fieldError === 'object') {
                return `${field}: ${JSON.stringify(fieldError)}`;
              }
              return `${field}: ${String(fieldError)}`;
            }).join(" | ");
          }
        }
      }
      // Check for specific field errors at root level
      else if (data?.phone) {
        msg = Array.isArray(data.phone)
          ? `Phone: ${data.phone.join(", ")}`
          : `Phone: ${String(data.phone)}`;
      }
      else if (data?.gstin) {
        msg = Array.isArray(data.gstin)
          ? `GSTIN: ${data.gstin.join(", ")}`
          : `GSTIN: ${String(data.gstin)}`;
      }
      else if (data?.name) {
        msg = Array.isArray(data.name)
          ? `Name: ${data.name.join(", ")}`
          : `Name: ${String(data.name)}`;
      }
      else if (data?.email) {
        msg = Array.isArray(data.email)
          ? `Email: ${data.email.join(", ")}`
          : `Email: ${String(data.email)}`;
      }
      else if (data?.non_field_errors) {
        msg = Array.isArray(data.non_field_errors)
          ? data.non_field_errors.join(", ")
          : String(data.non_field_errors);
      }
      else if (data?.error) {
        msg = String(data.error);
      }
      else if (typeof data === 'string') {
        msg = data;
      }

      addNotification("error", "Failed to Add Customer", msg);
      alert("Failed to add customer:\n\n" + msg);
    }
  }

  function handleSendSMS() {
    if (!selectedCustomer) {
      alert("⚠️ Please select a customer first");
      return;
    }
    if (cart.length === 0) {
      alert("⚠️ Please add items to the cart");
      return;
    }
    // Simulation
    // addNotification("info", "Feature Unavailable", "SMS Gateway integration is required.");
    // Temporarily simulate success for demo
    setNotification({ type: "sms", message: "SMS sent successfully (Simulated)" });
    setTimeout(() => setNotification(null), 3000);
  }

  async function handleSaveInvoice() {
    try {
      if (!selectedCustomer) {
        alert("⚠️ Please select a customer first");
        return;
      }
      if (cart.length === 0) {
        alert("⚠️ Can't save empty invoice. Add items to cart.");
        return;
      }

      // Determine payment status based on paid amount
      let paymentStatus = "unpaid";
      const actualPaidAmount = paidAmount;

      if (actualPaidAmount >= total) {
        paymentStatus = "paid";
      } else if (actualPaidAmount > 0) {
        paymentStatus = "partial";
      }

      // Map frontend fields to backend model fields
      const invoiceData = {
        customer: selectedCustomer.id,
        billing_mode: "with_gst",
        status: "completed",
        payment_status: paymentStatus,
        subtotal: subtotal,
        cgst_amount: cgst,
        sgst_amount: sgst,
        igst_amount: igst,
        total_amount: total,
        paid_amount: actualPaidAmount,
        tax_rate: taxPercent,
        notes: `Payment Mode: ${paymentMode}`,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          qty: item.qty,
          price: item.price
        }))
      };

      // Save to backend
      const response = await salesAPI.createSale(invoiceData);

      if (response.data || response.status === 201 || response.status === 200) {
        // Get the actual invoice number from backend response
        const savedInvoiceNumber = response.data?.invoice_number || invoiceNo;

        // Clear cart and reset for new invoice
        setCart([]);
        setSelectedCustomer(null);
        fetchNextInvoiceNumber();
        setPaymentMode("Cash");
        setPaidAmount(0);
        setCashAmount("");

        try { exportSuccess.showExportSuccess(`Invoice #${savedInvoiceNumber} saved!`); } catch (e) { }
      } else {
        throw new Error("Invalid response from server");
      }

    } catch (error) {
      const errorData = error.response?.data || {};
      const msg = errorData.detail || errorData.message || error.message || "Failed to save invoice";

      // If we have a validation error object (e.g. {customer: ["Invalid pk"]}), show that
      const fullDetails = JSON.stringify(errorData, null, 2);

      addNotification("error", "Save Failed", msg);
      alert(`Error saving invoice:\n${msg}\n\nDetails:\n${fullDetails}`);
    }
  }

  function updateLoyaltyTier(points) {
    if (points >= 5000) return 'platinum';
    if (points >= 3000) return 'gold';
    if (points >= 1000) return 'silver';
    return 'bronze';
  }

  function normalizeCustomers(customersArray) {
    return customersArray.map(customer => ({
      ...customer,
      loyaltyPoints: customer.loyaltyPoints || customer.loyalty_points || 0,
      loyaltyTier: customer.loyaltyTier || customer.loyalty_tier || 'bronze'
    }));
  }

  function handlePrintInvoice() {
    try {
      if (!selectedCustomer || cart.length === 0) {
        alert("⚠️ Please select a customer and add items to cart");
        return;
      }

      const hasBrand = (obj) => obj && Object.keys(obj).length > 1;
      const company = (hasBrand(user?.company_profile) ? user.company_profile : null) ||
        (hasBrand(companySettings) ? companySettings : null) || {};
      const companyName = company.company_name || company.name || "YOUR BUSINESS NAME";

      const addressParts = [];
      if (company.street_address) addressParts.push(company.street_address);
      if (company.city) addressParts.push(company.city);
      if (company.state) addressParts.push(company.state);
      if (company.postal_code) addressParts.push(company.postal_code);

      const address = addressParts.length > 0 ? addressParts.join(", ") : "Update company address in settings";
      const phone = company.phone || "Update phone in settings";
      const email = company.email || "";
      const gstin = company.tax_id || "";
      const logoUrl = company.logo_url || "";

      const totalInWords = numberToWords(total || 0);
      const taxRate = taxSettings?.taxRate || 18;

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("⚠️ Pop-up blocked. Please allow pop-ups for printing.");
        return;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice #${invoiceNo}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
              body { font-family: 'Inter', sans-serif; padding: 20px; margin: 0; color: #000; font-size: 12px; line-height: 1.4; }
              .invoice-container { max-width: 800px; margin: auto; border: 1px solid #000; }
              
              /* Top Header */
              .main-header { display: flex; border-bottom: 1px solid #000; }
              .header-tax { flex: 1; text-align: center; font-size: 16px; font-weight: 800; padding: 10px; border-right: 1px solid #000; color: #1e40af; letter-spacing: 2px; text-transform: uppercase; }
              .header-copy { width: 200px; text-align: center; font-size: 10px; font-weight: 600; padding: 10px; text-transform: uppercase; }
              
              /* Store Section */
              .store-section { display: flex; border-bottom: 1px solid #000; }
              .store-brand { flex: 1.5; padding: 15px; border-right: 1px solid #000; display: flex; align-items: center; gap: 15px; }
              .store-logo { width: 60px; height: 60px; object-fit: contain; }
              .store-info h2 { font-size: 18px; font-weight: 800; margin: 0; text-transform: uppercase; }
              .store-info p { margin: 2px 0; font-size: 11px; color: #374151; }
              
              .invoice-meta { flex: 1; display: grid; grid-template-columns: 1fr 1fr; }
              .meta-box { border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 6px 10px; }
              .meta-box:nth-child(even) { border-right: 0; }
              .meta-label { font-size: 9px; font-weight: 700; color: #6b7280; text-transform: uppercase; display: block; margin-bottom: 2px; }
              .meta-value { font-size: 11px; font-weight: 700; }
              
              /* Address Section */
              .address-section { display: flex; border-bottom: 1px solid #000; min-height: 100px; }
              .address-box { flex: 1; padding: 12px; }
              .address-box:first-child { border-right: 1px solid #000; }
              .address-title { font-size: 10px; font-weight: 800; color: #000; text-transform: uppercase; margin-bottom: 5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 2px; }
              
              /* Items Table */
              .items-table { width: 100%; border-collapse: collapse; }
              .items-table th { background: #f3f4f6; border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 8px; font-size: 10px; text-transform: uppercase; font-weight: 800; }
              .items-table td { border-bottom: 1px dotted #ccc; border-right: 1px solid #000; padding: 8px; font-size: 11px; }
              .items-table th:last-child, .items-table td:last-child { border-right: 0; }
              .items-table .text-right { text-align: right; }
              .items-table .text-center { text-align: center; }
              
              /* Total Section */
              .bottom-section { display: flex; border-top: 1px solid #000; border-bottom: 1px solid #000; }
              .words-box { flex: 1.5; padding: 10px; border-right: 1px solid #000; }
              .totals-box { flex: 1; background: #fff; }
              .total-row { display: flex; justify-content: space-between; padding: 4px 12px; border-bottom: 1px solid #e5e7eb; }
              .total-row.grand-total { background: #f9fafb; border-bottom: 0; padding-top: 8px; padding-bottom: 8px; border-top: 1px solid #000; }
              
              /* Tax Summary Table */
              .tax-summary-table { width: 100%; border-collapse: collapse; font-size: 9px; text-align: center; border-bottom: 1px solid #000; }
              .tax-summary-table th, .tax-summary-table td { border: 1px solid #000; padding: 4px; }
              
              /* Footer */
              .footer-section { display: flex; min-height: 120px; }
              .bank-details { flex: 1.5; padding: 12px; border-right: 1px solid #000; }
              .upi-qr-box { width: 120px; padding: 12px; border-right: 1px solid #000; text-align: center; }
              .upi-qr-box img { width: 80px; height: 80px; }
              .signature-box { flex: 1; padding: 12px; text-align: center; display: flex; flex-direction: column; justify-content: space-between; }
              
              .notes-section { padding: 10px; border-top: 1px solid #000; font-size: 10px; display: flex; gap: 20px; }
              .terms { flex: 2; }
              .digital-seal { font-size: 9px; color: #6b7280; margin-top: 10px; text-align: center; font-style: italic; }
              
              @media print {
                body { padding: 0; }
                .invoice-container { border: 1px solid #000; width: 100%; }
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <!-- Main Header -->
              <div class="main-header">
                <div class="header-tax">TAX INVOICE</div>
                <div class="header-copy">Original for Recipient</div>
              </div>

              <!-- Store Brand & Meta -->
              <div class="store-section">
                <div class="store-brand">
                  ${logoUrl ? `<img src="${logoUrl}" class="store-logo" />` : `<div style="width:60px; height:60px; background:#f3f4f6; border-radius:8px;"></div>`}
                  <div class="store-info">
                    <h2>${companyName}</h2>
                    <p>${address}</p>
                    <p>Mobile: ${phone} ${email ? `| Email: ${email}` : ""}</p>
                    ${gstin ? `<p><strong>GSTIN: ${gstin}</strong></p>` : ""}
                  </div>
                </div>
                <div class="invoice-meta">
                  <div class="meta-box"><span class="meta-label">Invoice #</span><span class="meta-value">${invoiceNo}</span></div>
                  <div class="meta-box"><span class="meta-label">Date</span><span class="meta-value">${new Date().toLocaleDateString()}</span></div>
                  <div class="meta-box"><span class="meta-label">Place of Supply</span><span class="meta-value">${company.state || "N/A"}</span></div>
                  <div class="meta-box"><span class="meta-label">Due Date</span><span class="meta-value">${new Date().toLocaleDateString()}</span></div>
                </div>
              </div>

              <!-- Addresses -->
              <div class="address-section">
                <div class="address-box">
                  <div class="address-title">Billed To (Customer Details)</div>
                  <div style="font-size:12px; font-weight:700;">${selectedCustomer.name || "Walk-in Customer"}</div>
                  <div style="font-size:11px; margin-top:3px;">
                    Ph: ${selectedCustomer.phone || "N/A"}<br/>
                    ${selectedCustomer.email ? `Email: ${selectedCustomer.email}<br/>` : ""}
                    ${selectedCustomer.gst && selectedCustomer.gst !== "N/A" ? `<strong>GSTIN: ${selectedCustomer.gst}</strong>` : ""}
                  </div>
                </div>
                <div class="address-box">
                  <div class="address-title">Shipping Address</div>
                  <div style="font-size:11px; color:#4b5563;">
                    Same as Billing Address
                  </div>
                </div>
              </div>

              <!-- Items Table -->
              <table class="items-table">
                <thead>
                  <tr>
                    <th style="width: 40px;">#</th>
                    <th>Item Description</th>
                    <th>HSN/SAC</th>
                    <th class="text-right">Rate</th>
                    <th class="text-center">Qty</th>
                    <th class="text-right">Taxable Value</th>
                    <th class="text-right">Tax (%)</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${cart.map((item, idx) => `
                    <tr>
                      <td class="text-center" style="height: 35px;">${idx + 1}</td>
                      <td>
                        <div style="font-weight:700;">${item.name}</div>
                        ${item.sku ? `<div style="font-size:9px; color:gray;">SKU: ${item.sku}</div>` : ""}
                      </td>
                      <td class="text-center">${item.sku || "N/A"}</td>
                      <td class="text-right">${item.price?.toFixed(2)}</td>
                      <td class="text-center">${item.qty}</td>
                      <td class="text-right">${(item.price * item.qty).toFixed(2)}</td>
                      <td class="text-right">${taxRate}%</td>
                      <td class="text-right">${((item.price * item.qty) * (1 + taxRate / 100)).toFixed(2)}</td>
                    </tr>
                  `).join("")}
                  <!-- Fill empty space -->
                  ${Array(Math.max(0, 5 - cart.length)).fill(0).map(() => `
                    <tr>
                      <td style="height: 35px; border-right: 1px solid #000;"></td>
                      <td style="border-right: 1px solid #000;"></td>
                      <td style="border-right: 1px solid #000;"></td>
                      <td style="border-right: 1px solid #000;"></td>
                      <td style="border-right: 1px solid #000;"></td>
                      <td style="border-right: 1px solid #000;"></td>
                      <td style="border-right: 1px solid #000;"></td>
                      <td></td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>

              <!-- Totals Section -->
              <div class="bottom-section">
                <div class="words-box">
                  <span class="meta-label">Total Amount in Words</span>
                  <div style="font-size: 11px; font-weight: 700; margin-top: 5px;">${totalInWords}</div>
                </div>
                <div class="totals-box">
                  <div class="total-row"><span>Taxable Amount</span><span>₹${subtotal.toFixed(2)}</span></div>
                  ${cgst > 0 ? `<div class="total-row"><span>CGST (${taxRate / 2}%)</span><span>₹${cgst.toFixed(2)}</span></div>` : ""}
                  ${sgst > 0 ? `<div class="total-row"><span>SGST (${taxRate / 2}%)</span><span>₹${sgst.toFixed(2)}</span></div>` : ""}
                  <div class="total-row grand-total">
                    <span style="font-weight: 800; font-size: 14px;">Total</span>
                    <span style="font-weight: 800; font-size: 14px;">₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <!-- HSN Summary -->
              <table class="tax-summary-table">
                <thead>
                  <tr>
                    <th rowspan="2">HSN/SAC</th>
                    <th rowspan="2">Taxable Value</th>
                    <th colspan="2">Central Tax</th>
                    <th colspan="2">State Tax</th>
                    <th rowspan="2">Total Tax Amount</th>
                  </tr>
                  <tr>
                    <th>Rate</th><th>Amount</th>
                    <th>Rate</th><th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${cart[0]?.sku || "N/A"}</td>
                    <td>${subtotal.toFixed(2)}</td>
                    <td>${taxRate / 2}%</td><td>${(cgst || 0).toFixed(2)}</td>
                    <td>${taxRate / 2}%</td><td>${(sgst || 0).toFixed(2)}</td>
                    <td>${((cgst || 0) + (sgst || 0)).toFixed(2)}</td>
                  </tr>
                  <tr style="font-weight: 800;">
                    <td>TOTAL</td>
                    <td>${subtotal.toFixed(2)}</td>
                    <td></td><td>${(cgst || 0).toFixed(2)}</td>
                    <td></td><td>${(sgst || 0).toFixed(2)}</td>
                    <td>${((cgst || 0) + (sgst || 0)).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Footer Section -->
              <div class="footer-section">
                <div class="bank-details">
                  <div class="address-title" style="margin-bottom: 8px;">Bank Account Details</div>
                  <p style="margin: 2px 0;"><strong>Bank:</strong> ${company.bank_name || "YES BANK"}</p>
                  <p style="margin: 2px 0;"><strong>A/c No:</strong> ${company.bank_account || "66789999222445"}</p>
                  <p style="margin: 2px 0;"><strong>IFSC:</strong> ${company.ifsc_code || "YESBBIN4567"}</p>
                  <p style="margin: 2px 0;"><strong>Branch:</strong> ${company.bank_branch || "Kodihalli"}</p>
                </div>
                <div class="upi-qr-box">
                  <div class="address-title" style="font-size: 8px;">Pay using UPI</div>
                  <div style="padding: 5px; border: 1px solid #e5e7eb; border-radius: 4px; margin-top: 5px;">
                     <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=swipe@getswipe.in%26pn=${companyName}%26am=${total}%26cu=INR" style="width: 70px; height: 70px;" />
                  </div>
                </div>
                <div class="signature-box">
                  <div style="font-size: 9px; font-weight: 800;">For ${companyName}</div>
                  <div style="margin: 10px 0;">
                     <div style="width: 80px; height: 40px; border: 1px dashed #ccc; margin: auto; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 8px;">SIGNATURE</div>
                  </div>
                  <div style="font-size: 9px; font-weight: 800; border-top: 1px solid #000; padding-top: 5px;">Authorized Signatory</div>
                </div>
              </div>

              <!-- Notes -->
              <div class="notes-section">
                <div class="terms">
                  <div style="font-weight: 800; text-transform: uppercase; margin-bottom: 3px;">Terms & Conditions:</div>
                  1. Goods once sold cannot be taken back or exchanged.<br/>
                  2. Interest @24% p.a. will be charged for uncleared bills beyond 15 days.<br/>
                  3. Subject to local Jurisdiction.
                </div>
                <div style="flex: 1; text-align: right;">
                  <div style="font-weight: 800; text-transform: uppercase; margin-bottom: 3px;">Notes:</div>
                  Thank you for the Business
                </div>
              </div>
            </div>
            <div class="digital-seal">This is a digitally generated document. No physical signature required. Powered by Geo Billing</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);

      setNotification({ type: "print", message: "Invoice printed successfully" });
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      alert("Error printing invoice: " + e.message);
    }
  }

  function handleSendWhatsApp() {
    try {
      if (!selectedCustomer) {
        alert("⚠️ Please select a customer first");
        return;
      }
      if (cart.length === 0) {
        alert("⚠️ Please add items to the cart");
        return;
      }

      const phone = selectedCustomer.phone || "";
      if (!phone) {
        alert("⚠️ Customer phone number is missing!");
        return;
      }

      // Format message for WhatsApp
      const message = `Hello ${selectedCustomer.name},\n\nYour Invoice #${invoiceNo}\nTotal Amount: ₹${total}\n\nThank you for your purchase!`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappNumber = phone.replace(/\D/g, "");

      if (!whatsappNumber) {
        alert("⚠️ Customer phone number is invalid");
        return;
      }

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      const win = window.open(whatsappUrl, "_blank");

      if (!win) {
        alert("⚠️ Pop-up blocked. Please allow pop-ups for WhatsApp.");
        return;
      }

      setNotification({ type: "whatsapp", message: "WhatsApp message sent" });
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      alert("Error sending WhatsApp: " + e.message);
    }
  }

  function handleCashPayment() {
    const amount = parseFloat(cashAmount);
    if (!amount || amount <= 0) {
      alert("⚠️ Please enter a valid amount");
      return;
    }

    const balance = amount >= total ? 0 : (total - amount);
    const change = amount > total ? (amount - total) : 0;

    // Store the paid amount for later use in handleSaveInvoice
    // Store the paid amount is now delayed to sync with toast
    // setPaidAmount(amount); <- Moved to setTimeout

    // Add notification to context
    if (amount >= total) {
      addNotification(
        "sale",
        "Payment Successful",
        `Cash payment of ₹${total.toFixed(2)} received from ${selectedCustomer?.name || "Customer"}. Change: ₹${change.toFixed(2)}`
      );
    } else {
      addNotification(
        "sale",
        "Partial Payment Received",
        `Partial payment of ₹${amount.toFixed(2)} received from ${selectedCustomer?.name || "Customer"}. Pending: ₹${balance.toFixed(2)}`
      );
    }

    setNotification({ type: "cash_success", message: `Payment Successful` });

    // Show "Click Save Invoice" notification after payment notification disappears
    setTimeout(() => {
      setNotification(null);
      setNotification({ type: "next_step", message: `Click "Save Invoice" to complete` });

      // Delay button enable slightly to ensure toast is visible first
      setTimeout(() => setPaidAmount(amount), 500);

      setTimeout(() => setNotification(null), 4000);
    }, 3000);

    // Close payment modal but keep cart for manual save
    setCashAmount("");
    setShowPaymentModal(false);
  }

  function handleCardPayment() {
    // Basic validation
    // if (!cardNumber || !cardCVV || !cardExpiry) {
    //   alert("⚠️ Please enter all card details");
    //   return;
    // }

    // Add notification to context
    addNotification(
      "sale",
      "Payment Successful",
      `Card payment of ₹${total.toFixed(2)} received from ${selectedCustomer?.name || "Customer"}`
    );

    // setPaidAmount(total); // Moved to setTimeout

    setNotification({ type: "card_success", message: `Payment Successful` });

    // Show "Click Save Invoice" notification after payment notification disappears
    setTimeout(() => {
      setNotification(null);
      setNotification({ type: "next_step", message: `Click "Save Invoice" to complete` });

      // Delay button enable slightly to ensure toast is visible first
      setTimeout(() => setPaidAmount(total), 500);

      setTimeout(() => setNotification(null), 4000);
    }, 3000);

    // Close payment modal but keep cart for manual save
    setCardNumber("");
    setCardCVV("");
    setCardExpiry("");
    setShowPaymentModal(false);
  }

  function handleUPIPayment() {
    // Basic validation
    // if (!upiId) {
    //   alert("⚠️ Please enter your UPI ID or scan QR code");
    //   return;
    // }

    // Add notification to context
    addNotification(
      "sale",
      "Payment Successful",
      `UPI payment of ₹${total.toFixed(2)} received from ${selectedCustomer?.name || "Customer"}`
    );

    // setPaidAmount(total); // Moved to setTimeout

    setNotification({ type: "upi_success", message: `Payment Successful` });

    // Show "Click Save Invoice" notification after payment notification disappears
    setTimeout(() => {
      setNotification(null);
      setNotification({ type: "next_step", message: `Click "Save Invoice" to complete` });

      // Delay button enable slightly to ensure toast is visible first
      setTimeout(() => setPaidAmount(total), 500);

      setTimeout(() => setNotification(null), 4000);
    }, 3000);

    // Close payment modal but keep cart for manual save
    setUpiId("");
    setShowPaymentModal(false);
  }

  function handlePaymentModeClick(mode) {
    setPaymentMode(mode);
    setShowPaymentModal(true);
  }

  function addToCart(product) {
    if (!product || !product.id) {
      return;
    }

    // Stock Validation
    const existingIdx = cart.findIndex((x) => x.id === product.id);
    const currentQty = existingIdx >= 0 ? cart[existingIdx].qty : 0;
    const availableStock = product.stock || 0;

    if (currentQty + 1 > availableStock) {
      addNotification("error", "Stock Limit Exceeded", `Only ${availableStock} units available for "${product.name}"`);
      return; // Block addition
    }

    setCart((c) => {
      if (existingIdx >= 0) {
        const updated = [...c];
        updated[existingIdx] = {
          ...updated[existingIdx],
          qty: updated[existingIdx].qty + 1
        };
        return updated;
      } else {
        // Initialize with 0 discount (tax is applied globally via GST settings)
        return [...c, {
          ...product,
          qty: 1,
          discount: 0
        }];
      }
    });

    addNotification("success", "Product Added", `${product.name} added to cart`);
  }

  function handleBarcodeInput(e) {
    if (e.key === "Enter" && barcodeInput.trim()) {
      const input = barcodeInput.trim();
      let product;

      // Search by SKU (code) or barcode depending on scanner type
      if (scannerType === "code") {
        product = products.find(p => p.sku && p.sku.toLowerCase() === input.toLowerCase());
      } else {
        // For barcode, search by barcode field, sku, or id
        product = products.find(p =>
          (p.barcode && p.barcode.toLowerCase() === input.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase() === input.toLowerCase()) ||
          (p.id && p.id.toLowerCase() === input.toLowerCase())
        );
      }

      if (product) {
        addToCart(product);
        setBarcodeInput("");
      } else {
        addNotification("error", "Product Not Found", `No ${scannerType} found for: ${input}`);
      }
    }
  }

  function updateQty(id, qty) {
    const item = cart.find(x => x.id === id);
    if (!item) return;

    // Validate Status
    const availableStock = item.stock || 0;
    if (qty > availableStock) {
      addNotification("error", "Stock Limit", `Cannot set quantity to ${qty}. Max available: ${availableStock}`);
      return;
    }

    const newQty = Math.max(1, parseInt(qty) || 1);
    setCart((c) => c.map((x) => (x.id === id ? { ...x, qty: newQty } : x)));
  }

  function updateDiscount(id, val) {
    const rawValue = parseFloat(val);
    const value = isNaN(rawValue) ? 0 : rawValue;

    // Role-based Validation
    // Owner/SuperAdmin can give any discount (up to 100%)
    // Staff/Others capped at 10%
    const isPrivileged = userRole === 'OWNER' || userRole === 'SUPERADMIN' || user?.is_super_admin;
    const maxDiscount = isPrivileged ? 100 : 10;

    if (value < 0) return; // No negative discount

    if (value > maxDiscount) {
      addNotification("error", "Discount Limit", `Max discount allowed for your role is ${maxDiscount}%`);
      // Clamp to max
      setCart(c => c.map(item => item.id === id ? { ...item, discount: maxDiscount } : item));
      return;
    }

    setCart(c => c.map(item => item.id === id ? { ...item, discount: value } : item));
  }

  function removeItem(id) {
    setCart((c) => {
      const removed = c.find(x => x.id === id);
      const updated = c.filter((x) => x.id !== id);
      if (removed) {
        addNotification("success", "Item Removed", `${removed.name} removed from cart`);
      }
      return updated;
    });
  }

  // Export/Import functions (unchanged)... 

  // ... (Keeping existing Export/Import functions as valid placeholders via ... if I could, but I must replace contiguous block. 
  // Since the user asked "Do not remove anything", I will retain the export/import helpers if they were in the range. 
  // Checking line numbers: addToCart starts ~766. removeItem ends ~842. 
  // The table rendering is at ~1250.
  // I need to be careful. The replacement block I chose (766 to 1312) covers EVERYTHING from addToCart down to the end of Table.
  // I MUST include the export/import functions in this replacement content to avoid deleting them.
  // I will copy them from the original file content view I have.

  function handleExportProducts() {
    const worksheet = XLSX.utils.json_to_sheet(products);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products.xlsx");

    addNotification("product", "Export Successful", `${products.length} products exported to Excel`);
    try { exportSuccess.showExportSuccess(`${products.length} products exported to Excel`); } catch (e) { }
  }

  function handleExportCustomers() {
    const worksheet = XLSX.utils.json_to_sheet(customers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, "customers.xlsx");

    addNotification("product", "Export Successful", `${customers.length} customers exported to Excel`);
    try { exportSuccess.showExportSuccess(`${customers.length} customers exported to Excel`); } catch (e) { }
  }

  function handleExportInvoices() {
    alert("Export feature requires backend integration for full invoice history.");
  }

  function handleImportProducts(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const newProducts = jsonData.map((item, idx) => ({
          id: `p_import_${Date.now()}_${idx}`,
          name: item.name || "Unnamed",
          price: parseFloat(item.price) || 0,
          sku: item.sku || `SKU-${idx}`,
          stock: parseInt(item.stock) || 0
        }));

        setProducts([...products, ...newProducts]);
        addNotification("product", "Import Successful", `${newProducts.length} products imported from Excel`);
      } catch (error) {
        alert("⚠️ Error importing file: " + error.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  }

  function handleImportCustomers(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const newCustomers = jsonData.map((item, idx) => ({
          id: `c_import_${Date.now()}_${idx}`,
          name: item.name || "Unnamed",
          phone: item.phone || "",
          email: item.email || "",
          gst: item.gst || "N/A"
        }));

        setCustomers([...customers, ...newCustomers]);
        addNotification("product", "Import Successful", `${newCustomers.length} customers imported from Excel`);
      } catch (error) {
        alert("⚠️ Error importing file: " + error.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  }

  // Updated Calculations with Discount
  const subtotal = cart.reduce((s, it) => {
    const discountPercent = it.discount || 0;
    const priceAfterDiscount = it.price * (1 - discountPercent / 100);
    return s + (priceAfterDiscount * it.qty);
  }, 0);

  // Use Super Admin tax settings - respects real-time updates from settings
  // Check both Super Admin's global setting AND customer's individual preference
  const gstApplies = taxSettings.gst_enabled && (selectedCustomer?.uses_gst !== false);
  const taxPercent = taxSettings.gst_percentage || 18;

  // Tax Calculations
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (gstApplies) {
    if (taxType === "IGST") {
      igst = Math.round(subtotal * (taxPercent / 100));
    } else {
      const halfTax = taxPercent / 2;
      cgst = Math.round(subtotal * (halfTax / 100));
      sgst = Math.round(subtotal * (halfTax / 100));
    }
  }
  const totalTax = cgst + sgst + igst;
  const total = subtotal + totalTax;

  // Check if user has permission to access POS
  if (!hasPermission(userRole, 'view_pos')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 md:p-6 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center max-w-md">
          <CheckCircle2 className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2">Access Denied</h2>
          <p className="text-red-700 dark:text-red-300">You don't have permission to access POS Billing. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Billing Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-slate-700 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Point of Sale - Billing</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Invoice #{invoiceNo}</p>
              </div>
            </div>

            {/* Customer Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Search Customer: {customers.length > 0 && <span className="text-blue-600">({customers.length})</span>}
                </span>
              </div>

              {/* Customer Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  value={customerSearchQuery}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setCustomerSearchQuery(newValue);
                    setShowCustomerSearch(true);
                    if (selectedCustomer && newValue && newValue.toLowerCase() !== selectedCustomer.name.toLowerCase()) {
                      setSelectedCustomer(null);
                    }
                  }}
                  onFocus={() => setShowCustomerSearch(true)}
                  onBlur={() => setTimeout(() => setShowCustomerSearch(false), 200)}
                  className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />

                {/* Dropdown Results */}
                {showCustomerSearch && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                  >
                    {filteredCustomers.length === 0 ? (
                      <div className="p-4 text-gray-500 dark:text-gray-400 text-sm text-center">
                        {customerSearchQuery ? "No customers found" : "Start typing to search..."}
                      </div>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <motion.div
                          key={customer.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedCustomer(customer);
                            setCustomerSearchQuery(customer.name);
                            setShowCustomerSearch(false);
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className={`px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-slate-700 transition-colors ${selectedCustomer?.id === customer.id
                            ? "bg-blue-100 text-blue-900"
                            : "hover:bg-gray-50"
                            }`}
                        >
                          <div className="font-semibold text-sm text-gray-900 dark:text-white">{customer.name}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 flex gap-4">
                            {customer.phone && <span>📱 {customer.phone}</span>}
                            {customer.email && <span>✉️ {customer.email}</span>}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </div>

              {/* Add Customer Button */}
              <button
                onClick={() => setShowAddCustomerModal(true)}
                disabled={loading}
                className={`w-full px-4 py-2 text-white text-sm font-bold rounded-lg transition-all ${loading ? "bg-gray-400 cursor-not-allowed opacity-60" : "bg-blue-500 hover:bg-blue-600"
                  }`}
              >
                {loading ? "Loading..." : "+ Add New Customer"}
              </button>

              {/* Customer Details */}
              {selectedCustomer && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 p-4 rounded-lg border border-blue-200 dark:border-slate-700"
                >
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">{selectedCustomer.name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">{selectedCustomer.email}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-gray-600">GSTIN: </span>
                      <input
                        type="text"
                        placeholder="GSTIN"
                        defaultValue={selectedCustomer.gst}
                        className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Customer GST Preference Toggle */}
                  {taxSettings.gst_enabled && (
                    <div className="mt-4 pt-4 border-t border-blue-200 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {selectedCustomer.uses_gst !== false ? '✓ GST Enabled' : '○ GST Disabled'}
                      </span>
                      <button
                        onClick={() => {
                          const newGstStatus = selectedCustomer.uses_gst === false;
                          setSelectedCustomer({ ...selectedCustomer, uses_gst: newGstStatus });
                          // Update on server
                          authAxios.patch(`/api/customers/${selectedCustomer.id}/`, {
                            uses_gst: newGstStatus
                          }).then((patchRes) => {
                            // Use the response from PATCH which contains updated customer
                            if (patchRes.data) {
                              setSelectedCustomer(patchRes.data);
                            }
                          }).catch(err => {
                            setSelectedCustomer({ ...selectedCustomer, uses_gst: !newGstStatus });
                          });
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${selectedCustomer.uses_gst !== false
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-400 text-white hover:bg-gray-500'
                          }`}
                      >
                        {selectedCustomer.uses_gst !== false ? 'Disable GST' : 'Enable GST'}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {taxSettings.gst_enabled && (
                <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <span className="text-sm font-bold text-gray-900">Tax Type:</span>
                  <select
                    value={taxType}
                    onChange={(e) => setTaxType(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                  >
                    <option value="CGST_SGST">CGST + SGST</option>
                    <option value="IGST">IGST</option>
                  </select>
                </div>
              )}
            </div>
          </motion.div>

          {/* Add Products Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-slate-700 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Barcode className="w-5 h-5 text-blue-600" />
                Add Products
              </h2>
            </div>

            {/* Barcode Scanner */}
            <div className="mb-4">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Barcode Scanner</label>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Scanner Type</label>
                  <select
                    value={scannerType}
                    onChange={(e) => setScannerType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border-2 border-blue-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white dark:bg-slate-700 dark:text-white appearance-none pr-8"
                  >
                    <option value="code">Code</option>
                    <option value="barcode">Barcode</option>
                  </select>
                </div>
              </div>

              {scannerType === "code" ? (
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="Enter code (e.g., TS-BL-001)"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyPress={handleBarcodeInput}
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-blue-500 dark:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  />
                </div>
              ) : (
                <div className="mt-4 flex flex-col items-center justify-center gap-4 p-8 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50">
                  <button
                    type="button"
                    className="p-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-lg hover:shadow-xl"
                    title="Open Camera Scanner"
                  >
                    <Camera className="w-8 h-8" />
                  </button>
                  <p className="text-sm text-gray-600 text-center">
                    Click the camera to scan product barcode
                  </p>
                </div>
              )}
            </div>

            {/* Product Search */}
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Search Product</label>
              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by product name"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 max-h-80 overflow-y-auto pr-2">
              {filtered.map((p) => (
                <motion.button
                  key={p.id}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addToCart(p)}
                  className="p-3 rounded-lg border-2 border-blue-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700/50 bg-white dark:bg-slate-800 transition-all text-left group"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-sm text-gray-900 group-hover:text-blue-600 truncate flex-1">{p.name}</p>
                    {p.stock <= 5 && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">Low: {p.stock}</span>}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">₹{p.price}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{p.sku}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Invoice Items Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-slate-700 p-6 shadow-sm overflow-x-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Invoice Items</h2>
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{cart.length} items</span>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No items added yet</p>
              </div>
            ) : (
              <div className="min-w-full overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-50 dark:bg-slate-700/50 border-b border-blue-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 dark:text-white">Item</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 dark:text-white">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-900 dark:text-white">Rate</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 dark:text-white">Disc%</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-900 dark:text-white">Amount</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 dark:text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {cart.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                          {item.name}
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">Stock: {item.stock}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => updateQty(item.id, item.qty - 1)}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            >
                              <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </motion.button>
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => updateQty(item.id, Number(e.target.value))}
                              className="w-12 px-2 py-1 text-center text-sm font-bold border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => updateQty(item.id, item.qty + 1)}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            >
                              <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </motion.button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">₹{item.price}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount || 0}
                            onChange={(e) => updateDiscount(item.id, e.target.value)}
                            className="w-14 px-2 py-1 text-center text-sm border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                          ₹{((item.price * (1 - (item.discount || 0) / 100)) * item.qty).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeItem(item.id)}
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

        </div>

        {/* Payment Summary Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:sticky lg:top-6 h-fit bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-slate-700 p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Payment Summary</h2>

          {/* Summary Items */}
          <div className="space-y-4 mb-6 pb-6 border-b border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sub Total:</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">₹{subtotal.toLocaleString()}</span>
            </div>
            {gstApplies && (
              <>
                {taxType === "IGST" ? (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">IGST ({taxPercent}%):</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">₹{igst.toLocaleString()}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CGST ({taxPercent / 2}%):</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">₹{cgst.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SGST ({taxPercent / 2}%):</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">₹{sgst.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Tax:</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">₹{totalTax.toLocaleString()}</span>
            </div>
          </div>

          {/* Grand Total */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
            <p className="text-sm font-medium mb-1">Grand Total:</p>
            <p className="text-3xl font-bold">₹{total.toLocaleString()}</p>
          </div>

          {/* Payment Mode */}
          <div className="mb-6">
            <p className="text-sm font-bold text-gray-900 mb-3">Payment Mode</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "cash", label: "Cash", icon: "💵" },
                { key: "card", label: "Card", icon: "💳" },
                { key: "upi", label: "UPI", icon: "📱" },
                { key: "credit", label: "Credit", icon: "📋" },
              ].map((mode) => (
                <motion.button
                  key={mode.key}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => mode.key !== "credit" ? handlePaymentModeClick(mode.key) : setPaymentMode(mode.key)}
                  className={`p-3 rounded-lg font-bold text-sm transition-all ${paymentMode === mode.key
                    ? "bg-blue-500 text-white border-2 border-blue-600"
                    : "bg-blue-50 dark:bg-slate-700 text-gray-900 dark:text-white border-2 border-blue-200 dark:border-slate-600 hover:border-blue-500"
                    }`}
                >
                  {mode.icon} {mode.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {(() => {
              const isSaveDisabled = !selectedCustomer || cart.length === 0 || (paidAmount <= 0 && paymentMode !== 'credit');
              return (
                <motion.button
                  whileHover={!isSaveDisabled ? { scale: 1.05 } : {}}
                  whileTap={!isSaveDisabled ? { scale: 0.95 } : {}}
                  onClick={handleSaveInvoice}
                  disabled={isSaveDisabled}
                  className={`w-full py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${isSaveDisabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg"
                    }`}
                >
                  <Save className="w-5 h-5" />
                  Save Invoice
                </motion.button>
              );
            })()}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrintInvoice}
              className="w-full py-3 rounded-lg border-2 border-blue-300 text-blue-700 font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print Invoice
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendSMS}
              className="w-full py-3 rounded-lg border-2 border-indigo-500 text-indigo-600 font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Send SMS
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendWhatsApp}
              className="w-full py-3 rounded-lg border-2 border-green-500 text-green-600 font-bold hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send via WhatsApp
            </motion.button>

          </div>
        </motion.div>
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAddProductModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New Product</h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g., Paneer Butter Masala"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Price</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="e.g., 280"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">SKU</label>
                <input
                  type="text"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  placeholder="e.g., SKU-2024-001"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Stock</label>
                <input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  placeholder="e.g., 100"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddProductModal(false)}
                className="flex-1 px-4 py-2 bg-slate-300 hover:bg-slate-400 text-gray-900 rounded-lg font-bold transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addProduct}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors"
              >
                Add Product
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Success Notification - Product Added */}
      {notification?.type === "product" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Product Added</h3>
            <p className="text-gray-600">{notification?.message}</p>
          </motion.div>
        </motion.div>
      )}

      {/* Success Notification - Customer Added */}
      {notification?.type === "customer" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Customer Added</h3>
            <p className="text-gray-600">{notification?.message}</p>
          </motion.div>
        </motion.div>
      )}

      {/* Success Notification - Invoice Saved */}
      {notification?.type === "save" && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 right-6 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-2xl p-6 max-w-md z-50 border-l-4 border-indigo-400"
        >
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <CheckCircle2 className="w-7 h-7 text-white" />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">✓ Invoice Saved</h3>
              <p className="text-sm text-white/90">{notification?.message}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Notification - Invoice Printed */}
      {notification?.type === "print" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-blue-600" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Invoice Printed</h3>
            <p className="text-gray-600">{notification?.message}</p>
          </motion.div>
        </motion.div>
      )}

      {/* Success Notification - SMS Sent */}
      {notification?.type === "sms" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-blue-600" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">SMS Sent</h3>
            <p className="text-gray-600">{notification?.message}</p>
          </motion.div>
        </motion.div>
      )}

      {/* Success Notification - WhatsApp Sent */}
      {notification?.type === "whatsapp" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Message Sent</h3>
            <p className="text-gray-600">{notification?.message}</p>
          </motion.div>
        </motion.div>
      )}

      {/* Payment Processing Modal */}
      {showPaymentModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPaymentModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md max-h-96 overflow-y-auto"
          >
            {/* Cash Payment */}
            {paymentMode === "cash" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">💵 Cash Payment</h3>
                <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-3xl font-bold text-green-600">₹{total.toLocaleString()}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Amount Received</label>
                    <input
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="Enter amount received"
                      className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    />
                  </div>
                  {cashAmount && (
                    <>
                      {parseFloat(cashAmount) >= total ? (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <p className="text-sm text-gray-600">Change to Return</p>
                          <p className="text-2xl font-bold text-blue-600">₹{(parseFloat(cashAmount) - total).toLocaleString()}</p>
                        </div>
                      ) : (
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                          <p className="text-sm text-gray-600">Pending Amount</p>
                          <p className="text-2xl font-bold text-orange-600">₹{(total - parseFloat(cashAmount)).toLocaleString()}</p>
                          <p className="text-xs text-orange-500 mt-2">⚠️ Partial payment - remaining balance due</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-bold"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleCashPayment}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold"
                  >
                    Complete Payment
                  </motion.button>
                </div>
              </div>
            )}

            {/* Card Payment */}
            {paymentMode === "card" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">💳 Card Payment</h3>
                <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-3xl font-bold text-blue-600">₹{total.toLocaleString()}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim())}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-2">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length >= 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                          setCardExpiry(val);
                        }}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-2">CVV</label>
                      <input
                        type="text"
                        value={cardCVV}
                        onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        placeholder="123"
                        maxLength="3"
                        className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-300 hover:bg-slate-400 text-gray-900 rounded-lg font-bold"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleCardPayment}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold"
                  >
                    Pay ₹{total}
                  </motion.button>
                </div>
              </div>
            )}

            {/* UPI Payment */}
            {paymentMode === "upi" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">📱 UPI Payment</h3>
                <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-3xl font-bold text-blue-600">₹{total.toLocaleString()}</p>
                </div>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50 mb-4">
                    <p className="text-2xl mb-2">📲</p>
                    <p className="text-sm font-bold text-gray-700">Scan QR Code</p>
                    <p className="text-xs text-gray-500 mt-1">Using Google Pay or PhonePe</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Or Enter UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@bank"
                      className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-300 hover:bg-slate-400 text-gray-900 rounded-lg font-bold"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleUPIPayment}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold"
                  >
                    Pay ₹{total}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Payment Success Notifications - Enhanced Toast Style */}
      {notification?.type === "cash_success" && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 50 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 50 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="fixed top-6 right-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-6 max-w-md z-50 border-l-4 border-green-300"
        >
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <CheckCircle2 className="w-7 h-7 text-white" />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">💵 Payment Successful</h3>
              <p className="text-sm text-white/90">{notification?.message}</p>
            </div>
          </div>
        </motion.div>
      )}

      {notification?.type === "card_success" && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 50 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 50 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="fixed top-6 right-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl shadow-2xl p-6 max-w-md z-50 border-l-4 border-blue-300"
        >
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <CheckCircle2 className="w-7 h-7 text-white" />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">💳 Payment Successful</h3>
              <p className="text-sm text-white/90">{notification?.message}</p>
            </div>
          </div>
        </motion.div>
      )}

      {notification?.type === "upi_success" && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 50 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 50 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="fixed top-6 right-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-2xl p-6 max-w-md z-50 border-l-4 border-purple-300"
        >
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <CheckCircle2 className="w-7 h-7 text-white" />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">📱 Payment Successful</h3>
              <p className="text-sm text-white/90">{notification?.message}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Next Step Notification - Click Save Invoice */}
      {notification?.type === "next_step" && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 50 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 50 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="fixed top-6 right-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-2xl p-6 max-w-md z-50 border-l-4 border-amber-300"
        >
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <CheckCircle2 className="w-7 h-7 text-white" />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">👇 Next Step</h3>
              <p className="text-sm text-white/90">{notification?.message}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddCustomerModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Customer</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Customer Name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Required - cannot be empty</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="Phone Number (e.g., +91-9876543210)"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">7-20 digits with +, -, (, ) or spaces allowed</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email (Optional)</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="Email Address"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Valid email format required if provided</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={newCustomer.gst}
                  onChange={(e) => setNewCustomer({ ...newCustomer, gst: e.target.value.toUpperCase() })}
                  placeholder="e.g., 27AAPCT0055K1Z0"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">15-char GSTIN format (optional)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addCustomer}
                className="flex-1 py-3 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 transition-all"
              >
                Add Customer
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddCustomerModal(false)}
                className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
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

