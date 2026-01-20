import { useState } from "react";
import { User, Building2, Settings, FileText, DollarSign, Bell, Lock, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner@2.0.3";

export function ProfileSettingsPage() {
  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    email: "john.doe@business.com",
    phone: "+1 234 567 8900",
    role: "Admin",
    avatar: ""
  });

  const [businessSettings, setBusinessSettings] = useState({
    businessName: "Geo Billing",
    gstin: "29ABCDE1234F1Z5",
    pan: "ABCDE1234F",
    address: "123 Business Street, Silicon Valley, CA 94025",
    city: "San Francisco",
    state: "California",
    zipCode: "94025",
    country: "United States",
    phone: "+1 234 567 8900",
    email: "contact@geobilling.com",
    website: "www.geobilling.com"
  });

  const [taxSettings, setTaxSettings] = useState({
    defaultTaxRate: "18",
    taxType: "GST",
    enableCess: false,
    enableTDS: false,
    tdsRate: "10"
  });

  const [invoiceSettings, setInvoiceSettings] = useState({
    invoicePrefix: "INV",
    nextInvoiceNumber: "1001",
    termsAndConditions: "Payment due within 30 days. Late payments will incur a 2% monthly interest charge.",
    bankName: "Bank of America",
    accountNumber: "1234567890",
    ifscCode: "BOA0001234",
    upiId: "business@upi"
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    paymentReminders: true,
    dailyReports: false
  });

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully!");
  };

  const handleSaveBusinessSettings = () => {
    toast.success("Business settings saved successfully!");
  };

  const handleSaveTaxSettings = () => {
    toast.success("Tax settings saved successfully!");
  };

  const handleSaveInvoiceSettings = () => {
    toast.success("Invoice settings saved successfully!");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved!");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Profile & Settings</h1>
        <p className="text-gray-500">Manage your account, business settings, and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Business</span>
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Tax</span>
          </TabsTrigger>
          <TabsTrigger value="invoice" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Invoice</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userProfile.avatar} />
                  <AvatarFallback className="bg-green-100 text-green-600 text-2xl">
                    {userProfile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={userProfile.role} onValueChange={(value) => setUserProfile({ ...userProfile, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Accountant">Accountant</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Change Password
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Settings Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>Configure your business information for invoices and documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    value={businessSettings.businessName}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, businessName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    value={businessSettings.gstin}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, gstin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN</Label>
                  <Input
                    id="pan"
                    value={businessSettings.pan}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, pan: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-phone">Phone</Label>
                  <Input
                    id="business-phone"
                    value={businessSettings.phone}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-email">Email</Label>
                  <Input
                    id="business-email"
                    type="email"
                    value={businessSettings.email}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={businessSettings.website}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={businessSettings.address}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, address: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={businessSettings.city}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={businessSettings.state}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, state: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={businessSettings.zipCode}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, zipCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={businessSettings.country}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveBusinessSettings}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Settings Tab */}
        <TabsContent value="tax" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Configuration</CardTitle>
              <CardDescription>Configure tax rates and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tax-type">Tax Type</Label>
                  <Select value={taxSettings.taxType} onValueChange={(value) => setTaxSettings({ ...taxSettings, taxType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GST">GST (Goods and Services Tax)</SelectItem>
                      <SelectItem value="VAT">VAT (Value Added Tax)</SelectItem>
                      <SelectItem value="Sales Tax">Sales Tax</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-tax-rate">Default Tax Rate (%)</Label>
                  <Input
                    id="default-tax-rate"
                    type="number"
                    value={taxSettings.defaultTaxRate}
                    onChange={(e) => setTaxSettings({ ...taxSettings, defaultTaxRate: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable CESS</Label>
                    <p className="text-sm text-gray-500">Apply CESS on applicable items</p>
                  </div>
                  <Switch
                    checked={taxSettings.enableCess}
                    onCheckedChange={(checked) => setTaxSettings({ ...taxSettings, enableCess: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable TDS</Label>
                    <p className="text-sm text-gray-500">Deduct TDS on transactions</p>
                  </div>
                  <Switch
                    checked={taxSettings.enableTDS}
                    onCheckedChange={(checked) => setTaxSettings({ ...taxSettings, enableTDS: checked })}
                  />
                </div>

                {taxSettings.enableTDS && (
                  <div className="space-y-2 ml-0">
                    <Label htmlFor="tds-rate">TDS Rate (%)</Label>
                    <Input
                      id="tds-rate"
                      type="number"
                      value={taxSettings.tdsRate}
                      onChange={(e) => setTaxSettings({ ...taxSettings, tdsRate: e.target.value })}
                      className="max-w-xs"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveTaxSettings}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Settings Tab */}
        <TabsContent value="invoice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
              <CardDescription>Configure invoice numbering, terms, and bank details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
                  <Input
                    id="invoice-prefix"
                    value={invoiceSettings.invoicePrefix}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, invoicePrefix: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next-invoice">Next Invoice Number</Label>
                  <Input
                    id="next-invoice"
                    type="number"
                    value={invoiceSettings.nextInvoiceNumber}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, nextInvoiceNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms">Terms and Conditions</Label>
                <Textarea
                  id="terms"
                  value={invoiceSettings.termsAndConditions}
                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, termsAndConditions: e.target.value })}
                  rows={3}
                />
              </div>

              <Separator />

              <div>
                <h3 className="mb-4">Bank Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bank-name">Bank Name</Label>
                    <Input
                      id="bank-name"
                      value={invoiceSettings.bankName}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, bankName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-number">Account Number</Label>
                    <Input
                      id="account-number"
                      value={invoiceSettings.accountNumber}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, accountNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ifsc">IFSC Code</Label>
                    <Input
                      id="ifsc"
                      value={invoiceSettings.ifscCode}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, ifscCode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upi">UPI ID</Label>
                    <Input
                      id="upi"
                      value={invoiceSettings.upiId}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, upiId: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveInvoiceSettings}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-gray-500">Get notified when products are running low</p>
                  </div>
                  <Switch
                    checked={notificationSettings.lowStockAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, lowStockAlerts: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Reminders</Label>
                    <p className="text-sm text-gray-500">Send automatic reminders for pending payments</p>
                  </div>
                  <Switch
                    checked={notificationSettings.paymentReminders}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, paymentReminders: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Reports</Label>
                    <p className="text-sm text-gray-500">Receive daily summary of sales and transactions</p>
                  </div>
                  <Switch
                    checked={notificationSettings.dailyReports}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, dailyReports: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveNotifications}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}