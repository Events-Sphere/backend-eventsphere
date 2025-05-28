import { isNull } from "util";
import db from "../Config/knex";
import { MainEventInterface, SubEventInterface } from "../Interfaces/eventInterface";
import { eventNames } from "process";
import { tableName } from "../tables/table";
import { table } from "console";

interface DashboardStats {
    activeEventsCount: number;
    pendingEventsCount: number;
    completedEventsCount: number;
    bookedEventsCount: number;
    totalEventsCount: number;
    totalEarnings: number;
    weeklyEvents: any[];
}



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
        const query = db(tableName.EVENTS).select("*").where("status", status);
        const events = await query;
        if (!events || events.length === 0) {
            return [];
        }
        const eventsWithSubEvents = await Promise.all(
            events.map(async (event: any) => {

                const subEventIds = JSON.parse(event.sub_event_items || "[]");
                const subEvents = subEventIds.length
                    ? await db(tableName.SUBEVENTS)
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
        const [eventId] = await db(tableName.EVENTS)
            .insert(mainEventData)
        // .returning("_id");
        console.log(`event ID : ${eventId}`)
        let subEventIds = [];
        for (let subEvent of subEventData) {
            subEvent.event_id = eventId;
            const [sub] = await db(tableName.SUBEVENTS).insert(subEvent);
            subEventIds.push(sub);
        }
        const subEvent = await db(tableName.EVENTS)
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

    _isNull = (value: any): boolean => {
        return value === null || value === undefined;
    };


    getOrganizationDashboardStats = async (orgId: number): Promise<DashboardStats> => {
        const defaultStats: DashboardStats = {
            activeEventsCount: 0,
            pendingEventsCount: 0,
            completedEventsCount: 0,
            bookedEventsCount: 0,
            totalEventsCount: 0,
            totalEarnings: 0,
            weeklyEvents: []
        };
        const [org] = await db("es_organizations").select("*").where("_id", orgId);


        if (!org) {
            console.warn(`Organization with ID ${orgId} not found.`);
            return defaultStats;
        }

        const eventData = await db("events").select("*").whereIn("verified_status", ["active", "pending"]);

        const activeEvents = (this._isNull(org.active_events)) ? [] : JSON.parse(org.active_events || "[]");
        const pendingEvents = (this._isNull(org.pending_events)) ? [] : JSON.parse(org.pending_events || "[]");
        const completedEvents = (this._isNull(org.completed_events)) ? [] : JSON.parse(org.completed_events || "[]");
        // const bookedEvents = JSON.parse(org.booked_events || "[]");
        const weeklyEvents: any[] = (this._isNull(eventData[0]) ? [] : eventData);

        return {
            activeEventsCount: Array.isArray(activeEvents) ? activeEvents.length : 0,
            pendingEventsCount: Array.isArray(pendingEvents) ? pendingEvents.length : 0,
            completedEventsCount: Array.isArray(completedEvents) ? completedEvents.length : 0,
            bookedEventsCount:
                0,
            // Array.isArray(org.booked_events) ? org.booked_events.length : 0
            totalEventsCount: typeof org.events_counts === "number" ? org.events_counts : 0,
            totalEarnings: org.total_earnings,
            weeklyEvents: Array.isArray(weeklyEvents) ? eventData.reverse() : []
        };

    };

}

export default EventClass;