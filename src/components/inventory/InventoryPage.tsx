
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { 
  MoreHorizontal,
  Package, 
  Plus, 
  AlertCircle,
  ShoppingCart,
  ArrowUpDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "sonner";
import PageTitle from "../common/PageTitle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AmountInput from "../common/AmountInput";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "../common/StatusBadge";

const InventoryPage = () => {
  const { products, updateProduct } = useData();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [newStockAmount, setNewStockAmount] = useState(0);
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'stock' | 'price'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Filter products by search term and category
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });
  
  // Group products by category for the tabular view
  const productsByCategory = PRODUCT_CATEGORIES.reduce((acc, category) => {
    acc[category.id] = filteredProducts.filter(
      (product) => product.category === category.id
    );
    return acc;
  }, {} as Record<string, typeof products>);
  
  // Initialize stock update dialog
  const openUpdateDialog = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(productId);
      setNewStockAmount(product.stock);
      setIsUpdateDialogOpen(true);
    }
  };
  
  // Handle stock update
  const handleUpdateStock = () => {
    if (!selectedProduct) return;
    
    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;
    
    try {
      updateProduct({
        ...product,
        stock: newStockAmount,
      });
      
      toast.success("Stock updated successfully");
      setIsUpdateDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update stock");
      console.error(error);
    }
  };

  // Toggle sort direction
  const toggleSort = (field: 'name' | 'category' | 'stock' | 'price') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  // Calculate total inventory value
  const calculateTotalValue = () => {
    return products.reduce((total, product) => {
      return total + product.price * product.stock;
    }, 0);
  };
  
  // Count low stock items
  const lowStockCount = products.filter(
    (product) => product.minStock && product.stock <= product.minStock
  ).length;
  
  // Count out of stock items
  const outOfStockCount = products.filter(
    (product) => product.stock === 0
  ).length;
  
  return (
    <div className="space-y-6">
      <PageTitle 
        title="Inventory Management" 
        subtitle="Track and manage products and supplies"
      />
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-card rounded-lg border shadow-sm flex items-center p-4 animate-slide-in [animation-delay:0ms]">
          <div className="bg-primary/10 rounded-full p-3 mr-4">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Products</p>
            <h3 className="text-2xl font-bold">{products.length}</h3>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border shadow-sm flex items-center p-4 animate-slide-in [animation-delay:100ms]">
          <div className="bg-yellow-100 rounded-full p-3 mr-4">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
            <h3 className="text-2xl font-bold">{lowStockCount}</h3>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border shadow-sm flex items-center p-4 animate-slide-in [animation-delay:200ms]">
          <div className="bg-blue-100 rounded-full p-3 mr-4">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
            <h3 className="text-2xl font-bold">{calculateTotalValue().toFixed(2)} TNd</h3>
          </div>
        </div>
      </div>
      
      <div className="bg-card rounded-lg border shadow-sm animate-slide-in [animation-delay:300ms]">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:w-80"
            />
            
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="md:w-52">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="pointer-events-auto">
                <SelectItem value="all">All Categories</SelectItem>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex-1"></div>
            
            <Button className="ml-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
          
          <Tabs defaultValue="grid">
            <TabsList className="mb-4">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="category">Category View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="grid" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg p-4 transition-all-fast hover:border-primary/30 hover:shadow-md"
                    >
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium truncate">{product.name}</h3>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {product.category}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 pointer-events-auto">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openUpdateDialog(product.id)}>
                              Update Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Product</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium">{product.price} TNd</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium">{product.cost} TNd</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Stock:</span>
                          <span className="font-medium">
                            {product.stock === 0 ? (
                              <StatusBadge status="error">Out of Stock</StatusBadge>
                            ) : product.minStock && product.stock <= product.minStock ? (
                              <StatusBadge status="warning">Low Stock ({product.stock})</StatusBadge>
                            ) : (
                              <StatusBadge status="success">{product.stock} units</StatusBadge>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-muted-foreground">
                    No products found matching your criteria
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="table" className="mt-0">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                        Name
                        {sortBy === 'name' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort('category')}>
                        Category
                        {sortBy === 'category' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead className="text-right cursor-pointer" onClick={() => toggleSort('price')}>
                        Price
                        {sortBy === 'price' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead className="text-right cursor-pointer" onClick={() => toggleSort('stock')}>
                        Stock
                        {sortBy === 'stock' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {product.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{product.price} TNd</TableCell>
                          <TableCell className="text-right">
                            {product.stock === 0 ? (
                              <StatusBadge status="error">Out of Stock</StatusBadge>
                            ) : product.minStock && product.stock <= product.minStock ? (
                              <StatusBadge status="warning">Low ({product.stock})</StatusBadge>
                            ) : (
                              product.stock
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="pointer-events-auto">
                                <DropdownMenuItem onClick={() => openUpdateDialog(product.id)}>
                                  Update Stock
                                </DropdownMenuItem>
                                <DropdownMenuItem>Edit Details</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No products found matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="category" className="mt-0">
              <div className="space-y-6">
                {PRODUCT_CATEGORIES.map((category) => {
                  const categoryProducts = productsByCategory[category.id] || [];
                  if (categoryProducts.length === 0) return null;
                  
                  return (
                    <div key={category.id} className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">{category.name}</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categoryProducts.map((product) => (
                          <div
                            key={product.id}
                            className="border rounded-lg p-4 transition-all-fast hover:border-primary/30 hover:shadow-md"
                          >
                            <div className="flex justify-between">
                              <h4 className="font-medium truncate">{product.name}</h4>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openUpdateDialog(product.id)}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="mt-3 space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Price:</span>
                                <span className="font-medium">{product.price} TNd</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Stock:</span>
                                <span className="font-medium">
                                  {product.stock === 0 ? (
                                    <StatusBadge status="error">Out of Stock</StatusBadge>
                                  ) : product.minStock && product.stock <= product.minStock ? (
                                    <StatusBadge status="warning">Low Stock</StatusBadge>
                                  ) : (
                                    <StatusBadge status="success">{product.stock}</StatusBadge>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="pointer-events-auto">
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              Update the current stock level for this product.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium">New Stock Amount</label>
            <AmountInput
              value={newStockAmount}
              onChange={setNewStockAmount}
              min={0}
              currency="Units"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStock}>
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
