import db, { connectToDatabase } from "../../../Config/knex"
import { tableName } from "../../../tables/table";
import { squadData } from "./squadData";
import * as dotenv from "dotenv";
dotenv.config();
const insertSquad = async () => {
    try {
        console.log("Squad seeder started")
        const users = await db(tableName.USERS).insert(squadData);
        console.log("Squad seeder finished")
    }
    catch (e) {
        console.log("ERROR : (Squad insert) ->" + e)
    }
    finally {
        process.exit(0)
    }
}

connectToDatabase();
insertSquad();