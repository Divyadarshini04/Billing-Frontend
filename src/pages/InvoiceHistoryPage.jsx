import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Eye, Download, Trash2, Search, FileText, Filter, Calendar, X, DollarSign } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import { useCompanySettings } from "../context/CompanySettingsContext";
import { NotificationContext } from "../context/NotificationContext";
import { useTaxConfiguration } from "../hooks/useTaxConfiguration";
import * as XLSX from "xlsx";
import { salesAPI, paymentAPI } from "../api/apiService";
import { numberToWords } from "../utils/numberToWords";

export default function InvoiceHistoryPage() {
  const { userRole, user } = useAuth(); // Destructure user for company details
  const { companySettings } = useCompanySettings();
  const taxSettings = useTaxConfiguration();

  const { hasPermission } = usePermissions();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const { addNotification } = useContext(NotificationContext);

  // Get current invoice prefix from company settings
  const getInvoicePrefix = () => {
    return companySettings?.billing_settings?.invoice_prefix || "INV";
  };

  useEffect(() => {
    fetchPaymentMethods();
    fetchInvoices();
  }, [companySettings?.billing_settings?.invoice_prefix]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await paymentAPI.getAllPayments();
      // Get payment methods from the API or set defaults
      setPaymentMethods([
        { id: 1, name: 'cash', display: 'Cash' },
        { id: 2, name: 'card', display: 'Credit/Debit Card' },
        { id: 3, name: 'upi', display: 'UPI' }
      ]);
    } catch (error) {

      // Set default payment methods
      setPaymentMethods([
        { id: 1, name: 'cash', display: 'Cash' },
        { id: 2, name: 'card', display: 'Credit/Debit Card' },
        { id: 3, name: 'upi', display: 'UPI' }
      ]);
    }
  };

  const fetchInvoices = async () => {
    try {

      const response = await salesAPI.getAllSales();

      if (response.data) {
        // Handle pagination 'results' if present
        const rawData = Array.isArray(response.data) ? response.data : (response.data.results || []);

        // Normalize fields (backend uses snake_case, frontend uses camelCase)
        const normalized = rawData.map(inv => {
          const invoiceNo = inv.invoice_number || inv.invoiceNo || `INV-${inv.id}`;

          // Build customer object from various possible sources
          let customerData = {
            name: "Unknown",
            phone: ""
          };

          if (typeof inv.customer === 'object' && inv.customer) {
            // Customer is already an object from backend
            customerData = {
              name: inv.customer.name || inv.customer_name || "Unknown",
              phone: inv.customer.phone || inv.customer_phone || "",
              email: inv.customer.email || inv.customer_email || "",
              gstin: inv.customer.gstin || inv.customer_gstin || ""
            };
          } else {
            // Customer is just an ID, use the flattened fields from serializer
            customerData = {
              name: inv.customer_name || "Unknown",
              phone: (inv.customer_phone && inv.customer_phone.trim()) ? inv.customer_phone : "",
              email: inv.customer_email || "",
              gstin: inv.customer_gstin || ""
            };
          }

          return {
            ...inv,
            id: inv.id,
            invoiceNo: invoiceNo,
            date: inv.invoice_date || inv.date || inv.created_at,
            customer: customerData,
            companyDetails: inv.company_details || {},
            items: (inv.items || []).map((item) => ({
              name: item.product_name || item.name || `Product #${item.product || "?"}`,
              qty: parseFloat(item.quantity || item.qty || 1),
              price: parseFloat(item.unit_price || item.price || 0),
              total: parseFloat(item.line_total || item.total || 0)
            })),
            subtotal: parseFloat(inv.subtotal || 0),
            cgst: parseFloat(inv.cgst_amount || inv.cgst || 0),
            sgst: parseFloat(inv.sgst_amount || inv.sgst || 0),
            total: parseFloat(inv.total_amount || inv.total || 0),
            taxRate: parseFloat(inv.tax_rate || taxSettings.gst_percentage || 18),
            paidAmount: parseFloat(inv.paid_amount || inv.paidAmount || 0),
            paymentStatus: (inv.payment_status === 'paid' || inv.payment_status === 'completed') ? 'Completed' : (inv.payment_status || 'Pending'),
            paymentMode: inv.notes?.includes("Payment Mode:") ? inv.notes.replace("Payment Mode: ", "") : "Cash",
            companyDetails: inv.company_details || {}
          };
        });

        // Sort by date descending
        const sorted = normalized.sort((a, b) => new Date(b.date) - new Date(a.date));

        setInvoices(sorted);
        setFilteredInvoices(sorted);

      } else {

      }
    } catch (error) {

      addNotification("error", "Error", "Failed to load invoices");
    }
  };

  // Filter invoices based on search, filter, and date range
  useEffect(() => {
    let filtered = invoices;

    // Apply search filter
    if (searchQuery.trim()) {

      filtered = filtered.filter(
        (inv) => {
          // Check multiple fields for invoice number
          const invoiceNo = (inv.invoiceNo || inv.invoice_number || "").toString().toLowerCase();
          const customerName = (inv.customer?.name || "").toLowerCase();
          const phoneNumber = (inv.customer?.phone || "").toString();

          const searchLower = searchQuery.toLowerCase();

          const invoiceMatch = invoiceNo.includes(searchLower);
          const customerNameMatch = customerName.includes(searchLower);
          const phoneMatch = phoneNumber.includes(searchQuery);

          if (invoiceMatch || customerNameMatch || phoneMatch) {

            return true;
          }
          return false;
        }
      );

    }

    // Apply payment/status filter
    if (filterBy === "paid") {
      filtered = filtered.filter(
        (inv) => inv.paymentStatus === "Completed" || inv.total === inv.paidAmount
      );
    } else if (filterBy === "pending") {
      filtered = filtered.filter(
        (inv) => inv.paymentStatus !== "Completed" && inv.total !== inv.paidAmount
      );
    }

    // Apply date range filter
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((inv) => new Date(inv.date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((inv) => new Date(inv.date) <= end);
    }

    setFilteredInvoices(filtered);
  }, [searchQuery, filterBy, startDate, endDate, invoices]);

  function clearDateFilters() {
    setStartDate("");
    setEndDate("");
    addNotification("success", "Filters Cleared", "Date filters cleared");
  }

  async function deleteInvoice(invoiceId) {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await salesAPI.deleteSale(invoiceId);
        const updated = invoices.filter((inv) => inv.id !== invoiceId && inv.invoiceNo !== invoiceId);
        setInvoices(updated);
        // We need to re-filter or just update filtered state as well simply:
        setFilteredInvoices(updated.filter(inv => filteredInvoices.find(fi => fi.id === inv.id)));

        setSelectedInvoice(null);
        addNotification("success", "Invoice Deleted", `Invoice deleted successfully`);
        // Refresh full list to be safe
        fetchInvoices();
      } catch (error) {

        addNotification("error", "Error", "Failed to delete invoice");
      }
    }
  }

  async function handleRecordPayment() {
    if (!selectedInvoice) return;

    const amount = parseFloat(paymentAmount);
    const pendingAmount = selectedInvoice.total - selectedInvoice.paidAmount;

    if (!amount || amount <= 0) {
      addNotification("error", "Error", "Please enter a valid amount");
      return;
    }

    if (amount > pendingAmount) {
      addNotification("error", "Error", `Payment amount cannot exceed pending amount of ₹${pendingAmount.toFixed(2)}`);
      return;
    }

    try {

      const paymentData = {
        invoice: selectedInvoice.id,
        amount: amount,
        payment_method: paymentMethod,  // Send as string: 'cash', 'card', 'upi'
        notes: `Payment recorded from Invoice History - ${paymentMethod.toUpperCase()}`
      };

      // Create payment via API
      const response = await paymentAPI.createPayment(paymentData);

      if (response) {
        const newPaidAmount = selectedInvoice.paidAmount + amount;
        const newStatus = newPaidAmount >= selectedInvoice.total ? "Completed" : "Pending";

        addNotification(
          "success",
          "Payment Recorded",
          `₹${amount.toFixed(2)} payment recorded successfully. ${newStatus === "Completed" ? "Invoice fully paid!" : `Pending: ₹${(selectedInvoice.total - newPaidAmount).toFixed(2)}`}`
        );

        // Update the selected invoice with new payment details
        const updatedInvoice = {
          ...selectedInvoice,
          paidAmount: newPaidAmount,
          paymentStatus: newStatus
        };
        setSelectedInvoice(updatedInvoice);

        // Reset payment form
        setPaymentAmount("");
        setPaymentMethod("cash");
        setShowPaymentModal(false);

        // Refresh invoices
        fetchInvoices();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {

      const errorMsg = error.response?.data?.detail || error.response?.data?.payment_method?.[0] || error.message || "Failed to record payment";
      addNotification("error", "Payment Error", errorMsg);
    }
  }

  function exportInvoice(invoice) {
    const data = [{
      "Invoice #": invoice.invoiceNo,
      "Date": new Date(invoice.date).toLocaleDateString(),
      "Customer": invoice.customer?.name || "N/A",
      "Phone": invoice.customer?.phone || "N/A",
      "Items": invoice.items?.length || 0,
      "Subtotal": invoice.subtotal?.toFixed(2) || 0,
      "Tax": ((invoice.cgst || 0) + (invoice.sgst || 0))?.toFixed(2) || 0,
      "Total": invoice.total?.toFixed(2) || 0,
      "Payment Mode": invoice.paymentMode || "N/A",
    }];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice");
    XLSX.writeFile(workbook, `Invoice_${invoice.invoiceNo}.xlsx`);
    addNotification("success", "Exported", "Invoice exported to Excel");
  }

  function viewInvoiceDetails(invoice) {
    setSelectedInvoice(invoice);
  }

  function printInvoice(invoice) {
    const printWindow = window.open("", "_blank");

    const hasBrand = (obj) => obj && Object.keys(obj).length > 1;
    const company = (hasBrand(invoice.companyDetails) ? invoice.companyDetails : null) ||
      (hasBrand(user?.company_profile) ? user.company_profile : null) ||
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

    const totalInWords = numberToWords(invoice.total || 0);

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${invoice.invoiceNo}</title>
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
                <div class="meta-box"><span class="meta-label">Invoice #</span><span class="meta-value">${invoice.invoiceNo}</span></div>
                <div class="meta-box"><span class="meta-label">Date</span><span class="meta-value">${new Date(invoice.date).toLocaleDateString()}</span></div>
                <div class="meta-box"><span class="meta-label">Place of Supply</span><span class="meta-value">${company.state || "N/A"}</span></div>
                <div class="meta-box"><span class="meta-label">Due Date</span><span class="meta-value">${new Date(invoice.date).toLocaleDateString()}</span></div>
              </div>
            </div>

            <!-- Addresses -->
            <div class="address-section">
              <div class="address-box">
                <div class="address-title">Billed To (Customer Details)</div>
                <div style="font-size:12px; font-weight:700;">${invoice.customer?.name || "Walk-in Customer"}</div>
                <div style="font-size:11px; margin-top:3px;">
                  Ph: ${invoice.customer?.phone || "N/A"}<br/>
                  ${invoice.customer?.email ? `Email: ${invoice.customer.email}<br/>` : ""}
                  ${invoice.customer?.gstin ? `<strong>GSTIN: ${invoice.customer.gstin}</strong>` : ""}
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
                ${invoice.items?.map((item, idx) => `
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
                    <td class="text-right">${invoice.taxRate || 18}%</td>
                    <td class="text-right">${((item.price * item.qty) * (1 + (invoice.taxRate || 18) / 100)).toFixed(2)}</td>
                  </tr>
                `).join("")}
                <!-- Fill empty space -->
                ${Array(Math.max(0, 5 - (invoice.items?.length || 0))).fill(0).map(() => `
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
                <div class="total-row"><span>Taxable Amount</span><span>₹${invoice.subtotal?.toFixed(2)}</span></div>
                ${invoice.cgst ? `<div class="total-row"><span>CGST (${(invoice.taxRate || 18) / 2}%)</span><span>₹${invoice.cgst.toFixed(2)}</span></div>` : ""}
                ${invoice.sgst ? `<div class="total-row"><span>SGST (${(invoice.taxRate || 18) / 2}%)</span><span>₹${invoice.sgst.toFixed(2)}</span></div>` : ""}
                ${invoice.igst ? `<div class="total-row"><span>IGST (${invoice.taxRate || 18}%)</span><span>₹${invoice.igst.toFixed(2)}</span></div>` : ""}
                <div class="total-row grand-total">
                  <span style="font-weight: 800; font-size: 14px;">Total</span>
                  <span style="font-weight: 800; font-size: 14px;">₹${invoice.total?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                  <td>${invoice.items?.[0]?.sku || "N/A"}</td>
                  <td>${invoice.subtotal?.toFixed(2)}</td>
                  <td>${(invoice.taxRate || 18) / 2}%</td><td>${(invoice.cgst || 0).toFixed(2)}</td>
                  <td>${(invoice.taxRate || 18) / 2}%</td><td>${(invoice.sgst || 0).toFixed(2)}</td>
                  <td>${((invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0)).toFixed(2)}</td>
                </tr>
                <tr style="font-weight: 800;">
                  <td>TOTAL</td>
                  <td>${invoice.subtotal?.toFixed(2)}</td>
                  <td></td><td>${(invoice.cgst || 0).toFixed(2)}</td>
                  <td></td><td>${(invoice.sgst || 0).toFixed(2)}</td>
                  <td>${((invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0)).toFixed(2)}</td>
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
                   <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=swipe@getswipe.in%26pn=${companyName}%26am=${invoice.total}%26cu=INR" style="width: 70px; height: 70px;" />
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
  }

  // Check if user has permission to view invoices
  if (!hasPermission(userRole, 'view_invoices')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-4 md:p-6 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center max-w-md">
          <FileText className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2">Access Denied</h2>
          <p className="text-red-700 dark:text-red-300">You don't have permission to view invoices. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Invoice History</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">View and manage all saved invoices</p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-card rounded-xl border border-blue-200 dark:border-dark-border p-6 mb-6 shadow-sm"
        >
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice #, customer name, or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
              >
                <option value="all">All Invoices</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Stats */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400">Total Invoices</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{filteredInvoices.length}</p>
            </div>
          </div>

          {/* Second Row - Date Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            {/* Start Date */}
            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <label className="absolute -top-5 left-4 text-xs text-gray-600 font-medium">From Date</label>
            </div>

            {/* End Date */}
            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <label className="absolute -top-5 left-4 text-xs text-gray-600 font-medium">To Date</label>
            </div>

            {/* Clear Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearDateFilters}
              disabled={!startDate && !endDate}
              className="px-4 py-2.5 bg-blue-200 dark:bg-blue-900/40 hover:bg-blue-300 dark:hover:bg-blue-800/60 disabled:bg-blue-100 dark:disabled:bg-blue-900/20 text-blue-700 dark:text-blue-200 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Dates
            </motion.button>

            {/* Date Range Info */}
            {(startDate || endDate) && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-2.5 flex items-center">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {startDate && endDate
                    ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                    : startDate
                      ? `From ${new Date(startDate).toLocaleDateString()}`
                      : `Until ${new Date(endDate).toLocaleDateString()}`}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-dark-card rounded-xl border border-blue-200 dark:border-dark-border p-12 text-center shadow-sm"
          >
            <FileText className="w-16 h-16 text-blue-200 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No invoices found</p>
            <p className="text-gray-500 text-sm mt-2">Create your first invoice in POS Billing</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Invoices List */}
            <div className="lg:col-span-2 space-y-3">
              {filteredInvoices.map((invoice, index) => (
                <motion.div
                  key={invoice.invoiceNo}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => viewInvoiceDetails(invoice)}
                  whileHover={{ scale: 1.02 }}
                  className={`rounded-lg border-2 p-5 cursor-pointer transition-all ${selectedInvoice?.invoiceNo === invoice.invoiceNo
                    ? "bg-blue-100 dark:bg-blue-900/40 border-blue-500 shadow-md"
                    : "bg-white dark:bg-dark-card border-blue-200 dark:border-dark-border hover:border-blue-300 dark:hover:border-blue-700 shadow-sm"
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                          Invoice #{invoice.invoiceNo}
                        </h3>
                        <span className="text-xs px-2.5 py-1 bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full font-semibold">
                          {invoice.paymentMode || "Cash"}
                        </span>
                      </div>
                      <div className="space-y-1 mb-3">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                          {invoice.customer?.name || "Walk-in Customer"}
                        </p>
                        {invoice.customer?.phone && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            📱 {invoice.customer.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(invoice.date).toLocaleDateString()}
                        </span>
                        <span>{invoice.items?.length || 0} items</span>
                        <span className={`font-bold ${invoice.paymentStatus === "Completed"
                          ? "text-gray-800 dark:text-white"
                          : "text-gray-600 dark:text-gray-400"
                          }`}>
                          {invoice.paymentStatus === "Completed" ? "✓ Paid" : "Pending"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">
                        ₹{invoice.total?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) || 0}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Invoice Details Panel */}
            {selectedInvoice && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-indigo-50 dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-slate-700 p-6 shadow-sm h-fit sticky top-6"
              >
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Invoice Details</h3>

                {/* Customer Info */}
                <div className="space-y-3 mb-6 pb-6 border-b border-indigo-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold">Customer</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {selectedInvoice.customer?.name || "Walk-in"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold">Phone</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {selectedInvoice.customer?.phone || "N/A"}
                    </p>
                  </div>
                  {selectedInvoice.customer?.gst && (
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold">GST</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {selectedInvoice.customer.gst}
                      </p>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-2 mb-6 pb-6 border-b border-indigo-200 dark:border-slate-700 max-h-48 overflow-y-auto">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold">Items</p>
                  {selectedInvoice.items?.map((item, idx) => item ? (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{item.name || "Product"}</span>
                      <span className="text-gray-800 dark:text-white font-semibold">
                        ₹{((item.price || 0) * (item.qty || 1)).toFixed(2)}
                      </span>
                    </div>
                  ) : null)}
                </div>

                {/* Summary */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span>Subtotal:</span>
                    <span className="font-semibold">
                      ₹{selectedInvoice.subtotal?.toFixed(2) || 0}
                    </span>
                  </div>
                  {selectedInvoice.cgst && (
                    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                      <span>CGST ({(selectedInvoice.taxRate || 18) / 2}%):</span>
                      <span className="font-semibold">
                        ₹{selectedInvoice.cgst?.toFixed(2) || 0}
                      </span>
                    </div>
                  )}
                  {selectedInvoice.sgst && (
                    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                      <span>SGST ({(selectedInvoice.taxRate || 18) / 2}%):</span>
                      <span className="font-semibold">
                        ₹{selectedInvoice.sgst?.toFixed(2) || 0}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-white pt-2 border-t border-indigo-200 dark:border-slate-700">
                    <span>Total:</span>
                    <span>₹{selectedInvoice.total?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) || 0}</span>
                  </div>
                  {selectedInvoice.paidAmount !== undefined && (
                    <>
                      <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 pt-2">
                        <span>Paid Amount:</span>
                        <span className="font-semibold">₹{selectedInvoice.paidAmount?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) || 0}</span>
                      </div>
                      {(selectedInvoice.total - selectedInvoice.paidAmount) > 0 && (
                        <div className="flex justify-between text-sm font-bold bg-orange-50 p-2 rounded mt-2 border border-orange-200">
                          <span className="text-orange-700">Pending Amount:</span>
                          <span className="text-orange-700">₹{(selectedInvoice.total - selectedInvoice.paidAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {selectedInvoice.paidAmount !== undefined && (selectedInvoice.total - selectedInvoice.paidAmount) > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Record Payment
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => printInvoice(selectedInvoice)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View & Print
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => exportInvoice(selectedInvoice)}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => deleteInvoice(selectedInvoice.id || selectedInvoice.invoiceNo)}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-dark-card rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Record Payment</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Invoice Info */}
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-600">Invoice #</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedInvoice.invoiceNo}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Total Amount</p>
                      <p className="font-bold text-gray-800 dark:text-white">₹{selectedInvoice.total?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Paid</p>
                      <p className="font-bold text-green-600 dark:text-green-400">₹{selectedInvoice.paidAmount?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Amount</p>
                    <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      ₹{(selectedInvoice.total - selectedInvoice.paidAmount).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Payment Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Payment Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-600 font-bold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={selectedInvoice.total - selectedInvoice.paidAmount}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Max: ₹{(selectedInvoice.total - selectedInvoice.paidAmount).toFixed(2)}
                  </p>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['cash', 'card', 'upi'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${paymentMethod === method
                          ? 'bg-green-600 text-white border-2 border-green-600'
                          : 'bg-gray-100 text-gray-800 border-2 border-gray-200 hover:border-green-300'
                          }`}
                      >
                        {method.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-bold text-sm hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRecordPayment}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Record Payment
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
