
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout = ({ children, title }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header title={title} />
          <main className="flex-1 p-6 md:p-8 pt-6 overflow-x-hidden">
            {children}
          </main>
        </div>
        <Toaster position="top-right" />
      </div>
    </SidebarProvider>
  );
};

export default Layout;
