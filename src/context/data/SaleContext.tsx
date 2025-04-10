
import { Product, Sale } from "@/lib/types";
import { ReactNode, createContext, useCallback, useContext, useState } from "react";
import { useProducts } from "./ProductContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SaleContextType {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id'>) => Promise<Sale | null>;
}

const SaleContext = createContext<SaleContextType | undefined>(undefined);

export const SaleProvider = ({ children }: { children: ReactNode }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const { products, refreshProducts } = useProducts();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const addSale = useCallback(async (sale: Omit<Sale, 'id'>): Promise<Sale | null> => {
    // Prevent multiple concurrent requests
    if (isProcessing) {
      console.log('Sale transaction already in progress');
      return null;
    }
    
    setIsProcessing(true);
    
    try {
      console.log('Starting sale transaction');
      
      // 1. Insert the sale record
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          payment_method: sale.paymentMethod,
          total_amount: sale.totalAmount,
          created_by: sale.createdBy,
          notes: sale.notes
        })
        .select()
        .single();

      if (saleError) throw saleError;
      
      console.log('Sale record created:', saleData.id);

      // 2. Insert the sale items
      const saleItems = sale.products.map(item => ({
        sale_id: saleData.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;
      
      console.log('Sale items added');

      // 3. Create the complete sale object
      const newSale = {
        ...sale,
        id: saleData.id
      };

      setSales(prev => [...prev, newSale]);
      
      // 4. Refresh products to get updated stock levels (only once)
      await refreshProducts();
      
      console.log('Products refreshed after sale');
      
      return newSale;
    } catch (error: any) {
      console.error('Error adding sale:', error.message);
      toast({
        title: "Error adding sale",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      // Always reset processing state when done
      setIsProcessing(false);
      console.log('Sale transaction completed, processing state reset');
    }
  }, [isProcessing, products, refreshProducts, toast]);

  return (
    <SaleContext.Provider value={{ sales, addSale }}>
      {children}
    </SaleContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SaleContext);
  if (context === undefined) {
    throw new Error("useSales must be used within a SaleProvider");
  }
  return context;
};
