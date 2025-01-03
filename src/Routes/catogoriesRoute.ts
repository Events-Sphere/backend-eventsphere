import { Router } from "express";
import * as CategoryModel from "../Controllers/Category/categoryModel";
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";
import { AuthenticateUser } from "../Middleware/authenticateUserMiddleware";

const router = Router();

const fileUploadInstance = new FileUploadMiddleware();

router.post(
  "/create",
  AuthenticateUser.verifyToken,
  AuthenticateUser.isAdmin,
  fileUploadInstance.middleware(),
  CategoryModel.createCategory
);
router.post(
  "/categories/update",
  AuthenticateUser.verifyToken,
  AuthenticateUser.isAdmin,
  fileUploadInstance.middleware(),
  CategoryModel.updateCategoryByID
);
router.post(
  "/categories/delete",
  AuthenticateUser.verifyToken,
  AuthenticateUser.isAdmin,
  CategoryModel.deleteCategoryByID
);
router.get(
  "/categories/single",
  AuthenticateUser.verifyToken,
  AuthenticateUser.isAdmin,
  CategoryModel.getCategoryById
);
router.get(
  "/categories",
  AuthenticateUser.verifyToken,
  AuthenticateUser.isAdmin,
  CategoryModel.getAllCategories
);

export default router;
