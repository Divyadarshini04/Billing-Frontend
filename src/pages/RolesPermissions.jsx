import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  CheckCircle,
  Circle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';

const PERMISSION_CATEGORIES = {
  'Dashboard': ['view_dashboard', 'manage_dashboard'],
  'Customers': ['view_customers', 'manage_customers', 'export_customers', 'import_customers'],
  'Inventory': ['view_inventory', 'manage_inventory', 'export_inventory', 'import_inventory'],
  'POS Billing': ['view_pos', 'manage_pos', 'export_pos'],
  'Invoices': ['view_invoices', 'manage_invoices', 'export_invoices'],
  'Subscription': ['view_subscription', 'manage_subscription'],
  'User Management': ['manage_users', 'assign_roles'],
  'Settings': ['manage_settings', 'view_audit_logs'],
  'Data Management': ['export_all', 'import_all'],
  'Reports': ['view_reports', 'export_reports'],
  // 'Loyalty Management': ['view_loyalty', 'manage_loyalty'],
  'Support': ['view_support'],
};

const ROLE_DESCRIPTIONS = {
  OWNER: 'Can manage dashboard, customers, inventory, POS, invoices, and subscription',
  SALES_EXECUTIVE: 'Sales focused - can manage POS, customers, and invoices',
};

const ROLE_COLORS = {
  OWNER: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
  },
  SALES_EXECUTIVE: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-300',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
  },
};

export default function RolesPermissions() {
  const { userRole } = useAuth();
  const { getPermissions, togglePermission: ctxTogglePermission, resetToDefaults, resetAllPermissions } = usePermissions();

  const [selectedRole, setSelectedRole] = useState('SALES_EXECUTIVE');
  // const [permissions, setPermissions] = useState(getPermissions(selectedRole)); // REMOVED local state
  const permissions = getPermissions(selectedRole); // Use context state directly

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Check if user is admin
  if (userRole !== 'OWNER') {
    return (
      <div className="min-h-screen bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2">Access Denied</h2>
          <p className="text-red-700 dark:text-red-300">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    // setPermissions(getPermissions(role)); // No longer needed
  };

  const togglePermission = (permission) => {
    // const updated = { ...permissions, [permission]: !permissions[permission] };
    // setPermissions(updated);
    // Use context function to update all roles with the new permissions
    ctxTogglePermission(selectedRole, permission);
  };

  const handleResetRole = () => {
    resetToDefaults(selectedRole);
    // setPermissions(getPermissions(selectedRole)); // No longer needed
    setShowResetModal(false);
  };

  const handleResetAll = () => {
    resetAllPermissions();
    // setPermissions(getPermissions(selectedRole));
    setShowResetModal(false);
  };

  const formatPermissionName = (perm) => {
    return perm
      .replace(/_/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const getPermissionCount = (role) => {
    const perms = getPermissions(role);
    return Object.values(perms).filter(v => v).length;
  };

  const getTotalPermissions = () => {
    return Object.keys(getPermissions('OWNER')).length;
  };

  const formatRoleName = (role) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const roles = ['OWNER', 'SALES_EXECUTIVE'];

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6">
      <div className="w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Manage user roles and their system permissions</p>
        </motion.div>

        {/* Role Overview Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {roles.map(role => {
            const colors = ROLE_COLORS[role];
            const permCount = getPermissionCount(role);
            const totalPerms = getTotalPermissions();
            const percentage = Math.round((permCount / totalPerms) * 100);

            return (
              <motion.div
                key={role}
                onClick={() => handleRoleChange(role)}
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${selectedRole === role
                  ? `${colors.bg} ${colors.border} shadow-lg`
                  : `bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border hover:shadow-md dark:shadow-none`
                  }`}
              >
                <div className="flex items-start justify-between gap-2 mb-4 flex-wrap">
                  <h3 className={`text-lg font-bold ${selectedRole === role ? colors.text : 'text-gray-900 dark:text-white'}`}>
                    {formatRoleName(role)}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ${colors.badge}`}>
                    {percentage}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{ROLE_DESCRIPTIONS[role]}</p>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium">{permCount} of {totalPerms} permissions</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Role Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 border border-blue-200 dark:border-dark-border">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Role Summary</h2>

              {/* Current Role Info */}
              <div className={`p-4 rounded-lg mb-4 ${ROLE_COLORS[selectedRole].bg} border ${ROLE_COLORS[selectedRole].border}`}>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Current Role</p>
                <p className={`text-lg font-bold ${ROLE_COLORS[selectedRole].text}`}>{formatRoleName(selectedRole)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{ROLE_DESCRIPTIONS[selectedRole]}</p>
              </div>

              {/* Statistics */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Permissions Granted</span>
                  <span className="font-bold text-gray-900 dark:text-white">{getPermissionCount(selectedRole)}/{getTotalPermissions()}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(getPermissionCount(selectedRole) / getTotalPermissions()) * 100}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setResetTarget(selectedRole);
                    setShowResetModal(true);
                  }}
                  className="w-full px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 font-medium text-sm transition-all"
                >
                  Reset Role
                </button>
                <button
                  onClick={() => {
                    setResetTarget('ALL');
                    setShowResetModal(true);
                  }}
                  className="w-full px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 font-medium text-sm transition-all"
                >
                  Reset All Roles
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Tip:</strong> Changes are saved immediately and applied across the system in real-time.
              </p>
            </div>
          </motion.div>

          {/* Main Permissions Area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-3"
          >
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 border border-blue-200 dark:border-dark-border">
              {/* Header with View Toggle */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-dark-border">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRole} Permissions</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                      }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                      }`}
                  >
                    List
                  </button>
                </div>
              </div>

              {/* Permissions Display */}
              <div className="space-y-8">
                {Object.entries(PERMISSION_CATEGORIES).map(([category, perms]) => (
                  <div key={category}>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      {category}
                    </h3>

                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                        {perms.map(permission => (
                          <button
                            key={permission}
                            onClick={() => togglePermission(permission)}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:shadow-md text-left ${permissions[permission]
                              ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
                              : 'border-gray-200 bg-gray-50 dark:border-dark-border dark:bg-dark-bg/50'
                              }`}
                          >
                            {permissions[permission] ? (
                              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" />
                            )}
                            <span
                              className={`font-medium ${permissions[permission] ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                                }`}
                            >
                              {formatPermissionName(permission)}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 border border-gray-200 dark:border-dark-border rounded-lg divide-y divide-gray-200 dark:divide-dark-border">
                        {perms.map(permission => (
                          <button
                            key={permission}
                            onClick={() => togglePermission(permission)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-left"
                          >
                            <div className="flex items-center gap-3">
                              {permissions[permission] ? (
                                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" />
                              )}
                              <span
                                className={`font-medium ${permissions[permission] ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                                  }`}
                              >
                                {formatPermissionName(permission)}
                              </span>
                            </div>
                            <span className={`text-sm px-3 py-1 rounded-full ${permissions[permission]
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                              }`}>
                              {permissions[permission] ? 'Allowed' : 'Denied'}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-dark-card rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Confirm Reset</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {resetTarget === 'ALL'
                  ? 'This will reset ALL role permissions to their default values. This action cannot be undone.'
                  : `This will reset ${selectedRole} role permissions to their default values. This action cannot be undone.`}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (resetTarget === 'ALL') {
                      handleResetAll();
                    } else {
                      handleResetRole();
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
