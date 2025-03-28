
import { Product, Sale } from "@/lib/types";
import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { useProducts } from "./ProductContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  // Fetch sales when component mounts
  useEffect(() => {
    refreshSales();
  }, []);

  const refreshSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items:sale_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Sale type
      const formattedSales: Sale[] = data.map(sale => ({
        id: sale.id,
        totalAmount: sale.total_amount,
        paymentMethod: sale.payment_method as 'cash' | 'card' | 'transfer',
        createdBy: sale.created_by || '',
        createdAt: new Date(sale.created_at),
        notes: sale.notes || undefined,
        products: (sale.sale_items || []).map((item: any) => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price
        }))
      }));

      setSales(formattedSales);
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
      // First, insert the sale
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([{
          total_amount: sale.totalAmount,
          payment_method: sale.paymentMethod,
          created_by: sale.createdBy,
          notes: sale.notes
        }])
        .select('*')
        .single();

      if (saleError) throw saleError;

      // Then, insert the sale items
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

      // Update product stock for each item
      const stockUpdatePromises = sale.products.map(async (item) => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await updateProduct({
            ...product,
            stock: newStock
          });
        }
      });

      // Wait for all stock updates to complete
      await Promise.all(stockUpdatePromises);
      
      // Refresh products list to get updated stock values
      await refreshProducts();

      // Create a new sale object with the id
      const newSale: Sale = {
        ...sale,
        id: saleData.id,
        createdAt: new Date(saleData.created_at)
      };

      // Add the new sale to the state
      setSales(prevSales => [newSale, ...prevSales]);

      toast({
        title: "Sale completed",
        description: "Product stock has been updated",
      });

      return newSale;
    } catch (error: any) {
      console.error('Error adding sale:', error);
      toast({
        title: "Error adding sale",
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
