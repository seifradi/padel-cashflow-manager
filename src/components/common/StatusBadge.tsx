
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type StatusType = "success" | "warning" | "error" | "info" | "default";

interface StatusBadgeProps {
  status: StatusType;
  children: ReactNode;
  className?: string;
}

const StatusBadge = ({ status, children, className }: StatusBadgeProps) => {
  const statusStyles = {
    success: "bg-green-100 text-green-800 hover:bg-green-100",
    warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    error: "bg-red-100 text-red-800 hover:bg-red-100",
    info: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    default: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-normal transition-all-fast",
        statusStyles[status],
        className
      )}
    >
      {children}
    </Badge>
  );
};

export default StatusBadge;
