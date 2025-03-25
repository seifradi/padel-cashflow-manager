
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Player } from "@/lib/types";
import { TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import AmountInput from "@/components/common/AmountInput";
import { PADEL_RENTAL_PRICE } from "@/lib/constants";

interface PlayerEntryProps {
  index: number;
  players: Player[];
  playerEntry: {
    playerId: string;
    playerShare: number;
    padelRental: boolean;
  };
  onRemove: (index: number) => void;
  onPlayerChange: (index: number, playerId: string) => void;
  onPlayerShareChange: (index: number, value: number) => void;
  onPadelRentalChange: (index: number, checked: boolean) => void;
}

const PlayerEntry = ({
  index,
  players,
  playerEntry,
  onRemove,
  onPlayerChange,
  onPlayerShareChange,
  onPadelRentalChange,
}: PlayerEntryProps) => {
  return (
    <div className="border rounded-md p-3">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">Player {index + 1}</h4>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
        >
          <TrashIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Player Name</label>
          <Select
            value={playerEntry.playerId}
            onValueChange={(value) => onPlayerChange(index, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a player" />
            </SelectTrigger>
            <SelectContent className="pointer-events-auto">
              {players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium">Player Share</label>
          <AmountInput
            value={playerEntry.playerShare}
            onChange={(value) => onPlayerShareChange(index, value)}
            min={0}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`padel-rental-${index}`}
            checked={playerEntry.padelRental}
            onCheckedChange={(checked) => 
              onPadelRentalChange(index, checked as boolean)
            }
          />
          <label
            htmlFor={`padel-rental-${index}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Padel Rental (+{PADEL_RENTAL_PRICE} TNd)
          </label>
        </div>
      </div>
    </div>
  );
};

export default PlayerEntry;
