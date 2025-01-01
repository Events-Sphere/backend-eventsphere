import express from "express";
import * as UserModel from "../Controllers/Users/UserModel";

const router = express.Router();

router.post("/addToFavorite", UserModel.addToFavorite);
router.post("/removeFromFavorite", UserModel.removeFromFavorite);
router.get("/getFavoriteEvents", UserModel.getFavoriteEvents);

export default router;
