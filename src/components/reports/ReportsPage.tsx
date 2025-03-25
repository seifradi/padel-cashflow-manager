import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/context/DataContext";
import { Expense, ReportTimeframe, Sale, StatsSummary } from "@/lib/types";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Calendar, Download, TrendingUp, LineChart, BarChart, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import StatusBadge from "../common/StatusBadge";
import PageTitle from "../common/PageTitle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ReportsPage = () => {
  const { bookings, sales, expenses, dailyBalances } = useData();
  const [timeframe, setTimeframe] = useState<ReportTimeframe>("daily");
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(),
  });
  
  // Set date range based on timeframe selection
  const handleTimeframeChange = (value: ReportTimeframe) => {
    setTimeframe(value);
    
    const today = new Date();
    
    switch (value) {
      case "daily":
        setDateRange({ start: today, end: today });
        break;
      case "weekly":
        setDateRange({
          start: startOfWeek(today, { weekStartsOn: 1 }),
          end: endOfWeek(today, { weekStartsOn: 1 }),
        });
        break;
      case "monthly":
        setDateRange({
          start: startOfMonth(today),
          end: endOfMonth(today),
        });
        break;
      default:
        setDateRange({ start: today, end: today });
    }
  };
  
  // Filter bookings by date range
  const filterBookingsByDateRange = (data: typeof bookings) => {
    const start = new Date(dateRange.start);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);
    
    return data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= start && itemDate <= end;
    });
  };
  
  // Filter sales by date range (using createdAt field)
  const filterSalesByDateRange = (data: typeof sales) => {
    const start = new Date(dateRange.start);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);
    
    return data.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= start && itemDate <= end;
    });
  };
  
  // Filter expenses by date range (using createdAt field)
  const filterExpensesByDateRange = (data: typeof expenses) => {
    const start = new Date(dateRange.start);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);
    
    return data.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= start && itemDate <= end;
    });
  };
  
  // Filter daily balances by date range
  const filterBalancesByDateRange = (data: typeof dailyBalances) => {
    const start = new Date(dateRange.start);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);
    
    return data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= start && itemDate <= end;
    });
  };
  
  // Calculate statistics based on filtered data
  const calculateStats = (): StatsSummary => {
    const filteredBookings = filterBookingsByDateRange(bookings);
    const filteredSales = filterSalesByDateRange(sales);
    const filteredExpenses = filterExpensesByDateRange(expenses);
    
    const bookingsRevenue = filteredBookings.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );
    
    const salesRevenue = filteredSales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0
    );
    
    const totalExpenses = filteredExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    
    const totalRevenue = bookingsRevenue + salesRevenue;
    
    return {
      totalRevenue,
      totalBookings: filteredBookings.length,
      averageBookingValue:
        filteredBookings.length > 0
          ? bookingsRevenue / filteredBookings.length
          : 0,
      totalSales: salesRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
    };
  };
  
  // Get statistics
  const stats = calculateStats();
  
  // Format date range for display
  const formatDateRange = () => {
    if (timeframe === "daily") {
      return format(dateRange.start, "EEEE, MMMM d, yyyy");
    } else {
      return `${format(dateRange.start, "MMM d, yyyy")} - ${format(
        dateRange.end,
        "MMM d, yyyy"
      )}`;
    }
  };
  
  // Get filtered data
  const filteredBookings = filterBookingsByDateRange(bookings);
  const filteredSales = filterSalesByDateRange(sales);
  const filteredExpenses = filterExpensesByDateRange(expenses);
  const filteredBalances = filterBalancesByDateRange(dailyBalances);
  
  return (
    <div className="space-y-6">
      <PageTitle 
        title="Financial Reports" 
        subtitle="View and analyze your business performance"
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-in">
        <div className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground">
            Showing data for: <span className="font-medium text-foreground">{formatDateRange()}</span>
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={timeframe}
            onValueChange={(value) => handleTimeframeChange(value as ReportTimeframe)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent className="pointer-events-auto">
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="animate-slide-in [animation-delay:100ms]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-primary" />
              Total Revenue
            </CardTitle>
            <CardDescription>
              {timeframe === "daily" ? "Today's" : "Period"} earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRevenue.toFixed(2)} TNd
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <ArrowUp className="mr-1 h-3 w-3 inline text-green-600" />
              +8.2% from previous period
            </p>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-in [animation-delay:150ms]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <LineChart className="mr-2 h-4 w-4 text-primary" />
              Net Profit
            </CardTitle>
            <CardDescription>
              After expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.netProfit.toFixed(2)} TNd
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <ArrowUp className="mr-1 h-3 w-3 inline text-green-600" />
              +5.1% from previous period
            </p>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-in [animation-delay:200ms]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <BarChart className="mr-2 h-4 w-4 text-primary" />
              Total Expenses
            </CardTitle>
            <CardDescription>
              All operating costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalExpenses.toFixed(2)} TNd
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <ArrowDown className="mr-1 h-3 w-3 inline text-green-600" />
              -2.3% from previous period
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden animate-slide-in [animation-delay:250ms]">
        <div className="p-6">
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookings">Court Bookings</TabsTrigger>
              <TabsTrigger value="sales">Product Sales</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="balances">Daily Balances</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Total Revenue</span>
                      <span className="font-medium">{stats.totalRevenue.toFixed(2)} TNd</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Court Bookings Revenue</span>
                      <span className="font-medium">
                        {filteredBookings.reduce((sum, booking) => sum + booking.totalAmount, 0).toFixed(2)} TNd
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Product Sales Revenue</span>
                      <span className="font-medium">
                        {stats.totalSales.toFixed(2)} TNd
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Total Expenses</span>
                      <span className="font-medium">{stats.totalExpenses.toFixed(2)} TNd</span>
                    </div>
                    <div className="flex justify-between py-2 font-semibold">
                      <span>Net Profit</span>
                      <span>{stats.netProfit.toFixed(2)} TNd</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Activity Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Total Bookings</span>
                      <span className="font-medium">{stats.totalBookings}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Average Booking Value</span>
                      <span className="font-medium">
                        {stats.averageBookingValue.toFixed(2)} TNd
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Product Sales Transactions</span>
                      <span className="font-medium">{filteredSales.length}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Expense Entries</span>
                      <span className="font-medium">{filteredExpenses.length}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Profit Margin</span>
                      <span className="font-medium">
                        {stats.totalRevenue > 0
                          ? `${((stats.netProfit / stats.totalRevenue) * 100).toFixed(1)}%`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Revenue chart will be displayed here
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="bookings" className="mt-0">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Court</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            {format(new Date(booking.date), "MMM d, yyyy")}
                            <div className="text-xs text-muted-foreground">
                              {booking.startTime} - {booking.endTime}
                            </div>
                          </TableCell>
                          <TableCell>Court {booking.courtId.split("-")[1]}</TableCell>
                          <TableCell className="capitalize">{booking.type}</TableCell>
                          <TableCell>
                            <StatusBadge
                              status={
                                booking.status === "completed"
                                  ? "success"
                                  : booking.status === "cancelled"
                                  ? "error"
                                  : booking.status === "confirmed"
                                  ? "info"
                                  : "default"
                              }
                            >
                              {booking.status}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {booking.totalAmount.toFixed(2)} TNd
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No bookings found for this period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="sales" className="mt-0">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.length > 0 ? (
                      filteredSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>
                            {format(new Date(sale.createdAt), "MMM d, yyyy h:mm a")}
                          </TableCell>
                          <TableCell>
                            {sale.products.length} items
                            <div className="text-xs text-muted-foreground">
                              {sale.products.map((p) => p.quantity).reduce((a, b) => a + b, 0)} units total
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{sale.paymentMethod}</TableCell>
                          <TableCell className="text-right font-medium">
                            {sale.totalAmount.toFixed(2)} TNd
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No sales found for this period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="expenses" className="mt-0">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.length > 0 ? (
                      filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>
                            {format(new Date(expense.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell className="capitalize">{expense.category}</TableCell>
                          <TableCell className="text-right font-medium">
                            {expense.amount.toFixed(2)} TNd
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No expenses found for this period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="balances" className="mt-0">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Starting Amount</TableHead>
                      <TableHead>Cash in Register</TableHead>
                      <TableHead>Calculated Amount</TableHead>
                      <TableHead>Difference</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBalances.length > 0 ? (
                      filteredBalances.map((balance) => (
                        <TableRow key={balance.id}>
                          <TableCell>
                            {format(new Date(balance.date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{balance.startingAmount.toFixed(2)} TNd</TableCell>
                          <TableCell>{balance.cashInRegister.toFixed(2)} TNd</TableCell>
                          <TableCell>{balance.calculatedAmount.toFixed(2)} TNd</TableCell>
                          <TableCell>
                            {balance.difference === 0 ? (
                              "0.00 TNd"
                            ) : balance.difference > 0 ? (
                              <span className="text-green-600">+{balance.difference.toFixed(2)} TNd</span>
                            ) : (
                              <span className="text-red-600">{balance.difference.toFixed(2)} TNd</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {balance.difference === 0 ? (
                              <StatusBadge status="success">Balanced</StatusBadge>
                            ) : Math.abs(balance.difference) < 5 ? (
                              <StatusBadge status="warning">Minor Discrepancy</StatusBadge>
                            ) : (
                              <StatusBadge status="error">Major Discrepancy</StatusBadge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No balance records found for this period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
