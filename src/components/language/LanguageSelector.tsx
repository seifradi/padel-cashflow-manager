
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";
import { toast } from "sonner";

const LanguageSelector = () => {
  const { language, setLanguage, translations } = useLanguage();

  const handleLanguageChange = (lang: 'en' | 'fr') => {
    setLanguage(lang);
    const langName = lang === 'en' ? 'English' : 'Français';
    toast.success(`Language changed to ${langName}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>{language === 'en' ? 'EN' : 'FR'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
          <div className="flex items-center">
            <span className={language === 'en' ? 'font-medium' : ''}>
              {translations.english || "English"}
            </span>
            {language === 'en' && (
              <span className="ml-2 h-2 w-2 rounded-full bg-primary"></span>
            )}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('fr')}>
          <div className="flex items-center">
            <span className={language === 'fr' ? 'font-medium' : ''}>
              {translations.french || "Français"}
            </span>
            {language === 'fr' && (
              <span className="ml-2 h-2 w-2 rounded-full bg-primary"></span>
            )}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
