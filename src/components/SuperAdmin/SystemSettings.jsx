import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, AlertCircle, Loader, Settings } from "lucide-react";
import { NotificationContext } from "../../context/NotificationContext";
import authAxios from "../../api/authAxios";

export default function SystemSettings() {
  const { addNotification } = useContext(NotificationContext);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await authAxios.get('/api/super-admin/settings-api/');
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      setSettings(data);
    } catch (error) {

      addNotification('Failed to load settings', 'error');
      setMessageType('error');
      setMessage('Failed to load settings: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggle = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);

      // Sanitize payload: Ensure numeric fields are not empty strings
      const payload = {
        ...settings,
        default_trial_days: settings.default_trial_days === '' ? 0 : settings.default_trial_days,
        grace_period_days: settings.grace_period_days === '' ? 0 : settings.grace_period_days,
        gst_percentage: settings.gst_percentage === '' ? 0 : settings.gst_percentage,
        tax_percentage: settings.tax_percentage === '' ? 0 : settings.tax_percentage,
        invoice_starting_number: settings.invoice_starting_number === '' ? 1001 : settings.invoice_starting_number,
        password_min_length: settings.password_min_length === '' ? 8 : settings.password_min_length,
        session_timeout_minutes: settings.session_timeout_minutes === '' ? 30 : settings.session_timeout_minutes,
        max_login_attempts: settings.max_login_attempts === '' ? 5 : settings.max_login_attempts,
        data_retention_days: settings.data_retention_days === '' ? 730 : settings.data_retention_days,
      };

      console.log('Saving Settings Payload:', payload);
      await authAxios.patch('/api/super-admin/settings-api/', payload);
      console.log('Settings Saved Successfully');
      addNotification("Settings saved successfully", "success");
      setMessageType('success');
      setMessage('✅ All Settings saved Successfully');
      setShowToast(true);
      setTimeout(() => setMessage(''), 8000);
      setTimeout(() => setShowToast(false), 8000);
    } catch (error) {
      console.error('Save Settings Error:', error);
      console.error('Error Details:', error.response?.data);
      addNotification("Error saving settings", "error");
      setMessageType('error');
      setMessage('❌ Failed to save settings. Please try again.');
      setShowToast(true);
      setTimeout(() => setMessage(''), 8000);
      setTimeout(() => setShowToast(false), 8000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-800">
        <AlertCircle className="inline w-5 h-5 mr-2" />
        Failed to load settings
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto pb-32 px-4"
    >
      {/* Header Section */}
      <div className="mb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">System Settings</h1>
          </div>
          <p className="text-gray-400 ml-14">Configure platform-wide settings and features</p>
        </motion.div>
      </div>

      {/* Message Alert - Removed: Using toast notification instead */}

      {/* Quick Stats */}
      {/* Quick Stats - Removed */}

      {/* TAX CONFIGURATION */}
      <motion.div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50 rounded-xl p-8 shadow-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Tax Configuration</h2>
          <p className="text-sm text-gray-400 mt-1">Set default tax rules for all businesses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">GST Percentage (%)</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={settings.gst_percentage || 0}
                onChange={(e) => handleInputChange('gst_percentage', parseFloat(e.target.value))}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { key: 'gst_enabled', label: 'Enable GST Globally' }
          ].map(option => (
            <motion.label key={option.key} className="flex items-center p-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-600/50 rounded-lg cursor-pointer transition-all duration-200 group" whileHover={{ x: 4 }}>
              <div className="relative flex items-center h-5 w-5">
                <input
                  type="checkbox"
                  checked={settings[option.key] || false}
                  onChange={() => handleToggle(option.key)}
                  className="w-5 h-5 rounded cursor-pointer accent-yellow-500 appearance-none bg-slate-600 border border-slate-500 checked:bg-yellow-600 checked:border-yellow-500 transition-colors"
                />
              </div>
              <span className="ml-4 text-base text-gray-300 group-hover:text-white transition">{option.label}</span>
            </motion.label>
          ))}
        </div>
      </motion.div>

      {/* 3. INVOICE CONFIGURATION */}
      <motion.div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50 rounded-xl p-8 shadow-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Invoice Configuration</h2>
          <p className="text-sm text-gray-400 mt-1">Global invoice numbering rules</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">INV Prefix</label>
            <input
              type="text"
              value={settings.invoice_prefix || 'INV'}
              onChange={(e) => handleInputChange('invoice_prefix', e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition"
              maxLength="10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">Starting Sequence</label>
            <input
              type="number"
              value={settings.invoice_starting_number || 1001}
              onChange={(e) => handleInputChange('invoice_starting_number', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">Reset Frequency</label>
            <select
              value={settings.auto_reset_frequency || 'MONTHLY'}
              onChange={(e) => handleInputChange('auto_reset_frequency', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
              <option value="NEVER">Never</option>
            </select>
          </div>


        </div>
      </motion.div>

      {/* 4. SUBSCRIPTION & ACCESS */}
      <motion.div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50 rounded-xl p-8 shadow-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Subscription & Access</h2>
          <p className="text-sm text-gray-400 mt-1">Control trial periods and billing access</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">Default Trial Days</label>
            <input
              type="number"
              value={settings.default_trial_days === 0 ? 0 : (settings.default_trial_days || '')}
              onChange={(e) => handleInputChange('default_trial_days', e.target.value === '' ? '' : parseInt(e.target.value))}
              placeholder="7"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">Grace Period (days)</label>
            <input
              type="number"
              value={settings.grace_period_days === 0 ? 0 : (settings.grace_period_days || '')}
              onChange={(e) => handleInputChange('grace_period_days', e.target.value === '' ? '' : parseInt(e.target.value))}
              placeholder="3"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition"
            />
          </div>
        </div>

        <motion.label className="flex items-center p-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-600/50 rounded-lg cursor-pointer transition-all duration-200 group" whileHover={{ x: 4 }}>
          <div className="relative flex items-center h-5 w-5">
            <input
              type="checkbox"
              checked={settings.auto_block_on_expiry || false}
              onChange={() => handleToggle('auto_block_on_expiry')}
              className="w-5 h-5 rounded cursor-pointer accent-cyan-500 appearance-none bg-slate-600 border border-slate-500 checked:bg-cyan-600 checked:border-cyan-500 transition-colors"
            />
          </div>
          <span className="ml-4 text-base text-gray-300 group-hover:text-white transition">Auto-block billing on expiry</span>
        </motion.label>
      </motion.div>

      {/* 5. REGISTRATION CONTROL - Removed */}



      {/* 7. DATA & BACKUP */}
      <motion.div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50 rounded-xl p-8 shadow-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Data & Backup</h2>
          <p className="text-sm text-gray-400 mt-1">Configure backup and data retention policies</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">Backup Frequency</label>
            <select
              value={settings.backup_frequency || 'DAILY'}
              onChange={(e) => handleInputChange('backup_frequency', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">Data Retention (days)</label>
            <div className="relative">
              <input
                type="number"
                value={settings.data_retention_days || 730}
                onChange={(e) => handleInputChange('data_retention_days', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">(0=indefinite)</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { key: 'auto_backup_enabled', label: 'Enable auto-backup' },
            { key: 'allow_data_export', label: 'Allow data export' }
          ].map(option => (
            <motion.label key={option.key} className="flex items-center p-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-600/50 rounded-lg cursor-pointer transition-all duration-200 group" whileHover={{ x: 4 }}>
              <div className="relative flex items-center h-5 w-5">
                <input
                  type="checkbox"
                  checked={settings[option.key] || false}
                  onChange={() => handleToggle(option.key)}
                  className="w-5 h-5 rounded cursor-pointer accent-green-500 appearance-none bg-slate-600 border border-slate-500 checked:bg-green-600 checked:border-green-500 transition-colors"
                />
              </div>
              <span className="ml-4 text-base text-gray-300 group-hover:text-white transition">{option.label}</span>
            </motion.label>
          ))}
        </div>
      </motion.div>

      {/* 8. PLATFORM BRANDING */}
      <motion.div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50 rounded-xl p-8 shadow-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Platform Branding</h2>
          <p className="text-sm text-gray-400 mt-1">Customize platform appearance and branding</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">Platform Name</label>
            <input
              type="text"
              value={settings.platform_name || ''}
              onChange={(e) => handleInputChange('platform_name', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">Company Name</label>
            <input
              type="text"
              value={settings.company_name || ''}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">Support Email</label>
            <input
              type="email"
              value={settings.support_email || ''}
              onChange={(e) => handleInputChange('support_email', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">Support Phone</label>
            <input
              type="tel"
              value={settings.support_phone || ''}
              onChange={(e) => handleInputChange('support_phone', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">Primary Color</label>
            <div className="flex gap-3">
              <input
                type="color"
                value={settings.primary_color || '#3B82F6'}
                onChange={(e) => handleInputChange('primary_color', e.target.value)}
                className="w-14 h-12 bg-slate-700/50 border border-slate-600/50 rounded-lg cursor-pointer hover:border-orange-500/50 transition"
              />
              <input
                type="text"
                value={settings.primary_color || '#3B82F6'}
                onChange={(e) => handleInputChange('primary_color', e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">Default Theme</label>
            <select
              value={settings.default_theme || 'DARK'}
              onChange={(e) => handleInputChange('default_theme', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition"
            >
              <option value="LIGHT">Light</option>
              <option value="DARK">Dark</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Info Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-900/60 to-orange-900/50 border border-amber-500/50 rounded-lg p-6 flex items-start gap-4"
      >
        <AlertCircle className="w-6 h-6 text-amber-300 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold mb-2 text-amber-200">Important Notice</p>
          <p className="text-amber-100 leading-relaxed">These settings affect ALL businesses on the platform. Changes apply immediately across the entire system.</p>
        </div>
      </motion.div>

      {/* Save Button - Sticky Footer */}
      <div className="fixed bottom-0 right-0 left-0 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent p-6 border-t border-slate-700/50">
        <div className="flex justify-end gap-4 max-w-7xl mx-auto px-4">
          <motion.button
            onClick={handleSaveSettings}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/50"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save All Changes
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 20 }}
            className="fixed bottom-24 right-6 z-50"
          >
            <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl font-semibold ${messageType === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
              }`}>
              <span>{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
