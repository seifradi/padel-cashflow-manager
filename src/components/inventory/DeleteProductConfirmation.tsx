
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { toast } from "sonner";
import { Product } from "@/lib/types";

interface DeleteProductConfirmationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string | null;
  onDeleted: () => void;
}

const DeleteProductConfirmation = ({
  isOpen,
  onOpenChange,
  productId,
  onDeleted
}: DeleteProductConfirmationProps) => {
  const { products, supabase } = useData();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const product = productId 
    ? products.find(p => p.id === productId) 
    : null;
  
  const handleDelete = async () => {
    if (!productId) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      
      toast.success("Product deleted successfully");
      onOpenChange(false);
      onDeleted();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(`Error deleting product: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="pointer-events-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {product?.name || "this product"} from the inventory.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            className="bg-destructive hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProductConfirmation;
