import { Router } from "express";
import * as CategoryModel from '../Controllers/Category/categoryModel';
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";

const router = Router();

const fileUploadInstance = new FileUploadMiddleware();


router.post("/categories", fileUploadInstance.middleware(), CategoryModel.createCategory); 
router.post("/categories/update", fileUploadInstance.middleware(), CategoryModel.updateCategoryByID); 
router.post("/categories/delete", CategoryModel.deleteCategoryByID); 
router.get("/categories/single", CategoryModel.getCategoryById); 
router.get("/categories", CategoryModel.getAllCategories); 

export default router;