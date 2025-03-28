
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { LanguageProvider } from "./context/LanguageContext";
import { RequireAuth } from "./components/auth/RequireAuth";
import { RoleAuth } from "./components/auth/RoleAuth";

// Pages
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import CashRegister from "./pages/CashRegister";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Inventory from "./pages/Inventory";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="padel-plus-theme">
      <LanguageProvider>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/auth" element={<Auth />} />
              
              <Route element={<RequireAuth><Outlet /></RequireAuth>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/cash-register" element={<CashRegister />} />
                <Route path="/reports" element={<Reports />} />
                
                <Route element={<RoleAuth allowedRoles={['admin', 'manager']}><Outlet /></RoleAuth>}>
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="top-right" />
          </DataProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
