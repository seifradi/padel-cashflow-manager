
import { Player } from "@/lib/types";
import { MOCK_PLAYERS } from "@/lib/constants";
import { ReactNode, createContext, useContext, useState } from "react";

interface PlayerContextType {
  players: Player[];
  addPlayer: (player: Omit<Player, 'id'>) => void;
  updatePlayer: (player: Player) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);

  const addPlayer = (player: Omit<Player, 'id'>) => {
    const newPlayer = {
      ...player,
      id: `player-${Date.now()}`
    };
    setPlayers([...players, newPlayer]);
  };

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers(players.map(player => 
      player.id === updatedPlayer.id ? updatedPlayer : player
    ));
  };

  return (
    <PlayerContext.Provider value={{ players, addPlayer, updatePlayer }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayers = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayers must be used within a PlayerProvider");
  }
  return context;
};
