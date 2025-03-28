
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// This is kept for backward compatibility
// New components should use the useLanguage hook instead
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function calculateProfit(price: number, cost: number): number {
  return price - cost
}

export function calculateProfitMargin(price: number, cost: number): number {
  if (cost === 0) return 100
  return ((price - cost) / cost) * 100
}

export function generateProductCode(): string {
  return `PROD-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
}

export function isToday(date: Date): boolean {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

export function calculateDifference(amount1: number, amount2: number): {
  difference: number,
  isShortage: boolean,
  isExcess: boolean,
  isBalanced: boolean
} {
  const difference = Math.abs(amount1 - amount2)
  return {
    difference,
    isShortage: amount1 > amount2,
    isExcess: amount1 < amount2,
    isBalanced: Math.abs(amount1 - amount2) < 0.5
  }
}

export function calculateDailyTotals(
  sales: any[], 
  bookings: any[], 
  expenses: any[], 
  startingAmount: number = 0
) {
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
  const netAmount = totalRevenue - expensesTotal;
  const expectedCash = startingAmount + netAmount;
  
  return {
    salesTotal,
    bookingsTotal,
    expensesTotal,
    totalRevenue,
    netAmount,
    expectedCash,
    salesCount: todaySales.length,
    bookingsCount: todayBookings.length,
    expensesCount: todayExpenses.length
  };
}
