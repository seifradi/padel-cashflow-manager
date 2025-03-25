import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import {
  BOOKING_STATUSES,
  BOOKING_TYPES,
  COURT_DEFAULT_PRICE,
  PADEL_RENTAL_PRICE,
  PLAYER_DEFAULT_SHARE,
  TIME_SLOTS,
} from "@/lib/constants";
import { BookingType, Player } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Minus, Plus, TrashIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import AmountInput from "../common/AmountInput";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

const BookingFormSchema = z.object({
  courtId: z.string({ required_error: "Court is required" }),
  date: z.date({ required_error: "Date is required" }),
  startTime: z.string({ required_error: "Start time is required" }),
  status: z.string({ required_error: "Status is required" }),
  type: z.string({ required_error: "Booking type is required" }),
  courtPrice: z.number().min(0, "Price cannot be negative"),
  notes: z.string().optional(),
});

interface PlayerEntry {
  playerId: string;
  playerShare: number;
  padelRental: boolean;
}

const BookingForm = () => {
  const { courts, players, addBooking } = useData();
  const { user } = useAuth();
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerEntry[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const form = useForm<z.infer<typeof BookingFormSchema>>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      courtPrice: COURT_DEFAULT_PRICE,
      status: "confirmed",
      type: "regular"
    },
  });
  
  const watchType = form.watch("type");
  const watchDate = form.watch("date");
  const watchStartTime = form.watch("startTime");
  const watchCourtPrice = form.watch("courtPrice");
  
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
  
  const handleAddPlayer = () => {
    setSelectedPlayers([
      ...selectedPlayers,
      {
        playerId: "",
        playerShare: PLAYER_DEFAULT_SHARE,
        padelRental: false,
      },
    ]);
  };
  
  const handleRemovePlayer = (index: number) => {
    setSelectedPlayers(selectedPlayers.filter((_, i) => i !== index));
  };
  
  const handlePlayerChange = (index: number, playerId: string) => {
    const updatedPlayers = [...selectedPlayers];
    
    const player = players.find(p => p.id === playerId);
    
    updatedPlayers[index] = {
      ...updatedPlayers[index],
      playerId,
      playerShare: player?.specialPrice !== undefined ? player.specialPrice : PLAYER_DEFAULT_SHARE,
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
  
  useEffect(() => {
    const courtPrice = watchCourtPrice || 0;
    
    const playerSharesTotal = selectedPlayers.reduce(
      (sum, player) => sum + player.playerShare,
      0
    );
    
    const padelRentalTotal = selectedPlayers.reduce(
      (sum, player) => sum + (player.padelRental ? PADEL_RENTAL_PRICE : 0),
      0
    );
    
    setTotalAmount(courtPrice + playerSharesTotal + padelRentalTotal);
  }, [selectedPlayers, watchCourtPrice]);
  
  const onSubmit = (data: z.infer<typeof BookingFormSchema>) => {
    if (selectedPlayers.length === 0) {
      toast.error("Please add at least one player to the booking");
      return;
    }
    
    if (selectedPlayers.some(player => !player.playerId)) {
      toast.error("Please select all players");
      return;
    }
    
    const booking = {
      courtId: data.courtId,
      date: data.date,
      startTime: data.startTime,
      endTime: calculateEndTime(data.startTime),
      status: data.status as any,
      type: data.type as BookingType,
      courtPrice: data.courtPrice,
      players: selectedPlayers,
      createdBy: user?.id || "",
      createdAt: new Date(),
      totalAmount,
      notes: data.notes || ""
    };
    
    try {
      addBooking(booking);
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
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="courtId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Court</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a court" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="pointer-events-auto">
                        {courts.map((court) => (
                          <SelectItem key={court.id} value={court.id}>
                            {court.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="pointer-events-auto">
                          {TIME_SLOTS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="pointer-events-auto">
                          {BOOKING_TYPES.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="pointer-events-auto">
                          {BOOKING_STATUSES.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="courtPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Court Price</FormLabel>
                    <FormControl>
                      <AmountInput
                        value={field.value}
                        onChange={field.onChange}
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any special instructions or notes"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Players</h3>
              <Button 
                type="button" 
                onClick={handleAddPlayer} 
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
                  <div key={index} className="border rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Player {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePlayer(index)}
                      >
                        <TrashIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Player Name</label>
                        <Select
                          value={playerEntry.playerId}
                          onValueChange={(value) => handlePlayerChange(index, value)}
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
                          onChange={(value) => handlePlayerShareChange(index, value)}
                          min={0}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`padel-rental-${index}`}
                          checked={playerEntry.padelRental}
                          onCheckedChange={(checked) => 
                            handlePadelRentalChange(index, checked as boolean)
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
                ))}
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Court Price:</span>
                <span>{watchCourtPrice || 0} TNd</span>
              </div>
              
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Player Shares:</span>
                <span>
                  {selectedPlayers.reduce(
                    (sum, player) => sum + player.playerShare,
                    0
                  )} TNd
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium">Equipment Rental:</span>
                <span>
                  {selectedPlayers.reduce(
                    (sum, player) => sum + (player.padelRental ? PADEL_RENTAL_PRICE : 0),
                    0
                  )} TNd
                </span>
              </div>
              
              <div className="flex justify-between items-center text-lg font-semibold border-t pt-3">
                <span>Total Amount:</span>
                <span>{totalAmount} TNd</span>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="flex justify-end gap-4">
          <Button type="submit" className="w-full md:w-auto">
            Create Booking
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BookingForm;
