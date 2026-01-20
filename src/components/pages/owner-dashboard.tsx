import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { TrendingUp, Receipt, AlertCircle, Package, Users, Wallet, CreditCard, IndianRupee, FileText, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import type { Page } from "../../App";

const dailySalesData = [
  { day: 'Mon', sales: 12000, tax: 2160, profit: 3600 },
  { day: 'Tue', sales: 15000, tax: 2700, profit: 4500 },
  { day: 'Wed', sales: 13500, tax: 2430, profit: 4050 },
  { day: 'Thu', sales: 18000, tax: 3240, profit: 5400 },
  { day: 'Fri', sales: 22000, tax: 3960, profit: 6600 },
  { day: 'Sat', sales: 25000, tax: 4500, profit: 7500 },
  { day: 'Sun', sales: 16000, tax: 2880, profit: 4800 },
];

const weeklySalesData = [
  { week: 'Week 1', sales: 95000, purchases: 65000, profit: 30000 },
  { week: 'Week 2', sales: 105000, purchases: 72000, profit: 33000 },
  { week: 'Week 3', sales: 98000, purchases: 68000, profit: 30000 },
  { week: 'Week 4', sales: 121500, purchases: 82000, profit: 39500 },
];

const taxReportData = [
  { month: 'Jan', cgst: 5200, sgst: 5200, igst: 2100, total: 12500 },
  { month: 'Feb', cgst: 6100, sgst: 6100, igst: 2800, total: 15000 },
  { month: 'Mar', cgst: 5800, sgst: 5800, igst: 2400, total: 14000 },
  { month: 'Apr', cgst: 7200, sgst: 7200, igst: 3600, total: 18000 },
  { month: 'May', cgst: 6500, sgst: 6500, igst: 3000, total: 16000 },
  { month: 'Jun', cgst: 8100, sgst: 8100, igst: 4200, total: 20400 },
];

const paymentModeData = [
  { name: 'Cash', value: 45, color: '#22c55e' },
  { name: 'Card', value: 30, color: '#16a34a' },
  { name: 'UPI', value: 20, color: '#15803d' },
  { name: 'Credit', value: 5, color: '#166534' },
];

export function OwnerDashboard({ onNavigate }: { onNavigate?: (page: Page) => void }) {
  return (
    <div className="p-6 space-y-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-500">Complete business overview and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onNavigate?.('reports')}>
            <FileText className="h-4 w-4 mr-2" />
            Detailed Reports
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md border-green-100 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Revenue</CardTitle>
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Wallet className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹45,000</div>
            <p className="text-xs text-green-600 mt-1">+18.2% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-green-100 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Weekly Revenue</CardTitle>
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹3,21,500</div>
            <p className="text-xs text-blue-600 mt-1">Current week total</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-green-100 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tax Collected (GST)</CardTitle>
            <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <IndianRupee className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹20,400</div>
            <p className="text-xs text-orange-600 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-green-100 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Profit Margin</CardTitle>
            <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">32.5%</div>
            <p className="text-xs text-purple-600 mt-1">+2.4% this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily, Weekly & Tax Reports Tabs */}
      <Card className="shadow-md border-green-100">
        <CardHeader>
          <CardTitle>Sales & Tax Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="daily">Daily Report</TabsTrigger>
              <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
              <TabsTrigger value="tax">Tax Report</TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Total Sales (Week)</p>
                  <p className="text-xl font-bold text-gray-900">₹1,21,500</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600">Total Tax (Week)</p>
                  <p className="text-xl font-bold text-gray-900">₹21,870</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600">Profit (Week)</p>
                  <p className="text-xl font-bold text-gray-900">₹36,450</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                  <Area type="monotone" dataKey="sales" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="profit" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="weekly" className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Total Sales (Month)</p>
                  <p className="text-xl font-bold text-gray-900">₹4,19,500</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-600">Total Purchases</p>
                  <p className="text-xl font-bold text-gray-900">₹2,87,000</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600">Net Profit</p>
                  <p className="text-xl font-bold text-gray-900">₹1,32,500</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                  <Bar dataKey="sales" fill="#22c55e" name="Sales" radius={4} />
                  <Bar dataKey="purchases" fill="#fb923c" name="Purchases" radius={4} />
                  <Bar dataKey="profit" fill="#8b5cf6" name="Profit" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="tax" className="space-y-4">
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-gray-600">CGST Collected</p>
                  <p className="text-xl font-bold text-gray-900">₹38,900</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600">SGST Collected</p>
                  <p className="text-xl font-bold text-gray-900">₹38,900</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-600">IGST Collected</p>
                  <p className="text-xl font-bold text-gray-900">₹18,100</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Total Tax</p>
                  <p className="text-xl font-bold text-gray-900">₹95,900</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={taxReportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                  <Line type="monotone" dataKey="cgst" stroke="#ef4444" strokeWidth={2} name="CGST" />
                  <Line type="monotone" dataKey="sgst" stroke="#3b82f6" strokeWidth={2} name="SGST" />
                  <Line type="monotone" dataKey="igst" stroke="#f97316" strokeWidth={2} name="IGST" />
                  <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={3} name="Total" />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Mode Distribution */}
        <Card className="shadow-md border-green-100">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentModeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name} ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentModeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="shadow-md border-green-100">
          <CardHeader>
            <CardTitle>Business Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Invoices</p>
                  <p className="font-medium text-gray-900">1,248 this month</p>
                </div>
              </div>
              <div className="text-green-600">+12%</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Customers</p>
                  <p className="font-medium text-gray-900">1,248 registered</p>
                </div>
              </div>
              <div className="text-blue-600">+24</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Low Stock Alerts</p>
                  <p className="font-medium text-gray-900">5 items need restock</p>
                </div>
              </div>
              <Button size="sm" variant="outline">View</Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Products in Inventory</p>
                  <p className="font-medium text-gray-900">482 active SKUs</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Manage</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
