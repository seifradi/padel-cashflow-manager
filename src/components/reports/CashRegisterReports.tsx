
import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/context/DataContext";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { CircleDollarSign, Timer, Users, Banknote, UserCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailyBalance } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { Badge } from "@/components/ui/badge";

interface CashierStats {
  cashierId: string;
  cashierName: string;
  totalSales: number;
  totalBookings: number;
  averageDifference: number;
  registersOpened: number;
  averageTimeOpen: number; // in minutes
}

interface RegisterEntry extends DailyBalance {
  cashierName: string;
  openDuration: number; // in minutes
}

const CashRegisterReports = () => {
  const { sales, bookings } = useData();
  const [registerEntries, setRegisterEntries] = useState<RegisterEntry[]>([]);
  const [cashierStats, setCashierStats] = useState<CashierStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language, translations } = useLanguage();
  
  // Fetch register entries from Supabase
  useEffect(() => {
    const fetchRegisterData = async () => {
      setIsLoading(true);

      try {
        // Fetch daily balances with cashier info
        const { data: balancesData, error: balancesError } = await supabase
          .from('daily_balances')
          .select(`
            *,
            profiles:closed_by(id, name)
          `)
          .order('date', { ascending: false });

        if (balancesError) throw balancesError;

        // Format the data
        const formattedEntries: RegisterEntry[] = (balancesData || []).map((entry: any) => {
          const openTime = new Date(entry.closed_at);
          const closeTime = entry.verified_at ? new Date(entry.verified_at) : null;
          const durationMs = closeTime ? closeTime.getTime() - openTime.getTime() : 0;
          const durationMinutes = Math.floor(durationMs / (1000 * 60));

          return {
            id: entry.id,
            date: new Date(entry.date),
            startingAmount: entry.starting_amount,
            cashInRegister: entry.cash_in_register,
            calculatedAmount: entry.calculated_amount,
            difference: entry.difference,
            notes: entry.notes,
            verifiedBy: entry.verified_by,
            verifiedAt: entry.verified_at ? new Date(entry.verified_at) : undefined,
            closedBy: entry.closed_by,
            closedAt: new Date(entry.closed_at),
            cashierName: entry.profiles ? entry.profiles.name : 'Unknown',
            openDuration: durationMinutes
          };
        });

        setRegisterEntries(formattedEntries);

        // Calculate cashier statistics
        const cashierMap = new Map<string, CashierStats>();
        
        // Get unique cashiers
        formattedEntries.forEach(entry => {
          if (!cashierMap.has(entry.closedBy)) {
            cashierMap.set(entry.closedBy, {
              cashierId: entry.closedBy,
              cashierName: entry.cashierName,
              totalSales: 0,
              totalBookings: 0,
              averageDifference: 0,
              registersOpened: 0,
              averageTimeOpen: 0
            });
          }
          
          const cashier = cashierMap.get(entry.closedBy)!;
          cashier.registersOpened += 1;
          cashier.averageDifference += Math.abs(entry.difference);
          cashier.averageTimeOpen += entry.openDuration;
        });

        // Add sales and bookings data
        sales.forEach(sale => {
          const cashierId = sale.createdBy;
          if (cashierMap.has(cashierId)) {
            const cashier = cashierMap.get(cashierId)!;
            cashier.totalSales += 1;
          }
        });

        bookings.forEach(booking => {
          const cashierId = booking.createdBy;
          if (cashierMap.has(cashierId)) {
            const cashier = cashierMap.get(cashierId)!;
            cashier.totalBookings += 1;
          }
        });

        // Finalize averages
        cashierMap.forEach(cashier => {
          if (cashier.registersOpened > 0) {
            cashier.averageDifference = cashier.averageDifference / cashier.registersOpened;
            cashier.averageTimeOpen = cashier.averageTimeOpen / cashier.registersOpened;
          }
        });

        setCashierStats(Array.from(cashierMap.values()));
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching register data:", error);
        setIsLoading(false);
      }
    };

    fetchRegisterData();
  }, [sales, bookings]);

  // Format time duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format date based on current language
  const formatDateLocalized = (date: Date) => {
    return format(date, "PPP", { locale: language === 'fr' ? fr : enUS });
  };

  // Format time based on current language
  const formatTimeLocalized = (date: Date) => {
    return format(date, "p", { locale: language === 'fr' ? fr : enUS });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="registers">
        <TabsList>
          <TabsTrigger value="registers">{translations.registers}</TabsTrigger>
          <TabsTrigger value="cashiers">{translations.cashiers}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="registers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4" />
                  {translations.totalCashDifference}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(registerEntries.reduce((sum, entry) => sum + Math.abs(entry.difference), 0))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {translations.acrossAllRegisters}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  {translations.averageRegisterTime}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {registerEntries.length > 0 
                    ? formatDuration(
                        registerEntries.reduce((sum, entry) => sum + entry.openDuration, 0) / registerEntries.length
                      )
                    : "0h 0m"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {translations.averageTimeOpen}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {translations.uniqueCashiers}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(registerEntries.map(entry => entry.closedBy)).size}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {translations.operatingRegisters}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  {translations.totalRegisters}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {registerEntries.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {translations.allTimeRegisters}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Register Entries Table */}
          <Card>
            <CardHeader>
              <CardTitle>{translations.cashRegisterHistory}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{translations.date}</TableHead>
                        <TableHead>{translations.cashier}</TableHead>
                        <TableHead>{translations.openTime}</TableHead>
                        <TableHead>{translations.closeTime}</TableHead>
                        <TableHead>{translations.duration}</TableHead>
                        <TableHead>{translations.expectedAmount}</TableHead>
                        <TableHead>{translations.actualAmount}</TableHead>
                        <TableHead>{translations.difference}</TableHead>
                        <TableHead>{translations.status}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registerEntries.map(entry => (
                        <TableRow key={entry.id}>
                          <TableCell className="whitespace-nowrap">{formatDateLocalized(entry.date)}</TableCell>
                          <TableCell>{entry.cashierName}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatTimeLocalized(entry.closedAt)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {entry.verifiedAt ? formatTimeLocalized(entry.verifiedAt) : "-"}
                          </TableCell>
                          <TableCell>{formatDuration(entry.openDuration)}</TableCell>
                          <TableCell>{formatCurrency(entry.calculatedAmount)}</TableCell>
                          <TableCell>{formatCurrency(entry.cashInRegister)}</TableCell>
                          <TableCell className={`font-medium ${
                            entry.difference === 0 
                              ? 'text-green-600' 
                              : entry.difference > 0 
                              ? 'text-blue-600' 
                              : 'text-red-600'
                          }`}>
                            {formatCurrency(entry.difference)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={entry.verifiedAt ? "default" : "outline"}>
                              {entry.verifiedAt 
                                ? translations.closed 
                                : translations.open}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {registerEntries.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-4">
                            {translations.noRegisterData}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cashiers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  {translations.topCashier}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cashierStats.length > 0 
                    ? cashierStats.sort((a, b) => (b.totalSales + b.totalBookings) - (a.totalSales + a.totalBookings))[0].cashierName
                    : "-"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {translations.byTotalTransactions}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  {translations.mostAccurate}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cashierStats.length > 0 
                    ? cashierStats.sort((a, b) => a.averageDifference - b.averageDifference)[0].cashierName
                    : "-"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {translations.bySmallestDifference}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4" />
                  {translations.averageDifference}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    cashierStats.reduce((sum, cashier) => sum + cashier.averageDifference, 0) / 
                    (cashierStats.length || 1)
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {translations.perRegisterClose}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  {translations.averageRegisterTime}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(
                    cashierStats.reduce((sum, cashier) => sum + cashier.averageTimeOpen, 0) / 
                    (cashierStats.length || 1)
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {translations.perCashier}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cashier Stats Table */}
          <Card>
            <CardHeader>
              <CardTitle>{translations.cashierPerformance}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{translations.cashier}</TableHead>
                        <TableHead>{translations.totalSales}</TableHead>
                        <TableHead>{translations.totalBookings}</TableHead>
                        <TableHead>{translations.registersOperated}</TableHead>
                        <TableHead>{translations.avgTimePerRegister}</TableHead>
                        <TableHead>{translations.avgDifference}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cashierStats.map(cashier => (
                        <TableRow key={cashier.cashierId}>
                          <TableCell className="font-medium">{cashier.cashierName}</TableCell>
                          <TableCell>{cashier.totalSales}</TableCell>
                          <TableCell>{cashier.totalBookings}</TableCell>
                          <TableCell>{cashier.registersOpened}</TableCell>
                          <TableCell>{formatDuration(cashier.averageTimeOpen)}</TableCell>
                          <TableCell className={cashier.averageDifference === 0 
                            ? 'text-green-600' 
                            : 'text-amber-600'
                          }>
                            {formatCurrency(cashier.averageDifference)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {cashierStats.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            {translations.noCashierData}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashRegisterReports;
