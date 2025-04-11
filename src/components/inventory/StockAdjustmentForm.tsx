
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
import { Product } from "@/lib/types";
import AmountInput from "../common/AmountInput";
import { Textarea } from "@/components/ui/textarea";

interface StockAdjustmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
}

const StockAdjustmentForm = ({ isOpen, onClose, productId }: StockAdjustmentFormProps) => {
  const { products, adjustStock, refreshProducts } = useData();
  
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  
  const product = productId ? products.find(p => p.id === productId) : null;
  
  const handleAdjustStock = async () => {
    if (!productId || !product) {
      toast.error("Product not found");
      return;
    }
    
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    
    try {
      setLoading(true);
      console.log(`Starting stock adjustment for ${product.name}, type: ${adjustmentType}, quantity: ${quantity}`);
      
      if (adjustmentType === 'set') {
        // For 'set' type, calculate the difference and determine whether to add or subtract
        const difference = quantity - product.stock;
        
        if (difference !== 0) {
          console.log(`Setting stock to ${quantity} (difference: ${difference})`);
          await adjustStock(productId, Math.abs(difference), difference > 0);
        }
      } else {
        // For 'add' or 'subtract' type, use the adjustStock function directly
        console.log(`${adjustmentType === 'add' ? 'Adding' : 'Subtracting'} ${quantity} units`);
        await adjustStock(productId, quantity, adjustmentType === 'add');
      }
      
      // Force a refresh of products after stock adjustment
      console.log('Stock adjustment succeeded, refreshing products');
      await refreshProducts();
      
      toast.success(`Stock ${adjustmentType === 'add' ? 'added' : adjustmentType === 'subtract' ? 'removed' : 'updated'} successfully`);
      onClose();
    } catch (error: any) {
      console.error('Error adjusting stock:', error);
      toast.error(`Error adjusting stock: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] pointer-events-auto">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            {product ? `Update stock levels for ${product.name}` : 'Update stock levels'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="adjustmentType" className="text-right">
              Action
            </Label>
            <Select 
              value={adjustmentType} 
              onValueChange={(value) => setAdjustmentType(value as 'add' | 'subtract' | 'set')}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="pointer-events-auto">
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
          
          {product && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-sm text-muted-foreground">
                Current Stock:
              </div>
              <div className="col-span-3 font-medium">
                {product.stock} units
              </div>
            </div>
          )}
          
          {product && adjustmentType !== 'set' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-sm text-muted-foreground">
                New Stock:
              </div>
              <div className="col-span-3 font-medium">
                {adjustmentType === 'add' 
                  ? product.stock + quantity 
                  : Math.max(0, product.stock - quantity)
                } units
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdjustStock} disabled={loading}>
            {loading ? "Updating..." : "Confirm Adjustment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockAdjustmentForm;
