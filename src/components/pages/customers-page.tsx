import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Search, Plus, Edit, Trash2, User, Phone, Mail, MapPin, Star, TrendingUp, Award, Download, Upload, FileDown, FileUp } from "lucide-react";
import type { UserRole } from "./phone-auth-page";
import { Progress } from "../ui/progress";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  gstin: string;
  address: string;
  balanceDue: number;
  totalSales: number;
  lastTransaction: string;
  creditScore?: number;
  recentPurchaseAmount?: number;
}

const initialCustomers: Customer[] = [
  {
    id: '1',
    name: 'ABC Corporation Ltd.',
    mobile: '+91 9876543210',
    email: 'contact@abccorp.com',
    gstin: '29ABCDE1234F1Z5',
    address: '123 Business Park, Mumbai, Maharashtra 400001',
    balanceDue: 25000,
    totalSales: 150000,
    lastTransaction: '2024-01-15',
    creditScore: 85,
    recentPurchaseAmount: 2500
  },
  {
    id: '2',
    name: 'Tech Solutions Pvt Ltd',
    mobile: '+91 9876543211',
    email: 'info@techsolutions.com',
    gstin: '27FGHIJ5678K2L3',
    address: '456 Tech Hub, Bangalore, Karnataka 560001',
    balanceDue: 0,
    totalSales: 89000,
    lastTransaction: '2024-01-12',
    creditScore: 92,
    recentPurchaseAmount: 1800
  },
  {
    id: '3',
    name: 'Global Industries',
    mobile: '+91 9876543212',
    email: 'sales@globalind.com',
    gstin: '24MNOPQ9012R3S4',
    address: '789 Industrial Area, Pune, Maharashtra 411001',
    balanceDue: 12500,
    totalSales: 220000,
    lastTransaction: '2024-01-10',
    creditScore: 78,
    recentPurchaseAmount: 3200
  },
  {
    id: '4',
    name: 'Retail Store Chain',
    mobile: '+91 9876543213',
    email: 'procurement@retailstore.com',
    gstin: '06TUVWX3456Y7Z8',
    address: '321 Commercial Street, Delhi, Delhi 110001',
    balanceDue: 7800,
    totalSales: 45000,
    lastTransaction: '2024-01-08',
    creditScore: 65,
    recentPurchaseAmount: 1200
  }
];

// Credit score calculation based on recent purchase amount
// Above ₹2000 = 100 points, Above ₹1500 = 75 points, else proportional
function calculateCreditScore(recentPurchaseAmount: number, totalSales: number): number {
  let baseScore = 0;
  
  // Points based on recent purchase
  if (recentPurchaseAmount >= 2000) {
    baseScore = 100;
  } else if (recentPurchaseAmount >= 1500) {
    baseScore = 75;
  } else {
    baseScore = Math.min((recentPurchaseAmount / 1500) * 75, 75);
  }
  
  // Bonus points based on total sales history (up to 25 points)
  const salesBonus = Math.min((totalSales / 100000) * 25, 25);
  
  return Math.round(Math.min(baseScore + salesBonus, 100));
}

function getCreditScoreBadge(score: number) {
  if (score >= 90) return { label: 'Excellent', color: 'bg-green-600' };
  if (score >= 75) return { label: 'Good', color: 'bg-blue-600' };
  if (score >= 60) return { label: 'Fair', color: 'bg-yellow-600' };
  return { label: 'Poor', color: 'bg-gray-600' };
}

