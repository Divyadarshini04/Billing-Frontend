import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Search, Scan, Plus, Trash2, Save, Printer, CreditCard, Wallet, Smartphone, User, Gift, Send, Barcode, Store } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { businessProducts } from "../data/business-products";
import type { StoreInfo } from "./phone-auth-page";

interface BillingItem {
  id: string;
  name: string;
  barcode: string;
  qty: number;
  rate: number;
  discount: number;
  taxRate: number;
  amount: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  gstin: string;
  loyaltyPoints: number;
}

interface POSBillingPageProps {
  storeInfo?: StoreInfo | null;
}

export function POSBillingPage({ storeInfo }: POSBillingPageProps) {
  const businessType = storeInfo?.type || "Retail Store";
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [customer, setCustomer] = useState<Partial<Customer>>({
    name: "",
    phone: "",
    gstin: "",
    loyaltyPoints: 0
  });

  const [items, setItems] = useState<BillingItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [gstEnabled, setGstEnabled] = useState(true);
  const [customerState, setCustomerState] = useState("same"); // same or different for CGST/SGST or IGST
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState("");

  // Get products based on business type
  const mockProducts = (businessProducts[businessType] || businessProducts["Retail Store"]).map(p => ({
    id: p.id,
    name: p.name,
    barcode: p.barcode,
    rate: p.sellingPrice,
    stock: p.stock,
    taxRate: p.taxRate,
    unit: p.unit || 'piece'
  }));

  // Auto-focus barcode scanner on mount
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const addItem = (product: typeof mockProducts[0]) => {
    const existingItem = items.find(item => item.barcode === product.barcode);
    
    if (existingItem) {
      setItems(items.map(item => 
        item.barcode === product.barcode 
          ? { ...item, qty: item.qty + 1, amount: (item.qty + 1) * item.rate * (1 - item.discount / 100) }
          : item
      ));
    } else {
      const newItem: BillingItem = {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        qty: 1,
        rate: product.rate,
        discount: 0,
        taxRate: product.taxRate,
        amount: product.rate
      };
      setItems([...items, newItem]);
    }
    setProductSearch("");
    setBarcodeInput("");
  };

  const updateItemQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setItems(items.filter(item => item.id !== id));
      return;
    }
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, qty, amount: qty * item.rate * (1 - item.discount / 100) }
        : item
    ));
  };

  const updateItemDiscount = (id: string, discount: number) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, discount, amount: item.qty * item.rate * (1 - discount / 100) }
        : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    const subTotal = items.reduce((sum, item) => sum + item.amount, 0);
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    if (gstEnabled) {
      items.forEach(item => {
        const taxableAmount = item.amount;
        const taxAmount = (taxableAmount * item.taxRate) / 100;
        
        if (customerState === "same") {
          cgst += taxAmount / 2;
          sgst += taxAmount / 2;
        } else {
          igst += taxAmount;
        }
      });
    }
    
    const totalTax = cgst + sgst + igst;
    const grandTotal = subTotal + totalTax;
    
    return { subTotal, cgst, sgst, igst, totalTax, grandTotal };
  };

  const handleSaveInvoice = () => {
    if (items.length === 0) {
      toast.error("Please add items to the invoice");
      return;
    }
    
    const invoiceNum = "INV-" + Math.floor(Math.random() * 10000);
    setLastInvoiceNumber(invoiceNum);
    toast.success("Invoice saved successfully! " + invoiceNum);
    
    // Update stock (in real app, this would be an API call)
    console.log("Stock updated for items:", items);
    
    // Show WhatsApp dialog if customer has phone number
    if (customer.phone) {
      setShowWhatsAppDialog(true);
    }
  };
  
  const handleSendWhatsApp = () => {
    if (!customer.phone) {
      toast.error("Customer phone number is required");
      return;
    }
    
    const totals = calculateTotals();
    const phoneNumber = customer.phone.replace(/\D/g, ''); // Remove non-digits
    
    // Create invoice message
    const message = `
*Geo Billing - Invoice ${lastInvoiceNumber}*

Dear ${customer.name || 'Customer'},

Thank you for your purchase!

*Invoice Summary:*
${items.map((item, idx) => `${idx + 1}. ${item.name} - ${item.qty} x ₹${item.rate} = ₹${item.amount}`).join('\n')}

*Subtotal:* ₹${totals.subTotal.toFixed(2)}
${gstEnabled ? `*Tax (GST):* ₹${totals.totalTax.toFixed(2)}` : ''}
*Grand Total:* ₹${totals.grandTotal.toFixed(2)}

Payment Mode: ${paymentMode.toUpperCase()}

Visit again! 
- Geo Billing Team
    `.trim();
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success("Opening WhatsApp...");
    setShowWhatsAppDialog(false);
  };

  const handlePrintInvoice = () => {
    toast.success("Invoice sent to printer");
    // In real app, this would generate a PDF and send to printer
  };

  const handleNewBill = () => {
    setItems([]);
    setCustomer({ name: "", phone: "", gstin: "", loyaltyPoints: 0 });
    setProductSearch("");
    setBarcodeInput("");
    toast.info("New bill started");
  };

  const totals = calculateTotals();
  const filteredProducts = productSearch
    ? mockProducts.filter(p => 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.barcode.includes(productSearch)
      )
    : [];

  return (
    <div className="h-full p-4 overflow-auto">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-gray-900">Point of Sale - Billing</h1>
            <div className="flex items-center gap-3 mt-1">
              {storeInfo && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  {(() => {
                    const StoreIcon = storeInfo.icon;
                    return <StoreIcon className={`h-4 w-4 ${storeInfo.color}`} />;
                  })()}
                  <span className="text-sm">{storeInfo.name}</span>
                </div>
              )}
              <Separator orientation="vertical" className="h-4" />
              <p className="text-sm text-gray-500">Invoice #{Math.floor(Math.random() * 10000).toString().padStart(5, '0')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white">
              {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </Badge>
            <Badge className={gstEnabled ? "bg-green-600" : "bg-gray-500"}>
              {gstEnabled ? "GST Enabled" : "Without GST"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Customer & Products */}
          <div className="lg:col-span-2 space-y-4">
            {/* Customer Details */}
            <Card className="shadow-md border-green-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Customer Name</Label>
                    <Input
                      placeholder="Search or enter name"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Phone / Email</Label>
                    <Input
                      placeholder="Phone or email"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">GSTIN (Optional)</Label>
                    <Input
                      placeholder="GSTIN"
                      value={customer.gstin}
                      onChange={(e) => setCustomer({ ...customer, gstin: e.target.value })}
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Loyalty Points: <strong>{customer.loyaltyPoints || 0}</strong></span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCustomer({ ...customer, loyaltyPoints: (customer.loyaltyPoints || 0) + 100 })}
                      className="h-6 px-2 text-xs text-green-600 hover:text-green-700"
                      title="Add 100 test points"
                    >
                      +100
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Tax Type:</Label>
                    <Select value={customerState} onValueChange={setCustomerState}>
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="same">CGST+SGST</SelectItem>
                        <SelectItem value="different">IGST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Search */}
            <Card className="shadow-md border-green-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-green-600" />
                  Add Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <Barcode className="h-3.5 w-3.5 text-green-600" />
                      Barcode Scanner
                    </Label>
                    <div className="relative">
                      <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600 animate-pulse" />
                      <Input
                        ref={barcodeInputRef}
                        placeholder="Scan barcode or type 890..."
                        value={barcodeInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          setBarcodeInput(value);
                          // Auto-add product when full barcode is scanned (13 digits)
                          if (value.length === 13) {
                            const product = mockProducts.find(p => p.barcode === value);
                            if (product) {
                              addItem(product);
                              toast.success(`Added: ${product.name}`);
                            } else {
                              toast.error("Product not found");
                              setBarcodeInput("");
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && barcodeInput) {
                            const product = mockProducts.find(p => p.barcode === barcodeInput);
                            if (product) {
                              addItem(product);
                              toast.success(`Added: ${product.name}`);
                            } else {
                              toast.error("Product not found");
                            }
                            setBarcodeInput("");
                          }
                        }}
                        className="pl-10 h-9 border-green-200 focus:border-green-400 font-mono"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Sample barcodes: {mockProducts.slice(0, 3).map(p => p.barcode).join(', ')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Search Product</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by product name"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-10 h-9"
                      />
                    </div>
                  </div>
                </div>

                {/* Search Results */}
                {filteredProducts.length > 0 && (
                  <div className="mt-3 border border-green-200 rounded-lg bg-white max-h-40 overflow-auto">
                    {filteredProducts.map(product => (
                      <button
                        key={product.id}
                        onClick={() => addItem(product)}
                        className="w-full flex items-center justify-between p-2 hover:bg-green-50 text-left border-b last:border-b-0"
                      >
                        <div>
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">Stock: {product.stock} | Barcode: {product.barcode}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-sm">₹{product.rate}</div>
                          <div className="text-xs text-gray-500">GST {product.taxRate}%</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice Items Table */}
            <Card className="shadow-md border-green-100">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Invoice Items</CardTitle>
                  <Badge variant="outline">{items.length} items</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-green-50">
                        <TableHead className="w-[40%]">Item</TableHead>
                        <TableHead className="w-[10%]">Qty</TableHead>
                        <TableHead className="w-[12%]">Rate</TableHead>
                        <TableHead className="w-[12%]">Disc%</TableHead>
                        <TableHead className="w-[10%]">Tax%</TableHead>
                        <TableHead className="w-[13%]">Amount</TableHead>
                        <TableHead className="w-[3%]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No items added. Search and add products to start billing.
                          </TableCell>
                        </TableRow>
                      ) : (
                        items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium text-sm">{item.name}</div>
                                <div className="text-xs text-gray-500">{item.barcode}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={(e) => updateItemQty(item.id, parseInt(e.target.value) || 0)}
                                className="w-16 h-8 text-center"
                              />
                            </TableCell>
                            <TableCell>₹{item.rate}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={item.discount}
                                onChange={(e) => updateItemDiscount(item.id, parseFloat(e.target.value) || 0)}
                                className="w-16 h-8 text-center"
                              />
                            </TableCell>
                            <TableCell>{item.taxRate}%</TableCell>
                            <TableCell className="font-medium">₹{item.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Payment */}
          <div className="space-y-4">
            {/* Payment Summary */}
            <Card className="shadow-lg border-green-200 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-700">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sub Total:</span>
                    <span className="font-medium">₹{totals.subTotal.toFixed(2)}</span>
                  </div>
                  
                  {gstEnabled && (
                    <>
                      <Separator />
                      <div className="bg-green-100 rounded-lg p-2 space-y-1">
                        {customerState === "same" ? (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">CGST:</span>
                              <span className="font-medium text-green-700">₹{totals.cgst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">SGST:</span>
                              <span className="font-medium text-green-700">₹{totals.sgst.toFixed(2)}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">IGST:</span>
                            <span className="font-medium text-green-700">₹{totals.igst.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm pt-1 border-t border-green-200">
                          <span className="text-gray-700">Total Tax:</span>
                          <span className="font-medium text-green-700">₹{totals.totalTax.toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <Separator className="my-3" />
                  
                  <div className="flex justify-between items-center bg-green-600 text-white p-3 rounded-lg">
                    <span className="font-medium">Grand Total:</span>
                    <span className="text-2xl font-bold">₹{totals.grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Credit Points Payment */}
                {(customer.loyaltyPoints || 0) > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-gray-700">Use Credit Points</span>
                        </div>
                        <Badge className="bg-yellow-600">{customer.loyaltyPoints} pts</Badge>
                      </div>
                      
                      {usePoints ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max={Math.min(customer.loyaltyPoints || 0, Math.floor(totals.grandTotal))}
                              value={pointsToRedeem}
                              onChange={(e) => setPointsToRedeem(Math.min(parseInt(e.target.value) || 0, Math.min(customer.loyaltyPoints || 0, Math.floor(totals.grandTotal))))}
                              placeholder="Points to use"
                              className="h-8 text-sm"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setUsePoints(false);
                                setPointsToRedeem(0);
                              }}
                              className="h-8"
                            >
                              Cancel
                            </Button>
                          </div>
                          <p className="text-xs text-gray-600">
                            1 point = ₹1 | Max: {Math.min(customer.loyaltyPoints || 0, Math.floor(totals.grandTotal))} pts
                          </p>
                          {pointsToRedeem > 0 && (
                            <div className="bg-green-50 p-2 rounded border border-green-200">
                              <p className="text-sm font-medium text-green-700">
                                Discount: -₹{pointsToRedeem.toFixed(2)}
                              </p>
                              <p className="text-sm font-medium text-gray-700">
                                Final Amount: ₹{(totals.grandTotal - pointsToRedeem).toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setUsePoints(true)}
                          className="w-full h-8 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                        >
                          <Gift className="h-3.5 w-3.5 mr-2" />
                          Apply Points
                        </Button>
                      )}
                    </div>
                  </>
                )}

                <Separator className="my-3" />

                {/* Payment Mode */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Payment Mode</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={paymentMode === "cash" ? "default" : "outline"}
                      className={paymentMode === "cash" ? "bg-green-600 hover:bg-green-700" : ""}
                      onClick={() => setPaymentMode("cash")}
                      size="sm"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Cash
                    </Button>
                    <Button
                      variant={paymentMode === "card" ? "default" : "outline"}
                      className={paymentMode === "card" ? "bg-green-600 hover:bg-green-700" : ""}
                      onClick={() => setPaymentMode("card")}
                      size="sm"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Card
                    </Button>
                    <Button
                      variant={paymentMode === "upi" ? "default" : "outline"}
                      className={paymentMode === "upi" ? "bg-green-600 hover:bg-green-700" : ""}
                      onClick={() => setPaymentMode("upi")}
                      size="sm"
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      UPI
                    </Button>
                    <Button
                      variant={paymentMode === "credit" ? "default" : "outline"}
                      className={paymentMode === "credit" ? "bg-green-600 hover:bg-green-700" : ""}
                      onClick={() => setPaymentMode("credit")}
                      size="sm"
                    >
                      Credit
                    </Button>
                  </div>
                </div>

                <Separator className="my-3" />

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    onClick={handleSaveInvoice}
                    className="w-full bg-green-600 hover:bg-green-700 h-11"
                    size="lg"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Save Invoice
                  </Button>
                  <Button 
                    onClick={handlePrintInvoice}
                    variant="outline"
                    className="w-full h-10"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Invoice
                  </Button>
                  <Button 
                    onClick={() => {
                      if (!customer.phone) {
                        toast.error("Please enter customer phone number");
                        return;
                      }
                      if (items.length === 0) {
                        toast.error("Please add items to the invoice");
                        return;
                      }
                      setShowWhatsAppDialog(true);
                    }}
                    variant="outline"
                    className="w-full h-10 text-green-600 border-green-600 hover:bg-green-50"
                    disabled={!customer.phone || items.length === 0}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send via WhatsApp
                  </Button>
                  <Button 
                    onClick={handleNewBill}
                    variant="ghost"
                    className="w-full h-10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Bill
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-md border-green-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Today's Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Invoices:</span>
                  <Badge variant="outline">42</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Sales:</span>
                  <span className="font-medium text-green-600">₹45,000</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Avg Bill:</span>
                  <span className="font-medium">₹1,071</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* WhatsApp Dialog */}
      <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-600" />
              Send Invoice via WhatsApp
            </DialogTitle>
            <DialogDescription>
              Send invoice {lastInvoiceNumber} to customer via WhatsApp
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{customer.name || 'Walk-in Customer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice:</span>
                  <span className="font-medium">{lastInvoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-green-600">₹{calculateTotals().grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              A detailed invoice summary will be sent to the customer's WhatsApp number.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowWhatsAppDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendWhatsApp}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}