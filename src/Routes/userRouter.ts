import express from "express";
import * as UserModel from "../Controllers/Users/UserModel";
import { AuthenticateUser } from "../Middleware/authenticateUserMiddleware";

const router = express.Router();

router.post("/favorites/create",AuthenticateUser.verifyToken,AuthenticateUser.isUserHaveAccess, UserModel.addToFavorite); 
router.post("/favorites/delete",AuthenticateUser.verifyToken,AuthenticateUser.isUserHaveAccess, UserModel.removeFromFavorite); 
router.get("/favorites",AuthenticateUser.verifyToken,AuthenticateUser.isUserHaveAccess, UserModel.getFavoriteEvents); 

export default router;
