
import { PADEL_RENTAL_PRICE } from "@/lib/constants";

interface PlayerEntry {
  playerId: string;
  playerShare: number;
  padelRental: boolean;
}

interface BookingSummaryProps {
  courtPrice: number;
  selectedPlayers: PlayerEntry[];
  totalAmount: number;
}

const BookingSummary = ({ 
  courtPrice, 
  selectedPlayers, 
  totalAmount 
}: BookingSummaryProps) => {
  const playerSharesTotal = selectedPlayers.reduce(
    (sum, player) => sum + player.playerShare,
    0
  );
  
  const padelRentalTotal = selectedPlayers.reduce(
    (sum, player) => sum + (player.padelRental ? PADEL_RENTAL_PRICE : 0),
    0
  );
  
  return (
    <div className="mt-6 pt-4 border-t">
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium">Court Price:</span>
        <span>{courtPrice || 0} TNd</span>
      </div>
      
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium">Equipment Rental:</span>
        <span>{padelRentalTotal} TNd</span>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <span className="font-medium text-sm text-muted-foreground">
          (Each player share: {(courtPrice / 4).toFixed(2)} TNd)
        </span>
      </div>
      
      <div className="flex justify-between items-center text-lg font-semibold border-t pt-3">
        <span>Total Amount:</span>
        <span>{totalAmount} TNd</span>
      </div>
    </div>
  );
};

export default BookingSummary;
