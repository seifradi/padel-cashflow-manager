
import { Product, Sale } from "@/lib/types";
import { ReactNode, createContext, useContext, useState } from "react";
import { useProducts } from "./ProductContext";

interface SaleContextType {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id'>) => Sale;
}

const SaleContext = createContext<SaleContextType | undefined>(undefined);

export const SaleProvider = ({ children }: { children: ReactNode }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const { products, updateProduct } = useProducts();

  const addSale = (sale: Omit<Sale, 'id'>) => {
    const newSale = {
      ...sale,
      id: `sale-${Date.now()}`
    };
    setSales([...sales, newSale]);
    
    // Update product stock
    sale.products.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        updateProduct({
          ...product,
          stock: product.stock - item.quantity
        });
      }
    });
    
    return newSale;
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
