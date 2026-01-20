/**
 * Permission Helper Utilities
 * These functions help enforce permissions across the application
 */

/**
 * Check if a user can perform an action
 * @param {string} userRole - The user's role (ADMIN, SALES_EXECUTIVE)
 * @param {string} permission - The permission key to check
 * @param {object} permissionsContext - The permissions context with hasPermission method
 * @returns {boolean} - Whether the user has the permission
 */
export const canUserAction = (userRole, permission, permissionsContext) => {
  if (!userRole || !permission || !permissionsContext) return false;
  return permissionsContext.hasPermission(userRole, permission);
};

/**
 * Check if user can view a feature
 */
export const canView = (userRole, feature, permissionsContext) => {
  return canUserAction(userRole, `view_${feature}`, permissionsContext);
};

/**
 * Check if user can manage/edit a feature
 */
export const canManage = (userRole, feature, permissionsContext) => {
  return canUserAction(userRole, `manage_${feature}`, permissionsContext);
};

/**
 * Check if user can export data
 */
export const canExport = (userRole, feature, permissionsContext) => {
  const exportKey = feature === 'all' ? 'export_all' : `export_${feature}`;
  return canUserAction(userRole, exportKey, permissionsContext);
};

/**
 * Check if user can import data
 */
export const canImport = (userRole, feature, permissionsContext) => {
  const importKey = feature === 'all' ? 'import_all' : `import_${feature}`;
  return canUserAction(userRole, importKey, permissionsContext);
};

/**
 * Get list of accessible features for a role
 */
export const getAccessibleFeatures = (userRole, permissionsContext) => {
  const permissions = permissionsContext.getPermissions(userRole);
  return Object.keys(permissions).filter(key => permissions[key]);
};

/**
 * Check if action is allowed with fallback message
 */
export const checkPermissionWithMessage = (userRole, permission, permissionsContext) => {
  const hasPermission = canUserAction(userRole, permission, permissionsContext);
  
  if (!hasPermission) {
    return {
      allowed: false,
      message: `Your role (${userRole}) doesn't have permission to perform this action.`
    };
  }
  
  return { allowed: true, message: null };
};

/**
 * Role-based feature access map
 */
export const ROLE_FEATURES = {
  ADMIN: [
    'dashboard', 'customers', 'inventory', 'reports', 'pos', 'invoices',
    'subscription', 'users', 'settings', 'audit_logs', 'export', 'import'
  ],
  SALES_EXECUTIVE: [
    'dashboard', 'customers', 'inventory', 'pos', 'invoices', 'reports', 'export'
  ]
};

/**
 * Check if role has access to feature
 */
export const roleHasFeature = (userRole, feature) => {
  return ROLE_FEATURES[userRole]?.includes(feature) || false;
};
