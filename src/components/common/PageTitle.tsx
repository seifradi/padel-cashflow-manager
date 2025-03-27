
import { ReactNode } from "react";

export interface PageTitleProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

const PageTitle = ({ title, subtitle, icon }: PageTitleProps) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h1>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </div>
  );
};

export default PageTitle;
