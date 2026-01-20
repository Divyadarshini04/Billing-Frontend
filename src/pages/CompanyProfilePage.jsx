import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Save, AlertCircle, Loader, Building } from "lucide-react";
import { NotificationContext } from "../context/NotificationContext";
import authAxios from "../api/authAxios";

const InputField = ({ label, value, onChange, type = "text", placeholder, required = false }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
    />
  </div>
);

export default function CompanyProfilePage() {
  const { addNotification } = useContext(NotificationContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      const response = await authAxios.get('/api/common/company/');
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      setCompany(data);
    } catch (error) {
      console.error('Error fetching company profile:', error);
      addNotification('Failed to load company profile', 'error');
      // Initialize empty company
      setCompany({
        company_name: '',
        company_code: '',
        registration_number: '',
        tax_id: '',
        email: '',
        phone: '',
        website: '',
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCompany(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!company.company_name || !company.tax_id || !company.street_address) {
      addNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      setSaving(true);
      const response = await authAxios.patch(`/api/common/company/${company.id}/`, company);
      setCompany(response.data);
      addNotification('Company profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error saving company profile:', error);
      addNotification('Failed to save company profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-red-900 dark:text-red-300">Error</h3>
            <p className="text-red-800 dark:text-red-400 text-sm mt-1">Failed to load company profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Building className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Profile</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 ml-12">Update your company information</p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Company Name"
                value={company.company_name}
                onChange={(val) => handleInputChange('company_name', val)}
                placeholder="e.g., Hatsun Dairy"
                required
              />
              <InputField
                label="Company Code"
                value={company.company_code}
                onChange={(val) => handleInputChange('company_code', val)}
                placeholder="Auto-generated"
              />
              <InputField
                label="Registration Number"
                value={company.registration_number}
                onChange={(val) => handleInputChange('registration_number', val)}
                placeholder="Company Registration Number"
              />
              <InputField
                label="Tax ID (GSTIN)"
                value={company.tax_id}
                onChange={(val) => handleInputChange('tax_id', val)}
                placeholder="e.g., 22AAAAA0000A1Z5"
                required
              />
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Email"
                type="email"
                value={company.email}
                onChange={(val) => handleInputChange('email', val)}
                placeholder="company@example.com"
              />
              <InputField
                label="Phone"
                type="tel"
                value={company.phone}
                onChange={(val) => handleInputChange('phone', val)}
                placeholder="+91 98765 43210"
              />
              <InputField
                label="Website"
                type="url"
                value={company.website}
                onChange={(val) => handleInputChange('website', val)}
                placeholder="https://company.com"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Address</h3>
            <div className="grid grid-cols-1 gap-4">
              <InputField
                label="Street Address"
                value={company.street_address}
                onChange={(val) => handleInputChange('street_address', val)}
                placeholder="123 Main Street"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="City"
                  value={company.city}
                  onChange={(val) => handleInputChange('city', val)}
                  placeholder="e.g., Palani"
                />
                <InputField
                  label="State"
                  value={company.state}
                  onChange={(val) => handleInputChange('state', val)}
                  placeholder="e.g., Tamil Nadu"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Postal Code"
                  value={company.postal_code}
                  onChange={(val) => handleInputChange('postal_code', val)}
                  placeholder="e.g., 624601"
                />
                <InputField
                  label="Country"
                  value={company.country}
                  onChange={(val) => handleInputChange('country', val)}
                  placeholder="India"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-slate-700">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
