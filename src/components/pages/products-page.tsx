import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Search, Plus, Edit, Trash2, Package, AlertTriangle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  supplier: string;
  lowStockAlert: number;
}

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Laptop Stand',
    sku: 'PLS-001',
    price: 2499,
    stock: 45,
    category: 'Electronics',
    supplier: 'Tech Supplies Inc.',
    lowStockAlert: 10
  },
  {
    id: '2',
    name: 'Wireless Mouse',
    sku: 'WM-002',
    price: 899,
    stock: 8,
    category: 'Electronics',
    supplier: 'Alpha Electronics',
    lowStockAlert: 10
  },
  {
    id: '3',
    name: 'Office Chair',
    sku: 'OC-003',
    price: 8500,
    stock: 12,
    category: 'Furniture',
    supplier: 'Furniture World',
    lowStockAlert: 5
  },
  {
    id: '4',
    name: 'LED Monitor 24"',
    sku: 'LM-004',
    price: 15000,
    stock: 3,
    category: 'Electronics',
    supplier: 'Display Solutions',
    lowStockAlert: 5
  },
];

const categories = ['All', 'Electronics', 'Furniture', 'Office Supplies', 'Accessories'];

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    sku: '',
    price: 0,
    stock: 0,
    category: '',
    supplier: '',
    lowStockAlert: 10
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.sku && newProduct.price) {
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name,
        sku: newProduct.sku,
        price: newProduct.price || 0,
        stock: newProduct.stock || 0,
        category: newProduct.category || 'Uncategorized',
        supplier: newProduct.supplier || '',
        lowStockAlert: newProduct.lowStockAlert || 10
      };
      setProducts([...products, product]);
      setNewProduct({ name: '', sku: '', price: 0, stock: 0, category: '', supplier: '', lowStockAlert: 10 });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditProduct = () => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const getStockStatus = (stock: number, lowStockAlert: number) => {
    if (stock === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock <= lowStockAlert) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Products Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your inventory with details like name, SKU, price, and stock.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU/Code</Label>
                <Input
                  id="sku"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                  placeholder="Enter SKU"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  placeholder="Enter category"
                />
              </div>
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={newProduct.supplier}
                  onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                  placeholder="Enter supplier name"
                />
              </div>
              <div>
                <Label htmlFor="lowStockAlert">Low Stock Alert</Label>
                <Input
                  id="lowStockAlert"
                  type="number"
                  value={newProduct.lowStockAlert}
                  onChange={(e) => setNewProduct({...newProduct, lowStockAlert: parseInt(e.target.value) || 10})}
                  placeholder="10"
                />
              </div>
              <Button onClick={handleAddProduct} className="w-full bg-green-600 hover:bg-green-700">
                Add Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU/Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.lowStockAlert);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.supplier}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="font-medium">₹{product.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{product.stock}</span>
                          {product.stock <= product.lowStockAlert && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={stockStatus.color}>
                          {stockStatus.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingProduct({...product})}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit Product</DialogTitle>
                                <DialogDescription>
                                  Update product information and inventory details.
                                </DialogDescription>
                              </DialogHeader>
                              {editingProduct && (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="edit-name">Product Name</Label>
                                    <Input
                                      id="edit-name"
                                      value={editingProduct.name}
                                      onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-sku">SKU/Code</Label>
                                    <Input
                                      id="edit-sku"
                                      value={editingProduct.sku}
                                      onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="edit-price">Price (₹)</Label>
                                      <Input
                                        id="edit-price"
                                        type="number"
                                        value={editingProduct.price}
                                        onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-stock">Stock</Label>
                                      <Input
                                        id="edit-stock"
                                        type="number"
                                        value={editingProduct.stock}
                                        onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
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
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
    </div>
  );
}