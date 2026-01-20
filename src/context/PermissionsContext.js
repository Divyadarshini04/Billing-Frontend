import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { NotificationContext } from "./NotificationContext";
import authAxios from "../api/authAxios";

const PermissionsContext = createContext();

const DEFAULT_PERMISSIONS = {
  SUPERADMIN: {
    // Has access to everything + super admin specific
    view_dashboard: true,
    manage_dashboard: true,
    view_customers: true,
    manage_customers: true,
    export_customers: true,
    import_customers: true,
    view_inventory: true,
    manage_inventory: true,
    export_inventory: true,
    import_inventory: true,
    view_pos: true,
    manage_pos: true,
    export_pos: true,
    view_invoices: true,
    manage_invoices: true,
    export_invoices: true,
    view_subscription: true,
    manage_subscription: true,
    manage_users: true,
    assign_roles: true,
    manage_settings: true,
    view_audit_logs: true,
    export_all: true,
    export_all: true,
    import_all: true,
    view_reports: true,
    export_reports: true,
    view_loyalty: true,
    manage_loyalty: true,
    view_support: true,
  },
  OWNER: {
    // Dashboard
    view_dashboard: true,
    manage_dashboard: true,
    // Customers
    view_customers: true,
    manage_customers: true,
    export_customers: true,
    import_customers: true,
    // Inventory
    view_inventory: true,
    manage_inventory: true,
    export_inventory: true,
    import_inventory: true,
    // POS Billing
    view_pos: true,
    manage_pos: true,
    export_pos: true,
    // Invoices
    view_invoices: true,
    manage_invoices: true,
    export_invoices: true,
    // Subscription
    view_subscription: true,
    manage_subscription: true,
    // User Management
    manage_users: true,
    assign_roles: true,
    // Settings
    manage_settings: true,
    view_audit_logs: true,
    // Data Management
    export_all: true,
    export_all: true,
    import_all: true,
    // Reports
    view_reports: true,
    export_reports: true,
    // Loyalty
    view_loyalty: true,
    manage_loyalty: true,
    // Support
    view_support: true,
  },
  SALES_EXECUTIVE: {
    // Dashboard
    view_dashboard: true,
    manage_dashboard: false,
    // Customers
    view_customers: true,
    manage_customers: true,
    export_customers: true,
    import_customers: false,
    // Inventory
    view_inventory: true,
    manage_inventory: false,
    export_inventory: true,
    import_inventory: false,
    // POS Billing
    view_pos: true,
    manage_pos: true,
    export_pos: true,
    // Invoices
    view_invoices: true,
    manage_invoices: true,
    export_invoices: true,
    // Subscription
    view_subscription: false,
    manage_subscription: false,
    // User Management
    manage_users: false,
    assign_roles: false,
    // Settings
    manage_settings: false,
    view_audit_logs: false,
    // Data Management
    export_all: false,
    export_all: false,
    import_all: false,
    // Reports
    view_reports: true,
    export_reports: false,
    // Loyalty
    view_loyalty: true,
    manage_loyalty: false,
    // Support
    view_support: true,
  },
};

const ALL_PERMISSIONS = {
  OWNER: [
    // Dashboard
    { key: "view_dashboard", label: "View Dashboard", category: "Dashboard" },
    { key: "manage_dashboard", label: "Manage Dashboard Widgets", category: "Dashboard" },
    // Customers
    { key: "view_customers", label: "View Customers", category: "Customers" },
    { key: "manage_customers", label: "Add/Edit/Delete Customers", category: "Customers" },
    { key: "export_customers", label: "Export Customers", category: "Customers" },
    { key: "import_customers", label: "Import Customers", category: "Customers" },
    // Inventory
    { key: "view_inventory", label: "View Inventory", category: "Inventory" },
    { key: "manage_inventory", label: "Add/Edit/Delete Inventory", category: "Inventory" },
    { key: "export_inventory", label: "Export Inventory", category: "Inventory" },
    { key: "import_inventory", label: "Import Inventory", category: "Inventory" },
    // POS Billing
    { key: "view_pos", label: "View POS Billing", category: "POS" },
    { key: "manage_pos", label: "Manage POS Billing", category: "POS" },
    { key: "export_pos", label: "Export POS Data", category: "POS" },
    // Invoices
    { key: "view_invoices", label: "View Invoices", category: "Invoices" },
    { key: "manage_invoices", label: "Add/Edit/Delete Invoices", category: "Invoices" },
    { key: "export_invoices", label: "Export Invoices", category: "Invoices" },
    // Subscription
    { key: "view_subscription", label: "View Subscription", category: "Subscription" },
    { key: "manage_subscription", label: "Manage Subscription Plans", category: "Subscription" },
    // User Management
    { key: "manage_users", label: "Add/Edit/Delete Users", category: "Users" },
    { key: "assign_roles", label: "Assign User Roles", category: "Users" },
    // Settings
    { key: "manage_settings", label: "Manage Application Settings", category: "Settings" },
    { key: "view_audit_logs", label: "View Audit Logs", category: "Settings" },
    // Data Management
    { key: "export_all", label: "Export All Data", category: "Data" },
    { key: "import_all", label: "Import All Data", category: "Data" },
    // Reports
    { key: "view_reports", label: "View Reports", category: "Reports" },
    { key: "export_reports", label: "Export Reports", category: "Reports" },
    // Loyalty
    { key: "view_loyalty", label: "View Loyalty Program", category: "Loyalty" },
    { key: "manage_loyalty", label: "Manage Loyalty Program", category: "Loyalty" },
    // Support
    { key: "view_support", label: "View Support", category: "Support" },
  ],
  SALES_EXECUTIVE: [
    // Dashboard
    { key: "view_dashboard", label: "View Dashboard", category: "Dashboard" },
    { key: "manage_dashboard", label: "Manage Dashboard Widgets", category: "Dashboard" },
    // Customers
    { key: "view_customers", label: "View Customers", category: "Customers" },
    { key: "manage_customers", label: "Add/Edit/Delete Customers", category: "Customers" },
    { key: "export_customers", label: "Export Customers", category: "Customers" },
    { key: "import_customers", label: "Import Customers", category: "Customers" },
    // Inventory
    { key: "view_inventory", label: "View Inventory", category: "Inventory" },
    { key: "manage_inventory", label: "Add/Edit/Delete Inventory", category: "Inventory" },
    { key: "export_inventory", label: "Export Inventory", category: "Inventory" },
    { key: "import_inventory", label: "Import Inventory", category: "Inventory" },
    // POS Billing
    { key: "view_pos", label: "View POS Billing", category: "POS" },
    { key: "manage_pos", label: "Manage POS Billing", category: "POS" },
    { key: "export_pos", label: "Export POS Data", category: "POS" },
    // Invoices
    { key: "view_invoices", label: "View Invoices", category: "Invoices" },
    { key: "manage_invoices", label: "Add/Edit/Delete Invoices", category: "Invoices" },
    { key: "export_invoices", label: "Export Invoices", category: "Invoices" },
    // Subscription (Sales Executive cannot manage)
    { key: "view_subscription", label: "View Subscription", category: "Subscription" },
    { key: "manage_subscription", label: "Manage Subscription Plans", category: "Subscription" },
    // User Management (Sales Executive has no user management)
    { key: "manage_users", label: "Add/Edit/Delete Users", category: "Users" },
    { key: "assign_roles", label: "Assign User Roles", category: "Users" },
    // Settings
    { key: "manage_settings", label: "Manage Application Settings", category: "Settings" },
    { key: "view_audit_logs", label: "View Audit Logs", category: "Settings" },
    // Data Management
    { key: "export_all", label: "Export All Data", category: "Data" },
    { key: "import_all", label: "Import All Data", category: "Data" },
    // Reports
    { key: "view_reports", label: "View Reports", category: "Reports" },
    { key: "export_reports", label: "Export Reports", category: "Reports" },
    // Loyalty
    { key: "view_loyalty", label: "View Loyalty Program", category: "Loyalty" },
    { key: "manage_loyalty", label: "Manage Loyalty Program", category: "Loyalty" },
    // Support
    { key: "view_support", label: "View Support", category: "Support" },
  ],
};

