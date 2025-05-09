
import * as dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'DEV';

export const tableName = NODE_ENV == 'DEV' ?
{
    ADMIN: "admins",
    CATEGORY:"categories"
} :
{
    ADMIN: "es_admins",
    CATEGORY:"es_event_categories"
}