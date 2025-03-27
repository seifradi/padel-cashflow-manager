
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AmountInput from "../common/AmountInput";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Check, DollarSign, X } from "lucide-react";
import RegisterSummary from "./RegisterSummary";

interface CloseRegisterDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CloseRegisterDialog = ({ isOpen, onClose }: CloseRegisterDialogProps) => {
  const { user } = useAuth();
  const { getCurrentDailyBalance, closeDay } = useData();
  
  const [closingAmount, setClosingAmount] = useState(0);
  const [closingNotes, setClosingNotes] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  
  const currentBalance = getCurrentDailyBalance();
  
  const handleClose = async () => {
    if (!currentBalance || !user?.id) return;
    
    if (closingAmount <= 0) {
      toast.error("Please enter the amount in register");
      return;
    }
    
    try {
      setIsClosing(true);
      const result = closeDay(closingAmount, closingNotes, user.id);
      
      if (Math.abs(result.difference) > 0.5) {
        const diffType = result.difference > 0 ? "excess" : "shortage";
        const diffAmount = Math.abs(result.difference);
        
        toast.warning(
          `Register closed with ${diffType} of ${formatCurrency(diffAmount)}`, 
          {
            icon: <AlertTriangle className="h-5 w-5 text-amber-500" />
          }
        );
      } else {
        toast.success("Register closed successfully", {
          icon: <Check className="h-5 w-5 text-green-500" />
        });
      }
      
      onClose();
    } catch (error: any) {
      console.error("Error closing register:", error);
      toast.error(`Failed to close register: ${error.message}`);
    } finally {
      setIsClosing(false);
    }
  };
  
  if (!currentBalance) return null;
  
  const expectedAmount = currentBalance.startingAmount || 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Close Register
          </DialogTitle>
          <DialogDescription>
            Verify and close today's cash register. Count the cash and enter the amount below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <RegisterSummary />
          
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cash in Register</label>
              <AmountInput
                value={closingAmount}
                onChange={setClosingAmount}
                min={0}
                placeholder="Enter the counted amount"
              />
              <p className="text-xs text-muted-foreground">
                Count all cash in the register and enter the total amount
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Add any notes about today's balance"
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex items-center justify-between sm:justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isClosing}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button 
            onClick={handleClose} 
            disabled={isClosing || closingAmount <= 0}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            {isClosing ? "Closing..." : "Close Register"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloseRegisterDialog;