export function CustomersPage({ userRole }: { userRole: UserRole | null }) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isManagePointsOpen, setIsManagePointsOpen] = useState(false);
  const [pointsCustomer, setPointsCustomer] = useState<Customer | null>(null);
  const [pointsToAdd, setPointsToAdd] = useState(0);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    mobile: '',
    email: '',
    gstin: '',
    address: '',
    balanceDue: 0,
    totalSales: 0
  });

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.mobile.includes(searchQuery) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.mobile) {
      const customer: Customer = {
        id: Date.now().toString(),
        name: newCustomer.name,
        mobile: newCustomer.mobile,
        email: newCustomer.email || '',
        gstin: newCustomer.gstin || '',
        address: newCustomer.address || '',
        balanceDue: newCustomer.balanceDue || 0,
        totalSales: 0,
        lastTransaction: new Date().toISOString().split('T')[0]
      };
      setCustomers([...customers, customer]);
      setNewCustomer({ name: '', mobile: '', email: '', gstin: '', address: '', balanceDue: 0, totalSales: 0 });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditCustomer = () => {
    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? editingCustomer : c));
      setEditingCustomer(null);
    }
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  const handleAddPoints = () => {
    if (pointsCustomer && userRole === 'owner') {
      setCustomers(customers.map(c => 
        c.id === pointsCustomer.id 
          ? { ...c, creditScore: (c.creditScore || 0) + pointsToAdd }
          : c
      ));
      setIsManagePointsOpen(false);
      setPointsCustomer(null);
      setPointsToAdd(0);
    }
  };

  const getBalanceStatus = (balance: number) => {
    if (balance === 0) return { status: 'Paid', color: 'bg-green-100 text-green-800' };
    if (balance > 0) return { status: 'Due', color: 'bg-red-100 text-red-800' };
    return { status: 'Credit', color: 'bg-green-100 text-green-800' };
  };

  // Export customers to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Mobile', 'Email', 'GSTIN', 'Address', 'Balance Due', 'Total Sales', 'Last Transaction', 'Credit Score', 'Recent Purchase'];
    const csvData = customers.map(c => [
      c.id,
      c.name,
      c.mobile,
      c.email,
      c.gstin,
      c.address,
      c.balanceDue,
      c.totalSales,
      c.lastTransaction,
      c.creditScore || 0,
      c.recentPurchaseAmount || 0
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Customers exported to CSV successfully!');
  };

  // Import customers from CSV
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        const importedCustomers: Customer[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          // Parse CSV line respecting quoted values
          const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
          const cleanValues = values.map(v => v.replace(/^"|"$/g, ''));
          
          if (cleanValues.length >= 8) {
            const customer: Customer = {
              id: cleanValues[0] || Date.now().toString() + Math.random(),
              name: cleanValues[1] || 'Unknown',
              mobile: cleanValues[2] || '',
              email: cleanValues[3] || '',
              gstin: cleanValues[4] || '',
              address: cleanValues[5] || '',
              balanceDue: parseFloat(cleanValues[6]) || 0,
              totalSales: parseFloat(cleanValues[7]) || 0,
              lastTransaction: cleanValues[8] || new Date().toISOString().split('T')[0],
              creditScore: parseFloat(cleanValues[9]) || 0,
              recentPurchaseAmount: parseFloat(cleanValues[10]) || 0
            };
            importedCustomers.push(customer);
          }
        }
        
        if (importedCustomers.length > 0) {
          setCustomers([...customers, ...importedCustomers]);
          toast.success(`Successfully imported ${importedCustomers.length} customers!`);
        } else {
          toast.error('No valid customer data found in CSV');
        }
      } catch (error) {
        toast.error('Error importing CSV file. Please check the format.');
        console.error('CSV Import Error:', error);
      }
    };
    
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Customer Management</h1>
        <div className="flex gap-2">
          {/* Export/Import Buttons */}
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          {userRole !== 'sales' && (
            <>
              <label htmlFor="csv-upload">
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={() => document.getElementById('csv-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
              </label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </>
          )}

          {userRole !== 'sales' && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>
                    Add a new customer with contact details and business information.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <Label htmlFor="name">Customer Name *</Label>
                    <Input
                      id="name"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile Number *</Label>
                    <Input
                      id="mobile"
                      value={newCustomer.mobile}
                      onChange={(e) => setNewCustomer({...newCustomer, mobile: e.target.value})}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                      placeholder="customer@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gstin">GST Number</Label>
                    <Input
                      id="gstin"
                      value={newCustomer.gstin}
                      onChange={(e) => setNewCustomer({...newCustomer, gstin: e.target.value})}
                      placeholder="29ABCDE1234F1Z5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                      placeholder="Enter complete address"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="balance">Opening Balance (₹)</Label>
                    <Input
                      id="balance"
                      type="number"
                      value={newCustomer.balanceDue}
                      onChange={(e) => setNewCustomer({...newCustomer, balanceDue: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>
                  <Button onClick={handleAddCustomer} className="w-full bg-green-600 hover:bg-green-700">
                    Add Customer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers by name, mobile or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-500">
              Total Customers: {customers.length}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>GST Number</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead>Balance Due</TableHead>
                  {(userRole === 'owner' || userRole === 'admin') && (
                    <TableHead>Credit Score</TableHead>
                  )}
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => {
                  const balanceStatus = getBalanceStatus(customer.balanceDue);
                  const creditScore = calculateCreditScore(customer.recentPurchaseAmount || 0, customer.totalSales);
                  const scoreBadge = getCreditScoreBadge(creditScore);
                  
                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {customer.address.split(',').slice(-2).join(',').trim()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-2 text-gray-400" />
                            {customer.mobile}
                          </div>
                          {customer.email && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail className="h-3 w-3 mr-2 text-gray-400" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{customer.gstin || '-'}</span>
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{customer.totalSales.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {customer.balanceDue > 0 ? '₹' + customer.balanceDue.toLocaleString() : '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Last: {customer.lastTransaction}
                        </div>
                        {customer.balanceDue > 0 && (
                          <div className="text-xs font-semibold text-orange-600 mt-1">
                            Pending: ₹{customer.balanceDue.toLocaleString()}
                          </div>
                        )}
                      </TableCell>
                      {(userRole === 'owner' || userRole === 'admin') && (
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium text-lg">{creditScore}</span>
                            </div>
                            <Badge className={`${scoreBadge.color} text-white`}>
                              {scoreBadge.label}
                            </Badge>
                            <div className="text-xs text-gray-500">
                              Recent: ₹{customer.recentPurchaseAmount || 0}
                            </div>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge className={balanceStatus.color}>
                          {balanceStatus.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {userRole !== 'sales' ? (
                            <>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingCustomer({...customer})}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                  <DialogHeader>
                                    <DialogTitle>Edit Customer</DialogTitle>
                                    <DialogDescription>
                                      Update customer contact details and business information.
                                    </DialogDescription>
                                  </DialogHeader>
                                  {editingCustomer && (
                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                      <div>
                                        <Label htmlFor="edit-name">Customer Name</Label>
                                        <Input
                                          id="edit-name"
                                          value={editingCustomer.name}
                                          onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="edit-mobile">Mobile Number</Label>
                                        <Input
                                          id="edit-mobile"
                                          value={editingCustomer.mobile}
                                          onChange={(e) => setEditingCustomer({...editingCustomer, mobile: e.target.value})}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="edit-email">Email</Label>
                                        <Input
                                          id="edit-email"
                                          type="email"
                                          value={editingCustomer.email}
                                          onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="edit-gstin">GST Number</Label>
                                        <Input
                                          id="edit-gstin"
                                          value={editingCustomer.gstin}
                                          onChange={(e) => setEditingCustomer({...editingCustomer, gstin: e.target.value})}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="edit-address">Address</Label>
                                        <Textarea
                                          id="edit-address"
                                          value={editingCustomer.address}
                                          onChange={(e) => setEditingCustomer({...editingCustomer, address: e.target.value})}
                                          rows={3}
                                        />
                                      </div>
                                      <Button onClick={handleEditCustomer} className="w-full bg-green-600 hover:bg-green-700">
                                        Save Changes
                                      </Button>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCustomer(customer.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              {userRole === 'owner' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setPointsCustomer(customer);
                                    setIsManagePointsOpen(true);
                                  }}
                                  className="text-yellow-600 hover:text-yellow-700"
                                  title="Manage Points"
                                >
                                  <Award className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">View Only</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Points Management Dialog */}
      <Dialog open={isManagePointsOpen} onOpenChange={setIsManagePointsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Credit Points</DialogTitle>
            <DialogDescription>
              Add or subtract credit points for {pointsCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          {pointsCustomer && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Current Points</p>
                    <p className="text-2xl font-semibold text-green-600">{pointsCustomer.creditScore || 0}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="points">Points to Add/Subtract</Label>
                <Input
                  id="points"
                  type="number"
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                  placeholder="Enter points (use negative to subtract)"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use positive numbers to add points, negative to subtract
                </p>
              </div>

              {pointsToAdd !== 0 && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">
                    New Points: <span className="font-semibold text-blue-600">
                      {(pointsCustomer.creditScore || 0) + pointsToAdd}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleAddPoints} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={pointsToAdd === 0}
                >
                  Update Points
                </Button>
                <Button 
                  onClick={() => {
                    setIsManagePointsOpen(false);
                    setPointsCustomer(null);
                    setPointsToAdd(0);
                  }} 
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}