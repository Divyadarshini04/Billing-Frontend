import React, { createContext, useState } from "react";

export const ExportSuccessContext = createContext();

export function ExportSuccessProvider({ children }) {
  const [successModal, setSuccessModal] = useState(null);

  const showExportSuccess = (message = "File Exported Successfully") => {
    setSuccessModal({ message });
    setTimeout(() => setSuccessModal(null), 4000);
  };

  return (
    <ExportSuccessContext.Provider value={{ successModal, showExportSuccess }}>
      {children}
    </ExportSuccessContext.Provider>
  );
}

export function useExportSuccess() {
  const context = React.useContext(ExportSuccessContext);
  if (!context) {
    throw new Error("useExportSuccess must be used within ExportSuccessProvider");
  }
  return context;
}
