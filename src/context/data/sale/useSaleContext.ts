
import { Sale } from "@/lib/types";
import { useContext } from "react";
import { SaleContext } from "./SaleContext";

/**
 * Hook to use the sale context
 */
export const useSales = () => {
  const context = useContext(SaleContext);
  if (context === undefined) {
    throw new Error("useSales must be used within a SaleProvider");
  }
  return context;
};
