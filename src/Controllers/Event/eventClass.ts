import {
  MainEventInterface,
  SubEventInterface,
} from "../../Interfaces/eventInterface";
import db from "../../Config/knex";
import { categoryInterface } from "../../Interfaces/categoryInterface";
import { resolve } from "path";
import { rejects } from "assert";

export class EventClass {
  createEvent = async (
    mainEventData: MainEventInterface,
    subEventData: SubEventInterface[]
  ): Promise<{ status: boolean; data: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const [eventId] = await db("events").insert(mainEventData);
        for (let subEvent of subEventData) {
          subEvent.event_id = eventId;
          console.log(subEvent);
          await db("subevents").insert(subEvent);
        }
        resolve({ status: true, data: eventId });
      } catch (error) {
        console.error("Error creating event:", error);
        reject({ status: false, data: null });
      }
    });
  };

  updatePendingEvents = async (
    orgId: any,
    currentEvents: any[]
  ): Promise<{ status: boolean; data: any }> => {
    try {
      const [{ events_counts, pending_events }] = await db
        .select("events_counts", "pending_events")
        .from("organizations")
        .where("_id", "=", orgId);

      const totalCount = Number.parseInt(events_counts) + 1;
      const updatedPendingEvents = pending_events.filter(
        (event: any) => !currentEvents.includes(event)
      );

      await db("organizations")
        .where("_id", "=", orgId)
        .update({
          events_counts: totalCount,
          pending_events: JSON.stringify(updatedPendingEvents),
        });

      return { status: true, data: { totalCount, updatedPendingEvents } };
    } catch (error) {
      console.error("Error updating pending events:", error);
      return { status: false, data: null };
    }
  };

  createCategory = async (categoryData: categoryInterface): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const categoryExists = await db
          .select("*")
          .from("categories")
          .where("name", "=", categoryData.name)
          .first();

        if (categoryExists) {
          reject({ status: false, message: "category already exists" });
        }
        await db("categories").insert(categoryData);

        resolve({ status: true, data: [] });
      } catch (error: any) {
        reject({
          status: false,
          message: `Error occurred: ${
            error.message || "Something went wrong. Try again!"
          }`,
        });
      }
    });
  };

  getCategoryById = async (categoryId: number): Promise<{status : boolean , data?: any , message?:string}> => {
    return new Promise(async (resolve, rejects) => {
      try {
        const category = await db
          .select("*")
          .from("categories")
          .where("_id", "=", categoryId)
          .first();
        if (category) {
          resolve({status:true , data : category});
        }
        resolve({status : false , message : 'category not exists'});
      } catch (error) {
        rejects({status : false , message : 'something went wrong. Try again.'});
      }
    });
  };

  getAllCategories = async (): Promise<{status : boolean , data?: any , message?:string}> => {
    return new Promise(async (resolve, rejects) => {
      try {
        const category = await db
          .select("*")
          .from("categories");
        if (category) {
          resolve({status:true , data : category});
        }
          resolve({status:true , message: 'categori list is empty'});
        
      } catch (error) {
        rejects({status : false , message : 'something went wrong. Try again.'});
      }
    });
  };

  updateCategory = async (
    categoryUpdatedData: categoryInterface
  ): Promise<{}> => {
    return new Promise(async (resolve, rejects) => {
      try {
        await db("categories")
          .insert(categoryUpdatedData)
          .where("_id", "=", categoryUpdatedData._id);
        resolve({ status: true, data: [] });
      } catch (error) {
        rejects({ status: false, message: "failure to update category" });
      }
    });
  };

  deleteCategoryById = async (
    _id: number
  ): Promise<{ status: boolean; message? : string }> => {
    try {
      const result = await db("categories").where("_id", "=", _id).delete();

      if (result === 0) {
        return {
          status: false,
          message: "Category not found or already deleted",
        };
      }

      return { status: true, message: "Category deleted successfully" };
    } catch (error) {
      return {
        status: false,
        message: "Failed to delete category. Please try again later.",
      };
    }
  };
}
