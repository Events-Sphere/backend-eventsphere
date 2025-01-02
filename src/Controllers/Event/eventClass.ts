import {
  MainEventInterface,
  SubEventInterface,
} from "../../Interfaces/eventInterface";
import db from "../../Config/knex";

export class EventClass {
  createEvent = async (
    mainEventData: MainEventInterface,
    subEventData: SubEventInterface[]
  ): Promise<{ status: boolean; data?: any }> => {
    try {
      const [eventId] = await db("events")
        .insert(mainEventData)
        .returning("_id");

      for (let subEvent of subEventData) {
        subEvent.event_id = eventId;
        await db("subevents").insert(subEvent);
      }
      return { status: true, data: eventId };
    } catch (error) {
      console.error("Error creating event:", error);
      return { status: false, data: null };
    }
  };

  updateOrganizationPendingEvent = async (orgId: number, eventId: number) => {
    try {
      const result: any[] = await db("organizations")
        .select("*")
        .where("_id", "=", orgId);

      if (result.length === 0) {
        return { status: false };
      }

      const existingPendingEventsIds = result[0].pending_events || [];

      const uniquePendingEventsIds = [
        ...new Set([...existingPendingEventsIds, eventId]),
      ];

      await db("organizations")
        .where("_id", "=", orgId)
        .update({ pending_events: uniquePendingEventsIds });

      return { status: true };
    } catch (error) {
      return { status: false };
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
    return new Promise(async (resolve, reject) => {
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

            if (existingSubEvent) {
              await trx("subevents")
                .update(subEvent)
                .where("_id", subEvent._id);
            } else {
              await trx("subevents").insert(subEvent);
            }
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
        resolve({ status: true, message: "Event updated successfully." });
      } catch (error) {
        reject({ status: false, message: "Failed to update event." });
      }
    });
  };

  getEventById = async (
    eventId: number
  ): Promise<{ status: boolean; data?: any; message?: string }> => {
    return new Promise(async (resolve, rejects) => {
      try {
        const mainEvent = await db
          .select("*")
          .from("events")
          .where("_id", "=", eventId)
          .first();
        if (mainEvent) {
          resolve({ status: true, data: mainEvent });
        }
        resolve({ status: false, message: "Event not exists" });
      } catch (error) {
        rejects({ status: false, message: "something went wrong. Try again." });
      }
    });
  };

  createSubEventById = async (
    eventId: number,
    subEventData: SubEventInterface
  ): Promise<{ status: boolean; data?: any; message?: string }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const [newId] = await db("subevents").insert({
          ...subEventData,
          event_id: eventId,
        });

