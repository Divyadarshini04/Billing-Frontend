import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Search, Plus, Edit, Trash2, AlertTriangle, Upload, Download, Package, Barcode } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { businessProducts, getBusinessCategories, getBusinessSuppliers, type Product } from "../data/business-products";
import type { StoreInfo } from "./phone-auth-page";

interface InventoryPageProps {
  storeInfo?: StoreInfo | null;
}

export function InventoryPage({ storeInfo }: InventoryPageProps) {
  // Get products based on business type
  const businessType = storeInfo?.type || "Retail Store";
  const initialProducts = businessProducts[businessType] || businessProducts["Retail Store"];

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    stock: 0,
    minStock: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    taxRate: 18,
    supplier: ""
  });

  const categories = getBusinessCategories(businessType);
  const suppliers = getBusinessSuppliers(businessType);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Stock':
        return <Badge className="bg-green-600">In Stock</Badge>;
      case 'Low Stock':
        return <Badge className="bg-yellow-600">Low Stock</Badge>;
      case 'Out of Stock':
        return <Badge className="bg-red-600">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm);
    const matchesCategory = filterCategory === "all" || product.category === filterCategory;
    const matchesStatus = filterStatus === "all" || product.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });



  const handleAddProduct = () => {
    const product: Product = {
      id: (products.length + 1).toString(),
      ...newProduct,
      status: newProduct.stock === 0 ? 'Out of Stock' : newProduct.stock <= newProduct.minStock ? 'Low Stock' : 'In Stock'
    };

    setProducts([...products, product]);
    setIsAddDialogOpen(false);
    setNewProduct({
      name: "",
      sku: "",
      barcode: "",
      category: "",
      stock: 0,
      minStock: 0,
      purchasePrice: 0,
      sellingPrice: 0,
      taxRate: 18,
      supplier: ""
    });
    toast.success("Product added successfully!");
  };

  const handleEditProduct = () => {
    if (!editingProduct) return;

    setProducts(products.map(p => p.id === editingProduct.id ? {
      ...editingProduct,
      status: editingProduct.stock === 0 ? 'Out of Stock' : editingProduct.stock <= editingProduct.minStock ? 'Low Stock' : 'In Stock'
    } : p));
    setEditingProduct(null);
    toast.success("Product updated successfully!");
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast.success("Product deleted successfully!");
  };

  return (
    <div className="p-6 space-y-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Inventory Management</h1>
          <p className="text-gray-500">{storeInfo?.name || businessType} - Track stock levels and product information</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Add a new product to your inventory with complete details including pricing, stock, and supplier information.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SKU</Label>
                    <Input
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      placeholder="Product SKU"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Barcode</Label>
                    <Input
                      value={newProduct.barcode}
                      onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                      placeholder="Barcode number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c !== "All").map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Stock</Label>
                    <Input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Min Stock Level</Label>
                    <Input
                      type="number"
                      value={newProduct.minStock}
                      onChange={(e) => setNewProduct({ ...newProduct, minStock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Purchase Price</Label>
                    <Input
                      type="number"
                      value={newProduct.purchasePrice}
                      onChange={(e) => setNewProduct({ ...newProduct, purchasePrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Selling Price</Label>
                    <Input
                      type="number"
                      value={newProduct.sellingPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      value={newProduct.taxRate}
                      onChange={(e) => setNewProduct({ ...newProduct, taxRate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Supplier</Label>
                    <Select value={newProduct.supplier} onValueChange={(value) => setNewProduct({ ...newProduct, supplier: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAddProduct} className="w-full bg-green-600 hover:bg-green-700">
                  Add Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={`shadow-md cursor-pointer transition-all ${filterStatus === 'In Stock' ? 'ring-2 ring-blue-500 bg-blue-50' : 'border-blue-100 hover:shadow-lg'}`}
          onClick={() => setFilterStatus(filterStatus === 'In Stock' ? 'all' : 'In Stock')}
        >
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{products.filter(p => p.status === 'In Stock').length}</div>
            <p className="text-xs text-gray-500 mt-1">Products available</p>
          </CardContent>
        </Card>

        <Card
          className={`shadow-md cursor-pointer transition-all ${filterStatus === 'Low Stock' ? 'ring-2 ring-yellow-500 bg-yellow-50' : 'border-yellow-100 hover:shadow-lg'}`}
          onClick={() => setFilterStatus(filterStatus === 'Low Stock' ? 'all' : 'Low Stock')}
        >
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{products.filter(p => p.status === 'Low Stock').length}</div>
            <p className="text-xs text-gray-500 mt-1">Items need restocking</p>
          </CardContent>
        </Card>

        <Card
          className={`shadow-md cursor-pointer transition-all ${filterStatus === 'Out of Stock' ? 'ring-2 ring-red-500 bg-red-50' : 'border-red-100 hover:shadow-lg'}`}
          onClick={() => setFilterStatus(filterStatus === 'Out of Stock' ? 'all' : 'Out of Stock')}
        >
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{products.filter(p => p.status === 'Out of Stock').length}</div>
            <p className="text-xs text-gray-500 mt-1">Unavailable products</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-md border-green-100">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.filter(c => c !== "All").map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="shadow-md border-green-100">
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-green-50">
                  <TableHead>Product</TableHead>
                  <TableHead>SKU/Barcode</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Purchase Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Tax%</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.supplier}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>SKU: {product.sku}</div>
                        <div className="text-gray-500">{product.barcode}</div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.stock}</span>
                        {product.stock <= product.minStock && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>₹{product.purchasePrice}</TableCell>
                    <TableCell>₹{product.sellingPrice}</TableCell>
                    <TableCell>{product.taxRate}%</TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingProduct({ ...product })}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Product</DialogTitle>
                              <DialogDescription>
                                Update stock quantity and selling price for this product.
                              </DialogDescription>
                            </DialogHeader>
                            {editingProduct && (
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Stock Quantity</Label>
                                    <Input
                                      type="number"
                                      value={editingProduct.stock}
                                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Selling Price</Label>
                                    <Input
                                      type="number"
                                      value={editingProduct.sellingPrice}
                                      onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: parseFloat(e.target.value) || 0 })}
                                    />
                                  </div>
                                </div>
                                <Button onClick={handleEditProduct} className="w-full bg-green-600 hover:bg-green-700">
                                  Save Changes
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
