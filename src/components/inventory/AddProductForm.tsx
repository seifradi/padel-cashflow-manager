
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useData } from "@/context/DataContext";
import { ProductCategory } from "@/lib/types";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import AmountInput from "../common/AmountInput";

interface AddProductFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddProductForm = ({ isOpen, onClose }: AddProductFormProps) => {
  const { supabase, refreshProducts } = useData();
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory | "">("");
  const [price, setPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const [stock, setStock] = useState(0);
  const [minStock, setMinStock] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    // Validate form
    if (!name.trim()) {
      toast.error("Please enter a product name");
      return;
    }
    
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    
    if (price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('products')
        .insert({
          name: name.trim(),
          category,
          price,
          cost,
          stock,
          min_stock: minStock
        });
      
      if (error) throw error;
      
      toast.success("Product added successfully");
      resetForm();
      onClose();
      
      // Refresh products list
      refreshProducts();
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error(`Error adding product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setName("");
    setCategory("");
    setPrice(0);
    setCost(0);
    setStock(0);
    setMinStock(undefined);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] pointer-events-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Enter the details of the new product to add to inventory.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Product name"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={category} onValueChange={(value) => setCategory(value as ProductCategory)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="pointer-events-auto">
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Selling Price
            </Label>
            <div className="col-span-3">
              <AmountInput
                value={price}
                onChange={setPrice}
                min={0}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cost" className="text-right">
              Cost Price
            </Label>
            <div className="col-span-3">
              <AmountInput
                value={cost}
                onChange={setCost}
                min={0}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock" className="text-right">
              Initial Stock
            </Label>
            <div className="col-span-3">
              <AmountInput
                value={stock}
                onChange={setStock}
                min={0}
                currency="Units"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minStock" className="text-right">
              Low Stock Alert
            </Label>
            <div className="col-span-3">
              <AmountInput
                value={minStock || 0}
                onChange={setMinStock}
                min={0}
                currency="Units"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            resetForm();
            onClose();
          }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductForm;
