
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/context/data/ProductContext";
import { Product } from "@/lib/types";
import { toast } from "sonner";
import AmountInput from "../common/AmountInput";

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string | null;
}

const StockAdjustmentDialog = ({ 
  open, 
  onOpenChange, 
  productId 
}: StockAdjustmentDialogProps) => {
  const { products, adjustStock } = useProducts();
  
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract" | "set">("add");
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  // Load product when ID changes
  useEffect(() => {
    if (productId && open) {
      const foundProduct = products.find(p => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
      }
    }
  }, [productId, products, open]);

  const handleClose = () => {
    setQuantity(0);
    setReason("");
    setAdjustmentType("add");
    onOpenChange(false);
  };

  const calculateNewStock = () => {
    if (!product) return 0;
    
    switch (adjustmentType) {
      case "add":
        return product.stock + quantity;
      case "subtract":
        return Math.max(0, product.stock - quantity);
      case "set":
        return quantity;
      default:
        return product.stock;
    }
  };

  const handleSubmit = async () => {
    if (!product || !productId) {
      toast.error("Product not found");
      return;
    }

    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // For "set" operation we need to calculate the difference
      if (adjustmentType === "set") {
        const diff = quantity - product.stock;
        await adjustStock(productId, Math.abs(diff), diff >= 0);
      } else {
        await adjustStock(productId, quantity, adjustmentType === "add");
      }
      
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
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            {product ? `Update stock levels for ${product.name}` : 'Update stock levels'}
          </DialogDescription>
        </DialogHeader>

        {product ? (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="adjustmentType" className="text-right">
                  Action
                </Label>
                <Select 
                  value={adjustmentType} 
                  onValueChange={(value) => setAdjustmentType(value as "add" | "subtract" | "set")}
                >
                  <SelectTrigger id="adjustmentType" className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Stock</SelectItem>
                    <SelectItem value="subtract">Remove Stock</SelectItem>
                    <SelectItem value="set">Set Stock Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <div className="col-span-3">
                  <AmountInput
                    value={quantity}
                    onChange={setQuantity}
                    min={0}
                    currency="Units"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reason" className="text-right">
                  Reason
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for adjustment (optional)"
                  className="col-span-3 resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right text-sm text-muted-foreground">
                  Current Stock:
                </div>
                <div className="col-span-3 font-medium">
                  {product.stock} units
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right text-sm text-muted-foreground">
                  New Stock:
                </div>
                <div className="col-span-3 font-medium">
                  {calculateNewStock()} units
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Confirm Adjustment"}
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

export default StockAdjustmentDialog;
