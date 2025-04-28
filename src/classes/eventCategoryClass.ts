import db from "../Config/knex";
import { categoryInterface } from "../Interfaces/categoryInterface";

class EventCategoryClass {

    isCategoryExistsOrNot = async (categoryName: String) => {
        const categoryExists = await db("categories")
            .select("name")
            .where("name", categoryName)
            .first();
        return categoryExists;
    }

    createCategory = async (categoryData: categoryInterface) => {
        const [id] = await db("categories").insert(categoryData);
        return true;
    }

    getAllCategories = async () => {
        const categories = await db("categories").select("*");
        return categories;
    }

    updateCategory = async (categoryUpdatedData: categoryInterface) => {
        const updated = await db("categories")
            .where("_id", categoryUpdatedData._id)
            .update(categoryUpdatedData);
        return updated
    }

    async deleteCategoryById(categoryId: number): Promise<any> {
        const deleted = await db("categories")
            .where("_id", categoryId)
            .delete();
        return deleted
    }

}

export default EventCategoryClass;