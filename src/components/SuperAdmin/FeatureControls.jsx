import React, { useState, useEffect, useContext } from "react";
import { Lock, Save, ChevronDown, ChevronUp, LayoutDashboard, Receipt, FileText, Package, Users, CreditCard, DollarSign } from "lucide-react";
import { NotificationContext } from "../../context/NotificationContext";
import authAxios from "../../api/authAxios";

export default function FeatureControls() {
  const { addNotification } = useContext(NotificationContext);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    dashboard: true,
    billing: true,
    invoices: true,
    inventory: true,
    customers: true,
    payments: true,
    tax: true,
  });

  const [settings, setSettings] = useState({
    // 1. Dashboard Module
    dashboard_enable: true,
    dashboard_kpi_cards: true,
    dashboard_recent_orders: true,
    
    // 2. POS Billing Module
    billing_create_invoice: true,
    billing_cancel_invoice: true,
    billing_complete_payment: true,
    billing_print_pdf: true,
    
    // 3. Invoice Management Module
    invoices_history_access: true,
    invoices_reprint_download: true,
    invoices_number_lock: true,
    
    // 4. Products & Inventory Module
    inventory_module_enable: true,
    inventory_add_edit_products: true,
    inventory_stock_deduction: true,
    
    // 5. Customers Module
    customers_module_enable: true,
    customers_add_view: true,
    customers_outstanding_tracking: true,
    
    // 6. Payments Module
    payments_cash: true,
    payments_upi_digital: true,
    payments_credit_pay_later: true,
    payments_refund: true,
    
    // 7. Tax & GST Module
    tax_gst_enable: true,
    tax_calculation: true,
    tax_display_on_invoice: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await authAxios.get('/api/super-admin/settings/');
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setSettings(data);
    } catch (error) {

      addNotification("Error loading feature controls", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        // Dashboard
        dashboard_enable: settings.dashboard_enable,
        dashboard_kpi_cards: settings.dashboard_kpi_cards,
        dashboard_recent_orders: settings.dashboard_recent_orders,
        
        // POS Billing
        billing_create_invoice: settings.billing_create_invoice,
        billing_cancel_invoice: settings.billing_cancel_invoice,
        billing_complete_payment: settings.billing_complete_payment,
        billing_print_pdf: settings.billing_print_pdf,
        
        // Invoice Management
        invoices_history_access: settings.invoices_history_access,
        invoices_reprint_download: settings.invoices_reprint_download,
        invoices_number_lock: settings.invoices_number_lock,
        
        // Products & Inventory
        inventory_module_enable: settings.inventory_module_enable,
        inventory_add_edit_products: settings.inventory_add_edit_products,
        inventory_stock_deduction: settings.inventory_stock_deduction,
        
        // Customers
        customers_module_enable: settings.customers_module_enable,
        customers_add_view: settings.customers_add_view,
        customers_outstanding_tracking: settings.customers_outstanding_tracking,
        
        // Payments
        payments_cash: settings.payments_cash,
        payments_upi_digital: settings.payments_upi_digital,
        payments_credit_pay_later: settings.payments_credit_pay_later,
        payments_refund: settings.payments_refund,
        
        // Tax & GST
        tax_gst_enable: settings.tax_gst_enable,
        tax_calculation: settings.tax_calculation,
        tax_display_on_invoice: settings.tax_display_on_invoice,
      };

      await authAxios.patch('/api/super-admin/settings-api/', payload);
      addNotification("Feature controls saved successfully", "success");
    } catch (error) {

      addNotification(error.response?.data?.detail || "Error saving feature controls", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const ToggleSwitch = ({ field, label, description }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition">
      <div className="flex-1">
        <label className="text-sm font-medium text-slate-200 cursor-pointer flex items-center gap-2">
          {label}
        </label>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </div>
      <button
        onClick={() => handleToggle(field)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          settings[field] ? "bg-green-600" : "bg-slate-600"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            settings[field] ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  const SectionHeader = ({ title, subtitle, icon: Icon, section }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
    >
      <div className="flex items-center gap-3 text-left">
        <Icon className="w-5 h-5 text-blue-400" />
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-slate-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-slate-400" />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-400">Loading feature controls...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Lock className="w-6 h-6 text-blue-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Super Admin – Feature Control</h2>
          <p className="text-sm text-slate-400 mt-1">Top 7 Must-Have Modules (Minimum for Working, Sellable SaaS)</p>
        </div>
      </div>

      {/* 1. Dashboard Module */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <SectionHeader
          title="Dashboard"
          subtitle="Owner must see business status"
          icon={LayoutDashboard}
          section="dashboard"
        />
        {expandedSections.dashboard && (
          <div className="p-4 space-y-3 border-t border-slate-700">
            <ToggleSwitch
              field="dashboard_enable"
              label="Dashboard Enable"
              description="Enable/disable entire dashboard"
            />
            <ToggleSwitch
              field="dashboard_kpi_cards"
              label="KPI Cards"
              description="Revenue, Customers, Products cards"
            />
            <ToggleSwitch
              field="dashboard_recent_orders"
              label="Recent Orders"
              description="Show latest billing transactions"
            />
          </div>
        )}
      </div>

      {/* 2. POS Billing Module */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <SectionHeader
          title="POS Billing"
          subtitle="Core purpose of billing software"
          icon={Receipt}
          section="billing"
        />
        {expandedSections.billing && (
          <div className="p-4 space-y-3 border-t border-slate-700">
            <div className="bg-red-900/20 border border-red-700 rounded p-3 mb-3">
              <p className="text-sm text-red-300">These directly affect billing operations</p>
            </div>
            <ToggleSwitch
              field="billing_create_invoice"
              label="Create Invoice"
              description="Allow creating new invoices"
            />
            <ToggleSwitch
              field="billing_cancel_invoice"
              label="Cancel / Void Invoice"
              description="Allow canceling invoices"
            />
            <ToggleSwitch
              field="billing_complete_payment"
              label="Complete Payment"
              description="Mark payments as complete"
            />
            <ToggleSwitch
              field="billing_print_pdf"
              label="Print / PDF Invoice"
              description="Generate and print invoices"
            />
          </div>
        )}
      </div>

      {/* 3. Invoice Management Module */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <SectionHeader
          title="Invoice Management"
          subtitle="Legal record & history"
          icon={FileText}
          section="invoices"
        />
        {expandedSections.invoices && (
          <div className="p-4 space-y-3 border-t border-slate-700">
            <ToggleSwitch
              field="invoices_history_access"
              label="Invoice History Access"
              description="View past invoices"
            />
            <ToggleSwitch
              field="invoices_reprint_download"
              label="Reprint / Download Invoice"
              description="Get copies of old invoices"
            />
            <ToggleSwitch
              field="invoices_number_lock"
              label="Invoice Number Lock"
              description="Prevent changing invoice numbers"
            />
          </div>
        )}
      </div>

      {/* 4. Products & Inventory Module */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <SectionHeader
          title="Products & Inventory"
          subtitle="Billing needs products"
          icon={Package}
          section="inventory"
        />
        {expandedSections.inventory && (
          <div className="p-4 space-y-3 border-t border-slate-700">
            <ToggleSwitch
              field="inventory_module_enable"
              label="Inventory Module Enable"
              description="Full inventory management access"
            />
            <ToggleSwitch
              field="inventory_add_edit_products"
              label="Add / Edit Products"
              description="Create and modify products"
            />
            <ToggleSwitch
              field="inventory_stock_deduction"
              label="Stock Deduction on Billing"
              description="Automatically reduce stock on sale"
            />
          </div>
        )}
      </div>

      {/* 5. Customers Module */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <SectionHeader
          title="Customers"
          subtitle="Customer-based billing & credit"
          icon={Users}
          section="customers"
        />
        {expandedSections.customers && (
          <div className="p-4 space-y-3 border-t border-slate-700">
            <ToggleSwitch
              field="customers_module_enable"
              label="Customer Module Enable"
              description="Full customer management access"
            />
            <ToggleSwitch
              field="customers_add_view"
              label="Add / View Customers"
              description="Create and manage customers"
            />
            <ToggleSwitch
              field="customers_outstanding_tracking"
              label="Outstanding Amount Tracking"
              description="Track customer dues & credits"
            />
          </div>
        )}
      </div>

      {/* 6. Payments Module */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <SectionHeader
          title="Payments"
          subtitle="Money handling must be controlled"
          icon={CreditCard}
          section="payments"
        />
        {expandedSections.payments && (
          <div className="p-4 space-y-3 border-t border-slate-700">
            <ToggleSwitch
              field="payments_cash"
              label="Cash Payment"
              description="Accept cash payments"
            />
            <ToggleSwitch
              field="payments_upi_digital"
              label="UPI / Digital Payment"
              description="Accept digital payment methods"
            />
            <ToggleSwitch
              field="payments_credit_pay_later"
              label="Credit / Pay Later"
              description="Allow customer credit/due system"
            />
            <ToggleSwitch
              field="payments_refund"
              label="Refund Enable"
              description="Allow refunding transactions"
            />
          </div>
        )}
      </div>

      {/* 7. Tax & GST Module */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <SectionHeader
          title="Tax / GST"
          subtitle="Legal compliance (India)"
          icon={DollarSign}
          section="tax"
        />
        {expandedSections.tax && (
          <div className="p-4 space-y-3 border-t border-slate-700">
            <ToggleSwitch
              field="tax_gst_enable"
              label="GST Enable / Disable"
              description="Turn GST calculations on/off"
            />
            <ToggleSwitch
              field="tax_calculation"
              label="Tax Calculation on Invoice"
              description="Automatically calculate tax amounts"
            />
            <ToggleSwitch
              field="tax_display_on_invoice"
              label="GST Display on Invoice"
              description="Show tax breakdown on invoice"
            />
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex gap-3 justify-end pt-6 border-t border-slate-700">
        <button
          onClick={() => fetchSettings()}
          className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          disabled={saving}
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save All Controls"}
        </button>
      </div>
    </div>
  );
}
