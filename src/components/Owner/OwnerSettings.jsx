import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { User, Lock, Bell, Palette, LogOut, Save, Building, Loader, CheckCircle, AlertCircle } from "lucide-react";
import authAxios from "../../api/authAxios";
import { NotificationContext } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";

export default function OwnerSettings() {
  const { addNotification } = useContext(NotificationContext);
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data States
  const [companyProfile, setCompanyProfile] = useState({
    company_name: "",
    email: "",
    phone: "",
    tax_id: "",
    registration_number: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    currency: "INR"
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    email_enabled: true,
    sms_enabled: false,
    in_app_enabled: true,
    notification_types: {
      low_stock: true,
      daily_sales: true,
      new_order: true
    }
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch Company Profile
      const companyRes = await authAxios.get('/api/common/company/active/');
      if (companyRes.data) {
        setCompanyProfile(prev => ({ ...prev, ...companyRes.data }));
      }

      // Fetch Notification Preferences
      try {
        const notifRes = await authAxios.get('/api/common/notifications/my_preferences/');
        if (notifRes.data) {
          setNotificationPrefs(prev => ({ ...prev, ...notifRes.data }));
        }
      } catch (err) {
        // If 404, it might not exist yet, which is fine (we use defaults)
        console.log("No notification preferences found, using defaults");
      }

    } catch (error) {
      console.error("Error fetching settings:", error);
      addNotification("Failed to load settings data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      await authAxios.patch(`/api/common/company/${companyProfile.id}/`, companyProfile);
      addNotification("Company profile updated successfully", "success");
    } catch (error) {
      console.error("Error updating profile:", error);
      addNotification("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      setSaving(true);
      // Check if ID exists to determine update vs create
      if (notificationPrefs.id) {
        await authAxios.patch(`/api/common/notifications/${notificationPrefs.user}/`, notificationPrefs);
      } else {
        await authAxios.post('/api/common/notifications/', notificationPrefs);
      }

      addNotification("Notification preferences saved", "success");
      // Refresh to get ID if created
      const notifRes = await authAxios.get('/api/common/notifications/my_preferences/');
      if (notifRes.data) {
        setNotificationPrefs(prev => ({ ...prev, ...notifRes.data }));
      }
    } catch (error) {
      console.error("Error updating notifications:", error);
      addNotification("Failed to update notifications", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      addNotification("New passwords do not match", "error");
      return;
    }
    if (securityData.newPassword.length < 6) {
      addNotification("Password must be at least 6 characters", "error");
      return;
    }

    try {
      setSaving(true);
      // Assuming a standard Django auth password change endpoint or similar
      // If not standard, we might need to check if there's a specific endpoint
      await authAxios.post('/api/auth/change-password/', {
        old_password: securityData.currentPassword,
        new_password: securityData.newPassword
      });

      addNotification("Password changed successfully", "success");
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error changing password:", error);
      addNotification(error.response?.data?.detail || "Failed to change password", "error");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Company Profile", icon: Building },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-cyan-500" />
        <span className="ml-2 text-slate-400">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
        <p className="text-slate-400">Manage your company profile and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap border-b border-slate-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition flex items-center gap-2 border-b-2 ${activeTab === tab.id
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-white"
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Company Profile Tab */}
      {activeTab === "profile" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-cyan-400" />
              Company Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyProfile.company_name}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, company_name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={companyProfile.email}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                <input
                  type="text"
                  value={companyProfile.phone}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tax ID (GSTIN)</label>
                <input
                  type="text"
                  value={companyProfile.tax_id}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, tax_id: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h4 className="text-md font-semibold text-slate-300 mb-4">Address Information</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Street Address</label>
                  <textarea
                    rows="2"
                    value={companyProfile.street_address}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, street_address: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
                  <input
                    type="text"
                    value={companyProfile.city}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, city: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
                  <input
                    type="text"
                    value={companyProfile.state}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, state: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Postal Code</label>
                  <input
                    type="text"
                    value={companyProfile.postal_code}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, postal_code: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
                  <select
                    value={companyProfile.currency}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, currency: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleProfileUpdate}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              Change Password
            </h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                <input
                  type="password"
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <input
                  type="password"
                  value={securityData.newPassword}
                  onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={securityData.confirmPassword}
                  onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePasswordChange}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : "Update Password"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 space-y-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan-400" />
              Notification Preferences
            </h3>

            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Channels</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-slate-700">
                    <div>
                      <p className="text-white font-medium">Email Notifications</p>
                      <p className="text-slate-500 text-sm">Receive updates via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.email_enabled}
                      onChange={(e) => setNotificationPrefs({ ...notificationPrefs, email_enabled: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-cyan-600 focus:ring-cyan-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-slate-700">
                    <div>
                      <p className="text-white font-medium">SMS Notifications</p>
                      <p className="text-slate-500 text-sm">Receive updates via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.sms_enabled}
                      onChange={(e) => setNotificationPrefs({ ...notificationPrefs, sms_enabled: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-cyan-600 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Alert Types</h4>
                <div className="space-y-3">
                  {[
                    { id: "low_stock", label: "Low Stock Alerts", desc: "Get notified when inventory is running low" },
                    { id: "daily_sales", label: "Daily Sales Report", desc: "Receive specific daily summaries" },
                    { id: "new_order", label: "New Orders", desc: "Get notified when a new order is placed" }
                  ].map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-700/50">
                      <div>
                        <p className="text-white font-medium">{item.label}</p>
                        <p className="text-slate-500 text-sm">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationPrefs.notification_types?.[item.id] || false}
                        onChange={(e) => setNotificationPrefs({
                          ...notificationPrefs,
                          notification_types: {
                            ...notificationPrefs.notification_types,
                            [item.id]: e.target.checked
                          }
                        })}
                        className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-cyan-600 focus:ring-cyan-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNotificationUpdate}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Preferences
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Logout Button */}
      <div className="pt-6 border-t border-slate-700">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg font-medium hover:bg-red-500/20 transition flex items-center gap-2 w-full justify-center sm:w-auto"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </motion.button>
      </div>
    </div>
  );
}
