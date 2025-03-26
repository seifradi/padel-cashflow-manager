
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    // If user is authenticated, redirect to the dashboard
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        navigate("/dashboard");
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [navigate, isAuthenticated]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Padel Cashflow Manager
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            A complete solution for managing court bookings, cash register, inventory, and financial reporting for your padel club.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="w-full sm:w-auto"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/auth")}
              className="w-full sm:w-auto"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
      
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-24">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Padel Cashflow Manager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
