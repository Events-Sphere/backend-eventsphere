import db from "../../Config/knex";
import { BookingInterface } from "../../Interfaces/bookingsInterface";
import { FormatDateAndTime } from "../../Utililes/formatDateAndTime";

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
      const newBooking = await db("bookings").where("_id", newBookingId);
      console.log("newBookingID : " ,newBookingId)
      console.log("newBooking : " ,newBooking)
      return { status: true, data: bookingData };
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
console.log(updated)
      // if (!updated.length) {
      //   return {
      //     status: false,
      //     message: "Failed to update booking. Booking not found.",
      //   };
      // }
      // if (updated >= 0) {
      //   return {
      //     status: false,
      //     message: "Failed to update booking. Booking not found.",
      //   };
      // }

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
    bookingAmount?: number
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
      if (!event)
        return {status : false}; 
      
      const organizerId = event.org_id;
      const organizer = await db("organizations").where("_id", organizerId).first();
      if (organizer) {
        const updatedEarnings = (organizer.total_earnings || 0) + bookingAmount;
        await db("organizations").where("_id", organizerId).update({
          total_earnings: updatedEarnings,
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
      // const bookingList = await db("bookings")
      //   .select("event_id", "sub_event_items")
      //   .where({ user_id: userId, status, is_main: 1 });
      const bookingList = await db("bookings")
        .select("*")
        .where({ user_id: userId, status});

      if (!bookingList.length) {
        return { status: true, message: "No bookings found.", data: [] };
      }

      const eventsWithSubEvents:any = await Promise.all(
        bookingList.map(async (booking) => {
          const event = await db("events").where("_id", booking.event_id).first();
          if (!event) return null;

          
      const updatedEvents={...event,id:event._id};
      delete updatedEvents._id;
    
          const subEventIds = JSON.parse(booking.sub_event_items || "[]");
          const subEvents = await db("subevents").whereIn("_id", subEventIds);
          const updatedSubEvents:any=subEvents.map(({_id,...data}:any)=>({
            id:_id,
            ...data
          }))
          // const updatedSubEvents:any=subEvents.map(({_id,...data}:any)=>({
          //   id:_id,
          //   ...data
          // }));

console.log("event.org_id",event.org_id);

          const organizerDetail1=await db("users").where("_id",event.org_id);
          console.log(organizerDetail1)
          const organizerDetail2:any=await db("organizations").where("_id",event.org_id);
          
          

          return {
            bookingData:{
              bookingId:booking._id,
              bookingCreatedAt:booking.createdAt,
              isMain:booking.is_main,
              paymentId:booking.payment_ids,
              paymentMethod:booking.payment_method,
              amount:booking.amount,
              status:booking.status
            },
            organizerData:{
              organizationName:organizerDetail2[0].name,
              organizationCode:organizerDetail2[0].code,
              organizationNoc:organizerDetail2[0].noc,
              organizerName:organizerDetail1[0].name,
              organizerEmail:organizerDetail1[0].name,
              organizerMobile:organizerDetail1[0].name,
              organizerCountryCode:organizerDetail1[0].name,
              organizerProfile:organizerDetail1[0].profile,
              organizerLocation:organizerDetail1[0].location,
              organizerLongitude:organizerDetail1[0].name,
              organizerLatitude:organizerDetail1[0].name,
            },
           eventData: {...updatedEvents,
            sub_events: updatedSubEvents,}
          };

        })
      );
      console.log(eventsWithSubEvents)
      
      eventsWithSubEvents.forEach((data:any)=>{
        
        data.eventData.starting_date= FormatDateAndTime.formatDate(data.eventData.starting_date);
        data.eventData.ending_date= FormatDateAndTime.formatDate(data.eventData.ending_date);
        data.eventData.registration_start= FormatDateAndTime.formatDate(data.eventData.registration_start);
        data.eventData.registration_end= FormatDateAndTime.formatDate(data.eventData.registration_end);
       data.eventData.sub_event_items=JSON.parse(data.eventData.sub_event_items)
       data.eventData.tags=JSON.parse(data.eventData.tags)
        data.eventData.cover_images=JSON.parse(data.eventData.cover_images)
        data.eventData.sub_event_items=JSON.parse(data.eventData.sub_event_items)
        data.eventData.sub_events.forEach((subevent:any)=>{
          subevent.cover_images=JSON.parse(subevent.cover_images)
          subevent.restrictions=JSON.parse(subevent.restrictions)
          subevent.starting_date= FormatDateAndTime.formatDate(subevent.starting_date);
        })
      })
//  eventsWithSubEvents.forEach((data:any)=>{
        
//         data.starting_date= FormatDateAndTime.formatDate(data.starting_date);
//         data.ending_date= FormatDateAndTime.formatDate(data.ending_date);
//         data.registration_start= FormatDateAndTime.formatDate(data.registration_start);
//         data.registration_end= FormatDateAndTime.formatDate(data.registration_end);
//         data.sub_event_items=JSON.parse(data.sub_event_items)
//         data.tags=JSON.parse(data.tags)
//         data.cover_images=JSON.parse(data.cover_images)
//         data.sub_event_items=JSON.parse(data.sub_event_items)
//         data.sub_events.forEach((subevent:any)=>{
//           subevent.cover_images=JSON.parse(subevent.cover_images)
//           subevent.restrictions=JSON.parse(subevent.restrictions)
//           subevent.starting_date= FormatDateAndTime.formatDate(subevent.starting_date);

//         })
//       })





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
