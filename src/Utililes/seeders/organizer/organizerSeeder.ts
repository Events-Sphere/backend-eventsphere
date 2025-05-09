import * as dotenv from "dotenv"
import db from "../../../Config/knex"
import { connectToDatabase } from "../../../Config/knex"
import { organizationData, organizerData } from "./organizerData"
dotenv.config()



const insertOrganizers = async () => {

    try {
        console.log("organizer seeder started")
        for (var i = 0; i < organizerData.length; i++) {
            const [id] = await db("users").insert(organizerData[i]);
            const organization = await db("organizations").insert({_id:id,...organizationData[i]})
        }
        console.log("organizer seeder finished")
    }
    catch (e) {
        console.log(`ERROR : (Organizer insert) -> ${e}`)
    }
    finally {
        process.exit(0);
    }

}

connectToDatabase();
insertOrganizers();