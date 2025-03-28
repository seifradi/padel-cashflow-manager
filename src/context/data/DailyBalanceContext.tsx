
import { DailyBalance } from "@/lib/types";
import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

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
  const { translations } = useLanguage();
  const { isAuthenticated } = useAuth();

  // Fetch daily balances from Supabase when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      refreshDailyBalances();
    }
  }, [isAuthenticated]);

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
      toast.error(`${translations.errorFetchingDailyBalances || "Error fetching daily balances"}: ${error.message}`);
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

  const calculateDailyTotal = async () => {
    try {
      // Fetch today's sales directly from Supabase
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Get sales for today
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('created_at', `${todayStr}T00:00:00`)
        .lte('created_at', `${todayStr}T23:59:59`);
      
      if (salesError) throw salesError;
      
      // Get bookings for today
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('total_amount')
        .eq('date', todayStr);
      
      if (bookingsError) throw bookingsError;
      
      // Get expenses for today
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('amount')
        .gte('created_at', `${todayStr}T00:00:00`)
        .lte('created_at', `${todayStr}T23:59:59`);
      
      if (expensesError) throw expensesError;
      
      const salesTotal = salesData?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const bookingsTotal = bookingsData?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0;
      const expensesTotal = expensesData?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
      
      return salesTotal + bookingsTotal - expensesTotal;
    } catch (error) {
      console.error("Error calculating daily total:", error);
      return 0;
    }
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
      toast.error(`${translations.failedToInitializeRegister || "Error starting day"}: ${error.message}`);
      throw error;
    }
  };

  const closeDay = async (cashInRegister: number, notes: string, userId: string) => {
    try {
      // Refresh balances to make sure we have the latest data
      await refreshDailyBalances();
      
      const currentBalance = getCurrentDailyBalance();
      
      if (!currentBalance) {
        throw new Error(translations.noOpenRegister || "No open register found for today");
      }
      
      const calculatedAmount = (currentBalance.startingAmount || 0) + await calculateDailyTotal();
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
      toast.error(`${translations.failedToCloseRegister || "Error closing day"}: ${error.message}`);
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
