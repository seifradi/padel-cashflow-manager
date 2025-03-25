
import { z } from "zod";

export const BookingFormSchema = z.object({
  courtId: z.string({ required_error: "Court is required" }),
  date: z.date({ required_error: "Date is required" }),
  startTime: z.string({ required_error: "Start time is required" }),
  status: z.string({ required_error: "Status is required" }),
  type: z.string({ required_error: "Booking type is required" }),
  courtPrice: z.number().min(0, "Price cannot be negative"),
  notes: z.string().optional(),
});

export type BookingFormValues = z.infer<typeof BookingFormSchema>;

export interface PlayerEntry {
  playerId: string;
  playerShare: number;
  padelRental: boolean;
}
