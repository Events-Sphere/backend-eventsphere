
import * as dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'DEV';

export const tableName = NODE_ENV == 'DEV' ?
{
    ADMIN: "admins",
    CATEGORY:"categories",
    USERS:"es_users",
    EVENTBOOKINGS:"bookings",
    ORGANIZATIONS:"organizations"
} 
:

{
    ADMIN: "es_admins",
    CATEGORY:"es_event_categories",
    USERS:"es_users",
    EVENTBOOKINGS:"es_event_bookings",
    ORGANIZATIONS:"es_organizations",
    EVENTS:"es_events",
    SUBEVENTS:"es_subevents"
}