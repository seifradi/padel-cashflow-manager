
import Layout from "@/components/layout/Layout";
import CashRegisterPage from "@/components/register/CashRegisterPage";
import { useEffect } from "react";
import { useData } from "@/context/DataContext";

const CashRegister = () => {
  const { refreshProducts } = useData();
  
  // Refresh products when the component mounts
  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);
  
  return (
    <Layout title="Cash Register">
      <CashRegisterPage />
    </Layout>
  );
};

export default CashRegister;
