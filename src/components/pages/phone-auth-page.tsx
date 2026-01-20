import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Phone, ArrowLeft, Shield, User, TrendingUp, Users, Store, MapPin, Building2, Coffee, Scissors, UtensilsCrossed, ShoppingBag, Cake, Shirt } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { toast } from "sonner@2.0.3";
import logoImage from "figma:asset/9c281fd7f40d9fc8c08d2f76f2006a1e31355018.png";

export type UserRole = 'owner' | 'sales' | 'admin';

export interface StoreInfo {
  id: string;
  name: string;
  type: string;
  location: string;
  address: string;
  icon: any;
  color: string;
  bgColor: string;
}

interface PhoneAuthPageProps {
  onLogin: (role: UserRole, store: StoreInfo) => void;
}

export function PhoneAuthPage({ onLogin }: PhoneAuthPageProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'store' | 'role'>('phone');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  
  // Mock stores - in real app, this would come from API based on user
  const stores: StoreInfo[] = [
    {
      id: 'store-1',
      name: 'Glamour Hair & Beauty',
      type: 'Salon',
      location: 'Bandra West',
      address: 'Shop 12, Linking Road, Bandra West, Mumbai - 400050',
      icon: Scissors,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      id: 'store-2',
      name: 'Chai Point Express',
      type: 'Tea Shop',
      location: 'Andheri East',
      address: 'Kiosk 5, Metro Station, Andheri East, Mumbai - 400069',
      icon: Coffee,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'store-3',
      name: 'Spice Garden Restaurant',
      type: 'Restaurant',
      location: 'Powai',
      address: 'Shop 45, Hiranandani Gardens, Powai, Mumbai - 400076',
      icon: UtensilsCrossed,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'store-4',
      name: 'Sweet Delights Bakery',
      type: 'Bakery',
      location: 'Thane West',
      address: 'Unit 8, Viviana Mall, Thane West - 400607',
      icon: Cake,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'store-5',
      name: 'Fashion Hub Boutique',
      type: 'Clothing Store',
      location: 'Malad West',
      address: 'Shop 23, Inorbit Mall, Malad West, Mumbai - 400064',
      icon: Shirt,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'store-6',
      name: 'Urban Mart',
      type: 'Retail Store',
      location: 'Vashi',
      address: 'Plot 67, Sector 17, Vashi, Navi Mumbai - 400703',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
  ];

  const handleSendOTP = () => {
    if (phoneNumber.length === 10) {
      setIsLoading(true);
      // Simulate OTP sending
      setTimeout(() => {
        setIsLoading(false);
        setStep('otp');
        setCanResend(false);
        setResendTimer(30);
        toast.success("OTP sent successfully!", {
          description: `Verification code sent to +91 ${phoneNumber}`,
        });
      }, 1500);
    }
  };

  const handleResendOTP = () => {
    setIsLoading(true);
    setOtp("");
    setTimeout(() => {
      setIsLoading(false);
      setCanResend(false);
      setResendTimer(30);
      toast.success("OTP resent successfully!", {
        description: `New verification code sent to +91 ${phoneNumber}`,
      });
    }, 1500);
  };

  useEffect(() => {
    if (step === 'otp' && resendTimer > 0 && !canResend) {
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, resendTimer, canResend]);

  const handleVerifyOTP = () => {
    if (otp.length === 6) {
      setIsLoading(true);
      // Simulate OTP verification
      setTimeout(() => {
        setIsLoading(false);
        setStep('store');
        toast.success("Phone verified successfully!", {
          description: "Please select your store location",
        });
      }, 1500);
    }
  };
  
  const handleStoreSelection = (store: StoreInfo) => {
    setSelectedStore(store);
    setStep('role');
    toast.success(`Store selected: ${store.name}`, {
      description: "Now select your role to continue",
    });
  };

  const handleRoleSelection = (role: UserRole) => {
    if (selectedStore) {
      onLogin(role, selectedStore);
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtp("");
    } else if (step === 'store') {
      setStep('otp');
    } else if (step === 'role') {
      setStep('store');
    }
  };

  const roles = [
    {
      id: 'owner' as UserRole,
      title: 'Owner',
      description: 'Full system access with all permissions',
      icon: Shield,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      id: 'admin' as UserRole,
      title: 'Admin',
      description: 'Manage operations, reports, and staff',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      id: 'sales' as UserRole,
      title: 'Sales',
      description: 'Handle billing and customer transactions',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-2 border-green-100 relative z-10 overflow-hidden backdrop-blur-sm bg-white/95">
        <CardHeader className="space-y-4 text-center pb-6 bg-gradient-to-b from-green-50/50 to-transparent">
          <div className="flex justify-center mb-2">
            <div className="relative p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl shadow-md">
              <img 
                src={logoImage} 
                alt="Geo Billing" 
                className="h-14 w-14 object-contain"
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl text-gray-900 bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
              Geo Billing & POS
            </CardTitle>
            <CardDescription className="text-base mt-2 text-gray-600">
              {step === 'phone' && '🔐 Enter your phone number to get started'}
              {step === 'otp' && '✉️ Enter the verification code sent to your phone'}
              {step === 'store' && '🏪 Select your store or branch location'}
              {step === 'role' && '👤 Select your role to continue'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Phone Number Step */}
          {step === 'phone' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <Label htmlFor="phone" className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-4 w-4 text-green-600" />
                  Phone Number
                </Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center px-4 h-12 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl shadow-sm">
                    <span className="font-semibold text-gray-700">+91</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhoneNumber(value);
                    }}
                    className="h-12 border-2 border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-200 flex-1 rounded-xl transition-all duration-200 shadow-sm"
                    maxLength={10}
                  />
                </div>
                {phoneNumber.length > 0 && phoneNumber.length < 10 && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span>
                    Please enter a valid 10-digit phone number
                  </p>
                )}
              </div>

              <Button 
                onClick={handleSendOTP}
                disabled={phoneNumber.length !== 10 || isLoading}
                className="w-full h-13 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending OTP...
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    Send OTP
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </span>
                )}
              </Button>
            </div>
          )}

          {/* OTP Verification Step */}
          {step === 'otp' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors rounded-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Change Number
              </Button>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 text-center shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Code sent to</p>
                <p className="font-semibold text-gray-900 text-lg">+91 {phoneNumber}</p>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
                    <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-xs text-green-800 font-medium">Demo Mode Active</p>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Enter any 6-digit code to continue</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="otp" className="text-center block text-gray-700">
                  Enter 6-digit OTP
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="border-2 border-gray-200 focus:border-green-400 transition-colors" />
                      <InputOTPSlot index={1} className="border-2 border-gray-200 focus:border-green-400 transition-colors" />
                      <InputOTPSlot index={2} className="border-2 border-gray-200 focus:border-green-400 transition-colors" />
                      <InputOTPSlot index={3} className="border-2 border-gray-200 focus:border-green-400 transition-colors" />
                      <InputOTPSlot index={4} className="border-2 border-gray-200 focus:border-green-400 transition-colors" />
                      <InputOTPSlot index={5} className="border-2 border-gray-200 focus:border-green-400 transition-colors" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button 
                onClick={handleVerifyOTP}
                disabled={otp.length !== 6 || isLoading}
                className="w-full h-13 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    Verify & Continue
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </span>
                )}
              </Button>

              <div className="text-center pt-2">
                {canResend ? (
                  <button 
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50 transition-colors underline-offset-4 hover:underline"
                  >
                    Didn't receive code? Resend
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                    <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-pulse"></div>
                    Resend code in {resendTimer}s
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Store Selection Step */}
          {step === 'store' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Store className="h-5 w-5 text-green-600" />
                  <p className="font-semibold text-green-900">Select Your Business</p>
                </div>
                <p className="text-xs text-green-700">Choose the store you want to access</p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-gray-100">
                {stores.map((store) => {
                  const StoreIcon = store.icon;
                  return (
                    <button
                      key={store.id}
                      onClick={() => handleStoreSelection(store)}
                      className={`w-full p-4 rounded-xl border-2 border-gray-200 hover:border-green-400 transition-all duration-300 hover:shadow-xl group bg-white hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden`}
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      
                      <div className="flex items-start gap-4 relative z-10">
                        <div className={`p-3.5 rounded-xl ${store.bgColor} group-hover:shadow-md transition-all duration-300 border border-gray-100`}>
                          <StoreIcon className={`h-6 w-6 ${store.color}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">{store.name}</h3>
                            <Badge variant="outline" className={`text-xs ${store.bgColor} ${store.color} border-transparent`}>
                              {store.type}
                            </Badge>
                          </div>
                          <div className="flex items-start gap-1.5 text-sm text-gray-600 mt-2">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-700">{store.location}</p>
                              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{store.address}</p>
                            </div>
                          </div>
                        </div>
                        {/* Arrow indicator */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ArrowLeft className="h-5 w-5 text-green-600 rotate-180" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Role Selection Step */}
          {step === 'role' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors rounded-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {selectedStore && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg ${selectedStore.bgColor} border border-gray-100`}>
                      {(() => {
                        const SelectedStoreIcon = selectedStore.icon;
                        return <SelectedStoreIcon className={`h-5 w-5 ${selectedStore.color}`} />;
                      })()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-medium text-green-700">Selected Business</p>
                        <Badge variant="outline" className={`text-xs ${selectedStore.bgColor} ${selectedStore.color} border-transparent`}>
                          {selectedStore.type}
                        </Badge>
                      </div>
                      <p className="font-semibold text-gray-900">{selectedStore.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-green-600" />
                        <p className="text-xs text-gray-600">{selectedStore.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelection(role.id)}
                      className={`w-full p-5 rounded-xl border-2 border-gray-200 hover:border-green-400 transition-all duration-300 hover:shadow-xl group ${role.bgColor} hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden`}
                    >
                      {/* Gradient overlay on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl`}></div>
                      
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-3.5 rounded-xl bg-white shadow-md group-hover:shadow-lg transition-all duration-300 border border-gray-100`}>
                          <Icon className={`h-7 w-7 ${role.iconColor}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors mb-1">{role.title}</h3>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                        {/* Arrow indicator */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ArrowLeft className="h-5 w-5 text-green-600 rotate-180" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-center text-sm text-gray-500 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-3.5 w-3.5 text-green-600" />
              <p className="font-medium text-gray-600">Authorized personnel only</p>
            </div>
            <p className="text-xs text-gray-400">© 2024 Geo Billing. All rights reserved.</p>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
