
import { ReactNode } from "react";
import { CourtProvider, useCourts } from "./CourtContext";
import { PlayerProvider, usePlayers } from "./PlayerContext";
import { ProductProvider, useProducts } from "./ProductContext";
import { BookingProvider, useBookings } from "./BookingContext";
import { SaleProvider, useSales } from "./SaleContext";
import { ExpenseProvider, useExpenses } from "./ExpenseContext";
import { DailyBalanceProvider, useDailyBalance } from "./DailyBalanceContext";

// Combined hook to access all data contexts
export const useData = () => {
  const { courts } = useCourts();
  const { players, addPlayer, updatePlayer } = usePlayers();
  const { products, updateProduct } = useProducts();
  const { bookings, addBooking, updateBooking } = useBookings();
  const { sales, addSale } = useSales();
  const { expenses, addExpense } = useExpenses();
  const { dailyBalances, getCurrentDailyBalance, startDay, closeDay } = useDailyBalance();

  return {
    // Courts
    courts,
    
    // Players
    players,
    addPlayer,
    updatePlayer,
    
    // Products
    products,
    updateProduct,
    
    // Bookings
    bookings,
    addBooking,
    updateBooking,
    
    // Sales
    sales,
    addSale,
    
    // Expenses
    expenses,
    addExpense,
    
    // Daily Balance
    dailyBalances,
    getCurrentDailyBalance,
    startDay,
    closeDay
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
