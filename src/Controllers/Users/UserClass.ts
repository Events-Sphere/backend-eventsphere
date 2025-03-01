import db from "../../Config/knex";
import { FormatDateAndTime } from "../../Utililes/formatDateAndTime";

export class User{
  
  addFavoriteEvent = async (userId: number, favoriteId: number): Promise<any> => {
    try {
      const user = await db("users").where("_id", userId).first();
      if (!user) {
        return { status: false, message: "User not found.", data: null };
      }

      const favoriteEvents = user.favorite_events ? JSON.parse(user.favorite_events) : [];
      if (favoriteEvents.includes(favoriteId)) {
        return { status: false, message: "Event is already in favorites.", data: null };
      }

      favoriteEvents.push(favoriteId);

      await db("users").where("_id", userId).update({
        favorite_events: JSON.stringify(favoriteEvents),
      });

      return { status: true, message: "Favorite event added successfully.", data: favoriteEvents };
    } catch (error) {
      console.error("Error adding favorite event:", error);
      return { status: false, message: "Failed to add favorite event.", data: null };
    }
  };

  
  removeFavoriteEvent = async (userId: number, favoriteId: number): Promise<any> => {
    try {
      const user = await db("users").where("_id", userId).first();
      if (!user) {
        return { status: false, message: "User not found.", data: null };
      }

      const favoriteEvents = user.favorite_events ? JSON.parse(user.favorite_events) : [];
      const updatedFavorites = favoriteEvents.filter((id: number) => id !== favoriteId);

      await db("users").where("_id", userId).update({
        favorite_events: JSON.stringify(updatedFavorites),
      });

      return { status: true, message: "Favorite event removed successfully.", data: updatedFavorites };
    } catch (error) {
      console.error("Error removing favorite event:", error);
      return { status: false, message: "Failed to remove favorite event.", data: null };
    }
  };

  
  getFavoriteEventList =  async (userId: number): Promise<any> => {
    try {
      const user = await db("users").where("_id", userId).first();
      if (!user || !user.favorite_events) {
        return { status: true, message: "No favorite events found.", data: [] };
      }

      const favoriteEventIds = JSON.parse(user.favorite_events);

      const events = await db("events").whereIn("_id", favoriteEventIds);

      const updatedFavorites=events.map(({_id,...data})=>({
        id:_id,
        ...data
      }))

      const eventsWithSubEvents = await Promise.all(
        updatedFavorites.map(async (event: any) => {
          const subEventIds = JSON.parse(event.sub_event_items || "[]");
          const subEvents = subEventIds.length ? await db("subevents").whereIn("_id", subEventIds) : [];

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




      return { status: true, message: "Favorite events retrieved successfully.", data: eventsWithSubEvents };
    } catch (error) {
      console.error("Error fetching favorite events:", error);
      return { status: false, message: "Failed to retrieve favorite events.", data: [] };
    }
  };
}