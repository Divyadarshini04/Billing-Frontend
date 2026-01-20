import { useState, useEffect } from 'react';
import authAxios from '../api/authAxios';

/**
 * Custom hook to fetch and manage feature control settings
 * These settings are controlled by Super Admin and affect what owners see
 */
export const useFeatureControls = () => {
  const [features, setFeatures] = useState({
    // Dashboard Access
    dashboard_access_enable: true,

    // KPI Cards
    dashboard_total_customers_card: true,
    dashboard_total_products_card: true,
    dashboard_total_revenue_card: true,
    dashboard_active_customers_card: true,

    // Revenue Control
    dashboard_revenue_visibility: true,

    // Recent Orders
    dashboard_recent_orders_widget: true,
    dashboard_invoice_number_visibility: true,
    dashboard_order_amount_visibility: true,
    dashboard_order_status_visibility: true,

    // Quick Actions
    dashboard_create_invoice_button: true,
    dashboard_add_product_button: true,
    dashboard_add_customer_button: true,

    // Notifications & Data
    dashboard_notification_bell: true,
    dashboard_data_calculation_enable: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeatureControls();
  }, []);

  const fetchFeatureControls = async () => {
    try {
      setLoading(true);
      const res = await authAxios.get('/api/super-admin/settings/');
      console.log('Feature Controls Response:', res.data);

      const data = (Array.isArray(res.data) ? res.data[0] : res.data) || {};
      console.log('Feature Controls Data:', data);

      // Extract only feature control fields
      const featureControls = {
        dashboard_access_enable: data.dashboard_access_enable !== undefined ? data.dashboard_access_enable : true,
        dashboard_total_customers_card: data.dashboard_total_customers_card !== undefined ? data.dashboard_total_customers_card : true,
        dashboard_total_products_card: data.dashboard_total_products_card !== undefined ? data.dashboard_total_products_card : true,
        dashboard_total_revenue_card: data.dashboard_total_revenue_card !== undefined ? data.dashboard_total_revenue_card : true,
        dashboard_active_customers_card: data.dashboard_active_customers_card !== undefined ? data.dashboard_active_customers_card : true,
        dashboard_revenue_visibility: data.dashboard_revenue_visibility !== undefined ? data.dashboard_revenue_visibility : true,
        dashboard_recent_orders_widget: data.dashboard_recent_orders_widget !== undefined ? data.dashboard_recent_orders_widget : true,
        dashboard_invoice_number_visibility: data.dashboard_invoice_number_visibility !== undefined ? data.dashboard_invoice_number_visibility : true,
        dashboard_order_amount_visibility: data.dashboard_order_amount_visibility !== undefined ? data.dashboard_order_amount_visibility : true,
        dashboard_order_status_visibility: data.dashboard_order_status_visibility !== undefined ? data.dashboard_order_status_visibility : true,
        dashboard_create_invoice_button: data.dashboard_create_invoice_button !== undefined ? data.dashboard_create_invoice_button : true,
        dashboard_add_product_button: data.dashboard_add_product_button !== undefined ? data.dashboard_add_product_button : true,
        dashboard_add_customer_button: data.dashboard_add_customer_button !== undefined ? data.dashboard_add_customer_button : true,
        dashboard_notification_bell: data.dashboard_notification_bell !== undefined ? data.dashboard_notification_bell : true,
        dashboard_data_calculation_enable: data.dashboard_data_calculation_enable !== undefined ? data.dashboard_data_calculation_enable : true,
      };

      console.log('Final Feature Controls:', featureControls);
      setFeatures(featureControls);
      setError(null);
    } catch (err) {
      console.error('Error fetching feature controls:', err);
      setError(err.message);
      // Use defaults on error
      setFeatures(prev => prev);
    } finally {
      setLoading(false);
    }
  };

  return { features, loading, error, refetch: fetchFeatureControls };
};
