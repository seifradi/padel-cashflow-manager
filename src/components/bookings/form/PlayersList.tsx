
import { Button } from "@/components/ui/button";
import { Player } from "@/lib/types";
import { Plus } from "lucide-react";
import PlayerEntry from "./PlayerEntry";

interface PlayerEntry {
  playerId: string;
  playerShare: number;
  padelRental: boolean;
}

interface PlayersListProps {
  players: Player[];
  selectedPlayers: PlayerEntry[];
  onAddPlayer: () => void;
  onRemovePlayer: (index: number) => void;
  onPlayerChange: (index: number, playerId: string) => void;
  onPlayerShareChange: (index: number, value: number) => void;
  onPadelRentalChange: (index: number, checked: boolean) => void;
}

const PlayersList = ({
  players,
  selectedPlayers,
  onAddPlayer,
  onRemovePlayer,
  onPlayerChange,
  onPlayerShareChange,
  onPadelRentalChange,
}: PlayersListProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Players</h3>
        <Button 
          type="button" 
          onClick={onAddPlayer} 
          size="sm"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Player
        </Button>
      </div>
      
      {selectedPlayers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No players added yet. Click "Add Player" to begin.
        </div>
      ) : (
        <div className="space-y-4">
          {selectedPlayers.map((playerEntry, index) => (
            <PlayerEntry
              key={index}
              index={index}
              players={players}
              playerEntry={playerEntry}
              onRemove={onRemovePlayer}
              onPlayerChange={onPlayerChange}
              onPlayerShareChange={onPlayerShareChange}
              onPadelRentalChange={onPadelRentalChange}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default PlayersList;
