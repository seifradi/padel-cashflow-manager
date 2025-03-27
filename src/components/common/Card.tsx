
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
  icon?: ReactNode;
}

const Card = ({
  title,
  subtitle,
  children,
  className,
  contentClassName,
  noPadding = false,
  icon,
}: CardProps) => {
  return (
    <div
      className={cn(
        "bg-card rounded-lg border shadow-sm",
        className
      )}
    >
      {(title || subtitle) && (
        <div className="p-6 pb-0">
          {title && (
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold flex items-center">
                {icon && <span className="mr-2">{icon}</span>}
                {title}
              </h3>
            </div>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
          )}
        </div>
      )}
      <div className={cn(noPadding ? "" : "p-6", contentClassName)}>
        {children}
      </div>
    </div>
  );
};

export default Card;
