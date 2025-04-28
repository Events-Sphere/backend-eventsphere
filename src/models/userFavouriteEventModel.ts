import { NextFunction, Request, Response } from "express";
import CustomError from "../Utililes/customError";
import catchAsyncError from "../Middleware/errorMiddleware";
import UserFavouriteEventClass from "../classes/userFavouriteEventClass";

const userFavoutiteEvent = new UserFavouriteEventClass();
class UserFavouriteEventModel {
    addToFavorite = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.id) {
            return next(new CustomError("User not authenticated. Please log in.", 401))
        }
        const { favouriteId } = req.body;
        if (!favouriteId) {
            return next(new CustomError("Favorite event ID is required.", 400))
        }
        const data = await userFavoutiteEvent.addFavoriteEvent(
            Number(req.user.id),
            Number(favouriteId),
            next
        );
        return res.status(200).json({
            success: true,
            data: data,
            message: "Favorite event updated successfully."
        })
    });

    removeFavorite = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.id) {
            return next(new CustomError("User not authenticated. Please log in.", 401))
        }
        const { favouriteId } = req.body;
        if (!favouriteId) {
            return next(new CustomError("Favorite event ID is required.", 400))
        }
        const data = await userFavoutiteEvent.removeFavoriteEvent(
            Number(req.user.id),
            Number(favouriteId),
            next
        );
        return res.status(200).json({
            success: true,
            data: data,
            message: "Favorite event updated successfully."
        })
    });

    getFavoriteEvents = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.id) {
            return next(new CustomError("User not authenticated. Please log in.", 401))
        }
        const data = await userFavoutiteEvent.getFavoriteEventList(
            Number(req.user.id),
            next
        );
        return res.status(200).json({
            success: true,
            data: data,
            message: "Favorite event updated successfully."
        })
    });
}

export default UserFavouriteEventModel;