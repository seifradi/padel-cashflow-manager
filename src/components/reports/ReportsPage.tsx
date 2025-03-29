
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useData } from "@/context/DataContext";
import PageTitle from "../common/PageTitle";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  format, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay,
  isThisWeek,
  isThisMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay
} from "date-fns";
import { Button } from "../ui/button";
import { DailyBalance } from "@/lib/types";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"];

const ReportsPage = () => {
  const { bookings, sales, expenses, dailyBalances } = useData();
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const [registersTimeframe, setRegistersTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [filteredBalances, setFilteredBalances] = useState<DailyBalance[]>([]);

  // Helper to format money
  const formatMoney = (amount: number) => {
    return amount.toFixed(2) + " TNd";
  };

  // Calculate total revenue
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0) +
    bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate total profit
  const totalProfit = totalRevenue - totalExpenses;

  // Calculate total bookings
  const totalBookingsCount = bookings.length;

  // Filter registers based on timeframe
  useEffect(() => {
    const today = new Date();
    let filtered: DailyBalance[] = [];

    switch (registersTimeframe) {
      case 'daily':
        filtered = dailyBalances.filter(balance => {
          const balanceDate = new Date(balance.date);
          return isSameDay(balanceDate, today);
        });
        break;
      case 'weekly':
        filtered = dailyBalances.filter(balance => {
          const balanceDate = new Date(balance.date);
          return isThisWeek(balanceDate, { weekStartsOn: 1 });
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'monthly':
        filtered = dailyBalances.filter(balance => {
          const balanceDate = new Date(balance.date);
          return isThisMonth(balanceDate);
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }

    setFilteredBalances(filtered);
  }, [registersTimeframe, dailyBalances]);

  // Generate daily revenue data for the past 30 days
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    
    const days = eachDayOfInterval({
      start: thirtyDaysAgo,
      end: today
    });
    
    const data = days.map(day => {
      const dayBookings = bookings.filter(booking => 
        isSameDay(new Date(booking.date), day)
      );
      
      const daySales = sales.filter(sale => 
        isSameDay(new Date(sale.createdAt), day)
      );
      
      const bookingRevenue = dayBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
      const salesRevenue = daySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      
      return {
        date: format(day, "MMM dd"),
        bookings: bookingRevenue,
        sales: salesRevenue,
        total: bookingRevenue + salesRevenue
      };
    });
    
    setDailyData(data);
  }, [bookings, sales]);

  // Generate sales by product category data
  useEffect(() => {
    // This would need to be enhanced with real sale item data
    // For now, just create sample data based on sales count
    const sampleCategories = [
      { name: 'Drinks', value: sales.length * 0.4 },
      { name: 'Food', value: sales.length * 0.3 },
      { name: 'Equipment', value: sales.length * 0.2 },
      { name: 'Other', value: sales.length * 0.1 }
    ];
    
    setSalesData(sampleCategories);
  }, [sales]);

  // Generate most popular products data
  useEffect(() => {
    // This would need to be enhanced with real sale item data
    // For now, just create sample data
    const sampleProducts = [
      { name: 'Water', sales: bookings.length * 2 },
      { name: 'Soda', sales: bookings.length * 1.5 },
      { name: 'Energy Drink', sales: bookings.length * 1.2 },
      { name: 'Snack', sales: bookings.length * 0.8 },
      { name: 'Padel Rental', sales: bookings.length * 0.6 }
    ];
    
    setProductData(sampleProducts);
  }, [bookings]);

  // Calculate total discrepancy for filtered balances
  const totalDiscrepancy = filteredBalances.reduce((total, balance) => {
    return total + balance.difference;
  }, 0);

  return (
    <div className="space-y-6">
      <PageTitle 
        title="Financial Reports" 
        subtitle="Track revenue, sales and financial performance"
      />
      
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From bookings and sales
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All recorded expenses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatMoney(totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue minus expenses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookingsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All court reservations
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="registers">Registers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} TNd`, undefined]} />
                    <Legend />
                    <Bar dataKey="bookings" name="Court Bookings" fill="#8884d8" />
                    <Bar dataKey="sales" name="Product Sales" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {salesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={productData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Sales Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyData.slice(-14)} // Last 14 days
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} TNd`, undefined]} />
                    <Legend />
                    <Line type="monotone" dataKey="sales" name="Product Sales" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyData.slice(-14)} // Last 14 days
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} TNd`, undefined]} />
                    <Legend />
                    <Line type="monotone" dataKey="bookings" name="Court Bookings" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="registers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cashier Register Reports</CardTitle>
                <Select
                  value={registersTimeframe}
                  onValueChange={(value) => setRegistersTimeframe(value as 'daily' | 'weekly' | 'monthly')}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredBalances.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Card className="bg-slate-50">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total Registers
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="text-2xl font-bold">{filteredBalances.length}</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-50">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total Cash Handled
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="text-2xl font-bold">
                          {formatMoney(filteredBalances.reduce((sum, balance) => sum + balance.cashInRegister, 0))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-50">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total Discrepancy
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className={`text-2xl font-bold ${totalDiscrepancy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {totalDiscrepancy >= 0 ? '+' : ''}{formatMoney(totalDiscrepancy)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Table>
                    <TableCaption>
                      Cash register reports for {registersTimeframe} period
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Cashier</TableHead>
                        <TableHead>Starting</TableHead>
                        <TableHead>Calculated</TableHead>
                        <TableHead>Actual</TableHead>
                        <TableHead className="text-right">Difference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBalances.map((balance) => (
                        <TableRow key={balance.id}>
                          <TableCell>
                            {format(new Date(balance.date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            {balance.closedBy.substring(0, 8)}...
                          </TableCell>
                          <TableCell>
                            {formatMoney(balance.startingAmount)}
                          </TableCell>
                          <TableCell>
                            {formatMoney(balance.calculatedAmount)}
                          </TableCell>
                          <TableCell>
                            {formatMoney(balance.cashInRegister)}
                          </TableCell>
                          <TableCell className={`text-right ${balance.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {balance.difference >= 0 ? '+' : ''}{formatMoney(balance.difference)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-4">No register data found for the selected timeframe</p>
                  <Button variant="outline">Export Report</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
