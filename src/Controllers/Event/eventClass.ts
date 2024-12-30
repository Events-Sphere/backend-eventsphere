import { EventInterface, MainEventInterface, SubEventInterface } from "../../Interfaces/eventInterface";
import db from "../../Config/knex";

export class EventClass {
  createEvent = async (
    mainEventData: MainEventInterface,
    subEventData: any[]
  ): Promise<{ status: boolean; data: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const [eventId] = await db("events").insert(mainEventData);
       for(let subEvent in subEventData){
           await db("sub_events").insert(subEvent);
        }
        resolve({ status: true, data: eventId});
      } catch (error) {
        console.error("Error creating event:", error);
        reject({ status: false, data: null });
      }
    });
  };

  updatePendingEvents = async (
    orgId: any,
    currentEvents: any[]
  ): Promise<{ status: boolean; data: any }> => {
    try {
      const [{ events_counts, pending_events }] = await db
        .select("events_counts", "pending_events")
        .from("organizations")
        .where("_id", "=", orgId);

      const totalCount = Number.parseInt(events_counts) + 1;
      const updatedPendingEvents = pending_events.filter(
        (event: any) => !currentEvents.includes(event)
      );

      await db("organizations")
        .where("_id", "=", orgId)
        .update({
          events_counts: totalCount,
          pending_events: JSON.stringify(updatedPendingEvents),
        });

      return { status: true, data: { totalCount, updatedPendingEvents } };
    } catch (error) {
      console.error("Error updating pending events:", error);
      return { status: false, data: null };
    }
  };


}

