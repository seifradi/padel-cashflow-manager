
import Layout from "@/components/layout/Layout";
import InventoryPage from "@/components/inventory/InventoryPage";
import { useEffect } from "react";
import { useData } from "@/context/DataContext";

const Inventory = () => {
  const { refreshProducts } = useData();
  
  // Refresh products when the component mounts
  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);
  
  return (
    <Layout title="Inventory Management">
      <InventoryPage />
    </Layout>
  );
};

export default Inventory;
