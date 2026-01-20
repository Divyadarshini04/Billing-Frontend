import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Lock, CheckCircle, Globe, ShieldCheck, Briefcase } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCompanySettings } from "../context/CompanySettingsContext";
import { authAPI } from "../api/apiService";
import { tokenManager } from "../utils/tokenManager";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { companySettings } = useCompanySettings();
  const [step, setStep] = useState(1); // Step 1: Role Selection, Step 2: Phone/Password, Step 3: OTP/Login
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("IN"); // Default to India
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  const countries = [
    { code: "IN", name: "India", prefix: "+91", dialLength: 10 },
    { code: "US", name: "United States", prefix: "+1", dialLength: 10 },
    { code: "UK", name: "United Kingdom", prefix: "+44", dialLength: 10 },
    { code: "AU", name: "Australia", prefix: "+61", dialLength: 9 },
    { code: "CA", name: "Canada", prefix: "+1", dialLength: 10 },
    { code: "DE", name: "Germany", prefix: "+49", dialLength: 10 },
    { code: "FR", name: "France", prefix: "+33", dialLength: 9 },
    { code: "JP", name: "Japan", prefix: "+81", dialLength: 10 },
    { code: "SG", name: "Singapore", prefix: "+65", dialLength: 8 },
    { code: "AE", name: "United Arab Emirates", prefix: "+971", dialLength: 9 },
  ];

  const currentCountry = countries.find(c => c.code === selectedCountry);

  const roles = [
    {
      id: "OWNER",
      name: "OWNER",
      color: "from-cyan-400 to-cyan-500",
      icon: <ShieldCheck className="w-8 h-8" />,
    },
    {
      id: "SALES_EXECUTIVE",
      name: "SALES EXECUTIVE",
      color: "from-blue-500 to-purple-600",
      icon: <Briefcase className="w-8 h-8" />,
    },
  ];

  const handleRoleSubmit = () => {
    if (!selectedRole) {
      setError("Please select a role to continue");
      return;
    }
    setError("");
    setStep(2); // Move to phone number step
  };

  const handlePhoneSubmit = async () => {
    setError("");
    if (!phone || phone.length !== currentCountry.dialLength) {
      setError(`Please enter a valid ${currentCountry.dialLength}-digit ${currentCountry.name} phone number`);
      return;
    }

    // OWNER uses OTP
    if (selectedRole === "OWNER") {
      setLoading(true);
      try {
        const response = await authAPI.sendOTP(phone);
        if (response.data.otp) {
          alert(`Development Mode - OTP: ${response.data.otp}`);
        }
        setStep(3); // Go to OTP Step
      } catch (err) {
        console.error("DEBUG: OTP Error", err);
        // EXTENDED MOBLIE DEBUGGING
        let debugMsg = `Error: ${err.message}`;
        if (err.code) debugMsg += `\nCode: ${err.code}`;
        if (err.response) {
          debugMsg += `\nStatus: ${err.response.status}`;
          debugMsg += `\nData: ${JSON.stringify(err.response.data)}`;
        } else {
          debugMsg += "\nNo response received from server (Check Network/Firewall)";
        }
        debugMsg += `\nTrying to connect to: ${authAPI.sendOTP.toString()}`; // API info
        alert(debugMsg);

        let errorMsg = err.response?.data?.detail || "Failed to send OTP.";
        if (typeof errorMsg !== 'string') errorMsg = String(errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
      return;
    }

    // SUPERADMIN and SALES_EXECUTIVE use Password
    setStep(4); // Using Step 4 for Password to keep flows clear
  };

  const handlePasswordSubmit = async () => {
    setError("");
    if (!password) {
      setError("Please enter a password");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login({ phone, password, role: selectedRole });

      // Save token and user data
      if (response.data.token) {
        tokenManager.setToken(response.data.token);
      }

      // Prepare user data
      const backendUser = response.data.user;

      // Role Validation
      const hasRole = backendUser.roles?.some(r => r.name === selectedRole);
      if (!hasRole) {
        throw new Error(`Access Denied: You are not authorized as a ${roles.find(r => r.id === selectedRole)?.name || selectedRole}.`);
      }

      const userRole = selectedRole;
      const userData = {
        ...backendUser,
        role: userRole,
        is_super_admin: backendUser?.is_super_admin || false,
        name: backendUser?.first_name || backendUser?.name || 'User'
      };

      login(userData);

      // Navigation Logic
      if (userRole === "OWNER") {
        navigate("/owner/dashboard");
      } else if (userRole === "SALES_EXECUTIVE") {
        navigate("/pos");
      } else {
        navigate("/");
      }

    } catch (err) {
      const errorMsg = err.response?.data?.detail ||
        err.message ||
        "Login failed. Please check your credentials.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    setError("");
    if (!otp.match(/^[0-9]{6}$/)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      // Pass role to verifyOTP
      const response = await authAPI.verifyOTP(phone, otp, selectedRole);

      if (response.data.token) {
        tokenManager.setToken(response.data.token);
      }

      const backendUser = response.data.user;
      // Role Verification during OTP Login
      const hasRole = backendUser.roles?.some(r => r.name === selectedRole);
      if (!hasRole) {
        throw new Error(`Access Denied: You are not authorized as a ${roles.find(r => r.id === selectedRole)?.name || selectedRole}.`);
      }

      // if validation passes
      const userRole = selectedRole;
      const userData = {
        ...backendUser,
        role: userRole,
        is_super_admin: backendUser?.is_super_admin || false,
        name: backendUser?.name || 'User'
      };

      console.log("DEBUG: Login User Data:", userData);

      // Save user data to AuthContext
      login(userData);

      // Navigation Logic
      if (userRole === "OWNER") {
        navigate("/owner/dashboard");
      } else if (userRole === "SALES_EXECUTIVE") {
        navigate("/pos");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error("DEBUG: Login Error:", err);
      const errorMsg = err.response?.data?.detail || "OTP verification failed.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);
    setResendCooldown(30);

    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const response = await authAPI.sendOTP(phone);
      if (response.data.otp) {
        alert(`Development Mode - OTP: ${response.data.otp}`);
      }
    } catch (err) {
      clearInterval(interval);
      setResendCooldown(0);
      let errorMsg = err.response?.data?.detail || "Failed to resend OTP.";
      if (typeof errorMsg !== 'string') errorMsg = String(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await authAPI.sendOTP(phone);
      if (response.data.otp) {
        alert(`Development Mode - OTP: ${response.data.otp}`);
      }
      setForgotPasswordMode(true);
      setPassword("");
      setOtp("");
    } catch (err) {
      let errorMsg = err.response?.data?.detail || "Failed to send OTP.";
      if (typeof errorMsg !== 'string') errorMsg = String(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackFromForgotPassword = () => {
    setForgotPasswordMode(false);
    setOtp("");
    setError("");
  };

  // --- DEBUG STATE ---
  const [debugData, setDebugData] = useState(null);

  const proceedFromDebug = () => {
    if (!debugData) return;
    const { userData, destination } = debugData;

    login(userData);
    navigate(destination);
  };

  if (debugData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Login Successful (Debug Mode)</h2>
          <div className="bg-gray-100 p-4 rounded mb-4 overflow-auto max-h-60 text-xs font-mono">
            <p><strong>Resolved Role:</strong> {debugData.role}</p>
            <p><strong>Intended Destination:</strong> {debugData.destination}</p>
            <p><strong>Is Super Admin:</strong> {String(debugData.userData.is_super_admin)}</p>
            <p><strong>User Data Role:</strong> {debugData.userData.role}</p>
            <hr className="my-2" />
            <pre>{JSON.stringify(debugData.userData, null, 2)}</pre>
          </div>
          <button
            onClick={proceedFromDebug}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
          >
            PROCEED TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-inter">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-blue-500 to-blue-600 relative overflow-hidden text-white p-12">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full mix-blend-overlay blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-400 rounded-full mix-blend-overlay blur-3xl"></div>
        </div>

        <div className="z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <img
                src={companySettings.logo || "/logo.png"}
                alt="Logo"
                className="w-full h-full object-contain filter drop-shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/150?text=Logo";
                }}
              />
            </div>
            <h1 className="text-4xl font-bold mb-2 tracking-wider font-outfit">GEO BILLING</h1>
            <p className="text-blue-100/80 text-lg">Smart Billing Solutions for Modern Business</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-3 gap-8 mt-12 opacity-60"
          >
            <div className="flex flex-col items-center">
              <Globe className="w-8 h-8 mb-2" />
              <span className="text-xs uppercase tracking-wider">Global</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-8 h-8 mb-2" />
              <span className="text-xs uppercase tracking-wider">Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="w-8 h-8 mb-2" />
              <span className="text-xs uppercase tracking-wider">Reliable</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex items-center justify-center bg-gray-50 p-6 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-8">

          <div className="lg:hidden text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <img
                src={companySettings.logo || "/logo.png"}
                alt="Logo"
                className="w-full h-full object-contain filter drop-shadow-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/150?text=Logo";
                }}
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-outfit tracking-wide">GEO BILLING</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm">Please enter your details to sign in.</p>
          </div>

          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Select Role
              </p>

              <div className="space-y-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all flex items-center group ${selectedRole === role.id
                      ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                      : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
                      }`}
                  >
                    <div className={`p-2 rounded-md mr-3 ${selectedRole === role.id ? "bg-blue-100 text-blue-500" : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500"}`}>
                      {React.cloneElement(role.icon, { className: "w-5 h-5" })}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-sm ${selectedRole === role.id ? "text-blue-800" : "text-gray-700"}`}>
                        {role.name}
                      </h3>
                    </div>
                    {selectedRole === role.id && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md flex items-start gap-2 text-red-600 text-sm">
                  <span>⚠️</span>
                  <span>{typeof error === 'string' ? error : 'An error occurred'}</span>
                </div>
              )}

              <button
                onClick={handleRoleSubmit}
                className="w-full mt-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-sm shadow-md shadow-blue-500/20"
              >
                Continue
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Login</h3>
                  <p className="text-xs text-blue-500 font-medium">{roles.find(r => r.id === selectedRole)?.name}</p>
                </div>
                <button onClick={() => { setStep(1); setPhone(""); setError(""); }} className="text-xs text-gray-400 hover:text-gray-600">
                  Change Role
                </button>
              </div>

              <div className="space-y-4">
                <div className="hidden">
                  {/* Keep country select code but hide it if not needed, simplified here */}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 min-w-[3rem]">
                      <span className="text-gray-500 font-medium text-sm">{currentCountry.prefix}</span>
                      <div className="h-4 w-px bg-gray-300"></div>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="0000000000"
                      className={`w-full pl-16 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400`}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md text-red-600 text-sm">
                  {typeof error === 'string' ? error : 'An error occurred'}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setStep(1); setPhone(""); setError(""); }}
                  className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePhoneSubmit}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-md shadow-blue-500/20 text-sm disabled:opacity-50 transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Verify OTP</h3>
                  <p className="text-xs text-gray-500">Sent to {currentCountry.prefix} {phone}</p>
                </div>
                <button onClick={() => { setStep(2); setOtp(""); setError(""); }} className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                  Edit Number
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Enter 6-digit Code
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="— — — — — —"
                    className="w-full py-3 text-center border border-gray-300 rounded-lg text-xl tracking-[0.5em] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-300"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md text-red-600 text-sm">
                  {typeof error === 'string' ? error : 'An error occurred'}
                </div>
              )}

              <button
                onClick={handleOTPSubmit}
                disabled={loading}
                className="w-full mt-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-md shadow-blue-500/20 text-sm disabled:opacity-50 transition-colors"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>

              <div className="mt-4 text-center">
                <button
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || loading}
                  className={`text-xs font-medium ${resendCooldown > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-500 hover:text-blue-600"}`}
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Verification Code"}
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Enter Password
                  </h3>
                  <p className="text-xs text-gray-500">Phone: {currentCountry.prefix} {phone}</p>
                </div>
                <button onClick={() => { setStep(2); setPassword(""); setError(""); }} className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                  Edit Number
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md text-red-600 text-sm">
                  {typeof error === 'string' ? error : 'An error occurred'}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setStep(2); setPassword(""); setError(""); }}
                  className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-md shadow-blue-500/20 text-sm disabled:opacity-50 transition-colors"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>
            </motion.div>
          )}

        </div>
        <div className="absolute bottom-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Geo Billing. All rights reserved.
        </div>
      </div>
    </div>
  );
}
