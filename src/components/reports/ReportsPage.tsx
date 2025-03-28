import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/context/DataContext";
import PageTitle from "../common/PageTitle";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import CashRegisterReports from "./CashRegisterReports";
import { useLanguage } from "@/context/LanguageContext";
import { BarChart3, DollarSign, ShoppingCart } from "lucide-react";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"];

const ReportsPage = () => {
  const { bookings, sales, expenses } = useData();
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const { formatCurrency, translations } = useLanguage();

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0) +
    bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const totalProfit = totalRevenue - totalExpenses;

  const totalBookingsCount = bookings.length;

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

  useEffect(() => {
    const sampleCategories = [
      { name: translations.drinks, value: sales.length * 0.4 },
      { name: translations.food, value: sales.length * 0.3 },
      { name: translations.equipment, value: sales.length * 0.2 },
      { name: translations.other, value: sales.length * 0.1 }
    ];
    
    setSalesData(sampleCategories);
  }, [sales, translations]);

  useEffect(() => {
    const sampleProducts = [
      { name: translations.water, sales: bookings.length * 2 },
      { name: translations.soda, sales: bookings.length * 1.5 },
      { name: translations.energyDrink, sales: bookings.length * 1.2 },
      { name: translations.snack, sales: bookings.length * 0.8 },
      { name: translations.padelRental, sales: bookings.length * 0.6 }
    ];
    
    setProductData(sampleProducts);
  }, [bookings, translations]);

  return (
    <div className="space-y-6">
      <PageTitle 
        title={translations.financialReports}
        subtitle={translations.trackRevenueAndSales}
        icon={<BarChart3 className="h-5 w-5" />}
      />
      
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {translations.totalRevenue}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {translations.fromBookingsAndSales}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {translations.totalExpenses}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {translations.allRecordedExpenses}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {translations.netProfit}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {translations.revenueMinusExpenses}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {translations.totalBookings}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookingsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {translations.allCourtReservations}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {translations.revenue}
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            {translations.products}
          </TabsTrigger>
          <TabsTrigger value="cashRegister" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            {translations.cashRegister}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{translations.dailyRevenue}</CardTitle>
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
                    <Tooltip formatter={(value) => [formatCurrency(value as number), undefined]} />
                    <Legend />
                    <Bar dataKey="bookings" name={translations.courtBookings} fill="#8884d8" />
                    <Bar dataKey="sales" name={translations.productSales} fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{translations.salesByCategory}</CardTitle>
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
                <CardTitle>{translations.mostPopularProducts}</CardTitle>
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
              <CardTitle>{translations.productSalesTrends}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyData.slice(-14)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), undefined]} />
                    <Legend />
                    <Line type="monotone" dataKey="sales" name={translations.productSales} stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cashRegister" className="space-y-6">
          <CashRegisterReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
