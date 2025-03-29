
import { DailyBalance } from "@/lib/types";
import Card from "../common/Card";
import { format } from "date-fns";

interface ClosedRegisterViewProps {
  balance: DailyBalance;
}

const ClosedRegisterView = ({ balance }: ClosedRegisterViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card
        title="Starting Balance"
        className="animate-slide-in [animation-delay:0ms]"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Starting Amount:</span>
            <span className="font-medium">{balance.startingAmount} TNd</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Started At:</span>
            <span className="font-medium">{format(new Date(balance.closedAt), "h:mm a")}</span>
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
            <span className={`font-medium ${balance.difference > 0 ? 'text-green-600' : balance.difference < 0 ? 'text-red-600' : ''}`}>
              {balance.difference} TNd
            </span>
          </div>
          {balance.notes && (
            <div className="pt-3 border-t">
              <span className="text-muted-foreground">Notes:</span>
              <p className="mt-1">{balance.notes}</p>
            </div>
          )}
        </div>
      </Card>

      <Card
        title="Summary"
        className="animate-slide-in [animation-delay:200ms]"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">{format(new Date(balance.date), "EEEE, MMM d")}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Closed At:</span>
            <span className="font-medium">{format(new Date(balance.closedAt), "h:mm a")}</span>
          </div>
          <div className="pt-3 border-t">
            <div className="text-xl font-semibold text-center text-red-600">
              Register Closed
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ClosedRegisterView;
