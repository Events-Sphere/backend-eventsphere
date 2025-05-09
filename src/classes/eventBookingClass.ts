import db from "../Config/knex";
import { FormatDateAndTime } from "../Utililes/formatDateAndTime";



class EventBookingClass {

  private fetchBookingDeatils = async (userId: number, status: string) => {
    return await db("bookings")
      .select("*")
      .where({ user_id: userId, status });

  }

  public async getBookingsByStatus(
    userId: number,
    status: string
  ): Promise<any> {

    const bookingList = await this.fetchBookingDeatils(userId, status);
   

    if (bookingList.length <= 0) {
      return [];
    }

    const eventsWithSubEvents: any = await Promise.all(

      bookingList.map(async (booking) => {

        const event = await db("events").where("_id", booking.event_id).first();
        if (!event) return null;

     console.log(event)
        const updatedEvents = { ...event, id: event._id };
        delete updatedEvents._id;

        const subEventIds = JSON.parse(booking.sub_event_items || "[]");
        const subEvents = await db("subevents").whereIn("_id", subEventIds);
        const updatedSubEvents: any = subEvents.map(({ _id, ...data }: any) => ({
          id: _id,
          ...data
        }))

        const [organizer] = await db("users").where("_id", event.org_id);
      
        const [organization]: any = await db("organizations").where("_id", event.org_id);
        
        return {
          bookingData: {
            bookingId: booking._id,
            bookingCreatedAt: booking.createdAt,
            isMain: booking.is_main,
            paymentId: booking.payment_ids,
            paymentMethod: booking.payment_method,
            amount: booking.amount,
            status: booking.status
          },
          organizerData: {
            organizationName: organization.name,
            organizationCode: organization.code,
            organizationNoc: organization.noc,
            organizerName: organizer.name,
            organizerEmail: organizer.email,
            organizerMobile: organizer.mobile,
            organizerCountryCode: organizer.c_code,
            organizerProfile: organizer.profile,
            organizerLocation: organizer.location,
            organizerLongitude: organizer.longitude,
            organizerLatitude: organizer.latitude,
          },
          eventData: {
            ...updatedEvents,
            sub_events: updatedSubEvents,
          }
        };

      })
    );
  
     const format =FormatDateAndTime.formatDate;
     const parse=(data:any)=>JSON.parse(data || "[]")

    eventsWithSubEvents.forEach((data: any) => {
      
console.log(data.eventData.sub_event_items)
      data.eventData.starting_date = format(data.eventData.starting_date);
      data.eventData.ending_date = format(data.eventData.ending_date);
      data.eventData.registration_start = format(data.eventData.registration_start);
      data.eventData.registration_end = format(data.eventData.registration_end);
      data.eventData.sub_event_items = parse(data.eventData.sub_event_items)
      data.eventData.tags = parse(data.eventData.tags)
      data.eventData.cover_images = parse(data.eventData.cover_images)
   
      data.eventData.sub_events.forEach((subevent: any) => {
        
        subevent.cover_images = parse(subevent.cover_images)
        subevent.restrictions = parse(subevent.restrictions)
        subevent.starting_date = format(subevent.starting_date);
      })
    })

    return eventsWithSubEvents.filter(Boolean);
  }

}

export default EventBookingClass



