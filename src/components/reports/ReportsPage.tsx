
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/context/DataContext";
import PageTitle from "../common/PageTitle";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"];

const ReportsPage = () => {
  const { bookings, sales, expenses } = useData();
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);

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
      
      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default ReportsPage;
