import {
  MainEventInterface,
  SubEventInterface,
} from "../../Interfaces/eventInterface";
import db from "../../Config/knex";
import { FormatDateAndTime } from "../../Utililes/formatDateAndTime";

export class EventClass {
  createEvent = async (
    mainEventData: MainEventInterface,
    subEventData: SubEventInterface[]
  ): Promise<{ status: boolean; data?: any }> => {
    try {
      const [eventId] = await db("events")
        .insert(mainEventData)
        .returning("_id");

      let subEventIds = [];

      for (let subEvent of subEventData) {
        subEvent.event_id = eventId;
        const [sub] = await db("subevents").insert(subEvent);
        subEventIds.push(sub);
      }
      console.log(subEventIds)
      const subEvent = await db("events")
        .where({ _id: eventId })
        .update({
          sub_event_items: JSON.stringify(subEventIds),
        });

      return { status: true, data: eventId };
    } catch (error) {
      console.error("Error creating event:", error);
      return { status: false, data: null };
    }
  };

  createSubEventById = async (
    eventId: number,
    subEventData: SubEventInterface
  ): Promise<{ status: boolean; data?: any; message?: string }> => {
    try {
      const [newId] = await db("subevents").insert({
        ...subEventData,
        event_id: eventId,
      });

      return newId ? { status: true, data: newId } : { status: false };
    } catch (error) {
      console.error("Error creating sub-event:", error);
      return { status: false, message: "An error occurred." };
    }
  };

  updateEvent = async (
    eventId: number,
    updatedMainEventData: MainEventInterface,
    updatedSubEvents: SubEventInterface[],
    subEventIdsToDelete: any,
    existingSubEventIds: any[],
    newSubEventIds: any[]
  ) => {
    try {
      await db.transaction(async (trx) => {
        await trx("events")
          .update(updatedMainEventData)
          .where("_id", "=", eventId);

        for (let subEvent of updatedSubEvents) {
          const existingSubEvent = await trx("subevents")
            .select("*")
            .where("_id", subEvent._id)
            .first();

          existingSubEvent
            ? await trx("subevents").update(subEvent).where("_id", subEvent._id)
            : await trx("subevents").insert(subEvent);
        }

        for (let subEventId of subEventIdsToDelete) {
          await trx("subevents").where("_id", "=", subEventId).del();
        }

        const allSubEventIds = [
          ...existingSubEventIds.filter(
            (id) => !subEventIdsToDelete.includes(id)
          ),
          ...newSubEventIds,
        ];
        await trx("events")
          .update({ sub_event_items: JSON.stringify(allSubEventIds) })
          .where("_id", "=", eventId);
      });
      return { status: true };
    } catch (error) {
      console.error("Error updating event:", error);
      return { status: false };
    }
  };

  getEventById = async (
    eventId: number
  ): Promise<{ status: boolean; data?: any; message?: string }> => {
    try {
      const mainEvent = await db("events")
        .select("*")
        .where("_id", "=", eventId)
        .first();

      return mainEvent ? { status: true, data: mainEvent } : { status: false };
    } catch (error) {
      console.error("Error fetching event:", error);
      return { status: false, message: "An error occurred." };
    }
  };

  getPendingEventList = async (userId: number): Promise<any> => {
    return this.getEventsByStatus("pending", userId);
  };

  getAllPendingEventList = async (): Promise<any> => {
    return this.getEventsByStatus("pending");
  };

  getAllCompletedEventList = async (): Promise<any> => {
    return this.getEventsByStatus("completed");
  };

  getCompletedEventList = async (orgId: number): Promise<any> => {
    return this.getEventsByStatus("completed", orgId);
  };

  getActiveEventList = async (userId: number): Promise<any> => {
    return this.getEventsByStatus("active", userId);
  };

  getAllActiveEventList = async (): Promise<any> => {
    return this.getEventsByStatus("active");
  };

  getRejectedEventList = async (userId: number): Promise<any> => {
    return this.getEventsByStatus("rejected", userId);
  };

