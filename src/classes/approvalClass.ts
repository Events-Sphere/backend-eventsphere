import db from "../Config/knex";
import { FormatDateAndTime } from "../Utililes/formatDateAndTime";

class ApprovalClass {

  approveUserById = async (userId: number, approvedBy: number) => {
    const currentTimestamp = FormatDateAndTime.getCurrentTimestamp();
    const data = await db("es_users").where({ _id: userId }).update({
      approvedBy: approvedBy,
      approvedAt: currentTimestamp,
      status: "active",
      denial_reason: null
    });
    console.log(data)
    return data;
  }

  rejectUserById = async (userId: number, approvedBy: number, denialReason: string) => {
    const currentTimestamp = FormatDateAndTime.getCurrentTimestamp();
    const data = await db("es_users").where({ _id: userId }).update({
      approvedBy: approvedBy,
      approvedAt: currentTimestamp,
      status: "rejected",
      denial_reason: denialReason
    });
    console.log(data)
    return data;
  }

  approveOrRejectEvent = async ({
    eventId,
    approveIds,
    rejectIds,
    reasons,
    orgId,
    approvedBy
  }: {
    eventId: number;
    approveIds: number[];
    rejectIds: number[];
    reasons: string[];
    orgId: number;
    approvedBy: number
  }) => {
    const currentTime = FormatDateAndTime.getCurrentTimestamp();
    if (approveIds?.length > 0) {
      await db("subevents")
        .where("event_id", eventId)
        .whereIn("_id", approveIds)
        .update({ status: "available", approvedBy: approvedBy, approvedAt: currentTime, denial_reason: null });
    }
    if (rejectIds?.length > 0) {
      for (let i = 0; i < rejectIds.length; i++) {
        await db("subevents")
          .where("event_id", eventId)
          .where("_id", rejectIds[i])
          .update({ status: "cancelled", denial_reason: reasons[i], approvedBy: approvedBy, approvedAt: currentTime });
      }
    }
    const result = await db("subevents")
      .select("*")
      .where("event_id", eventId).andWhere("status", "available");
    const totalProcessed = approveIds.length + rejectIds.length;
    if (result?.length === totalProcessed) {
      await db("events")
        .where("_id", eventId)
        .update({ status: 1, active_status: "active" });
      const organizerEventStatus = await db("organizations")
        .select("*")
        .select("pending_events", "active_events")
        .where("_id", orgId)
        .first();
      if (organizerEventStatus) {
        const { pending_events, active_events } = organizerEventStatus;
        const updatedPendingEvents = (JSON.parse(pending_events) || []).filter(
          (eventID: number) => eventID !== eventId
        );
        const updatedActiveEvent = JSON.parse(active_events)
        if (!updatedActiveEvent?.includes(eventId)) {
          updatedActiveEvent.push(eventId);
        }
        await db("organizations")
          .where("_id", orgId)
          .update({
            pending_events: JSON.stringify(updatedPendingEvents),
            active_events: JSON.stringify(updatedActiveEvent),
          });
      }
    }
    return true;

  };
}

export default ApprovalClass;