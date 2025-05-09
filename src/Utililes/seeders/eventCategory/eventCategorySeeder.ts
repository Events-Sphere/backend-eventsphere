
import db, { connectToDatabase } from "../../../Config/knex"
import { tableName } from "../../../tables/table";
import { eventCategoryData } from "./eventCategoryData";
import * as dotenv from "dotenv";
dotenv.config();
const insertCategories = async () => {
    try {
        console.log("Category seeder started")
        const categories = await db(tableName.CATEGORY).insert(eventCategoryData);
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