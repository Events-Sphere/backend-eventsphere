import { Router } from "express";
import * as AuthModel from "../Controllers/Auth/authModel";
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";
import { AuthenticateUser } from "../Middleware/authenticateUserMiddleware";
const fileUploadInstance = new FileUploadMiddleware();
import * as CategoryModel from "../Controllers/Category/categoryModel";

const router = Router();


router.post(
  "/event/category/create",
  AuthenticateUser.verifyToken,
  AuthenticateUser.isAdmin,
  fileUploadInstance.middleware(),
  CategoryModel.createCategory
);


export default router;



