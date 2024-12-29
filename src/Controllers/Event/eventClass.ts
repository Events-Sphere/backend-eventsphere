import { EventInterface } from "../../Interfaces/eventInterface";
import db from "../../Config/knex";

export class EventClass {
  createEvent = async (
    eventData: EventInterface,
    filePathsArray: any
  ) : Promise<{}> => {
    return new Promise(async (resolve, reject) => {
      try {
        const [eventId] = await db("events").insert(eventData, ["_id"]);
        const subEventValues = eventData.sub_events.map(
          (subEvent: any, index: number) => ({
            event_id: eventId,
            name: subEvent.name,
            description: subEvent.description,
            images: JSON.stringify(filePathsArray[index + 2]),
            video_url: subEvent.video_url || null,
            start_date: subEvent.start_date,
            start_time: subEvent.start_time,
            end_time: subEvent.end_time,
            host_name: subEvent.host_name,
            country_code: subEvent.country_code,
            host_mobile: subEvent.host_mobile,
            host_email: subEvent.host_email,
            ticket_type: subEvent.ticket_type,
            ticket_price: subEvent.ticket_price,
            ticket_qty: subEvent.ticket_qty,
          })
        );
       const response = await db("sub_events").insert(subEventValues);
       resolve({ status:true, response : response});
      } catch {
        reject({status:false , response:null});
      }
    });
  };
}
