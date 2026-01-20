import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Lock, Bell, Moon, Sun, Monitor, Upload,
  Building, CreditCard, Receipt, Percent, Users,
  ChevronRight, Check, AlertCircle, RefreshCw, Smartphone, Globe, Shield, X
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useCompanySettings } from "../context/CompanySettingsContext";
import { usePermissions } from "../context/PermissionsContext";
import { NotificationContext } from "../context/NotificationContext";
import { staffAPI } from "../api/apiService";
import authAxios from "../api/authAxios";

/* -------------------------------------------------------------------------- */
/*                            REUSABLE COMPONENTS                             */
/* -------------------------------------------------------------------------- */

const Tabs = [
  { id: "profile", label: "Company Profile", icon: Building, desc: "Manage your business identity" },
  { id: "appearance", label: "Appearance", icon: Monitor, desc: "Customize invoices & theme" },


  { id: "team", label: "Team & Access", icon: Users, desc: "Manage staff permissions" },

];

const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="mb-8 flex items-start gap-5 p-6 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-blue-100 dark:border-slate-700 shadow-sm">
    <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
      <Icon className="w-8 h-8" />
    </div>
    <div>
      <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h2>
      <p className="text-gray-500 dark:text-blue-200/70 font-medium text-lg mt-1">{description}</p>
    </div>
  </div>
);

