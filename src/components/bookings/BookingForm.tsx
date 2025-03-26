
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
} from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import {
  COURT_DEFAULT_PRICE,
  PADEL_RENTAL_PRICE,
} from "@/lib/constants";
import { BookingType } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import CourtDetails from "./form/CourtDetails";
import PlayersList from "./form/PlayersList";
import BookingSummary from "./form/BookingSummary";
import { BookingFormSchema, PlayerEntry, BookingFormValues } from "./form/types";

const BookingForm = () => {
  const { courts, players, addBooking, bookings } = useData();
  const { user } = useAuth();
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerEntry[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      courtPrice: COURT_DEFAULT_PRICE,
      status: "confirmed",
      type: "regular"
    },
  });
  
  const watchCourtPrice = form.watch("courtPrice");
  const watchStartTime = form.watch("startTime");
  const watchCourtId = form.watch("courtId");
  const watchDate = form.watch("date");
  
  // Function to calculate end time including handling 23:00 -> 00:30 next day
  const calculateEndTime = (startTime: string) => {
    if (!startTime) return "";
    
    const [hours, minutes] = startTime.split(":").map(Number);
    let endHours = hours;
    let endMinutes = minutes + 30;
    
    if (endMinutes >= 60) {
      endMinutes -= 60;
      endHours += 1;
    }
    
    endHours += 1; // Add 1 hour
    
    if (endHours >= 24) {
      endHours -= 24;
    }
    
    return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
  };
  
  // Check if the selected court is available at the selected time
  const isCourtAvailable = () => {
    if (!watchCourtId || !watchDate || !watchStartTime) return true;
    
    const endTime = calculateEndTime(watchStartTime);
    
    // Check if there's any booking for the same court, date and time
    return !bookings.some(booking => 
      booking.courtId === watchCourtId && 
      booking.date.toDateString() === watchDate.toDateString() &&
      booking.startTime === watchStartTime
    );
  };
  
  const handleAddPlayer = () => {
    // Calculate the player share based on court price and number of players
    const playerCount = selectedPlayers.length + 1;
    const perPlayerCourtShare = watchCourtPrice / 4; // Fixed share calculation as per requirement
    
    // Update existing players' shares
    const updatedPlayers = selectedPlayers.map(player => ({
      ...player,
      playerShare: perPlayerCourtShare
    }));
    
    // Add new player with calculated share
    setSelectedPlayers([
      ...updatedPlayers,
      {
        playerId: "",
        playerShare: perPlayerCourtShare,
        padelRental: false,
      },
    ]);
  };
  
  const handleRemovePlayer = (index: number) => {
    // Remove the player
    const newPlayers = selectedPlayers.filter((_, i) => i !== index);
    
    // Recalculate shares for remaining players
    if (newPlayers.length > 0) {
      const perPlayerCourtShare = watchCourtPrice / 4; // Fixed share calculation
      const updatedPlayers = newPlayers.map(player => ({
        ...player,
        playerShare: perPlayerCourtShare
      }));
      setSelectedPlayers(updatedPlayers);
    } else {
      setSelectedPlayers([]);
    }
  };
  
  const handlePlayerChange = (index: number, playerId: string) => {
    const updatedPlayers = [...selectedPlayers];
    
    const player = players.find(p => p.id === playerId);
    
    updatedPlayers[index] = {
      ...updatedPlayers[index],
      playerId,
      playerShare: player?.specialPrice !== undefined ? player.specialPrice : watchCourtPrice / 4,
    };
    
    setSelectedPlayers(updatedPlayers);
  };
  
  const handlePlayerShareChange = (index: number, value: number) => {
    const updatedPlayers = [...selectedPlayers];
    updatedPlayers[index].playerShare = value;
    setSelectedPlayers(updatedPlayers);
  };
  
  const handlePadelRentalChange = (index: number, checked: boolean) => {
    const updatedPlayers = [...selectedPlayers];
    updatedPlayers[index].padelRental = checked;
    setSelectedPlayers(updatedPlayers);
  };
  
  // Recalculate player shares when court price changes
  useEffect(() => {
    if (selectedPlayers.length > 0) {
      const perPlayerCourtShare = watchCourtPrice / 4; // Fixed share calculation
      const updatedPlayers = selectedPlayers.map(player => ({
        ...player,
        playerShare: perPlayerCourtShare
      }));
      setSelectedPlayers(updatedPlayers);
    }
  }, [watchCourtPrice]);
  
  useEffect(() => {
    // Total amount is court price plus padel rentals
    const courtPrice = watchCourtPrice || 0;
    
    const padelRentalTotal = selectedPlayers.reduce(
      (sum, player) => sum + (player.padelRental ? PADEL_RENTAL_PRICE : 0),
      0
    );
    
    setTotalAmount(courtPrice + padelRentalTotal);
  }, [selectedPlayers, watchCourtPrice]);
  
  const onSubmit = async (data: BookingFormValues) => {
    if (selectedPlayers.length === 0) {
      toast.error("Please add at least one player to the booking");
      return;
    }
    
    if (selectedPlayers.some(player => !player.playerId)) {
      toast.error("Please select all players");
      return;
    }
    
    if (!isCourtAvailable()) {
      toast.error("This court is already booked for the selected time");
      return;
    }
    
    // Ensure all required fields are non-optional
    const booking = {
      courtId: data.courtId!,
      date: data.date!,
      startTime: data.startTime!,
      endTime: calculateEndTime(data.startTime!),
      status: data.status as any,
      type: data.type as BookingType,
      courtPrice: data.courtPrice!,
      players: selectedPlayers,
      createdBy: user?.id || "",
      createdAt: new Date(),
      totalAmount,
      notes: data.notes || ""
    };
    
    try {
      await addBooking(booking);
      toast.success("Booking created successfully");
      form.reset({
        courtId: "",
        date: undefined,
        startTime: "",
        status: "confirmed",
        type: "regular",
        courtPrice: COURT_DEFAULT_PRICE,
        notes: "",
      });
      setSelectedPlayers([]);
    } catch (error) {
      toast.error("Failed to create booking");
      console.error(error);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Court Details</h3>
            <CourtDetails form={form} courts={courts} />
            
            {!isCourtAvailable() && (
              <div className="mt-4 p-2 bg-red-100 text-red-800 rounded-md">
                This court is already booked for the selected time.
              </div>
            )}
          </Card>
          
          <Card className="p-4">
            <PlayersList 
              players={players}
              selectedPlayers={selectedPlayers}
              onAddPlayer={handleAddPlayer}
              onRemovePlayer={handleRemovePlayer}
              onPlayerChange={handlePlayerChange}
              onPlayerShareChange={handlePlayerShareChange}
              onPadelRentalChange={handlePadelRentalChange}
            />
            
            <BookingSummary 
              courtPrice={watchCourtPrice || 0}
              selectedPlayers={selectedPlayers}
              totalAmount={totalAmount}
            />
          </Card>
        </div>
        
        <div className="flex justify-end gap-4">
          <Button 
            type="submit" 
            className="w-full md:w-auto"
            disabled={!isCourtAvailable()}
          >
            Create Booking
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BookingForm;
