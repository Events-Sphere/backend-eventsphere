import express from "express";
import * as UserModel from "../Controllers/Users/UserModel";
import { AuthenticateUser } from "../Middleware/authenticateUserMiddleware";
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";
import * as AuthModel from "../Controllers/Auth/authModel";
const fileUploadInstance = new FileUploadMiddleware();
import * as CategoryModel from "../Controllers/Category/categoryModel";
const router = express.Router();
import * as EventModel from "../Controllers/Event/eventModel";


router.post("/verify",AuthenticateUser.verifyToken,AuthenticateUser.isUserFound,fileUploadInstance.middleware(), AuthModel.verifyUserIdentity);
router.get("/profile",AuthenticateUser.verifyToken,AuthenticateUser.isUserFound, AuthModel.getUserProfile);




router.post("/favourites/create",AuthenticateUser.verifyToken,AuthenticateUser.isUserHaveAccess, UserModel.addToFavorite); 
router.post("/favourites/delete",AuthenticateUser.verifyToken,AuthenticateUser.isUserHaveAccess, UserModel.removeFromFavorite); 
router.get("/favourites",AuthenticateUser.verifyToken,AuthenticateUser.isUserHaveAccess, UserModel.getFavoriteEvents); 

router.get(
  "/event-categories",
  AuthenticateUser.verifyToken,
  AuthenticateUser.isUserFound,
  CategoryModel.getAllCategories
);

router.post("/events/category",AuthenticateUser.verifyToken, EventModel.getEventsByCategoryName);

// router.get(
//   "/events/category",
//   AuthenticateUser.verifyToken,
//   AuthenticateUser.isUserFound,
//   CategoryModel.getCategoryById
// );
export default router;
