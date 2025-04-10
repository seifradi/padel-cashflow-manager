
import Layout from "@/components/layout/Layout";
import InventoryPage from "@/components/inventory/InventoryPage";
import { useEffect } from "react";
import { useData } from "@/context/DataContext";

const Inventory = () => {
  const { refreshProducts } = useData();
  
  // Refresh products only once when the component mounts
  useEffect(() => {
    console.log('Inventory page: refreshing products');
    refreshProducts();
    // Do not add refreshProducts to dependency array to prevent repeated calls
  }, []);
  
  return (
    <Layout title="Inventory Management">
      <InventoryPage />
    </Layout>
  );
};

export default Inventory;
