import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/context/DataContext";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { 
  Package, 
  Plus, 
  AlertCircle,
  ShoppingCart,
  ArrowUpDown,
  Download,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import PageTitle from "../common/PageTitle";
import { Button } from "@/components/ui/button";
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
import AddProductForm from "./AddProductForm";
import EditProductForm from "./EditProductForm";
import StockAdjustmentForm from "./StockAdjustmentForm";
import InventoryFilters from "./InventoryFilters";
import ProductDetails from "./ProductDetails";
import DeleteProductConfirmation from "./DeleteProductConfirmation";
import BulkImportForm from "./BulkImportForm";
import { Product } from "@/lib/types";

const InventoryPage = () => {
  const { products, refreshProducts } = useData();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  const [isStockAdjustDialogOpen, setIsStockAdjustDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'stock' | 'price'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    refreshProductsData();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshProductsData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshProducts]);
  
  const refreshProductsData = async () => {
    setIsRefreshing(true);
    try {
      await refreshProducts();
      toast.success("Inventory data refreshed");
    } catch (error) {
      console.error("Error refreshing inventory data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());
      
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      
      let matchesStock = true;
      if (stockFilter === "low") {
        matchesStock = !!product.minStock && product.stock <= product.minStock && product.stock > 0;
      } else if (stockFilter === "out") {
        matchesStock = product.stock === 0;
      } else if (stockFilter === "in") {
        matchesStock = product.stock > 0 && (!product.minStock || product.stock > product.minStock);
      }
      
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });
  
  const productsByCategory = PRODUCT_CATEGORIES.reduce((acc, category) => {
    acc[category.id] = filteredProducts.filter(
      (product) => product.category === category.id
    );
    return acc;
  }, {} as Record<string, typeof products>);
  
  const openProductDetails = (productId: string) => {
    setSelectedProductForDetails(productId);
  };
  
  const handleEditProduct = (productId: string) => {
    setSelectedProduct(productId);
    setIsEditProductDialogOpen(true);
  };
  
  const handleStockAdjust = (productId: string) => {
    setSelectedProduct(productId);
    setIsStockAdjustDialogOpen(true);
  };
  
  const handleDeleteProduct = (productId: string) => {
    setSelectedProduct(productId);
    setIsDeleteDialogOpen(true);
  };

  const toggleSort = (field: 'name' | 'category' | 'stock' | 'price') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  const calculateTotalValue = () => {
    return products.reduce((total, product) => {
      return total + product.price * product.stock;
    }, 0);
  };
  
  const lowStockCount = products.filter(
    (product) => product.minStock && product.stock <= product.minStock && product.stock > 0
  ).length;
  
  const outOfStockCount = products.filter(
    (product) => product.stock === 0
  ).length;

  const handleExportCSV = () => {
    const headers = ['name', 'category', 'price', 'cost', 'stock', 'min_stock'];
    
    const rows = products.map(product => [
      product.name,
      product.category,
      product.price.toString(),
      product.cost.toString(),
      product.stock.toString(),
      (product.minStock || '').toString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('Inventory exported to CSV');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle 
          title="Inventory Management" 
          subtitle="Track and manage products and supplies"
        />
        <Button 
          variant="outline" 
          size="sm"
          onClick={refreshProductsData}
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
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
            <p className="text-sm font-medium text-muted-foreground">
              {lowStockCount > 0 ? "Low Stock Items" : "Out of Stock"}
            </p>
            <h3 className="text-2xl font-bold">
              {lowStockCount > 0 ? lowStockCount : outOfStockCount}
            </h3>
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
          <InventoryFilters 
            search={search}
            onSearchChange={setSearch}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            stockFilter={stockFilter}
            onStockFilterChange={setStockFilter}
            onAddProduct={() => setIsAddProductDialogOpen(true)}
            onExportCSV={handleExportCSV}
            onImportCSV={() => setIsImportDialogOpen(true)}
          />
          
          <Tabs defaultValue="grid">
            <TabsList className="mb-4">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="category">Category View</TabsTrigger>
              {selectedProductForDetails && (
                <TabsTrigger value="details">Product Details</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="grid" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg p-4 transition-colors hover:border-primary/30 hover:shadow-md cursor-pointer"
                      onClick={() => openProductDetails(product.id)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium truncate">{product.name}</h3>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {product.category}
                          </Badge>
                        </div>
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
                        <TableRow 
                          key={product.id}
                          className="cursor-pointer"
                          onClick={() => openProductDetails(product.id)}
                        >
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
                            <div className="flex justify-end space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProduct(product.id);
                                }}
                              >
                                <ArrowUpDown className="h-4 w-4" />
                              </Button>
                            </div>
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
                            className="border rounded-lg p-4 transition-colors hover:border-primary/30 hover:shadow-md cursor-pointer"
                            onClick={() => openProductDetails(product.id)}
                          >
                            <div className="flex justify-between">
                              <h4 className="font-medium truncate">{product.name}</h4>
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
            
            {selectedProductForDetails && (
              <TabsContent value="details" className="mt-0">
                {selectedProductForDetails && products.find(p => p.id === selectedProductForDetails) && (
                  <div className="max-w-3xl mx-auto">
                    <ProductDetails 
                      product={products.find(p => p.id === selectedProductForDetails) as Product}
                      onEdit={() => handleEditProduct(selectedProductForDetails)}
                      onStockAdjust={() => handleStockAdjust(selectedProductForDetails)}
                      onDelete={() => handleDeleteProduct(selectedProductForDetails)}
                    />
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
      
      <AddProductForm 
        isOpen={isAddProductDialogOpen} 
        onClose={() => setIsAddProductDialogOpen(false)} 
      />
      
      <EditProductForm 
        isOpen={isEditProductDialogOpen}
        onClose={() => setIsEditProductDialogOpen(false)}
        productId={selectedProduct}
      />
      
      <StockAdjustmentForm
        isOpen={isStockAdjustDialogOpen}
        onClose={() => setIsStockAdjustDialogOpen(false)}
        productId={selectedProduct}
      />
      
      <DeleteProductConfirmation
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        productId={selectedProduct}
        onDeleted={() => {
          refreshProducts();
          if (selectedProductForDetails === selectedProduct) {
            setSelectedProductForDetails(null);
          }
        }}
      />
      
      <BulkImportForm
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImported={refreshProducts}
      />
    </div>
  );
};

export default InventoryPage;
