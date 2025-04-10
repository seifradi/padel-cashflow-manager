
import Layout from "@/components/layout/Layout";
import CashRegisterPage from "@/components/register/CashRegisterPage";
import { useEffect } from "react";
import { useData } from "@/context/DataContext";

const CashRegister = () => {
  const { refreshProducts } = useData();
  
  // Refresh products only once when the component mounts
  useEffect(() => {
    // Console log to track when refreshProducts is called
    console.log('CashRegister page: refreshing products');
    refreshProducts();
    // Do not add refreshProducts to dependency array to prevent repeated calls
  }, []);
  
  return (
    <Layout title="Cash Register">
      <CashRegisterPage />
    </Layout>
  );
};

export default CashRegister;
