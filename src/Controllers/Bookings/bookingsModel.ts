import { Request, Response } from "express";
import { ApiResponseHandler } from "../../Middleware/apiResponseMiddleware";
import { EventClass } from "../Event/eventClass";
import { BookingsClass } from "./bookingsClass";
import { BookingInterface } from "../../Interfaces/bookingsInterface";
import { COMMON_MESSAGES } from "../../Common/messages";

// Global instances
const eventInstance = new EventClass();
const bookingInstance = new BookingsClass();

export const createBooking = async (req: Request | any, res: Response) => {
  try {
    if (!req.body.data) {
      return ApiResponseHandler.error(res, COMMON_MESSAGES.VALIDATION_ERROR, 400);
    }

    if (!req.user?.id) {
      return ApiResponseHandler.error(res, COMMON_MESSAGES.AUTH_ERROR, 401);
    }

    const { eventId, subEventItems,isMain, paymentMethod, paymentId } = req.body.data;

    if (!eventId) {
      return ApiResponseHandler.error(res, COMMON_MESSAGES.MISMATCHED_IDS, 400);
    }

    if (!Array.isArray(subEventItems) || subEventItems.length === 0) {
      return ApiResponseHandler.error(res, "Sub-events are required for bookings", 400);
    }
    console.log("111111")
    const eventResponse = await eventInstance.getEventById(eventId);
    if (!eventResponse.status) {
      return ApiResponseHandler.error(res, COMMON_MESSAGES.EVENT_NOT_FOUND, 404);
    }console.log("111111")

    const userId = Number(req.user.id);
    const bookingExistResponse = await bookingInstance.isBookingExist(userId, eventId);
console.log("111111")
    if (bookingExistResponse.status) {
      return ApiResponseHandler.error(res, COMMON_MESSAGES.BOOKING_EXISTS, 409);
    }

    const bookingId = Date.now() + Math.floor(Math.random() * 1000);
    const amountResponse = await bookingInstance.getAmounts(subEventItems);
    const bookingAmount = Number(amountResponse.amount);

    const bookingData: BookingInterface = {
      _id: bookingId,
      event_id: eventId,
      sub_event_items: JSON.stringify(subEventItems),
      user_id: userId,
      amount: bookingAmount,
      is_main: isMain,
      payment_method: paymentMethod,
      payment_ids: paymentId,
      status: "confirmed",
    };

    const bookingResponse = await bookingInstance.createBooking(bookingData);

    if (!bookingResponse.status) {
      return ApiResponseHandler.error(res, COMMON_MESSAGES.BOOKING_FAILED, 500);
    }
  
      await bookingInstance.updateUserBookingsAndEarnings(userId, bookingId, 0);

    return ApiResponseHandler.success(res, bookingResponse.data, "Booked successfully", 200);
  } catch (error: any) {
    return ApiResponseHandler.error(res, COMMON_MESSAGES.SERVER_ERROR, 500);
  }
};

// export const confirmBooking = async (req: Request | any, res: Response) => {
//   try {
//     if (!req.body.data) {
//       return ApiResponseHandler.error(res, COMMON_MESSAGES.VALIDATION_ERROR, 400);
//     }

//     if (!req.user?.id) {
//       return ApiResponseHandler.error(res, COMMON_MESSAGES.AUTH_ERROR, 401);
//     }

//     const { eventId, paymentMethod, paymentId, subEventItems } = req.body.data;

//     if (!eventId || !paymentMethod || !paymentId || !Array.isArray(subEventItems) || subEventItems.length === 0) {
//       return ApiResponseHandler.error(res, COMMON_MESSAGES.VALIDATION_ERROR, 400);
//     }

//     const eventResponse = await eventInstance.getEventById(eventId);
//     if (!eventResponse.status) {
//       return ApiResponseHandler.error(res, COMMON_MESSAGES.EVENT_NOT_FOUND, 404);
//     }

//     const userId = Number(req.user.id);
//     const existingBookingResponse = await bookingInstance.getBookingByUserAndEvent(userId, eventId);

