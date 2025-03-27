
import { ReactNode } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { CourtProvider, useCourts } from "./CourtContext";
import { PlayerProvider, usePlayers } from "./PlayerContext";
import { BookingProvider, useBookings } from "./BookingContext";
import { ProductProvider, useProducts } from "./ProductContext";
import { SaleProvider, useSales } from "./SaleContext";
import { ExpenseProvider, useExpenses } from "./ExpenseContext";
import { DailyBalanceProvider, useDailyBalance } from "./DailyBalanceContext";
import { createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";

// Create a combined context to access all data providers
interface DataContextType {
  courts: ReturnType<typeof useCourts>;
  players: ReturnType<typeof usePlayers>;
  bookings: ReturnType<typeof useBookings>;
  products: ReturnType<typeof useProducts>;
  sales: ReturnType<typeof useSales>;
  expenses: ReturnType<typeof useExpenses>;
  dailyBalance: ReturnType<typeof useDailyBalance>;
  supabase: SupabaseClient;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  return (
    <CourtProvider>
      <PlayerProvider>
        <BookingProvider>
          <ProductProvider>
            <SaleProvider>
              <ExpenseProvider>
                <DailyBalanceProvider>
                  <DataProviderInner>{children}</DataProviderInner>
                </DailyBalanceProvider>
              </ExpenseProvider>
            </SaleProvider>
          </ProductProvider>
        </BookingProvider>
      </PlayerProvider>
    </CourtProvider>
  );
};

const DataProviderInner = ({ children }: { children: ReactNode }) => {
  const courts = useCourts();
  const players = usePlayers();
  const bookings = useBookings();
  const products = useProducts();
  const sales = useSales();
  const expenses = useExpenses();
  const dailyBalance = useDailyBalance();
  
  return (
    <DataContext.Provider
      value={{
        courts,
        players,
        bookings,
        products,
        sales,
        expenses,
        dailyBalance,
        supabase
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  
  return {
    ...context.courts,
    ...context.players,
    ...context.bookings,
    ...context.products,
    ...context.sales,
    ...context.expenses,
    ...context.dailyBalance,
    supabase: context.supabase,
  };
};
