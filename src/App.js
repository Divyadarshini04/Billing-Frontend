import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";
import { ExportSuccessProvider } from "./context/ExportSuccessContext";
import { PermissionsProvider } from "./context/PermissionsContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CompanySettingsProvider } from "./context/CompanySettingsContext";
import Navbar from "./components/Navbar";
import ExportSuccessModal from "./components/ExportSuccessModal";
import NotificationBootstrap from "./components/NotificationBootstrap";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SuperAdminLoginPage from "./pages/SuperAdminLoginPage";
import DashboardPage from "./pages/DashboardPage";
import DashboardDesignPage from "./pages/DashboardDesignPage";
import POSBillingPage from "./pages/POSBillingPage";
import InvoiceHistoryPage from "./pages/InvoiceHistoryPage";
import LoyaltyManagementPage from "./pages/LoyaltyManagementPage";
import InventoryPage from "./pages/InventoryPage";
import CustomersPage from "./pages/CustomersPage";
import ReportsPage from "./pages/ReportsPage";
import SellerReportsPage from "./pages/SellerReportsPage";
import StockReportsPage from "./pages/StockReportsPage";
import TransitReportsPage from "./pages/TransitReportsPage";
import TaxReportsPage from "./pages/TaxReportsPage";
import SalesReportPage from "./pages/SalesReportPage";
import ItemwiseSalesReportPage from "./pages/ItemwiseSalesReportPage";
import ProfileSettings from "./pages/ProfileSettings";
import CategoryManagementPage from "./pages/CategoryManagementPage";
import DiscountPage from "./pages/DiscountPage";
import CompanyProfilePage from "./pages/CompanyProfilePage";

// import OwnerSubscriptionManagement from "./pages/OwnerSubscriptionManagement";
import SubscriptionPage from "./components/Owner/SubscriptionPage";
import PaymentPage from "./components/Owner/PaymentPage";
import OwnerSubscriptionPurchase from "./pages/OwnerSubscriptionPurchase";
import RolesPermissions from "./pages/RolesPermissions";
import SuperAdminPage from "./pages/SuperAdminPage";
import OwnerDashboardPage from "./pages/OwnerDashboardPage";
import OwnerSupport from "./components/Owner/OwnerSupport";
import SalesExecutivePage from "./pages/SalesExecutivePage";
import SupplierManagementPage from "./pages/SupplierManagementPage";
import StockInwardPage from "./pages/StockInwardPage";
import Layout from "./components/Layout";

const RootRoute = () => {
  const { user } = useAuth();
  if (user?.is_super_admin) {
    return <Navigate to="/super-admin" replace />;
  }
  return <ProtectedRoute element={<DashboardPage />} requiredPermission="view_dashboard" />;
};

export default function App() {
  React.useEffect(() => {
    const APP_VERSION = 'v1.0.4_login_debug';
    // Version check logic simplified - do not clear storage automatically
    localStorage.setItem('app_version', APP_VERSION);
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <PermissionsProvider>
              <SubscriptionProvider>
                <CompanySettingsProvider>
                  <ExportSuccessProvider>
                    <NotificationBootstrap />
                    <ExportSuccessModal />
                    <Routes>
                      <Route path="/super-admin-login" element={<SuperAdminLoginPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/super-admin" element={<ProtectedRoute element={<SuperAdminPage />} requiredPermission="manage_users" />} />
                      <Route path="/owner/dashboard" element={<ProtectedRoute element={<OwnerDashboardPage />} requiredRole="OWNER" />} />
                      <Route path="/sales-executive" element={<ProtectedRoute element={<SalesExecutivePage />} requiredRole="SALES_EXECUTIVE" />} />
                      <Route
                        path="/*"
                        element={
                          <ProtectedRoute
                            element={
                              <Layout>
                                <Routes>
                                  <Route path="/" element={<RootRoute />} />
                                  <Route path="/dashboard-design" element={<ProtectedRoute element={<DashboardDesignPage />} requiredPermission="view_dashboard" />} />
                                  <Route path="/pos-billing" element={<ProtectedRoute element={<POSBillingPage />} requiredPermission="view_pos" />} />
                                  <Route path="/pos" element={<ProtectedRoute element={<POSBillingPage />} requiredPermission="view_pos" />} />
                                  <Route path="/invoices" element={<ProtectedRoute element={<InvoiceHistoryPage />} requiredPermission="view_invoices" />} />
                                  <Route path="/invoice-history" element={<ProtectedRoute element={<InvoiceHistoryPage />} requiredPermission="view_invoices" />} />
                                  <Route path="/loyalty" element={<ProtectedRoute element={<LoyaltyManagementPage />} requiredPermission="view_loyalty" />} />
                                  <Route path="/loyalty-management" element={<ProtectedRoute element={<LoyaltyManagementPage />} requiredPermission="view_loyalty" />} />
                                  <Route path="/inventory" element={<ProtectedRoute element={<InventoryPage />} requiredPermission="view_inventory" />} />
                                  <Route path="/suppliers" element={<ProtectedRoute element={<SupplierManagementPage />} requiredRole="OWNER" />} />
                                  <Route path="/stock-inward" element={<ProtectedRoute element={<StockInwardPage />} requiredRole="OWNER" />} />
                                  <Route path="/customers" element={<ProtectedRoute element={<CustomersPage />} requiredPermission="view_customers" />} />
                                  <Route path="/reports" element={<ProtectedRoute element={<ReportsPage />} requiredPermission="view_reports" />} />

                                  <Route path="/settings" element={<ProtectedRoute element={<ProfileSettings />} requiredPermission="manage_settings" />} />
                                  <Route path="/company-profile" element={<ProtectedRoute element={<CompanyProfilePage />} requiredPermission="manage_settings" />} />
                                  <Route path="/owner/roles-permissions" element={<ProtectedRoute element={<RolesPermissions />} requiredPermission="manage_users" />} />
                                  <Route path="/owner/subscription-management" element={<ProtectedRoute element={<SubscriptionPage />} requiredPermission="manage_subscription" />} />
                                  <Route path="/owner/payment" element={<ProtectedRoute element={<PaymentPage />} requiredPermission="manage_subscription" />} />
                                  <Route path="/owner/support" element={<ProtectedRoute element={<OwnerSupport />} requiredPermission="view_support" />} />
                                  <Route path="/owner/categories" element={<ProtectedRoute element={<CategoryManagementPage />} requiredPermission="manage_inventory" />} />
                                  <Route path="/discounts" element={<ProtectedRoute element={<DiscountPage />} requiredRole="OWNER" />} />
                                </Routes>
                              </Layout>
                            }
                          />
                        }
                      />
                    </Routes>
                  </ExportSuccessProvider>
                </CompanySettingsProvider>
              </SubscriptionProvider>
            </PermissionsProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
