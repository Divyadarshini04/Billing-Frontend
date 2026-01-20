import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Plus, Trash2, Save, Printer, Download } from "lucide-react";

interface PurchaseItem {
  id: string;
  product: string;
  quantity: number;
  cost: number;
  tax: number;
  total: number;
}

const suppliers = [
  { id: '1', name: 'XYZ Supplies', phone: '9876543210' },
  { id: '2', name: 'Alpha Materials', phone: '9876543211' },
  { id: '3', name: 'Beta Distributors', phone: '9876543212' },
];

const products = [
  { id: '1', name: 'Raw Material A', cost: 300 },
  { id: '2', name: 'Raw Material B', cost: 450 },
  { id: '3', name: 'Component C', cost: 800 },
];

export function PurchaseEntryPage() {
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<PurchaseItem[]>([
    { id: '1', product: '', quantity: 1, cost: 0, tax: 18, total: 0 }
  ]);

  const addItem = () => {
    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      product: '',
      quantity: 1,
      cost: 0,
      tax: 18,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof PurchaseItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Auto-calculate total when cost, quantity, or tax changes
        if (field === 'cost' || field === 'quantity' || field === 'tax') {
          const subtotal = updated.cost * updated.quantity;
          const taxAmount = (subtotal * updated.tax) / 100;
          updated.total = subtotal + taxAmount;
        }
        
        return updated;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
  const totalTax = items.reduce((sum, item) => sum + ((item.cost * item.quantity * item.tax) / 100), 0);
  const grandTotal = subtotal + totalTax;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Purchase Entry</h1>
        <div className="flex space-x-2">
          <Button variant="outline" className="text-green-600 border-green-600">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" className="text-green-600 border-green-600">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" className="text-purple-600 border-purple-600">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Purchase Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name} - {supplier.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="date">Purchase Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Items</h3>
                <Button onClick={addItem} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Tax%</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Select 
                            value={item.product} 
                            onValueChange={(value) => {
                              updateItem(item.id, 'product', value);
                              const product = products.find(p => p.id === value);
                              if (product) {
                                updateItem(item.id, 'cost', product.cost);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.cost}
                            onChange={(e) => updateItem(item.id, 'cost', parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.tax}
                            onChange={(e) => updateItem(item.id, 'tax', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">₹{item.total.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          {items.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Tax:</span>
                <span>₹{totalTax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Final Amount:</span>
                  <span className="text-green-600">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  placeholder="Add any notes for this purchase order..."
                  className="w-full mt-1 p-2 border rounded-lg resize-none h-20"
                />
              </div>

              <div className="pt-4 border-t">
                <Label htmlFor="payment-terms">Payment Terms</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="net15">Net 15</SelectItem>
                    <SelectItem value="net30">Net 30</SelectItem>
                    <SelectItem value="net45">Net 45</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}