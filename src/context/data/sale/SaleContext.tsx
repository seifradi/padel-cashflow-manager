
import { Sale } from "@/lib/types";
import { ReactNode, createContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "../ProductContext";
import { fetchSales, createSale, getProductFromDB } from "./SaleService";

interface SaleContextType {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id'>) => Promise<Sale>;
  refreshSales: () => Promise<void>;
}

export const SaleContext = createContext<SaleContextType | undefined>(undefined);

export const SaleProvider = ({ children }: { children: ReactNode }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const { refreshProducts } = useProducts();
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
      const salesData = await fetchSales();
      setSales(salesData);
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
      console.log("Starting sale transaction and product stock update...");
      
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
      
      // Create the sale and update product stock
      const newSale = await createSale(sale);
      
      // Update local state with the new sale
      setSales(prevSales => [newSale, ...prevSales]);
      
      // Make sure to refresh products to ensure stock levels are up to date everywhere in the UI
      console.log("Refreshing products after sale to update stock levels in UI");
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

export { useSales } from './useSaleContext';
