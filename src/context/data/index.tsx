
import { ReactNode } from "react";
import { CourtProvider, useCourts } from "./CourtContext";
import { PlayerProvider, usePlayers } from "./PlayerContext";
import { ProductProvider, useProducts } from "./ProductContext";
import { BookingProvider, useBookings } from "./BookingContext";
import { SaleProvider, useSales } from "./sale/SaleContext";
import { ExpenseProvider, useExpenses } from "./ExpenseContext";
import { DailyBalanceProvider, useDailyBalance } from "./DailyBalanceContext";
import { supabase } from "@/integrations/supabase/client";

// Combined hook to access all data contexts
export const useData = () => {
  const { courts, refreshCourts } = useCourts();
  const { players, addPlayer, updatePlayer, refreshPlayers } = usePlayers();
  const { products, updateProduct, refreshProducts, getProduct, addProduct, deleteProduct } = useProducts();
  const { bookings, addBooking, updateBooking, refreshBookings } = useBookings();
  const { sales, addSale, refreshSales } = useSales();
  const { expenses, addExpense } = useExpenses();
  const { dailyBalances, getCurrentDailyBalance, startDay, closeDay } = useDailyBalance();

  const refreshAllData = async () => {
    await Promise.all([
      refreshCourts(),
      refreshPlayers(),
      refreshProducts(),
      refreshBookings(),
      refreshSales()
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
    getProduct,
    addProduct,
    deleteProduct,
    
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
    
    // Daily Balance
    dailyBalances,
    getCurrentDailyBalance,
    startDay,
    closeDay,
    
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
