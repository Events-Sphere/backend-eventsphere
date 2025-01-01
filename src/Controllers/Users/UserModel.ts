import { ApiResponseHandler } from "../../Middleware/Api-response-handler";
import { Request , Response } from "express";
import { User } from "./UserClass";


const userInstance = new User();


export const addToFavorite = async (req: Request, res: Response) => {
    try {
      if (!req.user || !req.user.id) {
        return ApiResponseHandler.error(res, "User not authenticated. Please log in.", 401);
      }
  
      const { favoriteId } = req.body;
      if (!favoriteId) {
        return ApiResponseHandler.error(res, "Favorite event ID is required.", 400);
      }
  
      const response = await userInstance.addFavoriteEvent(Number(req.user.id), Number(favoriteId));
  
      if (!response.status) {
        return ApiResponseHandler.error(res, `${response.message ?? "Failed to add favorite event."}`, 400);
      }
  
      return ApiResponseHandler.success(
        res,
        response.data,
        "Favorite event updated successfully.",
        200
      );
    } catch (error: any) {
      return ApiResponseHandler.error(
        res,
        error.message ?? "An error occurred while updating favorite events.",
        500
      );
    }
  };
  
  export const removeFromFavorite = async (req: Request, res: Response) => {
    try {
      if (!req.user || !req.user.id) {
        return ApiResponseHandler.error(res, "User not authenticated. Please log in.", 401);
      }
  
      const { favoriteId } = req.body;
      if (!favoriteId) {
        return ApiResponseHandler.error(res, "Favorite event ID is required.", 400);
      }
  
      const response = await userInstance.removeFavoriteEvent(Number(req.user.id), Number(favoriteId));
  
      if (!response.status) {
        return ApiResponseHandler.error(res, `${response.message ?? "Failed to remove favorite event."}`, 400);
      }
  
      return ApiResponseHandler.success(
        res,
        response.data,
        "Favorite event removed successfully.",
        200
      );
    } catch (error: any) {
      return ApiResponseHandler.error(
        res,
        error.message ?? "An error occurred while removing favorite events.",
        500
      );
    }
  };
  
  export const getFavoriteEvents = async (req: Request, res: Response) => {
    try {
      if (!req.user || !req.user.id) {
        return ApiResponseHandler.error(res, "User not authenticated. Please log in.", 401);
      }
  
      const response = await userInstance.getFavoriteEventList(Number(req.user.id));
  
      if (!response.status) {
        return ApiResponseHandler.error(res, `${response.message ?? "No favorite events found."}`, 404);
      }
  
      return ApiResponseHandler.success(
        res,
        response.data,
        "Favorite events retrieved successfully.",
        200
      );
    } catch (error: any) {
      return ApiResponseHandler.error(
        res,
        error.message ?? "An error occurred while retrieving favorite events.",
        500
      );
    }
  };
  