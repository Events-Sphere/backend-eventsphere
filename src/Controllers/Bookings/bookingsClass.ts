import db from "../../Config/knex";
import { BookingInterface } from "../../Interfaces/bookingsInterface";

export class BookingsClass {
  async isBookingExist(userId: number, eventId: number): Promise<any> {
    try {
      const booking = await db("bookings")
        .where({ user_id: userId, event_id: eventId })
        .first();
      return booking
        ? { status: true, message: "Booking already exists." }
        : { status: false, message: "Booking does not exist." };
    } catch (error) {
      console.error("Error checking booking existence:", error);
      return { status: false, message: "Database error." };
    }
  }

  async getAmounts(subEventIds: number[]): Promise<any> {
    try {
      const { total_amount } = await db("subevents")
        .whereIn("_id", subEventIds)
        .sum({ total_amount: "ticket_price" })
        .first() || { total_amount: 0 };
      return { status: true, amount: total_amount };
    } catch (error) {
      console.error("Error calculating amounts:", error);
      return { status: false, amount: 0, message: "Database error." };
    }
  }

  async createBooking(bookingData: BookingInterface): Promise<any> {
    try {
      const [newBookingId] = await db("bookings").insert(bookingData, ["_id"]);
      const newBooking = await db("bookings").where("_id", newBookingId).first();
      return { status: true, data: newBooking };
    } catch (error) {
      console.error("Error creating booking:", error);
      return { status: false, message: "Database error." };
    }
  }

  async getBookingByUserAndEvent(
    userId: number,
    eventId: number
  ): Promise<any> {
    try {
      const booking = await db("bookings")
        .where({ user_id: userId, event_id: eventId })
        .first();
      return booking
        ? { status: true, data: booking }
        : { status: false, message: "Booking not found." };
    } catch (error) {
      console.error("Error fetching booking by user and event:", error);
      return { status: false, message: "Database error." };
    }
  }

  async updateBooking(
    bookingId: number,
    updatedData: Partial<BookingInterface>
  ): Promise<any> {
    try {
      const updated = await db("bookings")
        .where("_id", bookingId)
        .update(updatedData, ["_id"]);

      if (!updated.length) {
        return {
          status: false,
          message: "Failed to update booking. Booking not found.",
        };
      }

      const updatedBooking = await db("bookings").where("_id", bookingId).first();
      return { status: true, data: updatedBooking };
    } catch (error) {
      console.error("Error updating booking:", error);
      return { status: false, message: "Database error." };
    }
  }

  async updateUserBookingsAndEarnings(
    userId: number,
    eventId: number,
    bookingAmount: number
  ): Promise<any> {
    try {
      
      const user = await db("users").where("_id", userId).first();
      if (user) {
        const currentBookings = user.bookings ? JSON.parse(user.bookings) : [];
        if (!currentBookings.includes(eventId)) {
          currentBookings.push(eventId);
          await db("users").where("_id", userId).update({
            bookings: JSON.stringify(currentBookings),
          });
        }
      }

      
      const event = await db("events").where("_id", eventId).first();
      if (!event) throw new Error("Event not found for earnings update.");

      const organizerId = event.org_id;
      const organizer = await db("users").where("_id", organizerId).first();
      if (organizer) {
        const updatedEarnings = (organizer.earnings || 0) + bookingAmount;
        await db("users").where("_id", organizerId).update({
          earnings: updatedEarnings,
        });
      }

      return { status: true };
    } catch (error) {
      console.error("Error updating bookings and earnings:", error);
      return {
        status: false,
        message: "Failed to update bookings and earnings.",
      };
    }
  }

  private async getBookingsByStatus(
    userId: number,
    status: string
  ): Promise<any> {
    try {
      const bookingList = await db("bookings")
        .select("event_id", "sub_event_items")
        .where({ user_id: userId, status, is_main: 1 });

      if (!bookingList.length) {
        return { status: false, message: "No bookings found.", data: [] };
      }

      const eventsWithSubEvents = await Promise.all(
        bookingList.map(async (booking) => {
          const event = await db("events").where("_id", booking.event_id).first();
          if (!event) return null;

          const subEventIds = JSON.parse(booking.sub_event_items || "[]");
          const subEvents = await db("subevents").whereIn("_id", subEventIds);

          return {
            event,
            sub_events: subEvents,
          };
        })
      );

      return {
        status: true,
        message: "Event data with sub-events retrieved successfully.",
        data: eventsWithSubEvents.filter(Boolean),
      };
    } catch (error) {
      console.error("Error fetching bookings by status:", error);
      return {
        status: false,
        message: "An error occurred while fetching event data.",
        data: [],
      };
    }
  }

  async getPendingBookingList(userId: number): Promise<any> {
    return await this.getBookingsByStatus(userId, "pending");
  }

  async getBookedEventsList(userId: number): Promise<any> {
    return await this.getBookingsByStatus(userId, "confirmed");
  }

  async getCancelledBookings(userId: number): Promise<any> {
    return await this.getBookingsByStatus(userId, "cancelled");
  }
}
