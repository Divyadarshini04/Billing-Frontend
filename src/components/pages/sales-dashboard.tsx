import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Receipt, Package, Users, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import type { Page } from "../../App";

export function SalesDashboard({ onNavigate }: { onNavigate?: (page: Page) => void }) {
  return (
    <div className="p-6 space-y-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-500">Quick access to daily billing operations</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Today's Stats - Simple View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md border-green-100 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">My Sales Today</CardTitle>
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Receipt className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹18,500</div>
            <p className="text-xs text-green-600 mt-1">12 bills generated</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-green-100 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Bill Value</CardTitle>
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹1,542</div>
            <p className="text-xs text-gray-500 mt-1">Per transaction</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-green-100 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Customers Served</CardTitle>
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <p className="text-xs text-gray-500 mt-1">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Large Quick Action Buttons */}
      <Card className="shadow-lg border-green-100">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => onNavigate?.('pos-billing')}
              className="bg-green-600 hover:bg-green-700 h-32 text-lg flex-col gap-3"
              size="lg"
            >
              <Receipt className="h-10 w-10" />
              <span>Create New Bill</span>
            </Button>
            <Button 
              onClick={() => onNavigate?.('inventory')}
              variant="outline" 
              className="h-32 text-lg flex-col gap-3 border-2 hover:border-green-600 hover:bg-green-50"
              size="lg"
            >
              <Package className="h-10 w-10" />
              <span>Check Inventory</span>
            </Button>
            <Button 
              onClick={() => onNavigate?.('customers')}
              variant="outline" 
              className="h-32 text-lg flex-col gap-3 border-2 hover:border-green-600 hover:bg-green-50"
              size="lg"
            >
              <Users className="h-10 w-10" />
              <span>View Customers</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Bills */}
      <Card className="shadow-md border-green-100">
        <CardHeader>
          <CardTitle>My Recent Bills (Today)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: 'INV-1247', customer: 'Walk-in Customer', amount: 1500, time: '2:45 PM', payment: 'Cash' },
              { id: 'INV-1246', customer: 'Rajesh Kumar', amount: 2800, time: '2:30 PM', payment: 'UPI' },
              { id: 'INV-1245', customer: 'Priya Sharma', amount: 4200, time: '1:15 PM', payment: 'Card' },
              { id: 'INV-1244', customer: 'Walk-in Customer', amount: 850, time: '12:00 PM', payment: 'Cash' },
              { id: 'INV-1243', customer: 'Amit Patel', amount: 3200, time: '11:30 AM', payment: 'UPI' },
            ].map((bill) => (
              <div key={bill.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{bill.id}</div>
                    <div className="text-sm text-gray-500">{bill.customer}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">₹{bill.amount.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{bill.time} • {bill.payment}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
