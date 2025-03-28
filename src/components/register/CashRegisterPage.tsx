
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { 
  AlertTriangle,
  CalendarDays, 
  CreditCard, 
  DollarSign, 
  LockOpen, 
  ReceiptText, 
  Unlock, 
  X 
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Card from "../common/Card";
import PageTitle from "../common/PageTitle";
import BookingForm from "../bookings/BookingForm";
import SalesForm from "../sales/SalesForm";
import AmountInput from "../common/AmountInput";
import { format } from "date-fns";
import CloseRegisterDialog from "./CloseRegisterDialog";
import RegisterSummary from "./RegisterSummary";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useLanguage } from "@/context/LanguageContext";

const CashRegisterPage = () => {
  const { user } = useAuth();
  const { isRegisterOpen, getCurrentDailyBalance, startDay, refreshDailyBalances } = useData();
  const { translations } = useLanguage();
  
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [startingAmount, setStartingAmount] = useState(0);
  
  const [registerState, setRegisterState] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Fetch current register state when component mounts
    const fetchRegisterState = async () => {
      await refreshDailyBalances();
      setRegisterState(isRegisterOpen());
    };
    
    fetchRegisterState();
  }, [refreshDailyBalances, isRegisterOpen]);
  
  const registerOpen = registerState !== null ? registerState : isRegisterOpen();
  const currentBalance = getCurrentDailyBalance();
  const today = new Date();
  
  const handleStartDay = async () => {
    if (startingAmount <= 0) {
      toast.error(translations.pleaseEnterAmount || "Starting amount must be greater than zero");
      return;
    }
    
    setIsInitializing(true);
    
    try {
      await startDay(startingAmount, user?.id || "");
      toast.success(translations.registerInitialized || "Cash register initialized successfully");
      // Refresh register state after initialization
      setRegisterState(true);
      setIsInitializing(false);
    } catch (error: any) {
      console.error("Error initializing register:", error);
      toast.error(translations.failedToInitializeRegister || "Failed to initialize cash register");
      setIsInitializing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <PageTitle 
        title={translations.cashRegister || "Cash Register"} 
        subtitle={translations.cashRegisterDescription || "Manage court bookings, product sales, and daily balance"} 
        icon={<DollarSign className="h-5 w-5" />}
      />
      
      {!registerOpen ? (
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
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                <div className="mr-1 h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                {translations.registerOpen || "Register Open"}
              </span>
              <span className="text-muted-foreground">
                {translations.startedAt || "Started at"} {format(new Date(currentBalance?.closedAt || today), "h:mm a")}
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCloseDialogOpen(true)}
              className="text-sm flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              {translations.closeRegister || "Close Register"}
            </Button>
          </div>
          
          <RegisterSummary />
          
          <Tabs defaultValue="bookings" className="space-y-6 animate-fade-in">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>{translations.bookings || "Court Bookings"}</span>
              </TabsTrigger>
              <TabsTrigger value="sales" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>{translations.productSales || "Product Sales"}</span>
              </TabsTrigger>
              <TabsTrigger value="balance" className="flex items-center gap-2">
                <ReceiptText className="h-4 w-4" />
                <span>{translations.dailyBalance || "Daily Balance"}</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="bookings" className="mt-6">
              <BookingForm />
            </TabsContent>
            
            <TabsContent value="sales" className="mt-6">
              <SalesForm />
            </TabsContent>
            
            <TabsContent value="balance" className="mt-6">
              <div className="grid gap-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{translations.registerWillBeClosed || "Register will be closed"}</AlertTitle>
                  <AlertDescription>
                    {translations.registerCloseDescription || "When you close the register, you'll need to count all cash and verify the amount. Any discrepancy will be recorded in the system."}
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card
                    title={translations.registerSummary || "Register Summary"}
                    className="col-span-1 sm:col-span-2 lg:col-span-2"
                    icon={<ReceiptText className="h-5 w-5 text-primary" />}
                  >
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {translations.registerSummaryDescription || "View the summary of all transactions for today. When ready to close the register, click the button below to count cash and verify the final amount."}
                      </p>
                      
                      <Button 
                        onClick={() => setIsCloseDialogOpen(true)} 
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        {translations.closeRegister || "Close Register"}
                      </Button>
                    </div>
                  </Card>
                  
                  <Card
                    title={translations.registerInfo || "Register Info"}
                    className="col-span-1"
                    icon={<DollarSign className="h-5 w-5 text-primary" />}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{translations.date || "Date"}:</span>
                        <span className="font-medium">{format(today, "EEEE, MMM d")}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{translations.time || "Time"}:</span>
                        <span className="font-medium">{format(today, "h:mm a")}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{translations.startingAmount || "Starting Amount"}:</span>
                        <span className="font-medium">{currentBalance?.startingAmount} TND</span>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                            <div className="mr-1 h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            {translations.active || "Active"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
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
