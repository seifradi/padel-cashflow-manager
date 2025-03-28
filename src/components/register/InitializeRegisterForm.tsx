
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { LockOpen, Unlock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Card from "../common/Card";
import AmountInput from "../common/AmountInput";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const InitializeRegisterForm = () => {
  const { user } = useAuth();
  const { startDay, refreshDailyBalances } = useData();
  const { translations } = useLanguage();
  const navigate = useNavigate();
  
  const [isInitializing, setIsInitializing] = useState(false);
  const [startingAmount, setStartingAmount] = useState(0);
  const today = new Date();
  
  const handleStartDay = async () => {
    if (startingAmount <= 0) {
      toast.error(translations.pleaseEnterAmount || "Starting amount must be greater than zero");
      return;
    }
    
    setIsInitializing(true);
    
    try {
      console.log("Starting day with userId:", user?.id);
      if (!user?.id) {
        toast.error(translations.userNotAuthenticated || "User not authenticated");
        setIsInitializing(false);
        return;
      }

      const result = await startDay(startingAmount, user.id);
      console.log("Register initialized with result:", result);
      toast.success(translations.registerInitialized || "Cash register initialized successfully");
      
      // Force refresh register state after initialization
      await refreshDailyBalances();
      
      setIsInitializing(false);
      
      // Redirect to dashboard after successful initialization
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error initializing register:", error);
      toast.error(translations.failedToInitializeRegister || "Failed to initialize cash register");
      setIsInitializing(false);
    }
  };
  
  return (
    <Card
      title={translations.initializeRegister || "Initialize Cash Register"}
      subtitle={`${translations.startDay || "Start a new day"} (${format(today, "EEEE, MMMM d, yyyy")})`}
      className="max-w-md mx-auto animate-fade-in"
      icon={<Unlock className="h-5 w-5 text-primary" />}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{translations.startingAmount || "Starting Amount"}</label>
          <AmountInput
            value={startingAmount}
            onChange={setStartingAmount}
            min={0}
            placeholder={translations.enterStartingAmount || "Enter starting cash amount"}
          />
          <p className="text-xs text-muted-foreground">
            {translations.enterStartingCashDescription || "Enter the amount of cash you're starting the day with"}
          </p>
        </div>
        
        <Button 
          onClick={handleStartDay} 
          className="w-full flex items-center gap-2"
          disabled={isInitializing || startingAmount <= 0}
        >
          <LockOpen className="h-4 w-4" />
          {isInitializing ? (translations.initializing || "Initializing...") : (translations.startDay || "Start Day")}
        </Button>
      </div>
    </Card>
  );
};

export default InitializeRegisterForm;
