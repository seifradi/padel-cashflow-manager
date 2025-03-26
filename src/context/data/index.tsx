
import { ReactNode } from "react";
import { CourtProvider, useCourts } from "./CourtContext";
import { PlayerProvider, usePlayers } from "./PlayerContext";
import { ProductProvider, useProducts } from "./ProductContext";
import { BookingProvider, useBookings } from "./BookingContext";
import { SaleProvider, useSales } from "./SaleContext";
import { ExpenseProvider, useExpenses } from "./ExpenseContext";
import { DailyBalanceProvider, useDailyBalance } from "./DailyBalanceContext";
import { supabase } from "@/integrations/supabase/client";

// Combined hook to access all data contexts
export const useData = () => {
  const { courts, refreshCourts } = useCourts();
  const { players, addPlayer, updatePlayer, refreshPlayers } = usePlayers();
  const { products, updateProduct, refreshProducts } = useProducts();
  const { bookings, addBooking, updateBooking, refreshBookings } = useBookings();
  const { sales, addSale, refreshSales } = useSales();
  const { expenses, addExpense, refreshExpenses } = useExpenses();
  const { dailyBalances, getCurrentDailyBalance, startDay, closeDay, refreshBalances } = useDailyBalance();

  const refreshAllData = async () => {
    await Promise.all([
      refreshCourts(),
      refreshPlayers(),
      refreshProducts(),
      refreshBookings(),
      refreshSales(),
      refreshExpenses(),
      refreshBalances()
    ]);
  };

  return {
    // Courts
    courts,
    refreshCourts,
    
    // Players
    players,
    addPlayer,
    updatePlayer,
    refreshPlayers,
    
    // Products
    products,
    updateProduct,
    refreshProducts,
    
    // Bookings
    bookings,
    addBooking,
    updateBooking,
    refreshBookings,
    
    // Sales
    sales,
    addSale,
    refreshSales,
    
    // Expenses
    expenses,
    addExpense,
    refreshExpenses,
    
    // Daily Balance
    dailyBalances,
    getCurrentDailyBalance,
    startDay,
    closeDay,
    refreshBalances,
    
    // Global refresh
    refreshAllData,
    
    // Supabase client for direct access when needed
    supabase
  };
};

// Combined provider that includes all data providers
export const DataProvider = ({ children }: { children: ReactNode }) => {
  return (
    <CourtProvider>
      <PlayerProvider>
        <ProductProvider>
          <BookingProvider>
            <SaleProvider>
              <ExpenseProvider>
                <DailyBalanceProvider>
                  {children}
                </DailyBalanceProvider>
              </ExpenseProvider>
            </SaleProvider>
          </BookingProvider>
        </ProductProvider>
      </PlayerProvider>
    </CourtProvider>
  );
};
