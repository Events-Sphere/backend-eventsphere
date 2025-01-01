import { Router } from "express";
import * as CategoryModel from '../Controllers/Category/categoryModel';
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";

const router = Router();

const fileUploadInstance = new FileUploadMiddleware();

//<---- Event Category Router ----->
router.post("/category/create", fileUploadInstance.middleware(), CategoryModel.createCategory);
router.post("/category/update", fileUploadInstance.middleware(), CategoryModel.updateCategoryByID);
router.post("/category/delete", CategoryModel.deteleCategoryByID);
router.post("/category/get/single", CategoryModel.getCategoryById);
router.post("/category/get/all", CategoryModel.getAllCategories);

export default router;