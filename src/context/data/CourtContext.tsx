
import { Court } from "@/lib/types";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface CourtContextType {
  courts: Court[];
  refreshCourts: () => Promise<void>;
}

const CourtContext = createContext<CourtContextType | undefined>(undefined);

export const CourtProvider = ({ children }: { children: ReactNode }) => {
  const [courts, setCourts] = useState<Court[]>([]);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Fetch courts when the component mounts if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshCourts();
    }
  }, [isAuthenticated]);

  const refreshCourts = async () => {
    try {
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Convert Supabase data to our app's Court type
      const typedCourts: Court[] = data.map(court => ({
        id: court.id,
        name: court.name,
        isAvailable: court.is_available
      }));
      
      setCourts(typedCourts);
    } catch (error: any) {
      console.error('Error fetching courts:', error);
      toast({
        title: "Error fetching courts",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <CourtContext.Provider value={{ courts, refreshCourts }}>
      {children}
    </CourtContext.Provider>
  );
};

export const useCourts = () => {
  const context = useContext(CourtContext);
  if (context === undefined) {
    throw new Error("useCourts must be used within a CourtProvider");
  }
  return context;
};
