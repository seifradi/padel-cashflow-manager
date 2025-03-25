
import { Booking } from "@/lib/types";
import { ReactNode, createContext, useContext, useState } from "react";

interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id'>) => Booking;
  updateBooking: (booking: Booking) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const addBooking = (booking: Omit<Booking, 'id'>) => {
    const newBooking = {
      ...booking,
      id: `booking-${Date.now()}`
    };
    setBookings([...bookings, newBooking]);
    return newBooking;
  };

  const updateBooking = (updatedBooking: Booking) => {
    setBookings(bookings.map(booking => 
      booking.id === updatedBooking.id ? updatedBooking : booking
    ));
  };

  return (
    <BookingContext.Provider value={{ bookings, addBooking, updateBooking }}>
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
