import express from "express";
import * as UserModel from "../Controllers/Users/UserModel";
import { AuthenticateUser } from "../Middleware/authenticateUserMiddleware";
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";
import * as AuthModel from "../Controllers/Auth/authModel";
const fileUploadInstance = new FileUploadMiddleware();

const router = express.Router();


router.post("/verify",AuthenticateUser.verifyToken,AuthenticateUser.isUserFound,fileUploadInstance.middleware(), AuthModel.verifyUserIdentity);
router.get("/profile",AuthenticateUser.verifyToken,AuthenticateUser.isUserFound, AuthModel.getUserProfile);




router.post("/favorites/create",AuthenticateUser.verifyToken,AuthenticateUser.isUserHaveAccess, UserModel.addToFavorite); 
router.post("/favorites/delete",AuthenticateUser.verifyToken,AuthenticateUser.isUserHaveAccess, UserModel.removeFromFavorite); 
router.get("/favorites",AuthenticateUser.verifyToken,AuthenticateUser.isUserHaveAccess, UserModel.getFavoriteEvents); 

export default router;
