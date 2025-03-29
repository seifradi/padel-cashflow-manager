
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { CalendarDays, CreditCard, ReceiptText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Card from "../common/Card";
import PageTitle from "../common/PageTitle";
import BookingForm from "../bookings/BookingForm";
import SalesForm from "../sales/SalesForm";
import AmountInput from "../common/AmountInput";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import ClosedRegisterView from "./ClosedRegisterView";

const CashRegisterPage = () => {
  const { user } = useAuth();
  const { getCurrentDailyBalance, startDay, closeDay } = useData();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [startingAmount, setStartingAmount] = useState(0);
  const [closingAmount, setClosingAmount] = useState(0);
  const [closingNotes, setClosingNotes] = useState("");
  
  const currentBalance = getCurrentDailyBalance();
  const today = new Date();
  const isRegisterClosed = currentBalance?.verifiedAt != null;
  
  const handleStartDay = () => {
    if (startingAmount <= 0) {
      toast.error("Starting amount must be greater than zero");
      return;
    }
    
    setIsInitializing(true);
    
    try {
      startDay(startingAmount, user?.id || "");
      toast.success("Cash register initialized successfully");
      setIsInitializing(false);
    } catch (error) {
      toast.error("Failed to initialize cash register");
      console.error(error);
      setIsInitializing(false);
    }
  };
  
  const handleCloseDay = () => {
    if (closingAmount <= 0) {
      toast.error("Closing amount must be greater than zero");
      return;
    }
    
    setIsClosing(true);
    
    try {
      const result = closeDay(closingAmount, closingNotes, user?.id || "");
      
      if (Math.abs(result.difference) > 0) {
        const diffMessage = result.difference > 0 
          ? `Excess of ${result.difference} TNd` 
          : `Shortage of ${Math.abs(result.difference)} TNd`;
        
        toast.warning(`Cash register closed with discrepancy: ${diffMessage}`);
      } else {
        toast.success("Cash register closed successfully");
      }
      
      setIsClosing(false);
      setClosingAmount(0);
      setClosingNotes("");
    } catch (error) {
      toast.error("Failed to close cash register");
      console.error(error);
      setIsClosing(false);
    }
  };
  
  if (!currentBalance) {
    return (
      <div className="space-y-6">
        <PageTitle 
          title="Cash Register" 
          subtitle="Initialize the cash register to start accepting bookings and sales" 
        />
        
        <Card
          title="Initialize Cash Register"
          subtitle={`Start a new day (${format(today, "EEEE, MMMM d, yyyy")})`}
          className="max-w-md mx-auto animate-slide-in"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Starting Amount</label>
              <AmountInput
                value={startingAmount}
                onChange={setStartingAmount}
                min={0}
              />
            </div>
            
            <Button 
              onClick={handleStartDay} 
              className="w-full"
              disabled={isInitializing}
            >
              {isInitializing ? "Initializing..." : "Start Day"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isRegisterClosed) {
    return (
      <div className="space-y-6">
        <PageTitle 
          title="Cash Register" 
          subtitle="View closed register details and summary" 
        />
        <ClosedRegisterView balance={currentBalance} />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <PageTitle 
        title="Cash Register" 
        subtitle="Manage court bookings, products sales, and daily balance" 
      />
      
      <Tabs defaultValue="bookings" className="space-y-6 animate-fade-in">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>Court Bookings</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Product Sales</span>
          </TabsTrigger>
          <TabsTrigger value="balance" className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4" />
            <span>Daily Balance</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings" className="mt-6">
          <BookingForm />
        </TabsContent>
        
        <TabsContent value="sales" className="mt-6">
          <SalesForm />
        </TabsContent>
        
        <TabsContent value="balance" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              title="Starting Balance"
              className="animate-slide-in [animation-delay:0ms]"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Starting Amount:</span>
                  <span className="font-medium">{currentBalance.startingAmount} TNd</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Started At:</span>
                  <span className="font-medium">{format(new Date(currentBalance.closedAt), "h:mm a")}</span>
                </div>
              </div>
            </Card>
            
            <Card
              title="Current Balance"
              className="animate-slide-in [animation-delay:100ms]"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{format(today, "EEEE, MMM d")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{format(today, "h:mm a")}</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="text-xl font-semibold text-center">
                    Still Open
                  </div>
                </div>
              </div>
            </Card>
            
            <Card
              title="Close Register"
              className="animate-slide-in [animation-delay:200ms]"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Cash in Register</label>
                  <AmountInput
                    value={closingAmount}
                    onChange={setClosingAmount}
                    min={0}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Input
                    placeholder="Add any notes about today's balance"
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleCloseDay} 
                  className="w-full"
                  disabled={isClosing}
                >
                  {isClosing ? "Closing..." : "Close Register"}
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashRegisterPage;
