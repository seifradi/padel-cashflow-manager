
import { CalendarDays, CreditCard, ReceiptText, AlertTriangle, DollarSign, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import BookingForm from "../bookings/BookingForm";
import SalesForm from "../sales/SalesForm";
import Card from "../common/Card";

interface RegisterTabsProps {
  onCloseRegister: () => void;
}

const RegisterTabs = ({ onCloseRegister }: RegisterTabsProps) => {
  const { translations } = useLanguage();
  const { getCurrentDailyBalance } = useData();
  
  const currentBalance = getCurrentDailyBalance();
  const today = new Date();
  
  return (
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
                  onClick={onCloseRegister} 
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
  );
};

export default RegisterTabs;
