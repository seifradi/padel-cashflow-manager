
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

const LanguageSelector = () => {
  const { language, setLanguage, translations } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex items-center justify-center">
          <Globe className="h-4 w-4" />
          <span className="sr-only">{translations.language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('en')}>
          <div className="flex items-center">
            <span className={language === 'en' ? 'font-medium' : ''}>
              {translations.english}
            </span>
            {language === 'en' && (
              <span className="ml-2 h-2 w-2 rounded-full bg-primary"></span>
            )}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('fr')}>
          <div className="flex items-center">
            <span className={language === 'fr' ? 'font-medium' : ''}>
              {translations.french}
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
