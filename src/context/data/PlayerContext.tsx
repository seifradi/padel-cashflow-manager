
import { Player } from "@/lib/types";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface PlayerContextType {
  players: Player[];
  addPlayer: (player: Omit<Player, 'id'>) => Promise<Player | undefined>;
  updatePlayer: (player: Player) => void;
  refreshPlayers: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Fetch players when the component mounts if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshPlayers();
    }
  }, [isAuthenticated]);

  const refreshPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Convert Supabase data to our app's Player type
      const typedPlayers: Player[] = data.map(player => ({
        id: player.id,
        name: player.name,
        phone: player.phone || undefined,
        specialPrice: player.special_price || undefined,
        notes: player.notes || undefined
      }));
      
      setPlayers(typedPlayers);
    } catch (error: any) {
      console.error('Error fetching players:', error);
      toast({
        title: "Error fetching players",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addPlayer = async (player: Omit<Player, 'id'>): Promise<Player | undefined> => {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert({
          name: player.name,
          phone: player.phone,
          special_price: player.specialPrice,
          notes: player.notes
        })
        .select()
        .single();

      if (error) throw error;

      const newPlayer: Player = {
        id: data.id,
        name: data.name,
        phone: data.phone || undefined,
        specialPrice: data.special_price || undefined,
        notes: data.notes || undefined
      };

      setPlayers([...players, newPlayer]);
      return newPlayer;
    } catch (error: any) {
      console.error('Error adding player:', error);
      toast({
        title: "Error adding player",
        description: error.message,
        variant: "destructive",
      });
      return undefined;
    }
  };

  const updatePlayer = async (updatedPlayer: Player) => {
    try {
      const { error } = await supabase
        .from('players')
        .update({
          name: updatedPlayer.name,
          phone: updatedPlayer.phone,
          special_price: updatedPlayer.specialPrice,
          notes: updatedPlayer.notes
        })
        .eq('id', updatedPlayer.id);

      if (error) throw error;

      setPlayers(players.map(player => 
        player.id === updatedPlayer.id ? updatedPlayer : player
      ));
    } catch (error: any) {
      console.error('Error updating player:', error);
      toast({
        title: "Error updating player",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <PlayerContext.Provider value={{ players, addPlayer, updatePlayer, refreshPlayers }}>
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
