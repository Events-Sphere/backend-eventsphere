import { Request, Response } from "express";
import { ApiResponseHandler } from "../../Middleware/Api-response-handler";
import { EventClass } from "../Event/eventClass";
import { BookingsClass } from "./bookingsClass";
import { BookingInterface } from "../../Interfaces/bookingsInterface";

//<--- global instance ---->
const eventInstance = new EventClass();
const bookingInstance = new BookingsClass();



export const createBooking = async (req: Request | any, res: Response) => {
    try {

      if (!req.body.data) {
        return ApiResponseHandler.error(res, "Missing required fields", 400);
      }
  
      if (!req.user.userId) {
        return ApiResponseHandler.error(res, "User not found. Please login!", 401);
      }
  
      const { event_id: eventId, sub_event_items: subEventItems } = req.body.data;
  
      if (!eventId) {
        return ApiResponseHandler.error(res, "Event ID is missing. Try again!", 400);
      }
  
      if (!Array.isArray(subEventItems) || subEventItems.length === 0) {
        return ApiResponseHandler.error(res, "Sub-events are required for bookings", 400);
      }
  
      const eventResponse = await eventInstance.getEventById(eventId);
      if (!eventResponse.status) {
        return ApiResponseHandler.error(
          res,
          eventResponse.message ?? "Event doesn't exist.",
          404
        );
      }
  
      const userId = Number(req.user.userId);
  
      const bookingExistResponse = await bookingInstance.isBookingExist(userId, eventId);
      if (bookingExistResponse.status) {
        return ApiResponseHandler.error(
          res,
          bookingExistResponse.message ?? "You have already booked this event",
          409
        );
      }
  
      const bookingId = Date.now() + Math.floor(Math.random() * 1000);
  
      const amountResponse = await bookingInstance.getAmounts(subEventItems);
      const bookingAmount = Number(amountResponse.amount);
  
      const bookingData  : BookingInterface= {
        _id: bookingId,
        event_id: eventId,
        sub_event_items: JSON.stringify(subEventItems),
        user_id: userId,
        amount: bookingAmount,
        is_main: 1,
        status: "pending"
      };
  
      const bookingResponse = await bookingInstance.createBooking(bookingData);

      if (!bookingResponse.status) {
        return ApiResponseHandler.error(
          res,
          bookingResponse.message ?? "Something went wrong. Try again.",
          500
        );
      }
  
      return ApiResponseHandler.success(
        res,
        bookingResponse.data,
        bookingResponse.message ?? "Your booking has been initiated",
        201
      );
    } catch (error: any) {
      return ApiResponseHandler.error(
        res,
        error.message ?? "Internal server error",
        500
      );
    }
  };

  
  export const confirmBooking = async (req: Request | any, res: Response) => {
    try {

      if (!req.body.data) {
        return ApiResponseHandler.error(res, "Missing required fields", 400);
      }
  
      if (!req.user.userId) {
        return ApiResponseHandler.error(res, "User not found. Please login!", 401);
      }
  
      const {
        event_id: eventId,
        payment_method: paymentMethod,
        payment_id: paymentId,
        sub_event_items: subEventItems,
      } = req.body.data;
  
      if (!eventId) {
        return ApiResponseHandler.error(res, "Event ID is missing. Try again!", 400);
      }
  
      if (!paymentMethod || !paymentId) {
        return ApiResponseHandler.error(res, "Payment type and payment ID are required.", 400);
      }
  
      if (!Array.isArray(subEventItems) || subEventItems.length === 0) {
        return ApiResponseHandler.error(res, "Sub-events are required for bookings", 400);
      }
  
      const eventResponse = await eventInstance.getEventById(eventId);
      if (!eventResponse.status) {
        return ApiResponseHandler.error(
          res,
          eventResponse.message ?? "Event doesn't exist.",
          404
        );
      }
  
      const userId = Number(req.user.userId);
  
      const existingBookingResponse = await bookingInstance.getBookingByUserAndEvent(userId, eventId);
  
      if (existingBookingResponse.status) {
        
        const updatedBookingData: Partial<BookingInterface> = {
          payment_method: paymentMethod,
          payment_ids: paymentId,
          status: "confirmed",
        };
  
        const updateResponse = await bookingInstance.updateBooking(
          existingBookingResponse.data._id,
          updatedBookingData
        );
  
        if (!updateResponse.status) {
          return ApiResponseHandler.error(
            res,
            updateResponse.message ?? "Failed to confirm booking. Try again.",
            500
          );
        }
  
        return ApiResponseHandler.success(
          res,
          updateResponse.data,
          "Booking has been confirmed successfully.",
          200
        );
      }
  
      const bookingId = Date.now() + Math.floor(Math.random() * 1000);
      const amountResponse = await bookingInstance.getAmounts(subEventItems);
      const bookingAmount = Number(amountResponse.amount);
  
      const bookingData : BookingInterface = {
        _id: bookingId,
        event_id: eventId,
        sub_event_items: JSON.stringify(subEventItems),
        user_id: userId,
        amount: bookingAmount,
        is_main: 1,
        status: "confirmed",
        payment_method: paymentMethod,
        payment_ids: paymentId,
      };
  
      const createResponse = await bookingInstance.createBooking(bookingData);
  
      if (!createResponse.status) {
        return ApiResponseHandler.error(
          res,
          createResponse.message ?? "Failed to create booking. Try again.",
          500
        );
      }

      // update booking ids into the users bookings and add amount to the orgamizer earnings
  
      return ApiResponseHandler.success(
        res,
        createResponse.data,
        "Booking has been created and confirmed successfully.",
        201
      );

    } catch (error: any) {
      return ApiResponseHandler.error(
        res,
        error.message ?? "Internal server error",
        500
      );
    }
  };
  