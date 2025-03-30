
import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/context/data/ProductContext";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { Product, ProductCategory } from "@/lib/types";
import { toast } from "sonner";
import AmountInput from "../common/AmountInput";

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string | null;
}

const EditProductDialog = ({ open, onOpenChange, productId }: EditProductDialogProps) => {
  const { products, updateProduct } = useProducts();
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory | "">("");
  const [price, setPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const [stock, setStock] = useState(0);
  const [minStock, setMinStock] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  // Load product data when productId changes
  useEffect(() => {
    if (productId && open) {
      const foundProduct = products.find(p => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
        setName(foundProduct.name);
        setCategory(foundProduct.category);
        setPrice(foundProduct.price);
        setCost(foundProduct.cost);
        setStock(foundProduct.stock);
        setMinStock(foundProduct.minStock);
      }
    }
  }, [productId, products, open]);

  const handleClose = () => {
    onOpenChange(false);
  };

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

    if (!product || !productId) {
      toast.error("Product not found");
      return;
    }

    try {
      setIsSubmitting(true);

      await updateProduct({
        ...product,
        name: name.trim(),
        category,
        price,
        cost,
        stock,
        minStock
      });

      handleClose();
    } catch (error) {
      // Error is handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the details of this product.
          </DialogDescription>
        </DialogHeader>

        {product ? (
          <>
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
                  <SelectTrigger id="category" className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
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
                    id="price"
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
                    id="cost"
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
                    id="stock"
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
                    id="minStock"
                    value={minStock || 0}
                    onChange={setMinStock}
                    min={0}
                    currency="Units"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Product"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            Product not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
