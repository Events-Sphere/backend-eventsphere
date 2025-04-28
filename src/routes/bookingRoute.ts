import { Router } from "express";
import * as BookingModel from "../Controllers/Bookings/bookingsModel";
import AuthenticateUser from "../Middleware/authenticateUserMiddleware";

const router = Router();

const authenticate = new AuthenticateUser();

router.post(
  "/bookings",
  authenticate.verifyToken,
  authenticate.isUserHaveAccess,
  BookingModel.createBooking
);
// router.post(
//   "/bookings/confirm",
//   authenticate.verifyToken,
//   authenticate.isUserHaveAccess,
//   BookingModel.confirmBooking
// );

router.get(
  "/bookings/pending",
  authenticate.verifyToken,
  authenticate.isUserHaveAccess,
  BookingModel.getUserPendingBookings
);
router.get(
  "/bookings/confirmed",
  authenticate.verifyToken,
  authenticate.isUserHaveAccess,
  BookingModel.getUserBookedEvents
);
router.get(
  "/bookings/canceled",
  authenticate.verifyToken,
  authenticate.isUserHaveAccess,
  BookingModel.getUserCancelledBookings
);

export default router;