  getAllRejectedEventList = async (): Promise<any> => {
    return this.getEventsByStatus("rejected");
  };

  private getEventsByStatus = async (
    status: string,
    orgId?: number
  ): Promise<any> => {
    try {
      const query = db("events").select("*").where("active_status", status);

      if (orgId) {
        query.andWhere("org_id", orgId);
      }

      const events = await query;
    

      if (!events || events.length === 0) {
        return { status: true, data: [] };
      }

      const eventsWithSubEvents = await Promise.all(
        events.map(async (event: any) => {
          const subEventIds = JSON.parse(event.sub_event_items || "[]");

          const subEvents = subEventIds.length
            ? await db("subevents")
                .whereIn("_id", subEventIds)
                .where("event_id", event._id)
            : [];

          const subEventsWithImages = subEvents.map((subEvent: any) => ({
            ...subEvent,
            cover_images: JSON.parse(subEvent.cover_images || "[]"),
          }));

          const  parsedEventData = {...event, cover_images:JSON.parse(event.cover_images), tags : JSON.parse(event.tags)};
          // restrictions : JSON.parse(event.restrictions)
          return { ...parsedEventData, sub_events: subEventsWithImages };
        })
      );
      

      return {
        status: true,
        data: eventsWithSubEvents,
      };
    } catch (error) {
      console.error(`Error fetching ${status} events:`, error);
      return {
        status: false,
        data: [],
      };
    }
  };

  getAllEventList = async (): Promise<any> => {
    try {
      const events = await db("events").select("*");

      if (!events || events.length === 0) {
        return {
          status: false,
          data: [],
        };
      }
      const eventsWithSubEvents = await Promise.all(
        events.map(async (event: any) => {
          const subEventIds = JSON.parse(event.sub_event_items || "[]");
          const subEvents = subEventIds.length
            ? await db("subevents").whereIn("_id", subEventIds)
            : [];
          return { ...event, sub_events: subEvents };
        })
      );

      return {
        status: true,
        data: eventsWithSubEvents,
      };
    } catch (error) {
      console.error("Error fetching all events:", error);
      return {
        status: false,
        data: [],
      };
    }
  };

  getAllEventsById = async (userId: number): Promise<any> => {
    try {
      const events = await db("events").where("org_id", userId).select("*");
console.log(events)
      if (!events || events.length === 0) {
        return {
          status: false,
          data: [],
        };
      }
      const eventsWithSubEvents = await Promise.all(
        events.map(async (event: any) => {
          const subEventIds = JSON.parse(event.sub_event_items || "[]");
          const subEvents = subEventIds.length
            ? await db("subevents").whereIn("_id", subEventIds)
            : [];
          return { ...event, sub_events: subEvents };
        })
      );

      return {
        status: true,
        data: eventsWithSubEvents,
      };
    } catch (error) {
      console.error(`Error fetching events for user ID: ${userId}:`, error);
      return {
        status: false,
        data: [],
      };
    }
  };

  updateOrganizationPendingEvent = async (
    orgId: number,
    eventId: number
  ): Promise<{ status: boolean }> => {
    try {
      const result: any[] = await db("organizations")
        .select("pending_events")
        .where("_id", orgId);

      if (result.length === 0) {
        return { status: false };
      }

      const existingPendingEvents = result[0].pending_events || [];
      const updatedPendingEvents = [
        ...new Set([...existingPendingEvents, eventId]),
      ];

      await db("organizations")
        .where("_id", orgId)
        .update({ pending_events: updatedPendingEvents });

      return { status: true };
    } catch (error) {
      console.error("Error updating pending events:", error);
      return { status: false };
    }
  };

