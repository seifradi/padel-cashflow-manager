
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useData } from "@/context/DataContext";
import { ProductCategory } from "@/lib/types";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface BulkImportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

const BulkImportForm = ({ isOpen, onClose, onImported }: BulkImportFormProps) => {
  const { supabase } = useData();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
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
      const headers = rows[0].split(',');
      
      // Validate headers
      const requiredHeaders = ['name', 'category', 'price', 'cost', 'stock'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        throw new Error(`CSV is missing required headers: ${missingHeaders.join(', ')}`);
      }
      
      // Process data
      const products = [];
      const errors = [];
      
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;
        
        const values = rows[i].split(',');
        const product: any = {};
        
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
        products.push({
          name: product.name,
          category: product.category as ProductCategory,
          price: price,
          cost: cost,
          stock: stock,
          min_stock: minStock
        });
      }
      
      // Show errors if any
      if (errors.length > 0) {
        toast.error(`Import failed with ${errors.length} errors`);
        console.error('Import errors:', errors);
        return;
      }
      
      // Insert products
      if (products.length > 0) {
        const { error } = await supabase
          .from('products')
          .insert(products);
        
        if (error) throw error;
        
        toast.success(`Successfully imported ${products.length} products`);
        onImported();
        onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] pointer-events-auto">
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
          <Button variant="outline" onClick={onClose}>
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

export default BulkImportForm;