export function PermissionsProvider({ children }) {
  const { userRole } = useAuth();
  const { addNotification } = useContext(NotificationContext);
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  useEffect(() => {
    // Only fetch if we have a token AND a user role
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    if (userRole && token) {
      fetchPermissions();
    }
  }, [userRole]);

  const fetchPermissions = async () => {
    try {
      // Use authAxios for authenticated request
      const response = await authAxios.get('/api/users/roles/matrix/');

      if (response.status === 200) {
        const data = response.data;
        setPermissions(prev => {
          // Deep copy to prevent mutation of defaults
          const newPerms = JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS));

          Object.keys(data).forEach(role => {
            if (newPerms[role]) {
              const roleEnabledCodes = data[role];
              const currentRoleDefaults = DEFAULT_PERMISSIONS[role] || {};

              Object.keys(currentRoleDefaults).forEach(key => {
                newPerms[role][key] = roleEnabledCodes.includes(key);
              });
            }
          });
          return newPerms;
        });
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const togglePermission = async (role, permissionKey) => {
    const isEnabled = !permissions[role][permissionKey];

    // Optimistic Update
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permissionKey]: isEnabled
      }
    }));

    try {
      await authAxios.post('/api/users/roles/matrix/', {
        role: role,
        permission: permissionKey,
        enabled: isEnabled
      });
      addNotification("Permission updated successfully", "success");
    } catch (error) {
      console.error("Error updating permission:", error);
      addNotification("Failed to update permission. Reverting changes.", "error");

      // Revert on error
      setPermissions(prev => ({
        ...prev,
        [role]: {
          ...prev[role],
          [permissionKey]: !isEnabled
        }
      }));
    }
  };

  const hasPermission = (userRole, permissionKey) => {
    return permissions[userRole]?.[permissionKey] ?? false;
  };

  const getPermissions = (userRole) => {
    return permissions[userRole] || {};
  };

  const resetToDefaults = async (role) => {
    // This would need a backend endpoint to reset or we loop through default state and post updates
    // For now, let's just log or implement a client-side loop if critical, or skip
    console.warn("Reset to defaults via API not yet implemented fully");
    setPermissions((prev) => ({
      ...prev,
      [role]: DEFAULT_PERMISSIONS[role],
    }));
  };

  const resetAllPermissions = () => {
    setPermissions(DEFAULT_PERMISSIONS);
  };

  const enableAllPermissionsForSubscribedRole = (role) => {
    // Enable all permissions for a subscribed role
    setPermissions((prev) => {
      const allPermissions = { ...prev[role] };
      // Set all permissions to true except those that are explicitly admin-only
      Object.keys(allPermissions).forEach((perm) => {
        // Keep subscription management disabled for ADMIN
        if (role === "OWNER" && (perm === "view_subscription" || perm === "manage_subscription")) {
          allPermissions[perm] = false;
        } else {
          allPermissions[perm] = true;
        }
      });
      return {
        ...prev,
        [role]: allPermissions,
      };
    });
  };

  const value = {
    permissions,
    togglePermission,
    hasPermission,
    getPermissions,
    resetToDefaults,
    resetAllPermissions,
    enableAllPermissionsForSubscribedRole,
    ALL_PERMISSIONS,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within PermissionsProvider");
  }
  return context;
}
