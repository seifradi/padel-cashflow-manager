
import { useEffect, useState } from "react";
import { useProducts } from "@/context/data/ProductContext";
import { Product, ProductCategory } from "@/lib/types";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import PageTitle from "../common/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Package, 
  Plus, 
  RefreshCw, 
  Search, 
  AlertCircle,
  ShoppingCart,
  Download,
  Upload
} from "lucide-react";
import ProductList from "./ProductList";
import ProductTable from "./ProductTable";
import ProductCard from "./ProductCard";
import AddProductDialog from "./AddProductDialog";
import EditProductDialog from "./EditProductDialog";
import StockAdjustmentDialog from "./StockAdjustmentDialog";
import DeleteProductDialog from "./DeleteProductDialog";
import ProductDetails from "./ProductDetails";
import ImportProductsDialog from "./ImportProductsDialog";

const InventoryPage = () => {
  const { products, refreshProducts, isLoading } = useProducts();
  
  // UI state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [view, setView] = useState<string>("grid");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  // Selected product for details view
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  
  useEffect(() => {
    // Initial data load
    refreshProducts();
  }, [refreshProducts]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProducts();
      toast.success("Inventory data refreshed");
    } catch (error) {
      // Error already handled in context
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const openAddDialog = () => setIsAddDialogOpen(true);
  
  const openEditDialog = (productId: string) => {
    setSelectedProductId(productId);
    setIsEditDialogOpen(true);
  };
  
  const openStockDialog = (productId: string) => {
    setSelectedProductId(productId);
    setIsStockDialogOpen(true);
  };
  
  const openDeleteDialog = (productId: string) => {
    setSelectedProductId(productId);
    setIsDeleteDialogOpen(true);
  };
  
  const viewProductDetails = (product: Product) => {
    setDetailsProduct(product);
    setView("details");
  };
  
  const closeDetails = () => {
    setDetailsProduct(null);
    setView("grid");
  };

  // Filter products based on search, category, and stock filters
  const filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    // Stock filter
    let matchesStock = true;
    if (stockFilter === "low") {
      matchesStock = Boolean(product.minStock && product.stock <= product.minStock && product.stock > 0);
    } else if (stockFilter === "out") {
      matchesStock = product.stock === 0;
    } else if (stockFilter === "in") {
      matchesStock = product.stock > 0 && (!product.minStock || product.stock > product.minStock);
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });
  
  // Calculate inventory stats
  const lowStockCount = products.filter(p => p.minStock && p.stock <= p.minStock && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  
  const calculateTotalValue = () => {
    return products.reduce((total, product) => total + product.price * product.stock, 0);
  };
  
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
      {/* Header with title and refresh button */}
      <div className="flex justify-between items-center">
        <PageTitle 
          title="Inventory Management" 
          subtitle="Track and manage products and supplies"
        />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isRefreshing || isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      {/* Stats cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-card rounded-lg border shadow-sm flex items-center p-4 animate-fade-in">
          <div className="bg-primary/10 rounded-full p-3 mr-4">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Products</p>
            <h3 className="text-2xl font-bold">{products.length}</h3>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border shadow-sm flex items-center p-4 animate-fade-in">
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
        
        <div className="bg-card rounded-lg border shadow-sm flex items-center p-4 animate-fade-in">
          <div className="bg-blue-100 rounded-full p-3 mr-4">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
            <h3 className="text-2xl font-bold">{calculateTotalValue().toFixed(2)} TNd</h3>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-6">
          {/* Filters and actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in">In Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={openAddDialog} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
              
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button onClick={() => setIsImportDialogOpen(true)} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
          
          {/* Product views */}
          <Tabs value={view} onValueChange={setView}>
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="category">Category View</TabsTrigger>
              {detailsProduct && (
                <TabsTrigger value="details">Product Details</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="grid" className="mt-6">
              <ProductList 
                products={filteredProducts} 
                onSelect={viewProductDetails} 
              />
            </TabsContent>
            
            <TabsContent value="table" className="mt-6">
              <ProductTable 
                products={filteredProducts} 
                onView={viewProductDetails}
                onEdit={openEditDialog}
                onStockAdjust={openStockDialog}
                onDelete={openDeleteDialog}
              />
            </TabsContent>
            
            <TabsContent value="category" className="mt-6">
              <div className="space-y-6">
                {PRODUCT_CATEGORIES.map((category) => {
                  const categoryProducts = filteredProducts.filter(
                    (p) => p.category === category.id
                  );
                  
                  if (categoryProducts.length === 0) return null;
                  
                  return (
                    <div key={category.id} className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">{category.name}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categoryProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onClick={() => viewProductDetails(product)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="mt-6">
              {detailsProduct && (
                <div className="max-w-3xl mx-auto">
                  <ProductDetails
                    product={detailsProduct}
                    onBack={closeDetails}
                    onEdit={() => openEditDialog(detailsProduct.id)}
                    onStockAdjust={() => openStockDialog(detailsProduct.id)}
                    onDelete={() => openDeleteDialog(detailsProduct.id)}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Show message when no products match filters */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-1">No products found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Dialogs */}
      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
      
      <EditProductDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        productId={selectedProductId}
      />
      
      <StockAdjustmentDialog
        open={isStockDialogOpen}
        onOpenChange={setIsStockDialogOpen}
        productId={selectedProductId}
      />
      
      <DeleteProductDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        productId={selectedProductId}
      />
      
      <ImportProductsDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </div>
  );
};

export default InventoryPage;
