
import { DailyBalance } from "@/lib/types";
import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { useBookings } from "./BookingContext";
import { useSales } from "./SaleContext";
import { useExpenses } from "./ExpenseContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface DailyBalanceContextType {
  dailyBalances: DailyBalance[];
  getCurrentDailyBalance: () => DailyBalance | undefined;
  startDay: (startingAmount: number, userId: string) => Promise<DailyBalance>;
  closeDay: (cashInRegister: number, notes: string, userId: string) => Promise<DailyBalance>;
  isRegisterOpen: () => boolean;
  refreshDailyBalances: () => Promise<void>;
}

const DailyBalanceContext = createContext<DailyBalanceContextType | undefined>(undefined);

export const DailyBalanceProvider = ({ children }: { children: ReactNode }) => {
  const [dailyBalances, setDailyBalances] = useState<DailyBalance[]>([]);
  const { bookings, refreshBookings } = useBookings();
  const { sales, refreshSales } = useSales();
  const { expenses, refreshExpenses } = useExpenses();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Fetch daily balances from Supabase when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData();
    }
  }, [isAuthenticated]);

  const refreshAllData = async () => {
    try {
      await Promise.all([
        refreshDailyBalances(),
        refreshSales(),
        refreshBookings(),
        refreshExpenses()
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const refreshDailyBalances = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_balances')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Convert Supabase data to our app's DailyBalance type
      const typedBalances: DailyBalance[] = data.map(balance => ({
        id: balance.id,
        date: new Date(balance.date),
        startingAmount: balance.starting_amount,
        cashInRegister: balance.cash_in_register,
        calculatedAmount: balance.calculated_amount,
        difference: balance.difference,
        notes: balance.notes || undefined,
        verifiedBy: balance.verified_by,
        verifiedAt: balance.verified_at ? new Date(balance.verified_at) : undefined,
        closedBy: balance.closed_by,
        closedAt: new Date(balance.closed_at)
      }));
      
      setDailyBalances(typedBalances);
    } catch (error: any) {
      console.error('Error fetching daily balances:', error);
      toast({
        title: "Error fetching daily balances",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getCurrentDailyBalance = () => {
    // Check if there's a balance for today that hasn't been closed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dailyBalances.find(balance => {
      const balanceDate = new Date(balance.date);
      balanceDate.setHours(0, 0, 0, 0);
      return balanceDate.getTime() === today.getTime() && !balance.verifiedAt;
    });
  };

  const isRegisterOpen = () => {
    return !!getCurrentDailyBalance();
  };

  const calculateDailyTotal = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate sales for today
    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });
    
    // Calculate earnings from today's court bookings
    const todayBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === today.getTime();
    });
    
    // Calculate expenses for today
    const todayExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.createdAt);
      expenseDate.setHours(0, 0, 0, 0);
      return expenseDate.getTime() === today.getTime();
    });
    
    const salesTotal = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const bookingsTotal = todayBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const expensesTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return salesTotal + bookingsTotal - expensesTotal;
  };

  const startDay = async (startingAmount: number, userId: string) => {
    try {
      const today = new Date();
      
      // Insert new daily balance record into Supabase
      const { data, error } = await supabase
        .from('daily_balances')
        .insert({
          date: today.toISOString().split('T')[0],
          starting_amount: startingAmount,
          cash_in_register: startingAmount,
          calculated_amount: startingAmount,
          difference: 0,
          closed_by: userId,
          closed_at: today.toISOString()
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Convert to our app's DailyBalance type
      const newBalance: DailyBalance = {
        id: data.id,
        date: new Date(data.date),
        startingAmount: data.starting_amount,
        cashInRegister: data.cash_in_register,
        calculatedAmount: data.calculated_amount,
        difference: data.difference,
        closedBy: data.closed_by,
        closedAt: new Date(data.closed_at)
      };
      
      // Update local state
      setDailyBalances(prevBalances => [newBalance, ...prevBalances]);
      
      return newBalance;
    } catch (error: any) {
      console.error('Error starting day:', error);
      toast({
        title: "Error starting day",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const closeDay = async (cashInRegister: number, notes: string, userId: string) => {
    try {
      // Refresh all data to make sure calculations are accurate
      await refreshAllData();
      
      const currentBalance = getCurrentDailyBalance();
      
      if (!currentBalance) {
        throw new Error("No open register found for today");
      }
      
      const calculatedAmount = (currentBalance.startingAmount || 0) + calculateDailyTotal();
      const difference = cashInRegister - calculatedAmount;
      
      // Update the daily balance record in Supabase
      const { data, error } = await supabase
        .from('daily_balances')
        .update({
          cash_in_register: cashInRegister,
          calculated_amount: calculatedAmount,
          difference: difference,
          notes: notes,
          verified_by: userId,
          verified_at: new Date().toISOString()
        })
        .eq('id', currentBalance.id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Convert to our app's DailyBalance type
      const updatedBalance: DailyBalance = {
        id: data.id,
        date: new Date(data.date),
        startingAmount: data.starting_amount,
        cashInRegister: data.cash_in_register,
        calculatedAmount: data.calculated_amount,
        difference: data.difference,
        notes: data.notes,
        verifiedBy: data.verified_by,
        verifiedAt: data.verified_at ? new Date(data.verified_at) : undefined,
        closedBy: data.closed_by,
        closedAt: new Date(data.closed_at)
      };
      
      // Update local state
      setDailyBalances(prevBalances =>
        prevBalances.map(balance =>
          balance.id === updatedBalance.id ? updatedBalance : balance
        )
      );
      
      return updatedBalance;
    } catch (error: any) {
      console.error('Error closing day:', error);
      toast({
        title: "Error closing day",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <DailyBalanceContext.Provider value={{
      dailyBalances,
      getCurrentDailyBalance,
      startDay,
      closeDay,
      isRegisterOpen,
      refreshDailyBalances
    }}>
      {children}
    </DailyBalanceContext.Provider>
  );
};

export const useDailyBalance = () => {
  const context = useContext(DailyBalanceContext);
  if (context === undefined) {
    throw new Error("useDailyBalance must be used within a DailyBalanceProvider");
  }
  return context;
};
