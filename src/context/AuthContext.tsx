
import { MOCK_CURRENT_USER } from "@/lib/constants";
import { User } from "@/lib/types";
import { ReactNode, createContext, useContext, useState } from "react";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // In a real app, we would check for an existing session
  const [user, setUser] = useState<User | null>(MOCK_CURRENT_USER);
  
  const login = async (username: string, password: string) => {
    // Simulate authentication
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setUser(MOCK_CURRENT_USER);
        resolve();
      }, 500);
    });
  };
  
  const logout = () => {
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
