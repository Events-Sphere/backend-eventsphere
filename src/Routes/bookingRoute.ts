import { Router } from "express";
import * as BookingModel from "../Controllers/Bookings/bookingsModel";
import { AuthenticateUser } from "../Middleware/authenticateUserMiddleware";

const router = Router();

router.post(
  "/bookings",
  AuthenticateUser.verifyToken,
  AuthenticateUser.isUserHaveAccess,
  BookingModel.createBooking
);
router.post(
  "/bookings/confirm",
  AuthenticateUser.verifyToken,
  AuthenticateUser.isUserHaveAccess,
  BookingModel.confirmBooking
);

router.get(
  "/bookings/pending",
  AuthenticateUser.verifyToken,
  AuthenticateUser.isUserHaveAccess,
  BookingModel.getUserPendingBookings
);
router.get(
  "/bookings/confirmed",
  AuthenticateUser.verifyToken,
  AuthenticateUser.isUserHaveAccess,
  BookingModel.getUserBookedEvents
);
router.get(
  "/bookings/canceled",
  AuthenticateUser.verifyToken,
  AuthenticateUser.isUserHaveAccess,
  BookingModel.getUserCancelledBookings
);

export default router;
