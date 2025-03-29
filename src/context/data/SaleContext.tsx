
import { Product, Sale } from "@/lib/types";
import { ReactNode, createContext, useContext, useState } from "react";
import { useProducts } from "./ProductContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SaleContextType {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id'>) => Promise<Sale>;
}

const SaleContext = createContext<SaleContextType | undefined>(undefined);

export const SaleProvider = ({ children }: { children: ReactNode }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const { products, updateProduct } = useProducts();
  const { toast } = useToast();

  const addSale = async (sale: Omit<Sale, 'id'>) => {
    try {
      // First, create the sale in the database
      const { data: newSaleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          payment_method: sale.paymentMethod,
          total_amount: sale.totalAmount,
          notes: sale.notes,
          created_by: sale.createdBy
        })
        .select('*')
        .single();

      if (saleError) throw saleError;

      // Then insert sale items and update product stock
      for (const item of sale.products) {
        const product = products.find(p => p.id === item.productId);
        
        if (!product) {
          console.error(`Product not found: ${item.productId}`);
          continue;
        }

        // Insert sale item
        const { error: itemError } = await supabase
          .from('sale_items')
          .insert({
            sale_id: newSaleData.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price
          });

        if (itemError) {
          console.error('Error inserting sale item:', itemError);
          continue;
        }

        // Update product stock in the database
        const newStock = product.stock - item.quantity;
        const { error: productError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.productId);

        if (productError) {
          console.error('Error updating product stock:', productError);
          continue;
        }

        // Update product in local state
        updateProduct({
          ...product,
          stock: newStock
        });
      }

      // Create the complete sale object for our state
      const newSale: Sale = {
        id: newSaleData.id,
        products: sale.products,
        totalAmount: sale.totalAmount,
        paymentMethod: sale.paymentMethod,
        createdBy: sale.createdBy,
        createdAt: new Date(newSaleData.created_at),
        notes: sale.notes,
      };

      setSales([...sales, newSale]);
      
      toast({
        title: "Sale completed",
        description: "The sale has been recorded and inventory updated",
      });
      
      return newSale;
    } catch (error: any) {
      console.error('Error adding sale:', error);
      toast({
        title: "Error completing sale",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

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
