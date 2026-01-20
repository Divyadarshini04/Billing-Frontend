import { useState, useEffect } from 'react';
import authAxios from '../api/authAxios';

/**
 * Custom hook to fetch and manage tax configuration settings
 * These settings are controlled by Super Admin and affect all owners
 * Used for displaying tax info in invoices and billing pages
 */
export const useTaxConfiguration = () => {
  const [taxSettings, setTaxSettings] = useState({
    gst_enabled: true,
    gst_percentage: 18.00,
    cgst_sgst_enabled: true,
    igst_enabled: true,
    tax_mode: 'EXCLUSIVE',
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTaxConfiguration();
    
    // Poll for updates every 2 seconds to catch admin setting changes
    const interval = setInterval(fetchTaxConfiguration, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchTaxConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authAxios.get('/api/super-admin/settings-api/');
      console.log('Tax Configuration Response:', res.data);
      console.log('GST Percentage from API:', res.data.gst_percentage, typeof res.data.gst_percentage);
      
      if (res.data) {
        const gstValue = parseFloat(res.data.gst_percentage) || 18.00;
        const gstEnabledValue = res.data.gst_enabled === true || res.data.gst_enabled === 'true';
        const cgstEnabledValue = res.data.cgst_sgst_enabled === true || res.data.cgst_sgst_enabled === 'true';
        const igstEnabledValue = res.data.igst_enabled === true || res.data.igst_enabled === 'true';
        
        console.log('Parsed Values:', {
          gst_enabled: gstEnabledValue,
          cgst_sgst_enabled: cgstEnabledValue,
          igst_enabled: igstEnabledValue,
          gst_percentage: gstValue
        });
        
        setTaxSettings({
          gst_enabled: gstEnabledValue,
          gst_percentage: gstValue,
          cgst_sgst_enabled: cgstEnabledValue,
          igst_enabled: igstEnabledValue,
          tax_mode: res.data.tax_mode || 'EXCLUSIVE',
        });
      }
    } catch (err) {
      console.error('Error fetching tax configuration:', err);
      setError(err.message);
      // Use defaults if fetch fails
    } finally {
      setLoading(false);
    }
  };

  return {
    taxSettings,
    loading,
    error,
    refetch: fetchTaxConfiguration,
  };
};
