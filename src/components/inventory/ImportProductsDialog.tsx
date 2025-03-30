
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/context/data/ProductContext";
import { ProductCategory } from "@/lib/types";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";

interface ImportProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportProductsDialog = ({ open, onOpenChange }: ImportProductsDialogProps) => {
  const { addProduct } = useProducts();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleClose = () => {
    setFile(null);
    onOpenChange(false);
  };
  
  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a CSV file to import");
      return;
    }
    
    if (!file.name.endsWith('.csv')) {
      toast.error("Only CSV files are supported");
      return;
    }
    
    try {
      setIsUploading(true);
      
      const text = await file.text();
      const rows = text.split('\n');
      const headers = rows[0].split(',').map(h => h.trim());
      
      // Validate headers
      const requiredHeaders = ['name', 'category', 'price', 'cost', 'stock'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        throw new Error(`CSV is missing required headers: ${missingHeaders.join(', ')}`);
      }
      
      // Process data
      const validProducts = [];
      const errors = [];
      
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;
        
        const values = rows[i].split(',');
        const product: Record<string, string> = {};
        
        for (let j = 0; j < headers.length; j++) {
          product[headers[j].trim()] = values[j]?.trim() || '';
        }
        
        // Validate product data
        if (!product.name) {
          errors.push(`Row ${i}: Missing product name`);
          continue;
        }
        
        const categoryExists = PRODUCT_CATEGORIES.some(c => c.id === product.category);
        if (!product.category || !categoryExists) {
          errors.push(`Row ${i}: Invalid category "${product.category}"`);
          continue;
        }
        
        const price = parseFloat(product.price);
        if (isNaN(price) || price <= 0) {
          errors.push(`Row ${i}: Invalid price "${product.price}"`);
          continue;
        }
        
        const cost = parseFloat(product.cost);
        if (isNaN(cost) || cost < 0) {
          errors.push(`Row ${i}: Invalid cost "${product.cost}"`);
          continue;
        }
        
        const stock = parseInt(product.stock);
        if (isNaN(stock) || stock < 0) {
          errors.push(`Row ${i}: Invalid stock "${product.stock}"`);
          continue;
        }
        
        const minStock = product.min_stock ? parseInt(product.min_stock) : undefined;
        if (product.min_stock && (isNaN(minStock!) || minStock! < 0)) {
          errors.push(`Row ${i}: Invalid min_stock "${product.min_stock}"`);
          continue;
        }
        
        // Add valid product
        validProducts.push({
          name: product.name,
          category: product.category as ProductCategory,
          price,
          cost,
          stock,
          minStock
        });
      }
      
      // Show errors if any
      if (errors.length > 0) {
        console.error('Import errors:', errors);
        if (errors.length <= 3) {
          errors.forEach(err => toast.error(err));
        } else {
          toast.error(`Import failed with ${errors.length} errors. Check console for details.`);
        }
        return;
      }
      
      // Insert products
      if (validProducts.length > 0) {
        let successCount = 0;
        for (const productData of validProducts) {
          try {
            await addProduct(productData);
            successCount++;
          } catch (error) {
            console.error('Error adding product:', error);
          }
        }
        
        toast.success(`Successfully imported ${successCount} of ${validProducts.length} products`);
        handleClose();
      } else {
        toast.error("No valid products found in the CSV file");
      }
    } catch (error: any) {
      console.error('Error importing products:', error);
      toast.error(`Error importing products: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDownloadTemplate = () => {
    const headers = 'name,category,price,cost,stock,min_stock\n';
    const example = 'Example Product,drink,10.00,5.00,20,5\n';
    const csvContent = headers + example;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'inventory_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Products</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple products at once.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
            <p className="text-sm text-muted-foreground mt-1">
              File must be a CSV with columns: name, category, price, cost, stock, min_stock (optional)
            </p>
          </div>
          
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadTemplate}
              className="text-xs"
            >
              Download Template
            </Button>
          </div>
          
          <div className="border rounded-md p-3 bg-muted/30">
            <h4 className="text-sm font-medium mb-1">Valid Categories:</h4>
            <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
              {PRODUCT_CATEGORIES.map(cat => (
                <span key={cat.id} className="bg-background px-2 py-0.5 rounded-sm border">
                  {cat.id}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isUploading || !file}>
            {isUploading ? "Importing..." : "Import Products"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportProductsDialog;