  updateOrganizationEventCounts = async (
    orgId: any,
    amount: number,
    currentEvents: any[]
  ): Promise<{ status: boolean; data: any }> => {
    try {
      const [{ events_counts, pending_events, total_earnings }] = await db
        .select("events_counts", "pending_events", "total_earnings")
        .from("organizations")
        .where("_id", orgId);

      const totalCount = Number(events_counts) + 1;
      const totalEarnings = total_earnings + amount;
      const updatedPendingEvents = pending_events.filter(
        (event: any) => !currentEvents.includes(event)
      );

      await db("organizations")
        .where("_id", orgId)
        .update({
          events_counts: totalCount,
          pending_events: JSON.stringify(updatedPendingEvents),
          total_earnings: totalEarnings,
        });

      return { status: true, data: { totalCount, updatedPendingEvents } };
    } catch (error) {
      console.error("Error updating organization event counts:", error);
      return { status: false, data: null };
    }
  };
  // New York, USA
  searchEventList = async ({
    queryText,
    tempLocation,
    tempCategory,
  }: {
    queryText?: string;
    tempLocation?: string[];
    tempCategory?: string[];
  }): Promise<any> => {
    try {
      console.log(queryText);
      console.log(tempLocation);
      console.log(tempCategory)
      if(!queryText &&Array.isArray(tempLocation) && tempLocation.length <= 0 &&Array.isArray(tempCategory) && tempCategory.length <= 0){
        return {
          status:true,
          data: [],
        };

      }
      const query = db("events").select("*")
     .where("name", "like", `%${queryText}%`)
    //   .andWhere("location", "in", Array.isArray(tempLocation)?tempLocation : [])
    //  .andWhere("category", "in", Array.isArray(tempCategory)?tempCategory : []);
    if (Array.isArray(tempLocation) && tempLocation.length > 0) {
      query.andWhere("location", "in", tempLocation);
    }
    
    if (Array.isArray(tempCategory) && tempCategory.length > 0) {
      query.andWhere("category", "in", tempCategory);
    }

      // const query = db("events").select("*");
      // if (queryText) query.where("name", "like", `%${queryText}%`);
      // if (tempLocation!.length > 0) query.andWhere("location", "in", tempLocation)
      // if (tempCategory) query.andWhere("category", "in", tempCategory);
     
      const mainEvents = await query;

      const updatedEvents=mainEvents.map(({_id,...data})=>({
        id:_id,
        ...data
      }))

      const eventsWithSubEvents = await Promise.all(
        updatedEvents.map(async (event: any) => {
          console.log("eeeeeeeeeee"+event.sub_event_items)
          const subEventIds = JSON.parse(event.sub_event_items || "[]");
          const subEvents = subEventIds.length
            ? await db("subevents").select("*").whereIn("_id", subEventIds)
            : [];

            
            const updatedSubEvents:any=subEvents.map(({_id,...data}:any)=>({
              id:_id,
              ...data
            }))
            const organizerDetail1=await db("users").where("_id",event.org_id);
          
          const organizerDetail2:any=await db("organizations").where("_id",event.org_id);




          return {
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
             eventData:{
              ...event, sub_events: updatedSubEvents
             } 
            };
        })
      );
      eventsWithSubEvents.forEach(data=>{
        console.log("hhhhhhhh",data.eventData.sub_event_items);
        
        data.eventData.starting_date= FormatDateAndTime.formatDate(data.eventData.starting_date);
        data.eventData.ending_date= FormatDateAndTime.formatDate(data.eventData.ending_date);
        data.eventData.registration_start= FormatDateAndTime.formatDate(data.eventData.registration_start);
        data.eventData.registration_end= FormatDateAndTime.formatDate(data.eventData.registration_end);
        data.eventData.sub_event_items=JSON.parse(data.eventData.sub_event_items)
        if (!Array.isArray(data.eventData.sub_event_items)) {
          console.log("--------------");
          data.eventData.sub_event_items = [data.eventData.sub_event_items]; 
      }
      console.log("Parsed:", data.eventData.sub_event_items, "Type:", typeof data.eventData.sub_event_items);
      console.log("hhhhhhhh",data.eventData.sub_event_items);
        data.eventData.tags=JSON.parse(data.eventData.tags)
        data.eventData.cover_images=JSON.parse(data.eventData.cover_images)
       
        data.eventData.sub_events.forEach((subevent:any)=>{
          subevent.cover_images=JSON.parse(subevent.cover_images)
          subevent.restrictions=JSON.parse(subevent.restrictions)
          subevent.starting_date= FormatDateAndTime.formatDate(subevent.starting_date);

        })
      });

console.log("VEVET",eventsWithSubEvents[0].eventData.sub_event_items);

      return {
        status: true,
        data: eventsWithSubEvents,
      };
    } catch (error) {
      console.error("Error searching events:", error);
      return { status: false, message: "An error occurred.", data: [] };
    }
  };

