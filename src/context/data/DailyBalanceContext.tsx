
import { DailyBalance } from "@/lib/types";
import { ReactNode, createContext, useContext, useState } from "react";
import { useBookings } from "./BookingContext";
import { useSales } from "./sale/useSaleContext";
import { useExpenses } from "./ExpenseContext";

interface DailyBalanceContextType {
  dailyBalances: DailyBalance[];
  getCurrentDailyBalance: () => DailyBalance | undefined;
  startDay: (startingAmount: number, userId: string) => DailyBalance;
  closeDay: (cashInRegister: number, notes: string, userId: string) => DailyBalance;
}

const DailyBalanceContext = createContext<DailyBalanceContextType | undefined>(undefined);

export const DailyBalanceProvider = ({ children }: { children: ReactNode }) => {
  const [dailyBalances, setDailyBalances] = useState<DailyBalance[]>([]);
  const { bookings } = useBookings();
  const { sales } = useSales();
  const { expenses } = useExpenses();

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

  const startDay = (startingAmount: number, userId: string) => {
    const newBalance: DailyBalance = {
      id: `balance-${Date.now()}`,
      date: new Date(),
      startingAmount,
      cashInRegister: startingAmount,
      calculatedAmount: startingAmount,
      difference: 0,
      closedBy: userId,
      closedAt: new Date()
    };
    
    setDailyBalances([...dailyBalances, newBalance]);
    return newBalance;
  };

  const closeDay = (cashInRegister: number, notes: string, userId: string) => {
    const currentBalance = getCurrentDailyBalance();
    const calculatedAmount = (currentBalance?.startingAmount || 0) + calculateDailyTotal();
    const difference = cashInRegister - calculatedAmount;
    const now = new Date();
    
    const updatedBalance: DailyBalance = {
      ...(currentBalance || {
        id: `balance-${Date.now()}`,
        date: new Date(),
        startingAmount: 0,
      }),
      cashInRegister,
      calculatedAmount,
      difference,
      notes,
      closedBy: userId,
      closedAt: now,
      verifiedBy: userId,
      verifiedAt: now
    } as DailyBalance;
    
    setDailyBalances(dailyBalances.map(balance => 
      balance.id === updatedBalance.id ? updatedBalance : balance
    ));
    
    return updatedBalance;
  };

  return (
    <DailyBalanceContext.Provider value={{
      dailyBalances,
      getCurrentDailyBalance,
      startDay,
      closeDay
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
