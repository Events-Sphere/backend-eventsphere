import { NextFunction } from "express";
import db from "../Config/knex";
import CustomError from "../Utililes/customError";
import { FormatDateAndTime } from "../Utililes/formatDateAndTime";
import { log } from "console";

class UserFavouriteEventClass{
    private isUserExistsOnId = async (
        id: number,
      ) => {
            const user: any = await db
              .select("*")
              .from("users")
              .where("_id", id)
              return user;
      };
    
  addFavoriteEvent = async (userId: number, favoriteId: number,next:NextFunction) => {
      const [user] = await this.isUserExistsOnId(userId);
      if (!user) {
        return next(new CustomError("User not found.",401))
      }
      const favoriteEvents = user.favorite_events ? JSON.parse(user.favorite_events) : [];
      if (favoriteEvents.includes(favoriteId)) {
        return { status: false, message: "Event is already in favorites.", data: null };
      }
      favoriteEvents.push(favoriteId);
      await db("users").where("_id", userId).update({
        favorite_events: JSON.stringify(favoriteEvents),
      });
      return favoriteEvents ;
  };


 public removeFavoriteEvent = async (userId: number, favoriteId: number,next:NextFunction) => {
    const [user] = await this.isUserExistsOnId(userId);
      if (!user) {
        return next(new CustomError("User not found.",401))
      }
      console.log(
        "user Id ==================="+userId)
      const favoriteEvents = user.favorite_events ? JSON.parse(user.favorite_events??[]) : [];
      // console.log(favoriteEvents)
      const updatedFavorites = favoriteEvents.filter((id: number) => id !== favoriteId);
      await db("users").where("_id", userId).update({
        favorite_events: JSON.stringify(updatedFavorites),
      });
      // console.log(updatedFavorites);
      
      return  updatedFavorites ;
  };

  
  getFavoriteEventList =  async (userId: number,next:NextFunction) => {
  const [user] = await this.isUserExistsOnId(userId);
    if (!user) {
      return next(new CustomError("User not found.",401))
    }
      const favoriteEventIds = user.favorite_events ? JSON.parse(user.favorite_events??[]) : [];
      console.log(favoriteEventIds)
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
      });
      return  eventsWithSubEvents ;
  };
}

export default UserFavouriteEventClass;