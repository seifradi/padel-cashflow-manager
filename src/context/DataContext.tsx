
import { 
  MOCK_COURTS, 
  MOCK_PLAYERS, 
  MOCK_PRODUCTS
} from "@/lib/constants";
import { 
  Booking, 
  Court, 
  DailyBalance, 
  Expense, 
  Player,
  Product, 
  ProductCategory,
  Sale 
} from "@/lib/types";
import { ReactNode, createContext, useContext, useState } from "react";

interface DataContextType {
  // Courts
  courts: Court[];
  
  // Players
  players: Player[];
  addPlayer: (player: Omit<Player, 'id'>) => void;
  updatePlayer: (player: Player) => void;
  
  // Products
  products: Product[];
  updateProduct: (product: Product) => void;
  
  // Bookings
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id'>) => Booking;
  updateBooking: (booking: Booking) => void;
  
  // Sales
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id'>) => Sale;
  
  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => Expense;
  
  // Daily Balance
  dailyBalances: DailyBalance[];
  getCurrentDailyBalance: () => DailyBalance | undefined;
  startDay: (startingAmount: number, userId: string) => DailyBalance;
  closeDay: (cashInRegister: number, notes: string, userId: string) => DailyBalance;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [courts, setCourts] = useState<Court[]>(MOCK_COURTS);
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  
  // Properly cast the product categories
  const typedProducts: Product[] = MOCK_PRODUCTS.map(product => ({
    ...product,
    category: product.category as ProductCategory
  }));
  
  const [products, setProducts] = useState<Product[]>(typedProducts);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dailyBalances, setDailyBalances] = useState<DailyBalance[]>([]);

  // Players
  const addPlayer = (player: Omit<Player, 'id'>) => {
    const newPlayer = {
      ...player,
      id: `player-${Date.now()}`
    };
    setPlayers([...players, newPlayer]);
  };

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers(players.map(player => 
      player.id === updatedPlayer.id ? updatedPlayer : player
    ));
  };

  // Products
  const updateProduct = (updatedProduct: Product) => {
    setProducts(products.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
  };

  // Bookings
  const addBooking = (booking: Omit<Booking, 'id'>) => {
    const newBooking = {
      ...booking,
      id: `booking-${Date.now()}`
    };
    setBookings([...bookings, newBooking]);
    return newBooking;
  };

  const updateBooking = (updatedBooking: Booking) => {
    setBookings(bookings.map(booking => 
      booking.id === updatedBooking.id ? updatedBooking : booking
    ));
  };

  // Sales
  const addSale = (sale: Omit<Sale, 'id'>) => {
    const newSale = {
      ...sale,
      id: `sale-${Date.now()}`
    };
    setSales([...sales, newSale]);
    
    // Update product stock
    sale.products.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        updateProduct({
          ...product,
          stock: product.stock - item.quantity
        });
      }
    });
    
    return newSale;
  };

  // Expenses
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: `expense-${Date.now()}`
    };
    setExpenses([...expenses, newExpense]);
    return newExpense;
  };

  // Daily Balance
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
      closedAt: new Date()
    } as DailyBalance;
    
    setDailyBalances(dailyBalances.map(balance => 
      balance.id === updatedBalance.id ? updatedBalance : balance
    ));
    
    return updatedBalance;
  };

  return (
    <DataContext.Provider value={{
      courts,
      players,
      addPlayer,
      updatePlayer,
      products,
      updateProduct,
      bookings,
      addBooking,
      updateBooking,
      sales,
      addSale,
      expenses,
      addExpense,
      dailyBalances,
      getCurrentDailyBalance,
      startDay,
      closeDay
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
