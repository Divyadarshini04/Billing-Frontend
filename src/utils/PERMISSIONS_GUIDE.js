/**
 * Permission Testing Guide
 * 
 * This file documents how permissions work in the billing application
 * for ADMIN and SALES_EXECUTIVE roles
 */

// ========================
// PERMISSION STRUCTURE
// ========================

const PERMISSION_CATEGORIES = {
  Dashboard: ['view_dashboard', 'manage_dashboard'],
  Customers: ['view_customers', 'manage_customers', 'export_customers', 'import_customers'],
  Inventory: ['view_inventory', 'manage_inventory', 'export_inventory', 'import_inventory'],
  Reports: ['view_reports', 'manage_reports', 'export_reports'],
  POS: ['view_pos', 'manage_pos', 'export_pos'],
  Invoices: ['view_invoices', 'manage_invoices', 'export_invoices'],
  Subscription: ['view_subscription', 'manage_subscription'],
  Users: ['manage_users', 'assign_roles'],
  Settings: ['manage_settings', 'view_audit_logs'],
  Data: ['export_all', 'import_all'],
};

// ========================
// ROLE PERMISSIONS MATRIX
// ========================

const PERMISSIONS_MATRIX = {
  ADMIN: {
    // Dashboard
    view_dashboard: true,
    manage_dashboard: true,
    // Customers - FULL ACCESS
    view_customers: true,
    manage_customers: true,
    export_customers: true,
    import_customers: true,
    // Inventory - FULL ACCESS
    view_inventory: true,
    manage_inventory: true,
    export_inventory: true,
    import_inventory: true,
    // Reports - FULL ACCESS
    view_reports: true,
    manage_reports: true,
    export_reports: true,
    // POS - FULL ACCESS
    view_pos: true,
    manage_pos: true,
    export_pos: true,
    // Invoices - FULL ACCESS
    view_invoices: true,
    manage_invoices: true,
    export_invoices: true,
    // Subscription - FULL ACCESS
    view_subscription: true,
    manage_subscription: true,
    // User Management - EXCLUSIVE
    manage_users: true,
    assign_roles: true,
    // Settings - FULL ACCESS
    manage_settings: true,
    view_audit_logs: true,
    // Data - FULL ACCESS
    export_all: true,
    import_all: true,
  },
  
  SALES_EXECUTIVE: {
    // Dashboard - LIMITED ACCESS
    view_dashboard: true,
    manage_dashboard: false,
    // Customers - MANAGE ONLY
    view_customers: true,
    manage_customers: true,
    export_customers: true,
    import_customers: false,
    // Inventory - VIEW ONLY
    view_inventory: true,
    manage_inventory: false,
    export_inventory: true,
    import_inventory: false,
    // Reports - VIEW ONLY
    view_reports: true,
    manage_reports: false,
    export_reports: true,
    // POS - FULL ACCESS
    view_pos: true,
    manage_pos: true,
    export_pos: true,
    // Invoices - MANAGE ONLY
    view_invoices: true,
    manage_invoices: false,
    export_invoices: true,
    // Subscription - NO ACCESS
    view_subscription: false,
    manage_subscription: false,
    // User Management - NO ACCESS
    manage_users: false,
    assign_roles: false,
    // Settings - NO ACCESS
    manage_settings: false,
    view_audit_logs: false,
    // Data - NO ACCESS
    export_all: false,
    import_all: false,
  },
};

// ========================
// USAGE IN COMPONENTS
// ========================

/*
// 1. In JSX Components - Show/Hide based on permissions:
import { usePermissions } from '../context/PermissionsContext';
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { userRole } = useAuth();
  const { hasPermission } = usePermissions();

  return (
    <>
      {hasPermission(userRole, 'manage_customers') && (
        <button>Add Customer</button>
      )}
      
      {hasPermission(userRole, 'export_customers') && (
        <button>Export Customers</button>
      )}
    </>
  );
}

// 2. Using helper functions:
import { canManage, canExport } from '../utils/permissionHelper';

function MyComponent() {
  const { userRole } = useAuth();
  const permissions = usePermissions();
  
  const canAddCustomer = canManage(userRole, 'customers', permissions);
  const canExportData = canExport(userRole, 'customers', permissions);
}

// 3. Inline action checks:
function handleDelete() {
  if (!hasPermission(userRole, 'manage_customers')) {
    alert('You do not have permission to delete customers');
    return;
  }
  // Proceed with deletion
}
*/

// ========================
// ACCESS CONTROL PANEL
// ========================

/*
Path: /admin/control-panel
Role: ADMIN only

Features:
- View all roles (ADMIN, SALES_EXECUTIVE)
- Toggle permissions for each role
- Reset individual role permissions
- Reset all permissions to defaults
- Real-time permission updates

All changes are persisted to localStorage and applied immediately across the application.
*/

// ========================
// TESTING SCENARIOS
// ========================

const TEST_SCENARIOS = [
  {
    role: 'ADMIN',
    description: 'Full system access - can manage all features and assign roles',
    features: ['All dashboard widgets', 'Customer management', 'Inventory management', 'Reports', 'POS', 'User management', 'Settings'],
  },
  {
    role: 'SALES_EXECUTIVE',
    description: 'Sales focused - can manage POS, customers, and invoices',
    features: ['Dashboard (view)', 'Customer management', 'Inventory (view)', 'POS management', 'Invoice management', 'Reports (view)'],
    restrictions: ['No user management', 'No subscription access', 'No settings access', 'No audit logs', 'Limited imports'],
  },
];

// ========================
// PERMISSION CHECKS IN PAGES
// ========================

const PAGE_PERMISSION_REQUIREMENTS = {
  '/': { permission: 'view_dashboard', feature: 'dashboard' },
  '/customers': { permission: 'view_customers', feature: 'customers' },
  '/inventory': { permission: 'view_inventory', feature: 'inventory' },
  '/pos': { permission: 'view_pos', feature: 'pos' },
  '/invoices': { permission: 'view_invoices', feature: 'invoices' },
  '/reports': { permission: 'view_reports', feature: 'reports' },
  '/subscription': { permission: 'view_subscription', feature: 'subscription', rolesAllowed: ['ADMIN'] },
  '/admin/control-panel': { permission: 'manage_users', rolesAllowed: ['ADMIN'] },
  '/loyalty': { permission: 'view_pos', feature: 'pos' },
};

// ========================
// NOTES
// ========================

/*
1. ADMIN role is automatically granted all permissions and bypasses most checks
2. SALES_EXECUTIVE has focused access for sales operations
3. All permissions are stored in localStorage under 'rolePermissions'
4. Changes in Control Panel apply immediately to all pages
5. Missing permissions block both visibility and functionality of features
6. Navbar items are already filtered by role before display
*/

export {
  PERMISSION_CATEGORIES,
  PERMISSIONS_MATRIX,
  TEST_SCENARIOS,
  PAGE_PERMISSION_REQUIREMENTS,
};
