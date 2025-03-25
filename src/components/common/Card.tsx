
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

const Card = ({ 
  title, 
  subtitle, 
  children, 
  className, 
  contentClassName,
  noPadding = false 
}: CardProps) => {
  return (
    <div className={cn(
      "bg-card rounded-lg border shadow-sm animate-fade-in",
      className
    )}>
      {(title || subtitle) && (
        <div className="p-4 pb-2">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <div className={cn(
        contentClassName,
        !noPadding && "p-4",
        title && !noPadding && "pt-2"
      )}>
        {children}
      </div>
    </div>
  );
};

export default Card;
