
import { Checkbox } from "@/components/ui/checkbox";
import { Player } from "@/lib/types";
import { TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import AmountInput from "@/components/common/AmountInput";
import { PADEL_RENTAL_PRICE } from "@/lib/constants";
import { useState, useMemo } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon, ChevronsUpDown, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useData } from "@/context/data";

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
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerPhone, setNewPlayerPhone] = useState("");
  const { addPlayer } = useData();

  const filteredPlayers = useMemo(() => {
    return players.filter(player => 
      player.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [players, search]);

  const currentPlayer = players.find(p => p.id === playerEntry.playerId);

  const handleAddNewPlayer = async () => {
    if (!newPlayerName.trim()) return;
    
    try {
      const newPlayer = await addPlayer({
        name: newPlayerName.trim(),
        phone: newPlayerPhone.trim() || undefined
      });
      
      if (newPlayer) {
        onPlayerChange(index, newPlayer.id);
        setIsAddingPlayer(false);
        setNewPlayerName("");
        setNewPlayerPhone("");
        setOpen(false);
      }
    } catch (error) {
      console.error("Error adding new player:", error);
    }
  };

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
          <Label className="text-sm font-medium">Player Name</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {currentPlayer ? currentPlayer.name : "Select a player..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search player..." 
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    No player found.
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start mt-2"
                      onClick={() => setIsAddingPlayer(true)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add "{search}"
                    </Button>
                  </CommandEmpty>
                  <CommandGroup>
                    {filteredPlayers.map((player) => (
                      <CommandItem
                        key={player.id}
                        value={player.id}
                        onSelect={(value) => {
                          onPlayerChange(index, value);
                          setOpen(false);
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            playerEntry.playerId === player.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {player.name}
                        {player.phone && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({player.phone})
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => setIsAddingPlayer(true)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add new player
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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

      <Dialog open={isAddingPlayer} onOpenChange={setIsAddingPlayer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Player Name</Label>
              <Input
                id="name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Enter player name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (optional)</Label>
              <Input
                id="phone"
                value={newPlayerPhone}
                onChange={(e) => setNewPlayerPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingPlayer(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewPlayer}>Add Player</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayerEntry;
