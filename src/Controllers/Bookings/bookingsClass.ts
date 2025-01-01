import db from "../../Config/knex";
import { BookingInterface } from "../../Interfaces/bookingsInterface";
import { MainEventInterface, SubEventInterface } from "../../Interfaces/eventInterface";

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


  private getBookingsByStatus = async (
    userId: number,
    status: string
  ): Promise<any> => {
        try {

          const bookingPendingList = await db
            .select("event_id", "sub_event_items")
            .from("bookings")
            .where("user_id", userId)
            .andWhere("status", status)
            .andWhere("is_main", 1);
      
          if (bookingPendingList.length === 0) {
            return {
              status: false,
              message: "No bookings found.",
              data: [],
            };
          }
    
          const eventWithSubEventsList: { event: MainEventInterface; sub_events: SubEventInterface[] }[] = [];
      
          for (const booking of bookingPendingList) {
            
            const { event_id: eventId, sub_event_items: subEventItems } = booking;
      
            const eventDataRaw = await db("events").where("_id", eventId).first();
            if (!eventDataRaw) continue;
      
            const eventData: MainEventInterface = {
              _id: eventDataRaw._id,
              name: eventDataRaw.name,
              location: eventDataRaw.location,
              org_id: eventDataRaw.org_id,
              description: eventDataRaw.description,
              registration_start: eventDataRaw.registration_start,
              registration_end: eventDataRaw.registration_end,
              longitude: eventDataRaw.longitude,
              latitude: eventDataRaw.latitude,
              category: eventDataRaw.category,
              sub_event_items: eventDataRaw.sub_event_items,
              tags: eventDataRaw.tags,
              audience_type: eventDataRaw.audience_type,
              currency: eventDataRaw.currency,
              main_image: eventDataRaw.main_image,
              cover_images: eventDataRaw.cover_images,
              is_main: eventDataRaw.is_main,
            };
      

            const subEventIds = JSON.parse(subEventItems); 
            const subEventsDataRaw = await db("subevents").whereIn("_id", subEventIds);
      
            const subEventsData: SubEventInterface[] = subEventsDataRaw.map((subEvent: any) => ({
              _id: subEvent._id,
              event_id: subEvent.event_id,
              name: subEvent.name,
              description: subEvent.description,
              cover_images: subEvent.cover_images,
              video_url: subEvent.video_url ?? null,
              start_time: subEvent.start_time,
              end_time: subEvent.end_time,
              starting_date: subEvent.starting_date,
              hostedBy: subEvent.hostedBy,
              host_email: subEvent.host_email,
              host_mobile: subEvent.host_mobile,
              c_code: subEvent.c_code,
              ticket_quantity: subEvent.ticket_quantity,
              ticket_sold: subEvent.ticket_sold,
              ticket_type: subEvent.ticket_type,
              ticket_price: subEvent.ticket_price,
              earnings: subEvent.earnings,
              approvedBy: subEvent.approvedBy,
              approvedAt: subEvent.approvedAt,
              denial_reason: subEvent.denial_reason ?? null,
              restrictions: subEvent.restrictions,
            }));
      
            eventWithSubEventsList.push({
              event: eventData,
              sub_events: subEventsData,
            });
          }

          return {
            status: true,
            message: "Event data with sub-events retrieved successfully.",
            data: eventWithSubEventsList,
          };

        } catch (error) {
          return {
            status: false,
            message: "An error occurred while fetching event data.",
            data: [],
          };
        }  
  };
  
  getPendingBookingList = async (userId: number): Promise<any> => {
    return await this.getBookingsByStatus(userId, "pending");
  };
  
  getBookedEventsList = async (userId: number): Promise<any> => {
    return await this.getBookingsByStatus(userId, "confirmed");
  };

  getCancelledBookings = async (userId: number): Promise<any> => {
    return await this.getBookingsByStatus(userId, "cancelled");
  };

  
}
