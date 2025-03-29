
import { Product, Sale } from "@/lib/types";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useProducts } from "./ProductContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface SaleContextType {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id'>) => Promise<Sale>;
  refreshSales: () => Promise<void>;
}

const SaleContext = createContext<SaleContextType | undefined>(undefined);

export const SaleProvider = ({ children }: { children: ReactNode }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const { products, updateProduct, refreshProducts } = useProducts();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Fetch sales when the component mounts if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshSales();
    }
  }, [isAuthenticated]);
  
  const refreshSales = async () => {
    try {
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (salesError) throw salesError;
      
      const salesWithItems: Sale[] = [];
      
      for (const sale of salesData) {
        // Get all items for this sale
        const { data: itemsData, error: itemsError } = await supabase
          .from('sale_items')
          .select('*')
          .eq('sale_id', sale.id);
        
        if (itemsError) {
          console.error('Error fetching sale items:', itemsError);
          continue;
        }
        
        const saleProducts = itemsData.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price
        }));
        
        salesWithItems.push({
          id: sale.id,
          products: saleProducts,
          totalAmount: sale.total_amount,
          paymentMethod: sale.payment_method as any,
          createdBy: sale.created_by,
          createdAt: new Date(sale.created_at),
          notes: sale.notes
        });
      }
      
      setSales(salesWithItems);
    } catch (error: any) {
      console.error('Error fetching sales:', error);
      toast({
        title: "Error fetching sales",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addSale = async (sale: Omit<Sale, 'id'>) => {
    try {
      // First, verify stock availability again before completing sale
      for (const item of sale.products) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        if (item.quantity > product.stock) {
          throw new Error(`Not enough stock for product: ${product.name}`);
        }
      }
      
      // Create the sale in the database
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
        
        try {
          // Update the product in the database and local state
          await updateProduct({
            ...product,
            stock: newStock
          });
        } catch (productError) {
          console.error('Error updating product stock:', productError);
        }
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

      setSales([newSale, ...sales]);
      
      // Refresh products to ensure stock levels are up to date
      await refreshProducts();
      
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
    <SaleContext.Provider value={{ sales, addSale, refreshSales }}>
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
