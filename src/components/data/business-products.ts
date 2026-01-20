-// Business-specific product data

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  stock: number;
  minStock: number;
  purchasePrice: number;
  sellingPrice: number;
  taxRate: number;
  supplier: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  unit?: string;
}

export const businessProducts: Record<string, Product[]> = {
  Salon: [
    { id: "1", name: "Hair Cut (Men)", sku: "SRV-HC-M", barcode: "8901001000001", category: "Services", stock: 999, minStock: 0, purchasePrice: 0, sellingPrice: 300, taxRate: 18, supplier: "Service", status: "In Stock", unit: "service" },
    { id: "2", name: "Hair Cut (Women)", sku: "SRV-HC-W", barcode: "8901001000002", category: "Services", stock: 999, minStock: 0, purchasePrice: 0, sellingPrice: 500, taxRate: 18, supplier: "Service", status: "In Stock", unit: "service" },
    { id: "3", name: "Hair Color", sku: "SRV-CLR", barcode: "8901001000003", category: "Services", stock: 999, minStock: 0, purchasePrice: 800, sellingPrice: 1500, taxRate: 18, supplier: "Service", status: "In Stock", unit: "service" },
    { id: "4", name: "Hair Spa", sku: "SRV-SPA", barcode: "8901001000004", category: "Services", stock: 999, minStock: 0, purchasePrice: 400, sellingPrice: 800, taxRate: 18, supplier: "Service", status: "In Stock", unit: "service" },
    { id: "5", name: "Facial", sku: "SRV-FCL", barcode: "8901001000005", category: "Services", stock: 999, minStock: 0, purchasePrice: 500, sellingPrice: 1000, taxRate: 18, supplier: "Service", status: "In Stock", unit: "service" },
    { id: "6", name: "Manicure", sku: "SRV-MAN", barcode: "8901001000006", category: "Services", stock: 999, minStock: 0, purchasePrice: 150, sellingPrice: 300, taxRate: 18, supplier: "Service", status: "In Stock", unit: "service" },
    { id: "7", name: "Pedicure", sku: "SRV-PED", barcode: "8901001000007", category: "Services", stock: 999, minStock: 0, purchasePrice: 200, sellingPrice: 400, taxRate: 18, supplier: "Service", status: "In Stock", unit: "service" },
    { id: "8", name: "Shampoo Bottle (L'Oreal)", sku: "PRD-SHP-01", barcode: "8901001000008", category: "Products", stock: 25, minStock: 5, purchasePrice: 250, sellingPrice: 450, taxRate: 18, supplier: "Beauty Supplies Inc", status: "In Stock", unit: "bottle" },
    { id: "9", name: "Conditioner (Dove)", sku: "PRD-CND-01", barcode: "8901001000009", category: "Products", stock: 18, minStock: 5, purchasePrice: 220, sellingPrice: 400, taxRate: 18, supplier: "Beauty Supplies Inc", status: "In Stock", unit: "bottle" },
    { id: "10", name: "Hair Serum (Matrix)", sku: "PRD-SRM-01", barcode: "8901001000010", category: "Products", stock: 12, minStock: 5, purchasePrice: 400, sellingPrice: 750, taxRate: 18, supplier: "Beauty Supplies Inc", status: "In Stock", unit: "bottle" },
    { id: "11", name: "Face Cream (Olay)", sku: "PRD-FCR-01", barcode: "8901001000011", category: "Products", stock: 8, minStock: 10, purchasePrice: 350, sellingPrice: 650, taxRate: 18, supplier: "Beauty Supplies Inc", status: "Low Stock", unit: "bottle" },
  ],
  
  "Tea Shop": [
    { id: "1", name: "Masala Chai", sku: "TEA-MSL", barcode: "8902001000001", category: "Beverages", stock: 999, minStock: 0, purchasePrice: 8, sellingPrice: 20, taxRate: 5, supplier: "Service", status: "In Stock", unit: "cup" },
    { id: "2", name: "Ginger Tea", sku: "TEA-GNG", barcode: "8902001000002", category: "Beverages", stock: 999, minStock: 0, purchasePrice: 8, sellingPrice: 20, taxRate: 5, supplier: "Service", status: "In Stock", unit: "cup" },
    { id: "3", name: "Black Coffee", sku: "COF-BLK", barcode: "8902001000003", category: "Beverages", stock: 999, minStock: 0, purchasePrice: 10, sellingPrice: 30, taxRate: 5, supplier: "Service", status: "In Stock", unit: "cup" },
    { id: "4", name: "Cappuccino", sku: "COF-CAP", barcode: "8902001000004", category: "Beverages", stock: 999, minStock: 0, purchasePrice: 20, sellingPrice: 50, taxRate: 5, supplier: "Service", status: "In Stock", unit: "cup" },
    { id: "5", name: "Cold Coffee", sku: "COF-CLD", barcode: "8902001000005", category: "Beverages", stock: 999, minStock: 0, purchasePrice: 25, sellingPrice: 60, taxRate: 5, supplier: "Service", status: "In Stock", unit: "cup" },
    { id: "6", name: "Green Tea", sku: "TEA-GRN", barcode: "8902001000006", category: "Beverages", stock: 999, minStock: 0, purchasePrice: 10, sellingPrice: 25, taxRate: 5, supplier: "Service", status: "In Stock", unit: "cup" },
    { id: "7", name: "Lemon Tea", sku: "TEA-LMN", barcode: "8902001000007", category: "Beverages", stock: 999, minStock: 0, purchasePrice: 10, sellingPrice: 25, taxRate: 5, supplier: "Service", status: "In Stock", unit: "cup" },
    { id: "8", name: "Samosa", sku: "SNK-SAM", barcode: "8902001000008", category: "Snacks", stock: 45, minStock: 20, purchasePrice: 8, sellingPrice: 20, taxRate: 5, supplier: "Local Vendor", status: "In Stock", unit: "piece" },
    { id: "9", name: "Vada Pav", sku: "SNK-VDP", barcode: "8902001000009", category: "Snacks", stock: 32, minStock: 20, purchasePrice: 10, sellingPrice: 25, taxRate: 5, supplier: "Local Vendor", status: "In Stock", unit: "piece" },
    { id: "10", name: "Bun Maska", sku: "SNK-BUN", barcode: "8902001000010", category: "Snacks", stock: 28, minStock: 15, purchasePrice: 12, sellingPrice: 30, taxRate: 5, supplier: "Local Bakery", status: "In Stock", unit: "piece" },
    { id: "11", name: "Cookies Pack", sku: "SNK-CKE", barcode: "8902001000011", category: "Snacks", stock: 8, minStock: 10, purchasePrice: 15, sellingPrice: 30, taxRate: 12, supplier: "Britannia", status: "Low Stock", unit: "pack" },
  ],
  
  Restaurant: [
    { id: "1", name: "Paneer Butter Masala", sku: "CUR-PBM", barcode: "8903001000001", category: "Main Course", stock: 999, minStock: 0, purchasePrice: 120, sellingPrice: 280, taxRate: 5, supplier: "Service", status: "In Stock", unit: "plate" },
    { id: "2", name: "Chicken Tikka Masala", sku: "CUR-CTM", barcode: "8903001000002", category: "Main Course", stock: 999, minStock: 0, purchasePrice: 140, sellingPrice: 320, taxRate: 5, supplier: "Service", status: "In Stock", unit: "plate" },
    { id: "3", name: "Dal Tadka", sku: "CUR-DLT", barcode: "8903001000003", category: "Main Course", stock: 999, minStock: 0, purchasePrice: 60, sellingPrice: 150, taxRate: 5, supplier: "Service", status: "In Stock", unit: "plate" },
    { id: "4", name: "Biryani (Veg)", sku: "RIC-BRV", barcode: "8903001000004", category: "Rice", stock: 999, minStock: 0, purchasePrice: 100, sellingPrice: 220, taxRate: 5, supplier: "Service", status: "In Stock", unit: "plate" },
    { id: "5", name: "Biryani (Chicken)", sku: "RIC-BRC", barcode: "8903001000005", category: "Rice", stock: 999, minStock: 0, purchasePrice: 130, sellingPrice: 280, taxRate: 5, supplier: "Service", status: "In Stock", unit: "plate" },
    { id: "6", name: "Naan", sku: "BRD-NAN", barcode: "8903001000006", category: "Breads", stock: 999, minStock: 0, purchasePrice: 10, sellingPrice: 30, taxRate: 5, supplier: "Service", status: "In Stock", unit: "piece" },
    { id: "7", name: "Butter Naan", sku: "BRD-BTN", barcode: "8903001000007", category: "Breads", stock: 999, minStock: 0, purchasePrice: 12, sellingPrice: 40, taxRate: 5, supplier: "Service", status: "In Stock", unit: "piece" },
    { id: "8", name: "Roti", sku: "BRD-ROT", barcode: "8903001000008", category: "Breads", stock: 999, minStock: 0, purchasePrice: 8, sellingPrice: 20, taxRate: 5, supplier: "Service", status: "In Stock", unit: "piece" },
    { id: "9", name: "Raita", sku: "SID-RTA", barcode: "8903001000009", category: "Sides", stock: 999, minStock: 0, purchasePrice: 15, sellingPrice: 40, taxRate: 5, supplier: "Service", status: "In Stock", unit: "bowl" },
    { id: "10", name: "Salad", sku: "SID-SLD", barcode: "8903001000010", category: "Sides", stock: 999, minStock: 0, purchasePrice: 20, sellingPrice: 60, taxRate: 5, supplier: "Service", status: "In Stock", unit: "bowl" },
    { id: "11", name: "Mineral Water 1L", sku: "BEV-WTR", barcode: "8903001000011", category: "Beverages", stock: 48, minStock: 20, purchasePrice: 15, sellingPrice: 30, taxRate: 12, supplier: "Bisleri", status: "In Stock", unit: "bottle" },
    { id: "12", name: "Soft Drink", sku: "BEV-SFT", barcode: "8903001000012", category: "Beverages", stock: 6, minStock: 12, purchasePrice: 20, sellingPrice: 40, taxRate: 12, supplier: "Coca Cola", status: "Low Stock", unit: "bottle" },
  ],
  
  Bakery: [
    { id: "1", name: "Black Forest Cake 1Kg", sku: "CKE-BLK-1", barcode: "8904001000001", category: "Cakes", stock: 8, minStock: 3, purchasePrice: 350, sellingPrice: 650, taxRate: 5, supplier: "In-house", status: "In Stock", unit: "cake" },
    { id: "2", name: "Chocolate Truffle Cake 1Kg", sku: "CKE-CHC-1", barcode: "8904001000002", category: "Cakes", stock: 5, minStock: 3, purchasePrice: 400, sellingPrice: 750, taxRate: 5, supplier: "In-house", status: "In Stock", unit: "cake" },
    { id: "3", name: "Pineapple Cake 1Kg", sku: "CKE-PIN-1", barcode: "8904001000003", category: "Cakes", stock: 6, minStock: 3, purchasePrice: 320, sellingPrice: 600, taxRate: 5, supplier: "In-house", status: "In Stock", unit: "cake" },
    { id: "4", name: "Chocolate Pastry", sku: "PST-CHC", barcode: "8904001000004", category: "Pastries", stock: 35, minStock: 20, purchasePrice: 30, sellingPrice: 70, taxRate: 5, supplier: "In-house", status: "In Stock", unit: "piece" },
    { id: "5", name: "Butterscotch Pastry", sku: "PST-BUT", barcode: "8904001000005", category: "Pastries", stock: 28, minStock: 20, purchasePrice: 30, sellingPrice: 70, taxRate: 5, supplier: "In-house", status: "In Stock", unit: "piece" },
    { id: "6", name: "Brownie", sku: "DST-BRW", barcode: "8904001000006", category: "Desserts", stock: 42, minStock: 25, purchasePrice: 25, sellingPrice: 60, taxRate: 5, supplier: "In-house", status: "In Stock", unit: "piece" },
    { id: "7", name: "Chocolate Donut", sku: "DST-DON", barcode: "8904001000007", category: "Desserts", stock: 32, minStock: 20, purchasePrice: 20, sellingPrice: 50, taxRate: 5, supplier: "In-house", status: "In Stock", unit: "piece" },
    { id: "8", name: "Croissant", sku: "BRD-CRS", barcode: "8904001000008", category: "Breads", stock: 24, minStock: 15, purchasePrice: 25, sellingPrice: 60, taxRate: 5, supplier: "In-house", status: "In Stock", unit: "piece" },
    { id: "9", name: "Garlic Bread", sku: "BRD-GRL", barcode: "8904001000009", category: "Breads", stock: 18, minStock: 10, purchasePrice: 40, sellingPrice: 90, taxRate: 5, supplier: "In-house", status: "In Stock", unit: "piece" },
    { id: "10", name: "Sandwich (Veg)", sku: "SNK-SDV", barcode: "8904001000010", category: "Snacks", stock: 25, minStock: 15, purchasePrice: 35, sellingPrice: 80, taxRate: 5, supplier: "In-house", status: "In Stock", unit: "piece" },
    { id: "11", name: "Chocolate Chip Cookies", sku: "CKE-CHP", barcode: "8904001000011", category: "Cookies", stock: 7, minStock: 10, purchasePrice: 60, sellingPrice: 120, taxRate: 12, supplier: "In-house", status: "Low Stock", unit: "pack" },
  ],
  
  "Clothing Store": [
    { id: "1", name: "Men's T-Shirt (Cotton)", sku: "CLT-TSM-C", barcode: "8905001000001", category: "Men's Wear", stock: 45, minStock: 20, purchasePrice: 200, sellingPrice: 450, taxRate: 12, supplier: "Fashion Hub Ltd", status: "In Stock", unit: "piece" },
    { id: "2", name: "Men's Jeans", sku: "CLT-JNM", barcode: "8905001000002", category: "Men's Wear", stock: 32, minStock: 15, purchasePrice: 600, sellingPrice: 1200, taxRate: 12, supplier: "Denim Co", status: "In Stock", unit: "piece" },
    { id: "3", name: "Men's Formal Shirt", sku: "CLT-SHM-F", barcode: "8905001000003", category: "Men's Wear", stock: 28, minStock: 15, purchasePrice: 400, sellingPrice: 850, taxRate: 12, supplier: "Fashion Hub Ltd", status: "In Stock", unit: "piece" },
    { id: "4", name: "Women's Kurti", sku: "CLT-KRT", barcode: "8905001000004", category: "Women's Wear", stock: 38, minStock: 20, purchasePrice: 350, sellingPrice: 750, taxRate: 12, supplier: "Ethnic Trends", status: "In Stock", unit: "piece" },
    { id: "5", name: "Women's Saree", sku: "CLT-SAR", barcode: "8905001000005", category: "Women's Wear", stock: 15, minStock: 10, purchasePrice: 800, sellingPrice: 1800, taxRate: 12, supplier: "Silk House", status: "In Stock", unit: "piece" },
    { id: "6", name: "Women's Jeans", sku: "CLT-JNW", barcode: "8905001000006", category: "Women's Wear", stock: 25, minStock: 15, purchasePrice: 700, sellingPrice: 1400, taxRate: 12, supplier: "Denim Co", status: "In Stock", unit: "piece" },
    { id: "7", name: "Kids T-Shirt", sku: "CLT-TSK", barcode: "8905001000007", category: "Kids Wear", stock: 42, minStock: 25, purchasePrice: 150, sellingPrice: 350, taxRate: 12, supplier: "Little Stars", status: "In Stock", unit: "piece" },
    { id: "8", name: "Kids Jeans", sku: "CLT-JNK", barcode: "8905001000008", category: "Kids Wear", stock: 30, minStock: 15, purchasePrice: 400, sellingPrice: 800, taxRate: 12, supplier: "Little Stars", status: "In Stock", unit: "piece" },
    { id: "9", name: "Sports Shoes", sku: "SHO-SPT", barcode: "8905001000009", category: "Footwear", stock: 18, minStock: 10, purchasePrice: 800, sellingPrice: 1600, taxRate: 12, supplier: "Shoe Palace", status: "In Stock", unit: "pair" },
    { id: "10", name: "Formal Shoes", sku: "SHO-FRM", barcode: "8905001000010", category: "Footwear", stock: 8, minStock: 10, purchasePrice: 900, sellingPrice: 1800, taxRate: 12, supplier: "Shoe Palace", status: "Low Stock", unit: "pair" },
  ],
  
  "Retail Store": [
    { id: "1", name: "Rice 5Kg", sku: "GRC-RIC-5", barcode: "8906001000001", category: "Groceries", stock: 120, minStock: 50, purchasePrice: 200, sellingPrice: 300, taxRate: 5, supplier: "India Gate", status: "In Stock", unit: "bag" },
    { id: "2", name: "Wheat Flour 10Kg", sku: "GRC-WHT-10", barcode: "8906001000002", category: "Groceries", stock: 85, minStock: 40, purchasePrice: 350, sellingPrice: 500, taxRate: 5, supplier: "Aashirvaad", status: "In Stock", unit: "bag" },
    { id: "3", name: "Sugar 1Kg", sku: "GRC-SUG-1", barcode: "8906001000003", category: "Groceries", stock: 95, minStock: 50, purchasePrice: 40, sellingPrice: 55, taxRate: 5, supplier: "Local Supplier", status: "In Stock", unit: "pack" },
    { id: "4", name: "Cooking Oil 1L", sku: "GRC-OIL-1", barcode: "8906001000004", category: "Groceries", stock: 65, minStock: 30, purchasePrice: 110, sellingPrice: 160, taxRate: 5, supplier: "Fortune", status: "In Stock", unit: "bottle" },
    { id: "5", name: "Tea Powder 250g", sku: "BEV-TEA", barcode: "8906001000005", category: "Beverages", stock: 48, minStock: 25, purchasePrice: 80, sellingPrice: 120, taxRate: 12, supplier: "Tata Tea", status: "In Stock", unit: "pack" },
    { id: "6", name: "Coffee Powder 200g", sku: "BEV-COF", barcode: "8906001000006", category: "Beverages", stock: 32, minStock: 20, purchasePrice: 150, sellingPrice: 220, taxRate: 12, supplier: "Nescafe", status: "In Stock", unit: "pack" },
    { id: "7", name: "Biscuits Pack", sku: "SNK-BSC", barcode: "8906001000007", category: "Snacks", stock: 75, minStock: 40, purchasePrice: 20, sellingPrice: 35, taxRate: 12, supplier: "Parle", status: "In Stock", unit: "pack" },
    { id: "8", name: "Chips Pack", sku: "SNK-CHP", barcode: "8906001000008", category: "Snacks", stock: 52, minStock: 30, purchasePrice: 15, sellingPrice: 25, taxRate: 12, supplier: "Lays", status: "In Stock", unit: "pack" },
    { id: "9", name: "Soap Bar", sku: "PER-SOP", barcode: "8906001000009", category: "Personal Care", stock: 88, minStock: 40, purchasePrice: 25, sellingPrice: 45, taxRate: 18, supplier: "Dove", status: "In Stock", unit: "piece" },
    { id: "10", name: "Shampoo Sachet", sku: "PER-SHP", barcode: "8906001000010", category: "Personal Care", stock: 120, minStock: 60, purchasePrice: 1, sellingPrice: 2, taxRate: 18, supplier: "Pantene", status: "In Stock", unit: "sachet" },
    { id: "11", name: "Toothpaste", sku: "PER-TTP", barcode: "8906001000011", category: "Personal Care", stock: 9, minStock: 15, purchasePrice: 45, sellingPrice: 75, taxRate: 18, supplier: "Colgate", status: "Low Stock", unit: "tube" },
  ],
};

// Get categories by business type
export const getBusinessCategories = (businessType: string): string[] => {
  const products = businessProducts[businessType] || [];
  const categories = [...new Set(products.map(p => p.category))];
  return ['All', ...categories];
};

// Get suppliers by business type
export const getBusinessSuppliers = (businessType: string): string[] => {
  const products = businessProducts[businessType] || [];
  const suppliers = [...new Set(products.map(p => p.supplier))];
  return suppliers;
};
