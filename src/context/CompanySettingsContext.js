import React, { createContext, useState, useEffect, useContext } from "react";
import authAxios from "../api/authAxios";
import { useAuth } from './AuthContext';

const CompanySettingsContext = createContext();



export function CompanySettingsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [companySettings, setCompanySettings] = useState({
    name: "",
    logo: null,
    billing_settings: {},
    tax_settings: {},
    discount_settings: {},
    loyalty_settings: {},
    notification_settings: {},
    security_settings: {},
    report_settings: {},
    invoice_appearance: {},
    // default basic fields to empty strings to avoid uncontrolled inputs if used directly
    email: '',
    phone: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    company_code: '',
    tax_id: '',
    currency: 'USD',
    timezone: 'UTC',
    financial_year_start_month: 1,
    registration_number: '',
    website: '',
    loading: true
  });

  const fetchSettings = React.useCallback(async () => {
    try {
      const response = await authAxios.get('/api/common/company/active/');

      if (response.data) {
        setCompanySettings(prev => ({
          ...prev,
          // Map all fields from API response
          name: response.data.company_name || '',
          company_code: response.data.company_code || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          street_address: response.data.street_address || '',
          city: response.data.city || '',
          state: response.data.state || '',
          postal_code: response.data.postal_code || '',
          country: response.data.country || '',
          tax_id: response.data.tax_id || '',
          registration_number: response.data.registration_number || '',
          website: response.data.website || '',
          logo: response.data.logo_url || null,
          logo_url: response.data.logo_url || '',
          currency: response.data.currency || 'USD',
          timezone: response.data.timezone || 'UTC',
          financial_year_start_month: response.data.financial_year_start_month || 1,
          id: response.data.id,
          loading: false
        }));
      }
    } catch (error) {
      console.error("Failed to fetch company settings:", error);
      setCompanySettings(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated, fetchSettings]);

  const updateCompanyName = async (name) => {
    const previousName = companySettings.name;

    // Optimistic update
    setCompanySettings(prev => ({
      ...prev,
      name,
      company_name: name
    }));

    try {
      if (!companySettings.id) {
        throw new Error('No company profile ID found');
      }

      const response = await authAxios.patch(
        `/api/common/company/${companySettings.id}/`,
        { company_name: name }
      );

      if (response.data) {
        setCompanySettings(prev => ({
          ...prev,
          ...response.data,
          name: response.data.company_name
        }));
      }
    } catch (error) {
      console.error("Failed to update company name:", error);
      // Revert on error
      setCompanySettings(prev => ({
        ...prev,
        name: previousName,
        company_name: previousName
      }));
      throw error;
    }
  };

  const updateCompanyLogo = async (logo) => {
    const previousLogo = companySettings.logo;

    setCompanySettings(prev => ({
      ...prev,
      logo,
      logo_url: logo
    }));

    try {
      if (!companySettings.id) {
        throw new Error('No company profile ID found');
      }

      const response = await authAxios.patch(
        `/api/common/company/${companySettings.id}/`,
        { logo_url: logo }
      );

      if (response.data) {
        setCompanySettings(prev => ({
          ...prev,
          ...response.data,
          logo: response.data.logo_url
        }));
      }
    } catch (error) {
      console.error("Failed to update logo:", error);
      // Revert on error
      setCompanySettings(prev => ({
        ...prev,
        logo: previousLogo,
        logo_url: previousLogo
      }));
      throw error;
    }
  };

  // Generic update for any section
  const updateSettings = async (section, data) => {
    // Optimistic update
    const previousState = JSON.parse(JSON.stringify(companySettings));

    setCompanySettings(prev => {
      if (section === 'root') {
        // Fix: Ensure 'name' is updated if 'company_name' is present to avoid UI reverting
        const updates = { ...data };
        if (updates.company_name) {
          updates.name = updates.company_name;
        }
        return { ...prev, ...updates };
      }
      return { ...prev, [section]: { ...prev[section], ...data } };
    });

    try {
      if (!companySettings.id) {
        // Revert optimistic update
        setCompanySettings(previousState);
        throw new Error("Missing Company Profile ID. Please refresh the page.");
      }

      let body = {};
      if (section === 'root') {
        body = data;
      } else {
        // Merge with existing state for JSON fields
        body = { [section]: { ...companySettings[section], ...data } };
      }

      const response = await authAxios.patch(
        `/api/common/company/${companySettings.id}/`,
        body
      );

      // Update with server response to ensure consistency
      if (response.data) {
        setCompanySettings(prev => {
          const newState = {
            ...prev,
            ...response.data
          };
          // defensively update name only if present
          if (response.data.company_name !== undefined) {
            newState.name = response.data.company_name;
          }
          if (response.data.logo_url !== undefined) {
            newState.logo = response.data.logo_url;
          }
          return newState;
        });
      }

      return true;
    } catch (error) {
      console.error(`Failed to update settings for ${section}:`, error);
      // Revert optimistic update on error
      setCompanySettings(previousState);
      throw error;
    }
  };

  return (
    <CompanySettingsContext.Provider value={{
      companySettings,
      updateCompanyName,
      updateCompanyLogo,
      updateSettings,
      refreshSettings: fetchSettings
    }}>
      {children}
    </CompanySettingsContext.Provider>
  );

}

export function useCompanySettings() {
  const context = useContext(CompanySettingsContext);
  if (!context) {
    throw new Error("useCompanySettings must be used within a CompanySettingsProvider");
  }
  return context;
}