//     // booking already initiated then update status as confirmed.
//     if (existingBookingResponse.status) {
//       const updatedBookingData: Partial<BookingInterface> = {
//         event_id:eventId,
//         payment_method: paymentMethod,
//         payment_ids: paymentId,
//         status: "confirmed",
//       };

//       const updateResponse = await bookingInstance.updateBooking(existingBookingResponse.data._id, updatedBookingData);
// console.log(updateResponse)
//       if (!updateResponse.status) {
//         return ApiResponseHandler.error(res, COMMON_MESSAGES.BOOKING_FAILED, 500);
//       }

//       return ApiResponseHandler.success(res, updateResponse.data, COMMON_MESSAGES.BOOKING_CONFIRMED, 200);
//     }

//     // booking not exist. so, creating an new booking
//     // const bookingId = Date.now() + Math.floor(Math.random() * 1000);
//     // const amountResponse = await bookingInstance.getAmounts(subEventItems);
//     // const bookingAmount = Number(amountResponse.amount);
//     // const bookingData: BookingInterface = {
//     //   _id: bookingId,
//     //   event_id: eventId,
//     //   sub_event_items: JSON.stringify(subEventItems),
//     //   user_id: userId,
//     //   amount: bookingAmount,
//     //   is_main: 1,
//     //   status: "confirmed",
//     //   payment_method: paymentMethod,
//     //   payment_ids: paymentId,
//     // };

//     // const createResponse = await bookingInstance.createBooking(bookingData);

//     // if (!createResponse.status) {
//     //   return ApiResponseHandler.error(res, COMMON_MESSAGES.BOOKING_FAILED, 500);
//     // }

//     // await bookingInstance.updateUserBookingsAndEarnings(userId, eventId, bookingAmount);

//     // return ApiResponseHandler.success(res, createResponse.data, COMMON_MESSAGES.BOOKING_CONFIRMED, 201);
//   } catch (error: any) {
//     console.log(error)
//     return ApiResponseHandler.error(res, COMMON_MESSAGES.SERVER_ERROR, 500);
//   }
// };

export const getUserPendingBookings = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user?.id) {
      return ApiResponseHandler.error(res, COMMON_MESSAGES.AUTH_ERROR, 401);
    }

    const response = await bookingInstance.getPendingBookingList(Number(req.user.id));

    if (!response.status) {
      return ApiResponseHandler.error(res, response.message ?? COMMON_MESSAGES.NO_PENDING_BOOKINGS, 404);
    }

    return ApiResponseHandler.success(res, response.data, "Pending bookings retrieved successfully.", 200);
  } catch (error: any) {
    return ApiResponseHandler.error(res, COMMON_MESSAGES.SERVER_ERROR, 500);
  }
};

export const getUserBookedEvents = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user?.id) {
      return ApiResponseHandler.error(res, COMMON_MESSAGES.AUTH_ERROR, 401);
    }

    const response = await bookingInstance
    .getBookedEventsList(Number(req.user.id));

    if (!response.status) {
      return ApiResponseHandler.error(res, response.message ?? COMMON_MESSAGES.NO_BOOKED_EVENTS, 404);
    }

    return ApiResponseHandler.success(res, response.data, "Booked events retrieved successfully.", 200);
  } catch (error: any) {
    return ApiResponseHandler.error(res, COMMON_MESSAGES.SERVER_ERROR, 500);
  }
};















export const getUserCancelledBookings = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user?.id) {
      return ApiResponseHandler.error(res, COMMON_MESSAGES.AUTH_ERROR, 401);
    }

    const response = await bookingInstance.getCancelledBookings(Number(req.user.id));

    if (!response.status) {
      return ApiResponseHandler.error(res, response.message ?? COMMON_MESSAGES.NO_CANCELLED_BOOKINGS, 404);
    }

    return ApiResponseHandler.success(res, response.data, "Cancelled bookings retrieved successfully.", 200);
  } catch (error: any) {
    return ApiResponseHandler.error(res, COMMON_MESSAGES.SERVER_ERROR, 500);
  }
};