  // searchEventsByStatus = async ({
  //   queryText,
  //   status,
  // }: {
  //   queryText?: string;
  //   status?: string;
  // }): Promise<any> => {
  //   return this.searchEventList({ queryText, category: status });
  // };

  getPopularEventList = async (): Promise<any> => {
    try {
      const popularEvents = await db("bookings")
        .select("event_id")
        .count("* as bookings_count")
        .groupBy("event_id")
        .orderBy("bookings_count", "desc")
        .limit(10);

      const eventDetails = await Promise.all(
        popularEvents.map(async (event: any) => {
          const eventData = await db("events")
            .where("_id", event.event_id)
            .first();
          if (eventData) {
            const subEventIds = JSON.parse(eventData.sub_event_items || "[]");
            const subEvents = subEventIds.length
              ? await db("subevents").whereIn("_id", subEventIds)
              : [];
            return {
              ...eventData,
              bookings_count: event.bookings_count,
              sub_events: subEvents,
            };
          }
          return null;
        })
      );

      return {
        status: true,
        data: eventDetails.filter(Boolean),
      };
    } catch (error) {
      console.error("Error fetching popular events:", error);
      return { status: false, message: "An error occurred.", data: [] };
    }
  };

  getUpcomingEventList = async (): Promise<any> => {
    try {
      const upcomingEvents = await db("events")
        .select("*")
        // .where("starting_date", ">", new Date())
        // .orderBy("starting_date", "asc");
        
       const updatedUpcomingEvents=upcomingEvents.map(({_id,...data})=>({
          id:_id,
          ...data
        }))



      const eventsWithSubEvents = await Promise.all(
        updatedUpcomingEvents.map(async (event: any) => {
          const subEventIds = JSON.parse(event.sub_event_items || "[]");
          const subEvents = subEventIds.length
            ? await db("subevents").whereIn("_id", subEventIds)
            : [];

            const updatedSubEvents:any=subEvents.map(({_id,...data}:any)=>({
              id:_id,
              ...data
            }));;


            const organizerDetail1=await db("users").where("_id",event.org_id);
        
          const organizerDetail2:any=await db("organizations").where("_id",event.org_id);


          return {
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
             eventData:{
              ...event, sub_events: updatedSubEvents
             } 
            };
        })
      );

      

      eventsWithSubEvents.forEach(data=>{
        console.log(data.eventData.starting_date)
        data.eventData.starting_date= FormatDateAndTime.formatDate(data.eventData.starting_date);
        console.log(data.eventData.starting_date)
        data.eventData.ending_date= FormatDateAndTime.formatDate(data.eventData.ending_date);
        data.eventData.registration_start= FormatDateAndTime.formatDate(data.eventData.registration_start);
        data.eventData.registration_end= FormatDateAndTime.formatDate(data.eventData.registration_end);
        data.eventData.sub_event_items=JSON.parse(data.eventData.sub_event_items)
        data.eventData.tags=JSON.parse(data.eventData.tags)
        data.eventData.cover_images=JSON.parse(data.eventData.cover_images)
       
        data.eventData.sub_events.forEach((subevent:any)=>{
          subevent.cover_images=JSON.parse(subevent.cover_images)
          subevent.restrictions=JSON.parse(subevent.restrictions)
          subevent.starting_date= FormatDateAndTime.formatDate(subevent.starting_date);

        })
      })

      return {
        status: true,
        data: eventsWithSubEvents,
      };
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      return { status: false, message: "An error occurred.", data: [] };
    }
  };

