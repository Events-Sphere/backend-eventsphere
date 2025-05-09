import catchAsyncError from "../Middleware/errorMiddleware"
import { NextFunction, Request, Response } from "express";
import CustomError from "../Utililes/customError";
import EventBookingClass from "../classes/eventBookingClass";
import { json } from "body-parser";

const eventBookingClass = new EventBookingClass();
class EventBookingModel {

    getUserBookedEventsActive = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

        if (!req.user) return next(new CustomError("User ID is missing", 401))
        const userId = req.user.id;
        const response = await eventBookingClass.getBookingsByStatus(userId, "confirmed");
        return res.json({
            message: "Booked events retrieved successfully",
            success: true,
            data: response
        })
    })

}


export default EventBookingModel;