import express from "express";
import * as UserModel from "../Controllers/Users/UserModel";

const router = express.Router();

router.post("/favorites/create", UserModel.addToFavorite); 
router.post("/favorites/delete", UserModel.removeFromFavorite); 
router.get("/favorites", UserModel.getFavoriteEvents); 

export default router;
