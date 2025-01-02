import db from "../../Config/knex";
import { categoryInterface } from "../../Interfaces/categoryInterface";

export class CategoryClass {
  
  async createCategory(categoryData: categoryInterface): Promise<any> {
    try {
      const categoryExists = await db("categories")
        .select("name")
        .where("name", categoryData.name)
        .first();

      if (categoryExists) {
        return { status: false};
      }

      const [id] = await db("categories").insert(categoryData);
      return { status: true, data: id };
    } catch (error: any) {
      console.error("Error creating category:", error);
      return {
        status: false
      };
    }
  }

  
  async getCategoryById(categoryId: number): Promise<any> {
    try {
      const category = await db("categories")
        .select("*")
        .where("_id", categoryId)
        .first();

      if (!category) {
        return { status: false };
      }

      return { status: true, data: category };
    } catch (error: any) {
      console.error("Error fetching category by ID:", error);
      return {
        status: false
      };
    }
  }

  
  async getAllCategories(): Promise<any> {
    try {
      const categories = await db("categories").select("*");

      if (categories.length === 0) {
        return { status: true, data: []};
      }

      return { status: true, data: categories };
    } catch (error: any) {
      console.error("Error fetching all categories:", error);
      return {
        status: false,
      };
    }
  }

  
  async updateCategory(categoryUpdatedData: categoryInterface): Promise<any> {
    try {
      const updated = await db("categories")
        .where("_id", categoryUpdatedData._id)
        .update(categoryUpdatedData);

      if (updated === 0) {
        return {
          status: false,
         
        };
      }

      return { status: true};
    } catch (error: any) {
      console.error("Error updating category:", error);
      return {
        status: false,
      };
    }
  }

  
  async deleteCategoryById(categoryId: number): Promise<any> {
    try {
      const deleted = await db("categories")
        .where("_id", categoryId)
        .delete();

      if (deleted === 0) {
        return {
          status: false,
        };
      }

      return { status: true};
    } catch (error: any) {
      console.error("Error deleting category:", error);
      return {
        status: false
      };
    }
  }
}
