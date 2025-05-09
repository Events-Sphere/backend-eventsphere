import db, { connectToDatabase } from "../../../Config/knex"
import { usersDummyData } from "./userData"
import * as dotenv from "dotenv";
dotenv.config();
const insertUsers = async () => {
    try {
        console.log("User seeder started")
        const users = await db("users").insert(usersDummyData);
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