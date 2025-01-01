import db from "../../Config/knex";
import { BookingInterface } from "../../Interfaces/bookingsInterface";

export class BookingsClass {
  isBookingExist = async (userId: number, eventId: number): Promise<any> => {
    try {
      const booking = await db("bookings")
        .where("user_id", userId)
        .andWhere("event_id", eventId)
        .first();
      if (booking) {
        return { status: true, message: "Booking already exists" };
      }
      return { status: false, message: "Booking isn't exist" };
    } catch (error) {
      return { status: false, message: "Database error" };
    }
  };

  getAmounts = async (subEventIds: number[]): Promise<any> => {
    try {
      const amounts: any = await db("subevents")
        .whereIn("_id", subEventIds)
        .sum("amount as total_amount")
        .first();
      return { status: true, amount: amounts.total_amount ?? 0 };
    } catch (error) {
      return { status: false, amount: 0, message: "Database error" };
    }
  };

  createBooking = async (bookingData: BookingInterface): Promise<any> => {
    try {
      const [newBookingId] = await db("bookings").insert(bookingData);
      const newBooking = await db("bookings").where("_id", newBookingId).first();
      return { status: true, data: newBooking };
    } catch (error) {
      return { status: false, message: "Database error" };
    }
  };  

  getBookingByUserAndEvent = async (
    userId: number,
    eventId: number
  ): Promise<any> => {
    try {
      const booking = await db("bookings")
        .where("user_id", userId)
        .andWhere("event_id", eventId)
        .first();
      if (!booking) {
        return { status: false, message: "Booking not found." };
      }
      return { status: true, data: booking };
    } catch (error) {
      return { status: false, message: "Database error." };
    }
  };

  updateBooking = async (
    bookingId: number,
    updatedData: Partial<BookingInterface>
  ): Promise<any> => {
    try {
      const updated = await db("bookings")
        .where("_id", bookingId)
        .update(updatedData);

      if (updated === 0) {
        return {
          status: false,
          message: "Failed to update booking. Booking not found.",
        };
      }

      const updatedBooking = await db("bookings")
        .where("_id", bookingId)
        .first();

      return { status: true, data: updatedBooking };
    } catch (error) {
      console.error("Error updating booking:", error);
      return { status: false, message: "Database error." };
    }
  };
}
