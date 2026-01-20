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
  Cell
} from "recharts";
import { TrendingUp, Receipt, AlertCircle, Package, Users, Wallet, CreditCard, Shield, Activity, FileText } from "lucide-react";
import { Button } from "../ui/button";
import type { Page } from "../../App";
import { Badge } from "../ui/badge";

const salesData = [
  { month: 'Jan', sales: 45000, purchases: 32000 },
  { month: 'Feb', sales: 52000, purchases: 38000 },
  { month: 'Mar', sales: 48000, purchases: 35000 },
  { month: 'Apr', sales: 61000, purchases: 42000 },
  { month: 'May', sales: 55000, purchases: 39000 },
  { month: 'Jun', sales: 67000, purchases: 45000 },
];

const paymentModeData = [
  { name: 'Cash', value: 45, color: '#22c55e' },
  { name: 'Card', value: 30, color: '#16a34a' },
  { name: 'UPI', value: 20, color: '#15803d' },
  { name: 'Credit', value: 5, color: '#166534' },
];

const recentTransactions = [
  { id: 'INV-1247', customer: 'Walk-in Customer', amount: 1500, type: 'sale', time: '10:45 AM', payment: 'Cash', staff: 'Rahul S.' },
  { id: 'INV-1246', customer: 'ABC Corp', amount: 8500, type: 'sale', time: '10:30 AM', payment: 'UPI', staff: 'Priya K.' },
  { id: 'INV-1245', customer: 'Tech Solutions', amount: 22000, type: 'sale', time: '10:15 AM', payment: 'Card', staff: 'Amit P.' },
  { id: 'INV-1244', customer: 'Global Industries', amount: 4500, type: 'sale', time: '10:00 AM', payment: 'Cash', staff: 'Rahul S.' },
];

const salesStaffPerformance = [
  { name: 'Rahul S.', sales: 45000, bills: 32, avgBill: 1406 },
  { name: 'Priya K.', sales: 38000, bills: 28, avgBill: 1357 },
  { name: 'Amit P.', sales: 52000, bills: 38, avgBill: 1368 },
  { name: 'Sneha M.', sales: 35000, bills: 25, avgBill: 1400 },
];

export function AdminDashboard({ onNavigate }: { onNavigate?: (page: Page) => void }) {
  return (
    <div className="p-6 space-y-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-gray-900">Admin Dashboard</h1>
            <Badge className="bg-blue-600">Full Access</Badge>
          </div>
          <p className="text-gray-500">Complete system administration and monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onNavigate?.('reports')}>
            <FileText className="h-4 w-4 mr-2" />
            All Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md border-green-100 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Sales</CardTitle>
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
            <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Receipt className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">230</div>
            <p className="text-xs text-green-600 mt-1">42 today, avg ₹1,071/bill</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-green-100 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Low Stock Alerts</CardTitle>
            <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">5 Items</div>
            <p className="text-xs text-red-600 mt-1">Restock required soon</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-green-100 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Staff</CardTitle>
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">4 Online</div>
            <p className="text-xs text-blue-600 mt-1">All sales staff active</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-md border-green-100">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              onClick={() => onNavigate?.('pos-billing')}
              className="bg-green-600 hover:bg-green-700 h-16"
            >
              <Receipt className="h-5 w-5 mr-2" />
              New Invoice
            </Button>
            <Button 
              onClick={() => onNavigate?.('inventory')}
              variant="outline" 
              className="h-16"
            >
              <Package className="h-5 w-5 mr-2" />
              Add Product
            </Button>
            <Button 
              onClick={() => onNavigate?.('customers')}
              variant="outline" 
              className="h-16"
            >
              <Users className="h-5 w-5 mr-2" />
              Add Customer
            </Button>
            <Button 
              onClick={() => onNavigate?.('reports')}
              variant="outline" 
              className="h-16"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Purchases Chart */}
        <Card className="lg:col-span-2 shadow-md border-green-100">
          <CardHeader>
            <CardTitle>Monthly Sales Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                <Bar dataKey="sales" fill="#22c55e" name="Sales" radius={4} />
                <Bar dataKey="purchases" fill="#16a34a" name="Purchases" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Mode Distribution */}
        <Card className="shadow-md border-green-100">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
      </div>

      {/* Staff Performance */}
      <Card className="shadow-md border-green-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sales Staff Performance (Today)</CardTitle>
            <Badge variant="outline">Live Tracking</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {salesStaffPerformance.map((staff) => (
              <div key={staff.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{staff.name}</div>
                    <div className="text-sm text-gray-500">{staff.bills} bills generated</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">₹{staff.sales.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Avg: ₹{staff.avgBill}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="shadow-md border-green-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{transaction.id}</div>
                    <div className="text-sm text-gray-500">{transaction.customer} • by {transaction.staff}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">₹{transaction.amount.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{transaction.time} • {transaction.payment}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
