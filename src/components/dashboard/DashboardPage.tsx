
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/common/PageTitle";
import { useData } from "@/context/DataContext";
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  CalendarIcon, 
  CoinsIcon, 
  UsersIcon, 
  PackageIcon 
} from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import StatusBadge from "../common/StatusBadge";

const DashboardPage = () => {
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">("today");
  const { bookings, sales, courts, players, products } = useData();
  
  // Get today's date
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d, yyyy");
  
  // Calculate total earnings from bookings today
  const todayBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    return bookingDate.toDateString() === today.toDateString();
  });
  
  const todayBookingsRevenue = todayBookings.reduce(
    (sum, booking) => sum + booking.totalAmount, 
    0
  );
  
  // Calculate total earnings from sales today
  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    return saleDate.toDateString() === today.toDateString();
  });
  
  const todaySalesRevenue = todaySales.reduce(
    (sum, sale) => sum + sale.totalAmount, 
    0
  );
  
  // Calculate total revenue for today
  const totalRevenue = todayBookingsRevenue + todaySalesRevenue;
  
  // Product low stock alert
  const lowStockProducts = products.filter(
    product => product.minStock && product.stock <= product.minStock
  );
  
  return (
    <div className="space-y-6">
      <PageTitle 
        title="Dashboard" 
        subtitle={`Welcome back! Here's what's happening today (${formattedDate})`}
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-slide-in [animation-delay:0ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Revenue
            </CardTitle>
            <CoinsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} TNd</div>
            <p className="text-xs text-muted-foreground mt-1">
              <ArrowUpIcon className="mr-1 h-3 w-3 inline text-green-600" />
              +12.5% from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-in [animation-delay:100ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Court Bookings
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayBookings.length}</div>
            <div className="mt-2">
              <Progress value={75} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              75% of capacity
            </p>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-in [animation-delay:200ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Players
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{players.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <ArrowUpIcon className="mr-1 h-3 w-3 inline text-green-600" />
              +3 new players this week
            </p>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-in [animation-delay:300ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Product Sales
            </CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySales.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <ArrowDownIcon className="mr-1 h-3 w-3 inline text-red-600" />
              -8% from yesterday
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-6">
        <Card className="md:col-span-4 animate-slide-in [animation-delay:400ms]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Overview</CardTitle>
              <Tabs defaultValue="today" value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
                <TabsList>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Revenue chart will be displayed here
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 animate-slide-in [animation-delay:500ms]">
          <CardHeader>
            <CardTitle>Court Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courts.map(court => (
                <div key={court.id} className="flex items-center justify-between">
                  <div className="font-medium">{court.name}</div>
                  <StatusBadge 
                    status={court.isAvailable ? "success" : "error"}
                  >
                    {court.isAvailable ? "Available" : "Booked"}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-slide-in [animation-delay:600ms]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            {todayBookings.length > 0 ? (
              <div className="space-y-4">
                {todayBookings.slice(0, 5).map(booking => {
                  const court = courts.find(c => c.id === booking.courtId);
                  return (
                    <div key={booking.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{court?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(booking.date), "h:mm a")} - {booking.type}
                        </div>
                      </div>
                      <div className="font-medium">
                        {booking.totalAmount} TNd
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No bookings recorded today
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="animate-slide-in [animation-delay:700ms]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Inventory Alerts</CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.stock} units left
                      </div>
                    </div>
                    <StatusBadge status="warning">Low Stock</StatusBadge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No inventory alerts at this time
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
