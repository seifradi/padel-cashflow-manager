
import { format } from "date-fns";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";

interface RegisterHeaderProps {
  onCloseRegister: () => void;
}

const RegisterHeader = ({ onCloseRegister }: RegisterHeaderProps) => {
  const { translations } = useLanguage();
  const { getCurrentDailyBalance } = useData();
  
  const currentBalance = getCurrentDailyBalance();
  const today = new Date();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          <div className="mr-1 h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          {translations.registerOpen || "Register Open"}
        </span>
        <span className="text-muted-foreground">
          {translations.startedAt || "Started at"} {format(new Date(currentBalance?.closedAt || today), "h:mm a")}
        </span>
      </div>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={onCloseRegister}
        className="text-sm flex items-center gap-2"
      >
        <X className="h-4 w-4" />
        {translations.closeRegister || "Close Register"}
      </Button>
    </div>
  );
};

export default RegisterHeader;
