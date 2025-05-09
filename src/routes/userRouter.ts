import express from "express";
import AuthenticateUser from "../Middleware/authenticateUserMiddleware";
import { FileUploadMiddleware } from "../Middleware/fileUploadMiddleware";
import * as AuthModel from "../Controllers/Auth/authModel";
const fileUploadInstance = new FileUploadMiddleware();
import * as CategoryModel from "../Controllers/Category/categoryModel";
const router = express.Router();
import * as EventModel from "../Controllers/Event/eventModel";
import * as BookingModel from "../Controllers/Bookings/bookingsModel";
import UserFavouriteEventModel from "../models/userFavouriteEventModel";
import PaymentModel from "../models/paymentModel";
import EventBookingModel from "../models/eventBookingModel";

const userFavouriteEvent = new UserFavouriteEventModel();
const authenticate = new AuthenticateUser();
const payment = new PaymentModel();
const booking = new EventBookingModel();


router.get("/events/upcoming", authenticate.verifyToken, EventModel.getUpcomingEvents);
router.get("/detail", authenticate.verifyToken, authenticate.isUserFound, AuthModel.getUserNameAndLocation);
router.get("/event/categories",authenticate.verifyToken,authenticate.isUserFound,CategoryModel.getAllCategories);

router.post("/events/favourites/create", authenticate.verifyToken, authenticate.isUserHaveAccess, userFavouriteEvent.addToFavorite);
router.post("/events/favourites/delete", authenticate.verifyToken, authenticate.isUserHaveAccess, userFavouriteEvent.removeFavorite);
router.get("/events/favourites", authenticate.verifyToken, authenticate.isUserHaveAccess, userFavouriteEvent.getFavoriteEvents);

router.post("/events/search", authenticate.verifyToken, EventModel.searchEvents);

router.post("/events/by-category", authenticate.verifyToken, EventModel.getEventsByCategoryName);

router.post("/payment/order", authenticate.verifyToken,authenticate.isUserHaveAccess, payment.createOrder);
router.post("/payment/verify-payment", authenticate.verifyToken,authenticate.isUserHaveAccess, payment.verifyPayment);

router.post("/events/bookings",authenticate.verifyToken,authenticate.isUserHaveAccess,BookingModel.createBooking);
router.get("/events/bookings/active",authenticate.verifyToken,authenticate.isUserHaveAccess, booking.getUserBookedEventsActive);

router.get("/profile", authenticate.verifyToken,authenticate.isUserFound, AuthModel.getUserProfile);
router.post("/verify", authenticate.verifyToken, authenticate.isUserFound,fileUploadInstance.middleware(), AuthModel.verifyUserIdentity);











// router.post(
//   "/events/bookings/confirm",
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
  "/bookings/canceled",
  authenticate.verifyToken,
  authenticate.isUserHaveAccess,
  BookingModel.getUserCancelledBookings
);











router.get("/name-location", authenticate.verifyToken, authenticate.isUserFound, AuthModel.getUserNameAndLocation);


router.get(
  "/event-categories",
  authenticate.verifyToken,
  authenticate.isUserFound,
  CategoryModel.getAllCategories
);

router.post("/events/category", authenticate.verifyToken, EventModel.getEventsByCategoryName);

// router.get(
//   "/events/category",
//   authenticate.verifyToken,
//   authenticate.isUserFound,
//   CategoryModel.getCategoryById
// );
export default router;
