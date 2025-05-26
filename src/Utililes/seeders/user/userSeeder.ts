import db, { connectToDatabase } from "../../../Config/knex"
import { tableName } from "../../../tables/table";
import { userData } from "./userData"
import * as dotenv from "dotenv";
dotenv.config();
const insertUsers = async () => {
    try {
        console.log("User seeder started")
        const users = await db(tableName.USERS).insert(userData);
        console.log("User seeder finished")
    }
    catch (e) {
        console.log("ERROR : (User insert) ->" + e)
    }
    finally {
        process.exit(0)
    }
}

connectToDatabase();
insertUsers();