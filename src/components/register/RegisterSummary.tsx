
import { useData } from "@/context/DataContext";
import Card from "../common/Card";
import { CalendarDays, ShoppingCart, ReceiptText, CircleDollarSign } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const RegisterSummary = () => {
  const { sales, bookings, expenses, getCurrentDailyBalance } = useData();
  const { translations, formatCurrency } = useLanguage();
  const currentBalance = getCurrentDailyBalance();
  
  if (!currentBalance) return null;
  
  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Filter today's transactions
  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    saleDate.setHours(0, 0, 0, 0);
    return saleDate.getTime() === today.getTime();
  });
  
  const todayBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate.getTime() === today.getTime();
  });
  
  const todayExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.createdAt);
    expenseDate.setHours(0, 0, 0, 0);
    return expenseDate.getTime() === today.getTime();
  });
  
  // Calculate totals
  const salesTotal = todaySales.reduce((total, sale) => total + sale.totalAmount, 0);
  const bookingsTotal = todayBookings.reduce((total, booking) => total + booking.totalAmount, 0);
  const expensesTotal = todayExpenses.reduce((total, expense) => total + expense.amount, 0);
  
  const totalRevenue = salesTotal + bookingsTotal;
  const expectedCash = currentBalance.startingAmount + totalRevenue - expensesTotal;
  
  const summaryCards = [
    {
      title: translations.courtBookings || "Court Bookings",
      amount: bookingsTotal,
      count: todayBookings.length,
      icon: <CalendarDays className="h-4 w-4 text-blue-500" />,
    },
    {
      title: translations.productSales || "Product Sales",
      amount: salesTotal,
      count: todaySales.length,
      icon: <ShoppingCart className="h-4 w-4 text-green-500" />,
    },
    {
      title: translations.expenses || "Expenses",
      amount: expensesTotal,
      count: todayExpenses.length,
      icon: <ReceiptText className="h-4 w-4 text-yellow-500" />,
    },
    {
      title: translations.expectedAmount || "Expected Cash",
      amount: expectedCash,
      highlight: true,
      icon: <CircleDollarSign className="h-4 w-4 text-primary" />,
    },
  ];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {summaryCards.map((card, index) => (
        <Card
          key={index}
          className={`${card.highlight ? 'border-primary/30 bg-primary/5' : ''}`}
          icon={card.icon}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
            {card.icon}
          </div>
          <p className={`text-2xl font-bold ${card.highlight ? 'text-primary' : ''}`}>
            {formatCurrency(card.amount)}
          </p>
          {card.count !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              {card.count} {card.count !== 1 ? 
                (translations.transactions || "transactions") : 
                (translations.transaction || "transaction")}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
};

export default RegisterSummary;
