
import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";
import { useData } from "@/context/DataContext";
import PageTitle from "../common/PageTitle";
import CloseRegisterDialog from "./CloseRegisterDialog";
import RegisterSummary from "./RegisterSummary";
import InitializeRegisterForm from "./InitializeRegisterForm";
import RegisterHeader from "./RegisterHeader";
import RegisterTabs from "./RegisterTabs";
import { useLanguage } from "@/context/LanguageContext";

const CashRegisterPage = () => {
  const { isRegisterOpen, refreshDailyBalances } = useData();
  const { translations } = useLanguage();
  
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [registerState, setRegisterState] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Fetch current register state when component mounts
    const fetchRegisterState = async () => {
      await refreshDailyBalances();
      const isOpen = isRegisterOpen();
      setRegisterState(isOpen);
      console.log("Register state on mount:", isOpen);
    };
    
    fetchRegisterState();
  }, [refreshDailyBalances, isRegisterOpen]);
  
  const registerOpen = registerState !== null ? registerState : isRegisterOpen();
  
  return (
    <div className="space-y-6">
      <PageTitle 
        title={translations.cashRegister || "Cash Register"} 
        subtitle={translations.cashRegisterDescription || "Manage court bookings, product sales, and daily balance"} 
        icon={<DollarSign className="h-5 w-5" />}
      />
      
      {!registerOpen ? (
        <InitializeRegisterForm />
      ) : (
        <>
          <RegisterHeader onCloseRegister={() => setIsCloseDialogOpen(true)} />
          
          <RegisterSummary />
          
          <RegisterTabs onCloseRegister={() => setIsCloseDialogOpen(true)} />
          
          <CloseRegisterDialog 
            isOpen={isCloseDialogOpen} 
            onClose={() => setIsCloseDialogOpen(false)} 
          />
        </>
      )}
    </div>
  );
};

export default CashRegisterPage;