        if (newId) {
          resolve({ status: true, data: newId });
        } else {
          resolve({ status: false, message: "Failed to create sub-event" });
        }
      } catch (error) {
        reject({ status: false, message: "Something went wrong. Try again." });
      }
    });
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
        .where("_id", "=", orgId);

      const totalCount = Number.parseInt(events_counts) + 1;
      const totalEarnings = total_earnings + amount;
      const updatedPendingEvents = pending_events.filter(
        (event: any) => !currentEvents.includes(event)
      );

      await db("organizations")
        .where("_id", "=", orgId)
        .update({
          events_counts: totalCount,
          pending_events: JSON.stringify(updatedPendingEvents),
          total_earnings: totalEarnings,
        });

      return { status: true, data: { totalCount, updatedPendingEvents } };
    } catch (error) {
      console.error("Error updating pending events:", error);
      return { status: false, data: null };
    }
  };

  getPendingEventList = async (userId: number): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const pendingEvents = await db("events")
          .select("*")
          .where("status", "pending")
          .andWhere("org_id", userId);

        if (!pendingEvents || pendingEvents.length === 0) {
          return {
            status: false,
            message: "No pending events found.",
            data: [],
          };
        }

        const eventsWithSubEvents = await Promise.all(
          pendingEvents.map(async (event: any) => {
            const subEventIds = JSON.parse(event.sub_event_items || "[]");

            const subEvents = subEventIds.length
              ? await db("subevents").whereIn("_id", subEventIds)
              : [];

            return {
              ...event,
              sub_events: subEvents.map((subEvent: any) => ({
                _id: subEvent._id,
                event_id: subEvent.event_id,
                name: subEvent.name,
                description: subEvent.description,
                cover_images: subEvent.cover_images,
                video_url: subEvent.video_url ?? null,
                start_time: subEvent.start_time,
                end_time: subEvent.end_time,
                starting_date: subEvent.starting_date,
                hostedBy: subEvent.hostedBy,
                host_email: subEvent.host_email,
                host_mobile: subEvent.host_mobile,
                c_code: subEvent.c_code,
                ticket_quantity: subEvent.ticket_quantity,
                ticket_sold: subEvent.ticket_sold,
                ticket_type: subEvent.ticket_type,
                ticket_price: subEvent.ticket_price,
                earnings: subEvent.earnings,
                approvedBy: subEvent.approvedBy,
                approvedAt: subEvent.approvedAt,
                denial_reason: subEvent.denial_reason ?? null,
                restrictions: subEvent.restrictions,
              })),
            };
          })
        );

        return {
          status: true,
          message: "Pending events with sub-events retrieved successfully.",
          data: eventsWithSubEvents,
        };
      } catch (error) {
        return {
          status: false,
          message: "An error occurred while retrieving pending events.",
          data: [],
        };
      }
    });
  };

  getCompletedEventList = async (userId: number): Promise<any> => {
    try {
      const completedEvents = await db("events")
        .select("*")
        .where("status", "completed")
        .andWhere("org_id", userId);

      if (!completedEvents || completedEvents.length === 0) {
        return {
          status: false,
          message: "No completed events found.",
          data: [],
        };
      }

      const eventsWithSubEvents = await Promise.all(
        completedEvents.map(async (event: any) => {
          const subEventIds = JSON.parse(event.sub_event_items || "[]");
          const subEvents = subEventIds.length
            ? await db("subevents").whereIn("_id", subEventIds)
            : [];
          return { ...event, sub_events: subEvents };
        })
      );

      return {
        status: true,
        message: "Completed events with sub-events retrieved successfully.",
        data: eventsWithSubEvents,
      };
    } catch (error) {
      console.error("Error fetching completed events:", error);
      return {
        status: false,
        message: "An error occurred while retrieving completed events.",
        data: [],
      };
    }
  };

  getActiveEventList = async (userId: number): Promise<any> => {
    try {
      const activeEvents = await db("events")
        .select("*")
        .where("status", "active")
        .andWhere("org_id", userId);

      if (!activeEvents || activeEvents.length === 0) {
        return { status: false, message: "No active events found.", data: [] };
      }

      const eventsWithSubEvents = await Promise.all(
        activeEvents.map(async (event: any) => {
          const subEventIds = JSON.parse(event.sub_event_items || "[]");
          const subEvents = subEventIds.length
            ? await db("subevents").whereIn("_id", subEventIds)
            : [];
          return { ...event, sub_events: subEvents };
        })
      );

      return {
        status: true,
        message: "Active events with sub-events retrieved successfully.",
        data: eventsWithSubEvents,
      };
    } catch (error) {
      console.error("Error fetching active events:", error);
      return {
        status: false,
        message: "An error occurred while retrieving active events.",
        data: [],
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
          status: false,
          message: `No events found for category: ${categoryName}.`,
          data: [],
        };
      }

      const eventsWithSubEvents = await Promise.all(
        eventsByCategory.map(async (event: any) => {
          const subEventIds = JSON.parse(event.sub_event_items || "[]");
          const subEvents = subEventIds.length
            ? await db("subevents").whereIn("_id", subEventIds)
            : [];
          return { ...event, sub_events: subEvents };
        })
      );

      return {
        status: true,
        message: `Events under category: ${categoryName} retrieved successfully.`,
        data: eventsWithSubEvents,
      };
    } catch (error) {
      console.error("Error fetching events by category:", error);
      return {
        status: false,
        message: "An error occurred while retrieving events by category.",
        data: [],
      };
    }
  };

  getPopularEventList = async (): Promise<any> => {
    try {
      const popularEvents = await db("bookings")
        .select("event_id")
        .count("* as bookings_count")
        .groupBy("event_id")
        .orderBy("bookings_count", "desc")
        .limit(10);

      if (!popularEvents || popularEvents.length === 0) {
        return { status: false, message: "No popular events found.", data: [] };
      }

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
        message: "Popular events retrieved successfully.",
        data: eventDetails.filter(Boolean),
      };
    } catch (error) {
      console.error("Error fetching popular events:", error);
      return {
        status: false,
        message: "An error occurred while retrieving popular events.",
        data: [],
      };
    }
  };

  getUpcomingEventList = async (): Promise<any> => {
    try {
      const upcomingEvents = await db("events")
        .select("*")
        .where("registration_start", ">", new Date())
        .orderBy("registration_start", "asc");

      if (!upcomingEvents || upcomingEvents.length === 0) {
        return {
          status: false,
          message: "No upcoming events found.",
          data: [],
        };
      }

      const eventsWithSubEvents = await Promise.all(
        upcomingEvents.map(async (event: any) => {
          const subEventIds = JSON.parse(event.sub_event_items || "[]");
          const subEvents = subEventIds.length
            ? await db("subevents").whereIn("_id", subEventIds)
            : [];
          return {
            ...event,
            sub_events: subEvents,
          };
        })
      );

      return {
        status: true,
        message: "Upcoming events retrieved successfully.",
        data: eventsWithSubEvents,
      };
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      return {
        status: false,
        message: "An error occurred while retrieving upcoming events.",
        data: [],
      };
    }
  };

  getAllPendingEventList = async (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const pendingEvents = await db("events")
          .select("*")
          .where("status", "pending");

        if (!pendingEvents || pendingEvents.length === 0) {
          return {
            status: false,
            message: "No pending events found.",
            data: [],
          };
        }

        const eventsWithSubEvents = await Promise.all(
          pendingEvents.map(async (event: any) => {
            const subEventIds = JSON.parse(event.sub_event_items || "[]");

            const subEvents = subEventIds.length
              ? await db("subevents").whereIn("_id", subEventIds)
              : [];

            return {
              ...event,
              sub_events: subEvents.map((subEvent: any) => ({
                _id: subEvent._id,
                event_id: subEvent.event_id,
                name: subEvent.name,
                description: subEvent.description,
                cover_images: subEvent.cover_images,
                video_url: subEvent.video_url ?? null,
                start_time: subEvent.start_time,
                end_time: subEvent.end_time,
                starting_date: subEvent.starting_date,
                hostedBy: subEvent.hostedBy,
                host_email: subEvent.host_email,
                host_mobile: subEvent.host_mobile,
                c_code: subEvent.c_code,
                ticket_quantity: subEvent.ticket_quantity,
                ticket_sold: subEvent.ticket_sold,
                ticket_type: subEvent.ticket_type,
                ticket_price: subEvent.ticket_price,
                earnings: subEvent.earnings,
                approvedBy: subEvent.approvedBy,
                approvedAt: subEvent.approvedAt,
                denial_reason: subEvent.denial_reason ?? null,
                restrictions: subEvent.restrictions,
              })),
            };
          })
        );

        return {
          status: true,
          message: "Pending events with sub-events retrieved successfully.",
          data: eventsWithSubEvents,
        };
      } catch (error) {
        return {
          status: false,
          message: "An error occurred while retrieving pending events.",
          data: [],
        };
      }
    });
  };

  getAllCompletedEventList = async (): Promise<any> => {
    try {
      const completedEvents = await db("events")
        .select("*")
        .where("status", "completed");

      if (!completedEvents || completedEvents.length === 0) {
        return {
          status: false,
          message: "No completed events found.",
          data: [],
        };
      }

      const eventsWithSubEvents = await Promise.all(
        completedEvents.map(async (event: any) => {
          const subEventIds = JSON.parse(event.sub_event_items || "[]");
          const subEvents = subEventIds.length
            ? await db("subevents").whereIn("_id", subEventIds)
            : [];
          return { ...event, sub_events: subEvents };
        })
      );

      return {
        status: true,
        message: "Completed events with sub-events retrieved successfully.",
        data: eventsWithSubEvents,
      };
    } catch (error) {
      console.error("Error fetching completed events:", error);
      return {
        status: false,
        message: "An error occurred while retrieving completed events.",
        data: [],
      };
    }
  };

  getAllActiveEventList = async (): Promise<any> => {
    try {
      const activeEvents = await db("events")
        .select("*")
        .where("status", "active");

      if (!activeEvents || activeEvents.length === 0) {
        return { status: false, message: "No active events found.", data: [] };
      }

      const eventsWithSubEvents = await Promise.all(
        activeEvents.map(async (event: any) => {
          const subEventIds = JSON.parse(event.sub_event_items || "[]");
          const subEvents = subEventIds.length
            ? await db("subevents").whereIn("_id", subEventIds)
            : [];
          return { ...event, sub_events: subEvents };
        })
      );

      return {
        status: true,
        message: "Active events with sub-events retrieved successfully.",
        data: eventsWithSubEvents,
      };
    } catch (error) {
      console.error("Error fetching active events:", error);
      return {
        status: false,
        message: "An error occurred while retrieving active events.",
        data: [],
      };
    }
  };

  searchEventList = async ({
    queryText,
    location,
    category,
  }: {
    queryText?: string;
    location?: string;
    category?: string;
  }): Promise<any> => {
    try {
      const query = db("main_events").select("*");
      if (queryText) query.where("name", "like", `%${queryText}%`);
      if (location) query.andWhere("location", "=", location);
      if (category) query.andWhere("category", "=", category);

      const mainEvents = await query;

      if (!mainEvents || mainEvents.length === 0) {
        return { status: false, data: [] };
      }

      const eventsWithSubEvents = await Promise.all(
        mainEvents.map(async (event: any) => {
          const subEventIds = JSON.parse(event.sub_event_items || "[]");
          const subEvents = subEventIds.length
            ? await db("sub_events").select("*").whereIn("_id", subEventIds)
            : [];
          return {
            ...event,
            sub_events: subEvents,
          };
        })
      );

      return {
        status: true,
        data: eventsWithSubEvents,
      };
    } catch (error) {
      return {
        status: false,
        message: "An error occurred while retrieving events.",
        data: [],
      };
    }
  };
}
