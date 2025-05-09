import db from "../Config/knex";
import { categoryInterface } from "../Interfaces/categoryInterface";
import { tableName } from "../tables/table";

class EventCategoryClass {

    isCategoryExistsOrNot = async (categoryName: String) => {
        const categoryExists = await db(tableName.CATEGORY)
            .select("name")
            .where("name", categoryName)
            .first();
        return categoryExists;
    }

    createCategory = async (categoryData: categoryInterface) => {
        const [id] = await db(tableName.CATEGORY).insert(categoryData);
        return true;
    }

    getAllCategories = async (search:string,limit:number,offset:number) => {

        const query = db(tableName.CATEGORY)

        if(search){
            query.where("name","like",`%${search}%`)
        }

        const [{count}]=await query.clone().count("* as count")
        
        const categories = await query.select("*").offset(offset).limit(limit)

        return {categories,totalPage:Math.ceil(Number(count)/limit),totalRecords:Number(count)};
    }

    updateCategory = async (categoryUpdatedData: categoryInterface) => {
        const updated = await db(tableName.CATEGORY)
            .where("_id", categoryUpdatedData._id)
            .update(categoryUpdatedData);
        return updated
    }

    async deleteCategoryById(categoryId: number): Promise<any> {
        const deleted = await db(tableName.CATEGORY)
            .where("_id", categoryId)
            .delete();
        return deleted
    }

}

export default EventCategoryClass;