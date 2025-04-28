import { Router } from "express";
import * as CategoryModel from "../Controllers/Category/categoryModel";
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";
import AuthenticateUser from "../Middleware/authenticateUserMiddleware";

const router = Router();

const authenticate = new AuthenticateUser();
const fileUploadInstance = new FileUploadMiddleware();

router.post(
  "/create",
  authenticate.verifyToken,
  authenticate.isAdmin,
  fileUploadInstance.middleware(),
  CategoryModel.createCategory
);
router.post(
  "/categories/update",
  authenticate.verifyToken,
  authenticate.isAdmin,
  fileUploadInstance.middleware(),
  CategoryModel.updateCategoryByID
);
router.post(
  "/categories/delete",
  authenticate.verifyToken,
  authenticate.isAdmin,
  CategoryModel.deleteCategoryByID
);
router.get(
  "/categories/single",
  authenticate.verifyToken,
  authenticate.isAdmin,
  CategoryModel.getCategoryById
);
router.get(
  "/categories",
  authenticate.verifyToken,
  authenticate.isAdmin,
  CategoryModel.getAllCategories
);

export default router;
