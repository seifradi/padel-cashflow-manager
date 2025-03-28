
import { Expense } from "@/lib/types";
import { ReactNode, createContext, useContext, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => Expense;
  refreshExpenses: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const refreshExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert Supabase data to our app's Expense type
      const typedExpenses: Expense[] = data.map(expense => ({
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        createdBy: expense.created_by,
        createdAt: new Date(expense.created_at),
        receipt: expense.receipt || undefined
      }));
      
      setExpenses(typedExpenses);
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error fetching expenses",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: `expense-${Date.now()}`
    };
    setExpenses([...expenses, newExpense]);
    return newExpense;
  };

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense, refreshExpenses }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
};
