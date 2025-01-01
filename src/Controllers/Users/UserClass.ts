import db from "../../Config/knex";

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
        return { status: false, message: "No favorite events found.", data: [] };
      }

      const favoriteEventIds = JSON.parse(user.favorite_events);

      const events = await db("events").whereIn("_id", favoriteEventIds);

      const eventsWithSubEvents = await Promise.all(
        events.map(async (event: any) => {
          const subEventIds = JSON.parse(event.sub_event_items || "[]");
          const subEvents = subEventIds.length ? await db("subevents").whereIn("_id", subEventIds) : [];
          return {
            ...event,
            sub_events: subEvents,
          };
        })
      );

      return { status: true, message: "Favorite events retrieved successfully.", data: eventsWithSubEvents };
    } catch (error) {
      console.error("Error fetching favorite events:", error);
      return { status: false, message: "Failed to retrieve favorite events.", data: [] };
    }
  };
}