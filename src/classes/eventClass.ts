import db from "../Config/knex";
import { MainEventInterface, SubEventInterface } from "../Interfaces/eventInterface";

class EventClass {

    getEventById = async (
        eventId: number
    ) => {
        const mainEvent = await db("events")
            .select("*")
            .where("_id", "=", eventId)
            .first();
        if (mainEvent) return mainEvent
        return null

    };

    getEventsByStatus = async (
        status: string,
    ) => {
        const query = db("events").select("*").where("active_status", status);
        const events = await query;
        if (!events || events.length === 0) {
            return [];
        }
        const eventsWithSubEvents = await Promise.all(
            events.map(async (event: any) => {

                const subEventIds = JSON.parse(event.sub_event_items || "[]");
                const subEvents = subEventIds.length
                    ? await db("subevents")
                        .whereIn("_id", subEventIds)
                        .where("event_id", event._id)
                    : [];


                const subEventsWithImages = subEvents.map((subEvent: any) =>
                (
                    {
                        ...subEvent,
                        restrictions: subEvent.restrictions != undefined ? JSON.parse(subEvent.restrictions) : "[]",
                        cover_images: JSON.parse(subEvent.cover_images || "[]"),
                    }));





                const parsedEventData = {
                    ...event,
                    cover_images: JSON.parse(event.cover_images),
                    tags: JSON.parse(event.tags),
                };
                return { ...parsedEventData, sub_events: [...subEventsWithImages] };
            })
        );
        return eventsWithSubEvents;
    };

    getEventsByStatusAndOrganizerId = async (
        status: string,
        id: number
    ) => {
        const query = db("events").select("*").where("org_id", id).andWhere("active_status", status);
        const events = await query;
        if (!events || events.length === 0) {
            return [];
        }
        const eventsWithSubEvents = await Promise.all(
            events.map(async (event: any) => {
                const subEventIds = JSON.parse(event.sub_event_items || "[]");
                const subEvents = subEventIds.length
                    ? await db("subevents")
                        .whereIn("_id", subEventIds)
                        .where("event_id", event._id)
                    : [];
                const subEventsWithImages = subEvents.map((subEvent: any) =>
                (
                    {
                        ...subEvent,
                        restrictions: subEvent.restrictions != undefined ? JSON.parse(subEvent.restrictions) : "[]",
                        cover_images: JSON.parse(subEvent.cover_images || "[]"),
                    }));
                const parsedEventData = {
                    ...event,
                    cover_images: JSON.parse(event.cover_images),
                    tags: JSON.parse(event.tags),
                };
                return { ...parsedEventData, sub_events: { ...subEventsWithImages } };
            })
        );
        return eventsWithSubEvents;
    };

    createEvent = async (
        mainEventData: MainEventInterface,
        subEventData: SubEventInterface[]
    ) => {
        const [eventId] = await db("events")
            .insert(mainEventData)
        // .returning("_id");
        console.log(`event ID : ${eventId}`)
        let subEventIds = [];
        for (let subEvent of subEventData) {
            subEvent.event_id = eventId;
            const [sub] = await db("subevents").insert(subEvent);
            subEventIds.push(sub);
        }
        const subEvent = await db("events")
            .where({ _id: eventId })
            .update({
                sub_event_items: JSON.stringify(subEventIds),
            });
        return eventId;
    };


    updateOrganizationPendingEvent = async (
        orgId: number,
        eventId: number
    ) => {
        const result: any[] = await db("organizations")
            .select("pending_events")
            .where("_id", orgId);
        const existingPendingEvents = result[0].pending_events || [];
        const updatedPendingEvents = [
            ...new Set([...existingPendingEvents, eventId]),
        ];
        await db("organizations")
            .where("_id", orgId)
            .update({ pending_events: updatedPendingEvents });
        return true;

    };

    searchEvents = async (
        orgId: number,
        query: string,
        eventType: string = "active_events"
    ) => {
        const response: any[] = await db("es_organizations")
            .select(eventType)
            .where("_id", orgId);

        let eventsIds: number[] = [];

        if (response?.[0]?.[eventType]) {
            try {
                const value = response[0][eventType];
                eventsIds = Array.isArray(value) ? value : JSON.parse(value);
            } catch (err) {
                console.error("Failed to parse eventType field:", err);
            }
        }

        if (!Array.isArray(eventsIds) || eventsIds.length === 0) {
            return [];
        }

        const result: any[] = await db("events")
            .select("*")
            .whereIn("id", eventsIds)
            .andWhere("name", "like", `%${query}%`);

        return result;
    };

}

export default EventClass;