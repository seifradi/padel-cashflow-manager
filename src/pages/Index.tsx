
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the dashboard page after a short delay
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 500);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  // Render a fallback UI while redirecting or if redirect fails
  return (
    <Layout title="Welcome">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <h1 className="text-3xl font-bold">Welcome to Padel Cashflow Manager</h1>
        <p className="text-muted-foreground text-lg text-center max-w-2xl">
          A complete solution for managing court bookings, cash register, inventory, and financial reporting for your padel club.
        </p>
        <Button 
          size="lg" 
          onClick={() => navigate("/dashboard")}
          className="mt-4"
        >
          Go to Dashboard
        </Button>
      </div>
    </Layout>
  );
};

export default Index;
