import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { Download, FileSpreadsheet, FileText, Calendar, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import type { UserRole } from "./phone-auth-page";

const salesReportData = [
  { id: 'INV-001', date: '2024-01-15', customer: 'ABC Corp', amount: 25000, status: 'Paid' },
  { id: 'INV-002', date: '2024-01-14', customer: 'Tech Solutions', amount: 18500, status: 'Pending' },
  { id: 'INV-003', date: '2024-01-13', customer: 'Global Industries', amount: 32000, status: 'Paid' },
  { id: 'INV-004', date: '2024-01-12', customer: 'Retail Chain', amount: 15000, status: 'Paid' },
  { id: 'INV-005', date: '2024-01-11', customer: 'ABC Corp', amount: 28000, status: 'Pending' },
];

const purchaseReportData = [
  { id: 'PUR-001', date: '2024-01-15', supplier: 'XYZ Supplies', amount: 15000, status: 'Paid' },
  { id: 'PUR-002', date: '2024-01-14', supplier: 'Alpha Materials', amount: 22000, status: 'Pending' },
  { id: 'PUR-003', date: '2024-01-13', supplier: 'Beta Distributors', amount: 18500, status: 'Paid' },
  { id: 'PUR-004', date: '2024-01-12', supplier: 'Gamma Supplies', amount: 12000, status: 'Paid' },
];

const taxReportData = [
  { id: 'INV-001', date: '2024-01-15', party: 'ABC Corp', type: 'Sales', taxableAmount: 21186, cgst: 1907, sgst: 1907, igst: 0, total: 25000 },
  { id: 'INV-003', date: '2024-01-13', party: 'Global Industries', type: 'Sales', taxableAmount: 27119, cgst: 2441, sgst: 2441, igst: 0, total: 32000 },
  { id: 'PUR-001', date: '2024-01-15', party: 'XYZ Supplies', type: 'Purchase', taxableAmount: 12712, cgst: 1144, sgst: 1144, igst: 0, total: 15000 },
  { id: 'PUR-002', date: '2024-01-14', party: 'Alpha Materials', type: 'Purchase', taxableAmount: 18644, cgst: 1678, sgst: 1678, igst: 0, total: 22000 },
  { id: 'INV-002', date: '2024-01-14', party: 'Tech Solutions', type: 'Sales', taxableAmount: 15678, cgst: 1411, sgst: 1411, igst: 0, total: 18500 },
];

const monthlyData = [
  { month: 'Jan', sales: 118500, purchases: 67500, profit: 51000 },
  { month: 'Feb', sales: 142000, purchases: 78000, profit: 64000 },
  { month: 'Mar', sales: 135000, purchases: 72000, profit: 63000 },
  { month: 'Apr', sales: 158000, purchases: 85000, profit: 73000 },
  { month: 'May', sales: 167000, purchases: 92000, profit: 75000 },
  { month: 'Jun', sales: 189000, purchases: 98000, profit: 91000 },
];

const categoryData = [
  { name: 'Electronics', value: 45, fill: '#3b82f6' },
  { name: 'Furniture', value: 25, fill: '#10b981' },
  { name: 'Accessories', value: 20, fill: '#f59e0b' },
  { name: 'Others', value: 10, fill: '#ef4444' },
];

export function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-01-31');
  const [reportType, setReportType] = useState('monthly');

  const totalSales = salesReportData.reduce((sum, item) => sum + item.amount, 0);
  const totalPurchases = purchaseReportData.reduce((sum, item) => sum + item.amount, 0);
  const totalProfit = totalSales - totalPurchases;

  const handleExportExcel = (type: string) => {
    console.log(`Exporting ${type} report to Excel...`);
    
    let data: any[] = [];
    let headers: string[] = [];
    let filename = '';
    
    if (type === 'sales') {
      data = salesReportData;
      headers = ['Invoice ID', 'Date', 'Customer', 'Amount', 'Status'];
      filename = 'sales_report';
    } else if (type === 'purchases') {
      data = purchaseReportData;
      headers = ['Purchase ID', 'Date', 'Supplier', 'Amount', 'Status'];
      filename = 'purchase_report';
    } else if (type === 'tax') {
      data = taxReportData;
      headers = ['ID', 'Date', 'Party', 'Type', 'Taxable Amount', 'CGST', 'SGST', 'IGST', 'Total'];
      filename = 'tax_report';
    }
    
    // Create CSV content
    let csvContent = headers.join(',') + '\\n';
    
    data.forEach((row: any) => {
      if (type === 'tax') {
        csvContent += `${row.id},${row.date},${row.party},${row.type},${row.taxableAmount},${row.cgst},${row.sgst},${row.igst},${row.total}\\n`;
      } else {
        const values = Object.values(row).join(',');
        csvContent += values + '\\n';
      }
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${dateFrom}_to_${dateTo}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = (type: string) => {
    console.log(`Exporting ${type} report to PDF...`);
    
    let data: any[] = [];
    let title = '';
    
    if (type === 'sales') {
      data = salesReportData;
      title = 'Sales Report';
    } else if (type === 'purchases') {
      data = purchaseReportData;
      title = 'Purchase Report';
    } else if (type === 'tax') {
      data = taxReportData;
      title = 'Tax Report';
    }
    
    // Create HTML content for PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1E40AF; margin-bottom: 10px; }
          .period { color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #1E40AF; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:hover { background-color: #f5f5f5; }
          .total { font-weight: bold; background-color: #f0f9ff; }
        </style>
      </head>
      <body>
        <h1>Geo Billing</h1>
        <h2>${title}</h2>
        <p class="period">Period: ${dateFrom} to ${dateTo}</p>
        <table>
    `;
    
    if (type === 'sales') {
      htmlContent += `
        <tr>
          <th>Invoice ID</th>
          <th>Date</th>
          <th>Customer</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      `;
      data.forEach(row => {
        htmlContent += `
          <tr>
            <td>${row.id}</td>
            <td>${row.date}</td>
            <td>${row.customer}</td>
            <td>₹${row.amount.toLocaleString()}</td>
            <td>${row.status}</td>
          </tr>
        `;
      });
      const total = data.reduce((sum, row) => sum + row.amount, 0);
      htmlContent += `
        <tr class="total">
          <td colspan="3">Total</td>
          <td>₹${total.toLocaleString()}</td>
          <td></td>
        </tr>
      `;
    } else if (type === 'purchases') {
      htmlContent += `
        <tr>
          <th>Purchase ID</th>
          <th>Date</th>
          <th>Supplier</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      `;
      data.forEach(row => {
        htmlContent += `
          <tr>
            <td>${row.id}</td>
            <td>${row.date}</td>
            <td>${row.supplier}</td>
            <td>₹${row.amount.toLocaleString()}</td>
            <td>${row.status}</td>
          </tr>
        `;
      });
      const total = data.reduce((sum, row) => sum + row.amount, 0);
      htmlContent += `
        <tr class="total">
          <td colspan="3">Total</td>
          <td>₹${total.toLocaleString()}</td>
          <td></td>
        </tr>
      `;
    } else if (type === 'tax') {
      htmlContent += `
        <tr>
          <th>ID</th>
          <th>Date</th>
          <th>Party</th>
          <th>Type</th>
          <th>Taxable</th>
          <th>CGST</th>
          <th>SGST</th>
          <th>IGST</th>
          <th>Total</th>
        </tr>
      `;
      data.forEach(row => {
        htmlContent += `
          <tr>
            <td>${row.id}</td>
            <td>${row.date}</td>
            <td>${row.party}</td>
            <td>${row.type}</td>
            <td>₹${row.taxableAmount.toLocaleString()}</td>
            <td>₹${row.cgst.toLocaleString()}</td>
            <td>₹${row.sgst.toLocaleString()}</td>
            <td>₹${row.igst.toLocaleString()}</td>
            <td>₹${row.total.toLocaleString()}</td>
          </tr>
        `;
      });
      const totals = data.reduce((acc, row) => ({
        taxable: acc.taxable + row.taxableAmount,
        cgst: acc.cgst + row.cgst,
        sgst: acc.sgst + row.sgst,
        igst: acc.igst + row.igst,
        total: acc.total + row.total
      }), { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 });
      
      htmlContent += `
        <tr class="total">
          <td colspan="4">Total</td>
          <td>₹${totals.taxable.toLocaleString()}</td>
          <td>₹${totals.cgst.toLocaleString()}</td>
          <td>₹${totals.sgst.toLocaleString()}</td>
          <td>₹${totals.igst.toLocaleString()}</td>
          <td>₹${totals.total.toLocaleString()}</td>
        </tr>
      `;
    }
    
    htmlContent += `
        </table>
      </body>
      </html>
    `;
    
    // Open in new window for printing/saving as PDF
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">
            {dateFrom} to {dateTo}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalSales.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">+15.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Purchases</CardTitle>
            <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalPurchases.toLocaleString()}</div>
            <p className="text-xs text-red-600 mt-1">+8.3% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalProfit.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">Margin: {((totalProfit/totalSales)*100).toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                <Bar dataKey="sales" fill="#10b981" name="Sales" radius={4} />
                <Bar dataKey="purchases" fill="#ef4444" name="Purchases" radius={4} />
                <Bar dataKey="profit" fill="#3b82f6" name="Profit" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Report Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="from-date">From Date</Label>
              <Input
                id="from-date"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="to-date">To Date</Label>
              <Input
                id="to-date"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="weekly">Weekly Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="yearly">Yearly Report</SelectItem>
                  <SelectItem value="tax">Tax Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="bg-green-600 hover:bg-green-700">
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sales" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sales">Sales Report</TabsTrigger>
              <TabsTrigger value="purchases">Purchase Report</TabsTrigger>
              <TabsTrigger value="tax">Tax Report</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Sales Transactions</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportExcel('sales')}
                    className="text-green-600 border-green-600"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportPDF('sales')}
                    className="text-red-600 border-red-600"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesReportData.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-mono">{sale.id}</TableCell>
                        <TableCell>{sale.date}</TableCell>
                        <TableCell>{sale.customer}</TableCell>
                        <TableCell className="font-medium">₹{sale.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sale.status === 'Paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sale.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="purchases" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Purchase Transactions</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportExcel('purchases')}
                    className="text-green-600 border-green-600"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportPDF('purchases')}
                    className="text-red-600 border-red-600"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Purchase ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseReportData.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-mono">{purchase.id}</TableCell>
                        <TableCell>{purchase.date}</TableCell>
                        <TableCell>{purchase.supplier}</TableCell>
                        <TableCell className="font-medium">₹{purchase.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            purchase.status === 'Paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {purchase.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="tax" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Tax Summary Report</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportExcel('tax')}
                    className="text-green-600 border-green-600"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportPDF('tax')}
                    className="text-red-600 border-red-600"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Party Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Taxable Amount</TableHead>
                      <TableHead>CGST (9%)</TableHead>
                      <TableHead>SGST (9%)</TableHead>
                      <TableHead>IGST</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxReportData.map((tax) => (
                      <TableRow key={tax.id}>
                        <TableCell className="font-mono">{tax.id}</TableCell>
                        <TableCell>{tax.date}</TableCell>
                        <TableCell>{tax.party}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tax.type === 'Sales' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {tax.type}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">₹{tax.taxableAmount.toLocaleString()}</TableCell>
                        <TableCell>₹{tax.cgst.toLocaleString()}</TableCell>
                        <TableCell>₹{tax.sgst.toLocaleString()}</TableCell>
                        <TableCell>₹{tax.igst.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">₹{tax.total.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-green-50 font-medium">
                      <TableCell colSpan={4}>Total Tax Collection</TableCell>
                      <TableCell>₹{taxReportData.reduce((sum, tax) => sum + tax.taxableAmount, 0).toLocaleString()}</TableCell>
                      <TableCell>₹{taxReportData.reduce((sum, tax) => sum + tax.cgst, 0).toLocaleString()}</TableCell>
                      <TableCell>₹{taxReportData.reduce((sum, tax) => sum + tax.sgst, 0).toLocaleString()}</TableCell>
                      <TableCell>₹{taxReportData.reduce((sum, tax) => sum + tax.igst, 0).toLocaleString()}</TableCell>
                      <TableCell>₹{taxReportData.reduce((sum, tax) => sum + tax.total, 0).toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}