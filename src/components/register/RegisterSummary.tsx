
import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { CalendarDays, Calculator, Check, Clock, DollarSign, AlertCircle } from "lucide-react";
import Card from "../common/Card";
import { Skeleton } from "../ui/skeleton";

interface RegisterSummaryProps {
  onClose?: () => void;
}

const RegisterSummary = ({ onClose }: RegisterSummaryProps) => {
  const { bookings, sales, expenses, getCurrentDailyBalance } = useData();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalBookings: 0,
    totalSales: 0,
    totalExpenses: 0,
    totalTransactions: 0,
    netAmount: 0
  });
  
  const currentBalance = getCurrentDailyBalance();
  const today = new Date();
  
  useEffect(() => {
    if (!currentBalance) return;
    
    // Calculate summary
    const todayBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      bookingDate.setHours(0, 0, 0, 0);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === todayDate.getTime();
    });
    
    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      saleDate.setHours(0, 0, 0, 0);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === todayDate.getTime();
    });
    
    const todayExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.createdAt);
      expenseDate.setHours(0, 0, 0, 0);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      return expenseDate.getTime() === todayDate.getTime();
    });
    
    const bookingsTotal = todayBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const salesTotal = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const expensesTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    setSummary({
      totalBookings: bookingsTotal,
      totalSales: salesTotal,
      totalExpenses: expensesTotal,
      totalTransactions: todayBookings.length + todaySales.length + todayExpenses.length,
      netAmount: bookingsTotal + salesTotal - expensesTotal
    });
    
    setIsLoading(false);
  }, [bookings, sales, expenses, currentBalance]);
  
  if (!currentBalance) return null;
  
  return (
    <Card 
      title="Today's Summary" 
      className="w-full mb-6"
      icon={<Calculator className="h-5 w-5 text-primary" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>Date:</span>
            <span className="ml-auto font-medium text-foreground">
              {format(today, "EEEE, MMMM d, yyyy")}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>Register opened at:</span>
            <span className="ml-auto font-medium text-foreground">
              {format(new Date(currentBalance.closedAt), "h:mm a")}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="mr-2 h-4 w-4" />
            <span>Starting amount:</span>
            <span className="ml-auto font-medium text-foreground">
              {formatCurrency(currentBalance.startingAmount)}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </>
          ) : (
            <>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>Court bookings:</span>
                <span className="ml-auto font-medium text-foreground">
                  {formatCurrency(summary.totalBookings)}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <span>Product sales:</span>
                <span className="ml-auto font-medium text-foreground">
                  {formatCurrency(summary.totalSales)}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <span>Expenses:</span>
                <span className="ml-auto font-medium text-destructive">
                  -{formatCurrency(summary.totalExpenses)}
                </span>
              </div>
            </>
          )}
        </div>
        
        <div className="space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-8 w-full mt-4" />
            </>
          ) : (
            <>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>Total transactions:</span>
                <span className="ml-auto font-medium text-foreground">
                  {summary.totalTransactions}
                </span>
              </div>
              
              <div className="flex items-center font-medium">
                <span>Expected in register:</span>
                <span className="ml-auto text-lg">
                  {formatCurrency(currentBalance.startingAmount + summary.netAmount)}
                </span>
              </div>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  Close Register
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RegisterSummary;