const InputField = ({ label, value, onChange, type = "text", disabled, placeholder, className }) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">{label}</label>
    <div className="relative group">
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-5 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 outline-none
          ${disabled
            ? "bg-gray-100 dark:bg-slate-800/50 text-gray-400 border-transparent cursor-not-allowed"
            : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-blue-300 dark:hover:border-slate-600"
          }
        `}
      />
    </div>
  </div>
);

const TextAreaField = ({ label, value, onChange, disabled, rows = 3 }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">{label}</label>
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      rows={rows}
      className={`w-full px-5 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 outline-none resize-none
        ${disabled
          ? "bg-gray-100 dark:bg-slate-800/50 text-gray-400 border-transparent cursor-not-allowed"
          : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-blue-300 dark:hover:border-slate-600"
        }
      `}
    />
  </div>
);

const Toggle = ({ label, checked, onChange, disabled, description }) => (
  <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex-1 pr-4">
      <span className={`block font-bold text-base ${disabled ? 'opacity-50' : 'text-gray-900 dark:text-white'}`}>{label}</span>
      {description && <span className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 block">{description}</span>}
    </div>
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-14 h-8 rounded-full transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md ${checked ? 'left-[calc(100%-1.75rem)]' : 'left-1'}`}
      />
    </button>
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-slate-700 ${className}`}>
    {children}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                             MAIN SETTINGS PAGE                             */
/* -------------------------------------------------------------------------- */

export default function ProfileSettings() {
  const { user, userRole, logout } = useAuth();
  const { companySettings, updateSettings, updateCompanyLogo, refreshSettings } = useCompanySettings();
  const { theme, setTheme } = useTheme();
  const { addNotification } = useContext(NotificationContext);

  const [activeSection, setActiveSection] = useState("profile");
  const [logoPreview, setLogoPreview] = useState(companySettings.logo);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Local form state for Profile
  const [formData, setFormData] = useState({
    company_name: '', email: '', phone: '',
    tax_id: '', registration_number: '',
    street_address: '', city: '', state: '', postal_code: '', country: '',
  });

  // Sync local state with context when context loads
  useEffect(() => {
    if (companySettings) {
      setFormData({
        company_name: companySettings.name || "", // Map name correctly
        email: companySettings.email || "",
        phone: companySettings.phone || "",
        street_address: companySettings.street_address || "",
        city: companySettings.city || "",
        state: companySettings.state || "",
        postal_code: companySettings.postal_code || "",
        country: companySettings.country || "",
        tax_id: companySettings.tax_id || "",
        registration_number: companySettings.registration_number || "",
      });
      setLogoPreview(companySettings.logo);
    }
  }, [companySettings]);

  if (companySettings.loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-400">Loading your profile...</h2>
          <p className="text-gray-500 dark:text-gray-500 mt-2">Please wait while we fetch your settings.</p>
        </div>
      </div>
    );
  }

  const handleSave = async (section = 'root', data = null) => {
    setSaving(true);
    try {
      const payload = data || (section === 'profile' ? {
        company_name: formData.company_name,
        email: formData.email,
        phone: formData.phone,
        tax_id: formData.tax_id,
        registration_number: formData.registration_number,
        street_address: formData.street_address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country,
        logo_url: logoPreview,
      } : companySettings);

      const targetSection = section === 'profile' ? 'root' : section;

      // Update settings - the context will handle state updates from the response
      await updateSettings(targetSection, payload);

      // Artificial delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);

      addNotification('Settings saved successfully', 'success');
    } catch (e) {
      console.error(e);
      addNotification(e.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result); // Update preview only
      };
      reader.readAsDataURL(file);
    } else {
      addNotification("File too large (max 5MB)", "error");
    }
  };

  if (companySettings.loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="flex flex-col items-center animate-pulse">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <h2 className="text-xl font-bold text-gray-400">Loading Configuration...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F3F4F6] dark:bg-[#0B1120] overflow-hidden font-sans">

      {/* SIDEBAR */}
      <div className="w-80 bg-white dark:bg-[#111827] border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0 z-20 shadow-xl">
        <div className="p-8 pb-4">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Settings</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">Manage your workspace</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-2 py-4 custom-scrollbar">
          {Tabs.map(tab => {
            const isActive = activeSection === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`group w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200 border border-transparent
                            ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:border-gray-100 dark:hover:border-slate-700'
                  }
                        `}
              >
                <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <span className="block font-bold text-[15px]">{tab.label}</span>
                  <span className={`text-[11px] font-medium opacity-80 ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                    {tab.desc}
                  </span>
                </div>
              </button>
            )
          })}
        </nav>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto relative scroll-smooth">
        <div className="max-w-5xl mx-auto p-10 pb-32">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {activeSection === 'profile' && (
              <div className="space-y-8">
                <SectionHeader icon={Building} title="Company Profile" description="Your business identity and contact information" />

                <Card className="flex flex-col md:flex-row gap-10 items-start">
                  <div className="w-full md:w-1/3 flex flex-col items-center text-center space-y-4">
                    <div className="relative group w-48 h-48 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 p-1 ring-8 ring-white dark:ring-slate-900 shadow-2xl">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-900 flex items-center justify-center">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Building className="w-16 h-16 text-gray-300 dark:text-slate-600" />
                        )}
                      </div>
                      {userRole === 'OWNER' && (
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all rounded-full cursor-pointer backdrop-blur-sm">
                          <div className="flex flex-col items-center">
                            <Upload className="w-8 h-8 mb-1" />
                            <span className="text-xs font-bold uppercase tracking-widest">Change</span>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        </label>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">Business Logo</h3>
                      <p className="text-sm text-gray-500">Visible on invoices & reports</p>
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-6">
                    <InputField label="Business Name" value={formData.company_name} onChange={v => setFormData({ ...formData, company_name: v })} disabled={userRole !== 'OWNER'} />

                    <div className="grid grid-cols-2 gap-6">
                      <InputField label="Phone Number" value={formData.phone} onChange={v => setFormData({ ...formData, phone: v })} disabled={userRole !== 'OWNER'} />
                      <InputField label="Email Address" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} disabled={userRole !== 'OWNER'} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <InputField label="GST / Tax ID" value={formData.tax_id} onChange={v => setFormData({ ...formData, tax_id: v })} disabled={userRole !== 'OWNER'} />
                      <InputField label="Registration No." value={formData.registration_number} onChange={v => setFormData({ ...formData, registration_number: v })} disabled={userRole !== 'OWNER'} />
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" /> Location Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField className="md:col-span-2" label="Street Address" value={formData.street_address} onChange={v => setFormData({ ...formData, street_address: v })} disabled={userRole !== 'OWNER'} />
                    <InputField label="City" value={formData.city} onChange={v => setFormData({ ...formData, city: v })} disabled={userRole !== 'OWNER'} />
                    <InputField label="State / Province" value={formData.state} onChange={v => setFormData({ ...formData, state: v })} disabled={userRole !== 'OWNER'} />
                    <InputField label="Postal Code" value={formData.postal_code} onChange={v => setFormData({ ...formData, postal_code: v })} disabled={userRole !== 'OWNER'} />
                    <InputField label="Country" value={formData.country} onChange={v => setFormData({ ...formData, country: v })} disabled={userRole !== 'OWNER'} />
                  </div>
                </Card>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-8">
                <SectionHeader icon={Monitor} title="Theme & Appearance" description="Customize how the application and invoices look" />
                <Card>
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { id: 'light', icon: Sun, label: 'Light Mode' },
                      { id: 'dark', icon: Moon, label: 'Dark Mode' },
                      { id: 'system', icon: Monitor, label: 'System Default' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setTheme(opt.id)}
                        className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all duration-200
                                            ${theme === opt.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold shadow-lg shadow-blue-500/10'
                            : 'border-gray-100 dark:border-slate-700 text-gray-400 hover:border-gray-200'
                          }
                                        `}
                      >
                        <opt.icon className="w-8 h-8" />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </Card>

                <Card>
                  <h3 className="text-xl font-bold mb-6">Invoice Customization</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <Toggle label="Show Logo on Invoice" checked={companySettings.invoice_appearance?.show_logo} onChange={v => updateSettings('invoice_appearance', { show_logo: v })} />
                      <Toggle label="Show GST Breakdown" checked={companySettings.invoice_appearance?.show_gst_breakdown} onChange={v => updateSettings('invoice_appearance', { show_gst_breakdown: v })} />
                      <TextAreaField label="Invoice Footer Terms" value={companySettings.invoice_appearance?.terms} onChange={e => updateSettings('invoice_appearance', { terms: e.target.value })} />
                    </div>
                    <div className="bg-gray-100 dark:bg-slate-900 rounded-2xl p-6 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700">
                      <div className="text-center">
                        <p className="text-gray-400 font-bold mb-2">Signature Preview</p>
                        {companySettings.invoice_appearance?.signature_url ? (
                          <img src={companySettings.invoice_appearance?.signature_url} className="h-24 object-contain mx-auto" />
                        ) : (
                          <p className="text-xs text-gray-500">No signature uploaded</p>
                        )}
                        <label className="mt-4 inline-block px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-sm font-bold cursor-pointer hover:bg-gray-50">
                          Upload Signature
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const r = new FileReader();
                              r.onload = () => updateSettings('invoice_appearance', { signature_url: r.result });
                              r.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}





            {activeSection === 'team' && <TeamSettings />}





          </motion.div>
        </div>
      </div>

      {/* FLOAT SAVE BUTTON */}
      {userRole === 'OWNER' && activeSection === 'profile' && (
        <div className="absolute bottom-8 right-12 z-50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSave('profile')}
            disabled={saving}
            className="flex items-center gap-3 px-8 py-4 bg-gray-900 dark:bg-blue-600 text-white rounded-full font-bold shadow-2xl shadow-black/20 hover:shadow-black/40 transition-all"
          >
            {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : success ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saving ? "Saving Changes..." : success ? "Saved Successfully" : "Save Configuration"}
          </motion.button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                SUB-COMPONENTS                              */
/* -------------------------------------------------------------------------- */


const MemberModal = ({ member, onClose, onSuccess, isLimitReached, limitMessage }) => {
  const isEditing = !!member;
  const [formData, setFormData] = useState({
    first_name: member?.first_name || '',
    last_name: member?.last_name || '',
    email: member?.email || member?.username || '',
    phone: member?.phone || '',
    password: '',
    role: member?.role || 'SALES_EXECUTIVE'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (limitMessage) {
      setError(limitMessage);
    }
  }, [limitMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLimitReached && !isEditing) return;

    setLoading(true);
    setError('');

    try {
      if (isEditing) {
        // For editing, only send populated fields or changed fields
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // Don't send empty password

        await staffAPI.updateStaff(member.id, payload);
      } else {
        await staffAPI.createStaff({
          ...formData,
          username: formData.email, // Use email as username by default
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Staff creation failed:", err.response?.data);
      const detail = err.response?.data?.detail;
      const fieldErrors = err.response?.data;

      if (detail) {
        setError(detail);
      } else if (fieldErrors) {
        // Construct error message from field errors
        const messages = Object.entries(fieldErrors).map(([key, val]) => {
          const fieldName = key.charAt(0).toUpperCase() + key.slice(1);
          const errorMsg = Array.isArray(val) ? val.join(', ') : val;
          return `${fieldName}: ${errorMsg}`;
        }).join(' | ');
        setError(messages || 'Failed to create staff member');
      } else {
        setError(`Failed to ${isEditing ? 'update' : 'create'} staff member`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Team Member' : 'Add New Team Member'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          {error && (
            <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${isLimitReached ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-red-50 text-red-600'}`}>
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="First Name"
              value={formData.first_name}
              onChange={v => setFormData({ ...formData, first_name: v })}
              placeholder="e.g. John"
              disabled={isLimitReached}
            />
            <InputField
              label="Last Name"
              value={formData.last_name}
              onChange={v => setFormData({ ...formData, last_name: v })}
              placeholder="Doe"
              disabled={isLimitReached}
            />
          </div>

          <InputField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={v => setFormData({ ...formData, email: v })}
            placeholder="john@example.com"
            disabled={isLimitReached}
          />

          <InputField
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={v => setFormData({ ...formData, phone: v })}
            placeholder="+91 98765 43210"
            disabled={isLimitReached}
          />

          <InputField
            label="Password"
            type="password"
            value={formData.password}
            onChange={v => setFormData({ ...formData, password: v })}
            placeholder="Create a password"
            disabled={isLimitReached && !isEditing}
          />
          {isEditing && <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (isLimitReached && !isEditing)}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              {loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Member')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const TeamSettings = () => {
  const { user, login } = useAuth();
  const { addNotification } = useContext(NotificationContext);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Calculate Limit Status
  const maxStaff = user?.max_staff_allowed;
  const activeStaffCount = staff.filter(s => s.is_active).length;
  // Check if limit exists (non-zero) and is reached
  const isLimitReached = (maxStaff && maxStaff > 0 && activeStaffCount >= maxStaff);
  const limitMessage = isLimitReached
    ? `You have reached the maximum number of staff members (${maxStaff}) allowed for your current plan. Please upgrade to add more staff.`
    : '';

  const fetchStaff = () => {
    setLoading(true);
    staffAPI.getAllStaff()
      .then(res => setStaff(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Refresh user data to ensure limits are up to date
  useEffect(() => {
    authAxios.get('/auth/user/')
      .then(res => {
        if (res.data) login(res.data);
      })
      .catch(err => console.error("Failed to refresh user profile", err));
  }, []);

  useEffect(() => {
    fetchStaff();
  }, []);

  const toggleStatus = async (id, status) => {
    const newStatus = !status;
    setStaff(prev => prev.map(u => u.id === id ? { ...u, is_active: newStatus } : u));
    await staffAPI.updateStaff(id, { is_active: newStatus });
  };

  const handleAddMemberClick = () => {
    setEditingMember(null);
    setShowModal(true);
  };

  const handleEditMemberClick = (member) => {
    setEditingMember(member);
    setShowModal(true);
  };

  return (
    <div className="space-y-8">
      <SectionHeader icon={Users} title="Team Management" description="Control access for your sales executives" />
      <Card className="overflow-hidden p-0">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-lg">Active Staff Members</h3>
          <button onClick={handleAddMemberClick} className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition">
            + Add New Member
          </button>
        </div>
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading team...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-900/50 text-xs font-bold uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No staff members found. Add one to get started.
                  </td>
                </tr>
              ) : staff.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-white">{user.first_name} {user.last_name}</div>
                    <div className="text-xs text-gray-500">{user.email || user.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900/30 dark:text-blue-300">Sales Executive</span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleStatus(user.id, user.is_active)} className={`px-3 py-1 rounded-full text-xs font-bold border ${user.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      {user.is_active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEditMemberClick(user)}
                      className="text-blue-600 font-bold text-sm hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <AnimatePresence>
        {showModal && (
          <MemberModal
            member={editingMember}
            onClose={() => setShowModal(false)}
            onSuccess={fetchStaff}
            isLimitReached={isLimitReached}
            limitMessage={limitMessage}
          />
        )}
      </AnimatePresence>
    </div>
  )
}


