
import { Court } from "@/lib/types";
import { MOCK_COURTS } from "@/lib/constants";
import { ReactNode, createContext, useContext, useState } from "react";

interface CourtContextType {
  courts: Court[];
}

const CourtContext = createContext<CourtContextType | undefined>(undefined);

export const CourtProvider = ({ children }: { children: ReactNode }) => {
  const [courts] = useState<Court[]>(MOCK_COURTS);

  return (
    <CourtContext.Provider value={{ courts }}>
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
