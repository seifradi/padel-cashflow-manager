
import { useState, useEffect } from "react";
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
import { Product, ProductCategory } from "@/lib/types";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import AmountInput from "../common/AmountInput";

interface EditProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
}

const EditProductForm = ({ isOpen, onClose, productId }: EditProductFormProps) => {
  const { products, updateProduct } = useData();
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory | "">("");
  const [price, setPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const [stock, setStock] = useState(0);
  const [minStock, setMinStock] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  
  // Load product data when productId changes
  useEffect(() => {
    if (productId && isOpen) {
      const product = products.find(p => p.id === productId);
      if (product) {
        setName(product.name);
        setCategory(product.category);
        setPrice(product.price);
        setCost(product.cost);
        setStock(product.stock);
        setMinStock(product.minStock);
      }
    }
  }, [productId, products, isOpen]);
  
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
    
    if (!productId) {
      toast.error("Product ID is missing");
      return;
    }
    
    try {
      setLoading(true);
      
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error("Product not found");
      }
      
      await updateProduct({
        ...product,
        name: name.trim(),
        category,
        price,
        cost,
        stock,
        minStock
      });
      
      toast.success("Product updated successfully");
      onClose();
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(`Error updating product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] pointer-events-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the details of this product.
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
              Current Stock
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating..." : "Update Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductForm;
