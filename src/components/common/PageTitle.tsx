
import { cn } from "@/lib/utils";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const PageTitle = ({ title, subtitle, className }: PageTitleProps) => {
  return (
    <div className={cn("mb-6 animate-fade-in", className)}>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default PageTitle;
