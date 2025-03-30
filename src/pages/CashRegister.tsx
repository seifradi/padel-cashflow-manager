
import Layout from "@/components/layout/Layout";
import CashRegisterPage from "@/components/register/CashRegisterPage";
import { useEffect } from "react";
import { useProducts } from "@/context/data/ProductContext";

const CashRegister = () => {
  const { refreshProducts } = useProducts();

  // Ensure we have the latest product data when the page loads
  // This ensures stock levels are current before any sales transactions
  useEffect(() => {
    console.log("Cash Register page loaded, refreshing products...");
    refreshProducts();
  }, [refreshProducts]);

  return (
    <Layout title="Cash Register">
      <CashRegisterPage />
    </Layout>
  );
};

export default CashRegister;