  updateEventStatus = async ({
    eventId,
    approveIds,
    rejectIds,
    reasons,
  }: {
    eventId: number;
    approveIds: number[];
    rejectIds: number[];
    reasons: string[];
  }): Promise<any> => {
    try {
      if (approveIds?.length > 0) {
        await db("subevents")
          .where("event_id", eventId)
          .whereIn("_id", approveIds)
          .update({ status: "available" });
      }

      if (rejectIds?.length > 0) {
        for (let i = 0; i < rejectIds.length; i++) {
          await db("subevents")
            .where("event_id", eventId)
            .where("_id", rejectIds[i])
            .update({ status: "cancelled", denial_reason: reasons[i] });
        }
      }

      const result = await db("subevents")
        .select("org_id")
        .count("_id as count")
        .where("event_id", eventId)
        .first();

      const totalProcessed = approveIds.length + rejectIds.length;

      if (result?.count === totalProcessed) {
        await db("events")
          .where("_id", eventId)
          .update({ status: 1, active_status: "active" });

        const organizerEventStatus = await db("organizations")
          .select("pending_events", "active_events")
          .where("_id", result?.org_id)
          .first();

        if (organizerEventStatus) {
          const { pending_events, active_events } = organizerEventStatus;

          const updatedPendingEvents = (pending_events || []).filter(
            (eventID: number) => eventID !== eventId
          );

          if (!active_events?.includes(eventId)) {
            active_events.push(eventId);
          }

          await db("organizations")
            .where("_id", result?.org_id)
            .update({
              pending_events: JSON.stringify(updatedPendingEvents),
              active_events: JSON.stringify(active_events),
            });
        }
        return { status: true };
      }

      return { status: false };
    } catch (error) {
      console.error("Error updating event status:", error);
      return {
        status: false,
        message: "An error occurred while updating event status.",
      };
    }
  };

  getEventsByCategoryName = async (categoryName: string): Promise<any> => {
    try {
      const eventsByCategory = await db("events")
        .select("*")
        .where("category", categoryName);

      if (!eventsByCategory || eventsByCategory.length === 0) {
        return {
          status: true,
          data: [],
        };
      }

      const eventsWithSubEvents = await Promise.all(
        eventsByCategory.map(async (event: any) => {
          const subEventIds = JSON.parse(event.sub_event_items || "[]");
          const subEvents = subEventIds.length
            ? await db("subevents").whereIn("_id", subEventIds)
            : [];

            const organizerDetail1=await db("users").where("_id",event.org_id);
          console.log(organizerDetail1)
          const organizerDetail2:any=await db("organizations").where("_id",event.org_id);



          return {
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
             eventData:{
              ...event, sub_events: subEvents
             } 
            };
        })
      );
      eventsWithSubEvents.forEach(data=>{
        
        data.eventData.starting_date= FormatDateAndTime.formatDate(data.eventData.starting_date);
        data.eventData.ending_date= FormatDateAndTime.formatDate(data.eventData.ending_date);
        data.eventData.registration_start= FormatDateAndTime.formatDate(data.eventData.registration_start);
        data.eventData.registration_end= FormatDateAndTime.formatDate(data.eventData.registration_end);
        data.eventData.sub_event_items=JSON.parse(data.eventData.sub_event_items)
        data.eventData.tags=JSON.parse(data.eventData.tags)
        data.eventData.cover_images=JSON.parse(data.eventData.cover_images)
      
        data.eventData.sub_events.forEach((subevent:any)=>{
          subevent.cover_images=JSON.parse(subevent.cover_images)
          subevent.restrictions=JSON.parse(subevent.restrictions)
          subevent.starting_date= FormatDateAndTime.formatDate(subevent.starting_date);

        })
      })



      return {
        status: true,
        data: eventsWithSubEvents,
      };
    } 
    


    catch (error) {
      console.error("Error fetching events by category:", error);
      return {
        status: false,
        data: [],
      };
    }
  };
}
