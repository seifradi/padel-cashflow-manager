
import { DailyBalance } from "@/lib/types";
import { format } from "date-fns";
import Card from "../common/Card";

interface ClosedRegisterViewProps {
  balance: DailyBalance;
}

const ClosedRegisterView = ({ balance }: ClosedRegisterViewProps) => {
  const isPositiveDifference = balance.difference >= 0;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Starting Balance"
          className="animate-slide-in [animation-delay:0ms]"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">{balance.startingAmount} TNd</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">
                {format(new Date(balance.date), "EEEE, MMMM d, yyyy")}
              </span>
            </div>
          </div>
        </Card>

        <Card
          title="Closing Details"
          className="animate-slide-in [animation-delay:100ms]"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Cash in Register:</span>
              <span className="font-medium">{balance.cashInRegister} TNd</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Calculated Amount:</span>
              <span className="font-medium">{balance.calculatedAmount} TNd</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Difference:</span>
              <span className={`font-medium ${isPositiveDifference ? 'text-green-600' : 'text-red-600'}`}>
                {isPositiveDifference ? '+' : ''}{balance.difference} TNd
              </span>
            </div>
          </div>
        </Card>

        <Card
          title="Register Summary"
          className="animate-slide-in [animation-delay:200ms]"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium text-red-600">Closed</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Closed At:</span>
              <span className="font-medium">
                {format(new Date(balance.closedAt), "h:mm a")}
              </span>
            </div>
            {balance.notes && (
              <div className="pt-3 border-t">
                <span className="text-sm text-muted-foreground">Notes:</span>
                <p className="mt-1">{balance.notes}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ClosedRegisterView;
