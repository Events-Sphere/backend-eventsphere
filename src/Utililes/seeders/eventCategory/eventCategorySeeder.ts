
import db, { connectToDatabase } from "../../../Config/knex"
import { eventCategoryData } from "./eventCategoryData";
import * as dotenv from "dotenv";
dotenv.config();
const insertCategories = async () => {
    try {
        console.log("Category seeder started")
        const categories = await db("categories").insert(eventCategoryData);
        console.log("Category seeder finished")
    }
    catch (e) {
        console.log("ERROR : (Category insert) ->" + e)
    }
    finally {
        process.exit(0)
    }
}

connectToDatabase();
insertCategories();