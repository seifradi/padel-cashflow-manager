
import { Product, Sale, ProductCategory } from "@/lib/types";
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
        const productFromDB = await getProductFromDB(item.productId);
        if (!productFromDB) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        if (item.quantity > productFromDB.stock) {
          throw new Error(`Not enough stock for product: ${productFromDB.name}`);
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
        // Get the latest product data directly from the database
        const productFromDB = await getProductFromDB(item.productId);
        
        if (!productFromDB) {
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
        const newStock = productFromDB.stock - item.quantity;
        
        // Update directly in the database
        const { error: updateError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.productId);
        
        if (updateError) {
          console.error('Error updating product stock directly:', updateError);
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

      setSales(prevSales => [newSale, ...prevSales]);
      
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

  // Helper function to get the most up-to-date product data directly from the database
  const getProductFromDB = async (productId: string): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        category: data.category as ProductCategory,
        price: data.price,
        cost: data.cost,
        stock: data.stock,
        minStock: data.min_stock || undefined
      };
    } catch (error) {
      console.error('Error fetching product from database:', error);
      return null;
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
