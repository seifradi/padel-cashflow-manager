
import { Booking } from "@/lib/types";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id'>) => Promise<Booking>;
  updateBooking: (booking: Booking) => void;
  refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  // Fetch bookings when the component mounts if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshBookings();
    }
  }, [isAuthenticated]);

  const refreshBookings = async () => {
    try {
      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          booking_players(*)
        `)
        .order('date', { ascending: false });
      
      if (bookingsError) throw bookingsError;
      
      // Convert Supabase data to our app's Booking type
      const typedBookings: Booking[] = bookingsData.map(booking => ({
        id: booking.id,
        courtId: booking.court_id,
        date: new Date(booking.date),
        startTime: booking.start_time,
        endTime: booking.end_time,
        status: booking.status,
        type: booking.type,
        courtPrice: booking.court_price,
        totalAmount: booking.total_amount,
        players: booking.booking_players.map((bp: any) => ({
          playerId: bp.player_id,
          playerShare: bp.player_share,
          padelRental: bp.padel_rental
        })),
        createdBy: booking.created_by || "",
        createdAt: new Date(booking.created_at),
        notes: booking.notes || ""
      }));
      
      setBookings(typedBookings);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error fetching bookings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addBooking = async (booking: Omit<Booking, 'id'>): Promise<Booking> => {
    try {
      // Insert booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          court_id: booking.courtId,
          date: booking.date.toISOString().split('T')[0],
          start_time: booking.startTime,
          end_time: booking.endTime,
          status: booking.status,
          type: booking.type,
          court_price: booking.courtPrice,
          total_amount: booking.totalAmount,
          notes: booking.notes,
          created_by: user?.id || null
        })
        .select()
        .single();
      
      if (bookingError) throw bookingError;

      // Insert booking players
      const bookingPlayers = booking.players.map(player => ({
        booking_id: bookingData.id,
        player_id: player.playerId,
        player_share: player.playerShare,
        padel_rental: player.padelRental
      }));

      const { error: playersError } = await supabase
        .from('booking_players')
        .insert(bookingPlayers);
      
      if (playersError) throw playersError;

      // Create the complete booking object to return
      const newBooking: Booking = {
        id: bookingData.id,
        courtId: bookingData.court_id,
        date: new Date(bookingData.date),
        startTime: bookingData.start_time,
        endTime: bookingData.end_time,
        status: bookingData.status,
        type: bookingData.type,
        courtPrice: bookingData.court_price,
        totalAmount: bookingData.total_amount,
        players: booking.players,
        createdBy: bookingData.created_by || "",
        createdAt: new Date(bookingData.created_at),
        notes: bookingData.notes || ""
      };

      setBookings([newBooking, ...bookings]);
      return newBooking;
    } catch (error: any) {
      console.error('Error adding booking:', error);
      toast({
        title: "Error creating booking",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateBooking = async (updatedBooking: Booking) => {
    try {
      // Update booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          court_id: updatedBooking.courtId,
          date: updatedBooking.date.toISOString().split('T')[0],
          start_time: updatedBooking.startTime,
          end_time: updatedBooking.endTime,
          status: updatedBooking.status,
          type: updatedBooking.type,
          court_price: updatedBooking.courtPrice,
          total_amount: updatedBooking.totalAmount,
          notes: updatedBooking.notes
        })
        .eq('id', updatedBooking.id);
      
      if (bookingError) throw bookingError;

      // Delete existing booking players
      const { error: deleteError } = await supabase
        .from('booking_players')
        .delete()
        .eq('booking_id', updatedBooking.id);
      
      if (deleteError) throw deleteError;

      // Insert updated booking players
      const bookingPlayers = updatedBooking.players.map(player => ({
        booking_id: updatedBooking.id,
        player_id: player.playerId,
        player_share: player.playerShare,
        padel_rental: player.padelRental
      }));

      const { error: playersError } = await supabase
        .from('booking_players')
        .insert(bookingPlayers);
      
      if (playersError) throw playersError;

      setBookings(bookings.map(booking => 
        booking.id === updatedBooking.id ? updatedBooking : booking
      ));
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error updating booking",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <BookingContext.Provider value={{ bookings, addBooking, updateBooking, refreshBookings }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBookings must be used within a BookingProvider");
  }
  return context;
};
