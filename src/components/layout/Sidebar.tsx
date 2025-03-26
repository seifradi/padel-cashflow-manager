
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sidebar as ShellSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CreditCard,
  Calendar,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[]; // Roles that can access this item
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["admin", "manager"]
  },
  {
    title: "Cash Register",
    href: "/cash-register",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    title: "Court Bookings",
    href: "/bookings",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ["admin", "manager"]
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
    roles: ["admin", "manager"]
  },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const [activeItem, setActiveItem] = useState("");
  const { logout, user } = useAuth();
  
  // Get the user role from the user object
  const userRole = user?.role || 'cashier';

  useEffect(() => {
    // Set active nav item based on current pathname
    setActiveItem(pathname);
  }, [pathname]);

  return (
    <ShellSidebar className="border-r bg-muted/40 pb-12">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mb-2 px-4 flex h-12 items-center justify-start">
            <span className="text-xl font-bold">Padel Pro</span>
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              // Skip items that require specific roles if user doesn't have them
              if (item.roles && !item.roles.includes(userRole)) {
                return null;
              }
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    activeItem === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.icon}
                  <span className="ml-3 flex-1">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-auto p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </ShellSidebar>
  );
}
